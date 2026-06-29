-- 1. Create a SECURITY DEFINER function to get user role without triggering RLS
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM profiles WHERE id = user_id;
$$;

-- 2. Fix profiles SELECT policy (was causing infinite recursion)
DROP POLICY IF EXISTS "Users and teachers can view profiles" ON profiles;

CREATE POLICY "Users and teachers can view profiles"
ON profiles FOR SELECT
USING (
  auth.uid() = id
  OR get_user_role(auth.uid()) IN ('teacher', 'admin')
);

-- 3. Fix user_items SELECT policies
DROP POLICY IF EXISTS "Teachers can view student items" ON user_items;

CREATE POLICY "Teachers can view student items"
ON user_items FOR SELECT
USING (
  auth.uid() = user_id
  OR get_user_role(auth.uid()) IN ('teacher', 'admin')
);

-- 4. Fix study_logs SELECT policies
DROP POLICY IF EXISTS "Teachers can view student logs" ON study_logs;

CREATE POLICY "Teachers can view student logs"
ON study_logs FOR SELECT
USING (
  auth.uid() = user_id
  OR get_user_role(auth.uid()) IN ('teacher', 'admin')
);

-- 5. Fix study_sessions SELECT policies
DROP POLICY IF EXISTS "Teachers can view student sessions" ON study_sessions;

CREATE POLICY "Teachers can view student sessions"
ON study_sessions FOR SELECT
USING (
  auth.uid() = user_id
  OR get_user_role(auth.uid()) IN ('teacher', 'admin')
);;
