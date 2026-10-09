export default function ParticipantLoading() {
  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-12 animate-pulse">
      {/* Hero Banner Skeleton */}
      <div className="bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] rounded-3xl p-8 sm:p-12 h-56 flex flex-col justify-center space-y-3 shadow-xl">
        <div className="stage-non-actionable w-32 h-6 bg-blue-500/20 rounded-full"></div>
        <div className="stage-non-actionable w-72 h-9 bg-slate-300/40 rounded-xl"></div>
        <div className="stage-non-actionable w-96 max-w-full h-4 bg-blue-100/30 rounded-lg"></div>
      </div>

      {/* Profile Card Skeleton */}
      <div className="bg-white dark:bg-[#080d1a] border border-slate-100 dark:border-cyan-900/20 rounded-3xl p-8 space-y-6">
        <div className="flex items-center gap-2">
          <div className="stage-icon w-8 h-8 rounded-full bg-blue-50 dark:bg-cyan-950/40"></div>
          <div className="stage-non-actionable w-40 h-5 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <div className="stage-non-actionable w-24 h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="stage-non-actionable w-48 h-5 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="stage-non-actionable w-28 h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="stage-non-actionable w-40 h-5 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>

      {/* My Events Skeleton */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="stage-non-actionable w-36 h-7 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          <div className="stage-non-actionable w-20 h-6 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-[#080d1a] border border-slate-200 dark:border-cyan-900/30 rounded-3xl p-6 h-64 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="stage-non-actionable w-20 h-5 bg-emerald-500/20 rounded-full"></div>
                <div className="stage-non-actionable w-44 h-6 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                <div className="stage-non-actionable w-36 h-4 bg-slate-100 dark:bg-slate-800 rounded"></div>
              </div>
              <div className="stage-actionable w-full h-10 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
