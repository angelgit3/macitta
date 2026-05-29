grant select, insert, update on public.user_exam_attempts to authenticated;
grant select, insert, update on public.user_question_answers to authenticated;

create policy "attempts_update_own"
    on public.user_exam_attempts
    for update
    to authenticated
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

create policy "answers_update_own_attempt"
    on public.user_question_answers
    for update
    to authenticated
    using (
        exists (
            select 1
            from public.user_exam_attempts a
            where a.id = user_question_answers.attempt_id
              and a.user_id = (select auth.uid())
        )
    )
    with check (
        exists (
            select 1
            from public.user_exam_attempts a
            where a.id = user_question_answers.attempt_id
              and a.user_id = (select auth.uid())
        )
    );
