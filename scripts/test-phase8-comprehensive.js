const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Sign in as admin to get auth.uid() since the RPC relies on it
const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

async function runTests() {
  console.log('--- PHASE 8 COMPREHENSIVE TESTS ---');
  
  const { error: authError } = await supabaseClient.auth.signInWithPassword({
    email: 'testadmin@aimers.example',
    password: 'AIMERS_TestAdmin_2026!'
  });
  if (authError) return console.error('Login failed:', authError);

  const { data: users } = await supabase.auth.admin.listUsers();
  const testUser = users.users.find(u => u.email === 'testadmin@aimers.example');
  const participantUser = users.users.find(u => u.email === 'testparticipant@aimers.example') || testUser;

  // Create Event A (All enabled)
  const { data: eventA } = await supabase.from('events').insert({
    name: 'Event A', start_date: new Date().toISOString(), end_date: new Date().toISOString(),
    attendance_enabled: true, breakfast_enabled: true, lunch_enabled: true, dinner_enabled: true
  }).select().single();

  // Create Event B (All disabled)
  const { data: eventB } = await supabase.from('events').insert({
    name: 'Event B', start_date: new Date().toISOString(), end_date: new Date().toISOString(),
    attendance_enabled: false, breakfast_enabled: false, lunch_enabled: false, dinner_enabled: false
  }).select().single();

  // Assign coordinator to Event A only
  await supabase.from('event_coordinators').insert({ event_id: eventA.id, coordinator_id: testUser.id });

  // Participant A in Event A (Opted for Breakfast, Lunch, not Dinner)
  const { data: epA } = await supabase.from('event_participants').insert({
    event_id: eventA.id, participant_id: participantUser.id,
    breakfast_opted: true, lunch_opted: true, dinner_opted: false
  }).select().single();

  // Participant B in Event B
  const { data: epB } = await supabase.from('event_participants').insert({
    event_id: eventB.id, participant_id: participantUser.id,
    breakfast_opted: true, lunch_opted: true, dinner_opted: true
  }).select().single();

  // Fetch tokens
  const getTokens = async (epId) => {
    const { data: tokens } = await supabase.from('participant_matrix_tokens').select('*').eq('event_participant_id', epId);
    return {
      attendance: tokens.find(t => t.token_type === 'attendance').token,
      breakfast: tokens.find(t => t.token_type === 'breakfast').token,
      lunch: tokens.find(t => t.token_type === 'lunch').token,
      dinner: tokens.find(t => t.token_type === 'dinner').token,
    };
  };

  const tokensA = await getTokens(epA.id);
  const tokensB = await getTokens(epB.id);

  const test = async (name, eventId, op, token, expectSuccess, expectDuplicate = false, expectMessage = null) => {
    const { data, error } = await supabaseClient.rpc('record_matrix_operation', { p_event_id: eventId, p_operation: op, p_token: token });
    const success = data?.success === expectSuccess;
    const dupMatch = expectDuplicate === false || data?.duplicate === expectDuplicate;
    const msgMatch = !expectMessage || data?.message === expectMessage;
    
    if (success && dupMatch && msgMatch) {
      console.log(`✅ ${name}`);
    } else {
      console.log(`❌ ${name} - Expected success:${expectSuccess} dup:${expectDuplicate} msg:${expectMessage} | Got:`, data, error);
    }
    return data;
  };

  // 2. Verify operations
  await test('Attendance Valid', eventA.id, 'attendance', tokensA.attendance, true, false, 'Attendance recorded');
  await test('Attendance Duplicate', eventA.id, 'attendance', tokensA.attendance, true, true, 'Already marked present');
  await test('Attendance Disabled', eventB.id, 'attendance', tokensB.attendance, false, false, 'Attendance recording is disabled for this event');
  
  await test('Breakfast Valid', eventA.id, 'breakfast', tokensA.breakfast, true, false, 'Breakfast recorded');
  await test('Breakfast Duplicate', eventA.id, 'breakfast', tokensA.breakfast, true, true, 'Breakfast already recorded');
  
  await test('Lunch Valid', eventA.id, 'lunch', tokensA.lunch, true, false, 'Lunch recorded');
  
  await test('Dinner Not Opted', eventA.id, 'dinner', tokensA.dinner, false, false, 'Participant is not registered for Dinner');
  await test('Breakfast Disabled (Event B)', eventB.id, 'breakfast', tokensB.breakfast, false, false, 'Breakfast is not enabled for this event');

  // 3. Token/operation validation
  await test('Att token + Breakfast op', eventA.id, 'breakfast', tokensA.attendance, false, false, 'This is not a breakfast Data Matrix');
  await test('Bkf token + Att op', eventA.id, 'attendance', tokensA.breakfast, false, false, 'This is not a attendance Data Matrix');
  await test('Lun token + Din op', eventA.id, 'dinner', tokensA.lunch, false, false, 'This is not a dinner Data Matrix');
  
  // 4. Event isolation
  await test('Event B token + Event A', eventA.id, 'attendance', tokensB.attendance, false, false, 'This code belongs to another event');
  
  // Create Event C (Not assigned)
  const { data: eventC } = await supabase.from('events').insert({ name: 'Event C', start_date: new Date().toISOString(), end_date: new Date().toISOString() }).select().single();
  // testadmin bypasses assignment check, so it will hit token mismatch first
  await test('Admin bypasses assignment -> Token mismatch', eventC.id, 'attendance', tokensA.attendance, false, false, 'This code belongs to another event');

  // 5. Concurrency
  console.log('Testing Concurrency (Lunch Event A for Participant 2)...');
  // Need a new participant for clean concurrency
  const { data: epC } = await supabase.from('event_participants').insert({ event_id: eventA.id, participant_id: testUser.id, lunch_opted: true, dinner_opted: true }).select().single();
  const tokensC = await getTokens(epC.id);
  
  const [c1, c2] = await Promise.all([
    supabaseClient.rpc('record_matrix_operation', { p_event_id: eventA.id, p_operation: 'dinner', p_token: tokensC.dinner }),
    supabaseClient.rpc('record_matrix_operation', { p_event_id: eventA.id, p_operation: 'dinner', p_token: tokensC.dinner })
  ]);
  const dinRecords = await supabase.from('food_records').select('*').eq('event_participant_id', epC.id).eq('meal_type', 'dinner'); // wait, food_records uses participant_id
  const { data: dinR } = await supabase.from('food_records').select('*').eq('event_id', eventA.id).eq('participant_id', testUser.id).eq('meal_type', 'dinner');
  console.log(`Concurrency Dinner rows: ${dinR.length} (Expected 1)`);
  if (dinR.length === 1 && ((c1.data.duplicate && !c2.data.duplicate) || (!c1.data.duplicate && c2.data.duplicate))) {
    console.log('✅ Concurrency Handled correctly');
  } else {
    console.log('❌ Concurrency failed', c1.data, c2.data);
  }

  // Cleanup
  await supabase.from('events').delete().eq('id', eventA.id);
  await supabase.from('events').delete().eq('id', eventB.id);
  await supabase.from('events').delete().eq('id', eventC.id);
  console.log('--- DONE ---');
}
runTests();
