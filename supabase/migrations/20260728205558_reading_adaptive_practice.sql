-- Adaptive TOEFL ITP Reading practice.
-- This module is intentionally separate from legacy exams/questions so their
-- historical attempts and internal /30 scores remain stable and read-only.

create table public.reading_domains (
    id uuid primary key default gen_random_uuid(),
    code text not null unique,
    name_es text not null check (length(btrim(name_es)) > 0),
    order_index smallint not null unique check (order_index > 0),
    created_at timestamptz not null default now()
);

create table public.reading_skills (
    id uuid primary key default gen_random_uuid(),
    domain_id uuid not null references public.reading_domains(id) on delete restrict,
    code text not null unique,
    name_es text not null check (length(btrim(name_es)) > 0),
    description_es text not null check (length(btrim(description_es)) >= 24),
    order_index smallint not null check (order_index > 0),
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    unique (domain_id, order_index)
);

create index reading_skills_domain_id_idx
    on public.reading_skills (domain_id);

create table public.reading_passages (
    id uuid primary key default gen_random_uuid(),
    slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
    title text not null check (length(btrim(title)) > 0),
    topic_es text not null check (length(btrim(topic_es)) > 0),
    genre text not null check (
        genre in ('natural_science', 'social_science', 'history', 'arts', 'technology')
    ),
    cefr_band text not null check (cefr_band in ('A2', 'B1', 'B2', 'C1')),
    difficulty smallint not null check (difficulty between 1 and 3),
    length_band text not null check (length_band in ('short', 'standard', 'long')),
    body text not null check (length(btrim(body)) > 0),
    word_count smallint not null check (word_count between 120 and 900),
    estimated_minutes smallint not null check (estimated_minutes between 2 and 25),
    status text not null default 'draft'
        check (status in ('draft', 'review', 'published', 'retired')),
    content_version integer not null default 1 check (content_version > 0),
    source_note text,
    linguistic_reviewed boolean not null default false,
    factual_reviewed boolean not null default false,
    fairness_reviewed boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint reading_passages_word_band_range_check check (
        (length_band = 'short' and word_count between 120 and 239)
        or (length_band = 'standard' and word_count between 240 and 449)
        or (length_band = 'long' and word_count between 450 and 900)
    ),
    constraint reading_passages_published_reviews_check check (
        status <> 'published'
        or (linguistic_reviewed and factual_reviewed and fairness_reviewed)
    )
);

create index reading_passages_published_length_idx
    on public.reading_passages (length_band, difficulty, genre)
    where status = 'published';

create table public.reading_questions (
    id uuid primary key default gen_random_uuid(),
    passage_id uuid not null references public.reading_passages(id) on delete restrict,
    primary_skill_id uuid not null references public.reading_skills(id) on delete restrict,
    block_index smallint not null default 1 check (block_index between 1 and 2),
    order_index smallint not null check (order_index > 0),
    difficulty smallint not null check (difficulty between 1 and 3),
    prompt text not null check (length(btrim(prompt)) >= 12),
    options jsonb not null check (
        jsonb_typeof(options) = 'array'
        and jsonb_array_length(options) = 4
    ),
    correct_option_id text not null check (correct_option_id in ('A', 'B', 'C', 'D')),
    explanation_es text not null check (length(btrim(explanation_es)) >= 32),
    evidence jsonb not null check (
        jsonb_typeof(evidence) = 'object'
        and jsonb_typeof(evidence -> 'paragraph') = 'number'
        and jsonb_typeof(evidence -> 'quote') = 'string'
        and length(btrim(evidence ->> 'quote')) > 0
    ),
    distractor_rationales jsonb not null check (
        jsonb_typeof(distractor_rationales) = 'object'
    ),
    status text not null default 'draft'
        check (status in ('draft', 'review', 'published', 'retired')),
    content_version integer not null default 1 check (content_version > 0),
    source_note text,
    linguistic_reviewed boolean not null default false,
    fairness_reviewed boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (passage_id, order_index),
    constraint reading_questions_published_reviews_check check (
        status <> 'published'
        or (linguistic_reviewed and fairness_reviewed)
    )
);

create index reading_questions_passage_block_idx
    on public.reading_questions (passage_id, block_index, order_index);
