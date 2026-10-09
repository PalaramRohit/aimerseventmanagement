export default function CoordinatorEventDetailsLoading() {
  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-12 animate-pulse">
      {/* Banner Skeleton */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-8 sm:p-12 h-56 flex flex-col justify-center space-y-4 shadow-xl">
        <div className="stage-non-actionable w-36 h-6 bg-indigo-500/20 rounded-full"></div>
        <div className="stage-non-actionable w-80 h-10 bg-slate-300/40 rounded-xl"></div>
        <div className="stage-non-actionable w-96 max-w-full h-4 bg-indigo-100/30 rounded-lg"></div>
      </div>

      {/* Grid: Scanner Viewfinder & Scan History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Scanner Control Skeleton */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-[#080d1a] border border-slate-200 dark:border-cyan-900/30 rounded-3xl p-6 flex flex-col items-center space-y-4 min-h-[380px]">
            <div className="stage-non-actionable w-40 h-6 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
            <div className="stage-non-actionable w-full h-56 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
              <div className="w-32 h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl"></div>
            </div>
            <div className="stage-actionable w-full h-10 bg-indigo-500/20 rounded-xl"></div>
          </div>
        </div>

        {/* Scan History Skeleton */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-[#080d1a] border border-slate-200 dark:border-cyan-900/30 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex justify-between items-center mb-2">
              <div className="stage-non-actionable w-40 h-6 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
              <div className="stage-non-actionable w-20 h-6 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-14 rounded-xl bg-slate-50 dark:bg-[#0c1427] border border-slate-100 dark:border-cyan-900/20 flex items-center justify-between px-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="stage-icon w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                    <div className="stage-non-actionable w-36 h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  </div>
                  <div className="stage-non-actionable w-24 h-5 bg-emerald-500/20 rounded-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
