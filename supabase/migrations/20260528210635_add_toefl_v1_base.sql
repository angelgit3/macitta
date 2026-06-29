create table if not exists public.exams (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    section text not null check (section in ('reading', 'listening', 'grammar')),
    type text not null,
    passage_text text,
    audio_path text,
    transcript text,
    scale_mapping jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);
create table if not exists public.questions (
    id uuid primary key default gen_random_uuid(),
    exam_id uuid not null references public.exams(id) on delete cascade,
    question_text text not null,
    options jsonb not null,
    correct_option_id text not null,
    order_index integer not null default 0,
    points_weight integer not null default 1 check (points_weight > 0),
    explanation text not null default '',
    created_at timestamptz not null default now()
);
create table if not exists public.user_exam_attempts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    exam_id uuid not null references public.exams(id) on delete cascade,
    raw_score integer not null default 0,
    scaled_score integer not null default 0 check (scaled_score between 0 and 30),
    time_taken integer not null default 0 check (time_taken >= 0),
    mode text not null default 'flexible' check (mode in ('strict', 'flexible')),
    completed_at timestamptz not null default now()
);
create table if not exists public.user_question_answers (
    attempt_id uuid not null references public.user_exam_attempts(id) on delete cascade,
    question_id uuid not null references public.questions(id) on delete cascade,
    user_choice text,
    is_correct boolean not null default false,
    primary key (attempt_id, question_id)
);
create table if not exists public.srem_inbox (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    word text not null,
    context text not null default '',
    created_at timestamptz not null default now()
);
create index if not exists idx_questions_exam_id on public.questions(exam_id);
create unique index if not exists idx_questions_exam_order on public.questions(exam_id, order_index);
create index if not exists idx_user_exam_attempts_user_id on public.user_exam_attempts(user_id);
create index if not exists idx_user_exam_attempts_exam_id on public.user_exam_attempts(exam_id);
create index if not exists idx_user_question_answers_attempt_id on public.user_question_answers(attempt_id);
create index if not exists idx_srem_inbox_user_id on public.srem_inbox(user_id);
alter table public.exams enable row level security;
alter table public.questions enable row level security;
alter table public.user_exam_attempts enable row level security;
alter table public.user_question_answers enable row level security;
alter table public.srem_inbox enable row level security;
grant select on public.exams to authenticated;
grant select on public.questions to authenticated;
grant select, insert on public.user_exam_attempts to authenticated;
grant select, insert on public.user_question_answers to authenticated;
grant select, insert, update, delete on public.srem_inbox to authenticated;
create policy "exams_select_authenticated"
    on public.exams
    for select
    to authenticated
    using (true);
create policy "questions_select_authenticated"
    on public.questions
    for select
    to authenticated
    using (true);
create policy "attempts_select_own"
    on public.user_exam_attempts
    for select
    to authenticated
    using ((select auth.uid()) = user_id);
create policy "attempts_insert_own"
    on public.user_exam_attempts
    for insert
    to authenticated
    with check ((select auth.uid()) = user_id);
create policy "answers_select_own_attempt"
    on public.user_question_answers
    for select
    to authenticated
    using (
        exists (
            select 1
            from public.user_exam_attempts a
            where a.id = user_question_answers.attempt_id
              and a.user_id = (select auth.uid())
        )
    );
create policy "answers_insert_own_attempt"
    on public.user_question_answers
    for insert
    to authenticated
    with check (
        exists (
            select 1
            from public.user_exam_attempts a
            where a.id = user_question_answers.attempt_id
              and a.user_id = (select auth.uid())
        )
    );
create policy "srem_inbox_select_own"
    on public.srem_inbox
    for select
    to authenticated
    using ((select auth.uid()) = user_id);
create policy "srem_inbox_insert_own"
    on public.srem_inbox
    for insert
    to authenticated
    with check ((select auth.uid()) = user_id);
create policy "srem_inbox_update_own"
    on public.srem_inbox
    for update
    to authenticated
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);
create policy "srem_inbox_delete_own"
    on public.srem_inbox
    for delete
    to authenticated
    using ((select auth.uid()) = user_id);
