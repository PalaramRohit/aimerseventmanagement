-- Migration: 20240101000022_import_teams_allowlist.sql
-- Description: RPC for atomic team import handling.

CREATE OR REPLACE FUNCTION public.import_teams_allowlist(p_event_id UUID, p_teams JSONB, p_members JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  -- 1. Upsert Teams
  INSERT INTO public.event_teams (event_id, name)
  SELECT 
    p_event_id, 
    trim(name)
  FROM jsonb_to_recordset(p_teams) AS x(name TEXT)
  ON CONFLICT (event_id, name) DO NOTHING;

  -- 2. Upsert Allowlist (All members get 'participant' invited_role)
  INSERT INTO public.registration_allowlist (event_id, email, invited_role)
  SELECT 
    p_event_id, 
    lower(trim(email)), 
    'participant'
  FROM jsonb_to_recordset(p_members) AS x(email TEXT)
  ON CONFLICT (event_id, email) DO NOTHING;

  -- 3. Upsert Registrations linking to event_teams
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
    team_id,
    team_role,
    registration_data
  )
  SELECT 
    p_event_id, 
    lower(trim(x.email)), 
    x.full_name, 
    x.phone,
    x.college,
    x.branch,
    x.academic_year,
    COALESCE(x.breakfast_opted, false), 
    COALESCE(x.lunch_opted, false), 
    COALESCE(x.dinner_opted, false), 
    t.id,
    x.team_role,
    x.registration_data
  FROM jsonb_to_recordset(p_members) AS x(
    email TEXT, 
    full_name TEXT, 
    phone TEXT,
    college TEXT,
    branch TEXT,
    academic_year TEXT,
    breakfast_opted BOOLEAN, 
    lunch_opted BOOLEAN, 
    dinner_opted BOOLEAN, 
    team_name TEXT,
    team_role TEXT,
    registration_data JSONB
  )
  JOIN public.event_teams t ON t.event_id = p_event_id AND t.name = trim(x.team_name)
  ON CONFLICT (event_id, email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    college = EXCLUDED.college,
    branch = EXCLUDED.branch,
    academic_year = EXCLUDED.academic_year,
    breakfast_opted = EXCLUDED.breakfast_opted,
    lunch_opted = EXCLUDED.lunch_opted,
    dinner_opted = EXCLUDED.dinner_opted,
    team_id = EXCLUDED.team_id,
    team_role = EXCLUDED.team_role,
    registration_data = EXCLUDED.registration_data,
    imported_at = now();
END;
$$;

REVOKE EXECUTE ON FUNCTION public.import_teams_allowlist(UUID, JSONB, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.import_teams_allowlist(UUID, JSONB, JSONB) TO authenticated, service_role;
