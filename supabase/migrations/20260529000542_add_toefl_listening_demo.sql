insert into storage.buckets (
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
) values (
    'toefl-audio',
    'toefl-audio',
    true,
    10485760,
    array['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm']
)
on conflict (id) do update set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
create policy "toefl_audio_select_authenticated"
    on storage.objects
    for select
    to authenticated
    using (bucket_id = 'toefl-audio');
insert into public.exams (
    id,
    title,
    section,
    type,
    audio_path,
    transcript,
    scale_mapping
) values (
    '33333333-3333-4333-8333-333333333333',
    'Listening Demo 1 - Library Notice',
    'listening',
    'short_conversation',
    'demo/listening-library-notice.wav',
    'Student: Excuse me, I heard the library is changing its weekend schedule. Is that true? Librarian: Yes. Starting next Saturday, the library will open at nine in the morning instead of eight because the maintenance team needs an extra hour to check the study rooms and computer lab. Student: Will it still close at the usual time? Librarian: Yes, it will still close at six in the evening. The only change is the opening time.',
    '{"0":0,"1":10,"2":20,"3":30}'::jsonb
)
on conflict (id) do update set
    title = excluded.title,
    section = excluded.section,
    type = excluded.type,
    audio_path = excluded.audio_path,
    transcript = excluded.transcript,
    scale_mapping = excluded.scale_mapping;
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
    '33333333-3333-4333-8333-333333333301',
    '33333333-3333-4333-8333-333333333333',
    'What is the main purpose of the conversation?',
    '[{"id":"A","text":"To announce a change in library hours."},{"id":"B","text":"To explain why the computer lab is closing permanently."},{"id":"C","text":"To ask students to volunteer for maintenance."},{"id":"D","text":"To describe a new evening study program."}]'::jsonb,
    'A',
    1,
    1,
    'The speakers discuss a schedule change: the library will open later on weekends.'
),
(
    '33333333-3333-4333-8333-333333333302',
    '33333333-3333-4333-8333-333333333333',
    'Why will the library open later on Saturdays?',
    '[{"id":"A","text":"The librarian has a new class schedule."},{"id":"B","text":"The maintenance team needs time to check rooms and computers."},{"id":"C","text":"Students requested quieter morning hours."},{"id":"D","text":"The library is adding more evening staff."}]'::jsonb,
    'B',
    2,
    1,
    'The librarian says maintenance needs an extra hour to check the study rooms and computer lab.'
),
(
    '33333333-3333-4333-8333-333333333303',
    '33333333-3333-4333-8333-333333333333',
    'What will stay the same?',
    '[{"id":"A","text":"The opening time."},{"id":"B","text":"The closing time."},{"id":"C","text":"The maintenance schedule."},{"id":"D","text":"The computer lab location."}]'::jsonb,
    'B',
    3,
    1,
    'The librarian confirms the library will still close at six in the evening.'
)
on conflict (id) do update set
    question_text = excluded.question_text,
    options = excluded.options,
    correct_option_id = excluded.correct_option_id,
    order_index = excluded.order_index,
    points_weight = excluded.points_weight,
    explanation = excluded.explanation;
