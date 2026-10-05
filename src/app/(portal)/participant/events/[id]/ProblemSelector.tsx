'use client'

import { useState } from 'react'
import { CheckCircle2, FileText, Lock } from 'lucide-react'
import { selectProblemStatement } from './actions'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ProblemSelector({ eventId, teamId, problemStatements, initialSelectionId, isLeader }: { eventId: string, teamId: string, problemStatements: any[], initialSelectionId: string | null, isLeader: boolean }) {
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectionId)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSelect = async (problemId: string) => {
    if (selectedId) return // Already locked
    if (!isLeader) {
      setError("Only the team leader can select the problem statement.")
      return
    }
    if (!window.confirm('Are you sure you want to select this problem statement? This action cannot be undone by team members.')) {
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
    return null // Don't show the section if there are no published statements
  }

  return (
    <section className="bg-white dark:bg-[#080d1a] border border-slate-100 dark:border-cyan-900/20 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col mt-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-violet-50 flex items-center justify-center text-violet-600">
              <FileText size={16} />
            </div>
            Problem Statement
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Select the challenge your team will solve.</p>
        </div>
        {selectedId && (
          <div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider rounded-lg border border-emerald-100 flex items-center gap-1.5">
            <Lock size={12} />
            Locked
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {problemStatements.map((problem) => {
          const isSelected = selectedId === problem.id
          const isLocked = selectedId !== null
          const isExpanded = expandedId === problem.id || isSelected

          return (
            <div 
              key={problem.id}
              onClick={() => {
                if (!isSelected) {
                  setExpandedId(isExpanded ? null : problem.id)
                }
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                isSelected 
                  ? 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-700 ring-2 ring-violet-500 ring-opacity-50' 
                  : isLocked
                    ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 opacity-50 grayscale hover:bg-slate-100'
                    : 'bg-white dark:bg-[#080d1a] border-slate-200 dark:border-cyan-900/30 hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-md'
              }`}
            >
              <div className="flex justify-between items-center">
                <h3 className={`font-bold text-lg ${isSelected ? 'text-violet-900 dark:text-violet-100' : 'text-slate-900 dark:text-white'}`}>
                  {problem.title}
                </h3>
                {isSelected ? (
                  <CheckCircle2 className="text-violet-600 dark:text-violet-400 shrink-0" size={20} />
                ) : (
                  <div className={`shrink-0 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                )}
              </div>
              
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                  <p className={`text-sm mb-5 ${isSelected ? 'text-violet-700 dark:text-violet-300' : 'text-slate-600 dark:text-slate-300'}`}>
                    {problem.description}
                  </p>
                  
                  {!isLocked && (
                    <>
                      {isLeader ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelect(problem.id)
                          }}
                          disabled={isSubmitting}
                          className="w-full py-2.5 bg-slate-900 dark:bg-cyan-600 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 shadow-sm"
                        >
                          {isSubmitting ? 'Selecting...' : 'Select this problem'}
                        </button>
                      ) : (
                        <div className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl text-sm font-bold text-center border border-slate-200 dark:border-slate-700">
                          Only the Team Leader can select the problem statement
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
