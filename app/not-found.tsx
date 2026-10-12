import Link from "next/link";
import { FileQuestion, ArrowLeft, Home } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5 text-center shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-700">
          <FileQuestion className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-lg font-bold tracking-tight text-slate-900">
            Halaman Tidak Ditemukan (404)
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Rute atau materi yang Anda tuju belum terdaftar atau telah dipindahkan.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <Link
            href="/"
            className="flex-1 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Ke Beranda</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
