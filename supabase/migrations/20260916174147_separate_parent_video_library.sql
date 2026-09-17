create table tomtube_private.parent_videos (
 owner_id uuid not null references auth.users(id) on delete cascade,
 video_id text not null check (video_id ~ '^[A-Za-z0-9_-]{11}$'),
 title text not null check (length(trim(title)) between 1 and 500),
 thumbnail text not null default '', channel_name text not null default '', duration text not null default '',
 approved_at timestamptz not null default now(), primary key(owner_id, video_id)
);
alter table tomtube_private.parent_videos enable row level security;
revoke all on tomtube_private.parent_videos from public, anon, authenticated;
alter table tomtube_private.playlists add column audience text not null default 'parent' check (audience in ('parent','kids'));
create table tomtube_private.watch_history (
 owner_id uuid not null references auth.users(id) on delete cascade,
 audience text not null check (audience in ('parent','kids')),
 video_id text not null,
 title text not null, thumbnail text not null, channel_name text not null,
 watched_seconds integer not null default 0 check (watched_seconds >= 0),
 last_watched_at timestamptz not null default now(), primary key(owner_id, audience, video_id)
);
alter table tomtube_private.watch_history enable row level security;
revoke all on tomtube_private.watch_history from public, anon, authenticated;
create index tomtube_history_recent_idx on tomtube_private.watch_history(owner_id, audience, last_watched_at desc);

