-- Migration: 20240101000002_rls_policies.sql
-- Description: Establishes secure role foundation, profile auto-creation, and granular RLS policies.

-- 1. Helper function to securely get the current user's role without recursion
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

-- Revoke public execution to ensure it cannot be misused
REVOKE EXECUTE ON FUNCTION public.get_my_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated;


-- 2. Profile auto-creation trigger on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'participant');
  RETURN NEW;
END;
$$;

-- Drop trigger if exists to allow idempotency
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 3. RLS Policies

-- Clear any existing policies (defensive)
DROP POLICY IF EXISTS "profiles_select_self_or_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_update_self" ON profiles;
DROP POLICY IF EXISTS "events_select" ON events;
DROP POLICY IF EXISTS "ec_select" ON event_coordinators;
DROP POLICY IF EXISTS "ep_select" ON event_participants;
DROP POLICY IF EXISTS "tokens_select" ON participant_matrix_tokens;
DROP POLICY IF EXISTS "attendance_select" ON attendance_records;
DROP POLICY IF EXISTS "food_select" ON food_records;


-- A. Profiles
-- Users can read their own profile. Admins can read all. NO client-side UPDATE allowed.
CREATE POLICY "profiles_select_self_or_admin" ON profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.get_my_role() = 'admin');

-- B. Events
-- Admins can read all. Coordinators can read their assigned events. Participants can read their registered events.
CREATE POLICY "events_select" ON events
  FOR SELECT TO authenticated
  USING (
    public.get_my_role() = 'admin'
    OR id IN (SELECT event_id FROM event_coordinators WHERE coordinator_id = auth.uid())
    OR id IN (SELECT event_id FROM event_participants WHERE participant_id = auth.uid())
  );

-- C. Event Coordinators
-- Coordinators can read their own assignments. Admins can read all.
CREATE POLICY "ec_select" ON event_coordinators
  FOR SELECT TO authenticated
  USING (coordinator_id = auth.uid() OR public.get_my_role() = 'admin');

-- D. Event Participants
-- Participants can read their own registration. Coordinators can read registrations for their assigned events. Admins can read all.
CREATE POLICY "ep_select" ON event_participants
  FOR SELECT TO authenticated
  USING (
    participant_id = auth.uid()
    OR public.get_my_role() = 'admin'
    OR event_id IN (SELECT event_id FROM event_coordinators WHERE coordinator_id = auth.uid())
  );

-- E. Participant Matrix Tokens
-- Participants can read their own tokens. Admins can read all.
-- Coordinators DO NOT get direct access to tokens (scanner will validate via secure server API).
CREATE POLICY "tokens_select" ON participant_matrix_tokens
  FOR SELECT TO authenticated
  USING (
    event_participant_id IN (SELECT id FROM event_participants WHERE participant_id = auth.uid())
    OR public.get_my_role() = 'admin'
  );

-- F. Attendance Records
-- Participants can read their own attendance. Admins can read all.
CREATE POLICY "attendance_select" ON attendance_records
  FOR SELECT TO authenticated
  USING (
    participant_id = auth.uid()
    OR public.get_my_role() = 'admin'
  );

-- G. Food Records
-- Participants can read their own food records. Admins can read all.
CREATE POLICY "food_select" ON food_records
  FOR SELECT TO authenticated
  USING (
    participant_id = auth.uid()
    OR public.get_my_role() = 'admin'
  );

-- Note: We are explicitly not creating any INSERT/UPDATE policies for standard tables right now.
-- Client-side inserts/updates are fully locked out.
