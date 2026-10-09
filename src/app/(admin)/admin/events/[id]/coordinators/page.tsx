import { requireAdmin } from '@/lib/auth/server'
import { notFound } from 'next/navigation'
import CoordinatorManager from './CoordinatorManager'
import { getCachedEvent } from '@/lib/events/server'

export default async function EventCoordinatorsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await requireAdmin()

  // Fetch Event (cached per-request)
  const { event, error } = await getCachedEvent(id)

  if (error || !event) {
    notFound()
  }

  return (
    <div className="h-full min-h-[600px] mt-8">
      <CoordinatorManager eventId={id} eventData={event} />
    </div>
  )
}
