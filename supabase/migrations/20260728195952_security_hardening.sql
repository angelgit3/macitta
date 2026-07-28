-- Defense in depth for the public Data API, high-volume writes and legacy
-- objects created before explicit grants were adopted.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- SECURITY DEFINER helpers do not belong in the exposed public schema. Moving
-- the function preserves the trigger reference because Postgres tracks its OID.
alter function public.handle_new_user() set schema private;
revoke all on function private.handle_new_user() from public, anon, authenticated;

-- New migration-owned objects are private by default. Platform-owned defaults
-- may still be broad, so every migration must continue granting explicitly.
alter default privileges for role postgres in schema public
    revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public
    revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public
    revoke execute on functions from public, anon, authenticated;

-- Remove dangerous legacy capabilities (including TRUNCATE/TRIGGER) and expose
-- only the operations used by the application.
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

grant select, insert, update, delete on public.decks to authenticated;
grant select, insert, update, delete on public.cards to authenticated;
grant select, insert, update, delete on public.card_slots to authenticated;
grant select on public.exams, public.questions, public.verbs to authenticated;
grant select, insert on public.feedback, public.study_logs to authenticated;
grant select, insert, update on
    public.profiles,
    public.study_sessions,
    public.user_exam_attempts,
    public.user_progress,
    public.user_question_answers
to authenticated;
grant select, insert, update, delete on
    public.srem_inbox,
    public.user_items
to authenticated;
grant select on
    public.grammar_domains,
    public.grammar_skills,
    public.grammar_exercises,
    public.grammar_exercise_skills
to authenticated;
grant select, insert, update on
    public.grammar_user_progress,
    public.grammar_sessions
to authenticated;
grant select, insert on public.grammar_attempts to authenticated;

revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function public.increment_session_time(uuid, integer) to authenticated;
grant execute on function public.sync_user_item(
    uuid, uuid, real, real, integer, integer, text, timestamptz, timestamptz
) to authenticated;
grant execute on function public.sync_grammar_progress(
    uuid, uuid, smallint, integer, real, integer, integer, text,
    timestamptz, timestamptz, timestamptz, integer, integer, integer
) to authenticated;
grant execute on function public.insert_grammar_attempt(
    uuid, uuid, uuid, uuid, text, boolean, smallint, jsonb, jsonb,
    integer, boolean, integer, timestamptz
) to authenticated;

-- Bound attacker-controlled content at the database boundary, including direct
-- Data API requests that never pass through the Next.js validators.
alter table public.decks
    add constraint decks_title_size_check
        check (length(btrim(title)) between 1 and 120),
    add constraint decks_description_size_check
        check (description is null or length(description) <= 2000),
    add constraint decks_color_size_check
        check (color is null or length(color) <= 32),
    add constraint decks_question_labels_size_check
        check (
            question_labels is null or (
                cardinality(question_labels) between 0 and 8
                and pg_column_size(question_labels) <= 4096
            )
        ),
    add constraint decks_answer_labels_size_check
        check (
            answer_labels is null or (
                cardinality(answer_labels) between 0 and 8
                and pg_column_size(answer_labels) <= 4096
            )
        );

alter table public.cards
    add constraint cards_front_text_size_check
        check (length(btrim(front_text)) between 1 and 4000),
    add constraint cards_front_media_size_check
        check (front_media is null or pg_column_size(front_media) <= 16384);

alter table public.card_slots
    add constraint card_slots_label_size_check
        check (length(btrim(label)) between 1 and 80),
    add constraint card_slots_answers_size_check
        check (
            cardinality(accepted_answers) <= 20
            and pg_column_size(accepted_answers) <= 16384
        ),
    add constraint card_slots_order_index_bounds_check
        check (order_index between 0 and 31),
    add constraint card_slots_advanced_rules_size_check
        check (advanced_rules is null or pg_column_size(advanced_rules) <= 32768),
    add constraint card_slots_media_size_check
        check (media is null or pg_column_size(media) <= 16384);

alter table public.feedback
    add constraint feedback_message_size_check
        check (length(btrim(message)) between 1 and 4000);

alter table public.profiles
    add constraint profiles_username_format_check
        check (
            username is null or (
                length(btrim(username)) between 3 and 32
                and username !~ '[[:cntrl:]]'
            )
        ),
    add constraint profiles_full_name_size_check
        check (full_name is null or length(full_name) <= 120),
    add constraint profiles_avatar_url_size_check
        check (
            avatar_url is null or (
                length(avatar_url) <= 2048
                and avatar_url ~ '^https://'
            )
        ),
    add constraint profiles_email_size_check
        check (email is null or length(email) <= 320),
    add constraint profiles_daily_goal_bounds_check
        check (daily_goal is null or daily_goal between 1 and 500),
    add constraint profiles_streak_bounds_check
        check (streak_current is null or streak_current between 0 and 100000);

