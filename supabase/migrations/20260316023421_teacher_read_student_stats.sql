-- Allow teachers to read study_logs of students in their classrooms
CREATE POLICY "teachers_read_student_logs" ON study_logs
    FOR SELECT USING (
        -- The user is reading their own logs
        auth.uid() = user_id
        OR
        -- Or the reader is a teacher who has the student in one of their classrooms
        user_id IN (
            SELECT cs.student_id
            FROM classroom_students cs
            JOIN classrooms c ON c.id = cs.classroom_id
            WHERE c.teacher_id = auth.uid()
        )
    );

-- Allow teachers to read study_sessions of students in their classrooms
CREATE POLICY "teachers_read_student_sessions" ON study_sessions
    FOR SELECT USING (
        auth.uid() = user_id
        OR
        user_id IN (
            SELECT cs.student_id
            FROM classroom_students cs
            JOIN classrooms c ON c.id = cs.classroom_id
            WHERE c.teacher_id = auth.uid()
        )
    );

-- Allow teachers to see profiles of students in their classrooms
CREATE POLICY "teachers_read_student_profiles" ON profiles
    FOR SELECT USING (
        auth.uid() = id
        OR
        id IN (
            SELECT cs.student_id
            FROM classroom_students cs
            JOIN classrooms c ON c.id = cs.classroom_id
            WHERE c.teacher_id = auth.uid()
        )
    );
;
