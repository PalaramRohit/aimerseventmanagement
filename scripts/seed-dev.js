const { createClient } = require('@supabase/supabase-js')

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('ERROR: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.')
  process.exit(1)
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function main() {
  console.log('🌱 Starting Phase 6 Test Environment Seeding...')

  // Test accounts definitions
  const accounts = {
    admin: { email: 'testadmin@aimers.example', password: 'AIMERS_TestAdmin_2026!', fullName: 'Test Admin', targetRole: 'admin' },
    coordinator: { email: 'testcoordinator@aimers.example', password: 'AIMERS_TestCoord_2026!', fullName: 'Test Coordinator', targetRole: 'participant' },
    participant: { email: 'testparticipant@aimers.example', password: 'AIMERS_TestPart_2026!', fullName: 'Test Participant', targetRole: 'participant' },
  }

  const userIds = {}

  for (const [key, account] of Object.entries(accounts)) {
    console.log(`\nProcessing ${key} account (${account.email})...`)
    
    // Check if user exists (by email) - using Admin API requires pagination or listing. 
    // We can just try to create. If it fails due to existing email, we query auth.users via SQL/RPC or just use admin API
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    
    let user = users?.find(u => u.email === account.email)
    
    if (user) {
      console.log(`User ${account.email} already exists.`)
    } else {
      console.log(`Creating user ${account.email}...`)
      const { data: newUserData, error: createError } = await supabase.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true,
        user_metadata: { full_name: account.fullName }
      })
      if (createError) {
        console.error(`Failed to create ${account.email}:`, createError.message)
        continue
      }
      user = newUserData.user
      console.log(`Created user ${account.email}. Waiting for profile trigger...`)
      // Wait a moment for Postgres trigger on auth.users to create the profile
      await new Promise(res => setTimeout(res, 2000))
    }

    userIds[key] = user.id

    // Enforce profile role
    if (account.targetRole === 'admin') {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', user.id)
      
      if (updateError) {
        console.error(`Failed to set admin role for ${account.email}:`, updateError.message)
      } else {
        console.log(`Successfully elevated ${account.email} to Admin via service role.`)
      }
    } else {
      // Ensure it stays participant
      await supabase
        .from('profiles')
        .update({ role: 'participant' })
        .eq('id', user.id)
    }
  }

  if (!userIds.admin || !userIds.coordinator || !userIds.participant) {
    console.error('Failed to resolve all test user IDs. Aborting event creation.')
    process.exit(1)
  }

  console.log('\n📅 Setting up Test Event...')
  const eventName = 'AIMERS Phase 6 Test Event'
  
  // Clean up any old test event with the same name
  await supabase.from('events').delete().eq('name', eventName)

  const startDate = new Date()
  startDate.setDate(startDate.getDate() + 7) // 7 days from now
  const endDate = new Date(startDate)
  endDate.setHours(endDate.getHours() + 5)

  // Create event as admin
  const { data: event, error: eventError } = await supabase
    .from('events')
    .insert({
      name: eventName,
      description: 'Development test event for validating Phase 6 workflows.',
      venue: 'Main Auditorium, Test Campus',
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      max_participants: 100,
      registration_open: true,
      attendance_enabled: false,
      breakfast_enabled: true,
      lunch_enabled: true,
      dinner_enabled: false,
      created_by: userIds.admin
    })
    .select()
    .single()

  if (eventError || !event) {
    console.error('Failed to create test event:', eventError?.message)
    process.exit(1)
  }
  console.log(`Created event: ${eventName} (${event.id})`)

  console.log('\n📝 Populating Registration Allowlist...')
  
  const allowlistData = [
    { 
      email: accounts.participant.email, 
      invited_role: 'participant',
      full_name: 'Test Participant (Imported)',
      breakfast_opted: true,
      lunch_opted: false,
      dinner_opted: false,
      registration_data: { dietary: "none", custom_form_field: "test" }
    },
    { 
      email: accounts.coordinator.email, 
      invited_role: 'coordinator',
      full_name: 'Test Coordinator (Imported)',
    }
  ]

  // Use the admin RPC to seed both allowlist and event_registrations atomically
  const { error: allowlistError } = await supabase.rpc('import_event_allowlist', {
    p_event_id: event.id,
    p_rows: allowlistData
  })

  if (allowlistError) {
    console.error('Failed to populate allowlist via RPC:', allowlistError)
    process.exit(1)
  }
  console.log('Allowlist and Event Registrations populated successfully.')

  console.log('\n👨‍💼 Seeding Coordinator Assignment...')
  const { error: coordError } = await supabase
    .from('event_coordinators')
    .insert({
      event_id: event.id,
      coordinator_id: userIds.coordinator
    })

  if (coordError) {
    console.error('Failed to seed event coordinator:', coordError.message)
    process.exit(1)
  }
  console.log('Coordinator assignment seeded successfully.')

  console.log('\n✅ Phase 6 Seed Complete!')
}

main().catch(console.error)
