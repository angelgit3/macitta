-- Grammar micro-practice for TOEFL ITP Structure and Written Expression.
-- Kept separate from the legacy full-test tables so historical attempts remain
-- stable while the new adaptive experience evolves.

create table public.grammar_domains (
    id uuid primary key default gen_random_uuid(),
    code text not null unique,
    name_es text not null,
    order_index smallint not null unique check (order_index > 0),
    created_at timestamptz not null default now()
);

create table public.grammar_skills (
    id uuid primary key default gen_random_uuid(),
    domain_id uuid not null references public.grammar_domains(id) on delete restrict,
    code text not null unique,
    name_es text not null,
    description_es text not null,
    cefr_min text not null check (cefr_min in ('A2', 'B1', 'B2', 'C1')),
    order_index smallint not null check (order_index > 0),
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    unique (domain_id, order_index)
);

create index grammar_skills_domain_id_idx
    on public.grammar_skills (domain_id);

create table public.grammar_exercises (
    id uuid primary key default gen_random_uuid(),
    primary_skill_id uuid not null references public.grammar_skills(id) on delete restrict,
    format text not null check (format in ('sentence_completion', 'error_identification')),
    cefr_band text not null check (cefr_band in ('A2', 'B1', 'B2', 'C1')),
    difficulty smallint not null check (difficulty between 1 and 3),
    prompt jsonb not null check (jsonb_typeof(prompt) = 'object'),
    correct_option_id text not null check (correct_option_id in ('A', 'B', 'C', 'D')),
    corrected_sentence text not null check (length(btrim(corrected_sentence)) > 0),
    explanation_es text not null check (length(btrim(explanation_es)) >= 24),
    status text not null default 'draft' check (status in ('draft', 'review', 'published', 'retired')),
    content_version integer not null default 1 check (content_version > 0),
    source_note text,
    linguistic_reviewed boolean not null default false,
    fairness_reviewed boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint grammar_exercises_prompt_kind_check
        check (prompt ->> 'kind' = format),
    constraint grammar_exercises_published_reviews_check
        check (
            status <> 'published'
            or (linguistic_reviewed and fairness_reviewed)
        ),
    constraint grammar_exercises_prompt_shape_check
        check (
            (
                format = 'sentence_completion'
                and jsonb_typeof(prompt -> 'before') = 'string'
                and jsonb_typeof(prompt -> 'after') = 'string'
                and jsonb_typeof(prompt -> 'options') = 'array'
                and jsonb_array_length(prompt -> 'options') = 4
            )
            or
            (
                format = 'error_identification'
                and jsonb_typeof(prompt -> 'segments') = 'array'
                and jsonb_array_length(prompt -> 'segments') >= 4
            )
        )
);

create index grammar_exercises_primary_skill_id_idx
    on public.grammar_exercises (primary_skill_id);
create index grammar_exercises_published_skill_idx
    on public.grammar_exercises (primary_skill_id, format)
    where status = 'published';

create table public.grammar_exercise_skills (
    exercise_id uuid not null references public.grammar_exercises(id) on delete cascade,
    skill_id uuid not null references public.grammar_skills(id) on delete restrict,
    weight real not null default 0.5 check (weight > 0 and weight <= 1),
    primary key (exercise_id, skill_id)
);

create index grammar_exercise_skills_skill_id_idx
    on public.grammar_exercise_skills (skill_id);

create table public.grammar_user_progress (
    user_id uuid not null references auth.users(id) on delete cascade,
    exercise_id uuid not null references public.grammar_exercises(id) on delete cascade,
    step smallint not null default 0 check (step between 0 and 8),
    interval_days integer not null default 0 check (interval_days >= 0),
    difficulty real not null default 5 check (difficulty between 1 and 10),
    reps integer not null default 0 check (reps >= 0),
    lapses integer not null default 0 check (lapses >= 0),
    state text not null default 'new' check (state in ('new', 'learning', 'review', 'mastered')),
    last_review_at timestamptz,
    due_at timestamptz not null default now(),
    first_seen_at timestamptz,
    correct_attempts integer not null default 0 check (correct_attempts >= 0),
    total_attempts integer not null default 0 check (total_attempts >= 0),
    revision integer not null default 0 check (revision >= 0),
    updated_at timestamptz not null default now(),
    primary key (user_id, exercise_id),
    constraint grammar_progress_attempt_counts_check
        check (correct_attempts <= total_attempts)
);

create index grammar_user_progress_user_due_idx
    on public.grammar_user_progress (user_id, due_at);
create index grammar_user_progress_exercise_id_idx
    on public.grammar_user_progress (exercise_id);

