-- Migration: 20240101000030_fix_event_teams_service_role.sql
-- Description: Grant permissions to service_role on event_teams

GRANT ALL ON public.event_teams TO service_role;
