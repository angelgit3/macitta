-- 1. MAZOS (DECKS)
create table if not exists public.decks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. TARJETAS (CARDS)
create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid references public.decks(id) on delete cascade not null,
  question text not null, 
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. CAJONCITOS (SLOTS)
create table if not exists public.card_slots (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references public.cards(id) on delete cascade not null,
  label text not null, 
  accepted_answers text[] not null, 
  order_index integer not null default 0 
);

-- 4. PROGRESO DEL USUARIO (USER_ITEMS)
create table if not exists public.user_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  card_id uuid references public.cards(id) on delete cascade not null,
  stability real default 0, 
  difficulty real default 0, 
  reps integer default 0, 
  lapses integer default 0, 
  state text default 'new', 
  last_review timestamp with time zone, 
  due_date timestamp with time zone default timezone('utc'::text, now()) not null, 
  
  unique(user_id, card_id) 
);

-- 5. LOG DE ESTUDIO (STUDY_LOGS)
create table if not exists public.study_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  card_id uuid references public.cards(id) on delete cascade not null,
  grade integer not null, 
  time_taken_ms integer not null, 
  accuracy float not null, 
  review_date timestamp with time zone default timezone('utc'::text, now()) not null
);

-- POLÍTICAS DE SEGURIDAD (RLS)
alter table public.decks enable row level security;
alter table public.cards enable row level security;
alter table public.card_slots enable row level security;
alter table public.user_items enable row level security;
alter table public.study_logs enable row level security;

-- Avoid error if policies already exist by dropping them first
drop policy if exists "Decks are viewable by everyone" on public.decks;
drop policy if exists "Cards are viewable by everyone" on public.cards;
drop policy if exists "Slots are viewable by everyone" on public.card_slots;
drop policy if exists "Users can view own items" on public.user_items;
drop policy if exists "Users can insert own items" on public.user_items;
drop policy if exists "Users can update own items" on public.user_items;
drop policy if exists "Users can view own logs" on public.study_logs;
drop policy if exists "Users can insert own logs" on public.study_logs;

create policy "Decks are viewable by everyone" on public.decks for select using (true);
create policy "Cards are viewable by everyone" on public.cards for select using (true);
create policy "Slots are viewable by everyone" on public.card_slots for select using (true);

create policy "Users can view own items" on public.user_items for select using (auth.uid() = user_id);
create policy "Users can insert own items" on public.user_items for insert with check (auth.uid() = user_id);
create policy "Users can update own items" on public.user_items for update using (auth.uid() = user_id);

create policy "Users can view own logs" on public.study_logs for select using (auth.uid() = user_id);
create policy "Users can insert own logs" on public.study_logs for insert with check (auth.uid() = user_id);
;
