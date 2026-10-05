const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
)

async function test() {
  const { data: auth, error: loginError } = await supabase.auth.signInWithPassword({
    email: 'testadmin@aimers.example',
    password: 'AIMERS_TestAdmin_2026!'
  })
  
  if (loginError) {
    console.error('Login Failed:', loginError)
    return
  }

  const { data: profile } = await supabase.from('profiles').select('*').single()
  console.log('Admin Profile:', profile)

  console.log('Attempting to insert event...')
  const { data, error } = await supabase.from('events').insert({
    name: 'Test Event',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 86400000).toISOString(),
    created_by: auth.user.id
  }).select()

  if (error) {
    console.error('Insert Failed - Code:', error.code)
    console.error('Message:', error.message)
    console.error('Details:', error.details)
    console.error('Hint:', error.hint)
  } else {
    console.log('Insert Success:', data)
    // Clean up
    await supabase.from('events').delete().eq('id', data[0].id)
  }
}

test()
