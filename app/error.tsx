"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Boundary caught an error:", error);
  }, [error]);

  const isClaudeTimeout =
    error?.message?.toLowerCase().includes("timeout") ||
    error?.message?.toLowerCase().includes("anthropic") ||
    error?.message?.toLowerCase().includes("claude");

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 font-sans text-slate-900">
      <div className="max-w-lg w-full bg-white rounded-3xl p-8 sm:p-10 space-y-6 text-center shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
          <AlertTriangle className="w-8 h-8 text-amber-600" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 font-heading">
            {isClaudeTimeout ? "Layanan AI Sedang Sibuk" : "Koneksi Terputus Sejenak"}
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed font-normal">
            {isClaudeTimeout
              ? "Model AI Claude membutuhkan waktu respons lebih lama dari biasanya. Seluruh progres belajar dan jawaban kuis Anda telah tersimpan dengan aman."
              : "Halaman mengalami kendala sesaat saat memproses data. Jawaban dan sesi belajar Anda tetap aman di sistem."}
          </p>
        </div>

        {error?.message && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs font-mono text-slate-600 text-left overflow-x-auto max-h-32">
            {error.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs sm:text-sm font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Muat Ulang Halaman</span>
          </button>

          <Link
            href="/dashboard"
            className="flex-1 py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
