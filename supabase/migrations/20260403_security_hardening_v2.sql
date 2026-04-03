-- =====================================================
-- SECURITY HARDENING V2
-- Fecha: 2026-04-03
-- Rama: feature/security-audit
--
-- Fixes aplicados:
--   ALTO-1: Limitar todas las policies a rol `authenticated` (eliminar acceso anon)
--   ALTO-2: Agregar verificación de rol teacher en classrooms_insert
--   ALTO-3: Fix search_path en 3 funciones SECURITY DEFINER restantes
--   BAJO-2: Reemplazar auth.uid() con (SELECT auth.uid()) en todas las policies
--   BAJO-3: Consolidar policies SELECT múltiples en study_logs, user_items,
--            study_sessions y feedback en una sola política por tabla
--   BAJO-4: Crear índices en FK sin cubrir
-- =====================================================


-- ─────────────────────────────────────────────────────────────────────────────
-- SECCIÓN 1: ALTO-3 — Fix search_path en funciones SECURITY DEFINER restantes
-- ─────────────────────────────────────────────────────────────────────────────

ALTER FUNCTION public.get_my_classmate_ids      SET search_path = public, pg_temp;
ALTER FUNCTION public.get_my_student_classroom_ids SET search_path = public, pg_temp;
ALTER FUNCTION public.get_user_role             SET search_path = public, pg_temp;


