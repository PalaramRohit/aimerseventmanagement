const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function run() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  
  // Create an RPC that returns JSON
  const { error: createErr } = await supabase.rpc('exec_sql', {
    sql_string: `
      CREATE OR REPLACE FUNCTION public.exec_sql_json(sql_string text)
      RETURNS json
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      DECLARE
        result json;
      BEGIN
        EXECUTE 'SELECT json_agg(t) FROM (' || sql_string || ') t' INTO result;
        RETURN result;
      END;
      $$;
      GRANT EXECUTE ON FUNCTION public.exec_sql_json(text) TO service_role;
    `
  })
  
  if (createErr) {
    console.error("Failed to create exec_sql_json", createErr)
    return
  }
  
  // Now we can query the policies!
  const queries = [
    `SELECT polname, cmd FROM pg_policy WHERE polrelid = 'event_registrations'::regclass`,
    `SELECT polname, cmd FROM pg_policy WHERE polrelid = 'event_coordinators'::regclass`,
    `SELECT polname, cmd FROM pg_policy WHERE polrelid = 'registration_allowlist'::regclass`
  ]
  
  for (const q of queries) {
    const { data, error } = await supabase.rpc('exec_sql_json', { sql_string: q })
    console.log(q, ":\n", data, error)
  }
}
run().catch(console.error)
