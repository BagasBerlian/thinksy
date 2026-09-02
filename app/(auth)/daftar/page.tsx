"use client";

import { useActionState, useState, Suspense } from "react";
import { registerAction } from "../actions";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";

function DaftarForm() {
  const [state, formAction, isPending] = useActionState(registerAction, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100/80 w-full max-w-[400px] mt-6 space-y-5">
      {/* Info peran default */}
      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs">
        <GraduationCap className="w-4 h-4 shrink-0 text-blue-500" />
        <span>
          Akun baru akan bergabung sebagai <strong>Siswa</strong>. Untuk peran lain, hubungi administrator.
        </span>
      </div>

      {state?.error && (
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{state.error}</span>
        </div>
      )}

      {state?.success && (
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs">
          <CheckCircle className="w-4 h-4 shrink-0 text-green-500 mt-0.5" />
          <span>{state.message}</span>
        </div>
      )}

      {!state?.success && (
        <form action={formAction} className="space-y-4">
          {/* Peran selalu siswa — tidak perlu input dari user */}
          <input type="hidden" name="peran" value="siswa" />

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Nama Lengkap
            </label>
            <div className="relative flex items-center">
              <User className="w-5 h-5 text-slate-400 absolute left-4" />
              <input
                type="text"
                name="nama_lengkap"
                required
                minLength={3}
                disabled={isPending}
                placeholder="Nama lengkap Anda"
                className="w-full pl-12 pr-4 py-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-200/60 focus:border-slate-300 focus:bg-white rounded-xl text-sm text-slate-800 placeholder-slate-400/80 focus:outline-none transition-all duration-200 disabled:opacity-60"
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Alamat Email
            </label>
            <div className="relative flex items-center">
              <Mail className="w-5 h-5 text-slate-400 absolute left-4" />
              <input
                type="email"
                name="email"
                required
                disabled={isPending}
                placeholder="nama@email.com"
                className="w-full pl-12 pr-4 py-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-200/60 focus:border-slate-300 focus:bg-white rounded-xl text-sm text-slate-800 placeholder-slate-400/80 focus:outline-none transition-all duration-200 disabled:opacity-60"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Kata Sandi
            </label>
            <div className="relative flex items-center">
              <Lock className="w-5 h-5 text-slate-400 absolute left-4" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                minLength={8}
                disabled={isPending}
                placeholder="Minimal 8 karakter"
                className="w-full pl-12 pr-12 py-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-200/60 focus:border-slate-300 focus:bg-white rounded-xl text-sm text-slate-800 placeholder-slate-400/80 focus:outline-none transition-all duration-200 disabled:opacity-60"
              />
              <button
                type="button"
                disabled={isPending}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer flex items-center justify-center disabled:opacity-50"
              >
                {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Sign Up Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full mt-2 py-3.5 bg-[#0B1A2E] hover:bg-[#12253F] text-white font-semibold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(11,26,46,0.1)] hover:shadow-[0_6px_20px_rgba(11,26,46,0.15)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Mendaftarkan...</span>
              </>
            ) : (
              <>
                <span>Buat Akun Siswa</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

export default function DaftarPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-[400px] flex flex-col items-center">
        {/* Branding Logo Container */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-md border border-slate-100 overflow-hidden p-1 mb-3">
          <img src="/logo.png" alt="Thinksy Logo" className="w-full h-full object-contain" />
        </div>

        {/* Brand Name */}
        <h1 className="text-3xl font-bold text-[#0B1A2E] tracking-tight font-sans mb-1 text-center">
          Thinksy
        </h1>

        {/* Subtitle */}
        <p className="text-sm text-slate-500 max-w-[280px] text-center leading-relaxed mb-2">
          Buat akun Thinksy Anda sebagai Siswa
        </p>

        {/* Form component */}
        <Suspense fallback={
          <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 w-full max-w-[400px] mt-6 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#0B1A2E]" />
          </div>
        }>
          <DaftarForm />
        </Suspense>

        {/* Footer */}
        <p className="text-xs text-slate-500 font-medium text-center mt-6">
          Sudah punya akun?
          <Link
            href="/masuk"
            className="text-[#0B1A2E] font-semibold hover:underline ml-1"
          >
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