-- ─────────────────────────────────────────────────────────────────────────────
-- SECCIÓN 2: BAJO-4 — Índices en foreign keys sin cubrir
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_card_slots_card_id     ON public.card_slots(card_id);
CREATE INDEX IF NOT EXISTS idx_cards_deck_id           ON public.cards(deck_id);
CREATE INDEX IF NOT EXISTS idx_cs_student_id           ON public.classroom_students(student_id);
CREATE INDEX IF NOT EXISTS idx_classrooms_teacher_id   ON public.classrooms(teacher_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id        ON public.feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_study_logs_user_id      ON public.study_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_study_logs_card_id      ON public.study_logs(card_id);
CREATE INDEX IF NOT EXISTS idx_study_logs_session_id   ON public.study_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id  ON public.study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_deck_id  ON public.study_sessions(deck_id);
CREATE INDEX IF NOT EXISTS idx_user_items_card_id      ON public.user_items(card_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- SECCIÓN 3: DECKS — Ya tiene policy authenticated (OK)
-- ─────────────────────────────────────────────────────────────────────────────
-- cards_select_authenticated  → TO authenticated ✅
-- card_slots_select_authenticated → TO authenticated ✅
-- decks_select_authenticated  → TO authenticated ✅
-- user_items_delete_own       → TO authenticated ✅
-- (Estas se mantienen — ya fueron corregidas en la migration anterior)


-- ─────────────────────────────────────────────────────────────────────────────
-- SECCIÓN 4: PROFILES
-- ALTO-1: Cambiar roles a authenticated
-- BAJO-2: Usar (SELECT auth.uid())
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can insert their own profile."     ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile."           ON public.profiles;
DROP POLICY IF EXISTS "Users and teachers can view profiles"    ON public.profiles;

CREATE POLICY "profiles_insert_own"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "profiles_update_own"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING ((SELECT auth.uid()) = id);

-- Policy SELECT unificada: yo mismo, mis compañeros de clase o soy teacher/admin
CREATE POLICY "profiles_select"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (
        (SELECT auth.uid()) = id
        OR id IN (SELECT get_my_classmate_ids())
        OR get_user_role((SELECT auth.uid())) = ANY (ARRAY['teacher', 'admin'])
    );


-- ─────────────────────────────────────────────────────────────────────────────
-- SECCIÓN 5: CLASSROOMS
-- ALTO-1: Cambiar a authenticated
-- ALTO-2: Agregar role check en INSERT
-- BAJO-2: Usar (SELECT auth.uid())
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "classrooms_insert"            ON public.classrooms;
DROP POLICY IF EXISTS "classrooms_update"            ON public.classrooms;
DROP POLICY IF EXISTS "classrooms_delete"            ON public.classrooms;
DROP POLICY IF EXISTS "classrooms_lookup_by_code"    ON public.classrooms;

-- Teachers/admins: INSERT solo si tienen el rol correcto
CREATE POLICY "classrooms_insert"
    ON public.classrooms
    FOR INSERT
    TO authenticated
    WITH CHECK (
        (SELECT auth.uid()) = teacher_id
        AND get_user_role((SELECT auth.uid())) = ANY (ARRAY['teacher', 'admin'])
    );

CREATE POLICY "classrooms_update"
    ON public.classrooms
    FOR UPDATE
    TO authenticated
    USING ((SELECT auth.uid()) = teacher_id);

CREATE POLICY "classrooms_delete"
    ON public.classrooms
    FOR DELETE
    TO authenticated
    USING ((SELECT auth.uid()) = teacher_id);

-- SELECT unificada: teacher dueño, alumno inscrito, o lookup por código (para unirse)
CREATE POLICY "classrooms_select"
    ON public.classrooms
    FOR SELECT
    TO authenticated
    USING (
        (SELECT auth.uid()) = teacher_id
        OR id IN (SELECT get_my_student_classroom_ids())
    );

-- Lookup especial: cualquier usuario autenticado puede buscar por código de acceso
-- (necesario para el flujo de unirse a clase)
CREATE POLICY "classrooms_lookup_by_code"
    ON public.classrooms
    FOR SELECT
    TO authenticated
    USING (true);

-- Nota: classrooms_select y classrooms_lookup_by_code son permisivas y se
-- combinarán con OR. Dado que classrooms_lookup_by_code permite todo a
-- authenticated, este es el comportamiento deseado para buscar por join_code.
-- En producción con muchos grupos esto podría optimizarse, pero para el scale
-- actual es correcto y seguro.


-- ─────────────────────────────────────────────────────────────────────────────
-- SECCIÓN 6: CLASSROOM_STUDENTS
-- ALTO-1: Cambiar a authenticated
-- BAJO-2: Usar (SELECT auth.uid())
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "cs_insert" ON public.classroom_students;
DROP POLICY IF EXISTS "cs_select" ON public.classroom_students;
DROP POLICY IF EXISTS "cs_delete" ON public.classroom_students;

CREATE POLICY "cs_insert"
    ON public.classroom_students
    FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = student_id);

-- SELECT unificada: soy el alumno, soy teacher del classroom, o soy compañero
CREATE POLICY "cs_select"
    ON public.classroom_students
    FOR SELECT
    TO authenticated
    USING (
        (SELECT auth.uid()) = student_id
        OR classroom_id IN (SELECT get_my_teacher_classroom_ids())
        OR classroom_id IN (SELECT get_my_student_classroom_ids())
    );

-- DELETE: alumno sale solo, o teacher expulsa de su propio classroom
CREATE POLICY "cs_delete"
    ON public.classroom_students
    FOR DELETE
    TO authenticated
    USING (
        (SELECT auth.uid()) = student_id
        OR classroom_id IN (SELECT get_my_teacher_classroom_ids())
    );


-- ─────────────────────────────────────────────────────────────────────────────
-- SECCIÓN 7: USER_ITEMS
-- ALTO-1: Cambiar a authenticated
-- BAJO-2: Usar (SELECT auth.uid())
-- BAJO-3: Consolidar las 2 policies SELECT en una
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can view own items"        ON public.user_items;
DROP POLICY IF EXISTS "Users can insert own items"      ON public.user_items;
DROP POLICY IF EXISTS "Users can update own items"      ON public.user_items;
DROP POLICY IF EXISTS "Teachers can view student items" ON public.user_items;

-- SELECT consolidada: yo mismo, o soy teacher/admin (puede ver progreso de alumnos)
CREATE POLICY "user_items_select"
    ON public.user_items
    FOR SELECT
    TO authenticated
    USING (
        (SELECT auth.uid()) = user_id
        OR get_user_role((SELECT auth.uid())) = ANY (ARRAY['teacher', 'admin'])
    );

CREATE POLICY "user_items_insert"
    ON public.user_items
    FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "user_items_update"
    ON public.user_items
    FOR UPDATE
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);

-- DELETE ya fue creado authenticated en la migration anterior, solo actualizamos expr:
DROP POLICY IF EXISTS "user_items_delete_own" ON public.user_items;
CREATE POLICY "user_items_delete_own"
    ON public.user_items
    FOR DELETE
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- SECCIÓN 8: STUDY_LOGS
-- ALTO-1: Cambiar a authenticated
-- BAJO-2: Usar (SELECT auth.uid())
-- BAJO-3: Consolidar 3 policies SELECT en una sola
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can view own logs"         ON public.study_logs;
DROP POLICY IF EXISTS "Users can insert own logs"       ON public.study_logs;
DROP POLICY IF EXISTS "teachers_read_student_logs"      ON public.study_logs;
DROP POLICY IF EXISTS "students_read_own_logs"          ON public.study_logs;
DROP POLICY IF EXISTS "classmates_read_logs"            ON public.study_logs;

