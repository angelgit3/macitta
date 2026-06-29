-- Finalize the transition from the former UPT classroom portal to the
-- public, personal-study product described by the current application.

-- The previous trigger still required @upt.edu.mx addresses and inserted a
-- removed `role` column. Keep the trigger function private and make its body
-- match the current profiles schema and public signup flow.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_username text;
  safe_username text;
begin
  requested_username := nullif(
    left(
      regexp_replace(
        coalesce(new.raw_user_meta_data ->> 'user_name', split_part(new.email, '@', 1)),
        '[^a-zA-Z0-9_.-]',
        '',
        'g'
      ),
      32
    ),
    ''
  );

  safe_username := coalesce(requested_username, 'user_' || substr(new.id::text, 1, 8));

  if exists (
    select 1
    from public.profiles
    where username = safe_username
      and id <> new.id
  ) then
    safe_username := left(safe_username, 23) || '_' || substr(new.id::text, 1, 8);
  end if;

  insert into public.profiles (
    id,
    username,
    full_name,
    avatar_url,
    email,
    created_at
  ) values (
    new.id,
    safe_username,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url',
    new.email,
    new.created_at
  )
  on conflict (id) do update set
    email = excluded.email,
    updated_at = now();

  return new;
end;
$$;

-- Trigger functions are invoked by Postgres, never through the Data API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- This helper belonged to the removed classroom feature and still referenced
-- a table that no longer exists.
drop function if exists public.get_my_classmate_ids();

-- `toefl-audio` is a public bucket and the app resolves known public URLs.
-- A broad SELECT policy is unnecessary and also permits bucket listing.
drop policy if exists "toefl_audio_select_authenticated" on storage.objects;
