-- Migration: 20240101000007_service_role_grants.sql
-- Description: Ensure service_role has ALL permissions on tables

GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.events TO service_role;
GRANT ALL ON public.registration_allowlist TO service_role;
GRANT ALL ON public.event_coordinators TO service_role;
GRANT ALL ON public.event_participants TO service_role;
GRANT ALL ON public.attendance_records TO service_role;
GRANT ALL ON public.food_records TO service_role;
GRANT ALL ON public.participant_matrix_tokens TO service_role;
