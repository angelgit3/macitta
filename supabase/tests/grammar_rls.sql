-- Transactional integration checks for Grammar RLS and idempotency.
-- Safe against the linked project: every mutation is rolled back.

begin;

do $setup$
begin
    if (select count(*) from auth.users) < 2 then
        raise exception 'Grammar RLS test requires at least two auth users';
    end if;
end;
$setup$;

select set_config(
    'test.grammar_user_1',
    (select id::text from auth.users order by created_at, id limit 1),
    true
);
select set_config(
    'test.grammar_user_2',
    (select id::text from auth.users order by created_at, id offset 1 limit 1),
    true
);
select set_config('test.grammar_session', gen_random_uuid()::text, true);
select set_config('test.grammar_attempt', gen_random_uuid()::text, true);
select set_config(
    'test.grammar_exercise',
    (select id::text from public.grammar_exercises where status = 'published' order by id limit 1),
    true
);
select set_config(
    'request.jwt.claims',
    json_build_object('sub', current_setting('test.grammar_user_1'), 'role', 'authenticated')::text,
    true
);

set local role authenticated;

insert into public.grammar_sessions (
    id, user_id, mode, status, started_at
)
values (
    current_setting('test.grammar_session')::uuid,
    current_setting('test.grammar_user_1')::uuid,
    'general',
    'active',
    now()
);

do $owner_write_checks$
declare
    inserted_first boolean;
    inserted_second boolean;
    synced_revision integer;
begin
    insert into public.grammar_user_progress (user_id, exercise_id)
    values (
        current_setting('test.grammar_user_1')::uuid,
        current_setting('test.grammar_exercise')::uuid
    );

    select revision
    into synced_revision
    from public.sync_grammar_progress(
        current_setting('test.grammar_user_1')::uuid,
        current_setting('test.grammar_exercise')::uuid,
        1::smallint,
        1,
        5,
        1,
        0,
        'learning',
        now(),
        now() + interval '1 day',
        now(),
        1,
        1,
        0
    );

    if synced_revision is distinct from 1 then
        raise exception 'Progress revision did not advance: %', synced_revision;
    end if;

    begin
        perform public.sync_grammar_progress(
            current_setting('test.grammar_user_1')::uuid,
            current_setting('test.grammar_exercise')::uuid,
            2::smallint,
            3,
            5,
            2,
            0,
            'review',
            now(),
            now() + interval '3 days',
            now(),
            2,
            2,
            0
        );
        raise exception 'Stale progress revision unexpectedly succeeded';
    exception
        when serialization_failure then null;
    end;

    select public.insert_grammar_attempt(
        current_setting('test.grammar_attempt')::uuid,
        current_setting('test.grammar_user_1')::uuid,
        current_setting('test.grammar_exercise')::uuid,
        current_setting('test.grammar_session')::uuid,
        'A',
        true,
        2::smallint,
        '{"step":0}'::jsonb,
        '{"step":1}'::jsonb,
        1500,
        true,
        1,
        now()
    ) into inserted_first;

    select public.insert_grammar_attempt(
        current_setting('test.grammar_attempt')::uuid,
        current_setting('test.grammar_user_1')::uuid,
        current_setting('test.grammar_exercise')::uuid,
        current_setting('test.grammar_session')::uuid,
        'A',
        true,
        2::smallint,
        '{"step":0}'::jsonb,
        '{"step":1}'::jsonb,
        1500,
        true,
        1,
        now()
    ) into inserted_second;

    if inserted_first is distinct from true or inserted_second is distinct from false then
        raise exception 'Attempt UUID idempotency failed: first %, second %', inserted_first, inserted_second;
    end if;

    begin
        insert into public.grammar_user_progress (user_id, exercise_id)
        values (
            current_setting('test.grammar_user_2')::uuid,
            current_setting('test.grammar_exercise')::uuid
        );
        raise exception 'Cross-user progress insert unexpectedly succeeded';
    exception
        when insufficient_privilege then null;
    end;

    begin
        update public.grammar_exercises
        set explanation_es = explanation_es
        where id = current_setting('test.grammar_exercise')::uuid;
        raise exception 'Authenticated catalog update unexpectedly succeeded';
    exception
        when insufficient_privilege then null;
    end;
end;
$owner_write_checks$;

select set_config(
    'request.jwt.claims',
    json_build_object('sub', current_setting('test.grammar_user_2'), 'role', 'authenticated')::text,
    true
);

do $isolation_read_check$
begin
    if exists (
        select 1
        from public.grammar_user_progress
        where user_id = current_setting('test.grammar_user_1')::uuid
    ) then
        raise exception 'Cross-user progress read unexpectedly returned a row';
    end if;
end;
$isolation_read_check$;

rollback;