insert into public.exams (
    id,
    title,
    section,
    type,
    passage_text,
    scale_mapping
) values
(
    '11111111-1111-4111-8111-111111111111',
    'Reading Demo 1 - Campus Ecology',
    'reading',
    'short_passage',
    'University campuses often become small ecosystems. Native trees cool sidewalks, absorb stormwater, and provide shelter for birds and insects. When planners replace them with ornamental plants, the campus may look orderly, but it usually supports less wildlife. For that reason, some universities now design green areas with local species instead of imported plants.',
    '{"0":0,"1":10,"2":20,"3":30}'::jsonb
),
(
    '22222222-2222-4222-8222-222222222222',
    'Grammar Demo 1 - Sentence Control',
    'grammar',
    'sentence_completion',
    null,
    '{"0":0,"1":10,"2":20,"3":30}'::jsonb
)
on conflict (id) do nothing;
insert into public.questions (
    id,
    exam_id,
    question_text,
    options,
    correct_option_id,
    order_index,
    points_weight,
    explanation
) values
(
    '11111111-1111-4111-8111-111111111101',
    '11111111-1111-4111-8111-111111111111',
    'What is the main idea of the passage?',
    '[{"id":"A","text":"Campuses should remove trees to look more orderly."},{"id":"B","text":"Native plants can make campuses healthier ecosystems."},{"id":"C","text":"Imported plants always attract more wildlife."},{"id":"D","text":"Stormwater is the only reason universities plant trees."}]'::jsonb,
    'B',
    1,
    1,
    'The passage explains several benefits of native trees and local species, then contrasts them with ornamental imported plants.'
),
(
    '11111111-1111-4111-8111-111111111102',
    '11111111-1111-4111-8111-111111111111',
    'According to the passage, what can happen when native trees are replaced with ornamental plants?',
    '[{"id":"A","text":"The campus may support less wildlife."},{"id":"B","text":"The sidewalks become colder in winter."},{"id":"C","text":"Birds and insects become easier to count."},{"id":"D","text":"Stormwater disappears completely."}]'::jsonb,
    'A',
    2,
    1,
    'The text says ornamental plants may look orderly, but they usually support less wildlife.'
),
(
    '11111111-1111-4111-8111-111111111103',
    '11111111-1111-4111-8111-111111111111',
    'The phrase "For that reason" refers to which idea?',
    '[{"id":"A","text":"Imported plants are cheaper than local species."},{"id":"B","text":"Native trees create shade and ecological support."},{"id":"C","text":"University planners avoid green areas."},{"id":"D","text":"Ornamental plants absorb more stormwater."}]'::jsonb,
    'B',
    3,
    1,
    'The phrase connects the listed ecological benefits of native trees to the decision to use local species.'
),
(
    '22222222-2222-4222-8222-222222222201',
    '22222222-2222-4222-8222-222222222222',
    'Choose the best completion: The committee postponed the meeting because the final report ______ ready.',
    '[{"id":"A","text":"was not"},{"id":"B","text":"were not"},{"id":"C","text":"not was"},{"id":"D","text":"not were"}]'::jsonb,
    'A',
    1,
    1,
    'The singular noun phrase "the final report" requires the singular verb form "was not."'
),
(
    '22222222-2222-4222-8222-222222222202',
    '22222222-2222-4222-8222-222222222222',
    'Choose the best completion: Students who review their notes regularly ______ better on cumulative exams.',
    '[{"id":"A","text":"performs"},{"id":"B","text":"perform"},{"id":"C","text":"performing"},{"id":"D","text":"to perform"}]'::jsonb,
    'B',
    2,
    1,
    'The subject "Students" is plural, so the base verb "perform" is required.'
),
(
    '22222222-2222-4222-8222-222222222203',
    '22222222-2222-4222-8222-222222222222',
    'Choose the best completion: The lecture was difficult, ______ it introduced several useful concepts.',
    '[{"id":"A","text":"although"},{"id":"B","text":"because"},{"id":"C","text":"but"},{"id":"D","text":"so that"}]'::jsonb,
    'C',
    3,
    1,
    'The sentence contrasts difficulty with usefulness. After a comma between two independent clauses, "but" is the correct coordinating conjunction.'
)
on conflict (id) do nothing;