alter table public.srem_inbox
    add constraint srem_inbox_word_size_check
        check (length(btrim(word)) between 1 and 200),
    add constraint srem_inbox_context_size_check
        check (length(context) <= 4000);

alter table public.study_logs
    add constraint study_logs_grade_bounds_check
        check (grade between 0 and 3),
    add constraint study_logs_time_bounds_check
        check (time_taken_ms between 0 and 86400000),
    add constraint study_logs_accuracy_bounds_check
        check (accuracy between 0 and 1);

alter table public.study_sessions
    add constraint study_sessions_counts_bounds_check
        check (
            coalesce(total_cards, 0) >= 0
            and coalesce(correct_cards, 0) >= 0
            and coalesce(correct_cards, 0) <= coalesce(total_cards, 0)
        ),
    add constraint study_sessions_time_bounds_check
        check (coalesce(total_time_ms, 0) between 0 and 604800000),
    add constraint study_sessions_time_order_check
        check (ended_at is null or started_at is null or ended_at >= started_at);

alter table public.user_items
    add constraint user_items_stability_bounds_check
        check (stability is null or stability between 0 and 3650),
    add constraint user_items_difficulty_bounds_check
        check (difficulty is null or difficulty between 1 and 10),
    add constraint user_items_reps_bounds_check
        check (reps is null or reps between 0 and 100000),
    add constraint user_items_lapses_bounds_check
        check (lapses is null or lapses between 0 and 100000),
    add constraint user_items_state_check
        check (state is null or state in ('new', 'learning', 'review', 'mastered'));

alter table public.grammar_attempts
    add constraint grammar_attempts_previous_state_size_check
        check (pg_column_size(previous_state) <= 8192),
    add constraint grammar_attempts_next_state_size_check
        check (pg_column_size(next_state) <= 8192),
    add constraint grammar_attempts_response_upper_bound_check
        check (response_ms <= 86400000);

-- Foreign-key and hot-path indexes remove avoidable sequential scans under load.
create index if not exists decks_author_id_idx
    on public.decks (author_id);
create index if not exists user_progress_verb_id_idx
    on public.user_progress (verb_id);
create index if not exists user_question_answers_question_id_idx
    on public.user_question_answers (question_id);
create index if not exists user_items_user_due_idx
    on public.user_items (user_id, due_date);
create index if not exists feedback_user_created_idx
    on public.feedback (user_id, created_at desc);

-- Replace per-row auth.uid() calls and duplicate permissive deck SELECT policies.
drop policy if exists "Decks are viewable by author" on public.decks;
drop policy if exists "Decks are viewable by everyone if global" on public.decks;
drop policy if exists "Decks can be inserted by authenticated users" on public.decks;
drop policy if exists "Decks can be updated by author" on public.decks;
drop policy if exists "Decks can be deleted by author" on public.decks;

create policy decks_select_authenticated
    on public.decks for select to authenticated
    using (author_id is null or author_id = (select auth.uid()));
create policy decks_insert_author
    on public.decks for insert to authenticated
    with check (author_id = (select auth.uid()));
create policy decks_update_author
    on public.decks for update to authenticated
    using (author_id = (select auth.uid()))
    with check (author_id = (select auth.uid()));
create policy decks_delete_author
    on public.decks for delete to authenticated
    using (author_id = (select auth.uid()));

drop policy if exists cards_insert_author on public.cards;
drop policy if exists cards_update_author on public.cards;
drop policy if exists cards_delete_author on public.cards;
create policy cards_insert_author
    on public.cards for insert to authenticated
    with check (
        exists (
            select 1 from public.decks
            where decks.id = cards.deck_id
              and decks.author_id = (select auth.uid())
        )
    );
create policy cards_update_author
    on public.cards for update to authenticated
    using (
        exists (
            select 1 from public.decks
            where decks.id = cards.deck_id
              and decks.author_id = (select auth.uid())
        )
    )
    with check (
        exists (
            select 1 from public.decks
            where decks.id = cards.deck_id
              and decks.author_id = (select auth.uid())
        )
    );
create policy cards_delete_author
    on public.cards for delete to authenticated
    using (
        exists (
            select 1 from public.decks
            where decks.id = cards.deck_id
              and decks.author_id = (select auth.uid())
        )
    );

