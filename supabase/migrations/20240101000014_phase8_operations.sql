-- Migration: 20240101000014_phase8_operations.sql
-- Description: RPC to securely and atomically validate and record matrix operations (attendance/food)

CREATE OR REPLACE FUNCTION public.record_matrix_operation(
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
  v_participant_id UUID;
  v_event_record RECORD;
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
    RETURN jsonb_build_object('success', false, 'message', 'You are not assigned to this event');
  END IF;

  -- 2. Lookup the token
  SELECT t.token_type, ep.event_id, ep.participant_id, p.full_name, 
         ep.breakfast_opted, ep.lunch_opted, ep.dinner_opted, ep.status
  INTO v_token_record
  FROM public.participant_matrix_tokens t
  JOIN public.event_participants ep ON t.event_participant_id = ep.id
  JOIN public.profiles p ON ep.participant_id = p.id
  WHERE t.token = p_token;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid Data Matrix');
  END IF;

  -- 3. Verify event match
  IF v_token_record.event_id != p_event_id THEN
    RETURN jsonb_build_object('success', false, 'message', 'This code belongs to another event');
  END IF;

  -- 4. Verify token type match
  IF v_token_record.token_type != p_operation THEN
    RETURN jsonb_build_object('success', false, 'message', 'This is not a ' || p_operation || ' Data Matrix');
  END IF;

  -- 5. Fetch Event Configuration
  SELECT attendance_enabled, breakfast_enabled, lunch_enabled, dinner_enabled 
  INTO v_event_record 
  FROM public.events WHERE id = p_event_id;

  -- 6. Verify Eligibility
  IF p_operation = 'attendance' THEN
    IF NOT v_event_record.attendance_enabled THEN
      RETURN jsonb_build_object('success', false, 'message', 'Attendance recording is disabled for this event');
    END IF;
  ELSIF p_operation = 'breakfast' THEN
    IF NOT v_event_record.breakfast_enabled THEN
      RETURN jsonb_build_object('success', false, 'message', 'Breakfast is not enabled for this event');
    END IF;
    IF NOT v_token_record.breakfast_opted THEN
      RETURN jsonb_build_object('success', false, 'message', 'Participant is not registered for Breakfast');
    END IF;
  ELSIF p_operation = 'lunch' THEN
    IF NOT v_event_record.lunch_enabled THEN
      RETURN jsonb_build_object('success', false, 'message', 'Lunch is not enabled for this event');
    END IF;
    IF NOT v_token_record.lunch_opted THEN
      RETURN jsonb_build_object('success', false, 'message', 'Participant is not registered for Lunch');
    END IF;
  ELSIF p_operation = 'dinner' THEN
    IF NOT v_event_record.dinner_enabled THEN
      RETURN jsonb_build_object('success', false, 'message', 'Dinner is not enabled for this event');
    END IF;
    IF NOT v_token_record.dinner_opted THEN
      RETURN jsonb_build_object('success', false, 'message', 'Participant is not registered for Dinner');
    END IF;
  ELSE
    RETURN jsonb_build_object('success', false, 'message', 'Unknown operation');
  END IF;

  -- 7. Atomically insert record
  BEGIN
    IF p_operation = 'attendance' THEN
      INSERT INTO public.attendance_records (event_id, participant_id, scanned_by)
      VALUES (p_event_id, v_token_record.participant_id, auth.uid());
    ELSE
      INSERT INTO public.food_records (event_id, participant_id, meal_type, scanned_by)
      VALUES (p_event_id, v_token_record.participant_id, p_operation, auth.uid());
    END IF;
  EXCEPTION WHEN unique_violation THEN
    IF p_operation = 'attendance' THEN
      RETURN jsonb_build_object('success', true, 'duplicate', true, 'message', 'Already marked present', 'participantName', COALESCE(v_token_record.full_name, 'Unknown Participant'));
    ELSE
      RETURN jsonb_build_object('success', true, 'duplicate', true, 'message', initcap(p_operation) || ' already recorded', 'participantName', COALESCE(v_token_record.full_name, 'Unknown Participant'));
    END IF;
  END;

  -- 8. Success
  IF p_operation = 'attendance' THEN
    RETURN jsonb_build_object(
      'success', true,
      'duplicate', false,
      'message', 'Attendance recorded',
      'participantName', COALESCE(v_token_record.full_name, 'Unknown Participant'),
      'operation', p_operation
    );
  ELSE
    RETURN jsonb_build_object(
      'success', true,
      'duplicate', false,
      'message', initcap(p_operation) || ' recorded',
      'participantName', COALESCE(v_token_record.full_name, 'Unknown Participant'),
      'operation', p_operation
    );
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.record_matrix_operation(UUID, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_matrix_operation(UUID, TEXT, TEXT) TO authenticated, service_role;

-- Grant INSERT privileges to authenticated for RLS to apply, but restrict SELECT/UPDATE/DELETE.
GRANT INSERT ON public.attendance_records TO authenticated;
GRANT INSERT ON public.food_records TO authenticated;
