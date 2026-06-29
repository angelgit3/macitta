-- Drop all current policies and recreate them without recursion

-- Classrooms policies
DROP POLICY IF EXISTS "teachers_select_own_classrooms" ON classrooms;
DROP POLICY IF EXISTS "teachers_insert_classrooms" ON classrooms;
DROP POLICY IF EXISTS "teachers_update_classrooms" ON classrooms;
DROP POLICY IF EXISTS "teachers_delete_classrooms" ON classrooms;
DROP POLICY IF EXISTS "students_select_joined_classrooms" ON classrooms;

-- Classroom_students policies  
DROP POLICY IF EXISTS "students_select_own_memberships" ON classroom_students;
DROP POLICY IF EXISTS "students_join_classroom" ON classroom_students;
DROP POLICY IF EXISTS "students_leave_classroom" ON classroom_students;
DROP POLICY IF EXISTS "teachers_select_classroom_students" ON classroom_students;
DROP POLICY IF EXISTS "teachers_remove_classroom_students" ON classroom_students;

-- ==========================================
-- CLASSROOMS: simple, no cross-table joins
-- ==========================================
CREATE POLICY "classrooms_select" ON classrooms
    FOR SELECT USING (
        auth.uid() = teacher_id
        OR id IN (
            SELECT classroom_id FROM classroom_students WHERE student_id = auth.uid()
        )
    );

CREATE POLICY "classrooms_insert" ON classrooms
    FOR INSERT WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "classrooms_update" ON classrooms
    FOR UPDATE USING (auth.uid() = teacher_id);

CREATE POLICY "classrooms_delete" ON classrooms
    FOR DELETE USING (auth.uid() = teacher_id);

-- ==========================================
-- CLASSROOM_STUDENTS: no circular references
-- ==========================================
-- Students see their own rows
CREATE POLICY "cs_student_select" ON classroom_students
    FOR SELECT USING (auth.uid() = student_id);

-- Teachers see rows for classrooms they own (join classrooms directly, not classroom_students)
CREATE POLICY "cs_teacher_select" ON classroom_students
    FOR SELECT USING (
        auth.uid() IN (
            SELECT teacher_id FROM classrooms WHERE id = classroom_id
        )
    );

-- Students can insert themselves
CREATE POLICY "cs_student_insert" ON classroom_students
    FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Students can leave (delete themselves)
CREATE POLICY "cs_student_delete" ON classroom_students
    FOR DELETE USING (auth.uid() = student_id);

-- Teachers can remove students from their classrooms
CREATE POLICY "cs_teacher_delete" ON classroom_students
    FOR DELETE USING (
        auth.uid() IN (
            SELECT teacher_id FROM classrooms WHERE id = classroom_id
        )
    );;
