import { requireAdmin } from '@/lib/auth/server'
import { notFound } from 'next/navigation'
import CoordinatorManager from './CoordinatorManager'

export default async function EventCoordinatorsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase } = await requireAdmin()

  // Fetch Event
  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !event) {
    notFound()
  }

  return (
    <div className="h-full min-h-[600px] mt-8">
      <CoordinatorManager eventId={id} eventData={event} />
    </div>
  )
}