create table public.grammar_sessions (
    id uuid primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    mode text not null default 'general' check (mode in ('general', 'focused')),
    focused_skill_id uuid references public.grammar_skills(id) on delete set null,
    status text not null default 'active' check (status in ('active', 'completed', 'abandoned')),
    started_at timestamptz not null,
    ended_at timestamptz,
    total_exercises smallint not null default 0 check (total_exercises between 0 and 5),
    correct_exercises smallint not null default 0 check (correct_exercises between 0 and 5),
    total_time_ms integer not null default 0 check (total_time_ms >= 0),
    created_at timestamptz not null default now(),
    constraint grammar_sessions_counts_check
        check (correct_exercises <= total_exercises),
    constraint grammar_sessions_time_order_check
        check (ended_at is null or ended_at >= started_at)
);

create index grammar_sessions_user_started_idx
    on public.grammar_sessions (user_id, started_at desc);
create index grammar_sessions_focused_skill_id_idx
    on public.grammar_sessions (focused_skill_id);

create table public.grammar_attempts (
    id uuid primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    exercise_id uuid not null references public.grammar_exercises(id) on delete restrict,
    session_id uuid not null references public.grammar_sessions(id) on delete restrict,
    selected_option_id text not null check (selected_option_id in ('A', 'B', 'C', 'D')),
    is_correct boolean not null,
    grade smallint not null check (grade in (0, 2)),
    previous_state jsonb not null check (jsonb_typeof(previous_state) = 'object'),
    next_state jsonb not null check (jsonb_typeof(next_state) = 'object'),
    response_ms integer not null check (response_ms >= 0),
    was_due boolean not null,
    content_version integer not null check (content_version > 0),
    reviewed_at timestamptz not null,
    recorded_at timestamptz not null default now()
);

create index grammar_attempts_user_reviewed_idx
    on public.grammar_attempts (user_id, reviewed_at desc);
create index grammar_attempts_exercise_id_idx
    on public.grammar_attempts (exercise_id);
create index grammar_attempts_session_id_idx
    on public.grammar_attempts (session_id);

-- Catalogs are readable by signed-in learners and immutable from the browser.
alter table public.grammar_domains enable row level security;
alter table public.grammar_skills enable row level security;
alter table public.grammar_exercises enable row level security;
alter table public.grammar_exercise_skills enable row level security;
alter table public.grammar_user_progress enable row level security;
alter table public.grammar_sessions enable row level security;
alter table public.grammar_attempts enable row level security;

create policy "Authenticated users read grammar domains"
    on public.grammar_domains for select to authenticated using (true);
create policy "Authenticated users read grammar skills"
    on public.grammar_skills for select to authenticated using (true);
create policy "Authenticated users read grammar exercises"
    on public.grammar_exercises for select to authenticated
    using (status in ('published', 'retired'));
create policy "Authenticated users read grammar exercise skills"
    on public.grammar_exercise_skills for select to authenticated using (true);

create policy "Users read own grammar progress"
    on public.grammar_user_progress for select to authenticated
    using ((select auth.uid()) = user_id);
create policy "Users insert own grammar progress"
    on public.grammar_user_progress for insert to authenticated
    with check ((select auth.uid()) = user_id);
create policy "Users update own grammar progress"
    on public.grammar_user_progress for update to authenticated
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

create policy "Users read own grammar sessions"
    on public.grammar_sessions for select to authenticated
    using ((select auth.uid()) = user_id);
create policy "Users insert own grammar sessions"
    on public.grammar_sessions for insert to authenticated
    with check ((select auth.uid()) = user_id);
create policy "Users update own grammar sessions"
    on public.grammar_sessions for update to authenticated
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

create policy "Users read own grammar attempts"
    on public.grammar_attempts for select to authenticated
    using ((select auth.uid()) = user_id);
create policy "Users insert own grammar attempts"
    on public.grammar_attempts for insert to authenticated
    with check (
        (select auth.uid()) = user_id
        and exists (
            select 1
            from public.grammar_sessions
            where grammar_sessions.id = grammar_attempts.session_id
              and grammar_sessions.user_id = (select auth.uid())
        )
    );

revoke all on public.grammar_domains from anon, authenticated;
revoke all on public.grammar_skills from anon, authenticated;
revoke all on public.grammar_exercises from anon, authenticated;
revoke all on public.grammar_exercise_skills from anon, authenticated;
revoke all on public.grammar_user_progress from anon, authenticated;
revoke all on public.grammar_sessions from anon, authenticated;
revoke all on public.grammar_attempts from anon, authenticated;

