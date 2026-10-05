-- Migration: 20240101000008_authenticated_select_grants.sql
-- Description: Grant base SELECT privileges to authenticated users so RLS policies can be evaluated.

GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.events TO authenticated;
GRANT SELECT ON public.event_participants TO authenticated;
GRANT SELECT ON public.event_coordinators TO authenticated;
