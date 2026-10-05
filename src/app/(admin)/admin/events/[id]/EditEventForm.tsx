'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateEvent, deleteEvent } from '../actions'
import { Save, Trash2 } from 'lucide-react'

// Format date for datetime-local input (YYYY-MM-DDThh:mm)
function formatDateForInput(dateStr: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  // Get local timezone offset adjustment to display correctly in the input
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 16)
}

import type { Database } from '@/types/database'

type EventRow = Database['public']['Tables']['events']['Row']

export default function EditEventForm({ event }: { event: EventRow }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)
    setIsSuccess(false)
    
    // Convert local datetime back to ISO strings for Supabase
    const startDate = formData.get('start_date') as string
    const endDate = formData.get('end_date') as string
    if (startDate) formData.set('start_date', new Date(startDate).toISOString())
    if (endDate) formData.set('end_date', new Date(endDate).toISOString())

    const result = await updateEvent(event.id, null, formData)
    
    setIsLoading(false)
    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      setIsSuccess(true)
      router.refresh()
    }
  }

  async function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    setError(null)

    const result = await deleteEvent(event.id)
    
    if (result?.error) {
      setError(result.error)
      setIsDeleting(false)
    } else if (result?.success) {
      router.push('/admin/events')
    }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-6">
      
      {/* EVENT INFORMATION CARD */}
      <div className="bg-white dark:bg-[#080d1a] rounded-2xl border border-slate-100 dark:border-cyan-900/20 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-cyan-900/20 bg-slate-50 dark:bg-cyan-950/20">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Event Information</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Basic event details and schedule</p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Event Name</label>
            <input 
              name="name" 
              defaultValue={event.name} 
              required 
              className="w-full px-4 py-3 bg-slate-50 dark:bg-cyan-950/20 border border-slate-200 dark:border-cyan-900/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" 
            />
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Description</label>
            <textarea 
              name="description" 
              defaultValue={event.description || ''} 
              className="w-full px-4 py-3 bg-slate-50 dark:bg-cyan-950/20 border border-slate-200 dark:border-cyan-900/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors min-h-[100px] resize-y" 
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Start Date & Time</label>
            <input 
              name="start_date" 
              type="datetime-local" 
              defaultValue={formatDateForInput(event.start_date)} 
              required 
              className="w-full px-4 py-3 bg-slate-50 dark:bg-cyan-950/20 border border-slate-200 dark:border-cyan-900/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" 
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">End Date & Time</label>
            <input 
              name="end_date" 
              type="datetime-local" 
              defaultValue={formatDateForInput(event.end_date)} 
              required 
              className="w-full px-4 py-3 bg-slate-50 dark:bg-cyan-950/20 border border-slate-200 dark:border-cyan-900/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" 
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Venue</label>
            <input 
              name="venue" 
              defaultValue={event.venue || ''} 
              className="w-full px-4 py-3 bg-slate-50 dark:bg-cyan-950/20 border border-slate-200 dark:border-cyan-900/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" 
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Max Participants</label>
            <input 
              name="max_participants" 
              type="number" 
              min="0" 
              defaultValue={event.max_participants || ''} 
              placeholder="Leave blank for unlimited" 
              className="w-full px-4 py-3 bg-slate-50 dark:bg-cyan-950/20 border border-slate-200 dark:border-cyan-900/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors placeholder:text-slate-400" 
            />
          </div>
        </div>
      </div>

      {/* EVENT SETTINGS CARD */}
      <div className="bg-white dark:bg-[#080d1a] rounded-2xl border border-slate-100 dark:border-cyan-900/20 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-cyan-900/20 bg-slate-50 dark:bg-cyan-950/20">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Event Settings</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Configure registration, attendance and meal options</p>
        </div>
        <div className="p-0 flex flex-col divide-y divide-slate-100">
          {/* Custom Switch Component styling embedded for standard checkboxes */}
          
          <label className="flex items-center justify-between p-5 hover:bg-slate-50 dark:bg-cyan-950/20 transition-colors cursor-pointer group">
            <div className="flex flex-col pr-4">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Registration Open</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Allow participants to register</span>
            </div>
            <div className="relative inline-block w-11 h-6 shrink-0">
              <input type="checkbox" name="registration_open" defaultChecked={event.registration_open ?? false} className="peer sr-only" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-[#080d1a] after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 group-hover:peer-not-placeholder-shown:bg-slate-300"></div>
            </div>
          </label>
          
          <label className="flex items-center justify-between p-5 hover:bg-slate-50 dark:bg-cyan-950/20 transition-colors cursor-pointer group">
            <div className="flex flex-col pr-4">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Attendance Scanning</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Enable attendance scanning</span>
            </div>
            <div className="relative inline-block w-11 h-6 shrink-0">
              <input type="checkbox" name="attendance_enabled" defaultChecked={event.attendance_enabled ?? false} className="peer sr-only" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-[#080d1a] after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </div>
          </label>

          <label className="flex items-center justify-between p-5 hover:bg-slate-50 dark:bg-cyan-950/20 transition-colors cursor-pointer group">
            <div className="flex flex-col pr-4">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Breakfast Enabled</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Enable breakfast recording</span>
            </div>
            <div className="relative inline-block w-11 h-6 shrink-0">
              <input type="checkbox" name="breakfast_enabled" defaultChecked={event.breakfast_enabled ?? false} className="peer sr-only" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-[#080d1a] after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </div>
          </label>

          <label className="flex items-center justify-between p-5 hover:bg-slate-50 dark:bg-cyan-950/20 transition-colors cursor-pointer group">
            <div className="flex flex-col pr-4">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Lunch Enabled</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Enable lunch recording</span>
            </div>
            <div className="relative inline-block w-11 h-6 shrink-0">
              <input type="checkbox" name="lunch_enabled" defaultChecked={event.lunch_enabled ?? false} className="peer sr-only" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-[#080d1a] after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </div>
          </label>

          <label className="flex items-center justify-between p-5 hover:bg-slate-50 dark:bg-cyan-950/20 transition-colors cursor-pointer group">
            <div className="flex flex-col pr-4">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Dinner Enabled</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Enable dinner recording</span>
            </div>
            <div className="relative inline-block w-11 h-6 shrink-0">
              <input type="checkbox" name="dinner_enabled" defaultChecked={event.dinner_enabled ?? false} className="peer sr-only" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-[#080d1a] after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </div>
          </label>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 shadow-sm">
          <div className="text-red-500 w-5 h-5 shrink-0 flex items-center justify-center rounded-full border-2 border-red-500 font-bold text-xs">!</div>
          <div className="text-red-700 text-sm font-medium pt-0.5">{error}</div>
        </div>
      )}
      {isSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3 shadow-sm">
          <div className="text-emerald-500 w-5 h-5 shrink-0 flex items-center justify-center rounded-full border-2 border-emerald-500 font-bold text-xs">✓</div>
          <div className="text-emerald-700 text-sm font-medium pt-0.5">Event updated successfully!</div>
        </div>
      )}

      {/* ACTION BUTTONS */}
      <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-4 pt-2">
        <button 
          type="button"
          onClick={handleDelete}
          disabled={isLoading || isDeleting}
          className="px-6 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center justify-center gap-2 border border-transparent hover:border-red-200 disabled:opacity-50"
        >
          {isDeleting ? 'Deleting...' : (
            <>
              <Trash2 size={16} />
              Delete Event
            </>
          )}
        </button>

        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            type="button"
            onClick={() => router.push(`/admin/events/${event.id}`)}
            disabled={isLoading || isDeleting}
            className="px-6 py-3 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 border border-transparent hover:border-slate-300 disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isLoading || isDeleting}
            className="bg-[#0a1122] hover:bg-teal-700 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg shadow-slate-900/10 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group"
          >
            {isLoading ? 'Saving...' : (
              <>
                <Save size={16} className="group-hover:scale-110 transition-transform" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  )
}