create index reading_questions_primary_skill_id_idx
    on public.reading_questions (primary_skill_id);
create index reading_questions_published_skill_idx
    on public.reading_questions (primary_skill_id, difficulty)
    where status = 'published';

create table public.reading_question_skills (
    question_id uuid not null references public.reading_questions(id) on delete cascade,
    skill_id uuid not null references public.reading_skills(id) on delete restrict,
    weight real not null default 0.5 check (weight > 0 and weight <= 1),
    primary key (question_id, skill_id)
);

create index reading_question_skills_skill_id_idx
    on public.reading_question_skills (skill_id);

-- Exact items disappear after two points. First-try correctness earns both
-- points; an item missed once needs two later successful recoveries.
create table public.reading_question_progress (
    user_id uuid not null references auth.users(id) on delete cascade,
    question_id uuid not null references public.reading_questions(id) on delete cascade,
    points smallint not null default 0 check (points between 0 and 2),
    attempts integer not null default 0 check (attempts >= 0),
    correct_attempts integer not null default 0 check (correct_attempts >= 0),
    last_answered_at timestamptz,
    due_at timestamptz not null default now(),
    revision integer not null default 0 check (revision >= 0),
    updated_at timestamptz not null default now(),
    primary key (user_id, question_id),
    constraint reading_question_progress_counts_check
        check (correct_attempts <= attempts)
);

create index reading_question_progress_user_due_idx
    on public.reading_question_progress (user_id, due_at)
    where points < 2;
create index reading_question_progress_question_id_idx
    on public.reading_question_progress (question_id);

-- Long-term repetition lives at skill level so learners receive transfer
-- questions from unseen passages instead of memorizing one answer.
create table public.reading_skill_progress (
    user_id uuid not null references auth.users(id) on delete cascade,
    skill_id uuid not null references public.reading_skills(id) on delete cascade,
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
    primary key (user_id, skill_id),
    constraint reading_skill_progress_counts_check
        check (correct_attempts <= total_attempts)
);

create index reading_skill_progress_user_due_idx
    on public.reading_skill_progress (user_id, due_at);
create index reading_skill_progress_skill_id_idx
    on public.reading_skill_progress (skill_id);

create table public.reading_passage_exposures (
    user_id uuid not null references auth.users(id) on delete cascade,
    passage_id uuid not null references public.reading_passages(id) on delete cascade,
    last_seen_at timestamptz not null,
    exposure_count integer not null default 1 check (exposure_count > 0),
    updated_at timestamptz not null default now(),
    primary key (user_id, passage_id)
);

create index reading_passage_exposures_user_recent_idx
    on public.reading_passage_exposures (user_id, last_seen_at desc);
create index reading_passage_exposures_passage_id_idx
    on public.reading_passage_exposures (passage_id);

create table public.reading_sessions (
    id uuid primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    mode text not null default 'daily'
        check (mode in ('daily', 'long', 'recovery', 'continued')),
    primary_passage_id uuid references public.reading_passages(id) on delete set null,
    status text not null default 'active'
        check (status in ('active', 'completed', 'abandoned')),
    started_at timestamptz not null,
    ended_at timestamptz,
    total_questions smallint not null default 0 check (total_questions between 0 and 10),
    correct_questions smallint not null default 0 check (correct_questions between 0 and 10),
    total_time_ms integer not null default 0 check (total_time_ms >= 0),
    created_at timestamptz not null default now(),
    constraint reading_sessions_counts_check
        check (correct_questions <= total_questions),
    constraint reading_sessions_time_order_check
        check (ended_at is null or ended_at >= started_at)
);

create index reading_sessions_user_started_idx
    on public.reading_sessions (user_id, started_at desc);
create index reading_sessions_primary_passage_id_idx
    on public.reading_sessions (primary_passage_id);

