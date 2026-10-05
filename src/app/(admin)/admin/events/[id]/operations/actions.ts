'use server'

import { requireAdmin } from '@/lib/auth/server'

export type CoordinatorStat = {
  coordinatorId: string
  name: string
  station: string | null
  tasks: {
    attendance: boolean
    breakfast: boolean
    lunch: boolean
    dinner: boolean
  }
  relevantScans: number
  lastScanTime: string | null
  activityStatus: 'Active' | 'No recent activity' | 'Not started'
}

export type OperationsData = {
  participants: {
    totalRegistered: number
    activeSynchronized: number
    pendingLogin: number
    registeredList: Array<{ name: string; email: string; phone?: string }>
    activeList: Array<{ name: string; email: string }>
    pendingList: Array<{ name: string; email: string; phone?: string }>
  }
  attendance: {
    totalRegistered: number
    attended: number
    notAttended: number
    percentage: number
  }
  meals: {
    breakfast: { eligible: number; consumed: number; remaining: number; percentage: number }
    lunch: { eligible: number; consumed: number; remaining: number; percentage: number }
    dinner: { eligible: number; consumed: number; remaining: number; percentage: number }
  }
  coordinatorStats: CoordinatorStat[]
  insights: string[]
  breakdowns: {
    college: Record<string, number>
    branch: Record<string, number>
    academicYear: Record<string, number>
  }
}

