-- Adaptive Listening keeps catalog content in the deployed application so its
-- audio can be precached. The database stores only account-scoped progress.

create table public.listening_question_progress (
    user_id uuid not null references auth.users(id) on delete cascade,
    question_id text not null check (char_length(question_id) between 3 and 120),
    points smallint not null default 0 check (points between 0 and 2),
    attempts integer not null default 0 check (attempts >= 0),
    correct_attempts integer not null default 0 check (correct_attempts >= 0),
    last_answered_at timestamptz,
    due_at timestamptz not null default now(),
    revision integer not null default 0 check (revision >= 0),
    updated_at timestamptz not null default now(),
    primary key (user_id, question_id),
    constraint listening_question_progress_counts_check check (correct_attempts <= attempts)
);

create index listening_question_progress_user_due_idx
    on public.listening_question_progress (user_id, due_at);

create table public.listening_skill_progress (
    user_id uuid not null references auth.users(id) on delete cascade,
    skill_code text not null check (skill_code in ('gist', 'detail', 'inference', 'function', 'idiom', 'attitude', 'organization')),
    step smallint not null default 0 check (step between 0 and 8),
    interval_days integer not null default 0 check (interval_days >= 0),
    difficulty real not null default 5 check (difficulty between 1 and 10),
    reps integer not null default 0 check (reps >= 0),
    lapses integer not null default 0 check (lapses >= 0),
    state text not null default 'new' check (state in ('new', 'learning', 'review', 'mastered')),
    last_review_at timestamptz,
    due_at timestamptz not null default now(),
    correct_attempts integer not null default 0 check (correct_attempts >= 0),
    total_attempts integer not null default 0 check (total_attempts >= 0),
    revision integer not null default 0 check (revision >= 0),
    updated_at timestamptz not null default now(),
    primary key (user_id, skill_code),
    constraint listening_skill_progress_counts_check check (correct_attempts <= total_attempts)
);

create index listening_skill_progress_user_due_idx
    on public.listening_skill_progress (user_id, due_at);

create table public.listening_sessions (
    id uuid primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    mode text not null check (mode in ('quick', 'long')),
    primary_unit_id text,
    status text not null default 'active' check (status in ('active', 'completed', 'abandoned')),
    started_at timestamptz not null,
    ended_at timestamptz,
    total_questions smallint not null default 0 check (total_questions between 0 and 5),
    correct_questions smallint not null default 0 check (correct_questions between 0 and 5),
    total_time_ms integer not null default 0 check (total_time_ms >= 0),
    created_at timestamptz not null default now(),
    constraint listening_sessions_counts_check check (correct_questions <= total_questions),
    constraint listening_sessions_time_order_check check (ended_at is null or ended_at >= started_at)
);

create index listening_sessions_user_started_idx
    on public.listening_sessions (user_id, started_at desc);

create table public.listening_attempts (
    id uuid primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    question_id text not null check (char_length(question_id) between 3 and 120),
    session_id uuid not null references public.listening_sessions(id) on delete restrict,
    selected_option_id text not null check (selected_option_id in ('A', 'B', 'C', 'D')),
    is_correct boolean not null,
    earned_points smallint not null check (earned_points between 0 and 2),
    play_count smallint not null check (play_count between 1 and 8),
    previous_question_state jsonb not null check (jsonb_typeof(previous_question_state) = 'object'),
    next_question_state jsonb not null check (jsonb_typeof(next_question_state) = 'object'),
    previous_skill_state jsonb not null check (jsonb_typeof(previous_skill_state) = 'object'),
    next_skill_state jsonb not null check (jsonb_typeof(next_skill_state) = 'object'),
    response_ms integer not null check (response_ms >= 0),
    answered_at timestamptz not null,
    recorded_at timestamptz not null default now()
);

create index listening_attempts_user_answered_idx
    on public.listening_attempts (user_id, answered_at desc);
create index listening_attempts_session_id_idx
    on public.listening_attempts (session_id);

alter table public.listening_question_progress enable row level security;
alter table public.listening_skill_progress enable row level security;
alter table public.listening_sessions enable row level security;
alter table public.listening_attempts enable row level security;