grant select on public.grammar_domains to authenticated;
grant select on public.grammar_skills to authenticated;
grant select on public.grammar_exercises to authenticated;
grant select on public.grammar_exercise_skills to authenticated;
grant select, insert, update on public.grammar_user_progress to authenticated;
grant select, insert, update on public.grammar_sessions to authenticated;
grant select, insert on public.grammar_attempts to authenticated;

-- Optimistic concurrency prevents an offline device from silently replacing
-- newer progress from another device.
create or replace function public.sync_grammar_progress(
    p_user_id uuid,
    p_exercise_id uuid,
    p_step smallint,
    p_interval_days integer,
    p_difficulty real,
    p_reps integer,
    p_lapses integer,
    p_state text,
    p_last_review_at timestamptz,
    p_due_at timestamptz,
    p_first_seen_at timestamptz,
    p_correct_attempts integer,
    p_total_attempts integer,
    p_expected_revision integer
)
returns public.grammar_user_progress
language plpgsql
security invoker
set search_path = ''
as $$
declare
    synced public.grammar_user_progress;
begin
    if (select auth.uid()) is distinct from p_user_id then
        raise exception 'grammar progress owner mismatch' using errcode = '42501';
    end if;

    insert into public.grammar_user_progress (
        user_id, exercise_id, step, interval_days, difficulty, reps, lapses,
        state, last_review_at, due_at, first_seen_at, correct_attempts,
        total_attempts, revision, updated_at
    )
    values (
        p_user_id, p_exercise_id, p_step, p_interval_days, p_difficulty,
        p_reps, p_lapses, p_state, p_last_review_at, p_due_at,
        p_first_seen_at, p_correct_attempts, p_total_attempts, 1, now()
    )
    on conflict (user_id, exercise_id) do update
    set step = excluded.step,
        interval_days = excluded.interval_days,
        difficulty = excluded.difficulty,
        reps = excluded.reps,
        lapses = excluded.lapses,
        state = excluded.state,
        last_review_at = excluded.last_review_at,
        due_at = excluded.due_at,
        first_seen_at = coalesce(public.grammar_user_progress.first_seen_at, excluded.first_seen_at),
        correct_attempts = excluded.correct_attempts,
        total_attempts = excluded.total_attempts,
        revision = public.grammar_user_progress.revision + 1,
        updated_at = now()
    where public.grammar_user_progress.revision = p_expected_revision
    returning * into synced;

    if synced is null then
        raise exception 'grammar progress revision conflict' using errcode = '40001';
    end if;
    return synced;
end;
$$;

revoke all on function public.sync_grammar_progress(
    uuid, uuid, smallint, integer, real, integer, integer, text,
    timestamptz, timestamptz, timestamptz, integer, integer, integer
) from public, anon;
grant execute on function public.sync_grammar_progress(
    uuid, uuid, smallint, integer, real, integer, integer, text,
    timestamptz, timestamptz, timestamptz, integer, integer, integer
) to authenticated;

-- Stable attempt IDs make retries idempotent. The function reports whether
-- this call inserted the event or merely encountered the existing UUID.
create or replace function public.insert_grammar_attempt(
    p_id uuid,
    p_user_id uuid,
    p_exercise_id uuid,
    p_session_id uuid,
    p_selected_option_id text,
    p_is_correct boolean,
    p_grade smallint,
    p_previous_state jsonb,
    p_next_state jsonb,
    p_response_ms integer,
    p_was_due boolean,
    p_content_version integer,
    p_reviewed_at timestamptz
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
        raise exception 'grammar attempt owner mismatch' using errcode = '42501';
    end if;

    insert into public.grammar_attempts (
        id, user_id, exercise_id, session_id, selected_option_id, is_correct,
        grade, previous_state, next_state, response_ms, was_due,
        content_version, reviewed_at
    )
    values (
        p_id, p_user_id, p_exercise_id, p_session_id, p_selected_option_id,
        p_is_correct, p_grade, p_previous_state, p_next_state, p_response_ms,
        p_was_due, p_content_version, p_reviewed_at
    )
    on conflict (id) do nothing;

    get diagnostics inserted_count = row_count;
    return inserted_count = 1;
end;
$$;

revoke all on function public.insert_grammar_attempt(
    uuid, uuid, uuid, uuid, text, boolean, smallint, jsonb, jsonb,
    integer, boolean, integer, timestamptz
) from public, anon;
grant execute on function public.insert_grammar_attempt(
    uuid, uuid, uuid, uuid, text, boolean, smallint, jsonb, jsonb,
    integer, boolean, integer, timestamptz
) to authenticated;
