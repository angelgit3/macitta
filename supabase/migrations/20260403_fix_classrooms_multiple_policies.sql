-- =====================================================
-- FIX: classrooms — Multiple Permissive SELECT Policies
-- Fecha: 2026-04-03
-- Rama: feature/css-security-hardening
--
-- Problema detectado por Supabase Advisor (WARN):
--   Table `public.classrooms` has multiple permissive policies
--   for role `authenticated` for action `SELECT`.
--   Policies: {classrooms_lookup_by_code, classrooms_select}
--
-- Causa:
--   classrooms_lookup_by_code usa USING (true), lo que significa
--   que cualquier usuario autenticado puede ver cualquier classroom.
--   classrooms_select es redundante — sus condiciones (teacher o
--   alumno inscrito) son un subconjunto de "cualquier autenticado".
--   Ambas policies se evalúan en cada SELECT con OR, desperdiciando
--   recursos. La regla Postgres para policies permisivas es:
--     GRANT si CUALQUIER policy permisiva devuelve true.
--   Por lo tanto, classrooms_select nunca aporta nada porque
--   classrooms_lookup_by_code ya es más permisiva.
--
-- Solución:
--   Eliminar ambas y reemplazar por una única policy
--   `classrooms_select_all_authenticated` con USING (true).
--   El comportamiento funcional NO cambia:
--   - Teachers siguen viendo sus grupos ✅ (ya podían ver todos)
--   - Alumnos siguen pudiendo buscar por join_code ✅
--   - El filtrado real (ej. "solo mis grupos") ocurre en la capa
--     de aplicación (queries con WHERE teacher_id = uid), lo cual
--     es correcto — la policy solo actúa como guardia de acceso.
--
-- Resultado esperado:
--   Supabase Advisor WARN `multiple_permissive_policies` eliminado.
-- =====================================================

-- 1. Eliminar las dos policies conflictivas
DROP POLICY IF EXISTS "classrooms_select"             ON public.classrooms;
DROP POLICY IF EXISTS "classrooms_lookup_by_code"     ON public.classrooms;

-- También eliminar las policies heredadas de la migration inicial
-- por si aún existieran en algún entorno
DROP POLICY IF EXISTS "teachers_select_own_classrooms"       ON public.classrooms;
DROP POLICY IF EXISTS "students_select_joined_classrooms"    ON public.classrooms;

-- 2. Crear una única policy SELECT consolidada
--    Cualquier usuario autenticado puede leer classrooms.
--    El filtrado por pertenencia ocurre a nivel de query en la app.
CREATE POLICY "classrooms_select_authenticated"
    ON public.classrooms
    FOR SELECT
    TO authenticated
    USING (true);

-- ─── Verificación ──────────────────────────────────────────────────────────────
-- Ejecutar después para confirmar que solo queda UNA policy SELECT:
--
-- SELECT policyname, roles, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public' AND tablename = 'classrooms' AND cmd = 'SELECT'
-- ORDER BY policyname;
--
-- Resultado esperado: una sola fila → classrooms_select_authenticated
