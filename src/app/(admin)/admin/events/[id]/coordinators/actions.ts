'use server'

import { requireAdmin } from '@/lib/auth/server'
import { z } from 'zod'

import { ALLOWED_CUSTOM_TASKS } from '@/lib/constants'

export type CoordinatorData = {
  coordinator_id: string // For pending, this will be their email prefixed with 'pending_'
  event_id: string
  status: 'Pending Login' | 'Active'
  assigned_at: string | null
  task_attendance: boolean
  task_breakfast: boolean
  task_lunch: boolean
  task_dinner: boolean
  custom_tasks: string[]
  station: string | null
  full_name: string | null
  email: string
  phone: string | null
  
  // Operational Progress
  attendance_scans: number
  breakfast_scans: number
  lunch_scans: number
  dinner_scans: number
  last_scan_time: string | null
  active_status: 'Active' | 'No recent activity' | 'Not started'
}

export async function getEventCoordinators(eventId: string): Promise<{ data?: CoordinatorData[], error?: string }> {
  try {
    const { supabase } = await requireAdmin()

    // 1. Fetch active coordinators with profile data
    const { data: assignments, error: assignErr } = await supabase
      .from('event_coordinators')
      .select(`
        *,
        profiles:coordinator_id (
          full_name,
          email,
          phone
        )
      `)
      .eq('event_id', eventId)

    if (assignErr) throw assignErr
    
    // 1.5 Fetch pending coordinators from registration_allowlist and event_registrations
    // A pending coordinator is someone in allowlist with invited_role='coordinator', but not in event_coordinators
    const { data: pendingAllowlist, error: pendingAllowErr } = await supabase
      .from('registration_allowlist')
      .select('email')
      .eq('event_id', eventId)
      .eq('invited_role', 'coordinator')
      
    if (pendingAllowErr) throw pendingAllowErr
    const coordEmails = pendingAllowlist.map(a => a.email.toLowerCase())
    
    // We optionally get their full name if they registered, otherwise just email
    const { data: pendingRegs, error: pendingErr } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId)
      .in('email', coordEmails.length > 0 ? coordEmails : ['__empty__'])

    if (pendingErr) throw pendingErr
    
    // We also want to show coordinators who haven't even registered (not in event_registrations)
    // but are in the allowlist.
    const registeredEmails = new Set((pendingRegs || []).map(r => r.email.toLowerCase()))
    
    const unregisteredCoords = pendingAllowlist
      .filter(a => !registeredEmails.has(a.email.toLowerCase()))
      .map(a => ({
        event_id: eventId,
        email: a.email,
        full_name: null,
        phone: null,
        imported_at: null,
        created_at: null
      }))
      
    const allPendingCoords = [...(pendingRegs || []), ...unregisteredCoords]

    // 2. Fetch operational records for counts
    // We only want scans done by these coordinators for this event.
    const { data: attendanceScans, error: attErr } = await supabase
      .from('attendance_records')
      .select('scanned_by, scanned_at')
      .eq('event_id', eventId)

    if (attErr) throw attErr

    const { data: foodScans, error: foodErr } = await supabase
      .from('food_records')
      .select('scanned_by, meal_type, scanned_at')
      .eq('event_id', eventId)

    if (foodErr) throw foodErr

    // Process scans
    const result: CoordinatorData[] = assignments.map((a: Record<string, unknown>) => {
      const coordId = a.coordinator_id as string
      
      const myAtt = attendanceScans.filter(s => s.scanned_by === coordId)
      const myFood = foodScans.filter(s => s.scanned_by === coordId)
      
      const breakfastScans = myFood.filter(s => s.meal_type === 'breakfast').length
      const lunchScans = myFood.filter(s => s.meal_type === 'lunch').length
      const dinnerScans = myFood.filter(s => s.meal_type === 'dinner').length
      
      // Find latest scan
      const allScanTimes = [...myAtt, ...myFood]
        .map(s => s.scanned_at)
        .filter(Boolean)
        .map(t => new Date(t as string).getTime())
        
      let lastScanTime: string | null = null
      let activeStatus: 'Active' | 'No recent activity' | 'Not started' = 'Not started'
      
      if (allScanTimes.length > 0) {
        const latestMs = Math.max(...allScanTimes)
        lastScanTime = new Date(latestMs).toISOString()
        
        // Define "recent" as within the last 2 hours (120 minutes)
        const isRecent = (Date.now() - latestMs) < (120 * 60 * 1000)
        activeStatus = isRecent ? 'Active' : 'No recent activity'
      }

      return {
        coordinator_id: coordId,
        event_id: a.event_id as string,
        status: 'Active',
        assigned_at: a.assigned_at as string | null,
        task_attendance: !!a.task_attendance,
        task_breakfast: !!a.task_breakfast,
        task_lunch: !!a.task_lunch,
        task_dinner: !!a.task_dinner,
        custom_tasks: Array.isArray(a.custom_tasks) ? a.custom_tasks : [],
        station: a.station as string | null,
        full_name: (a.profiles as Record<string, string>)?.full_name || null,
        email: (a.profiles as Record<string, string>)?.email || '',
        phone: (a.profiles as Record<string, string>)?.phone || null,
        attendance_scans: myAtt.length,
        breakfast_scans: breakfastScans,
        lunch_scans: lunchScans,
        dinner_scans: dinnerScans,
        last_scan_time: lastScanTime,
        active_status: activeStatus
      } as CoordinatorData
    })

    // Identify pending by excluding active emails
    const activeEmails = new Set(result.map(r => (r.email || '').toLowerCase()))
    
    const pendingResult: CoordinatorData[] = allPendingCoords
      .filter(p => !activeEmails.has((p.email || '').toLowerCase()))
      .map(p => ({
        coordinator_id: `pending_${p.email}`,
        event_id: p.event_id,
        status: 'Pending Login',
        assigned_at: p.imported_at || null,
        task_attendance: false,
        task_breakfast: false,
        task_lunch: false,
        task_dinner: false,
        custom_tasks: [],
        station: null,
        full_name: p.full_name,
        email: p.email,
        phone: p.phone,
        attendance_scans: 0,
        breakfast_scans: 0,
        lunch_scans: 0,
        dinner_scans: 0,
        last_scan_time: null,
        active_status: 'Not started'
      }))

    return { data: [...result, ...pendingResult].sort((a) => a.status === 'Active' ? -1 : 1) }
  } catch (err) {
    console.error("Error fetching event coordinators:", err)
    return { error: "Failed to load coordinators." }
  }
}

