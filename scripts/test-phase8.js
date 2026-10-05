const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runTests() {
  console.log('--- PHASE 8 TESTS ---');
  
  // Create a fresh test event with all meals enabled and attendance enabled
  const { data: event, error: eventError } = await supabase.from('events').insert({
    name: 'Phase 8 Test Event',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 86400).toISOString(),
    attendance_enabled: true,
    breakfast_enabled: true,
    lunch_enabled: true,
    dinner_enabled: true
  }).select().single();

  if (eventError) {
    console.error('Failed to create event:', eventError);
    return;
  }
  
  const eventId = event.id;

  // Fetch admin user to use as coordinator and participant
  const { data: users } = await supabase.auth.admin.listUsers();
  const testUser = users.users.find(u => u.email === 'testadmin@aimers.example');

  // Assign coordinator
  await supabase.from('event_coordinators').insert({
    event_id: eventId,
    coordinator_id: testUser.id
  });

  // Register participant
  const { data: ep } = await supabase.from('event_participants').insert({
    event_id: eventId,
    participant_id: testUser.id,
    breakfast_opted: true,
    lunch_opted: false // explicitly disable lunch to test eligibility
  }).select().single();

  // Get generated tokens
  const { data: tokens } = await supabase.from('participant_matrix_tokens').select('*').eq('event_participant_id', ep.id);
  const attendanceToken = tokens.find(t => t.token_type === 'attendance').token;
  const breakfastToken = tokens.find(t => t.token_type === 'breakfast').token;
  const lunchToken = tokens.find(t => t.token_type === 'lunch').token;

  // We need to simulate the RPC as the coordinator. 
  // We can just call it via supabase.rpc, but using service role bypasses the `auth.uid()` check inside the RPC which expects the coordinator!
  // Wait, if we use service role, `public.get_my_role()` = 'service_role' not 'admin', and `auth.uid()` is null.
  // We should sign in as the admin user and run tests through `supabaseClient`.
  const supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );

  const { error: authError } = await supabaseClient.auth.signInWithPassword({
    email: 'testadmin@aimers.example',
    password: 'AIMERS_TestAdmin_2026!'
  });

  if (authError) {
    console.error('Login failed:', authError);
    return;
  }

  // --- TESTS ---
  
  // TEST 1: Valid Attendance Scan
  console.log('TEST 1: Valid Attendance');
  const res1 = await supabaseClient.rpc('record_matrix_operation', { p_event_id: eventId, p_operation: 'attendance', p_token: attendanceToken });
  console.log('Result:', res1.data, res1.error);

  // TEST 2: Duplicate Attendance Scan
  console.log('TEST 2: Duplicate Attendance');
  const res2 = await supabaseClient.rpc('record_matrix_operation', { p_event_id: eventId, p_operation: 'attendance', p_token: attendanceToken });
  console.log('Result:', res2.data, res2.error);

  // TEST 3 & 4: Concurrent Breakfast Scans (Testing Atomicity)
  console.log('TEST 15 & 16: Concurrent Breakfast Scans');
  const [res3, res4] = await Promise.all([
    supabaseClient.rpc('record_matrix_operation', { p_event_id: eventId, p_operation: 'breakfast', p_token: breakfastToken }),
    supabaseClient.rpc('record_matrix_operation', { p_event_id: eventId, p_operation: 'breakfast', p_token: breakfastToken })
  ]);
  console.log('Result 1:', res3.data);
  console.log('Result 2:', res4.data);

  // Verify only 1 breakfast record exists
  const { data: bRecords } = await supabase.from('food_records').select('*').eq('event_id', eventId).eq('meal_type', 'breakfast');
  console.log('Breakfast records count (should be 1):', bRecords.length);

  // TEST 7: Participant not opted for Lunch
  console.log('TEST 7: Participant not opted for Lunch');
  const res5 = await supabaseClient.rpc('record_matrix_operation', { p_event_id: eventId, p_operation: 'lunch', p_token: lunchToken });
  console.log('Result:', res5.data);

  // TEST 10: Wrong Operation (Breakfast token used for Attendance)
  console.log('TEST 10: Wrong Operation');
  const res6 = await supabaseClient.rpc('record_matrix_operation', { p_event_id: eventId, p_operation: 'attendance', p_token: breakfastToken });
  console.log('Result:', res6.data);

  // Clean up
  await supabase.from('events').delete().eq('id', eventId);
  console.log('--- TESTS COMPLETE ---');
}

runTests();
