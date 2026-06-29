-- Migration to add more TOEFL practice exams (Reading, Grammar, and Listening)
-- Created: 2026-06-22

-- 1. Insert new exams
insert into public.exams (
    id,
    title,
    section,
    type,
    passage_text,
    audio_path,
    transcript,
    scale_mapping
) values
(
    '11111111-1111-4111-8111-222222222222',
    'Reading Prep: The Solar Wind and Magnetosphere',
    'reading',
    'short_passage',
    'The solar wind is a continuous stream of charged particles, primarily electrons and protons, flowing outward from the sun''s crown at high speeds. When these particles approach Earth, they interact with the planet''s magnetic field, or magnetosphere. The magnetosphere acts as an invisible shield, deflecting most of the solar wind around Earth and preventing it from stripping away the atmosphere. However, near the magnetic poles, some particles can leak through and collide with atmospheric gases. This collision energizes the gas atoms, which release light as they return to their normal state. The result is the spectacular auroral displays known as the Northern and Southern Lights. Despite their beauty, geomagnetic storms caused by intense solar activity can disrupt satellite communications and power grids.',
    null,
    null,
    '{"0":0,"1":8,"2":15,"3":22,"4":30}'::jsonb
),
(
    '22222222-2222-4222-8222-333333333333',
    'Grammar Prep: Structure & Syntax',
    'grammar',
    'sentence_completion',
    null,
    null,
    null,
    '{"0":0,"1":8,"2":15,"3":22,"4":30}'::jsonb
),
(
    '33333333-3333-4333-8333-444444444444',
    'Listening Prep: Academic Writing Consultation',
    'listening',
    'short_conversation',
    null,
    'demo/listening-writing-consultation.wav',
    'Professor: Come in, Sarah. I reviewed the outline you submitted for your history paper. Student: Thanks, Professor. I was worried it might be too broad. Professor: Actually, it is. Writing about the entire Industrial Revolution in ten pages is almost impossible. You need to narrow your focus. For example, you could write about how the introduction of steam-powered looms specifically affected textile mills in Massachusetts. Student: That makes sense. I can find plenty of local documents for that. Should I submit a new outline? Professor: Yes, please. Bring it to our meeting next Thursday so we can finalize the direction before you start writing.',
    '{"0":0,"1":10,"2":20,"3":30}'::jsonb
)
on conflict (id) do update set
    title = excluded.title,
    section = excluded.section,
    type = excluded.type,
    passage_text = excluded.passage_text,
    audio_path = excluded.audio_path,
    transcript = excluded.transcript,
    scale_mapping = excluded.scale_mapping;

-- 2. Insert new questions
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
-- Reading Questions
(
    '11111111-1111-4111-8111-222222222201',
    '11111111-1111-4111-8111-222222222222',
    'What is the main topic discussed in the passage?',
    '[{"id":"A","text":"The composition of the sun''s core"},{"id":"B","text":"The interaction of the solar wind with Earth''s magnetosphere"},{"id":"C","text":"The history of polar exploration"},{"id":"D","text":"The construction of modern satellite communication systems"}]'::jsonb,
    'B',
    1,
    1,
    'The passage focuses on the solar wind, the magnetosphere''s protective role, and the auroral phenomena caused by their interaction.'
),
(
    '11111111-1111-4111-8111-222222222202',
    '11111111-1111-4111-8111-222222222222',
    'According to the passage, what is the primary function of Earth''s magnetosphere?',
    '[{"id":"A","text":"To increase the speed of solar particles"},{"id":"B","text":"To generate electricity for the polar regions"},{"id":"C","text":"To deflect the solar wind and protect the atmosphere"},{"id":"D","text":"To absorb all solar energy and warm the oceans"}]'::jsonb,
    'C',
    2,
    1,
    'The text states that the magnetosphere acts as an invisible shield, deflecting most of the solar wind around Earth and preventing it from stripping away the atmosphere.'
),
(
    '11111111-1111-4111-8111-222222222203',
    '11111111-1111-4111-8111-222222222222',
    'The author mentions ''geomagnetic storms'' in order to show that ______.',
    '[{"id":"A","text":"solar activity has no real-world consequences on Earth"},{"id":"B","text":"auroras are dangerous to observe"},{"id":"C","text":"intense solar wind can interfere with human technology"},{"id":"D","text":"Earth''s magnetic field is rapidly weakening"}]'::jsonb,
    'C',
    3,
    1,
    'The author points out that geomagnetic storms can ''disrupt satellite communications and power grids,'' demonstrating the technological impact.'
),
(
    '11111111-1111-4111-8111-222222222204',
    '11111111-1111-4111-8111-222222222222',
    'The word ''spectacular'' in the passage is closest in meaning to ______.',
    '[{"id":"A","text":"dangerous"},{"id":"B","text":"invisible"},{"id":"C","text":"impressive"},{"id":"D","text":"predictable"}]'::jsonb,
    'C',
    4,
    1,
    'In this context, ''spectacular'' refers to the impressive or striking visual appearance of the auroral displays.'
),

