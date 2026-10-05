-- Migration: 20240101000015_phase9_participant_data.sql
-- Description: Add missing participant fields to profiles and event_registrations, and update RPCs

-- 1. Add phone to profiles (global identity)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- 2. Add structured fields to event_registrations (event-scoped)
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS college TEXT;
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS branch TEXT;
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS academic_year TEXT;

-- 3. Modify import_event_allowlist RPC to support new fields
DROP FUNCTION IF EXISTS public.import_event_allowlist(UUID, JSONB);

CREATE OR REPLACE FUNCTION public.import_event_allowlist(p_event_id UUID, p_rows JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  -- Upsert authorization list
  INSERT INTO public.registration_allowlist (event_id, email, invited_role)
  SELECT 
    p_event_id, 
    lower(trim(email)), 
    invited_role
  FROM jsonb_to_recordset(p_rows) AS x(email TEXT, invited_role TEXT)
  ON CONFLICT (event_id, email) DO NOTHING;

  -- Upsert registration data
  INSERT INTO public.event_registrations (
    event_id, 
    email, 
    full_name, 
    phone,
    college,
    branch,
    academic_year,
    breakfast_opted, 
    lunch_opted, 
    dinner_opted, 
    registration_data
  )
  SELECT 
    p_event_id, 
    lower(trim(email)), 
    full_name, 
    phone,
    college,
    branch,
    academic_year,
    COALESCE(breakfast_opted, false), 
    COALESCE(lunch_opted, false), 
    COALESCE(dinner_opted, false), 
    registration_data
  FROM jsonb_to_recordset(p_rows) AS x(
    email TEXT, 
    full_name TEXT, 
    phone TEXT,
    college TEXT,
    branch TEXT,
    academic_year TEXT,
    breakfast_opted BOOLEAN, 
    lunch_opted BOOLEAN, 
    dinner_opted BOOLEAN, 
    registration_data JSONB
  )
  ON CONFLICT (event_id, email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    college = EXCLUDED.college,
    branch = EXCLUDED.branch,
    academic_year = EXCLUDED.academic_year,
    breakfast_opted = EXCLUDED.breakfast_opted,
    lunch_opted = EXCLUDED.lunch_opted,
    dinner_opted = EXCLUDED.dinner_opted,
    registration_data = EXCLUDED.registration_data,
    imported_at = now();
END;
$$;

REVOKE EXECUTE ON FUNCTION public.import_event_allowlist(UUID, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.import_event_allowlist(UUID, JSONB) TO authenticated, service_role;

-- 4. get_my_event_registrations RPC
DROP FUNCTION IF EXISTS public.get_my_event_registrations();

CREATE OR REPLACE FUNCTION public.get_my_event_registrations()
RETURNS TABLE (
  event_id UUID,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  college TEXT,
  branch TEXT,
  academic_year TEXT,
  breakfast_opted BOOLEAN,
  lunch_opted BOOLEAN,
  dinner_opted BOOLEAN,
  registration_data JSONB,
  imported_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_email TEXT;
BEGIN
  SELECT auth.users.email INTO v_user_email 
  FROM auth.users 
  WHERE auth.users.id = auth.uid() 
    AND auth.users.email_confirmed_at IS NOT NULL;
  
  IF v_user_email IS NULL THEN
    SELECT auth.users.email INTO v_user_email 
    FROM auth.users 
    WHERE auth.users.id = auth.uid();
  END IF;

  RETURN QUERY
  SELECT 
    er.event_id, er.email, er.full_name, er.phone, er.college, er.branch, er.academic_year, er.breakfast_opted, er.lunch_opted, er.dinner_opted, er.registration_data, er.imported_at
  FROM event_registrations er
  WHERE er.email = lower(trim(v_user_email));
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_my_event_registrations() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_event_registrations() TO authenticated, service_role;

-- 5. sync_participant_registrations RPC (Update profile if missing details)
CREATE OR REPLACE FUNCTION public.sync_participant_registrations()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_email TEXT;
  v_full_name TEXT;
  v_phone TEXT;
BEGIN
  SELECT auth.users.email INTO v_user_email 
  FROM auth.users 
  WHERE auth.users.id = auth.uid() 
    AND auth.users.email_confirmed_at IS NOT NULL;
    
  IF v_user_email IS NULL THEN
    SELECT auth.users.email INTO v_user_email 
    FROM auth.users 
    WHERE auth.users.id = auth.uid();
  END IF;

  -- Create participant records
  INSERT INTO public.event_participants (
    event_id,
    participant_id,
    breakfast_opted,
    lunch_opted,
    dinner_opted,
    registered_at
  )
  SELECT 
    er.event_id,
    auth.uid(),
    er.breakfast_opted,
    er.lunch_opted,
    er.dinner_opted,
    now()
  FROM event_registrations er
  JOIN registration_allowlist a ON a.event_id = er.event_id AND a.email = er.email
  WHERE er.email = lower(trim(v_user_email))
    AND a.invited_role = 'participant'
  ON CONFLICT (event_id, participant_id) DO UPDATE SET
    breakfast_opted = EXCLUDED.breakfast_opted,
    lunch_opted = EXCLUDED.lunch_opted,
    dinner_opted = EXCLUDED.dinner_opted;

  -- Optionally update profile name and phone if currently null and we have data from recent registration
  SELECT er.full_name, er.phone INTO v_full_name, v_phone
  FROM event_registrations er
  WHERE er.email = lower(trim(v_user_email))
  ORDER BY er.imported_at DESC
  LIMIT 1;

  UPDATE public.profiles
  SET 
    full_name = COALESCE(profiles.full_name, v_full_name),
    phone = COALESCE(profiles.phone, v_phone)
  WHERE id = auth.uid();
END;
$$;

REVOKE EXECUTE ON FUNCTION public.sync_participant_registrations() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sync_participant_registrations() TO authenticated, service_role;
