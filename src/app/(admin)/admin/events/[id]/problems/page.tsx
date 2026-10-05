import { getProblemStatements } from './actions'
import { ProblemManager } from './ProblemManager'
import { AlertCircle } from 'lucide-react'

export default async function ProblemsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data, error } = await getProblemStatements(id)

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center justify-center gap-3 text-red-700">
        <AlertCircle size={24} />
        <p className="font-bold">{error}</p>
      </div>
    )
  }

  return <ProblemManager eventId={id} initialData={data} />
}