create policy "Users read own listening question progress"
    on public.listening_question_progress for select to authenticated
    using ((select auth.uid()) = user_id);
create policy "Users insert own listening question progress"
    on public.listening_question_progress for insert to authenticated
    with check ((select auth.uid()) = user_id);
create policy "Users update own listening question progress"
    on public.listening_question_progress for update to authenticated
    using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "Users read own listening skill progress"
    on public.listening_skill_progress for select to authenticated
    using ((select auth.uid()) = user_id);
create policy "Users insert own listening skill progress"
    on public.listening_skill_progress for insert to authenticated
    with check ((select auth.uid()) = user_id);
create policy "Users update own listening skill progress"
    on public.listening_skill_progress for update to authenticated
    using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "Users read own listening sessions"
    on public.listening_sessions for select to authenticated
    using ((select auth.uid()) = user_id);
create policy "Users insert own listening sessions"
    on public.listening_sessions for insert to authenticated
    with check ((select auth.uid()) = user_id);
create policy "Users update own listening sessions"
    on public.listening_sessions for update to authenticated
    using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "Users read own listening attempts"
    on public.listening_attempts for select to authenticated
    using ((select auth.uid()) = user_id);
create policy "Users insert own listening attempts"
    on public.listening_attempts for insert to authenticated
    with check (
        (select auth.uid()) = user_id
        and exists (
            select 1 from public.listening_sessions
            where listening_sessions.id = listening_attempts.session_id
              and listening_sessions.user_id = (select auth.uid())
        )
    );

revoke all on public.listening_question_progress from anon, authenticated;
revoke all on public.listening_skill_progress from anon, authenticated;
revoke all on public.listening_sessions from anon, authenticated;
revoke all on public.listening_attempts from anon, authenticated;
grant select, insert, update on public.listening_question_progress to authenticated;
grant select, insert, update on public.listening_skill_progress to authenticated;
grant select, insert, update on public.listening_sessions to authenticated;
grant select, insert on public.listening_attempts to authenticated;

create or replace function public.sync_listening_question_progress(
    p_user_id uuid, p_question_id text, p_points smallint, p_attempts integer,
    p_correct_attempts integer, p_last_answered_at timestamptz, p_due_at timestamptz,
    p_expected_revision integer
)
returns public.listening_question_progress
language plpgsql security invoker set search_path = ''
as $$
declare synced public.listening_question_progress;
begin
    if (select auth.uid()) is distinct from p_user_id then
        raise exception 'listening question progress owner mismatch' using errcode = '42501';
    end if;
    insert into public.listening_question_progress (
        user_id, question_id, points, attempts, correct_attempts, last_answered_at, due_at, revision, updated_at
    ) values (
        p_user_id, p_question_id, p_points, p_attempts, p_correct_attempts, p_last_answered_at, p_due_at, 1, now()
    ) on conflict (user_id, question_id) do update set
        points = excluded.points, attempts = excluded.attempts, correct_attempts = excluded.correct_attempts,
        last_answered_at = excluded.last_answered_at, due_at = excluded.due_at,
        revision = public.listening_question_progress.revision + 1, updated_at = now()
    where public.listening_question_progress.revision = p_expected_revision
    returning * into synced;
    if synced is null then raise exception 'listening question progress revision conflict' using errcode = '40001'; end if;
    return synced;
end;
$$;

