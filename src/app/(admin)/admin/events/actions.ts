'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/server'

// Validation Schema
const eventSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  start_date: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid start date" }),
  end_date: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid end date" }),
  venue: z.string().optional(),
  max_participants: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return null;
      return Number(val);
    },
    z.number().min(0, "Capacity cannot be negative").nullable().optional()
  ),
  registration_open: z.boolean().default(false),
  attendance_enabled: z.boolean().default(false),
  breakfast_enabled: z.boolean().default(false),
  lunch_enabled: z.boolean().default(false),
  dinner_enabled: z.boolean().default(false),
}).refine(data => new Date(data.end_date) >= new Date(data.start_date), {
  message: "End date must be on or after start date",
  path: ["end_date"]
})

export async function createEvent(prevState: unknown, formData: FormData) {
  try {
    const { supabase, user } = await requireAdmin()

    // Parse formData safely handles checkboxes which aren't strictly true/false text
    const rawData = {
      name: formData.get('name'),
      description: formData.get('description') || null,
      start_date: formData.get('start_date'),
      end_date: formData.get('end_date'),
      venue: formData.get('venue') || null,
      max_participants: formData.get('max_participants'),
      registration_open: formData.get('registration_open') === 'on',
      attendance_enabled: formData.get('attendance_enabled') === 'on',
      breakfast_enabled: formData.get('breakfast_enabled') === 'on',
      lunch_enabled: formData.get('lunch_enabled') === 'on',
      dinner_enabled: formData.get('dinner_enabled') === 'on',
    }

    const validatedData = eventSchema.parse(rawData)

    const { data, error } = await supabase
      .from('events')
      .insert({
        ...validatedData,
        // The server forces created_by, it does not trust the client
        created_by: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Database error in createEvent:', error)
      if (error.code === '42501' || error.message?.toLowerCase().includes('policy')) {
        return { error: 'Unauthorized: You do not have permission to create events.' }
      }
      return { error: 'Failed to create event due to a database error.' }
    }

    revalidatePath('/admin/events')
    return { success: true, eventId: data.id }

  } catch (err) {
    if (err instanceof z.ZodError) {
      return { error: err.issues.map(i => i.message).join(", ") }
    }
    console.error('Unexpected error in createEvent:', err)
    return { error: 'An unexpected error occurred while processing your request.' }
  }
}

export async function updateEvent(eventId: string, prevState: unknown, formData: FormData) {
  try {
    const { supabase } = await requireAdmin()

    const rawData = {
      name: formData.get('name'),
      description: formData.get('description') || null,
      start_date: formData.get('start_date'),
      end_date: formData.get('end_date'),
      venue: formData.get('venue') || null,
      max_participants: formData.get('max_participants'),
      registration_open: formData.get('registration_open') === 'on',
      attendance_enabled: formData.get('attendance_enabled') === 'on',
      breakfast_enabled: formData.get('breakfast_enabled') === 'on',
      lunch_enabled: formData.get('lunch_enabled') === 'on',
      dinner_enabled: formData.get('dinner_enabled') === 'on',
    }

    const validatedData = eventSchema.parse(rawData)

    // Note: We do NOT pass `created_by` here. 
    // Even if we did, the database `BEFORE UPDATE` trigger protects it.
    const { error } = await supabase
      .from('events')
      .update(validatedData)
      .eq('id', eventId)

    if (error) {
      console.error('Database error in updateEvent:', error)
      if (error.code === '42501' || error.message?.toLowerCase().includes('policy')) {
        return { error: 'Unauthorized: You do not have permission to update events.' }
      }
      return { error: 'Failed to update event due to a database error.' }
    }

    revalidatePath('/admin/events')
    revalidatePath(`/admin/events/${eventId}`)
    
    return { success: true }

  } catch (err) {
    if (err instanceof z.ZodError) {
      return { error: err.issues.map(i => i.message).join(", ") }
    }
    console.error('Unexpected error in updateEvent:', err)
    return { error: 'An unexpected error occurred while processing your request.' }
  }
}

export async function deleteEvent(eventId: string) {
  try {
    const { supabase } = await requireAdmin()

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)

    if (error) {
      console.error('Database error in deleteEvent:', error)
      if (error.code === '42501' || error.message?.toLowerCase().includes('policy')) {
        return { error: 'Unauthorized: You do not have permission to delete events.' }
      }
      return { error: 'Failed to delete event due to a database error.' }
    }

    revalidatePath('/admin/events')
    
    return { success: true }

  } catch (err) {
    console.error('Unexpected error in deleteEvent:', err)
    return { error: 'An unexpected error occurred while processing your request.' }
  }
}
