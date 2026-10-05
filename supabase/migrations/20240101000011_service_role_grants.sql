-- Migration: 20240101000011_service_role_grants.sql
GRANT EXECUTE ON FUNCTION public.import_event_allowlist(UUID, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_my_event_registrations() TO service_role;
GRANT EXECUTE ON FUNCTION public.sync_participant_registrations() TO service_role;
