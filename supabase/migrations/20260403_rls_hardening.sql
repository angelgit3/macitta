-- =====================================================
-- RLS HARDENING — Pre-launch security patch
-- 1. Restrict cards & card_slots to authenticated users only (remove anon access)
-- 2. Fix search_path mutable on SECURITY DEFINER functions (search_path injection)
-- 3. Add missing DELETE policy on user_items
-- =====================================================

-- ─── 1. Cards: require authentication ──────────────────────────────────────────
-- Drop permissive "viewable by everyone" (includes anon role)
DROP POLICY IF EXISTS "Cards are viewable by everyone" ON cards;

-- Recreate: only authenticated users can read cards
CREATE POLICY "cards_select_authenticated"
    ON cards FOR SELECT
    TO authenticated
    USING (true);

-- ─── 2. Card slots: require authentication ─────────────────────────────────────
DROP POLICY IF EXISTS "Slots are viewable by everyone" ON card_slots;

CREATE POLICY "card_slots_select_authenticated"
    ON card_slots FOR SELECT
    TO authenticated
    USING (true);

-- ─── 3. Decks: require authentication ─────────────────────────────────────────
-- Decks are also "viewable by everyone" — restrict to authenticated as well
DROP POLICY IF EXISTS "Decks are viewable by everyone" ON decks;

CREATE POLICY "decks_select_authenticated"
    ON decks FOR SELECT
    TO authenticated
    USING (true);

-- ─── 4. Add missing DELETE policy on user_items ────────────────────────────────
-- Currently users cannot delete their own items (e.g., reset progress).
-- Teachers/admins should NOT be able to delete student items.
CREATE POLICY "user_items_delete_own"
    ON user_items FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- ─── 5. Fix search_path mutable on SECURITY DEFINER functions ─────────────────
-- Prevents search_path injection attacks. Add SET search_path = public, pg_temp
-- to all SECURITY DEFINER functions.

-- 5a. handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 5b. update_profile_role_from_email
CREATE OR REPLACE FUNCTION public.update_profile_role_from_email()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
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

-- 5c. get_my_classroom_ids (fix search_path — preserve existing logic)
CREATE OR REPLACE FUNCTION public.get_my_classroom_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT classroom_id FROM classroom_students WHERE student_id = auth.uid();
$$;

-- 5d. get_my_teacher_classroom_ids
CREATE OR REPLACE FUNCTION public.get_my_teacher_classroom_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT id FROM classrooms WHERE teacher_id = auth.uid();
$$;

-- 5e. sync_user_item and increment_session_time — preserve body, add search_path
-- Note: We use CREATE OR REPLACE to keep the existing function body intact.
-- The body is intentionally NOT replicated here to avoid drift with production.
-- Instead, re-run with ALTER to add the search_path config.
ALTER FUNCTION public.sync_user_item SET search_path = public, pg_temp;
ALTER FUNCTION public.increment_session_time SET search_path = public, pg_temp;

-- ─── Verification ──────────────────────────────────────────────────────────────
-- Run this after migration to confirm all policies are as expected:
-- SELECT tablename, policyname, roles, cmd, qual FROM pg_policies
-- WHERE schemaname = 'public' AND tablename IN ('cards', 'card_slots', 'decks', 'user_items')
-- ORDER BY tablename, cmd;
