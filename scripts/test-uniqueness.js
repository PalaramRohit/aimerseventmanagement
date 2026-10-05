const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testUniqueness() {
  console.log('--- TESTING TOKEN UNIQUENESS ---');
  
  // 1. Fetch Event ID from our existing recreated EP
  const { data: ep1 } = await supabase
    .from('event_participants')
    .select('*')
    .eq('id', '05fd3893-cbd0-4e48-8d79-ef4d4e87cf21')
    .single();

  const eventId = ep1.event_id;

  // 2. Insert a second dummy user to test with
  const { data: dummyUser } = await supabase.auth.admin.createUser({
    email: 'testparticipant2@aimers.example',
    password: 'password123',
    email_confirm: true
  });

  const participant2Id = dummyUser.user.id;

  // 3. Create EP for Participant 2
  const { data: ep2 } = await supabase.from('event_participants').insert({
    event_id: eventId,
    participant_id: participant2Id,
    breakfast_opted: true,
    lunch_opted: true,
    dinner_opted: true
  }).select().single();

  // 4. Fetch tokens for both EPs
  const { data: tokens1 } = await supabase.from('participant_matrix_tokens').select('*').eq('event_participant_id', ep1.id);
  const { data: tokens2 } = await supabase.from('participant_matrix_tokens').select('*').eq('event_participant_id', ep2.id);

  const att1 = tokens1.find(t => t.token_type === 'attendance').token;
  const att2 = tokens2.find(t => t.token_type === 'attendance').token;
  
  console.log(`Participant A Attendance Token: ${att1}`);
  console.log(`Participant B Attendance Token: ${att2}`);

  if (att1 !== att2) {
    console.log('✅ Tokens are strictly unique per participant.');
  } else {
    console.log('❌ Tokens are duplicate!');
  }

  // 5. Test stability (just fetch tokens1 again)
  const { data: tokens1_refresh } = await supabase.from('participant_matrix_tokens').select('*').eq('event_participant_id', ep1.id);
  const att1_refresh = tokens1_refresh.find(t => t.token_type === 'attendance').token;
  
  if (att1 === att1_refresh) {
    console.log('✅ Token remained stable across simulated refresh.');
  }

  // Clean up dummy user
  await supabase.auth.admin.deleteUser(participant2Id);
  console.log('Cleaned up participant B.');
}

testUniqueness();
