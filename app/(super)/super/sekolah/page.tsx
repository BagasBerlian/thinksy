import { ArrowLeft, Building, Plus, FolderOpen } from "lucide-react";
import Link from "next/link";

export default function SuperSekolahPage() {
  return (
    <div className="min-h-screen bg-[#0B0F17] text-white font-sans p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <Link
          href="/super"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl transition shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dashboard Super Admin</span>
        </Link>
        <button className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer">
          <Plus className="w-4 h-4" />
          <span>Registrasi Tenant Sekolah</span>
        </button>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Building className="w-6 h-6 text-amber-400" />
          <span>Manajemen Tenant / Sekolah</span>
        </h1>
        <p className="text-xs text-slate-400 font-semibold">
          Daftar seluruh institusi sekolah yang terdaftar dalam platform THINKSY.
        </p>
      </div>

      <div className="bg-slate-900/60 rounded-3xl border border-slate-800 p-12 text-center space-y-4 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 text-slate-500 flex items-center justify-center mx-auto">
          <FolderOpen className="w-6 h-6" />
        </div>
        <div className="space-y-1 max-w-sm mx-auto">
          <h3 className="text-sm font-extrabold text-white">
            Belum Ada Tenant Sekolah
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            Silakan klik tombol "Registrasi Tenant Sekolah" untuk menambahkan lisensi sekolah pertama.
          </p>
        </div>
      </div>
    </div>
  );
}
