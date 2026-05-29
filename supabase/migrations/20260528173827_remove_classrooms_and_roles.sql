-- Remove the classroom/teacher-student domain and keep the app as a
-- personal study product. This migration intentionally tightens affected
-- RLS policies before dropping role helpers.

-- Deck visibility no longer depends on classroom assignments.
DROP POLICY IF EXISTS "Decks are viewable by classroom students and teachers" ON public.decks;

-- Profiles are private to the signed-in owner.
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = id);

-- Progress tables are private to the signed-in owner.
DROP POLICY IF EXISTS "user_items_select" ON public.user_items;
CREATE POLICY "user_items_select"
    ON public.user_items
    FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "study_logs_select" ON public.study_logs;
CREATE POLICY "study_logs_select"
    ON public.study_logs
    FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "study_sessions_select" ON public.study_sessions;
CREATE POLICY "study_sessions_select"
    ON public.study_sessions
    FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "feedback_select" ON public.feedback;
CREATE POLICY "feedback_select"
    ON public.feedback
    FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);

-- Remove classroom policies so helper functions can be dropped cleanly.
DROP POLICY IF EXISTS "Classroom decks manageable by teachers" ON public.classroom_decks;
DROP POLICY IF EXISTS "Classroom decks viewable by students" ON public.classroom_decks;

DROP POLICY IF EXISTS "classrooms_insert" ON public.classrooms;
DROP POLICY IF EXISTS "classrooms_update" ON public.classrooms;
DROP POLICY IF EXISTS "classrooms_delete" ON public.classrooms;
DROP POLICY IF EXISTS "classrooms_select" ON public.classrooms;
DROP POLICY IF EXISTS "classrooms_lookup_by_code" ON public.classrooms;
DROP POLICY IF EXISTS "classrooms_select_authenticated" ON public.classrooms;
DROP POLICY IF EXISTS "teachers_select_own_classrooms" ON public.classrooms;
DROP POLICY IF EXISTS "teachers_insert_classrooms" ON public.classrooms;
DROP POLICY IF EXISTS "teachers_update_classrooms" ON public.classrooms;
DROP POLICY IF EXISTS "teachers_delete_classrooms" ON public.classrooms;
DROP POLICY IF EXISTS "students_select_joined_classrooms" ON public.classrooms;

DROP POLICY IF EXISTS "cs_insert" ON public.classroom_students;
DROP POLICY IF EXISTS "cs_select" ON public.classroom_students;
DROP POLICY IF EXISTS "cs_delete" ON public.classroom_students;
DROP POLICY IF EXISTS "students_select_own_memberships" ON public.classroom_students;
DROP POLICY IF EXISTS "students_join_classroom" ON public.classroom_students;
DROP POLICY IF EXISTS "students_leave_classroom" ON public.classroom_students;
DROP POLICY IF EXISTS "teachers_select_classroom_students" ON public.classroom_students;
DROP POLICY IF EXISTS "teachers_remove_classroom_students" ON public.classroom_students;

-- Remove role/classroom helper functions after policies stop using them.
DROP FUNCTION IF EXISTS public.update_profile_role_from_email();
DROP FUNCTION IF EXISTS public.get_my_classroom_ids();
DROP FUNCTION IF EXISTS public.get_my_teacher_classroom_ids();
DROP FUNCTION IF EXISTS public.get_my_student_classroom_ids();
DROP FUNCTION IF EXISTS public.get_user_role(uuid);

-- Drop classroom tables. Dependent table first.
DROP TABLE IF EXISTS public.classroom_decks;
DROP TABLE IF EXISTS public.classroom_students;
DROP TABLE IF EXISTS public.classrooms;

-- Remove the role column from profiles.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS role_check;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;
