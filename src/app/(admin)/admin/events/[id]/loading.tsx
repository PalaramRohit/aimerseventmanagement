export default function EventOverviewLoading() {
  return (
    <div className="mt-8 space-y-8 animate-pulse">
      {/* Controls & Operations Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#080d1a] rounded-2xl p-6 border border-slate-200 dark:border-cyan-900/30 flex flex-col justify-between h-32"
          >
            <div className="flex items-center justify-between">
              <div className="stage-non-actionable w-24 h-4 bg-slate-200 dark:bg-slate-700/60 rounded"></div>
              <div className="stage-icon w-8 h-8 rounded-lg bg-blue-500/10 dark:bg-cyan-500/20"></div>
            </div>
            <div className="stage-non-actionable w-16 h-7 bg-slate-300 dark:bg-slate-700 rounded-lg"></div>
          </div>
        ))}
      </div>

      {/* Main Operations Block */}
      <div className="bg-white dark:bg-[#080d1a] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-cyan-900/30">
        <div className="flex justify-between items-center mb-6">
          <div className="stage-non-actionable w-48 h-6 bg-slate-200 dark:bg-slate-700/60 rounded-lg"></div>
          <div className="stage-actionable w-24 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-14 rounded-xl bg-slate-50 dark:bg-[#0c1427] border border-slate-100 dark:border-cyan-900/20 flex items-center justify-between px-4"
            >
              <div className="flex items-center gap-3">
                <div className="stage-icon w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                <div className="stage-non-actionable w-36 h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
              <div className="stage-non-actionable w-20 h-5 bg-emerald-500/20 dark:bg-emerald-500/20 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