create or replace function public.sync_listening_skill_progress(
    p_user_id uuid, p_skill_code text, p_step smallint, p_interval_days integer,
    p_difficulty real, p_reps integer, p_lapses integer, p_state text,
    p_last_review_at timestamptz, p_due_at timestamptz, p_correct_attempts integer,
    p_total_attempts integer, p_expected_revision integer
)
returns public.listening_skill_progress
language plpgsql security invoker set search_path = ''
as $$
declare synced public.listening_skill_progress;
begin
    if (select auth.uid()) is distinct from p_user_id then
        raise exception 'listening skill progress owner mismatch' using errcode = '42501';
    end if;
    insert into public.listening_skill_progress (
        user_id, skill_code, step, interval_days, difficulty, reps, lapses, state,
        last_review_at, due_at, correct_attempts, total_attempts, revision, updated_at
    ) values (
        p_user_id, p_skill_code, p_step, p_interval_days, p_difficulty, p_reps, p_lapses,
        p_state, p_last_review_at, p_due_at, p_correct_attempts, p_total_attempts, 1, now()
    ) on conflict (user_id, skill_code) do update set
        step = excluded.step, interval_days = excluded.interval_days, difficulty = excluded.difficulty,
        reps = excluded.reps, lapses = excluded.lapses, state = excluded.state,
        last_review_at = excluded.last_review_at, due_at = excluded.due_at,
        correct_attempts = excluded.correct_attempts, total_attempts = excluded.total_attempts,
        revision = public.listening_skill_progress.revision + 1, updated_at = now()
    where public.listening_skill_progress.revision = p_expected_revision
    returning * into synced;
    if synced is null then raise exception 'listening skill progress revision conflict' using errcode = '40001'; end if;
    return synced;
end;
$$;

create or replace function public.insert_listening_attempt(
    p_id uuid, p_user_id uuid, p_question_id text, p_session_id uuid, p_selected_option_id text,
    p_is_correct boolean, p_earned_points smallint, p_play_count smallint,
    p_previous_question_state jsonb, p_next_question_state jsonb,
    p_previous_skill_state jsonb, p_next_skill_state jsonb, p_response_ms integer,
    p_answered_at timestamptz
)
returns boolean
language plpgsql security invoker set search_path = ''
as $$
declare inserted_count integer;
begin
    if (select auth.uid()) is distinct from p_user_id then
        raise exception 'listening attempt owner mismatch' using errcode = '42501';
    end if;
    insert into public.listening_attempts (
        id, user_id, question_id, session_id, selected_option_id, is_correct, earned_points,
        play_count, previous_question_state, next_question_state, previous_skill_state,
        next_skill_state, response_ms, answered_at
    ) values (
        p_id, p_user_id, p_question_id, p_session_id, p_selected_option_id, p_is_correct,
        p_earned_points, p_play_count, p_previous_question_state, p_next_question_state,
        p_previous_skill_state, p_next_skill_state, p_response_ms, p_answered_at
    ) on conflict (id) do nothing;
    get diagnostics inserted_count = row_count;
    return inserted_count = 1;
end;
$$;

revoke all on function public.sync_listening_question_progress(uuid, text, smallint, integer, integer, timestamptz, timestamptz, integer) from public, anon;
revoke all on function public.sync_listening_skill_progress(uuid, text, smallint, integer, real, integer, integer, text, timestamptz, timestamptz, integer, integer, integer) from public, anon;
revoke all on function public.insert_listening_attempt(uuid, uuid, text, uuid, text, boolean, smallint, smallint, jsonb, jsonb, jsonb, jsonb, integer, timestamptz) from public, anon;
grant execute on function public.sync_listening_question_progress(uuid, text, smallint, integer, integer, timestamptz, timestamptz, integer) to authenticated;
grant execute on function public.sync_listening_skill_progress(uuid, text, smallint, integer, real, integer, integer, text, timestamptz, timestamptz, integer, integer, integer) to authenticated;
grant execute on function public.insert_listening_attempt(uuid, uuid, text, uuid, text, boolean, smallint, smallint, jsonb, jsonb, jsonb, jsonb, integer, timestamptz) to authenticated;

create trigger listening_attempts_write_rate_limit
    before insert on public.listening_attempts
    for each row execute function private.enforce_write_rate_limit('listening_attempts', '300', '60');
create trigger listening_sessions_write_rate_limit
    before insert on public.listening_sessions
    for each row execute function private.enforce_write_rate_limit('listening_sessions', '60', '3600');
create trigger listening_question_progress_write_rate_limit
    before insert or update on public.listening_question_progress
    for each row execute function private.enforce_write_rate_limit('listening_question_progress', '300', '60');
create trigger listening_skill_progress_write_rate_limit
    before insert or update on public.listening_skill_progress
    for each row execute function private.enforce_write_rate_limit('listening_skill_progress', '300', '60');
