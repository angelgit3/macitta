
-- ============================================================
-- Fix: recursión infinita en RLS de classroom_students → profiles
-- ============================================================

-- 1. Función SECURITY DEFINER para obtener aulas donde el usuario es ESTUDIANTE
--    Bypassa RLS, evita la recursión
CREATE OR REPLACE FUNCTION get_my_student_classroom_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT classroom_id FROM classroom_students WHERE student_id = auth.uid();
$$;

-- 2. Función SECURITY DEFINER para obtener IDs de compañeros de clase del usuario
CREATE OR REPLACE FUNCTION get_my_classmate_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT student_id
  FROM classroom_students
  WHERE classroom_id IN (
    SELECT classroom_id FROM classroom_students WHERE student_id = auth.uid()
  )
  AND student_id != auth.uid();
$$;

-- 3. Arreglar política SELECT de classroom_students (era self-referencial)
DROP POLICY IF EXISTS cs_select ON classroom_students;
CREATE POLICY cs_select ON classroom_students
FOR SELECT USING (
  auth.uid() = student_id
  OR classroom_id IN (SELECT get_my_teacher_classroom_ids())
  OR classroom_id IN (SELECT get_my_student_classroom_ids())
);

-- 4. Arreglar política SELECT de profiles (también usaba subquery de classroom_students directamente)
DROP POLICY IF EXISTS "Users and teachers can view profiles" ON profiles;
CREATE POLICY "Users and teachers can view profiles" ON profiles
FOR SELECT USING (
  auth.uid() = id
  OR get_user_role(auth.uid()) = ANY (ARRAY['teacher', 'admin'])
  OR id IN (SELECT get_my_classmate_ids())
);
;
