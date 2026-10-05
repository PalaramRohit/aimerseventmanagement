import { requireAdmin } from '@/lib/auth/server'
import { notFound } from 'next/navigation'
import { EventHeader } from './EventHeader'

export default async function EventDashboardLayout({ 
  children,
  params 
}: { 
  children: React.ReactNode,
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const { supabase } = await requireAdmin()

  // Fetch Event
  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !event) {
    console.error("Layout notFound triggered for id:", id, "Error:", error, "Event:", event)
    notFound()
  }

  return (
    <div className="max-w-6xl mx-auto">
      <EventHeader event={event} />
      {children}
    </div>
  )
}
