-- Migration: 20240101000029_fix_problem_statement_auth_grants.sql
-- Description: Grant permissions to authenticated users on event_problem_statements so RLS can take over

GRANT INSERT, UPDATE, DELETE ON public.event_problem_statements TO authenticated;
