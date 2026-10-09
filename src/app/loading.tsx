export default function RootLoading() {
  return (
    <div className="w-full min-h-screen p-4 sm:p-8 flex flex-col space-y-6 animate-pulse max-w-7xl mx-auto">
      {/* Top Bar Skeleton */}
      <div className="h-14 w-full bg-slate-200/70 dark:bg-[#0d1627] rounded-2xl flex items-center justify-between px-6 border border-slate-200/50 dark:border-cyan-900/20">
        <div className="flex items-center gap-3">
          <div className="stage-favicon w-8 h-8 rounded-full bg-blue-500/20 dark:bg-cyan-500/20"></div>
          <div className="stage-non-actionable h-4 w-28 bg-slate-300/80 dark:bg-cyan-900/40 rounded-md"></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="stage-actionable h-7 w-20 bg-slate-300/60 dark:bg-cyan-950/40 rounded-lg"></div>
          <div className="stage-icon w-8 h-8 rounded-full bg-slate-300/80 dark:bg-cyan-900/40"></div>
        </div>
      </div>

      {/* Hero / Banner Skeleton */}
      <div className="h-44 sm:h-52 w-full bg-gradient-to-r from-slate-200/80 to-slate-200/50 dark:from-[#0a1324] dark:to-[#07101f] rounded-3xl p-8 border border-slate-200/60 dark:border-cyan-900/30 flex flex-col justify-center space-y-4">
        <div className="stage-non-actionable h-4 w-28 bg-blue-500/20 dark:bg-cyan-500/20 rounded-full"></div>
        <div className="stage-non-actionable h-8 w-64 sm:w-96 bg-slate-300/90 dark:bg-slate-700/50 rounded-xl"></div>
        <div className="stage-non-actionable h-4 w-48 sm:w-80 bg-slate-300/60 dark:bg-slate-800/60 rounded-lg"></div>
      </div>

      {/* Grid Content Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-48 rounded-2xl bg-slate-100/80 dark:bg-[#080d1a] border border-slate-200/60 dark:border-cyan-900/20 p-6 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="stage-icon w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-cyan-500/20"></div>
              <div className="stage-non-actionable h-5 w-40 bg-slate-300/80 dark:bg-slate-700/50 rounded-lg"></div>
              <div className="stage-non-actionable h-3 w-52 bg-slate-300/50 dark:bg-slate-800/50 rounded"></div>
            </div>
            <div className="stage-actionable h-4 w-24 bg-blue-500/20 dark:bg-cyan-500/20 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  )
}
