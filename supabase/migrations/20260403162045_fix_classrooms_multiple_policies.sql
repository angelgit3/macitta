-- 1. Eliminar las dos policies conflictivas
DROP POLICY IF EXISTS "classrooms_select"             ON public.classrooms;
DROP POLICY IF EXISTS "classrooms_lookup_by_code"     ON public.classrooms;
DROP POLICY IF EXISTS "teachers_select_own_classrooms"       ON public.classrooms;
DROP POLICY IF EXISTS "students_select_joined_classrooms"    ON public.classrooms;

-- 2. Crear una única policy SELECT consolidada
CREATE POLICY "classrooms_select_authenticated"
    ON public.classrooms
    FOR SELECT
    TO authenticated
    USING (true);;
