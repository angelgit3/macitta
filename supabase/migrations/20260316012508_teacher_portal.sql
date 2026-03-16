-- =====================================================
-- TEACHER PORTAL - Phase 1 Migration
-- Adds role to profiles, creates classrooms tables,
-- and defines RLS policies.
-- =====================================================

-- 1. Add role column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'student';
ALTER TABLE profiles ADD CONSTRAINT IF NOT EXISTS role_check CHECK (role IN ('student', 'teacher', 'admin'));

-- 2. Create classrooms table
CREATE TABLE IF NOT EXISTS classrooms (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name text NOT NULL,
    join_code text NOT NULL UNIQUE,
    created_at timestamptz DEFAULT now()
);

-- 3. Create classroom_students join table
CREATE TABLE IF NOT EXISTS classroom_students (
    classroom_id uuid REFERENCES classrooms(id) ON DELETE CASCADE,
    student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at timestamptz DEFAULT now(),
    PRIMARY KEY (classroom_id, student_id)
);

-- 4. Enable RLS
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE classroom_students ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CLASSROOMS POLICIES
-- =====================================================

-- Teachers: full CRUD on their own classrooms
CREATE POLICY "teachers_select_own_classrooms" ON classrooms
    FOR SELECT USING (auth.uid() = teacher_id);

CREATE POLICY "teachers_insert_classrooms" ON classrooms
    FOR INSERT WITH CHECK (
        auth.uid() = teacher_id
        AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher')
    );

CREATE POLICY "teachers_update_classrooms" ON classrooms
    FOR UPDATE USING (auth.uid() = teacher_id);

CREATE POLICY "teachers_delete_classrooms" ON classrooms
    FOR DELETE USING (auth.uid() = teacher_id);

-- Students: can see classrooms they are a member of
CREATE POLICY "students_select_joined_classrooms" ON classrooms
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM classroom_students cs
            WHERE cs.classroom_id = classrooms.id AND cs.student_id = auth.uid()
        )
    );

-- =====================================================
-- CLASSROOM_STUDENTS POLICIES
-- =====================================================

-- Students: can see and manage their own memberships
CREATE POLICY "students_select_own_memberships" ON classroom_students
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "students_join_classroom" ON classroom_students
    FOR INSERT WITH CHECK (
        auth.uid() = student_id
        AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'student')
    );

CREATE POLICY "students_leave_classroom" ON classroom_students
    FOR DELETE USING (auth.uid() = student_id);

-- Teachers: can see and remove students from their classrooms
CREATE POLICY "teachers_select_classroom_students" ON classroom_students
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM classrooms c
            WHERE c.id = classroom_id AND c.teacher_id = auth.uid()
        )
    );

CREATE POLICY "teachers_remove_classroom_students" ON classroom_students
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM classrooms c
            WHERE c.id = classroom_id AND c.teacher_id = auth.uid()
        )
    );

-- =====================================================
-- RPC: update_profile_role_from_email
-- Called when a user verifies their OTP. It reads the
-- email from the authenticated session and assigns
-- the role automatically based on the email format.
-- Emails with only digits before @ -> student
-- Emails with letters before @ -> teacher
-- =====================================================
CREATE OR REPLACE FUNCTION update_profile_role_from_email()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  local_part text;
BEGIN
  SELECT split_part(email, '@', 1)
  INTO local_part
  FROM auth.users
  WHERE id = auth.uid();

  IF local_part ~ '^[0-9]+$' THEN
    UPDATE profiles SET role = 'student' WHERE id = auth.uid();
  ELSE
    UPDATE profiles SET role = 'teacher' WHERE id = auth.uid();
  END IF;
END;
$$;
