-- Migration: 20240101000012_phase7_token_generation.sql
-- Description: Trigger to automatically generate opaque Data Matrix tokens on participant registration.

-- 1. Trigger function
CREATE OR REPLACE FUNCTION public.generate_participant_tokens()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Generate 4 separate tokens for the participant
  INSERT INTO public.participant_matrix_tokens (event_participant_id, token_type, token)
  VALUES 
    (NEW.id, 'attendance', gen_random_uuid()::text),
    (NEW.id, 'breakfast', gen_random_uuid()::text),
    (NEW.id, 'lunch', gen_random_uuid()::text),
    (NEW.id, 'dinner', gen_random_uuid()::text)
  ON CONFLICT (event_participant_id, token_type) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- 2. Attach trigger
DROP TRIGGER IF EXISTS on_event_participant_created ON public.event_participants;
CREATE TRIGGER on_event_participant_created
  AFTER INSERT ON public.event_participants
  FOR EACH ROW
  EXECUTE PROCEDURE public.generate_participant_tokens();

-- 3. Also grant SELECT privileges to authenticated role so RLS can apply
GRANT SELECT ON public.participant_matrix_tokens TO authenticated;

-- 4. RPC for coordinators to securely validate tokens without unrestricted RLS read access
CREATE OR REPLACE FUNCTION public.validate_matrix_token(
  p_event_id UUID,
  p_operation TEXT,
  p_token TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_coordinator BOOLEAN;
  v_token_record RECORD;
  v_participant_name TEXT;
  v_participant_event_id UUID;
BEGIN
  -- 1. Verify caller is a coordinator for the event or an admin
  IF public.get_my_role() = 'admin' THEN
    v_is_coordinator := true;
  ELSE
    SELECT EXISTS (
      SELECT 1 FROM public.event_coordinators 
      WHERE event_id = p_event_id AND coordinator_id = auth.uid()
    ) INTO v_is_coordinator;
  END IF;

  IF NOT v_is_coordinator THEN
    RETURN jsonb_build_object('success', false, 'message', 'Unauthorized coordinator for this event.');
  END IF;

  -- 2. Lookup the token
  SELECT t.token_type, ep.event_id, p.full_name
  INTO v_token_record
  FROM public.participant_matrix_tokens t
  JOIN public.event_participants ep ON t.event_participant_id = ep.id
  JOIN public.profiles p ON ep.participant_id = p.id
  WHERE t.token = p_token;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid or unrecognized token.');
  END IF;

  -- 3. Verify event match
  IF v_token_record.event_id != p_event_id THEN
    RETURN jsonb_build_object('success', false, 'message', 'Token belongs to a different event.');
  END IF;

  -- 4. Verify token type match
  IF v_token_record.token_type != p_operation THEN
    RETURN jsonb_build_object('success', false, 'message', 'Token is for ' || v_token_record.token_type || ', but you selected ' || p_operation || '.');
  END IF;

  -- 5. Success
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Valid token.',
    'participantName', COALESCE(v_token_record.full_name, 'Unknown Participant'),
    'operation', p_operation
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.validate_matrix_token(UUID, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.validate_matrix_token(UUID, TEXT, TEXT) TO authenticated, service_role;
