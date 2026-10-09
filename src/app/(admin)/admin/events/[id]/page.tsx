import { requireAdmin } from '@/lib/auth/server'
import { notFound } from 'next/navigation'
import OperationsDashboard from './operations/OperationsDashboard'
import { getCachedEvent } from '@/lib/events/server'

export default async function EventOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await requireAdmin()

  // Fetch Event (cached per-request)
  const { event, error } = await getCachedEvent(id)

  if (error || !event) {
    notFound()
  }

  return (
    <div className="mt-8">
      <OperationsDashboard eventId={id} eventData={event} />
    </div>
  )
}