alter function tomtube_private.api(text,jsonb) rename to api_v1;
revoke all on function tomtube_private.api_v1(text,jsonb) from public, anon, authenticated;
create function tomtube_private.api(action text, payload jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
 uid uuid := auth.uid();
 audience_value text := coalesce(payload->>'audience', 'kids');
 video text := payload->>'youtubeVideoId';
 result jsonb;
 playlist tomtube_private.playlists%rowtype;
 metadata record;
 seconds_value integer;
begin
 if uid is null or not exists(select 1 from auth.users where id = uid) then raise exception 'Sign in to continue' using errcode='42501'; end if;
 if audience_value not in ('parent','kids') then raise exception 'Invalid library'; end if;
 insert into tomtube_private.families(owner_id) values(uid) on conflict do nothing;
 perform 1 from tomtube_private.families where owner_id = uid for update;

 if action like 'playlists.%' then
  if action = 'playlists.create' then
   insert into tomtube_private.playlists(owner_id,name,audience) values(uid,trim(payload->>'name'),audience_value) returning * into playlist;
  elsif action = 'playlists.list' then
   select coalesce(jsonb_agg(jsonb_build_object('id',p.id,'userId',p.owner_id,'audience',p.audience,'name',p.name,'items',p.items,'createdAt',p.created_at,'updatedAt',p.updated_at) order by p.created_at desc),'[]'::jsonb)
    into result from tomtube_private.playlists p where p.owner_id=uid and p.audience=audience_value;
   return result;
  else
   select * into playlist from tomtube_private.playlists p where p.id=(payload->>'playlistId')::uuid and p.owner_id=uid and p.audience=audience_value for update;
   if not found then raise exception 'Playlist not found'; end if;
   if action = 'playlists.delete' then
    delete from tomtube_private.playlists where id=playlist.id;
    return '{"success":true}'::jsonb;
   elsif action = 'playlists.remove' then
    update tomtube_private.playlists set items=(select coalesce(jsonb_agg(item),'[]'::jsonb) from jsonb_array_elements(playlist.items) item where item->>'videoId' <> video),updated_at=now() where id=playlist.id returning * into playlist;
   elsif action = 'playlists.add' then
    -- Adding to a child playlist explicitly approves the video for that child's library.
    if audience_value='parent' then
     select title,thumbnail,channel_name into metadata from tomtube_private.parent_videos where owner_id=uid and video_id=video;
    else
     select title,thumbnail,channel_name into metadata from tomtube_private.approved_videos where owner_id=uid and video_id=video;
    end if;
    if not found then
     perform tomtube_private.api('videos.approve', payload);
     if audience_value='parent' then
      select title,thumbnail,channel_name into metadata from tomtube_private.parent_videos where owner_id=uid and video_id=video;
     else
      select title,thumbnail,channel_name into metadata from tomtube_private.approved_videos where owner_id=uid and video_id=video;
     end if;
    end if;
    if not exists(select 1 from jsonb_array_elements(playlist.items) item where item->>'videoId'=video) then
     update tomtube_private.playlists set items=items || jsonb_build_array(jsonb_build_object('id',gen_random_uuid(),'videoId',video,'title',metadata.title,'thumbnail',metadata.thumbnail,'url','https://www.youtube.com/watch?v='||video,'addedAt',now())),updated_at=now() where id=playlist.id returning * into playlist;
    end if;
   else raise exception 'Unknown action'; end if;
  end if;
  return jsonb_build_object('id',playlist.id,'userId',playlist.owner_id,'audience',playlist.audience,'name',playlist.name,'items',playlist.items,'createdAt',playlist.created_at,'updatedAt',playlist.updated_at);
 end if;

 if action like 'videos.%' then
  if audience_value='parent' then
   if action='videos.approve' then
    insert into tomtube_private.parent_videos(owner_id,video_id,title,thumbnail,channel_name,duration)
     values(uid,video,trim(payload->>'title'),coalesce(payload->>'thumbnail',''),coalesce(payload->>'channelName',''),coalesce(payload->>'duration',''))
     on conflict(owner_id,video_id) do update set title=excluded.title,thumbnail=excluded.thumbnail,channel_name=excluded.channel_name,duration=excluded.duration;
   elsif action='videos.remove' then
    delete from tomtube_private.parent_videos where owner_id=uid and video_id=video;
   elsif action <> 'videos.list' then raise exception 'Unknown action'; end if;
   select coalesce(jsonb_agg(jsonb_build_object('childId',owner_id,'youtubeVideoId',video_id,'title',title,'thumbnail',thumbnail,'channelName',channel_name,'duration',duration,'approvedAt',approved_at) order by approved_at desc),'[]'::jsonb)
    into result from tomtube_private.parent_videos where owner_id=uid;
  else
   result := tomtube_private.api_v1(action,payload);
  end if;
  if action='videos.remove' then
   update tomtube_private.playlists p set items=(select coalesce(jsonb_agg(item),'[]'::jsonb) from jsonb_array_elements(p.items) item where item->>'videoId' <> video), updated_at=now()
    where owner_id=uid and audience=audience_value and exists(select 1 from jsonb_array_elements(p.items) item where item->>'videoId'=video);
  end if;
  return result;
 end if;

 if action='history.list' then
  select coalesce(jsonb_agg(jsonb_build_object('youtubeVideoId',h.video_id,'title',h.title,'thumbnail',h.thumbnail,'channelName',h.channel_name,'audience',h.audience,'watchedSeconds',h.watched_seconds,'lastWatchedAt',h.last_watched_at,
   'available',case when h.audience='parent' then exists(select 1 from tomtube_private.parent_videos v where v.owner_id=uid and v.video_id=h.video_id) else exists(select 1 from tomtube_private.approved_videos v where v.owner_id=uid and v.video_id=h.video_id) end) order by h.last_watched_at desc),'[]'::jsonb)
   into result from (select * from tomtube_private.watch_history where owner_id=uid and audience=audience_value order by last_watched_at desc limit 200) h;
  return result;
 elsif action='history.clear' then
  delete from tomtube_private.watch_history where owner_id=uid and audience=audience_value;
  return '{"success":true}'::jsonb;
 elsif action in ('history.record','history.track','playback.track') then
  if audience_value='parent' then
   select title,thumbnail,channel_name into metadata from tomtube_private.parent_videos where owner_id=uid and video_id=video;
  else
   select title,thumbnail,channel_name into metadata from tomtube_private.approved_videos where owner_id=uid and video_id=video;
  end if;
  if not found then
   if action='playback.track' then return tomtube_private.api_v1(action,payload); end if;
   raise exception 'Video is not in this library';
  end if;
  seconds_value := case when action='history.record' then 0 else (payload->>'seconds')::integer end;
  if seconds_value is null or seconds_value not between 0 and 30 then raise exception 'Invalid watch interval'; end if;
  if action='playback.track' then
   -- Kid watch time always follows the child's quota, regardless of input audience.
   if audience_value <> 'kids' then raise exception 'Use history.track for parent playback'; end if;
   result := tomtube_private.api_v1('playback.validate',payload);
   seconds_value := least(seconds_value, greatest(0, coalesce((result->>'remainingSeconds')::integer,0)));
   result := tomtube_private.api_v1(action,payload);
   if seconds_value=0 or result->>'reason'='UNAPPROVED' then return result; end if;
  end if;
  insert into tomtube_private.watch_history(owner_id,audience,video_id,title,thumbnail,channel_name,watched_seconds)
   values(uid,audience_value,video,metadata.title,metadata.thumbnail,metadata.channel_name,seconds_value)
   on conflict(owner_id,audience,video_id) do update set title=excluded.title,thumbnail=excluded.thumbnail,channel_name=excluded.channel_name,watched_seconds=tomtube_private.watch_history.watched_seconds+excluded.watched_seconds,last_watched_at=now();
  return coalesce(result,'{"success":true}'::jsonb);
 end if;
 return tomtube_private.api_v1(action,payload);
end;
$$;
revoke all on function tomtube_private.api(text,jsonb) from public,anon,authenticated;
grant execute on function tomtube_private.api(text,jsonb) to authenticated;
