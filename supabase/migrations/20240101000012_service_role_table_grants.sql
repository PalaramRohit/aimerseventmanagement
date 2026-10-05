-- Migration: 20240101000012_service_role_table_grants.sql
GRANT ALL ON public.event_registrations TO service_role;