create table public.reading_attempts (
    id uuid primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    question_id uuid not null references public.reading_questions(id) on delete restrict,
    session_id uuid not null references public.reading_sessions(id) on delete restrict,
    selected_option_id text not null check (selected_option_id in ('A', 'B', 'C', 'D')),
    is_correct boolean not null,
    grade smallint not null check (grade in (0, 2)),
    previous_question_state jsonb not null check (jsonb_typeof(previous_question_state) = 'object'),
    next_question_state jsonb not null check (jsonb_typeof(next_question_state) = 'object'),
    previous_skill_state jsonb not null check (jsonb_typeof(previous_skill_state) = 'object'),
    next_skill_state jsonb not null check (jsonb_typeof(next_skill_state) = 'object'),
    response_ms integer not null check (response_ms >= 0),
    content_version integer not null check (content_version > 0),
    answered_at timestamptz not null,
    recorded_at timestamptz not null default now()
);

create index reading_attempts_user_answered_idx
    on public.reading_attempts (user_id, answered_at desc);
create index reading_attempts_question_id_idx
    on public.reading_attempts (question_id);
create index reading_attempts_session_id_idx
    on public.reading_attempts (session_id);

alter table public.reading_domains enable row level security;
alter table public.reading_skills enable row level security;
alter table public.reading_passages enable row level security;
alter table public.reading_questions enable row level security;
alter table public.reading_question_skills enable row level security;
alter table public.reading_question_progress enable row level security;
alter table public.reading_skill_progress enable row level security;
alter table public.reading_passage_exposures enable row level security;
alter table public.reading_sessions enable row level security;
alter table public.reading_attempts enable row level security;

create policy "Authenticated users read reading domains"
    on public.reading_domains for select to authenticated using (true);
create policy "Authenticated users read reading skills"
    on public.reading_skills for select to authenticated using (true);
create policy "Authenticated users read reading passages"
    on public.reading_passages for select to authenticated
    using (status in ('published', 'retired'));
create policy "Authenticated users read reading questions"
    on public.reading_questions for select to authenticated
    using (status in ('published', 'retired'));
create policy "Authenticated users read reading question skills"
    on public.reading_question_skills for select to authenticated using (true);

create policy "Users read own reading question progress"
    on public.reading_question_progress for select to authenticated
    using ((select auth.uid()) = user_id);
create policy "Users insert own reading question progress"
    on public.reading_question_progress for insert to authenticated
    with check ((select auth.uid()) = user_id);
create policy "Users update own reading question progress"
    on public.reading_question_progress for update to authenticated
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

create policy "Users read own reading skill progress"
    on public.reading_skill_progress for select to authenticated
    using ((select auth.uid()) = user_id);
create policy "Users insert own reading skill progress"
    on public.reading_skill_progress for insert to authenticated
    with check ((select auth.uid()) = user_id);
create policy "Users update own reading skill progress"
    on public.reading_skill_progress for update to authenticated
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

create policy "Users read own reading exposures"
    on public.reading_passage_exposures for select to authenticated
    using ((select auth.uid()) = user_id);
create policy "Users insert own reading exposures"
    on public.reading_passage_exposures for insert to authenticated
    with check ((select auth.uid()) = user_id);
create policy "Users update own reading exposures"
    on public.reading_passage_exposures for update to authenticated
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

create policy "Users read own reading sessions"
    on public.reading_sessions for select to authenticated
    using ((select auth.uid()) = user_id);
create policy "Users insert own reading sessions"
    on public.reading_sessions for insert to authenticated
    with check ((select auth.uid()) = user_id);
create policy "Users update own reading sessions"
    on public.reading_sessions for update to authenticated
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

create policy "Users read own reading attempts"
    on public.reading_attempts for select to authenticated
    using ((select auth.uid()) = user_id);
create policy "Users insert own reading attempts"
    on public.reading_attempts for insert to authenticated
    with check (
        (select auth.uid()) = user_id
        and exists (
            select 1
            from public.reading_sessions
            where reading_sessions.id = reading_attempts.session_id
              and reading_sessions.user_id = (select auth.uid())
        )
    );

revoke all on public.reading_domains from anon, authenticated;
revoke all on public.reading_skills from anon, authenticated;
revoke all on public.reading_passages from anon, authenticated;
revoke all on public.reading_questions from anon, authenticated;
revoke all on public.reading_question_skills from anon, authenticated;
revoke all on public.reading_question_progress from anon, authenticated;
revoke all on public.reading_skill_progress from anon, authenticated;
revoke all on public.reading_passage_exposures from anon, authenticated;
revoke all on public.reading_sessions from anon, authenticated;
revoke all on public.reading_attempts from anon, authenticated;

