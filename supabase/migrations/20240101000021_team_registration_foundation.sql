-- Migration: 20240101000021_team_registration_foundation.sql
-- Description: Foundation for team registration. Adds event_teams and links to registrations/participants.

-- 1. Create event_teams
CREATE TABLE event_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(event_id, name)
);

-- 2. Modify event_registrations
ALTER TABLE event_registrations ADD COLUMN team_id UUID REFERENCES event_teams(id) ON DELETE SET NULL;
ALTER TABLE event_registrations ADD COLUMN team_role TEXT CHECK (team_role IN ('leader', 'member'));

-- 3. Modify event_participants
ALTER TABLE event_participants ADD COLUMN team_id UUID REFERENCES event_teams(id) ON DELETE SET NULL;
ALTER TABLE event_participants ADD COLUMN team_role TEXT CHECK (team_role IN ('leader', 'member'));

-- RLS for event_teams
ALTER TABLE event_teams ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.event_teams TO authenticated;

-- Admin policy
CREATE POLICY "teams_admin_all" ON event_teams
  FOR ALL TO authenticated
  USING (public.get_my_role() = 'admin');

-- Participant select policy
CREATE POLICY "teams_participant_select" ON event_teams
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM event_participants ep 
      WHERE ep.team_id = event_teams.id 
      AND ep.participant_id = auth.uid()
    )
  );

-- 4. Update sync_participant_registrations RPC
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
    registered_at,
    team_id,
    team_role
  )
  SELECT 
    er.event_id,
    auth.uid(),
    er.breakfast_opted,
    er.lunch_opted,
    er.dinner_opted,
    now(),
    er.team_id,
    er.team_role
  FROM event_registrations er
  JOIN registration_allowlist a ON a.event_id = er.event_id AND a.email = er.email
  WHERE er.email = lower(trim(v_user_email))
    AND a.invited_role = 'participant'
  ON CONFLICT (event_id, participant_id) DO UPDATE SET
    breakfast_opted = EXCLUDED.breakfast_opted,
    lunch_opted = EXCLUDED.lunch_opted,
    dinner_opted = EXCLUDED.dinner_opted,
    team_id = EXCLUDED.team_id,
    team_role = EXCLUDED.team_role;

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
