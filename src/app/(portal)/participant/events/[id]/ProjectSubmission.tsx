'use client'

import { useState } from 'react'
import { submitProject } from './actions'
import { AlertTriangle, CheckCircle2, GitBranch, Globe, ExternalLink, Rocket } from 'lucide-react'

export function ProjectSubmission({ 
  eventId, 
  isLeader,
  githubUrl,
  deployedUrl,
  submittedAt
}: { 
  eventId: string, 
  isLeader: boolean,
  githubUrl?: string | null,
  deployedUrl?: string | null,
  submittedAt?: string | null
}) {
  const [ghUrl, setGhUrl] = useState('')
  const [depUrl, setDepUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isSubmitted = !!submittedAt

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitted || !isLeader) return

    if (!ghUrl.trim().toLowerCase().startsWith('https://github.com/')) {
      setError('GitHub URL must start with https://github.com/')
      return
    }

    if (depUrl.trim() && !depUrl.trim().toLowerCase().startsWith('https://')) {
      setError('Deployed URL must start with https://')
      return
    }

    setIsSubmitting(true)
    setError(null)

    const result = await submitProject(eventId, ghUrl, depUrl)

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
    }
    // On success, revalidatePath runs and updates the page state
  }

  return (
    <section className="bg-white dark:bg-[#080d1a] border border-slate-100 dark:border-cyan-900/20 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] h-fit mt-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Rocket size={16} />
            </div>
            Project Submission
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Submit your team&apos;s project links.</p>
        </div>
        {isSubmitted && (
          <div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider rounded-lg border border-emerald-100 flex items-center gap-1.5">
            <CheckCircle2 size={12} />
            Submitted
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium flex items-start gap-3">
          <AlertTriangle className="shrink-0 mt-0.5" size={16} />
          <div>{error}</div>
        </div>
      )}

      {isSubmitted ? (
        <div className="space-y-6">
          <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
                <GitBranch size={14} /> GitHub Repository
              </div>
              <a href={githubUrl!} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm flex items-center gap-2 break-all">
                {githubUrl} <ExternalLink size={14} />
              </a>
            </div>
            
            {deployedUrl && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
                  <Globe size={14} /> Deployed Project
                </div>
                <a href={deployedUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm flex items-center gap-2 break-all">
                  {deployedUrl} <ExternalLink size={14} />
                </a>
              </div>
            )}
          </div>
          
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 size={12} />
            Submitted at {new Date(submittedAt!).toLocaleString()}
          </p>
        </div>
      ) : (
        <>
          {isLeader ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  GitHub Repository <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://github.com/..."
                  value={ghUrl}
                  onChange={(e) => setGhUrl(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Deployed Project <span className="text-slate-400 font-normal ml-1">(Optional)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={depUrl}
                  onChange={(e) => setDepUrl(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !ghUrl.trim()}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Project'}
              </button>
            </form>
          ) : (
            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
              <Rocket className="mx-auto text-slate-400 mb-3" size={24} />
              <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-1">Not Submitted Yet</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Only the team leader can submit the final project links.</p>
            </div>
          )}
        </>
      )}
    </section>
  )
}