export async function assignCoordinatorByEmail(
  eventId: string,
  email: string,
  assignmentData?: {
    task_attendance?: boolean
    task_breakfast?: boolean
    task_lunch?: boolean
    task_dinner?: boolean
    custom_tasks?: string[]
    station?: string | null
  }
): Promise<{ success?: boolean, error?: string }> {
  try {
    const { supabase } = await requireAdmin()
    
    // Validate email
    const parsedEmail = z.string().email().safeParse(email.trim().toLowerCase())
    if (!parsedEmail.success) {
      return { error: "Invalid email address." }
    }
    
    const parsedCustomTasks = z.array(z.enum(ALLOWED_CUSTOM_TASKS)).safeParse(assignmentData?.custom_tasks || [])
    
    if (!parsedCustomTasks.success) {
      return { error: "Invalid custom tasks selected." }
    }

    const { data: profiles, error: profErr } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('email', parsedEmail.data)
      
    if (profErr || !profiles || profiles.length === 0) {
      return { error: "User not found. The user must sign up or exist in the system first." }
    }
    
    const profile = profiles[0]
    
    // Check if already assigned to this event
    const { data: existing } = await supabase
      .from('event_coordinators')
      .select('id')
      .eq('event_id', eventId)
      .eq('coordinator_id', profile.id)
      .single()
      
    // Create adminClient securely
    let adminClient = supabase
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
      adminClient = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      ) as unknown as import('@supabase/supabase-js').SupabaseClient
    }

    if (existing) {
      // Upsert/Update the existing assignment instead of throwing an error
      const { error: updateErr } = await adminClient
        .from('event_coordinators')
        .update({
          task_attendance: assignmentData?.task_attendance ?? false,
          task_breakfast: assignmentData?.task_breakfast ?? false,
          task_lunch: assignmentData?.task_lunch ?? false,
          task_dinner: assignmentData?.task_dinner ?? false,
          custom_tasks: parsedCustomTasks.data,
          station: assignmentData?.station || null
        })
        .eq('id', existing.id)
        .eq('event_id', eventId)

      if (updateErr) {
        console.error("Error updating assignment:", updateErr)
        return { error: "Failed to update existing assignment." }
      }
      return { success: true }
    }
    
    // Create assignment
    const { error: insertErr } = await adminClient
      .from('event_coordinators')
      .insert({
        event_id: eventId,
        coordinator_id: profile.id,
        task_attendance: assignmentData?.task_attendance ?? false,
        task_breakfast: assignmentData?.task_breakfast ?? false,
        task_lunch: assignmentData?.task_lunch ?? false,
        task_dinner: assignmentData?.task_dinner ?? false,
        custom_tasks: parsedCustomTasks.data,
        station: assignmentData?.station || null
      })
      
    if (insertErr) {
      if (insertErr.code === '23505') {
        return { error: "This user is already a coordinator for this event." }
      }
      throw insertErr
    }
    
    if (profile.role === 'participant') {
      const { error: roleErr } = await adminClient
        .from('profiles')
        .update({ role: 'coordinator' })
        .eq('id', profile.id)
        
      if (roleErr) throw roleErr
    }

    return { success: true }
  } catch (err) {
    console.error("Error assigning coordinator:", err)
    return { error: "An unexpected error occurred while assigning the coordinator." }
  }
}

