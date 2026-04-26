-- 1. Add author_id to decks table
ALTER TABLE public.decks
ADD COLUMN author_id uuid REFERENCES public.profiles(id) DEFAULT NULL;

-- 2. Create classroom_decks table
CREATE TABLE public.classroom_decks (
    classroom_id uuid NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
    deck_id uuid NOT NULL REFERENCES public.decks(id) ON DELETE CASCADE,
    assigned_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (classroom_id, deck_id)
);

-- Enable RLS
ALTER TABLE public.classroom_decks ENABLE ROW LEVEL SECURITY;

-- 3. RLS for decks

-- Drop existing RLS policy on decks
DROP POLICY IF EXISTS "decks_select_authenticated" ON public.decks;

CREATE POLICY "Decks are viewable by everyone if global"
ON public.decks FOR SELECT TO authenticated
USING (author_id IS NULL);

CREATE POLICY "Decks are viewable by author"
ON public.decks FOR SELECT TO authenticated
USING (author_id = auth.uid());

CREATE POLICY "Decks are viewable by classroom students and teachers"
ON public.decks FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.classroom_decks cd
        WHERE cd.deck_id = decks.id
        AND (
            EXISTS (
                SELECT 1 FROM public.classroom_students cs
                WHERE cs.classroom_id = cd.classroom_id
                AND cs.student_id = auth.uid()
            )
            OR
            EXISTS (
                SELECT 1 FROM public.classrooms c
                WHERE c.id = cd.classroom_id
                AND c.teacher_id = auth.uid()
            )
        )
    )
);

CREATE POLICY "Decks can be inserted by authenticated users"
ON public.decks FOR INSERT TO authenticated
WITH CHECK (author_id = auth.uid());

CREATE POLICY "Decks can be updated by author"
ON public.decks FOR UPDATE TO authenticated
USING (author_id = auth.uid());

CREATE POLICY "Decks can be deleted by author"
ON public.decks FOR DELETE TO authenticated
USING (author_id = auth.uid());


-- 4. RLS for classroom_decks

CREATE POLICY "Classroom decks manageable by teachers"
ON public.classroom_decks FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.classrooms c
        WHERE c.id = classroom_decks.classroom_id
        AND c.teacher_id = auth.uid()
    )
);

CREATE POLICY "Classroom decks viewable by students"
ON public.classroom_decks FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.classroom_students cs
        WHERE cs.classroom_id = classroom_decks.classroom_id
        AND cs.student_id = auth.uid()
    )
);