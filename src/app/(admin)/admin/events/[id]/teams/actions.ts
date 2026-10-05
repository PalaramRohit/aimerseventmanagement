'use server'

import { requireAdmin } from '@/lib/auth/server'

export type TeamMemberData = {
  email: string
  full_name: string | null
  phone: string | null
  college: string | null
  branch: string | null
  academic_year: string | null
  team_role: string | null
  breakfast_opted: boolean
  lunch_opted: boolean
  dinner_opted: boolean
  participant_id: string | null
  status: string | null
  registered_at: string | null
  attendance_scanned_at: string | null
  breakfast_scanned_at: string | null
  lunch_scanned_at: string | null
  dinner_scanned_at: string | null
}

export type TeamData = {
  id: string
  name: string
  created_at: string
  problem_statement_id?: string | null
  problem_statements?: { title: string } | null
  github_url?: string | null
  deployed_url?: string | null
  submitted_at?: string | null
  members: TeamMemberData[]
}

export async function getEventTeams(eventId: string): Promise<{ data?: TeamData[], error?: string }> {
  try {
    const { supabase } = await requireAdmin()

    // 1. Fetch Teams
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: teams, error: teamsErr } = await (supabase as any)
      .from('event_teams')
      .select('*, problem_statements:event_problem_statements(title)')
      .eq('event_id', eventId)

    if (teamsErr) throw teamsErr
    if (!teams || teams.length === 0) return { data: [] }

    // 2. Fetch Registrations that belong to teams
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: registrations, error: regErr } = await (supabase as any)
      .from('event_registrations')
      .select('email, full_name, phone, college, branch, academic_year, team_id, team_role, breakfast_opted, lunch_opted, dinner_opted')
      .eq('event_id', eventId)
      .not('team_id', 'is', null)

    if (regErr) throw regErr

    // 3. Fetch Event Participants (who have logged in)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: participants, error: partErr } = await (supabase as any)
      .from('event_participants')
      .select('participant_id, status, registered_at, profiles!inner(email)')
      .eq('event_id', eventId)
      .not('team_id', 'is', null)

    if (partErr) throw partErr

    const participantMap = new Map<string, Record<string, unknown>>()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    participants.forEach((p: any) => {
      if (p.profiles?.email) {
        participantMap.set(p.profiles.email.toLowerCase(), p)
      }
    })

    // 4. Fetch Attendance & Food
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

    // 5. Merge Data
    const teamMap = new Map<string, TeamData>()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    teams.forEach((t: any) => {
      teamMap.set(t.id, {
        id: t.id,
        name: t.name,
        created_at: t.created_at,
        problem_statement_id: t.problem_statement_id,
        problem_statements: t.problem_statements,
        github_url: t.github_url,
        deployed_url: t.deployed_url,
        submitted_at: t.submitted_at,
        members: []
      })
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    registrations.forEach((reg: any) => {
      if (!reg.team_id || !teamMap.has(reg.team_id)) return
      
      const p = participantMap.get(reg.email.toLowerCase())
      const pId = p?.participant_id as string | undefined
      
      const memberData: TeamMemberData = {
        email: reg.email,
        full_name: reg.full_name,
        phone: reg.phone,
        college: reg.college,
        branch: reg.branch,
        academic_year: reg.academic_year,
        team_role: reg.team_role,
        breakfast_opted: !!reg.breakfast_opted,
        lunch_opted: !!reg.lunch_opted,
        dinner_opted: !!reg.dinner_opted,
        participant_id: pId || null,
        status: (p?.status as string) || 'Pending Login',
        registered_at: (p?.registered_at as string) || null,
        attendance_scanned_at: pId ? (attendanceMap.get(pId) || null) : null,
        breakfast_scanned_at: pId ? (foodMap.get(pId)?.breakfast || null) : null,
        lunch_scanned_at: pId ? (foodMap.get(pId)?.lunch || null) : null,
        dinner_scanned_at: pId ? (foodMap.get(pId)?.dinner || null) : null,
      }
      
      teamMap.get(reg.team_id)!.members.push(memberData)
    })

    // Convert map to array and optionally sort by name
    const result = Array.from(teamMap.values()).sort((a, b) => a.name.localeCompare(b.name))

    return { data: result }

  } catch (err: unknown) {
    const error = err as Error
    console.error("Error fetching teams:", error?.message || error, error?.stack || '', JSON.stringify(error))
    return { error: "Failed to fetch teams" }
  }
}
