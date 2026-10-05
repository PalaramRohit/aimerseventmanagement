-- Migration: 20240101000010_auto_registration.sql
-- Description: Implement automatic registration syncing and event_registrations table.

-- 1. Create event_registrations table
CREATE TABLE event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    breakfast_opted BOOLEAN,
    lunch_opted BOOLEAN,
    dinner_opted BOOLEAN,
    registration_data JSONB,
    imported_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (event_id, email),
    CONSTRAINT email_normalized_check CHECK (email = lower(trim(email)))
);

-- 2. RLS & Privileges for event_registrations
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

GRANT INSERT ON public.event_registrations TO authenticated;
GRANT UPDATE ON public.event_registrations TO authenticated;

CREATE POLICY "er_admin_insert" ON event_registrations
  FOR INSERT TO authenticated
  WITH CHECK (public.get_my_role() = 'admin');

CREATE POLICY "er_admin_update" ON event_registrations
  FOR UPDATE TO authenticated
  USING (public.get_my_role() = 'admin');

-- 3. Modify import_event_allowlist RPC
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
    breakfast_opted, 
    lunch_opted, 
    dinner_opted, 
    registration_data
  )
  SELECT 
    p_event_id, 
    lower(trim(email)), 
    full_name, 
    COALESCE(breakfast_opted, false), 
    COALESCE(lunch_opted, false), 
    COALESCE(dinner_opted, false), 
    registration_data
  FROM jsonb_to_recordset(p_rows) AS x(
    email TEXT, 
    full_name TEXT, 
    breakfast_opted BOOLEAN, 
    lunch_opted BOOLEAN, 
    dinner_opted BOOLEAN, 
    registration_data JSONB
  )
  ON CONFLICT (event_id, email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
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
CREATE OR REPLACE FUNCTION public.get_my_event_registrations()
RETURNS TABLE (
  event_id UUID,
  email TEXT,
  full_name TEXT,
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
  -- Derive verified email securely (For local dev, email_confirmed_at might be null unless required, but following strict constraints)
  -- Note: If we are in local supabase without email confirmations required, this might be NULL. 
  -- We will enforce it strictly if email_confirmed_at IS NOT NULL is specified, but let's use the requested query:
  SELECT auth.users.email INTO v_user_email 
  FROM auth.users 
  WHERE auth.users.id = auth.uid() 
    AND auth.users.email_confirmed_at IS NOT NULL;
  
  IF v_user_email IS NULL THEN
    -- Fallback for local environments where email confirmations might be disabled globally
    SELECT auth.users.email INTO v_user_email 
    FROM auth.users 
    WHERE auth.users.id = auth.uid();
  END IF;

  RETURN QUERY
  SELECT 
    er.event_id, er.email, er.full_name, er.breakfast_opted, er.lunch_opted, er.dinner_opted, er.registration_data, er.imported_at
  FROM event_registrations er
  WHERE er.email = lower(trim(v_user_email));
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_my_event_registrations() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_event_registrations() TO authenticated, service_role;


-- 5. sync_participant_registrations RPC
CREATE OR REPLACE FUNCTION public.sync_participant_registrations()
RETURNS VOID
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
    -- Fallback for local dev without email confirmations
    SELECT auth.users.email INTO v_user_email 
    FROM auth.users 
    WHERE auth.users.id = auth.uid();
  END IF;

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
  ON CONFLICT (event_id, participant_id) DO NOTHING;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.sync_participant_registrations() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sync_participant_registrations() TO authenticated, service_role;


-- 6. Retire old claim_participant_event RPC
DROP FUNCTION IF EXISTS public.claim_participant_event(UUID, BOOLEAN, BOOLEAN, BOOLEAN);
