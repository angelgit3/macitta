
-- Allow students to see OTHER students in the SAME classroom
-- (needed for the /mis-clases ranking feature)

-- 1. classroom_students: students can see all members of classrooms they belong to
DROP POLICY IF EXISTS "cs_select" ON classroom_students;
CREATE POLICY "cs_select" ON classroom_students FOR SELECT USING (
    auth.uid() = student_id
    OR classroom_id IN (SELECT get_my_teacher_classroom_ids())
    OR classroom_id IN (
        SELECT cs2.classroom_id FROM classroom_students cs2
        WHERE cs2.student_id = auth.uid()
    )
);

-- 2. profiles: students can also view profiles of classmates
DROP POLICY IF EXISTS "Users and teachers can view profiles" ON profiles;
CREATE POLICY "Users and teachers can view profiles" ON profiles FOR SELECT USING (
    auth.uid() = id
    OR get_user_role(auth.uid()) = ANY (ARRAY['teacher'::text, 'admin'::text])
    OR id IN (
        SELECT cs2.student_id FROM classroom_students cs2
        WHERE cs2.classroom_id IN (
            SELECT cs3.classroom_id FROM classroom_students cs3
            WHERE cs3.student_id = auth.uid()
        )
    )
);

-- 3. study_logs: students can read logs of classmates (for ranking)
CREATE POLICY "classmates_read_logs" ON study_logs FOR SELECT USING (
    auth.uid() = user_id
    OR user_id IN (
        SELECT cs2.student_id FROM classroom_students cs2
        WHERE cs2.classroom_id IN (
            SELECT cs3.classroom_id FROM classroom_students cs3
            WHERE cs3.student_id = auth.uid()
        )
    )
);
;
