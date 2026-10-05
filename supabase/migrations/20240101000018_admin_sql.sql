-- Migration: 20240101000018_admin_sql.sql
-- Description: Temporary RPC to execute raw SQL for debugging grants

CREATE OR REPLACE FUNCTION public.exec_sql(sql_string text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_string;
END;
$$;
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO service_role;