grant select on public.reading_domains to authenticated;
grant select on public.reading_skills to authenticated;
grant select on public.reading_passages to authenticated;
grant select on public.reading_questions to authenticated;
grant select on public.reading_question_skills to authenticated;
grant select, insert, update on public.reading_question_progress to authenticated;
grant select, insert, update on public.reading_skill_progress to authenticated;
grant select, insert, update on public.reading_passage_exposures to authenticated;
grant select, insert, update on public.reading_sessions to authenticated;
grant select, insert on public.reading_attempts to authenticated;

create or replace function public.sync_reading_question_progress(
    p_user_id uuid,
    p_question_id uuid,
    p_points smallint,
    p_attempts integer,
    p_correct_attempts integer,
    p_last_answered_at timestamptz,
    p_due_at timestamptz,
    p_expected_revision integer
)
returns public.reading_question_progress
language plpgsql
security invoker
set search_path = ''
as $$
declare
    synced public.reading_question_progress;
begin
    if (select auth.uid()) is distinct from p_user_id then
        raise exception 'reading question progress owner mismatch' using errcode = '42501';
    end if;

    insert into public.reading_question_progress (
        user_id, question_id, points, attempts, correct_attempts,
        last_answered_at, due_at, revision, updated_at
    )
    values (
        p_user_id, p_question_id, p_points, p_attempts, p_correct_attempts,
        p_last_answered_at, p_due_at, 1, now()
    )
    on conflict (user_id, question_id) do update
    set points = excluded.points,
        attempts = excluded.attempts,
        correct_attempts = excluded.correct_attempts,
        last_answered_at = excluded.last_answered_at,
        due_at = excluded.due_at,
        revision = public.reading_question_progress.revision + 1,
        updated_at = now()
    where public.reading_question_progress.revision = p_expected_revision
    returning * into synced;

    if synced is null then
        raise exception 'reading question progress revision conflict' using errcode = '40001';
    end if;
    return synced;
end;
$$;

revoke all on function public.sync_reading_question_progress(
    uuid, uuid, smallint, integer, integer, timestamptz, timestamptz, integer
) from public, anon;
grant execute on function public.sync_reading_question_progress(
    uuid, uuid, smallint, integer, integer, timestamptz, timestamptz, integer
) to authenticated;

create or replace function public.sync_reading_skill_progress(
    p_user_id uuid,
    p_skill_id uuid,
    p_step smallint,
    p_interval_days integer,
    p_difficulty real,
    p_reps integer,
    p_lapses integer,
    p_state text,
    p_last_review_at timestamptz,
    p_due_at timestamptz,
    p_correct_attempts integer,
    p_total_attempts integer,
    p_expected_revision integer
)
returns public.reading_skill_progress
language plpgsql
security invoker
set search_path = ''
as $$
declare
    synced public.reading_skill_progress;
begin
    if (select auth.uid()) is distinct from p_user_id then
        raise exception 'reading skill progress owner mismatch' using errcode = '42501';
    end if;

    insert into public.reading_skill_progress (
        user_id, skill_id, step, interval_days, difficulty, reps, lapses,
        state, last_review_at, due_at, correct_attempts, total_attempts,
        revision, updated_at
    )
    values (
        p_user_id, p_skill_id, p_step, p_interval_days, p_difficulty, p_reps,
        p_lapses, p_state, p_last_review_at, p_due_at, p_correct_attempts,
        p_total_attempts, 1, now()
    )
    on conflict (user_id, skill_id) do update
    set step = excluded.step,
        interval_days = excluded.interval_days,
        difficulty = excluded.difficulty,
        reps = excluded.reps,
        lapses = excluded.lapses,
        state = excluded.state,
        last_review_at = excluded.last_review_at,
        due_at = excluded.due_at,
        correct_attempts = excluded.correct_attempts,
        total_attempts = excluded.total_attempts,
        revision = public.reading_skill_progress.revision + 1,
        updated_at = now()
    where public.reading_skill_progress.revision = p_expected_revision
    returning * into synced;

    if synced is null then
        raise exception 'reading skill progress revision conflict' using errcode = '40001';
    end if;
    return synced;
end;
$$;

