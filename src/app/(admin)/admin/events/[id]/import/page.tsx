'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, AlertCircle, CheckCircle, FileUp, Info } from 'lucide-react'
import { previewImport, commitImport, PreviewResult } from './actions'

export default function ImportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = use(params)
  const router = useRouter()
  
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<PreviewResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [insertedCount, setInsertedCount] = useState(0)
  const [teamsCount, setTeamsCount] = useState(0)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setPreview(null)
      setError(null)
      setSuccess(false)
    }
  }

  const handlePreview = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    
    const formData = new FormData()
    formData.append('file', file)
    
    const result = await previewImport(eventId, formData)
    
    if (result.error) {
      setError(result.error)
    } else if (result.preview) {
      setPreview(result.preview)
    }
    
    setLoading(false)
  }

  const handleCommit = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    
    const formData = new FormData()
    formData.append('file', file)
    
    const result = await commitImport(eventId, formData)
    
    if (result.error) {
      setError(result.error)
    } else if (result.success) {
      setSuccess(true)
      setInsertedCount(result.insertedCount || 0)
      setTeamsCount(result.teamsCount || 0)
      setFile(null)
      setPreview(null)
      router.refresh()
    }
    
    setLoading(false)
  }

  return (
    <div className="max-w-4xl space-y-6">
      
      <div className="bg-white dark:bg-[#080d1a] rounded-2xl border border-slate-200 dark:border-cyan-900/30 shadow-sm p-6 sm:p-8">
        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-2">
          <Upload size={20} className="text-blue-600" />
          Import Participants & Teams
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-slate-50 dark:bg-cyan-950/20 p-4 rounded-xl border border-slate-200 dark:border-cyan-900/30 text-sm">
            <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Individual Format
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-2">Each row represents one participant.</p>
            <code className="text-xs text-slate-500 dark:text-slate-400 block">email, role, name, phone, college, branch, academic_year, breakfast, lunch, dinner</code>
            <ul className="mt-2 text-xs text-slate-500 dark:text-slate-400 list-disc list-inside">
              <li><strong className="font-bold">email</strong>: required</li>
              <li><strong className="font-bold">role</strong>: participant or coordinator</li>
              <li>Others: optional</li>
            </ul>
          </div>

          <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 text-sm">
            <h3 className="font-bold text-indigo-700 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              Team Format
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-2">Each row represents one team (up to 10 members).</p>
            <code className="text-xs text-indigo-600/80 block">Team Name, Member 1 Email, Member 1 Role, Member 1 Full Name, Member 2 Email...</code>
            <ul className="mt-2 text-xs text-slate-500 dark:text-slate-400 list-disc list-inside">
              <li><strong className="font-bold">Team Name</strong>: required</li>
              <li><strong className="font-bold">Member 1 Role</strong>: leader or member (exactly 1 leader per team)</li>
              <li><strong className="font-bold">Member Email</strong>: required for valid members</li>
            </ul>
          </div>
        </div>

        <div className="mt-8">
          <label className="block w-full">
            <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${file ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-cyan-950/40 cursor-pointer'}`}>
              <FileUp size={32} className={`mx-auto mb-3 ${file ? 'text-blue-500' : 'text-slate-400'}`} />
              {file ? (
                <div>
                  <p className="font-bold text-blue-700">{file.name}</p>
                  <p className="text-sm text-blue-600/70 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div>
                  <p className="font-bold text-slate-700 dark:text-slate-200">Click to upload CSV</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">or drag and drop here</p>
                </div>
              )}
            </div>
            <input type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
          </label>
        </div>

        {file && !preview && !success && (
          <div className="mt-6 flex justify-end">
            <button 
              onClick={handlePreview}
              disabled={loading}
              className="bg-slate-900 text-white font-bold py-3 px-6 rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : null}
              Preview Import
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 text-red-700">
          <AlertCircle className="shrink-0 mt-0.5" size={18} />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex flex-col items-center justify-center text-emerald-700 text-center animate-in fade-in">
          <CheckCircle size={48} className="mb-4 text-emerald-500" />
          <h3 className="text-xl font-black mb-1">Import Successful!</h3>
          <p className="font-medium text-emerald-600/80 mb-6">
            {teamsCount > 0 
              ? `Successfully imported ${teamsCount} teams and ${insertedCount} participants.` 
              : `Successfully imported ${insertedCount} participants.`}
          </p>
          <button 
            onClick={() => { setSuccess(false); setFile(null) }}
            className="bg-emerald-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Import Another File
          </button>
        </div>
      )}

      {preview && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-300">
          
          <div className="bg-white dark:bg-[#080d1a] rounded-2xl border border-slate-200 dark:border-cyan-900/30 shadow-sm overflow-hidden">
            <div className="bg-slate-50 dark:bg-cyan-950/20 border-b border-slate-200 dark:border-cyan-900/30 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                Preview Results
                {preview.isTeamImport ? (
                  <span className="text-[10px] uppercase tracking-wider font-black bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded ml-2">Team Import</span>
                ) : (
                  <span className="text-[10px] uppercase tracking-wider font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded ml-2">Individual Import</span>
                )}
              </h3>
              <div className="flex gap-2">
                <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-sm font-bold">
                  {preview.valid.length} Valid {preview.valid.length === 1 ? 'Member' : 'Members'}
                </div>
                {preview.isTeamImport && (
                  <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-sm font-bold">
                    {preview.teamsCount} {preview.teamsCount === 1 ? 'Team' : 'Teams'}
                  </div>
                )}
                {preview.invalid.length > 0 && (
                  <div className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-sm font-bold">
                    {preview.invalid.length} {preview.invalid.length === 1 ? 'Error' : 'Errors'}
                  </div>
                )}
                {preview.conflicts.length > 0 && (
                  <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-lg text-sm font-bold">
                    {preview.conflicts.length} {preview.conflicts.length === 1 ? 'Conflict' : 'Conflicts'}
                  </div>
                )}
              </div>
            </div>

            {preview.invalid.length > 0 && (
              <div className="p-6 border-b border-slate-100 dark:border-cyan-900/20 bg-red-50/30">
                <h4 className="text-red-800 font-bold mb-3 flex items-center gap-2">
                  <AlertCircle size={16} /> Critical Errors
                </h4>
                <div className="space-y-2">
                  {preview.invalid.map((inv, i) => (
                    <div key={i} className="text-sm flex gap-3 text-red-700 bg-red-100/50 p-2 rounded-lg border border-red-100">
                      <span className="font-bold opacity-70 w-16 shrink-0">Row {inv.row}</span>
                      {inv.team && <span className="font-bold opacity-80 shrink-0">[{inv.team}]</span>}
                      {inv.email && <span className="font-mono bg-white dark:bg-[#080d1a]/50 px-1 rounded">{inv.email}</span>}
                      <span className="font-medium">{inv.error}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {preview.conflicts.length > 0 && (
              <div className="p-6 border-b border-slate-100 dark:border-cyan-900/20 bg-amber-50/30">
                <h4 className="text-amber-800 font-bold mb-3 flex items-center gap-2">
                  <Info size={16} /> Role Conflicts (Will be Ignored)
                </h4>
                <div className="space-y-2">
                  {preview.conflicts.map((c, i) => (
                    <div key={i} className="text-sm flex gap-3 text-amber-700 bg-amber-100/50 p-2 rounded-lg border border-amber-100">
                      <span className="font-mono bg-white dark:bg-[#080d1a]/50 px-1 rounded">{c.email}</span>
                      <span className="font-medium">
                        DB role is <strong>{c.currentRole}</strong>, but CSV specifies <strong>{c.csvRole}</strong>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {preview.valid.length > 0 && (
              <div className="p-0 overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 dark:bg-cyan-950/20 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-cyan-900/30">
                    <tr>
                      {preview.isTeamImport && <th className="px-6 py-3 font-bold">Team</th>}
                      <th className="px-6 py-3 font-bold">Email</th>
                      <th className="px-6 py-3 font-bold">Role</th>
                      <th className="px-6 py-3 font-bold">Name</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {preview.valid.slice(0, 100).map((v, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-cyan-950/40 transition-colors">
                        {preview.isTeamImport && (
                          <td className="px-6 py-3 font-medium text-indigo-700">{v.team_name}</td>
                        )}
                        <td className="px-6 py-3 font-mono text-slate-600 dark:text-slate-300">{v.email}</td>
                        <td className="px-6 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                            v.role === 'leader' ? 'bg-indigo-100 text-indigo-700' :
                            v.role === 'member' ? 'bg-slate-100 dark:bg-cyan-900/20 text-slate-600 dark:text-slate-300' :
                            v.role === 'coordinator' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {v.role}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-slate-600 dark:text-slate-300">{v.name || <span className="text-slate-300 italic">None</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.valid.length > 100 && (
                  <div className="p-4 text-center text-sm font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-cyan-950/20 border-t border-slate-200 dark:border-cyan-900/30">
                    + {preview.valid.length - 100} more members not shown
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button 
              onClick={() => { setPreview(null); setFile(null) }}
              disabled={loading}
              className="bg-white dark:bg-[#080d1a] border border-slate-200 dark:border-cyan-900/30 text-slate-600 dark:text-slate-300 font-bold py-3 px-6 rounded-xl hover:bg-slate-50 dark:hover:bg-cyan-950/40 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleCommit}
              disabled={loading || preview.invalid.length > 0 || preview.valid.length === 0}
              className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-600/20 flex items-center gap-2"
            >
              {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : null}
              {preview.invalid.length > 0 ? 'Fix Errors to Import' : 'Commit Import'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
