'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const requestedRole = formData.get('requested_role') as string
  const adminSecret = formData.get('admin_secret') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  let adminClient = supabase as unknown as import('@supabase/supabase-js').SupabaseClient
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
    adminClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }

  let isAdminSignup = false

  if (requestedRole === 'admin') {
    if (!adminSecret) {
      return { error: 'Admin Access Secret is required for admin signups.' }
    }

    const expectedSecret = process.env.ADMIN_BOOTSTRAP_SECRET
    if (!expectedSecret || adminSecret !== expectedSecret) {
      return { error: 'Invalid Admin Access Secret.' }
    }

    const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL
    let isAuthorized = false

    if (bootstrapEmail && email.toLowerCase() === bootstrapEmail.toLowerCase()) {
      // Ensure no admin currently exists
      const { count: adminCount } = await adminClient
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin')

      if (adminCount === 0) {
        isAuthorized = true
      }
    } else {
      const { data: allowlistEntry } = await adminClient
        .from('admin_allowlist')
        .select('*')
        .eq('email', email.toLowerCase())
        .is('revoked_at', null)
        .is('used_at', null)
        .single()

      if (allowlistEntry) {
        isAuthorized = true
      }
    }

    if (!isAuthorized) {
      return { error: 'This email is not authorized for Admin registration.' }
    }
    isAdminSignup = true
  }

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user) {
    if (isAdminSignup) {
      // Create or update profile role
      await adminClient.from('profiles').upsert({
        id: data.user.id,
        email: data.user.email,
        role: 'admin',
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })

      // Mark allowlist as used if applicable
      const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL
      if (!bootstrapEmail || email.toLowerCase() !== bootstrapEmail.toLowerCase()) {
        await adminClient.from('admin_allowlist')
          .update({ used_at: new Date().toISOString() })
          .eq('email', email.toLowerCase())
      }
      redirect('/admin')
    } else {
      // Normal participant/coordinator routing check
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      const role = profile?.role?.trim().toLowerCase()
      if (role === 'admin') {
        redirect('/admin')
      }

      const { count: coordinatorCount } = await supabase
        .from('event_coordinators')
        .select('*', { count: 'exact', head: true })
        .eq('coordinator_id', data.user.id)

      let isCoordinator = false
      if (coordinatorCount && coordinatorCount > 0) {
        isCoordinator = true
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
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
