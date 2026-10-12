import { Skeleton } from "@/components/ui/skeleton";

export default function QuizLoading() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header bar skeleton */}
      <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-2xl" />
          <div className="space-y-1.5">
            <Skeleton className="w-48 h-5 rounded-lg" />
            <Skeleton className="w-32 h-3.5 rounded-lg" />
          </div>
        </div>
        <Skeleton className="w-28 h-10 rounded-2xl" />
      </div>

      {/* Main Question Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="w-28 h-7 rounded-xl" />
            <Skeleton className="w-24 h-7 rounded-xl" />
          </div>
          <div className="space-y-2.5">
            <Skeleton className="w-full h-5 rounded-lg" />
            <Skeleton className="w-4/5 h-5 rounded-lg" />
            <Skeleton className="w-3/5 h-5 rounded-lg" />
          </div>
          <div className="space-y-3 pt-4">
            <Skeleton className="w-full h-14 rounded-2xl" />
            <Skeleton className="w-full h-14 rounded-2xl" />
            <Skeleton className="w-full h-14 rounded-2xl" />
            <Skeleton className="w-full h-14 rounded-2xl" />
          </div>
        </div>

        {/* Palette numbers skeleton */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 space-y-4">
          <Skeleton className="w-36 h-5 rounded-lg" />
          <div className="grid grid-cols-5 gap-2.5">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="w-full aspect-square rounded-xl" />
            ))}
          </div>
          <Skeleton className="w-full h-12 rounded-2xl mt-4" />
        </div>
      </div>
    </div>
  );
}
