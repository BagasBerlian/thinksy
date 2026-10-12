import { Skeleton } from "@/components/ui/skeleton";

export default function HasilLoading() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header bar skeleton */}
      <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-2xl" />
          <div className="space-y-1.5">
            <Skeleton className="w-40 h-5 rounded-lg" />
            <Skeleton className="w-24 h-3.5 rounded-lg" />
          </div>
        </div>
        <Skeleton className="w-28 h-10 rounded-2xl" />
      </div>

      {/* Summary Score Card skeleton */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="w-48 h-6 rounded-xl" />
            <Skeleton className="w-32 h-4 rounded-lg" />
          </div>
          <Skeleton className="w-24 h-14 rounded-2xl" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
      </div>

      {/* Questions list skeleton */}
      <div className="space-y-4">
        <Skeleton className="w-44 h-6 rounded-xl" />
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 space-y-4">
            <Skeleton className="w-32 h-5 rounded-lg" />
            <Skeleton className="w-full h-12 rounded-xl" />
            <Skeleton className="w-full h-16 rounded-xl" />
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 space-y-4">
            <Skeleton className="w-32 h-5 rounded-lg" />
            <Skeleton className="w-full h-12 rounded-xl" />
            <Skeleton className="w-full h-16 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
