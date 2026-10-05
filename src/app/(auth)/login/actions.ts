'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Determine user's role to redirect appropriately
  if (data.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    const role = profile?.role?.trim().toLowerCase()
    if (role === 'admin') {
      redirect('/admin')
    }

    // Check if user is a coordinator
    const { count: coordinatorCount } = await supabase
      .from('event_coordinators')
      .select('*', { count: 'exact', head: true })
      .eq('coordinator_id', data.user.id)

    let isCoordinator = false
    if (coordinatorCount && coordinatorCount > 0) {
      isCoordinator = true
    }

    let adminClient = supabase
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
      adminClient = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      ) as typeof supabase
    }

    const { data: pendingEvents } = await adminClient
      .from('registration_allowlist')
      .select('event_id')
      .ilike('email', data.user.email || '')
      .eq('invited_role', 'coordinator')
      
    if (pendingEvents && pendingEvents.length > 0) {
      isCoordinator = true
      
      for (const pe of pendingEvents) {
        const { error: insertErr } = await adminClient.from('event_coordinators').insert({
          event_id: pe.event_id,
          coordinator_id: data.user.id
        })
        // Ignore duplicate errors to ensure task preservation and idempotency
        if (insertErr && insertErr.code !== '23505') {
          console.error("Failed to assign coordinator:", insertErr)
        }
      }
    }

    if (isCoordinator) {
      redirect('/coordinator')
    } else {
      redirect('/participant')
    }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
