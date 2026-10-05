import { getEventTeams } from './actions'
import { TeamManager } from './TeamManager'
import { AlertCircle } from 'lucide-react'

export default async function TeamsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data, error } = await getEventTeams(id)

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center justify-center gap-3 text-red-700">
        <AlertCircle size={24} />
        <p className="font-bold">{error}</p>
      </div>
    )
  }

  return <TeamManager eventId={id} initialData={data || []} />
}
