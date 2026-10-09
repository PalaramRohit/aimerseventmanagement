export default function ParticipantEventDetailsLoading() {
  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-12 animate-pulse">
      {/* Event Banner Skeleton */}
      <div className="bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] rounded-3xl p-8 sm:p-12 h-64 flex flex-col justify-center space-y-4 shadow-xl">
        <div className="stage-non-actionable w-32 h-6 bg-blue-500/20 rounded-full"></div>
        <div className="stage-non-actionable w-80 h-10 bg-slate-300/40 rounded-xl"></div>
        <div className="flex gap-6 pt-2">
          <div className="stage-non-actionable w-36 h-4 bg-blue-100/30 rounded"></div>
          <div className="stage-non-actionable w-32 h-4 bg-blue-100/30 rounded"></div>
        </div>
      </div>

      {/* Main Grid: Data Matrix Card & Guides */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Token / Data Matrix Card Skeleton */}
        <div className="lg:col-span-5 bg-white dark:bg-[#080d1a] border border-slate-200 dark:border-cyan-900/30 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center space-y-6 min-h-[400px]">
          <div className="stage-non-actionable w-48 h-6 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          <div className="stage-icon w-48 h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
            <div className="stage-icon w-32 h-32 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
          </div>
          <div className="stage-non-actionable w-40 h-4 bg-slate-100 dark:bg-slate-800 rounded"></div>
        </div>

        {/* Event Details / Submission Skeleton */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-[#080d1a] border border-slate-200 dark:border-cyan-900/30 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="stage-non-actionable w-40 h-6 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
            <div className="stage-non-actionable w-full h-20 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
            <div className="stage-actionable w-32 h-10 bg-blue-500/20 dark:bg-cyan-600/30 rounded-xl"></div>
          </div>
          <div className="bg-white dark:bg-[#080d1a] border border-slate-200 dark:border-cyan-900/30 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="stage-non-actionable w-36 h-6 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
            <div className="stage-non-actionable w-full h-16 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
