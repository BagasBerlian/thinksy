import { Skeleton } from "@/components/ui/skeleton";

export default function GuruBiayaLoading() {
  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header skeleton */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="w-56 h-7 rounded-xl" />
          <Skeleton className="w-80 h-4 rounded-lg" />
        </div>
        <Skeleton className="w-36 h-10 rounded-2xl" />
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 space-y-3">
            <Skeleton className="w-24 h-4 rounded-md" />
            <Skeleton className="w-36 h-8 rounded-xl" />
            <Skeleton className="w-28 h-3.5 rounded-md" />
          </div>
        ))}
      </div>

      {/* Breakdown Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 space-y-4">
          <Skeleton className="w-48 h-6 rounded-xl" />
          <Skeleton className="w-full h-40 rounded-2xl" />
        </div>
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 space-y-4">
          <Skeleton className="w-40 h-6 rounded-xl" />
          <Skeleton className="w-full h-40 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
