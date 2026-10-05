'use server'

import { requireAdmin } from '@/lib/auth/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const addParticipantSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, "Email is required").email("Invalid email format"),
  full_name: z.string().trim().min(1, "Name is required"),
  phone: z.string().trim().optional().or(z.literal('')),
  college: z.string().trim().optional().or(z.literal('')),
  branch: z.string().trim().optional().or(z.literal('')),
  academic_year: z.string().trim().optional().or(z.literal('')),
  breakfast_opted: z.boolean().default(false),
  lunch_opted: z.boolean().default(false),
  dinner_opted: z.boolean().default(false)
})

export type ParticipantData = {
  // From event_registrations
  email: string
  full_name: string | null
  phone: string | null
  college: string | null
  branch: string | null
  academic_year: string | null
  breakfast_opted: boolean
  lunch_opted: boolean
  dinner_opted: boolean
  registration_data: Record<string, unknown> | null
  imported_at: string | null
  // From event_participants (Left Join)
  participant_id: string | null
  status: string | null
  registered_at: string | null
  // From operational tables
  attendance_scanned_at: string | null
  breakfast_scanned_at: string | null
  lunch_scanned_at: string | null
  dinner_scanned_at: string | null
}

export async function getEventParticipants(eventId: string): Promise<{ data?: ParticipantData[], error?: string }> {
  try {
    const { supabase } = await requireAdmin()

    // 1. Fetch Registrations and their roles via registration_allowlist
    const { data: registrations, error: regErr } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId)

    if (regErr) throw regErr

    // 1.5 Fetch allowlist for participants to filter out coordinators
    const { data: allowlist, error: allowlistErr } = await supabase
      .from('registration_allowlist')
      .select('email, invited_role')
      .eq('event_id', eventId)
      
    if (allowlistErr) throw allowlistErr
    
    const participantEmails = new Set(
      allowlist
        .filter(a => a.invited_role === 'participant')
        .map(a => a.email.toLowerCase())
    )

    // FILTER REGISTRATIONS TO ONLY PARTICIPANTS
    const participantRegistrations = (registrations || []).filter(reg => participantEmails.has(reg.email.toLowerCase()))

    // 2. Fetch event_participants to get status and participant_id
    const { data: participants, error: partErr } = await supabase
      .from('event_participants')
      .select('participant_id, status, registered_at, profiles!inner(email)')
      .eq('event_id', eventId)
      
    if (partErr) throw partErr

    // Create a lookup for participants by email
    const participantMap = new Map<string, Record<string, unknown>>()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    participants.forEach((p: any) => {
      participantMap.set(p.profiles.email.toLowerCase(), p)
    })

    // 3. Fetch Operational Records (Attendance & Food)
    const { data: attendance, error: attErr } = await supabase
      .from('attendance_records')
      .select('participant_id, scanned_at')
      .eq('event_id', eventId)

    if (attErr) throw attErr
    
    const attendanceMap = new Map<string, string>()
    attendance.forEach(a => {
      if (a.participant_id) attendanceMap.set(a.participant_id, a.scanned_at || '')
    })

    const { data: food, error: foodErr } = await supabase
      .from('food_records')
      .select('participant_id, meal_type, scanned_at')
      .eq('event_id', eventId)

    if (foodErr) throw foodErr

    const foodMap = new Map<string, Record<string, string>>()
    food.forEach(f => {
      if (!f.participant_id) return
      if (!foodMap.has(f.participant_id)) foodMap.set(f.participant_id, {})
      foodMap.get(f.participant_id)![f.meal_type] = f.scanned_at || ''
    })

    // 4. Merge Data
    const result: ParticipantData[] = participantRegistrations.map(reg => {
      const p = participantMap.get(reg.email.toLowerCase())
      const pId = p?.participant_id as string | undefined
      
      return {
        email: reg.email,
        full_name: reg.full_name,
        phone: reg.phone,
        college: reg.college,
        branch: reg.branch,
        academic_year: reg.academic_year,
        breakfast_opted: !!reg.breakfast_opted,
        lunch_opted: !!reg.lunch_opted,
        dinner_opted: !!reg.dinner_opted,
        registration_data: reg.registration_data as Record<string, unknown> | null,
        imported_at: reg.imported_at,
        participant_id: pId || null,
        status: (p?.status as string) || 'Pending Login',
        registered_at: (p?.registered_at as string) || null,
        attendance_scanned_at: pId ? (attendanceMap.get(pId) || null) : null,
        breakfast_scanned_at: pId ? (foodMap.get(pId)?.breakfast || null) : null,
        lunch_scanned_at: pId ? (foodMap.get(pId)?.lunch || null) : null,
        dinner_scanned_at: pId ? (foodMap.get(pId)?.dinner || null) : null,
      }
    })

    return { data: result }

  } catch (err) {
    console.error("Error fetching participants:", err)
    return { error: "Failed to fetch participants" }
  }
}

export async function addParticipantManual(eventId: string, formData: FormData): Promise<{ success?: boolean, error?: string }> {
  try {
    const { supabase } = await requireAdmin()

    // Validate Input
    const rawData = {
      email: formData.get('email'),
      full_name: formData.get('full_name'),
      phone: formData.get('phone') || null,
      college: formData.get('college') || null,
      branch: formData.get('branch') || null,
      academic_year: formData.get('academic_year') || null,
      breakfast_opted: formData.get('breakfast_opted') === 'true',
      lunch_opted: formData.get('lunch_opted') === 'true',
      dinner_opted: formData.get('dinner_opted') === 'true',
    }

    const val = addParticipantSchema.safeParse(rawData)
    if (!val.success) return { error: val.error.issues[0].message }

    const data = val.data

    // Check if already registered for this event
    const { data: existing } = await supabase
      .from('event_registrations')
      .select('email')
      .eq('event_id', eventId)
      .eq('email', data.email)
      .single()

    if (existing) {
      return { error: "Participant is already registered for this event." }
    }

    // Insert into event_registrations via import RPC (to keep logic identical)
    const payload = [{
      email: data.email,
      invited_role: 'participant',
      full_name: data.full_name,
      phone: data.phone,
      college: data.college,
      branch: data.branch,
      academic_year: data.academic_year,
      breakfast_opted: data.breakfast_opted,
      lunch_opted: data.lunch_opted,
      dinner_opted: data.dinner_opted
    }]

    const { error: importErr } = await supabase.rpc('import_event_allowlist', {
      p_event_id: eventId,
      p_rows: payload
    })

    if (importErr) {
      console.error(importErr)
      return { error: "Failed to add registration record." }
    }

    // Onboarding: Check if user exists globally
    const { data: globalUser } = await supabase.auth.admin.listUsers()
    const userExists = globalUser.users.some(u => u.email === data.email)

    if (!userExists) {
      // Invite user to set their password!
      const { error: inviteErr } = await supabase.auth.admin.inviteUserByEmail(data.email)
      if (inviteErr) {
        console.error("Invite error:", inviteErr)
        // We do not fail the registration entirely, but log it.
        // It could be they have Auth disabled or rate limited.
      }
    }

    revalidatePath(`/admin/events/${eventId}`)
    return { success: true }
  } catch (err) {
    console.error("Error adding participant:", err)
    return { error: "An unexpected error occurred." }
  }
}
