create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;
create schema if not exists tomtube_private;
revoke all on schema tomtube_private from public, anon, authenticated;
grant usage on schema tomtube_private to authenticated;

create table tomtube_private.families (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  daily_limit_minutes integer not null default 60 check (daily_limit_minutes between 0 and 1440),
  pin_hash text not null default extensions.crypt('1234', extensions.gen_salt('bf')),
  pin_failures integer not null default 0,
  pin_locked_until timestamptz
);
create table tomtube_private.approved_videos (
  owner_id uuid not null references auth.users(id) on delete cascade,
  video_id text not null check (video_id ~ '^[A-Za-z0-9_-]{11}$'),
  title text not null check (length(trim(title)) between 1 and 500),
  thumbnail text not null,
  channel_name text not null,
  duration text not null default '',
  approved_at timestamptz not null default now(),
  primary key (owner_id, video_id)
);
create table tomtube_private.daily_usage (
  owner_id uuid not null references auth.users(id) on delete cascade,
  day date not null default (now() at time zone 'UTC')::date,
  watched_seconds integer not null default 0 check (watched_seconds >= 0),
  bonus_minutes integer not null default 0 check (bonus_minutes between 0 and 1440),
  primary key (owner_id, day)
);
create table tomtube_private.playlists (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 200),
  items jsonb not null default '[]'::jsonb check (jsonb_typeof(items) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index tomtube_playlists_owner_idx on tomtube_private.playlists(owner_id);
alter table tomtube_private.families enable row level security;
alter table tomtube_private.approved_videos enable row level security;
alter table tomtube_private.daily_usage enable row level security;
alter table tomtube_private.playlists enable row level security;
revoke all on all tables in schema tomtube_private from public, anon, authenticated;

-- Writes are encapsulated to keep PIN hashes private and serialize screen-time updates.
-- Every operation derives ownership from auth.uid(), never client-supplied IDs.
create function tomtube_private.api(action text, payload jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  family tomtube_private.families%rowtype;
  usage tomtube_private.daily_usage%rowtype;
  playlist tomtube_private.playlists%rowtype;
  today date := (now() at time zone 'UTC')::date;
  video text := payload->>'youtubeVideoId';
  allowed_minutes integer;
  remaining integer;
  amount integer;
  pin text;
  valid boolean;
  result jsonb;
  users_json jsonb;
  playlists_json jsonb;
  target uuid;
begin
  if uid is null or not exists (select 1 from auth.users where id = uid) then
    raise exception 'Sign in to continue' using errcode = '42501';
  end if;
  if action like 'admin.%' then
    if not exists (select 1 from auth.users where id = uid and raw_app_meta_data->>'role' = 'admin') then
      raise exception 'Administrator access required' using errcode = '42501';
    end if;
    if action = 'admin.createPlaylist' then
      target := (payload->>'targetUserId')::uuid;
      insert into tomtube_private.playlists(owner_id, name) values (target, trim(payload->>'playlistName'));
      return '{"success":true}'::jsonb;
    end if;
    select coalesce(jsonb_agg(jsonb_build_object('id', u.id, 'username', u.email, 'role', case when u.raw_app_meta_data->>'role' = 'admin' then 'admin' else 'user' end,
      'createdAt', u.created_at, 'playlists', (select count(*) from tomtube_private.playlists p where p.owner_id = u.id),
      'videos', (select coalesce(sum(jsonb_array_length(p.items)), 0) from tomtube_private.playlists p where p.owner_id = u.id))), '[]'::jsonb)
      into users_json from auth.users u;
    if action = 'admin.users' then return users_json; end if;
    if action <> 'admin.overview' then raise exception 'Unknown action'; end if;
    select coalesce(jsonb_agg(jsonb_build_object('id', p.id, 'userId', p.owner_id, 'name', p.name, 'items', p.items, 'createdAt', p.created_at, 'updatedAt', p.updated_at)), '[]'::jsonb)
      into playlists_json from tomtube_private.playlists p;
    return jsonb_build_object('users', users_json, 'playlists', playlists_json, 'orphanOwners', '[]'::jsonb,
      'totals', jsonb_build_object('users', jsonb_array_length(users_json), 'admins', (select count(*) from auth.users where raw_app_meta_data->>'role' = 'admin'),
      'playlists', jsonb_array_length(playlists_json), 'videos', (select coalesce(sum(jsonb_array_length(items)), 0) from tomtube_private.playlists)));
  end if;

  insert into tomtube_private.families(owner_id) values (uid) on conflict do nothing;
  select * into family from tomtube_private.families where owner_id = uid for update;

  if action like 'videos.%' then
    if action = 'videos.approve' then
      insert into tomtube_private.approved_videos(owner_id, video_id, title, thumbnail, channel_name, duration)
      values (uid, video, trim(payload->>'title'), coalesce(payload->>'thumbnail', ''), coalesce(payload->>'channelName', 'YouTube'), coalesce(payload->>'duration', ''))
      on conflict (owner_id, video_id) do update set title = excluded.title, thumbnail = excluded.thumbnail, channel_name = excluded.channel_name, duration = excluded.duration;
    elsif action = 'videos.remove' then
      delete from tomtube_private.approved_videos where owner_id = uid and video_id = video;
    elsif action <> 'videos.list' then raise exception 'Unknown action'; end if;
    select coalesce(jsonb_agg(jsonb_build_object('childId', owner_id, 'youtubeVideoId', video_id, 'title', title, 'thumbnail', thumbnail,
      'channelName', channel_name, 'duration', duration, 'approvedAt', approved_at) order by approved_at desc), '[]'::jsonb)
      into result from tomtube_private.approved_videos where owner_id = uid;
    return result;
  end if;

  if action like 'pin.%' then
    if family.pin_locked_until > now() then return '{"valid":false,"success":false,"error":"Too many attempts. Try again in five minutes."}'::jsonb; end if;
    pin := case when action = 'pin.set' then payload->>'currentPin' else payload->>'pin' end;
    valid := coalesce(extensions.crypt(pin, family.pin_hash) = family.pin_hash, false);
    if not valid then
      update tomtube_private.families set pin_failures = case when pin_locked_until <= now() then 1 else pin_failures + 1 end,
        pin_locked_until = case when pin_locked_until <= now() then null when pin_failures >= 4 then now() + interval '5 minutes' else null end where owner_id = uid;
      return '{"valid":false,"success":false,"error":"Incorrect current PIN"}'::jsonb;
    end if;
    update tomtube_private.families set pin_failures = 0, pin_locked_until = null where owner_id = uid;
    if action = 'pin.set' then
      if coalesce(payload->>'newPin', '') !~ '^[0-9]{4,12}$' then raise exception 'PIN must contain 4 to 12 digits'; end if;
      update tomtube_private.families set pin_hash = extensions.crypt(payload->>'newPin', extensions.gen_salt('bf')) where owner_id = uid;
      return '{"success":true}'::jsonb;
    elsif action = 'pin.verify' then return '{"valid":true}'::jsonb;
    else raise exception 'Unknown action'; end if;
  end if;

  if action like 'playlists.%' then
    if action = 'playlists.create' then
      insert into tomtube_private.playlists(owner_id, name) values (uid, trim(payload->>'name')) returning * into playlist;
    elsif action = 'playlists.add' then
      select * into playlist from tomtube_private.playlists where id = (payload->>'playlistId')::uuid and owner_id = uid for update;
      if not found then raise exception 'Playlist not found'; end if;
      if coalesce(video, '') !~ '^[A-Za-z0-9_-]{11}$' then raise exception 'Invalid YouTube video ID'; end if;
      if not exists (select 1 from jsonb_array_elements(playlist.items) item where item->>'videoId' = video) then
        update tomtube_private.playlists set items = items || jsonb_build_array(jsonb_build_object('id', gen_random_uuid(), 'videoId', video,
          'url', 'https://www.youtube.com/watch?v=' || video, 'title', coalesce(payload->>'title', video), 'thumbnail', coalesce(payload->>'thumbnail', ''), 'addedAt', now())), updated_at = now()
          where id = playlist.id returning * into playlist;
      end if;
    elsif action = 'playlists.list' then
      select coalesce(jsonb_agg(jsonb_build_object('id', p.id, 'userId', p.owner_id, 'name', p.name, 'items', p.items, 'createdAt', p.created_at, 'updatedAt', p.updated_at) order by p.created_at desc), '[]'::jsonb)
        into result from tomtube_private.playlists p where p.owner_id = uid;
      return result;
    else raise exception 'Unknown action'; end if;
    return jsonb_build_object('id', playlist.id, 'userId', playlist.owner_id, 'name', playlist.name, 'items', playlist.items, 'createdAt', playlist.created_at, 'updatedAt', playlist.updated_at);
  end if;

  insert into tomtube_private.daily_usage(owner_id, day) values (uid, today) on conflict do nothing;
  select * into usage from tomtube_private.daily_usage where owner_id = uid and day = today for update;
  if action = 'time.setLimit' then
    amount := (payload->>'dailyLimitMinutes')::integer;
    if amount is null or amount not between 0 and 1440 then raise exception 'Daily limit must be between 0 and 1440 minutes'; end if;
    update tomtube_private.families set daily_limit_minutes = amount where owner_id = uid returning * into family;
  elsif action = 'time.addBonus' then
    amount := (payload->>'bonusMinutes')::integer;
    if amount is null or amount not between 1 and 1440 then raise exception 'Bonus time must be between 1 and 1440 minutes'; end if;
    update tomtube_private.daily_usage set bonus_minutes = least(1440, bonus_minutes + amount) where owner_id = uid and day = today returning * into usage;
  elsif action not in ('time.get', 'playback.validate', 'playback.track') then raise exception 'Unknown action'; end if;
  allowed_minutes := family.daily_limit_minutes + usage.bonus_minutes;
  remaining := greatest(0, allowed_minutes * 60 - usage.watched_seconds);
  if action in ('playback.validate', 'playback.track') then
    if not exists (select 1 from tomtube_private.approved_videos where owner_id = uid and video_id = video) then
      return jsonb_build_object('allowed', false, 'reason', 'UNAPPROVED', 'message', 'This video has not been approved by a parent.', 'remainingSeconds', remaining, 'watchedSeconds', usage.watched_seconds, 'totalAllowedMinutes', allowed_minutes);
    end if;
    if action = 'playback.track' and remaining > 0 then
      amount := (payload->>'seconds')::integer;
      if amount is null or amount not between 1 and 30 then raise exception 'Watch interval must be between 1 and 30 seconds'; end if;
      update tomtube_private.daily_usage set watched_seconds = watched_seconds + least(amount, remaining) where owner_id = uid and day = today returning * into usage;
      remaining := greatest(0, allowed_minutes * 60 - usage.watched_seconds);
    end if;
    return jsonb_build_object('allowed', remaining > 0, 'reason', case when remaining = 0 then 'TIME_EXPIRED' else null end,
      'message', case when remaining = 0 then 'Daily screen time limit has been reached.' else null end,
      'remainingSeconds', remaining, 'watchedSeconds', usage.watched_seconds, 'totalAllowedMinutes', allowed_minutes);
  end if;
  return jsonb_build_object('childId', uid, 'date', today, 'watchedSeconds', usage.watched_seconds, 'dailyLimitMinutes', family.daily_limit_minutes,
    'bonusMinutes', usage.bonus_minutes, 'totalAllowedMinutes', allowed_minutes, 'remainingSeconds', remaining);
end;
$$;
revoke all on function tomtube_private.api(text, jsonb) from public, anon, authenticated;
grant execute on function tomtube_private.api(text, jsonb) to authenticated;

-- The exposed entry point is an invoker, with only the narrow private function delegated.
create function public.tomtube_api(action text, payload jsonb default '{}'::jsonb)
returns jsonb language sql security invoker set search_path = '' as $$
  select tomtube_private.api(action, payload);
$$;
revoke all on function public.tomtube_api(text, jsonb) from public, anon, authenticated;
grant execute on function public.tomtube_api(text, jsonb) to authenticated;
