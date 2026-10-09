import { requireAdmin } from '@/lib/auth/server'
import { notFound } from 'next/navigation'
import { EventHeader } from './EventHeader'
import { getCachedEvent } from '@/lib/events/server'

export default async function EventDashboardLayout({ 
  children,
  params 
}: { 
  children: React.ReactNode,
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  await requireAdmin()

  // Fetch Event (cached per-request)
  const { event, error } = await getCachedEvent(id)

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