drop policy if exists card_slots_insert_author on public.card_slots;
drop policy if exists card_slots_update_author on public.card_slots;
drop policy if exists card_slots_delete_author on public.card_slots;
create policy card_slots_insert_author
    on public.card_slots for insert to authenticated
    with check (
        exists (
            select 1
            from public.cards
            join public.decks on decks.id = cards.deck_id
            where cards.id = card_slots.card_id
              and decks.author_id = (select auth.uid())
        )
    );
create policy card_slots_update_author
    on public.card_slots for update to authenticated
    using (
        exists (
            select 1
            from public.cards
            join public.decks on decks.id = cards.deck_id
            where cards.id = card_slots.card_id
              and decks.author_id = (select auth.uid())
        )
    )
    with check (
        exists (
            select 1
            from public.cards
            join public.decks on decks.id = cards.deck_id
            where cards.id = card_slots.card_id
              and decks.author_id = (select auth.uid())
        )
    );
create policy card_slots_delete_author
    on public.card_slots for delete to authenticated
    using (
        exists (
            select 1
            from public.cards
            join public.decks on decks.id = cards.deck_id
            where cards.id = card_slots.card_id
              and decks.author_id = (select auth.uid())
        )
    );

-- Harden RPCs against forged ownership, negative counters and unbounded work.
create or replace function public.increment_session_time(s_id uuid, time_ms integer)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
    if time_ms is null or time_ms < 0 or time_ms > 3600000 then
        raise exception 'invalid session time increment' using errcode = '22023';
    end if;

    update public.study_sessions
    set total_time_ms = coalesce(total_time_ms, 0) + time_ms
    where id = s_id
      and user_id = (select auth.uid());

    if not found then
        raise exception 'session not found' using errcode = '42501';
    end if;
end;
$$;

