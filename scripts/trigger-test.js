const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testTrigger() {
  console.log('Testing trigger...');
  const { data: users } = await supabase.auth.admin.listUsers();
  const testUser = users.users[0];

  const { data: event, error: eventError } = await supabase.from('events').insert({
    name: 'Trigger Test Event',
    start_date: new Date().toISOString(),
    end_date: new Date().toISOString()
  }).select().single();

  if (eventError) return console.log('Event Error:', eventError);

  const { data: ep, error: epError } = await supabase.from('event_participants').insert({
    event_id: event.id,
    participant_id: testUser.id,
    breakfast_opted: true,
    lunch_opted: true,
    dinner_opted: true
  }).select().single();

  if (epError) return console.log('EP Error:', epError);

  console.log('Inserted EP. Checking tokens...');
  const { data: tokens } = await supabase.from('participant_matrix_tokens').select('*').eq('event_participant_id', ep.id);
  
  if (tokens && tokens.length === 4) {
    console.log('✅ Generated 4 tokens successfully:', tokens.map(t => t.token_type));
  } else {
    console.log('❌ Tokens missing or incorrect count:', tokens);
  }

  // Clean up
  await supabase.from('events').delete().eq('id', event.id);
  console.log('Cleaned up.');
}
testTrigger();