-- Grammar Questions
(
    '22222222-2222-4222-8222-333333333301',
    '22222222-2222-4222-8222-333333333333',
    'Choose the best completion: Neither the director nor the actors ______ satisfied with the rehearsal schedule.',
    '[{"id":"A","text":"was"},{"id":"B","text":"were"},{"id":"C","text":"is"},{"id":"D","text":"being"}]'::jsonb,
    'B',
    1,
    1,
    'When subjects are joined by ''neither... nor'', the verb agrees with the closer subject. ''Actors'' is plural, so ''were'' is correct.'
),
(
    '22222222-2222-4222-8222-333333333302',
    '22222222-2222-4222-8222-333333333333',
    'Choose the best completion: The innovative design of the new hybrid car makes it ______ fuel-efficient than its predecessors.',
    '[{"id":"A","text":"much more"},{"id":"B","text":"very much"},{"id":"C","text":"so as"},{"id":"D","text":"as many"}]'::jsonb,
    'A',
    2,
    1,
    'The comparative structure ''fuel-efficient than'' requires ''more'' or ''much more'' to establish comparison.'
),
(
    '22222222-2222-4222-8222-333333333303',
    '22222222-2222-4222-8222-333333333333',
    'Choose the best completion: Modern manufacturing systems depend heavily ______ automated software to optimize assembly line efficiency.',
    '[{"id":"A","text":"in"},{"id":"B","text":"at"},{"id":"C","text":"on"},{"id":"D","text":"for"}]'::jsonb,
    'C',
    3,
    1,
    'The verb ''depend'' is idiomatically paired with the preposition ''on'' (depend on).'
),
(
    '22222222-2222-4222-8222-333333333304',
    '22222222-2222-4222-8222-333333333333',
    'Choose the best completion: Having finished the experiment, the data ______ for statistical analysis.',
    '[{"id":"A","text":"were compiled by the research team"},{"id":"B","text":"the research team compiled them"},{"id":"C","text":"compiling them was easy"},{"id":"D","text":"which the researchers compiled"}]'::jsonb,
    'A',
    4,
    1,
    'The participial phrase ''Having finished the experiment'' must modify the subject of the main clause. Grammatically, it implies the research team compiled the data; option A provides a passive construction where the plural noun ''data'' matches ''were compiled'' properly.'
),

-- Listening Questions
(
    '33333333-3333-4333-8333-444444444401',
    '33333333-3333-4333-8333-444444444444',
    'Why does the student visit the professor?',
    '[{"id":"A","text":"To ask for an extension on a deadline"},{"id":"B","text":"To receive feedback on her paper outline"},{"id":"C","text":"To request a letter of recommendation"},{"id":"D","text":"To borrow historical research documents"}]'::jsonb,
    'B',
    1,
    1,
    'The conversation begins with the professor reviewing the outline the student submitted for her history paper.'
),
(
    '33333333-3333-4333-8333-444444444402',
    '33333333-3333-4333-8333-444444444444',
    'What is the professor''s main criticism of the student''s outline?',
    '[{"id":"A","text":"It lacks proper primary sources."},{"id":"B","text":"The writing style is too informal."},{"id":"C","text":"The topic chosen is too broad."},{"id":"D","text":"It was submitted past the deadline."}]'::jsonb,
    'C',
    2,
    1,
    'The professor states that writing about the entire Industrial Revolution in ten pages is too broad and recommends narrowing it down.'
),
(
    '33333333-3333-4333-8333-444444444403',
    '33333333-3333-4333-8333-444444444444',
    'What does the professor suggest the student do next?',
    '[{"id":"A","text":"Write the first draft immediately."},{"id":"B","text":"Choose a different historical era."},{"id":"C","text":"Submit a revised outline next Thursday."},{"id":"D","text":"Focus on European textile mills."}]'::jsonb,
    'C',
    3,
    1,
    'The professor asks the student to submit a new outline and bring it to their meeting next Thursday.'
)
on conflict (id) do update set
    question_text = excluded.question_text,
    options = excluded.options,
    correct_option_id = excluded.correct_option_id,
    order_index = excluded.order_index,
    points_weight = excluded.points_weight,
    explanation = excluded.explanation;;
