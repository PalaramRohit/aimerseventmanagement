-- Migration: 20240101000005_phase6_portals.sql
-- Description: Phase 6 - Participant & Coordinator Portals RPCs. 
-- Adds secure functions for event claiming and eligibility fetching.

-- 1. Get Eligible Participant Events
-- Returns events for which the authenticated user is explicitly allowed to register as a participant,
-- but HAS NOT yet claimed.
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

REVOKE EXECUTE ON FUNCTION public.get_eligible_participant_events() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_eligible_participant_events() TO authenticated;


-- 2. Get Eligible Coordinator Events
-- Returns events for which the authenticated user is explicitly allowed to be a coordinator,
-- but HAS NOT yet claimed.
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

REVOKE EXECUTE ON FUNCTION public.get_eligible_coordinator_events() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_eligible_coordinator_events() TO authenticated;


-- 3. Claim Participant Event
-- Secure atomic claim for a participant event, validating email and registration_open.
CREATE OR REPLACE FUNCTION public.claim_participant_event(
  p_event_id UUID, 
  p_breakfast BOOLEAN, 
  p_lunch BOOLEAN, 
  p_dinner BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_email TEXT;
  v_is_eligible BOOLEAN;
  v_is_open BOOLEAN;
BEGIN
  -- 1. Derive identity
  SELECT email INTO v_user_email FROM auth.users WHERE id = auth.uid();
  IF v_user_email IS NULL THEN
    RAISE EXCEPTION 'Authenticated user email not found.';
  END IF;

  -- 2. Verify registration is open
  SELECT registration_open INTO v_is_open FROM events WHERE id = p_event_id;
  IF v_is_open IS NULL THEN
    RAISE EXCEPTION 'Event not found.';
  END IF;
  IF NOT v_is_open THEN
    RAISE EXCEPTION 'Registration is closed for this event.';
  END IF;

  -- 3. Verify allowlist explicitly for participant role
  SELECT EXISTS (
    SELECT 1 FROM registration_allowlist 
    WHERE event_id = p_event_id 
      AND email = v_user_email 
      AND invited_role = 'participant'
  ) INTO v_is_eligible;

  IF NOT v_is_eligible THEN
    RAISE EXCEPTION 'User is not eligible to claim this event as a participant.';
  END IF;

  -- 4. Atomic Insert
  INSERT INTO public.event_participants (
    event_id, 
    participant_id, 
    breakfast_opted, 
    lunch_opted, 
    dinner_opted, 
    registration_time
  ) VALUES (
    p_event_id, 
    auth.uid(), 
    COALESCE(p_breakfast, false), 
    COALESCE(p_lunch, false), 
    COALESCE(p_dinner, false), 
    NOW()
  )
  ON CONFLICT (event_id, participant_id) DO NOTHING;

END;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_participant_event(UUID, BOOLEAN, BOOLEAN, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_participant_event(UUID, BOOLEAN, BOOLEAN, BOOLEAN) TO authenticated;


-- 4. Claim Coordinator Event
-- Secure atomic claim for a coordinator event, validating email.
CREATE OR REPLACE FUNCTION public.claim_coordinator_event(p_event_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_email TEXT;
  v_is_eligible BOOLEAN;
  v_exists BOOLEAN;
BEGIN
  -- 1. Derive identity
  SELECT email INTO v_user_email FROM auth.users WHERE id = auth.uid();
  IF v_user_email IS NULL THEN
    RAISE EXCEPTION 'Authenticated user email not found.';
  END IF;
  
  -- Verify event exists
  SELECT EXISTS(SELECT 1 FROM events WHERE id = p_event_id) INTO v_exists;
  IF NOT v_exists THEN
    RAISE EXCEPTION 'Event not found.';
  END IF;

  -- 2. Verify allowlist explicitly for coordinator role
  SELECT EXISTS (
    SELECT 1 FROM registration_allowlist 
    WHERE event_id = p_event_id 
      AND email = v_user_email 
      AND invited_role = 'coordinator'
  ) INTO v_is_eligible;

  IF NOT v_is_eligible THEN
    RAISE EXCEPTION 'User is not eligible to claim this event as a coordinator.';
  END IF;

  -- 3. Atomic Insert
  INSERT INTO public.event_coordinators (
    event_id, 
    coordinator_id
  ) VALUES (
    p_event_id, 
    auth.uid()
  )
  ON CONFLICT (event_id, coordinator_id) DO NOTHING;

END;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_coordinator_event(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_coordinator_event(UUID) TO authenticated;

