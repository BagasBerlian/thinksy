import { createClient } from "@/lib/supabase/server";
import { logoutAction } from "../../(auth)/actions";
import {
  GraduationCap,
  BookOpen,
  FileText,
  Sparkles,
  Award,
  Clock,
  LogOut,
  ChevronRight,
  BrainCircuit,
  CheckCircle2,
} from "lucide-react";

export default async function SiswaDashboardPage() {
  const supabase = await createClient();

  const { data: listBab, error } = await supabase
    .from("bab")
    .select(
      `
      id,
      judul,
      deskripsi,
      urutan,
      materi (
        id,
        judul,
        urutan
      )
    `
    )
    .order("urutan", { ascending: true });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Header Navigation */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3.5">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-[#193446] flex items-center justify-center font-bold text-[#E9C77B] shadow-md border border-[#E9C77B]/20">
              <BrainCircuit className="w-5 h-5 text-[#E9C77B]" />
            </div>
            <div>
              <span className="font-extrabold text-[#193446] block text-lg leading-none tracking-tight">
                think<span className="text-[#E9C77B] bg-gradient-to-r from-amber-500 to-[#E9C77B] bg-clip-text text-transparent">sy</span>
              </span>
              <span className="text-[10px] text-slate-500 font-bold block mt-0.5 uppercase tracking-wider">
                Matematika Kelas 8
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-semibold border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Siswa Aktif</span>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-xl transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-6 space-y-6">
        {/* Welcome Hero Card */}
        <div className="relative rounded-3xl bg-gradient-to-r from-[#193446] via-[#162d3d] to-[#0f1d27] p-6 sm:p-8 text-white shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#E9C77B]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E9C77B]/20 border border-[#E9C77B]/30 text-[#E9C77B] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pendamping Belajar Berbasis AI</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Selamat Datang di Portal Pembelajaran! 👋
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
              Pelajari materi matematika interaktif, berlatihlah dengan bimbingan Tutor AI Sokratik, dan ukur pemahamanmu secara mandiri.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/10">
            <div className="bg-white/10 rounded-2xl p-3.5 backdrop-blur-sm">
              <div className="text-xs text-slate-300">Total Bab</div>
              <div className="text-xl font-bold text-[#E9C77B] mt-0.5">
                {listBab?.length || 0} Bab
              </div>
            </div>
            <div className="bg-white/10 rounded-2xl p-3.5 backdrop-blur-sm">
              <div className="text-xs text-slate-300">Total Materi</div>
              <div className="text-xl font-bold text-white mt-0.5">
                {listBab?.reduce((acc, b) => acc + (b.materi?.length || 0), 0) || 0} Teks
              </div>
            </div>
            <div className="bg-white/10 rounded-2xl p-3.5 backdrop-blur-sm">
              <div className="text-xs text-slate-300">Limit AI Harian</div>
              <div className="text-xl font-bold text-emerald-400 mt-0.5">
                20 Pesan
              </div>
            </div>
            <div className="bg-white/10 rounded-2xl p-3.5 backdrop-blur-sm">
              <div className="text-xs text-slate-300">Status Sesi</div>
              <div className="text-xl font-bold text-white mt-0.5">
                Siap Belajar
              </div>
            </div>
          </div>
        </div>

        {/* Learning Modules & Chapters */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#193446] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#E9C77B]" />
              Daftar Bab & Materi Pembelajaran
            </h2>
            <span className="text-xs font-semibold text-slate-500">
              Matematika Kelas 8
            </span>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">
              Gagal memuat data dari Supabase: {error.message}
            </div>
          )}

          {!listBab || listBab.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center bg-white space-y-3">
              <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-600">
                Belum ada data Bab yang dimasukkan di database.
              </p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Silakan jalankan script <code className="bg-slate-100 px-2 py-1 rounded text-primary">seed.sql</code> di SQL Editor Supabase untuk menginput data dummy awal.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {listBab.map((babItem) => (
                <div
                  key={babItem.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition space-y-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="space-y-1">
                      <div className="inline-block text-xs font-bold text-[#193446] bg-[#193446]/10 px-3 py-1 rounded-full">
                        Bab {babItem.urutan}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {babItem.judul}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500">
                        {babItem.deskripsi}
                      </p>
                    </div>

                    {/* Mode Buttons */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <a
                        href={`/latihan/sesi-demo`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#193446] hover:bg-[#132836] px-3.5 py-2.5 rounded-xl transition shadow-sm"
                      >
                        <BrainCircuit className="w-4 h-4 text-[#E9C77B]" />
                        <span>Mode Latihan AI</span>
                      </a>
                      <a
                        href={`/quiz/sesi-demo`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2.5 rounded-xl transition"
                      >
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>Kuis Berwaktu</span>
                      </a>
                    </div>
                  </div>

                  {/* List of Materi */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Materi Bacaan Dalam Bab Ini:
                    </div>

                    {babItem.materi && babItem.materi.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {babItem.materi
                          .sort((a, b) => a.urutan - b.urutan)
                          .map((materiItem) => (
                            <a
                              key={materiItem.id}
                              href={`/bab/${babItem.id}?materiId=${materiItem.id}`}
                              className="group flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-white hover:border-[#193446]/30 hover:shadow-sm transition"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-[#193446] group-hover:bg-[#193446] group-hover:text-white transition">
                                  {materiItem.urutan}
                                </div>
                                <div>
                                  <span className="text-xs font-bold text-slate-800 group-hover:text-[#193446] block transition">
                                    {materiItem.judul}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    Teks + Rumus KaTeX
                                  </span>
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#193446] transition" />
                            </a>
                          ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">
                        Belum ada materi teks untuk bab ini.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
