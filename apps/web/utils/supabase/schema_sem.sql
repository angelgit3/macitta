-- 1. MAZOS (DECKS)
-- Agrupa las tarjetas por tema (ej. "Verbos Irregulares", "Frases de Viaje")
create table public.decks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. TARJETAS (CARDS)
-- La unidad base. Representa el concepto abstracto (ej. el verbo "Ser/Estar")
create table public.cards (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid references public.decks(id) on delete cascade not null,
  question text not null, -- Lo que ve el usuario (Frente)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. CAJONCITOS (SLOTS)
-- Las partes que el usuario debe responder.
-- Para los verbos habrá 3 slots por tarjeta: Infinitivo, Pasado, Participio.
create table public.card_slots (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references public.cards(id) on delete cascade not null,
  label text not null, -- Ej: "Infinitivo"
  accepted_answers text[] not null, -- Array de respuestas válidas. Ej: ['be', 'to be']
  match_type text not null default 'any' check (match_type in ('any', 'all')), -- 'any': Basta con una. 'all': Se requieren todas.
  order_index integer not null default 0 -- Para mostrar en orden (1, 2, 3)
);

-- 4. PROGRESO DEL USUARIO (USER_ITEMS)
-- Almacena el estado mental del usuario para cada tarjeta usando métricas FSRS.
create table public.user_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  card_id uuid references public.cards(id) on delete cascade not null,
  
  -- Campos FSRS (Sistema de Repetición Espaciada)
  stability real default 0, -- Fortaleza de la memoria (días)
  difficulty real default 0, -- Dificultad intrínseca (1-10)
  reps integer default 0, -- Cuántas veces la ha visto
  lapses integer default 0, -- Cuántas veces la ha olvidado
  state text default 'new', -- Estados: new, learning, review, relearning
  
  last_review timestamp with time zone, -- Cuándo la vio por última vez
  due_date timestamp with time zone default timezone('utc'::text, now()) not null, -- Cuándo le toca (Ordenamiento principal)
  
  unique(user_id, card_id) -- Un usuario solo tiene un registro por tarjeta
);

-- 5. LOG DE ESTUDIO (STUDY_LOGS)
-- Historial detallado para gráficas y para auditar si el algoritmo funciona.
create table public.study_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  card_id uuid references public.cards(id) on delete cascade not null,
  
  grade integer not null, -- 1:Again, 2:Hard, 3:Good, 4:Easy
  time_taken_ms integer not null, -- El TIEMPO que tardó (clave para tu algoritmo)
  accuracy float not null, -- 1.0 (perfecto), 0.66, 0.33, 0.0
  
  review_date timestamp with time zone default timezone('utc'::text, now()) not null
);

-- POLÍTICAS DE SEGURIDAD (RLS)
-- Habilitamos seguridad para que cada usuario solo vea sus datos, pero pueda ver los mazos públicos.

alter table public.decks enable row level security;
alter table public.cards enable row level security;
alter table public.card_slots enable row level security;
alter table public.user_items enable row level security;
alter table public.study_logs enable row level security;

-- Políticas de Lectura (Todo mundo ve los mazos y tarjetas base)
create policy "Decks are viewable by everyone" on public.decks for select using (true);
create policy "Cards are viewable by everyone" on public.cards for select using (true);
create policy "Slots are viewable by everyone" on public.card_slots for select using (true);

-- Políticas de Usuario (Solo el dueño puede ver/editar su progreso)
create policy "Users can view own items" on public.user_items for select using (auth.uid() = user_id);
create policy "Users can insert own items" on public.user_items for insert with check (auth.uid() = user_id);
create policy "Users can update own items" on public.user_items for update using (auth.uid() = user_id);

create policy "Users can view own logs" on public.study_logs for select using (auth.uid() = user_id);
create policy "Users can insert own logs" on public.study_logs for insert with check (auth.uid() = user_id);