export async function updateCoordinatorAssignment(
  eventId: string,
  coordinatorId: string,
  data: {
    task_attendance: boolean
    task_breakfast: boolean
    task_lunch: boolean
    task_dinner: boolean
    custom_tasks?: string[]
    station: string | null
  }
): Promise<{ success?: boolean, error?: string }> {
  try {
    const { supabase } = await requireAdmin()
    
    const parsedCustomTasks = z.array(z.enum(ALLOWED_CUSTOM_TASKS)).safeParse(data.custom_tasks || [])
    
    if (!parsedCustomTasks.success) {
      return { error: "Invalid custom tasks selected." }
    }
    
    let adminClient = supabase
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
      adminClient = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      ) as unknown as import('@supabase/supabase-js').SupabaseClient
    }

    // Ensure we scope the update to event_id for security
    const { error: updateErr } = await adminClient
      .from('event_coordinators')
      .update({
        task_attendance: data.task_attendance,
        task_breakfast: data.task_breakfast,
        task_lunch: data.task_lunch,
        task_dinner: data.task_dinner,
        custom_tasks: parsedCustomTasks.data,
        station: data.station
      })
      .eq('event_id', eventId)
      .eq('coordinator_id', coordinatorId)
      
    if (updateErr) throw updateErr
    
    return { success: true }
  } catch (err) {
    console.error("Error updating coordinator:", err)
    return { error: "Failed to update coordinator responsibilities." }
  }
}

export async function removeCoordinatorAssignment(eventId: string, coordinatorId: string): Promise<{ success?: boolean, error?: string }> {
  try {
    const { supabase } = await requireAdmin()
    
    let adminClient = supabase
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
      adminClient = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      ) as unknown as import('@supabase/supabase-js').SupabaseClient
    }
    
    if (coordinatorId.startsWith('pending_')) {
      // It's a pending coordinator, remove from allowlist and event_registrations
      const email = coordinatorId.replace('pending_', '')
      
      const { error: allowlistDelErr } = await adminClient
        .from('registration_allowlist')
        .delete()
        .eq('event_id', eventId)
        .eq('email', email)
        .eq('invited_role', 'coordinator')
        
      if (allowlistDelErr) throw allowlistDelErr
      
      const { error: delErr } = await adminClient
        .from('event_registrations')
        .delete()
        .eq('event_id', eventId)
        .eq('email', email)
        
      if (delErr) throw delErr
      return { success: true }
    }
    
    const { error: delErr } = await adminClient
      .from('event_coordinators')
      .delete()
      .eq('event_id', eventId)
      .eq('coordinator_id', coordinatorId)
      
    if (delErr) throw delErr
    
    return { success: true }
  } catch (err) {
    console.error("Error removing coordinator:", err)
    return { error: "Failed to remove coordinator." }
  }
}

export async function addCoordinatorManual(eventId: string, formData: FormData): Promise<{ success?: boolean, error?: string }> {
  try {
    const { supabase } = await requireAdmin()

    const email = String(formData.get('email') || '').trim()
    const full_name = formData.get('full_name') ? String(formData.get('full_name')).trim() : null
    const phone = formData.get('phone') ? String(formData.get('phone')).trim() : null

    if (!email) {
      return { error: 'Email is required' }
    }

    const parsedEmail = z.string().email().safeParse(email)
    if (!parsedEmail.success) {
      return { error: "Invalid email address." }
    }

    // Upsert into event_registrations via import RPC
    const payload = [{
      email: email,
      invited_role: 'coordinator',
      full_name: full_name,
      phone: phone,
      college: null,
      branch: null,
      academic_year: null,
      breakfast_opted: false,
      lunch_opted: false,
      dinner_opted: false
    }]

    const { error: importErr } = await supabase.rpc('import_event_allowlist', {
      p_event_id: eventId,
      p_rows: payload
    })

    if (importErr) {
      console.error(importErr)
      return { error: "Failed to add coordinator to the registry. " + importErr.message }
    }

    // Try to auto-assign them right now if they already have an account in the system
    await assignCoordinatorByEmail(eventId, email).catch(console.error);

    return { success: true }
  } catch (err) {
    console.error("Error adding coordinator manually:", err)
    return { error: "An unexpected error occurred while adding the coordinator." }
  }
}
