-- Migration: 20240101000006_phase6_fixes.sql
-- Description: Fix get_eligible RPCs to return start_date and end_date instead of start_time and end_time.

DROP FUNCTION IF EXISTS public.get_eligible_participant_events();
CREATE OR REPLACE FUNCTION public.get_eligible_participant_events()
RETURNS TABLE (
  id UUID,
  name TEXT,
  venue TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  registration_open BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_email TEXT;
BEGIN
  -- Derive email securely from auth.users via auth.uid()
  SELECT email INTO v_user_email FROM auth.users WHERE id = auth.uid();

  IF v_user_email IS NULL THEN
    RAISE EXCEPTION 'Authenticated user email not found.';
  END IF;

  RETURN QUERY
  SELECT 
    e.id, e.name, e.venue, e.start_date, e.end_date, e.registration_open
  FROM events e
  JOIN registration_allowlist a ON a.event_id = e.id
  WHERE a.email = v_user_email
    AND a.invited_role = 'participant'
    AND NOT EXISTS (
      SELECT 1 FROM event_participants ep 
      WHERE ep.event_id = e.id AND ep.participant_id = auth.uid()
    );
END;
$$;

DROP FUNCTION IF EXISTS public.get_eligible_coordinator_events();
CREATE OR REPLACE FUNCTION public.get_eligible_coordinator_events()
RETURNS TABLE (
  id UUID,
  name TEXT,
  venue TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_email TEXT;
BEGIN
  -- Derive email securely from auth.users via auth.uid()
  SELECT email INTO v_user_email FROM auth.users WHERE id = auth.uid();

  IF v_user_email IS NULL THEN
    RAISE EXCEPTION 'Authenticated user email not found.';
  END IF;

  RETURN QUERY
  SELECT 
    e.id, e.name, e.venue, e.start_date, e.end_date
  FROM events e
  JOIN registration_allowlist a ON a.event_id = e.id
  WHERE a.email = v_user_email
    AND a.invited_role = 'coordinator'
    AND NOT EXISTS (
      SELECT 1 FROM event_coordinators ec 
      WHERE ec.event_id = e.id AND ec.coordinator_id = auth.uid()
    );
END;
$$;

