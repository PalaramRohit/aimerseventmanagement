import { requireAdmin } from '@/lib/auth/server'
import { notFound } from 'next/navigation'
import ParticipantManager from './ParticipantManager'
import { getCachedEvent } from '@/lib/events/server'

export default async function EventParticipantsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await requireAdmin()

  // Fetch Event (cached per-request)
  const { event, error } = await getCachedEvent(id)

  if (error || !event) {
    notFound()
  }

  return (
    <div className="h-full min-h-[600px] mt-8">
      <ParticipantManager eventId={id} eventData={event} />
    </div>
  )
}
