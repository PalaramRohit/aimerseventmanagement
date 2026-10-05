import { requireAdmin } from '@/lib/auth/server'
import { notFound } from 'next/navigation'
import EditEventForm from '../EditEventForm'
import Link from 'next/link'

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase } = await requireAdmin()

  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !event) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link href={`/admin/events/${id}`} className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-800 mb-2 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Back to Event Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">Edit Event</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium text-sm">Update event details and configuration</p>
        </div>
      </div>

      <div>
        <EditEventForm event={event} />
      </div>
    </div>
  )
}
