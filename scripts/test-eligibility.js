const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
)

async function test() {
  console.log('Testing Participant Dashboard...')
  const { data: pAuth, error: pError } = await supabase.auth.signInWithPassword({
    email: 'testparticipant@aimers.example',
    password: 'AIMERS_TestPart_2026!'
  })
  
  if (pError) throw pError
  
  const { data: pData, error: pRpcError } = await supabase.rpc('get_eligible_participant_events')
  if (pRpcError) {
    console.error('Participant RPC Failed:', pRpcError)
  } else {
    console.log('Participant Eligible Events:', pData)
  }

  console.log('\nTesting Coordinator Dashboard...')
  const { data: cAuth, error: cError } = await supabase.auth.signInWithPassword({
    email: 'testcoordinator@aimers.example',
    password: 'AIMERS_TestCoord_2026!'
  })

  if (cError) throw cError

  const { data: cData, error: cRpcError } = await supabase.rpc('get_eligible_coordinator_events')
  if (cRpcError) {
    console.error('Coordinator RPC Failed:', cRpcError)
  } else {
    console.log('Coordinator Eligible Events:', cData)
  }
}

test().catch(console.error)
