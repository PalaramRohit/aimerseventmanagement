-- Migration: 20240101000027_participant_directory.sql
-- Description: Adds linkedin_url to profiles and creates RPCs for participant directory

-- 1. Add linkedin_url to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

-- 2. Create RPC to fetch participant directory
DROP FUNCTION IF EXISTS public.get_event_participants_directory(UUID);
CREATE OR REPLACE FUNCTION public.get_event_participants_directory(p_event_id UUID)
RETURNS TABLE (
    participant_id UUID,
    full_name TEXT,
    college TEXT,
    academic_year TEXT,
    linkedin_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify the caller is an active registered participant for this event
  IF NOT EXISTS (
    SELECT 1 FROM event_participants ep_check
    WHERE ep_check.event_id = p_event_id 
      AND ep_check.participant_id = auth.uid()
      AND ep_check.status = 'registered'
  ) THEN
    RAISE EXCEPTION 'Access denied. You are not a registered participant of this event.';
  END IF;

  RETURN QUERY
  SELECT 
    p.id as participant_id,
    COALESCE(p.full_name, er.full_name) as full_name,
    er.college,
    er.academic_year,
    p.linkedin_url
  FROM event_participants ep
  JOIN profiles p ON p.id = ep.participant_id
  LEFT JOIN event_registrations er ON er.event_id = ep.event_id AND er.email = lower(trim(p.email))
  WHERE ep.event_id = p_event_id
    AND ep.status = 'registered'
  ORDER BY COALESCE(p.full_name, er.full_name) ASC;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_event_participants_directory(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_event_participants_directory(UUID) TO authenticated;

-- 3. Create RPC to update LinkedIn URL securely
DROP FUNCTION IF EXISTS public.update_my_linkedin(TEXT);
CREATE OR REPLACE FUNCTION public.update_my_linkedin(p_url TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate the URL server-side. Basic check to ensure it's a linkedin URL if provided.
  IF p_url IS NOT NULL AND trim(p_url) != '' THEN
    IF p_url !~ '^https:\/\/(www\.)?linkedin\.com\/.*$' THEN
      RAISE EXCEPTION 'Invalid LinkedIn URL. Must start with https://www.linkedin.com/';
    END IF;
  ELSE
    p_url := NULL;
  END IF;

  UPDATE public.profiles
  SET linkedin_url = p_url,
      updated_at = now()
  WHERE id = auth.uid();
END;
$$;

REVOKE EXECUTE ON FUNCTION public.update_my_linkedin(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_my_linkedin(TEXT) TO authenticated;
