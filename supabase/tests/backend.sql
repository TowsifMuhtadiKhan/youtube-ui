-- Run against a disposable local Supabase/Postgres database after the migration.
-- All fixtures are rolled back.
begin;
insert into auth.users(id, email, raw_app_meta_data) values
 ('10000000-0000-0000-0000-000000000001', 'parent1@example.test', '{}'::jsonb),
 ('10000000-0000-0000-0000-000000000002', 'parent2@example.test', '{}'::jsonb),
 ('10000000-0000-0000-0000-000000000003', 'admin@example.test', '{"role":"admin"}'::jsonb);
set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
do $$
declare r jsonb; p jsonb;
begin
 assert public.tomtube_api('videos.list') = '[]'::jsonb, 'New account should be empty';
 r := public.tomtube_api('videos.approve', '{"youtubeVideoId":"abcdefghijk","title":"Selected video","thumbnail":"thumb","channelName":"Test"}');
 assert jsonb_array_length(r) = 1, 'Approval did not save';
 perform public.tomtube_api('videos.approve', '{"youtubeVideoId":"abcdefghijk","title":"Updated title"}');
 assert jsonb_array_length(public.tomtube_api('videos.list')) = 1, 'Duplicate approval created';
 assert public.tomtube_api('videos.list')->0->>'title' = 'Updated title', 'Approval update failed';
 perform public.tomtube_api('time.setLimit', '{"dailyLimitMinutes":1}');
 r := public.tomtube_api('playback.validate', '{"youtubeVideoId":"abcdefghijk"}');
 assert (r->>'remainingSeconds')::int = 60 and (r->>'allowed')::boolean, 'Playback was not allowed';
 perform public.tomtube_api('playback.track', '{"youtubeVideoId":"abcdefghijk","seconds":30}');
 r := public.tomtube_api('playback.track', '{"youtubeVideoId":"abcdefghijk","seconds":30}');
 assert (r->>'remainingSeconds')::int = 0 and not (r->>'allowed')::boolean, 'Screen-time limit failed';
 perform public.tomtube_api('time.addBonus', '{"bonusMinutes":10}');
 assert (public.tomtube_api('time.get')->>'remainingSeconds')::int = 600, 'Bonus time failed';
 assert not (public.tomtube_api('pin.verify','{"pin":"0000"}')->>'valid')::boolean, 'Incorrect PIN accepted';
 assert (public.tomtube_api('pin.set','{"currentPin":"1234","newPin":"5678"}')->>'success')::boolean, 'PIN update failed';
 assert (public.tomtube_api('pin.verify','{"pin":"5678"}')->>'valid')::boolean, 'New PIN failed';
 assert not (public.tomtube_api('pin.set','{"newPin":"9999"}')->>'success')::boolean, 'PIN update bypassed current PIN';
 p := public.tomtube_api('playlists.create','{"name":"My saved videos"}');
 perform set_config('test.playlist_id', p->>'id', true);
 r := public.tomtube_api('playlists.add', jsonb_build_object('playlistId', p->>'id', 'youtubeVideoId', 'abcdefghijk', 'title', 'Test'));
 assert jsonb_array_length(r->'items') = 1, 'Playlist add failed';
 perform public.tomtube_api('videos.remove', '{"youtubeVideoId":"abcdefghijk"}');
 assert public.tomtube_api('playback.validate','{"youtubeVideoId":"abcdefghijk"}')->>'reason' = 'UNAPPROVED', 'Removed video remains playable';
 begin
  perform public.tomtube_api('admin.users','{"adminUser":"admin@example.test"}');
  raise exception 'Non-admin was allowed';
 exception when insufficient_privilege then null; end;
 perform public.tomtube_api('videos.approve', '{"youtubeVideoId":"lmnopqrstuv","title":"Private to parent one"}');
 assert not has_table_privilege('authenticated', 'tomtube_private.families','SELECT'), 'PIN hashes are readable';
end $$;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', true);
do $$
begin
 assert public.tomtube_api('videos.list','{"childId":"10000000-0000-0000-0000-000000000001"}') = '[]'::jsonb, 'Cross-account read allowed';
 assert public.tomtube_api('playlists.list') = '[]'::jsonb, 'Cross-account playlists exposed';
 perform public.tomtube_api('videos.remove', '{"youtubeVideoId":"lmnopqrstuv","childId":"10000000-0000-0000-0000-000000000001"}');
 begin
  perform public.tomtube_api('playlists.add', jsonb_build_object('playlistId', current_setting('test.playlist_id'), 'youtubeVideoId','abcdefghijk'));
  raise exception 'Cross-account write allowed';
 exception when raise_exception then
  if sqlerrm <> 'Playlist not found' then raise; end if;
 end;
end $$;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
do $$ begin
 assert jsonb_array_length(public.tomtube_api('videos.list')) = 1, 'Cross-account deletion succeeded';
end $$;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000003', true);
do $$
begin
 assert jsonb_array_length(public.tomtube_api('admin.users')) >= 3, 'Admin users missing';
 assert (public.tomtube_api('admin.overview')->'totals'->>'playlists')::int >= 1, 'Admin overview missing playlist';
end $$;
set local role anon;
do $$
begin
 begin
  perform public.tomtube_api('videos.list');
  raise exception 'Anonymous RPC was allowed';
 exception when insufficient_privilege then null; end;
end $$;
rollback;
select 'PASS: approvals, ownership, playlist writes, screen time, PIN, admin access, and anonymous denial' as result;
