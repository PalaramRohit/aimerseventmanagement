'use server'

import { requireAdmin } from '@/lib/auth/server'
import Papa from 'papaparse'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

// Shared schemas
const emailSchema = z.string().trim().toLowerCase().min(1, "Email is required").email("Invalid email format")

// Individual Row Schema
const individualRowSchema = z.object({
  email: emailSchema,
  role: z.enum(['participant', 'coordinator']),
  name: z.string().trim().optional().or(z.literal('')),
  full_name: z.string().trim().optional().or(z.literal('')),
  phone: z.string().trim().optional().or(z.literal('')),
  college: z.string().trim().optional().or(z.literal('')),
  branch: z.string().trim().optional().or(z.literal('')),
  academic_year: z.string().trim().optional().or(z.literal('')),
  breakfast: z.string().trim().optional().or(z.literal('')),
  lunch: z.string().trim().optional().or(z.literal('')),
  dinner: z.string().trim().optional().or(z.literal(''))
}).passthrough()

export type PreviewResult = {
  isTeamImport: boolean
  teamsCount: number
  valid: { email: string, role: string, name?: string, team_name?: string }[]
  invalid: { row: number, email?: string, team?: string, error: string }[]
  conflicts: { email: string, currentRole: string, csvRole: string }[]
  total: number
}

// Helper to parse file in memory
async function parseCsvFile(file: File) {
  const text = await file.text()
  return new Promise<Papa.ParseResult<Record<string, string>>>((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: resolve,
      error: reject
    })
  })
}

const isTrue = (val: string | undefined) => val && ['yes', 'y', 'true', '1'].includes(val.toLowerCase())

