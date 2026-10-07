'use client'

import { useState } from 'react'
import { ProfileData, PendingAdmin, setAdminRole, inviteAdmin, revokeAdminInvite } from './actions'
import { Search, Shield, User, ShieldAlert, Loader2, Plus, X } from 'lucide-react'

export function AdminManager({ 
  initialProfiles,
  initialPending,
  currentUserId 
}: { 
  initialProfiles: ProfileData[]
  initialPending: PendingAdmin[]
  currentUserId: string 
}) {
  const [search, setSearch] = useState('')
  const [profiles, setProfiles] = useState<ProfileData[]>(initialProfiles)
  const [pending, setPending] = useState<PendingAdmin[]>(initialPending)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)

  const handleToggleAdmin = async (profile: ProfileData) => {
    setErrorMsg(null)
    setLoadingId(profile.id)
    
    const isCurrentlyAdmin = profile.role === 'admin'
    const result = await setAdminRole(profile.id, !isCurrentlyAdmin)
    
    if (result.error) {
      setErrorMsg(result.error)
    } else {
      setProfiles(prev => prev.map(p => 
        p.id === profile.id 
          ? { ...p, role: isCurrentlyAdmin ? 'participant' : 'admin' } 
          : p
      ))
    }
    
    setLoadingId(null)
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail) return
    
    setErrorMsg(null)
    setInviting(true)
    
    const result = await inviteAdmin(inviteEmail)
    if (result.error) {
      setErrorMsg(result.error)
    } else {
      setInviteEmail('')
      // Just reload page to get fresh data is simplest
      window.location.reload()
    }
    
    setInviting(false)
  }

  const handleRevoke = async (id: string) => {
    setErrorMsg(null)
    setLoadingId(id)
    
    const result = await revokeAdminInvite(id)
    if (result.error) {
      setErrorMsg(result.error)
    } else {
      setPending(prev => prev.filter(p => p.id !== id))
    }
    
    setLoadingId(null)
  }

  const filteredProfiles = profiles.filter(p => 
    (p.full_name?.toLowerCase() || '').includes(search.toLowerCase()) || 
    (p.email?.toLowerCase() || '').includes(search.toLowerCase())
  )

  const admins = filteredProfiles.filter(p => p.role === 'admin')
  const others = filteredProfiles.filter(p => p.role !== 'admin')

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-medium border border-red-100 dark:border-red-900/30 flex items-center gap-2">
          <ShieldAlert size={16} />
          {errorMsg}
        </div>
      )}

      <div className="bg-white dark:bg-[#080d1a] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm p-6">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Add Admin</h2>
        <form onSubmit={handleInvite} className="flex gap-3">
          <input
            type="email"
            placeholder="Enter email to invite as Admin..."
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            required
            className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={inviting || !inviteEmail}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {inviting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Add Admin
          </button>
        </form>
      </div>

      {pending.length > 0 && (
        <div className="bg-white dark:bg-[#080d1a] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-amber-50 dark:bg-amber-900/10">
            <h2 className="text-sm font-semibold text-amber-800 dark:text-amber-500 uppercase tracking-wider">Pending Admins (Signup Authorized)</h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {pending.map(p => (
              <div key={p.id} className="flex items-center justify-between p-4 sm:px-6 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-500">
                    <User size={18} />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                      {p.email}
                      <span className="text-[10px] uppercase font-bold tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full">
                        Pending Signup
                      </span>
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Authorized: {new Date(p.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleRevoke(p.id)}
                  disabled={loadingId === p.id}
                  className={`
                    p-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2
                    ${loadingId === p.id ? 'opacity-70 cursor-not-allowed' : ''}
                    bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-red-900/20 dark:hover:text-red-400
                  `}
                  title="Revoke Invite"
                >
                  {loadingId === p.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <X size={16} />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#080d1a] border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />
      </div>

      <div className="bg-white dark:bg-[#080d1a] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Administrators</h2>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {admins.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">No administrators found.</div>
          ) : (
            admins.map(profile => (
              <ProfileRow 
                key={profile.id} 
                profile={profile} 
                isCurrentUser={profile.id === currentUserId}
                isLoading={loadingId === profile.id}
                onToggle={() => handleToggleAdmin(profile)}
              />
            ))
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-[#080d1a] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Other Users</h2>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {others.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">No other users found.</div>
          ) : (
            others.map(profile => (
              <ProfileRow 
                key={profile.id} 
                profile={profile} 
                isCurrentUser={profile.id === currentUserId}
                isLoading={loadingId === profile.id}
                onToggle={() => handleToggleAdmin(profile)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function ProfileRow({ 
  profile, 
  isCurrentUser, 
  isLoading,
  onToggle 
}: { 
  profile: ProfileData
  isCurrentUser: boolean
  isLoading: boolean
  onToggle: () => void 
}) {
  const isAdmin = profile.role === 'admin'

  return (
    <div className="flex items-center justify-between p-4 sm:px-6 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
          {isAdmin ? <Shield size={18} /> : <User size={18} />}
        </div>
        <div>
          <div className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
            {profile.full_name || 'Unknown User'}
            {isCurrentUser && (
              <span className="text-[10px] uppercase font-bold tracking-wider bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400 px-2 py-0.5 rounded-full">
                You
              </span>
            )}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">{profile.email}</div>
        </div>
      </div>
      
      {!isCurrentUser && (
        <button
          onClick={onToggle}
          disabled={isLoading}
          className={`
            px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2
            ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
            ${isAdmin 
              ? 'bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-red-900/20 dark:hover:text-red-400' 
              : 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100 dark:bg-cyan-900/20 dark:text-cyan-400 dark:hover:bg-cyan-900/40'}
          `}
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : isAdmin ? (
            'Demote'
          ) : (
            'Make Admin'
          )}
        </button>
      )}
    </div>
  )
}
