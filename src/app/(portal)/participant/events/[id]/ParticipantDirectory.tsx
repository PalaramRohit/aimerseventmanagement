'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users, RefreshCw, Pencil, Check, X, Link } from 'lucide-react'

interface ParticipantData {
  participant_id: string
  full_name: string
  college: string | null
  academic_year: string | null
  linkedin_url: string | null
}

export function ParticipantDirectory({ eventId, currentUserId }: { eventId: string, currentUserId: string }) {
  const [participants, setParticipants] = useState<ParticipantData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // LinkedIn editing state
  const [isEditing, setIsEditing] = useState(false)
  const [editUrl, setEditUrl] = useState('')
  const [savingUrl, setSavingUrl] = useState(false)

  const fetchDirectory = useCallback(async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { data: res, error: err } = await supabase.rpc('get_event_participants_directory', { p_event_id: eventId })
    if (err) {
      setError(err.message)
    } else {
      setParticipants((res as ParticipantData[]) || [])
    }
    setLoading(false)
  }, [eventId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDirectory()
  }, [fetchDirectory])

  const handleSaveLinkedIn = async () => {
    setSavingUrl(true)
    const supabase = createClient()
    const { error: err } = await supabase.rpc('update_my_linkedin', { p_url: editUrl })
    setSavingUrl(false)
    if (err) {
      alert(err.message)
    } else {
      setIsEditing(false)
      fetchDirectory()
    }
  }

  const currentUserData = participants.find(p => p.participant_id === currentUserId)

  return (
    <section className="bg-white dark:bg-[#080d1a] border border-slate-100 dark:border-cyan-900/20 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] h-full mt-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-6 border-b border-slate-100 dark:border-cyan-900/20 gap-4">
        <div>
          <h2 className="font-extrabold text-2xl text-slate-900 dark:text-white flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Users size={20} />
            </div>
            Participant Directory
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">See who else is participating in this event.</p>
        </div>
        <button
          onClick={fetchDirectory}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-cyan-950/20 text-slate-600 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-cyan-900/30 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {currentUserData && (
        <div className="mb-8 p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-bold text-indigo-900 dark:text-indigo-100 text-sm uppercase tracking-wider mb-1">Your LinkedIn Profile</h3>
              <p className="text-sm text-indigo-700/80 dark:text-indigo-300/80">Connect with other participants by adding your LinkedIn URL.</p>
            </div>
            {isEditing ? (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="url"
                  placeholder="https://www.linkedin.com/in/username"
                  value={editUrl}
                  onChange={e => setEditUrl(e.target.value)}
                  className="flex-1 sm:w-64 px-3 py-1.5 text-sm rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-indigo-950 text-slate-900 dark:text-white"
                />
                <button
                  onClick={handleSaveLinkedIn}
                  disabled={savingUrl}
                  className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 transition-colors"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={savingUrl}
                  className="p-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg disabled:opacity-50 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {currentUserData.linkedin_url ? (
                  <a
                    href={currentUserData.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0A66C2] hover:bg-[#004182] text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <Link size={14} /> View
                  </a>
                ) : (
                  <span className="text-sm font-medium text-slate-500 italic">Not provided</span>
                )}
                <button
                  onClick={() => {
                    setEditUrl(currentUserData.linkedin_url || '')
                    setIsEditing(true)
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-sm font-medium rounded-lg border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 transition-colors"
                >
                  <Pencil size={14} /> {currentUserData.linkedin_url ? 'Edit' : 'Add'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">{error}</div>
      ) : loading && participants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <RefreshCw size={24} className="animate-spin text-indigo-500" />
        </div>
      ) : participants.length === 0 ? (
        <div className="p-12 text-center text-slate-500 text-sm italic border border-dashed border-slate-200 dark:border-cyan-900/30 rounded-2xl">
          No other participants found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {participants.map((p) => (
            <div key={p.participant_id} className="flex flex-col p-4 rounded-xl border border-slate-100 dark:border-cyan-900/20 bg-slate-50/50 dark:bg-[#080d1a] shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start gap-2 mb-3">
                <div className="font-bold text-slate-800 dark:text-slate-100">{p.full_name || 'Anonymous User'}</div>
                {p.linkedin_url && (
                  <a
                    href={p.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0A66C2] hover:text-[#004182] bg-blue-50 dark:bg-blue-900/20 p-1.5 rounded-md transition-colors"
                    title="LinkedIn Profile"
                  >
                    <Link size={16} />
                  </a>
                )}
              </div>
              <div className="mt-auto space-y-1">
                {p.college && (
                  <div className="text-xs text-slate-600 dark:text-slate-400 font-medium line-clamp-1" title={p.college}>
                    {p.college}
                  </div>
                )}
                {p.academic_year && (
                  <div className="text-xs text-slate-500 dark:text-slate-500 uppercase tracking-wider">
                    {p.academic_year}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
