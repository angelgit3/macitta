begin;

select set_config(
    'request.jwt.claims',
    json_build_object(
        'sub', (select id from auth.users order by created_at limit 1),
        'role', 'authenticated'
    )::text,
    true
);
set local role authenticated;

do $$
declare
    inserted integer := 0;
begin
    if (select auth.uid()) is null then
        raise exception 'security test could not establish an authenticated actor';
    end if;

    if exists (
        select 1
        from public.decks
        where author_id is not null
          and author_id <> (select auth.uid())
    ) then
        raise exception 'deck RLS exposed another owner';
    end if;

    if exists (
        select 1
        from public.grammar_user_progress
        where user_id <> (select auth.uid())
    ) then
        raise exception 'grammar progress RLS exposed another owner';
    end if;

    begin
        insert into public.decks (title, author_id)
        values ('RLS owner rejection test', gen_random_uuid());
        raise exception 'wrong-owner deck insert unexpectedly succeeded';
    exception
        when insufficient_privilege then null;
    end;

    begin
        perform public.increment_session_time(gen_random_uuid(), -1);
        raise exception 'negative session time unexpectedly succeeded';
    exception
        when invalid_parameter_value then null;
    end;

    begin
        perform public.sync_user_item(
            gen_random_uuid(),
            gen_random_uuid(),
            1,
            5,
            0,
            0,
            'new',
            null,
            now()
        );
        raise exception 'forged user item owner unexpectedly succeeded';
    exception
        when insufficient_privilege then null;
    end;

    for inserted in 1..30 loop
        insert into public.decks (title, author_id)
        values ('Rate limit verification ' || inserted, (select auth.uid()));
    end loop;

    begin
        insert into public.decks (title, author_id)
        values ('Rate limit must reject this row', (select auth.uid()));
        raise exception 'write rate limiter did not reject the 31st deck';
    exception
        when sqlstate 'PGRST' then null;
    end;
end;
$$;

rollback;