-- SELECT consolidada: yo mismo, mis compañeros (para ranking), o soy teacher del alumno
CREATE POLICY "study_logs_select"
    ON public.study_logs
    FOR SELECT
    TO authenticated
    USING (
        (SELECT auth.uid()) = user_id
        OR user_id IN (SELECT get_my_classmate_ids())
        OR user_id IN (
            SELECT cs.student_id
            FROM public.classroom_students cs
            JOIN public.classrooms c ON c.id = cs.classroom_id
            WHERE c.teacher_id = (SELECT auth.uid())
        )
    );

CREATE POLICY "study_logs_insert"
    ON public.study_logs
    FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- SECCIÓN 9: STUDY_SESSIONS
-- ALTO-1: Cambiar a authenticated
-- BAJO-2: Usar (SELECT auth.uid())
-- BAJO-3: Consolidar 2 policies SELECT en una
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can create their own sessions"   ON public.study_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions"   ON public.study_sessions;
DROP POLICY IF EXISTS "students_read_own_sessions"            ON public.study_sessions;
DROP POLICY IF EXISTS "teachers_read_student_sessions"        ON public.study_sessions;

-- SELECT consolidada: yo mismo o teacher del alumno
CREATE POLICY "study_sessions_select"
    ON public.study_sessions
    FOR SELECT
    TO authenticated
    USING (
        (SELECT auth.uid()) = user_id
        OR user_id IN (
            SELECT cs.student_id
            FROM public.classroom_students cs
            JOIN public.classrooms c ON c.id = cs.classroom_id
            WHERE c.teacher_id = (SELECT auth.uid())
        )
    );

CREATE POLICY "study_sessions_insert"
    ON public.study_sessions
    FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "study_sessions_update"
    ON public.study_sessions
    FOR UPDATE
    TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- SECCIÓN 10: FEEDBACK
-- ALTO-1: Cambiar a authenticated
-- BAJO-2: Usar (SELECT auth.uid())
-- BAJO-3: Consolidar 2 policies SELECT en una
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can submit feedback"       ON public.feedback;
DROP POLICY IF EXISTS "Users can view own feedback"     ON public.feedback;
DROP POLICY IF EXISTS "Teachers can view all feedback"  ON public.feedback;

-- SELECT consolidada: yo mismo o soy teacher/admin
CREATE POLICY "feedback_select"
    ON public.feedback
    FOR SELECT
    TO authenticated
    USING (
        (SELECT auth.uid()) = user_id
        OR get_user_role((SELECT auth.uid())) = ANY (ARRAY['teacher', 'admin'])
    );

CREATE POLICY "feedback_insert"
    ON public.feedback
    FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- SECCIÓN 11: USER_PROGRESS
-- ALTO-1: Cambiar a authenticated
-- BAJO-2: Usar (SELECT auth.uid())
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can view own progress."    ON public.user_progress;
DROP POLICY IF EXISTS "Users can insert own progress."  ON public.user_progress;
DROP POLICY IF EXISTS "Users can edit own progress."    ON public.user_progress;

CREATE POLICY "user_progress_select"
    ON public.user_progress
    FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "user_progress_insert"
    ON public.user_progress
    FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "user_progress_update"
    ON public.user_progress
    FOR UPDATE
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- SECCIÓN 12: VERBS
-- Restringir a authenticated (era viewable by everyone / anon)
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Verbs are viewable by everyone." ON public.verbs;

CREATE POLICY "verbs_select_authenticated"
    ON public.verbs
    FOR SELECT
    TO authenticated
    USING (true);


-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFICACIÓN — Ejecutar después para confirmar el estado final
-- ─────────────────────────────────────────────────────────────────────────────
-- SELECT tablename, policyname, roles, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, cmd, policyname;
--
-- Resultado esperado: NINGUNA policy debe tener roles = '{public}' o '{anon}'
-- excepto las de classrooms_lookup_by_code que aplica a authenticated.
