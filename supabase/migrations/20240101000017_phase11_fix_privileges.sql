-- Migration: 20240101000017_phase11_fix_privileges.sql
-- Description: Fix permission denied on registration_allowlist for authenticated users (admin role via RLS).

GRANT SELECT ON public.registration_allowlist TO authenticated;
GRANT INSERT ON public.registration_allowlist TO authenticated;
GRANT UPDATE ON public.registration_allowlist TO authenticated;
