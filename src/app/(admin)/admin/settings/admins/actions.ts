'use server'

import { requireAdmin } from '@/lib/auth/server'
import { revalidatePath } from 'next/cache'

export type ProfileData = {
  id: string
  full_name: string | null
  email: string
  role: string
}

export async function getProfiles(): Promise<{ data?: ProfileData[], error?: string }> {
  try {
    await requireAdmin()

    // We can use the service_role key to bypass RLS to view all profiles, 
    // or just the admin client. The RLS on profiles may only allow viewing admins?
    // Let's use service_role because admins need to view all participants to promote them.
    const { createClient } = await import('@supabase/supabase-js')
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: profiles, error } = await adminClient
      .from('profiles')
      .select('id, full_name, email, role')
      .order('full_name')

    if (error) throw new Error(error.message)
    
    return { data: profiles || [] }
  } catch (error: unknown) {
    const err = error as Error
    return { error: err.message || 'Failed to fetch profiles.' }
  }
}

export async function setAdminRole(targetUserId: string, makeAdmin: boolean): Promise<{ success?: boolean, error?: string }> {
  try {
    const { user: currentUser } = await requireAdmin()

    if (currentUser.id === targetUserId) {
      return { error: 'You cannot change your own role.' }
    }

    const { createClient } = await import('@supabase/supabase-js')
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    if (!makeAdmin) {
      // Demoting an admin. Ensure they are not the last admin.
      const { count, error: countErr } = await adminClient
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin')

      if (countErr) throw new Error(countErr.message)
      if (count !== null && count <= 1) {
        return { error: 'The final administrator cannot be removed.' }
      }
    }

    const { error: updateError } = await adminClient
      .from('profiles')
      .update({ role: makeAdmin ? 'admin' : 'participant' })
      .eq('id', targetUserId)

    if (updateError) throw new Error(updateError.message)

    revalidatePath('/admin/settings/admins')
    return { success: true }
  } catch (error: unknown) {
    const err = error as Error
    return { error: err.message || 'Failed to update role.' }
  }
}

export type PendingAdmin = {
  id: string
  email: string
  created_at: string
}

export async function getPendingAdmins(): Promise<{ data?: PendingAdmin[], error?: string }> {
  try {
    await requireAdmin()

    const { createClient } = await import('@supabase/supabase-js')
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: pending, error } = await adminClient
      .from('admin_allowlist')
      .select('id, email, created_at')
      .is('revoked_at', null)
      .is('used_at', null)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    
    return { data: pending || [] }
  } catch (error: unknown) {
    const err = error as Error
    return { error: err.message || 'Failed to fetch pending admins.' }
  }
}

export async function inviteAdmin(email: string): Promise<{ success?: boolean, error?: string }> {
  try {
    const { user: currentUser } = await requireAdmin()
    const trimmedEmail = email.trim().toLowerCase()

    if (!trimmedEmail) return { error: 'Email is required' }

    const { createClient } = await import('@supabase/supabase-js')
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error: insertError } = await adminClient
      .from('admin_allowlist')
      .insert({
        email: trimmedEmail,
        invited_by: currentUser.id
      })

    if (insertError) {
      if (insertError.code === '23505') {
        return { error: 'This email is already in the admin allowlist.' }
      }
      throw new Error(insertError.message)
    }

    revalidatePath('/admin/settings/admins')
    return { success: true }
  } catch (error: unknown) {
    const err = error as Error
    return { error: err.message || 'Failed to invite admin.' }
  }
}

export async function revokeAdminInvite(id: string): Promise<{ success?: boolean, error?: string }> {
  try {
    await requireAdmin()

    const { createClient } = await import('@supabase/supabase-js')
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error: updateError } = await adminClient
      .from('admin_allowlist')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', id)

    if (updateError) throw new Error(updateError.message)

    revalidatePath('/admin/settings/admins')
    return { success: true }
  } catch (error: unknown) {
    const err = error as Error
    return { error: err.message || 'Failed to revoke admin invite.' }
  }
}