export async function previewImport(eventId: string, formData: FormData): Promise<{ error?: string, preview?: PreviewResult }> {
  try {
    const { supabase } = await requireAdmin()
    
    const file = formData.get('file') as File
    if (!file || file.size === 0) return { error: "File is required" }
    if (file.size > 5 * 1024 * 1024) return { error: "File exceeds 5MB limit" }

    const parsed = await parseCsvFile(file)
    if (parsed.data.length === 0) return { error: "Empty CSV file" }

    const preview: PreviewResult = { isTeamImport: false, teamsCount: 0, valid: [], invalid: [], conflicts: [], total: parsed.data.length }

    // Fetch existing allowlist to detect conflicts
    const { data: existingAllowlist } = await supabase
      .from('registration_allowlist')
      .select('email, invited_role')
      .eq('event_id', eventId)

    const existingMap = new Map(existingAllowlist?.map(row => [row.email, row.invited_role]) || [])
    const seenEmails = new Set<string>()

    const fields = parsed.meta.fields || []
    const isTeamImport = fields.some(f => f.toLowerCase().trim() === 'team name')
    preview.isTeamImport = isTeamImport

    if (isTeamImport) {
      const seenTeams = new Set<string>()

      parsed.data.forEach((row, index) => {
        // Normalize keys
        const normalizedRow: Record<string, string> = {}
        for (const key of Object.keys(row)) {
          normalizedRow[key.toLowerCase().trim().replace(/\s+/g, ' ')] = row[key]
        }

        const teamName = normalizedRow['team name']?.trim()
        if (!teamName) {
          preview.invalid.push({ row: index + 2, error: "Team Name is missing or blank" })
          return
        }

        if (seenTeams.has(teamName.toLowerCase())) {
          preview.invalid.push({ row: index + 2, team: teamName, error: "Duplicate team name in CSV" })
          return
        }
        seenTeams.add(teamName.toLowerCase())

        // Extract members
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const members: any[] = []
        for (let i = 1; i <= 10; i++) {
          const emailRaw = normalizedRow[`member ${i} email`]
          if (!emailRaw || emailRaw.trim() === '') continue

          members.push({
            index: i,
            email: emailRaw,
            role: normalizedRow[`member ${i} role`]?.trim(),
            name: normalizedRow[`member ${i} full name`] || normalizedRow[`member ${i} name`]
          })
        }

        if (members.length === 0) {
          preview.invalid.push({ row: index + 2, team: teamName, error: "No valid members found" })
          return
        }
        if (members.length > 10) {
          preview.invalid.push({ row: index + 2, team: teamName, error: "More than 10 members not allowed" })
          return
        }

        let leadersCount = 0
        const memberEmails = new Set<string>()

        for (const m of members) {
          const emailCheck = emailSchema.safeParse(m.email)
          if (!emailCheck.success) {
            preview.invalid.push({ row: index + 2, team: teamName, email: m.email, error: "Invalid email" })
            continue
          }
          const email = emailCheck.data

          if (memberEmails.has(email)) {
            preview.invalid.push({ row: index + 2, team: teamName, email, error: "Duplicate email inside team" })
            continue
          }
          memberEmails.add(email)

          if (seenEmails.has(email)) {
            preview.invalid.push({ row: index + 2, team: teamName, email, error: "Email used in another team" })
            continue
          }
          seenEmails.add(email)

          const roleLower = m.role?.toLowerCase()
          if (roleLower === 'leader') leadersCount++
          else if (roleLower !== 'member') {
            preview.invalid.push({ row: index + 2, team: teamName, email, error: "Member role must be 'leader' or 'member'" })
            continue
          }

          const existingRole = existingMap.get(email)
          if (existingRole && existingRole !== 'participant') {
             preview.conflicts.push({ email, currentRole: existingRole, csvRole: 'participant' })
             continue
          }

          preview.valid.push({ email, role: roleLower, name: m.name, team_name: teamName })
        }

        if (leadersCount !== 1) {
           preview.invalid.push({ row: index + 2, team: teamName, error: `Team must have exactly 1 leader. Found ${leadersCount}` })
        }
      })
      
      preview.teamsCount = seenTeams.size

    } else {
      // Individual Import (untouched logic)
      parsed.data.forEach((row, index) => {
        const rawEmail = row.email || ''
        const rawRole = row.role || ''
        
        const validation = individualRowSchema.safeParse({ email: rawEmail, role: rawRole })
        if (!validation.success) {
          preview.invalid.push({ row: index + 2, email: rawEmail, error: validation.error.issues[0].message })
          return
        }

        const { email, role } = validation.data
        if (seenEmails.has(email)) {
          preview.invalid.push({ row: index + 2, email, error: "Duplicate email within CSV" })
          return
        }
        seenEmails.add(email)

        const existingRole = existingMap.get(email)
        if (existingRole && existingRole !== role) {
          preview.conflicts.push({ email, currentRole: existingRole, csvRole: role })
          return
        }
        preview.valid.push({ email, role, name: row.name })
      })
    }

    return { preview }
  } catch (err) {
    console.error(err)
    return { error: "Failed to parse CSV" }
  }
}


