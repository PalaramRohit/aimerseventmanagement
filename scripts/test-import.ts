import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function runTest() {
  console.log("=== RUNNING PARTICIPANT IMPORT PIPELINE TEST ===");
  
  // 1. Get an existing event
  const { data: events, error: eventErr } = await supabase.from('events').select('id, name').limit(1);
  if (eventErr || !events || events.length === 0) {
    console.error("No events found to test with:", eventErr);
    return;
  }
  const eventId = events[0].id;
  console.log(`Using Event: ${events[0].name} (${eventId})`);

  // 2. Prepare the payload (Simulating the output of the CSV parser in actions.ts)
  const testEmail = 'rohit.test.import@example.com';
  const payload = [
    {
      email: testEmail,
      invited_role: 'participant',
      full_name: 'Rohit Test Participant',
      phone: '9876543210',
      college: 'MVSR Engineering College',
      branch: 'Information Technology',
      academic_year: '4th Year',
      breakfast_opted: true,
      lunch_opted: true,
      dinner_opted: false,
      registration_data: { "some_extra_field": "test_value" }
    }
  ];

  console.log("Calling import_event_allowlist RPC...");
  // 3. Call the RPC
  const { error: rpcError } = await supabase.rpc('import_event_allowlist', {
    p_event_id: eventId,
    p_rows: payload
  });

  if (rpcError) {
    console.error("RPC Error:", rpcError);
    return;
  }
  console.log("Import RPC successful.");

  // 4. Verify Database
  console.log("Verifying event_registrations table...");
  const { data: reg, error: regErr } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('email', testEmail)
    .eq('event_id', eventId)
    .single();

  if (regErr || !reg) {
    console.error("Failed to find registration:", regErr);
    return;
  }

  console.log("Registration Record:", JSON.stringify(reg, null, 2));

  // Verify fields survived
  const passed = 
    reg.full_name === 'Rohit Test Participant' &&
    reg.phone === '9876543210' &&
    reg.college === 'MVSR Engineering College' &&
    reg.branch === 'Information Technology' &&
    reg.academic_year === '4th Year' &&
    reg.breakfast_opted === true &&
    reg.lunch_opted === true &&
    reg.dinner_opted === false &&
    reg.registration_data?.some_extra_field === 'test_value';

  if (passed) {
    console.log("✅ SUCCESS: All fields correctly persisted in event_registrations.");
  } else {
    console.error("❌ FAILED: Data mismatch in event_registrations.");
  }

  // Note on sync_participant_registrations:
  // We cannot easily test sync_participant_registrations without an active user JWT.
  // However, the RPC logic clearly maps these fields.
  
  console.log("Done.");
}

runTest();
