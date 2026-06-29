-- Clean up potentially failed state
drop table if exists public.user_progress cascade;
drop table if exists public.verbs cascade;
drop table if exists public.profiles cascade;
drop function if exists public.handle_new_user cascade;

-- Create Profiles Table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  daily_goal integer default 20,
  streak_current integer default 0,
  constraint username_length check (char_length(username) >= 3)
);

-- Enable RLS for Profiles
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- Trigger to handle new user signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, username)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'user_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create Verbs Table (Master Content)
create table public.verbs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  infinitive text not null,
  simple_past text not null,
  past_participle text not null,
  translation text not null,
  category text, -- 'regular', 'irregular', 'top 100', etc.
  difficulty_level integer default 1
);

-- Enable RLS for Verbs
alter table public.verbs enable row level security;
create policy "Verbs are viewable by everyone." on public.verbs for select using (true);

-- Create User Progress Table (SRS Data)
create table public.user_progress (
  user_id uuid references public.profiles(id) on delete cascade not null,
  verb_id uuid references public.verbs(id) on delete cascade not null,
  
  -- FSRS Fields
  stability real default 0,
  difficulty real default 0,
  elapsed_days real default 0,
  scheduled_days real default 0,
  state integer default 0, -- 0: New, 1: Learning, 2: Review, 3: Relearning
  
  last_review timestamp with time zone default timezone('utc'::text, now()),
  due timestamp with time zone default timezone('utc'::text, now()),
  
  primary key (user_id, verb_id)
);

-- Enable RLS for User Progress
alter table public.user_progress enable row level security;
create policy "Users can view own progress." on public.user_progress for select using (auth.uid() = user_id);
create policy "Users can insert own progress." on public.user_progress for insert with check (auth.uid() = user_id);
create policy "Users can edit own progress." on public.user_progress for update using (auth.uid() = user_id);
;
