-- Migration: 20240101000004_allowlist_import.sql
-- Description: Phase 5 - CSV Import, Email Normalization, Invited Role, and Atomic RPC.

-- 1. Pre-Migration Data Safety: Lowercase and trim all existing emails to prevent constraint violation on legacy data.
UPDATE registration_allowlist SET email = lower(trim(email));

-- 2. Add invited_role column to distinguish participant vs coordinator imports
ALTER TABLE registration_allowlist 
  ADD COLUMN invited_role TEXT CHECK (invited_role IN ('participant', 'coordinator')) NOT NULL DEFAULT 'participant';

-- 3. Add deterministic email normalization invariant constraint
ALTER TABLE registration_allowlist 
  ADD CONSTRAINT email_normalized_check CHECK (email = lower(trim(email)));

-- 4. RLS Policies for Admin CSV Import & Management
-- Only admins can manage the allowlist. Participants/Coordinators cannot read or write to it directly.

DROP POLICY IF EXISTS "allowlist_admin_select" ON registration_allowlist;
CREATE POLICY "allowlist_admin_select" ON registration_allowlist
  FOR SELECT TO authenticated
  USING (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "allowlist_admin_insert" ON registration_allowlist;
CREATE POLICY "allowlist_admin_insert" ON registration_allowlist
  FOR INSERT TO authenticated
  WITH CHECK (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "allowlist_admin_update" ON registration_allowlist;
CREATE POLICY "allowlist_admin_update" ON registration_allowlist
  FOR UPDATE TO authenticated
  USING (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "allowlist_admin_delete" ON registration_allowlist;
CREATE POLICY "allowlist_admin_delete" ON registration_allowlist
  FOR DELETE TO authenticated
  USING (public.get_my_role() = 'admin');

-- 5. Atomic CSV Import RPC
-- This RPC executes a bulk upsert securely and transactionally.
-- SECURITY INVOKER ensures it runs strictly within the caller's RLS boundaries (must be admin).
CREATE OR REPLACE FUNCTION public.import_event_allowlist(p_event_id UUID, p_rows JSONB)
RETURNS VOID
LANGUAGE sql
SECURITY INVOKER
AS $$
  INSERT INTO public.registration_allowlist (event_id, email, invited_role)
  SELECT 
    p_event_id, 
    lower(trim(email)), 
    invited_role
  FROM jsonb_to_recordset(p_rows) AS x(email TEXT, invited_role TEXT)
  ON CONFLICT (event_id, email) DO NOTHING;
$$;

-- Revoke public execute rights for extreme safety.
REVOKE EXECUTE ON FUNCTION public.import_event_allowlist(UUID, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.import_event_allowlist(UUID, JSONB) TO authenticated;
