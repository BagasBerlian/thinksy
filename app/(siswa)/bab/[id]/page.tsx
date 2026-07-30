import { createClient } from "@/lib/supabase/server";
import MarkdownRenderer from "@/components/materi/MarkdownRenderer";
import TutorChat from "@/components/tutor/TutorChat";
import { ArrowLeft, BrainCircuit, FileText } from "lucide-react";
import Link from "next/link";

export default async function DetailBabPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ materiId?: string }>;
}) {
  const { id } = await params;
  const { materiId } = await searchParams;
  const supabase = await createClient();

  const { data: babData } = await supabase
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
        konten_markdown,
        urutan
      )
    `
    )
    .eq("id", id)
    .single();

  const listMateri =
    babData?.materi?.sort((a: any, b: any) => a.urutan - b.urutan) || [];
  const selectedMateri =
    listMateri.find((m: any) => m.id === materiId) || listMateri[0];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Bar Navigation */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#193446] hover:text-[#132836] bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href={`/latihan/sesi-demo`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#193446] hover:bg-[#132836] px-3.5 py-2 rounded-xl transition shadow-sm"
            >
              <BrainCircuit className="w-3.5 h-3.5 text-[#E9C77B]" />
              <span>Mode Latihan AI</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 space-y-6">
        {/* Header Info */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-2">
          <span className="text-xs font-bold text-[#193446] bg-[#193446]/10 px-3 py-1 rounded-full">
            Bab {babData?.urutan || 1}
          </span>
          <h1 className="text-2xl font-bold text-slate-900">
            {babData?.judul || "Detail Bab"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {babData?.deskripsi || "Silakan baca materi di bawah dan tanyakan hal yang belum dipahami pada Tutor AI."}
          </p>
        </div>

        {/* Main Grid: Sidebar + Content + Tutor AI Widget */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Sidebar list of Materi (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
              Daftar Materi
            </h2>
            <div className="space-y-2">
              {listMateri.map((materiItem: any) => {
                const isActive = selectedMateri?.id === materiItem.id;
                return (
                  <Link
                    key={materiItem.id}
                    href={`/bab/${id}?materiId=${materiItem.id}`}
                    className={`block p-3.5 rounded-xl border transition ${
                      isActive
                        ? "border-[#193446] bg-[#193446] text-white shadow-md"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? "text-[#E9C77B]" : "text-slate-400"
                        }`}
                      />
                      <div>
                        <div className="text-xs font-bold leading-snug">
                          {materiItem.judul}
                        </div>
                        <div
                          className={`text-[10px] ${
                            isActive ? "text-slate-200" : "text-slate-400"
                          }`}
                        >
                          Materi {materiItem.urutan}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Center Column: Reading Material (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            {selectedMateri ? (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <span className="text-xs font-bold text-[#193446] bg-[#E9C77B]/20 border border-[#E9C77B]/40 px-2.5 py-1 rounded-md">
                    Materi #{selectedMateri.urutan}
                  </span>
                  <h2 className="text-xl font-bold text-[#193446] mt-2">
                    {selectedMateri.judul}
                  </h2>
                </div>

                <MarkdownRenderer content={selectedMateri.konten_markdown} />
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-sm">
                Belum ada materi yang dipilih.
              </div>
            )}
          </div>

          {/* Right Column: Socratic AI Tutor Widget (4 cols) */}
          <div className="lg:col-span-4 sticky top-20">
            <TutorChat
              key={selectedMateri?.id}
              materiJudul={selectedMateri?.judul}
              materiKonten={selectedMateri?.konten_markdown}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