export async function commitImport(eventId: string, formData: FormData): Promise<{ error?: string, success?: boolean, insertedCount?: number, teamsCount?: number }> {
  try {
    const { supabase } = await requireAdmin()
    
    const file = formData.get('file') as File
    if (!file || file.size === 0) return { error: "File is required" }

    const parsed = await parseCsvFile(file)
    const fields = parsed.meta.fields || []
    const isTeamImport = fields.some(f => f.toLowerCase().trim() === 'team name')

    if (isTeamImport) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const teamsToInsert: any[] = []
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const membersToInsert: any[] = []
      
      const seenEmails = new Set<string>()

      parsed.data.forEach((row) => {
        const normalizedRow: Record<string, string> = {}
        for (const key of Object.keys(row)) {
          normalizedRow[key.toLowerCase().trim().replace(/\s+/g, ' ')] = row[key]
        }

        const teamName = normalizedRow['team name']?.trim()
        if (!teamName) return

        teamsToInsert.push({ name: teamName })

        for (let i = 1; i <= 10; i++) {
          const emailRaw = normalizedRow[`member ${i} email`]
          if (!emailRaw || emailRaw.trim() === '') continue
          
          const emailCheck = emailSchema.safeParse(emailRaw)
          if (!emailCheck.success) continue
          const email = emailCheck.data

          if (seenEmails.has(email)) continue
          seenEmails.add(email)

          const role = normalizedRow[`member ${i} role`]?.trim()?.toLowerCase()
          if (role !== 'leader' && role !== 'member') continue

          const customFields: Record<string, string> = {}
          for (const key of Object.keys(normalizedRow)) {
            if (key.startsWith(`member ${i} `)) {
              const fieldName = key.replace(`member ${i} `, '')
              if (!['email', 'full name', 'name', 'phone', 'college', 'branch', 'academic year', 'role', 'breakfast', 'lunch', 'dinner'].includes(fieldName)) {
                 customFields[fieldName] = normalizedRow[key]
              }
            }
          }

          membersToInsert.push({
            email,
            team_name: teamName,
            team_role: role,
            full_name: normalizedRow[`member ${i} full name`] || normalizedRow[`member ${i} name`] || null,
            phone: normalizedRow[`member ${i} phone`] || null,
            college: normalizedRow[`member ${i} college`] || null,
            branch: normalizedRow[`member ${i} branch`] || null,
            academic_year: normalizedRow[`member ${i} academic year`] || null,
            breakfast_opted: isTrue(normalizedRow[`member ${i} breakfast`]),
            lunch_opted: isTrue(normalizedRow[`member ${i} lunch`]),
            dinner_opted: isTrue(normalizedRow[`member ${i} dinner`]),
            registration_data: Object.keys(customFields).length > 0 ? customFields : null
          })
        }
      })

      if (membersToInsert.length === 0) return { error: "No valid members to import" }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.rpc as any)('import_teams_allowlist', {
        p_event_id: eventId,
        p_teams: teamsToInsert,
        p_members: membersToInsert
      })

      if (error) {
        console.error(error)
        return { error: "Database error during team import. " + error.message }
      }

      revalidatePath(`/admin/events/${eventId}`, 'layout')
      return { success: true, insertedCount: membersToInsert.length, teamsCount: teamsToInsert.length }

    } else {
      // Individual Import
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const validPayload: any[] = []
      const seenEmails = new Set<string>()

      parsed.data.forEach((row) => {
        const normalizedRow: Record<string, string> = { ...row }
        for (const key of Object.keys(normalizedRow)) {
          const lowerKey = key.toLowerCase().trim()
          if (lowerKey !== key) {
            normalizedRow[lowerKey] = normalizedRow[key]
          }
        }

        const email = normalizedRow.email || ''
        const role = normalizedRow.role || ''
        
        const validation = individualRowSchema.safeParse({ 
          ...normalizedRow,
          email, 
          role,
          name: normalizedRow.name || normalizedRow.full_name || '',
        })

        if (validation.success) {
          const data = validation.data
          if (!seenEmails.has(data.email)) {
            seenEmails.add(data.email)
            
            const { 
              email, role, name, full_name, phone, college, branch, academic_year, breakfast, lunch, dinner, ...rest
            } = data

            validPayload.push({ 
              email: email, 
              invited_role: role,
              full_name: name || full_name || null,
              phone: phone || null,
              college: college || null,
              branch: branch || null,
              academic_year: academic_year || null,
              breakfast_opted: isTrue(breakfast),
              lunch_opted: isTrue(lunch),
              dinner_opted: isTrue(dinner),
              registration_data: Object.keys(rest).length > 0 ? rest : null
            })
          }
        }
      })

      if (validPayload.length === 0) return { error: "No valid rows to import" }

      const { error } = await supabase.rpc('import_event_allowlist', {
        p_event_id: eventId,
        p_rows: validPayload
      })

      if (error) {
        console.error(error)
        return { error: "Database error during import. " + error.message }
      }

      revalidatePath(`/admin/events/${eventId}`, 'layout')
      return { success: true, insertedCount: validPayload.length }
    }
  } catch (err) {
    console.error(err)
    return { error: "Failed to commit import" }
  }
}
