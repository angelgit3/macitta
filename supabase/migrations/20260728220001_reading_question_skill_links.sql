-- Persist each question's primary taxonomy link. Secondary skill links can be
-- added later without changing the queue's canonical primary skill.
insert into public.reading_question_skills (question_id, skill_id, weight)
select id, primary_skill_id, 1
from public.reading_questions
where status = 'published' and content_version = 1
on conflict (question_id, skill_id) do update
set weight = excluded.weight;

do $reading_question_skill_assertion$
declare
    link_count integer;
begin
    select count(*) into link_count
    from public.reading_question_skills rqs
    join public.reading_questions rq on rq.id = rqs.question_id
    where rq.status = 'published' and rq.content_version = 1;

    if link_count < 250 then
        raise exception 'Expected at least 250 Reading question-skill links, found %', link_count;
    end if;
end;
$reading_question_skill_assertion$;
