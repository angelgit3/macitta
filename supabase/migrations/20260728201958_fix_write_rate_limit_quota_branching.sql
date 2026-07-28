-- PostgreSQL may reorder boolean expressions, so a trigger must never mention
-- a record field that does not exist on every table in a shared trigger
-- function. Keep table-specific NEW fields inside isolated CASE branches.
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

    case tg_table_name
        when 'decks' then
            if (
                select count(*) from public.decks
                where author_id = actor_id
            ) >= 100 then
                raise exception 'deck quota exceeded' using errcode = '23514';
            end if;
        when 'cards' then
            if (
                select count(*) from public.cards
                where deck_id = new.deck_id
            ) >= 5000 then
                raise exception 'card quota exceeded' using errcode = '23514';
            end if;
        when 'card_slots' then
            if (
                select count(*) from public.card_slots
                where card_id = new.card_id
            ) >= 8 then
                raise exception 'card slot quota exceeded' using errcode = '23514';
            end if;
        else
            null;
    end case;

    return new;
end;
$$;
