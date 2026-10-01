export default function HasilLoading() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 font-sans">
      {/* Header Bar Skeleton */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-6 py-3.5">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-slate-200 animate-pulse" />
            <div className="space-y-1">
              <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
              <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
            </div>
          </div>
          <div className="h-8 w-28 bg-slate-200 rounded-lg animate-pulse" />
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 pt-8 space-y-6">
        {/* Status Info Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="space-y-2">
            <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
            <div className="h-6 w-56 bg-slate-200 rounded animate-pulse" />
            <p className="text-xs text-slate-500">
              Sedang memuat lembar hasil pengerjaan kuis dan analisis pembahasan AI...
            </p>
          </div>

          {/* Metric Skeletons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="h-2.5 w-16 bg-slate-200 rounded animate-pulse" />
                <div className="h-7 w-20 bg-slate-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Question Review Cards Skeletons */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
                <div className="h-5 w-16 bg-slate-200 rounded-full animate-pulse" />
              </div>
              <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-slate-100 rounded animate-pulse" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="h-14 bg-slate-50 border border-slate-200/60 rounded-lg animate-pulse" />
                <div className="h-14 bg-slate-50 border border-slate-200/60 rounded-lg animate-pulse" />
              </div>
              <div className="h-20 bg-slate-50 border border-slate-200/60 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
