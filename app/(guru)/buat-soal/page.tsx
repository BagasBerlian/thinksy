"use client";

import { useState } from "react";
import MarkdownRenderer from "@/components/materi/MarkdownRenderer";
import {
  Sparkles,
  Bot,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  Save,
  HelpCircle,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import Link from "next/link";

export default function AIQuestionGeneratorPage() {
  const [topik, setTopik] = useState("Pola Bilangan Aritmatika & Barisan");
  const [tingkatSoal, setTingkatSoal] = useState("sedang");
  const [tipeSoal, setTipeSoal] = useState("pilihan_ganda");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [draft, setDraft] = useState<any | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    setDraft(null);

    try {
      const res = await fetch("/api/guru/generate-soal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          babId: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22", // Default Bab 1
          topik,
          tingkatSoal,
          tipeSoal,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menghasilkan soal.");
      }

      setDraft(data.draft);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat pemanggilan AI.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToBank = async () => {
    if (!draft) return;
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/guru/simpan-soal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan soal.");
      }

      setSuccessMsg("Soal berhasil disimpan ke Bank Soal Supabase!");
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan soal.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3.5">
          <Link
            href="/guru"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#193446] hover:text-[#132836] bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dashboard Guru</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-bold text-[#193446] bg-[#E9C77B]/20 border border-[#E9C77B]/40 px-3 py-1.5 rounded-full">
            <Sparkles className="w-4 h-4 text-[#193446]" />
            <span>AI Question Generator</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-6 space-y-6">
        {/* Title Card */}
        <div className="rounded-3xl bg-gradient-to-r from-[#193446] to-[#112431] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#E9C77B]/10 rounded-full blur-3xl pointer-events-none" />
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bot className="w-7 h-7 text-[#E9C77B]" />
            Generator Soal Otomatis (Gemini AI)
          </h1>
          <p className="mt-2 text-slate-200 text-xs sm:text-sm max-w-xl">
            Buat draft soal Pilihan Ganda & Esai lengkap dengan ekspresi rumus KaTeX, kunci jawaban, dan pembahasan mendalam dalam hitungan detik.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Generator Form (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-[#193446] border-b border-slate-100 pb-3">
              Konfigurasi Spesifikasi Soal
            </h2>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Topik Spesifik Pembelajaran
                </label>
                <input
                  type="text"
                  value={topik}
                  onChange={(e) => setTopik(e.target.value)}
                  placeholder="Misal: Suku Ke-n Barisan Aritmatika"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#193446] bg-slate-50/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Tingkat Kesulitan
                  </label>
                  <select
                    value={tingkatSoal}
                    onChange={(e) => setTingkatSoal(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#193446] bg-slate-50/50"
                  >
                    <option value="mudah">Mudah</option>
                    <option value="sedang">Sedang</option>
                    <option value="sulit">Sulit</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Tipe Soal
                  </label>
                  <select
                    value={tipeSoal}
                    onChange={(e) => setTipeSoal(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#193446] bg-slate-50/50"
                  >
                    <option value="pilihan_ganda">Pilihan Ganda</option>
                    <option value="esai">Esai</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#193446] hover:bg-[#132836] text-[#E9C77B] font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#E9C77B]" />
                    <span>AI Sedang Menyusun Soal...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#E9C77B]" />
                    <span>Generate Draft Soal</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Draft Preview & Actions (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {error && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {draft ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#193446] bg-[#193446]/10 px-3 py-1 rounded-full uppercase">
                      {draft.tipeSoal.replace("_", " ")}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 capitalize">
                      Tingkat {draft.tingkatSoal}
                    </span>
                  </div>

                  <button
                    onClick={handleSaveToBank}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>Simpan ke Bank Soal</span>
                  </button>
                </div>

                {/* Pertanyaan */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Pertanyaan:
                  </span>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900">
                    <MarkdownRenderer content={draft.pertanyaan} />
                  </div>
                </div>

                {/* Opsi Pilihan Ganda */}
                {draft.tipeSoal === "pilihan_ganda" && draft.opsiSoal?.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Opsi Jawaban:
                    </span>
                    <div className="space-y-2">
                      {draft.opsiSoal.map((o: any, idx: number) => {
                        const letter = String.fromCharCode(65 + idx);
                        return (
                          <div
                            key={idx}
                            className={`p-3 rounded-xl border flex items-center justify-between text-xs sm:text-sm ${
                              o.benar
                                ? "border-emerald-500 bg-emerald-50/60 font-bold text-emerald-900"
                                : "border-slate-200 bg-white text-slate-700"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                                  o.benar
                                    ? "bg-emerald-600 text-white"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {letter}
                              </span>
                              <MarkdownRenderer content={o.teksOpsi} />
                            </div>
                            {o.benar && (
                              <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Kunci
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Pembahasan & Rubrik */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Kunci Jawaban / Rubrik:
                    </span>
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
                      {draft.kunciJawaban}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Pembahasan Solusi:
                    </span>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800">
                      <MarkdownRenderer content={draft.pembahasan} />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center bg-white space-y-3">
                <HelpCircle className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-600">
                  Belum Ada Draft Soal
                </p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Isi spesifikasi di sebelah kiri dan klik tombol "Generate Draft Soal" untuk meminta Gemini AI menyusun soal baru.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
