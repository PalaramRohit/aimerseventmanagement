'use client'

import { useState, useRef } from 'react'
import { previewImport, commitImport, PreviewResult } from './actions'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, AlertOctagon, Info } from 'lucide-react'

export default function ImportClient({ eventId, eventName }: { eventId: string, eventName: string }) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<PreviewResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  async function handlePreview(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!file) return

    setIsLoading(true)
    setError(null)
    setPreview(null)

    const formData = new FormData()
    formData.append('file', file)

    const result = await previewImport(eventId, formData)
    
    setIsLoading(false)
    if (result.error) {
      setError(result.error)
    } else if (result.preview) {
      setPreview(result.preview)
    }
  }

  async function handleCommit() {
    if (!file || !preview) return

    setIsLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)

    const result = await commitImport(eventId, formData)
    
    setIsLoading(false)
    if (result.error) {
      setError(result.error)
    } else if (result.success) {
      setIsSuccess(true)
    }
  }

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <div className="bg-white dark:bg-[#080d1a] border border-emerald-100 rounded-2xl p-10 text-center shadow-lg shadow-emerald-900/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500"></div>
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5 text-emerald-600">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">Import Successful!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto text-sm">The CSV has been securely processed and all valid users have been imported.</p>
          <button 
            onClick={() => router.push(`/admin/events/${eventId}`)}
            className="bg-[#0a1122] hover:bg-[#152345] text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg shadow-slate-900/10 transition-all inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Return to Event Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <button onClick={() => router.push(`/admin/events/${eventId}`)} className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-800 mb-2 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Back to Event
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">Import Data</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium text-sm">Upload participant and coordinator CSV rosters for <span className="font-bold text-slate-700 dark:text-slate-200">{eventName}</span></p>
        </div>
      </div>

      {/* STEP 1: UPLOAD CSV CARD */}
      <div className={`bg-white dark:bg-[#080d1a] rounded-2xl border ${preview ? 'border-slate-100 dark:border-cyan-900/20 shadow-sm opacity-60' : 'border-blue-100 shadow-lg shadow-blue-900/5 ring-4 ring-blue-50'} transition-all duration-300 relative overflow-hidden`}>
        {preview && <div className="absolute inset-0 bg-slate-50 dark:bg-cyan-950/20 z-10 pointer-events-none"></div>}
        
        <div className="px-6 py-5 border-b border-slate-100 dark:border-cyan-900/20 bg-slate-50 dark:bg-cyan-950/20 flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">1</div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Select CSV File</h3>
        </div>

        <div className="p-6">
          <div className="mb-6 p-4 bg-slate-50 dark:bg-cyan-950/20 border border-slate-100 dark:border-cyan-900/20 rounded-xl flex items-start gap-3">
            <Info size={18} className="text-slate-400 shrink-0 mt-0.5" />
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Your CSV must contain <code>email</code> and <code>role</code> headers. The role must be strictly <code>participant</code> or <code>coordinator</code>. Maximum file size is 5MB.
            </div>
          </div>
          
          <form ref={formRef} onSubmit={handlePreview} className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <div className="flex-1 relative">
              <input 
                type="file" 
                accept=".csv" 
                onChange={(e) => {
                  setFile(e.target.files?.[0] || null)
                  setPreview(null)
                }}
                className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-slate-200 dark:border-cyan-900/30 rounded-xl transition-all cursor-pointer bg-white dark:bg-[#080d1a]"
              />
            </div>
            <button 
              type="submit" 
              disabled={!file || isLoading}
              className="bg-white dark:bg-[#080d1a] border-2 border-slate-200 dark:border-cyan-900/30 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-cyan-950/40 text-slate-700 dark:text-slate-200 px-8 py-3 rounded-xl text-sm font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap flex items-center justify-center gap-2"
            >
              {isLoading && !preview ? (
                <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></span> Parsing...</span>
              ) : (
                <><FileSpreadsheet size={16} /> Preview Import</>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2">
              <AlertOctagon size={18} className="text-red-500 shrink-0 mt-0.5" />
              <div className="text-red-700 text-sm font-medium">{error}</div>
            </div>
          )}
        </div>
      </div>

      {/* STEP 2: REVIEW CARD */}
      {preview && (
        <div className="bg-white dark:bg-[#080d1a] rounded-2xl border border-blue-100 shadow-lg shadow-blue-900/5 ring-4 ring-blue-50 animate-in fade-in slide-in-from-bottom-4 relative overflow-hidden">
          
          <div className="px-6 py-5 border-b border-slate-100 dark:border-cyan-900/20 bg-slate-50 dark:bg-cyan-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-[#0a1122] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm shadow-[#0a1122]/20">2</div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Review & Commit</h3>
            </div>
            
            <button 
              onClick={handleCommit}
              disabled={isLoading || preview.valid.length === 0}
              className="bg-[#0a1122] hover:bg-[#152345] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-slate-900/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Committing...</span>
              ) : (
                <><Upload size={16} /> Commit {preview.valid.length} Rows</>
              )}
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-5 bg-teal-50/50 border border-teal-100 rounded-xl flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
                <CheckCircle2 size={80} className="absolute -right-4 -bottom-4 text-teal-500/5" />
                <div className="text-teal-700 font-bold text-xs tracking-widest uppercase mb-1 z-10">Valid Rows</div>
                <div className="text-3xl font-black text-teal-600 tracking-tight z-10">{preview.valid.length}</div>
              </div>
              <div className="p-5 bg-red-50/50 border border-red-100 rounded-xl flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
                <AlertOctagon size={80} className="absolute -right-4 -bottom-4 text-red-500/5" />
                <div className="text-red-700 font-bold text-xs tracking-widest uppercase mb-1 z-10">Invalid Rows</div>
                <div className="text-3xl font-black text-red-600 tracking-tight z-10">{preview.invalid.length}</div>
              </div>
              <div className="p-5 bg-orange-50/50 border border-orange-100 rounded-xl flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
                <AlertTriangle size={80} className="absolute -right-4 -bottom-4 text-orange-500/5" />
                <div className="text-orange-700 font-bold text-xs tracking-widest uppercase mb-1 z-10">Role Conflicts</div>
                <div className="text-3xl font-black text-orange-600 tracking-tight z-10">{preview.conflicts.length}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {preview.conflicts.length > 0 && (
                <div className="bg-white dark:bg-[#080d1a] border border-orange-100 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-orange-50 px-4 py-2.5 border-b border-orange-100 flex items-center gap-2">
                    <AlertTriangle size={14} className="text-orange-600" />
                    <h4 className="font-bold text-orange-800 text-sm">Role Conflicts (Ignored)</h4>
                  </div>
                  <div className="p-4 max-h-60 overflow-y-auto">
                    <ul className="text-sm text-slate-700 dark:text-slate-200 space-y-3">
                      {preview.conflicts.slice(0, 10).map((c, i) => (
                        <li key={i} className="flex flex-col gap-1 pb-3 border-b border-orange-100/50 last:border-0 last:pb-0">
                          <span className="font-bold text-slate-900 dark:text-white">{c.email}</span>
                          <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider">
                            <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-cyan-900/20 text-slate-500 dark:text-slate-400 rounded border border-slate-200 dark:border-cyan-900/30">Current: {c.currentRole}</span>
                            <span className="text-slate-400">vs</span>
                            <span className="px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded border border-orange-200">CSV: {c.csvRole}</span>
                          </div>
                        </li>
                      ))}
                      {preview.conflicts.length > 10 && <li className="pt-2 text-orange-500/70 italic text-center text-xs font-medium">+ {preview.conflicts.length - 10} more conflicts hidden</li>}
                    </ul>
                  </div>
                </div>
              )}

              {preview.invalid.length > 0 && (
                <div className="bg-white dark:bg-[#080d1a] border border-red-100 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-red-50 px-4 py-2.5 border-b border-red-100 flex items-center gap-2">
                    <AlertOctagon size={14} className="text-red-600" />
                    <h4 className="font-bold text-red-800 text-sm">Invalid Rows (Ignored)</h4>
                  </div>
                  <div className="p-4 max-h-60 overflow-y-auto">
                    <ul className="text-sm text-slate-700 dark:text-slate-200 space-y-3">
                      {preview.invalid.slice(0, 10).map((err, i) => (
                        <li key={i} className="flex flex-col gap-1 pb-3 border-b border-red-100/50 last:border-0 last:pb-0">
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-[10px] font-bold tracking-wider border border-red-200">ROW {err.row}</span>
                            <span className="font-bold text-slate-900 dark:text-white">{err.email || 'No email provided'}</span>
                          </div>
                          <span className="text-red-500 font-medium text-xs bg-red-50/50 px-2 py-1 rounded inline-block">{err.error}</span>
                        </li>
                      ))}
                      {preview.invalid.length > 10 && <li className="pt-2 text-red-500/70 italic text-center text-xs font-medium">+ {preview.invalid.length - 10} more invalid rows hidden</li>}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
