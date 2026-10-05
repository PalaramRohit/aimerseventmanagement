'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createEvent } from '../actions'
import { Plus } from 'lucide-react'

export default function NewEventPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)
    
    // Convert local datetime to ISO strings for Supabase
    const startDate = formData.get('start_date') as string
    const endDate = formData.get('end_date') as string
    if (startDate) formData.set('start_date', new Date(startDate).toISOString())
    if (endDate) formData.set('end_date', new Date(endDate).toISOString())

    const result = await createEvent(null, formData)
    
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    } else if (result?.success) {
      router.push('/admin/events')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-800 mb-2 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Back to Events
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">Create New Event</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium text-sm">Define the details and operations for your upcoming AIMERS event</p>
        </div>
      </div>
      
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
                required 
                placeholder="e.g. AIMERS Annual Research Symposium"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-cyan-950/20 border border-slate-200 dark:border-cyan-900/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors placeholder:text-slate-400" 
              />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Description</label>
              <textarea 
                name="description" 
                placeholder="Briefly describe the purpose and goals of this event..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-cyan-950/20 border border-slate-200 dark:border-cyan-900/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors placeholder:text-slate-400 min-h-[100px] resize-y" 
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Start Date & Time</label>
              <input 
                name="start_date" 
                type="datetime-local" 
                required 
                className="w-full px-4 py-3 bg-slate-50 dark:bg-cyan-950/20 border border-slate-200 dark:border-cyan-900/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-200">End Date & Time</label>
              <input 
                name="end_date" 
                type="datetime-local" 
                required 
                className="w-full px-4 py-3 bg-slate-50 dark:bg-cyan-950/20 border border-slate-200 dark:border-cyan-900/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Venue</label>
              <input 
                name="venue" 
                placeholder="e.g. Main Auditorium"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-cyan-950/20 border border-slate-200 dark:border-cyan-900/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors placeholder:text-slate-400" 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Max Participants</label>
              <input 
                name="max_participants" 
                type="number" 
                min="0" 
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
            <label className="flex items-center justify-between p-5 hover:bg-slate-50 dark:bg-cyan-950/20 transition-colors cursor-pointer group">
              <div className="flex flex-col pr-4">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Registration Open</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Allow participants to register</span>
              </div>
              <div className="relative inline-block w-11 h-6 shrink-0">
                <input type="checkbox" name="registration_open" className="peer sr-only" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-[#080d1a] after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 group-hover:peer-not-placeholder-shown:bg-slate-300"></div>
              </div>
            </label>
            
            <label className="flex items-center justify-between p-5 hover:bg-slate-50 dark:bg-cyan-950/20 transition-colors cursor-pointer group">
              <div className="flex flex-col pr-4">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Attendance Scanning</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Enable attendance scanning</span>
              </div>
              <div className="relative inline-block w-11 h-6 shrink-0">
                <input type="checkbox" name="attendance_enabled" className="peer sr-only" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-[#080d1a] after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </div>
            </label>

            <label className="flex items-center justify-between p-5 hover:bg-slate-50 dark:bg-cyan-950/20 transition-colors cursor-pointer group">
              <div className="flex flex-col pr-4">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Breakfast Enabled</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Enable breakfast recording</span>
              </div>
              <div className="relative inline-block w-11 h-6 shrink-0">
                <input type="checkbox" name="breakfast_enabled" className="peer sr-only" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-[#080d1a] after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </div>
            </label>

            <label className="flex items-center justify-between p-5 hover:bg-slate-50 dark:bg-cyan-950/20 transition-colors cursor-pointer group">
              <div className="flex flex-col pr-4">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Lunch Enabled</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Enable lunch recording</span>
              </div>
              <div className="relative inline-block w-11 h-6 shrink-0">
                <input type="checkbox" name="lunch_enabled" className="peer sr-only" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-[#080d1a] after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </div>
            </label>

            <label className="flex items-center justify-between p-5 hover:bg-slate-50 dark:bg-cyan-950/20 transition-colors cursor-pointer group">
              <div className="flex flex-col pr-4">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Dinner Enabled</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Enable dinner recording</span>
              </div>
              <div className="relative inline-block w-11 h-6 shrink-0">
                <input type="checkbox" name="dinner_enabled" className="peer sr-only" />
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

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
          <button 
            type="button"
            onClick={() => router.back()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 border border-transparent hover:border-slate-300"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full sm:w-auto bg-[#0a1122] hover:bg-teal-700 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg shadow-slate-900/10 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group"
          >
            {isLoading ? 'Creating Event...' : (
              <>
                <Plus size={16} className="group-hover:scale-110 transition-transform" />
                Create Event
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

