-- Migration: 20240101000028_fix_problem_statement_grants.sql
-- Description: Grant permissions to service_role on event_problem_statements

GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_problem_statements TO service_role;
GRANT SELECT ON public.event_problem_statements TO authenticated;