export async function getEventOperationsData(eventId: string): Promise<{ data?: OperationsData; error?: string }> {
  try {
    const { supabase } = await requireAdmin()

    // 0. Fetch participant emails from allowlist
    const { data: participantAllowlist, error: allowlistErr } = await supabase
      .from('registration_allowlist')
      .select('email')
      .eq('event_id', eventId)
      .eq('invited_role', 'participant')
      
    if (allowlistErr) throw allowlistErr
    const participantEmails = participantAllowlist.map(a => a.email.toLowerCase())

    // 1. Participant Statistics
    const { data: regDataList, error: regErr } = await supabase
      .from('event_registrations')
      .select('full_name, email, phone, college, branch, academic_year')
      .eq('event_id', eventId)
      .in('email', participantEmails.length > 0 ? participantEmails : ['__empty__'])
      .order('full_name')

    if (regErr) throw regErr
    
    const { data: actDataList, error: actErr } = await supabase
      .from('event_participants')
      .select(`
        id,
        profiles:participant_id (full_name, email)
      `)
      .eq('event_id', eventId)
      
    if (actErr) throw actErr

    const registeredList = (regDataList || []).map(r => ({ name: r.full_name || 'Unknown', email: r.email, phone: r.phone || undefined }))
    const activeList = (actDataList || [])
      .map(r => ({ name: (r.profiles as { full_name?: string | null })?.full_name || 'Unknown', email: (r.profiles as { email?: string })?.email || '' }))
      .filter(r => participantEmails.includes(r.email.toLowerCase()))
    
    const totalRegistered = registeredList.length
    const activeSynchronized = activeList.length
    
    // Pending list is registered minus active (matched by email usually, but since activeList has emails, we can filter)
    const activeEmails = new Set(activeList.map(a => a.email.toLowerCase()))
    const pendingList = registeredList.filter(r => !activeEmails.has(r.email.toLowerCase()))
    
    const pendingLogin = pendingList.length

    // 2. Fetch Attendance Records
    const { data: attRecords, error: attErr } = await supabase
      .from('attendance_records')
      .select('scanned_by, scanned_at')
      .eq('event_id', eventId)

    if (attErr) throw attErr
    const attended = attRecords?.length || 0
    const notAttended = Math.max(0, totalRegistered - attended)
    const attendancePercentage = totalRegistered > 0 ? Math.round((attended / totalRegistered) * 100) : 0

    // 3. Fetch Meal Eligibility from event_registrations
    const { data: regData, error: regDataErr } = await supabase
      .from('event_registrations')
      .select('breakfast_opted, lunch_opted, dinner_opted')
      .eq('event_id', eventId)
      .in('email', participantEmails.length > 0 ? participantEmails : ['__empty__'])
      
    if (regDataErr) throw regDataErr

    // Determine eligible counts based on meal_preference
    let bfEligible = 0; let lunchEligible = 0; let dinnerEligible = 0;
    
    for (const reg of regData || []) {
      if (reg.breakfast_opted) bfEligible++
      if (reg.lunch_opted) lunchEligible++
      if (reg.dinner_opted) dinnerEligible++
    }

    // 4. Fetch Food Records
    const { data: foodRecords, error: foodErr } = await supabase
      .from('food_records')
      .select('scanned_by, scanned_at, meal_type')
      .eq('event_id', eventId)

    if (foodErr) throw foodErr

    const bfConsumed = foodRecords?.filter(r => r.meal_type === 'breakfast').length || 0
    const lunchConsumed = foodRecords?.filter(r => r.meal_type === 'lunch').length || 0
    const dinnerConsumed = foodRecords?.filter(r => r.meal_type === 'dinner').length || 0

    const meals = {
      breakfast: {
        eligible: bfEligible, consumed: bfConsumed, remaining: Math.max(0, bfEligible - bfConsumed),
        percentage: bfEligible > 0 ? Math.round((bfConsumed / bfEligible) * 100) : 0
      },
      lunch: {
        eligible: lunchEligible, consumed: lunchConsumed, remaining: Math.max(0, lunchEligible - lunchConsumed),
        percentage: lunchEligible > 0 ? Math.round((lunchConsumed / lunchEligible) * 100) : 0
      },
      dinner: {
        eligible: dinnerEligible, consumed: dinnerConsumed, remaining: Math.max(0, dinnerEligible - dinnerConsumed),
        percentage: dinnerEligible > 0 ? Math.round((dinnerConsumed / dinnerEligible) * 100) : 0
      }
    }

    // 5. Coordinator Stats
    const { data: coordinators, error: coordErr } = await supabase
      .from('event_coordinators')
      .select(`
        coordinator_id,
        station,
        task_attendance,
        task_breakfast,
        task_lunch,
        task_dinner,
        profiles:coordinator_id (full_name)
      `)
      .eq('event_id', eventId)
      
    if (coordErr) throw coordErr

    const now = new Date()
    const RECENT_THRESHOLD_MS = 15 * 60 * 1000 // 15 mins

    const coordinatorStats: CoordinatorStat[] = (coordinators || []).map(coord => {
      let relevantScans = 0
      let lastScanDate: Date | null = null as Date | null

      if (coord.task_attendance) {
        const myAttScans = attRecords?.filter(r => r.scanned_by === coord.coordinator_id) || []
        relevantScans += myAttScans.length
        myAttScans.forEach(r => {
          if (r.scanned_at) {
            const d = new Date(r.scanned_at)
            if (!lastScanDate || d > lastScanDate) lastScanDate = d
          }
        })
      }

      if (coord.task_breakfast) {
        const myBfScans = foodRecords?.filter(r => r.scanned_by === coord.coordinator_id && r.meal_type === 'breakfast') || []
        relevantScans += myBfScans.length
        myBfScans.forEach(r => {
          if (r.scanned_at) {
            const d = new Date(r.scanned_at)
            if (!lastScanDate || d > lastScanDate) lastScanDate = d
          }
        })
      }

      if (coord.task_lunch) {
        const myLunchScans = foodRecords?.filter(r => r.scanned_by === coord.coordinator_id && r.meal_type === 'lunch') || []
        relevantScans += myLunchScans.length
        myLunchScans.forEach(r => {
          if (r.scanned_at) {
            const d = new Date(r.scanned_at)
            if (!lastScanDate || d > lastScanDate) lastScanDate = d
          }
        })
      }

      if (coord.task_dinner) {
        const myDinnerScans = foodRecords?.filter(r => r.scanned_by === coord.coordinator_id && r.meal_type === 'dinner') || []
        relevantScans += myDinnerScans.length
        myDinnerScans.forEach(r => {
          if (r.scanned_at) {
            const d = new Date(r.scanned_at)
            if (!lastScanDate || d > lastScanDate) lastScanDate = d
          }
        })
      }

      let activityStatus: 'Active' | 'No recent activity' | 'Not started' = 'Not started'
      if (relevantScans > 0 && lastScanDate) {
        const diff = now.getTime() - lastScanDate.getTime()
        if (diff <= RECENT_THRESHOLD_MS) {
          activityStatus = 'Active'
        } else {
          activityStatus = 'No recent activity'
        }
      }

      return {
        coordinatorId: coord.coordinator_id,
        name: (coord.profiles as { full_name?: string | null })?.full_name || 'Unknown Coordinator',
        station: coord.station,
        tasks: {
          attendance: coord.task_attendance || false,
          breakfast: coord.task_breakfast || false,
          lunch: coord.task_lunch || false,
          dinner: coord.task_dinner || false,
        },
        relevantScans,
        lastScanTime: lastScanDate ? lastScanDate.toISOString() : null,
        activityStatus
      }
    })

    // 6. Operational Insights
    const insights: string[] = []
    
    if (notAttended > 0) {
      insights.push(`${notAttended} registered participants have not yet been marked as attended.`)
    }
    
    if (pendingLogin > 0) {
      insights.push(`${pendingLogin} participants have been registered by an Admin but have not yet logged in.`)
    }

    if (meals.lunch.eligible > 0) {
      insights.push(`Lunch consumption is currently ${meals.lunch.percentage}%. (${meals.lunch.remaining} remain)`)
    }

    const activeCoords = coordinatorStats.filter(c => c.activityStatus === 'Active').length
    const idleCoords = coordinatorStats.filter(c => c.activityStatus === 'No recent activity').length
    const unstartedCoords = coordinatorStats.filter(c => c.activityStatus === 'Not started').length

    if (activeCoords > 0) insights.push(`${activeCoords} coordinators have recorded scans recently (Active).`)
    if (unstartedCoords > 0) insights.push(`${unstartedCoords} coordinators have not recorded any scans yet.`)
    if (idleCoords > 0) insights.push(`${idleCoords} coordinators have no recent scan activity in the last 15 mins.`)

    // 7. Breakdowns
    const breakdowns = {
      college: {} as Record<string, number>,
      branch: {} as Record<string, number>,
      academicYear: {} as Record<string, number>
    }

    if (regDataList) {
      for (const reg of regDataList) {
        if (participantEmails.includes(reg.email.toLowerCase())) {
          const college = reg.college?.trim() || 'Unknown'
          const branch = reg.branch?.trim() || 'Unknown'
          const year = reg.academic_year?.trim() || 'Unknown'

          breakdowns.college[college] = (breakdowns.college[college] || 0) + 1
          breakdowns.branch[branch] = (breakdowns.branch[branch] || 0) + 1
          breakdowns.academicYear[year] = (breakdowns.academicYear[year] || 0) + 1
        }
      }
    }

    return {
      data: {
        participants: { 
          totalRegistered, activeSynchronized, pendingLogin,
          registeredList, activeList, pendingList
        },
        attendance: { totalRegistered, attended, notAttended, percentage: attendancePercentage },
        meals,
        coordinatorStats,
        insights,
        breakdowns
      }
    }
  } catch (error: unknown) {
    const err = error as Error
    console.error("Operations data error:", err)
    return { error: err.message || "Failed to fetch operations data" }
  }
}
