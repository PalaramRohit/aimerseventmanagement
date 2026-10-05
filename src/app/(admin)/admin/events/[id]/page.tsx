import { requireAdmin } from '@/lib/auth/server'
import { notFound } from 'next/navigation'
import OperationsDashboard from './operations/OperationsDashboard'

export default async function EventOverviewPage({ params }: { params: Promise<{ id: string }> }) {
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
    <div className="mt-8">
      <OperationsDashboard eventId={id} eventData={event} />
    </div>
  )
}
