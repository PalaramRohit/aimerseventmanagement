'use client'

import { useState } from 'react'
import { Plus, Check, X, FileText, Users, Eye, EyeOff, Edit2, Trash2 } from 'lucide-react'
import { createProblemStatement, updateProblemStatement, toggleProblemStatementStatus, deleteProblemStatement } from './actions'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ProblemManager({ eventId, initialData }: { eventId: string, initialData: any }) {
  type Problem = { id: string, title: string, description: string, is_published: boolean }
  type Team = { id: string, problem_statement_id: string | null }
  const [problems] = useState(initialData.problems || [])
  const [teams] = useState(initialData.teams || [])
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null)
  
  const [formData, setFormData] = useState({ title: '', description: '', is_published: false })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const totalTeams = teams.length
  const teamsWithSelection = teams.filter((t: Team) => t.problem_statement_id !== null).length
  const teamsWithoutSelection = totalTeams - teamsWithSelection
  
  // Calculate selections per problem
  const selectionCounts = teams.reduce((acc: Record<string, number>, team: Team) => {
    if (team.problem_statement_id) {
      acc[team.problem_statement_id] = (acc[team.problem_statement_id] || 0) + 1
    }
    return acc
  }, {})
  
  let mostSelectedId = null
  let maxCount = 0
  for (const [id, count] of Object.entries(selectionCounts)) {
    if ((count as number) > maxCount) {
      maxCount = count as number
      mostSelectedId = id
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    const data = new FormData()
    data.append('title', formData.title)
    data.append('description', formData.description)
    data.append('is_published', formData.is_published.toString())
    
    let result
    if (editingProblem) {
      result = await updateProblemStatement(eventId, editingProblem.id, data)
    } else {
      result = await createProblemStatement(eventId, data)
    }
    
    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else {
      window.location.reload()
    }
  }
  
  const handleTogglePublish = async (problemId: string, currentStatus: boolean) => {
    await toggleProblemStatementStatus(eventId, problemId, !currentStatus)
    window.location.reload()
  }
  
  const handleDelete = async (problemId: string) => {
    if (window.confirm('Are you sure you want to delete this problem statement? This will reset the selection for any teams that chose it.')) {
      await deleteProblemStatement(eventId, problemId)
      window.location.reload()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Problem Statements</h2>
          <p className="text-slate-500 text-sm mt-1">Manage problem statements and track team selections.</p>
        </div>
        <button 
          onClick={() => {
            setEditingProblem(null)
            setFormData({ title: '', description: '', is_published: false })
            setIsModalOpen(true)
          }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          <span>New Statement</span>
        </button>
      </div>
      
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-slate-500">
            <FileText size={18} />
            <span className="text-sm font-medium">Total Statements</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{problems.length}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-indigo-500">
            <Check size={18} />
            <span className="text-sm font-medium">Teams Selected</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{teamsWithSelection}</div>
          <div className="text-xs text-slate-400 mt-1">of {totalTeams} teams</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-amber-500">
            <X size={18} />
            <span className="text-sm font-medium">Pending Selection</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{teamsWithoutSelection}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-emerald-500">
            <Users size={18} />
            <span className="text-sm font-medium">Most Popular</span>
          </div>
          <div className="text-lg font-bold text-slate-900 truncate" title={mostSelectedId ? problems.find((p: Problem) => p.id === mostSelectedId)?.title : 'N/A'}>
            {mostSelectedId ? problems.find((p: Problem) => p.id === mostSelectedId)?.title : 'N/A'}
          </div>
          <div className="text-xs text-slate-400 mt-1">{maxCount} teams selected</div>
        </div>
      </div>
      
      {/* Problems list */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {problems.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <FileText className="w-12 h-12 text-slate-200 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-1">No problem statements yet</h3>
            <p className="text-slate-500 text-sm max-w-sm mb-6">Create the first problem statement to allow teams to make their selection.</p>
            <button 
              onClick={() => {
                setEditingProblem(null)
                setFormData({ title: '', description: '', is_published: false })
                setIsModalOpen(true)
              }}
              className="flex items-center gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
            >
              <Plus size={16} />
              <span>Create First Statement</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {problems.map((problem: Problem) => (
              <div key={problem.id} className="p-5 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-slate-900">{problem.title}</h3>
                      {problem.is_published ? (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded border border-emerald-200 flex items-center gap-1">
                          <Eye size={10} /> Published
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded border border-slate-200 flex items-center gap-1">
                          <EyeOff size={10} /> Draft
                        </span>
                      )}
                      {problem.id === mostSelectedId && (
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded border border-indigo-200">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">{problem.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                        {selectionCounts[problem.id] || 0} teams selected
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 md:self-start">
                    <button 
                      onClick={() => handleTogglePublish(problem.id, problem.is_published)}
                      className={`p-2 text-sm rounded-lg border transition-colors ${
                        problem.is_published 
                          ? 'text-slate-500 bg-slate-50 border-slate-200 hover:bg-slate-100 hover:text-slate-700' 
                          : 'text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-700'
                      }`}
                      title={problem.is_published ? "Unpublish" : "Publish"}
                    >
                      {problem.is_published ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button 
                      onClick={() => {
                        setEditingProblem(problem)
                        setFormData({ title: problem.title, description: problem.description, is_published: problem.is_published })
                        setIsModalOpen(true)
                      }}
                      className="p-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(problem.id)}
                      className="p-2 text-sm text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">{editingProblem ? 'Edit Statement' : 'New Statement'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
                  <input 
                    type="text" 
                    required
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. Smart Traffic Management"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                  <textarea 
                    required
                    rows={4}
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe the problem statement..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm resize-none"
                  />
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <input 
                    type="checkbox" 
                    id="is_published"
                    checked={formData.is_published}
                    onChange={e => setFormData({...formData, is_published: e.target.checked})}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <div>
                    <label htmlFor="is_published" className="block text-sm font-semibold text-slate-700">Publish Immediately</label>
                    <p className="text-xs text-slate-500">Published statements are visible to participants.</p>
                  </div>
                </div>
                
                {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
                
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors disabled:opacity-50">
                    {isSubmitting ? 'Saving...' : 'Save Statement'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
