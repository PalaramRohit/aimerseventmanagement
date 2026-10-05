'use client'

import { useState } from 'react'
import { selectProblemStatement } from '../actions'
import { CheckCircle2, Lock, FileText, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ProblemList({ eventId, teamId, problemStatements, initialSelectionId, isLeader }: { eventId: string, teamId: string, problemStatements: any[], initialSelectionId: string | null, isLeader: boolean }) {
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectionId)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSelect = async (problemId: string) => {
    if (selectedId) return // Already locked
    if (!isLeader) {
      setError("Only the team leader can select the problem statement.")
      return
    }
    if (!window.confirm('Are you sure you want to select this problem statement? This action cannot be undone.')) {
      return
    }

    setIsSubmitting(true)
    setError(null)
    
    const result = await selectProblemStatement(eventId, teamId, problemId)
    
    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else {
      setSelectedId(problemId)
      setIsSubmitting(false)
    }
  }

  if (problemStatements.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-[#080d1a] border border-slate-100 dark:border-cyan-900/20 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
        <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-cyan-900/20 flex items-center justify-center mx-auto mb-4 text-slate-400">
          <FileText size={24} />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Problem Statements Yet</h3>
        <p className="text-slate-500 dark:text-slate-400">The organizers have not published any problem statements for this event yet.</p>
        <Link href={`/participant/events/${eventId}`} className="mt-6 inline-block px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          Back to Event
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-2xl text-red-600 dark:text-red-400 text-sm font-medium flex items-start gap-3">
          <AlertTriangle className="shrink-0 mt-0.5" size={18} />
          <div>{error}</div>
        </div>
      )}

      {selectedId && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lock className="text-emerald-600 dark:text-emerald-400" size={20} />
            <div>
              <p className="text-emerald-800 dark:text-emerald-200 font-bold text-sm">Selection Locked</p>
              <p className="text-emerald-600 dark:text-emerald-400 text-xs">Your team has selected a problem statement and cannot change it.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {problemStatements.map((problem) => {
          const isSelected = selectedId === problem.id
          const isLocked = selectedId !== null

          return (
            <div 
              key={problem.id}
              className={`flex flex-col rounded-3xl border transition-all overflow-hidden ${
                isSelected 
                  ? 'bg-violet-50 dark:bg-violet-900/10 border-violet-200 dark:border-violet-800/50 ring-1 ring-violet-500/20 shadow-md' 
                  : isLocked
                    ? 'bg-slate-50/50 dark:bg-[#080d1a]/50 border-slate-100 dark:border-slate-800/50 opacity-60 grayscale-[0.3]'
                    : 'bg-white dark:bg-[#080d1a] border-slate-200 dark:border-cyan-900/30 hover:border-violet-300 dark:hover:border-violet-700/50 hover:shadow-lg'
              }`}
            >
              <div className="p-8 pb-6 flex-grow">
                <div className="flex justify-between items-start gap-4 mb-4">
                  <h3 className={`font-bold text-2xl ${isSelected ? 'text-violet-900 dark:text-violet-100' : 'text-slate-900 dark:text-white'}`}>
                    {problem.title}
                  </h3>
                  {isSelected && (
                    <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400">
                      <CheckCircle2 size={20} />
                    </div>
                  )}
                </div>
                
                <div className={`prose prose-sm dark:prose-invert max-w-none ${isSelected ? 'text-violet-800 dark:text-violet-200' : 'text-slate-600 dark:text-slate-300'}`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{problem.description}</p>
                </div>
              </div>
              
              {!isLocked && (
                <div className="p-6 pt-0 mt-auto">
                  {isLeader ? (
                    <button
                      onClick={() => handleSelect(problem.id)}
                      disabled={isSubmitting}
                      className="w-full py-4 bg-slate-900 dark:bg-cyan-600 text-white rounded-2xl text-base font-bold hover:bg-slate-800 dark:hover:bg-cyan-500 transition-all disabled:opacity-50 shadow-sm flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? 'Processing...' : 'Select This Problem'}
                    </button>
                  ) : (
                    <div className="w-full py-4 bg-slate-100 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 rounded-2xl text-sm font-bold text-center border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2">
                      <AlertTriangle size={16} />
                      Only the Team Leader can select the problem statement
                    </div>
                  )}
                </div>
              )}
              
              {isSelected && (
                <div className="px-8 py-4 bg-violet-100/50 dark:bg-violet-900/20 border-t border-violet-200 dark:border-violet-800/50 flex items-center justify-center">
                  <p className="text-violet-800 dark:text-violet-300 font-bold text-sm flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    This problem is currently selected by your team
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
