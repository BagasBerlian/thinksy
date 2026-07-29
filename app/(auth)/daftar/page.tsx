"use client";

import { useActionState } from "react";
import { registerAction } from "../actions";
import {
  UserPlus,
  GraduationCap,
  Lock,
  Mail,
  AlertCircle,
  Loader2,
  CheckCircle,
  User,
} from "lucide-react";
import Link from "next/link";

export default function DaftarPage() {
  const [state, formAction, isPending] = useActionState(registerAction, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#193446] via-[#162e3e] to-[#0f1e29] p-4 sm:p-6 lg:p-8">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#E9C77B]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#193446]/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md space-y-6">
        {/* Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#E9C77B]/20 border border-[#E9C77B]/30 shadow-inner">
            <GraduationCap className="w-8 h-8 text-[#E9C77B]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Aplikasi Pembelajaran AI
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Platform Pembelajaran Mandiri Matematika Kelas 8 (Multi-Tenant)
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/20 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-[#193446] flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#E9C77B]" />
              Buat Akun Baru
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Daftarkan akun siswa Anda untuk mulai belajar.
            </p>
          </div>

          {/* Error State */}
          {state?.error && (
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{state.error}</span>
            </div>
          )}

          {/* Success State */}
          {state?.success && (
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs sm:text-sm">
              <CheckCircle className="w-4 h-4 shrink-0 text-green-500 mt-0.5" />
              <span>{state.message}</span>
            </div>
          )}

          {!state?.success && (
            <form action={formAction} className="space-y-4">
              {/* Nama Lengkap */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="nama_lengkap"
                    required
                    minLength={3}
                    placeholder="Nama lengkap Anda"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#193446] focus:border-transparent transition bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="nama@sekolah.sch.id"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#193446] focus:border-transparent transition bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={8}
                    placeholder="Minimal 8 karakter"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#193446] focus:border-transparent transition bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Konfirmasi Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Konfirmasi Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    name="konfirmasi_password"
                    required
                    minLength={8}
                    placeholder="Ulangi kata sandi"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#193446] focus:border-transparent transition bg-slate-50/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#193446] hover:bg-[#132836] text-[#E9C77B] font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#E9C77B]" />
                    <span>Mendaftarkan...</span>
                  </>
                ) : (
                  <span>Daftar Sekarang</span>
                )}
              </button>
            </form>
          )}

          {/* Link ke Login */}
          <div className="text-center pt-2 text-xs text-slate-500">
            Sudah punya akun?{" "}
            <Link
              href="/masuk"
              className="font-semibold text-[#193446] hover:text-[#E9C77B] transition-colors"
            >
              Masuk di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