create or replace function public.sync_user_item(
    p_user_id uuid,
    p_card_id uuid,
    p_stability real,
    p_difficulty real,
    p_reps integer,
    p_lapses integer,
    p_state text,
    p_last_review timestamptz,
    p_due_date timestamptz
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
    if (select auth.uid()) is distinct from p_user_id then
        raise exception 'user item owner mismatch' using errcode = '42501';
    end if;
    if p_stability not between 0 and 3650
        or p_difficulty not between 1 and 10
        or p_reps not between 0 and 100000
        or p_lapses not between 0 and 100000
        or p_state not in ('new', 'learning', 'review', 'mastered')
        or p_due_date is null
    then
        raise exception 'invalid user item state' using errcode = '22023';
    end if;

    insert into public.user_items (
        user_id, card_id, stability, difficulty, reps, lapses,
        state, last_review, due_date
    )
    values (
        p_user_id, p_card_id, p_stability, p_difficulty, p_reps, p_lapses,
        p_state, p_last_review, p_due_date
    )
    on conflict (user_id, card_id) do update
    set stability = excluded.stability,
        difficulty = excluded.difficulty,
        reps = excluded.reps,
        lapses = excluded.lapses,
        state = excluded.state,
        last_review = excluded.last_review,
        due_date = excluded.due_date
    where public.user_items.last_review is null
       or public.user_items.last_review < excluded.last_review;
end;
$$;

revoke execute on function public.increment_session_time(uuid, integer)
    from public, anon;
revoke execute on function public.sync_user_item(
    uuid, uuid, real, real, integer, integer, text, timestamptz, timestamptz
) from public, anon;
grant execute on function public.increment_session_time(uuid, integer)
    to authenticated;
grant execute on function public.sync_user_item(
    uuid, uuid, real, real, integer, integer, text, timestamptz, timestamptz
) to authenticated;

-- A fixed-size per-user bucket prevents an authenticated client from turning
-- the public anon key into unbounded row creation. The table remains outside
-- the exposed API and grows only by users × protected buckets.
create table private.write_rate_limits (
    user_id uuid not null references auth.users(id) on delete cascade,
    bucket text not null,
    window_started_at timestamptz not null,
    write_count integer not null check (write_count > 0),
    primary key (user_id, bucket)
);
alter table private.write_rate_limits enable row level security;
revoke all on private.write_rate_limits from public, anon, authenticated;

create or replace function private.enforce_write_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    actor_id uuid := (select auth.uid());
    subject_id uuid;
    bucket_name text := tg_argv[0];
    maximum_writes integer := tg_argv[1]::integer;
    window_seconds integer := tg_argv[2]::integer;
    current_count integer;
begin
    -- Administrative migrations and service operations do not carry an end-user
    -- auth.uid(); their own credentials and network controls remain responsible.
    if actor_id is null then
        return new;
    end if;

    case tg_table_name
        when 'decks' then subject_id := new.author_id;
        when 'cards' then
            select author_id into subject_id
            from public.decks where id = new.deck_id;
        when 'card_slots' then
            select decks.author_id into subject_id
            from public.cards
            join public.decks on decks.id = cards.deck_id
            where cards.id = new.card_id;
        when 'user_question_answers' then
            select user_id into subject_id
            from public.user_exam_attempts where id = new.attempt_id;
        else
            subject_id := (to_jsonb(new) ->> 'user_id')::uuid;
    end case;

    if subject_id is distinct from actor_id then
        raise exception 'write owner mismatch' using errcode = '42501';
    end if;

    insert into private.write_rate_limits (
        user_id, bucket, window_started_at, write_count
    )
    values (actor_id, bucket_name, clock_timestamp(), 1)
    on conflict (user_id, bucket) do update
    set window_started_at = case
            when private.write_rate_limits.window_started_at
                <= clock_timestamp() - make_interval(secs => window_seconds)
            then clock_timestamp()
            else private.write_rate_limits.window_started_at
        end,
        write_count = case
            when private.write_rate_limits.window_started_at
                <= clock_timestamp() - make_interval(secs => window_seconds)
            then 1
            else private.write_rate_limits.write_count + 1
        end
    returning write_count into current_count;

    if current_count > maximum_writes then
        raise sqlstate 'PGRST' using
            message = json_build_object(
                'code', 'rate_limit_exceeded',
                'message', 'Too many writes. Retry later.',
                'details', null,
                'hint', null
            )::text,
            detail = json_build_object(
                'status', 429,
                'headers', json_build_object(
                    'Retry-After', greatest(1, window_seconds)::text
                )
            )::text;
    end if;

    -- Permanent quotas complement the time-window limiter. Because updating
    -- the bucket row above serializes writes per user and bucket, concurrent
    -- requests cannot race past these limits.
    if tg_table_name = 'decks'
       and (
           select count(*) from public.decks
           where author_id = actor_id
       ) >= 100
    then
        raise exception 'deck quota exceeded' using errcode = '23514';
    elsif tg_table_name = 'cards'
       and (
           select count(*) from public.cards
           where deck_id = new.deck_id
       ) >= 5000
    then
        raise exception 'card quota exceeded' using errcode = '23514';
    elsif tg_table_name = 'card_slots'
       and (
           select count(*) from public.card_slots
           where card_id = new.card_id
       ) >= 8
    then
        raise exception 'card slot quota exceeded' using errcode = '23514';
    end if;

    return new;
end;
$$;
revoke all on function private.enforce_write_rate_limit()
    from public, anon, authenticated;

create trigger decks_write_rate_limit
    before insert on public.decks
    for each row execute function private.enforce_write_rate_limit('decks', '30', '3600');
create trigger cards_write_rate_limit
    before insert on public.cards
    for each row execute function private.enforce_write_rate_limit('cards', '1000', '3600');
create trigger card_slots_write_rate_limit
    before insert on public.card_slots
    for each row execute function private.enforce_write_rate_limit('card_slots', '5000', '3600');
create trigger feedback_write_rate_limit
    before insert on public.feedback
    for each row execute function private.enforce_write_rate_limit('feedback', '10', '3600');
create trigger grammar_attempts_write_rate_limit
    before insert on public.grammar_attempts
    for each row execute function private.enforce_write_rate_limit('grammar_attempts', '300', '60');
create trigger grammar_sessions_write_rate_limit
    before insert on public.grammar_sessions
    for each row execute function private.enforce_write_rate_limit('grammar_sessions', '60', '3600');
create trigger grammar_progress_write_rate_limit
    before insert on public.grammar_user_progress
    for each row execute function private.enforce_write_rate_limit('grammar_progress', '300', '60');
create trigger srem_inbox_write_rate_limit
    before insert on public.srem_inbox
    for each row execute function private.enforce_write_rate_limit('srem_inbox', '200', '3600');
create trigger study_logs_write_rate_limit
    before insert on public.study_logs
    for each row execute function private.enforce_write_rate_limit('study_logs', '600', '60');
create trigger study_sessions_write_rate_limit
    before insert on public.study_sessions
    for each row execute function private.enforce_write_rate_limit('study_sessions', '120', '3600');
create trigger exam_attempts_write_rate_limit
    before insert on public.user_exam_attempts
    for each row execute function private.enforce_write_rate_limit('exam_attempts', '60', '3600');
create trigger user_items_write_rate_limit
    before insert on public.user_items
    for each row execute function private.enforce_write_rate_limit('user_items', '1000', '60');
create trigger user_progress_write_rate_limit
    before insert on public.user_progress
    for each row execute function private.enforce_write_rate_limit('user_progress', '1000', '60');
create trigger question_answers_write_rate_limit
    before insert on public.user_question_answers
    for each row execute function private.enforce_write_rate_limit('question_answers', '1000', '3600');