revoke all on function public.sync_reading_skill_progress(
    uuid, uuid, smallint, integer, real, integer, integer, text,
    timestamptz, timestamptz, integer, integer, integer
) from public, anon;
grant execute on function public.sync_reading_skill_progress(
    uuid, uuid, smallint, integer, real, integer, integer, text,
    timestamptz, timestamptz, integer, integer, integer
) to authenticated;

create or replace function public.record_reading_exposure(
    p_user_id uuid,
    p_passage_id uuid,
    p_seen_at timestamptz,
    p_exposure_count integer
)
returns public.reading_passage_exposures
language plpgsql
security invoker
set search_path = ''
as $$
declare
    synced public.reading_passage_exposures;
begin
    if (select auth.uid()) is distinct from p_user_id then
        raise exception 'reading exposure owner mismatch' using errcode = '42501';
    end if;
    if p_exposure_count < 1 then
        raise exception 'reading exposure count must be positive' using errcode = '22023';
    end if;

    insert into public.reading_passage_exposures (
        user_id, passage_id, last_seen_at, exposure_count, updated_at
    )
    values (p_user_id, p_passage_id, p_seen_at, p_exposure_count, now())
    on conflict (user_id, passage_id) do update
    set last_seen_at = greatest(public.reading_passage_exposures.last_seen_at, excluded.last_seen_at),
        exposure_count = greatest(public.reading_passage_exposures.exposure_count, excluded.exposure_count),
        updated_at = now()
    returning * into synced;

    return synced;
end;
$$;

revoke all on function public.record_reading_exposure(uuid, uuid, timestamptz, integer)
    from public, anon;
grant execute on function public.record_reading_exposure(uuid, uuid, timestamptz, integer)
    to authenticated;

create or replace function public.insert_reading_attempt(
    p_id uuid,
    p_user_id uuid,
    p_question_id uuid,
    p_session_id uuid,
    p_selected_option_id text,
    p_is_correct boolean,
    p_grade smallint,
    p_previous_question_state jsonb,
    p_next_question_state jsonb,
    p_previous_skill_state jsonb,
    p_next_skill_state jsonb,
    p_response_ms integer,
    p_content_version integer,
    p_answered_at timestamptz
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
    inserted_count integer;
begin
    if (select auth.uid()) is distinct from p_user_id then
        raise exception 'reading attempt owner mismatch' using errcode = '42501';
    end if;

    insert into public.reading_attempts (
        id, user_id, question_id, session_id, selected_option_id, is_correct,
        grade, previous_question_state, next_question_state,
        previous_skill_state, next_skill_state, response_ms,
        content_version, answered_at
    )
    values (
        p_id, p_user_id, p_question_id, p_session_id, p_selected_option_id,
        p_is_correct, p_grade, p_previous_question_state,
        p_next_question_state, p_previous_skill_state, p_next_skill_state,
        p_response_ms, p_content_version, p_answered_at
    )
    on conflict (id) do nothing;

    get diagnostics inserted_count = row_count;
    return inserted_count = 1;
end;
$$;

revoke all on function public.insert_reading_attempt(
    uuid, uuid, uuid, uuid, text, boolean, smallint, jsonb, jsonb, jsonb,
    jsonb, integer, integer, timestamptz
) from public, anon;
grant execute on function public.insert_reading_attempt(
    uuid, uuid, uuid, uuid, text, boolean, smallint, jsonb, jsonb, jsonb,
    jsonb, integer, integer, timestamptz
) to authenticated;

-- The private rate-limit helper was introduced by the preceding hardening
-- migration. Limits are intentionally generous enough for offline catch-up.
create trigger reading_attempts_write_rate_limit
    before insert on public.reading_attempts
    for each row execute function private.enforce_write_rate_limit('reading_attempts', '300', '60');
create trigger reading_sessions_write_rate_limit
    before insert on public.reading_sessions
    for each row execute function private.enforce_write_rate_limit('reading_sessions', '60', '3600');
create trigger reading_question_progress_write_rate_limit
    before insert or update on public.reading_question_progress
    for each row execute function private.enforce_write_rate_limit('reading_question_progress', '300', '60');
create trigger reading_skill_progress_write_rate_limit
    before insert or update on public.reading_skill_progress
    for each row execute function private.enforce_write_rate_limit('reading_skill_progress', '300', '60');
