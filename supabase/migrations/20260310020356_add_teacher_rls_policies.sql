-- 1. Replace the "everyone can view profiles" policy with role-aware version
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;

CREATE POLICY "Users and teachers can view profiles"
ON profiles FOR SELECT
USING (
  auth.uid() = id
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role IN ('teacher', 'admin')
  )
);

-- 2. Teachers can view all student user_items (read-only)
CREATE POLICY "Teachers can view student items"
ON user_items FOR SELECT
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role IN ('teacher', 'admin')
  )
);

-- 3. Teachers can view all study_logs (read-only)
CREATE POLICY "Teachers can view student logs"
ON study_logs FOR SELECT
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role IN ('teacher', 'admin')
  )
);

-- 4. Teachers can view all study_sessions (read-only)
CREATE POLICY "Teachers can view student sessions"
ON study_sessions FOR SELECT
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role IN ('teacher', 'admin')
  )
);;
