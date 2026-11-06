"use client";

import { useState } from "react";
import ReviewStyleQuestionCard, {
  ReviewQuestionItem,
} from "./ReviewStyleQuestionCard";
import {
  Sparkles,
  X,
  BookOpen,
  Layers,
  Award,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  RefreshCw,
} from "lucide-react";

export const MATEMATIKA_SMP_BAB_LIST = [
  { id: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", nomor: 1, judul: "Bab 1: Bilangan Berpangkat & Bentuk Akar" },
  { id: "b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a22", nomor: 2, judul: "Bab 2: Teorema Pythagoras" },
  { id: "b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a33", nomor: 3, judul: "Bab 3: Persamaan & Pertidaksamaan Linear Satu Variabel (PLSV & PtLSV)" },
  { id: "b4eebc99-9c0b-4ef8-bb6d-6bb9bd380a44", nomor: 4, judul: "Bab 4: Relasi & Fungsi" },
  { id: "b5eebc99-9c0b-4ef8-bb6d-6bb9bd380a55", nomor: 5, judul: "Bab 5: Persamaan Garis Lurus (PGL)" },
  { id: "b6eebc99-9c0b-4ef8-bb6d-6bb9bd380a66", nomor: 6, judul: "Bab 6: Statistika" },
  { id: "b7eebc99-9c0b-4ef8-bb6d-6bb9bd380a77", nomor: 7, judul: "Bab 7: Peluang" },
  { id: "b8eebc99-9c0b-4ef8-bb6d-6bb9bd380a88", nomor: 8, judul: "Bab 8: Bangun Ruang Sisi Datar (BRSD)" },
];

interface AiQuestionGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultBabJudul?: string;
  defaultBabId?: string;
  onInsertQuestion: (question: ReviewQuestionItem) => void;
  onInsertMultipleQuestions?: (questions: ReviewQuestionItem[]) => void;
}

export default function AiQuestionGeneratorModal({
  isOpen,
  onClose,
  defaultBabJudul,
  defaultBabId,
  onInsertQuestion,
  onInsertMultipleQuestions,
}: AiQuestionGeneratorModalProps) {
  // Determine initial chapter
  const initialBab = MATEMATIKA_SMP_BAB_LIST.find(
    (b) =>
      b.id === defaultBabId ||
      (defaultBabJudul && b.judul.toLowerCase().includes(defaultBabJudul.toLowerCase()))
  ) || MATEMATIKA_SMP_BAB_LIST[0];

  const [selectedBabId, setSelectedBabId] = useState(initialBab.id);
  const [selectedBabJudul, setSelectedBabJudul] = useState(
    defaultBabJudul || initialBab.judul
  );
  const [isCustomBab, setIsCustomBab] = useState(false);
  const [customBabText, setCustomBabText] = useState("");

  const [tipeSoal, setTipeSoal] = useState<
    "pilihan_ganda" | "isian_singkat" | "esai" | "paket_15"
  >("pilihan_ganda");
  const [tingkatKesulitan, setTingkatKesulitan] = useState<
    "mudah" | "sedang" | "sulit"
  >("sedang");
  const [fokusTopik, setFokusTopik] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Result state
  const [generatedList, setGeneratedList] = useState<ReviewQuestionItem[]>([]);
  const [activeGeneratedIndex, setActiveGeneratedIndex] = useState(0);

  if (!isOpen) return null;

  const activeTopikName = isCustomBab
    ? customBabText.trim() || "Topik Matematika Khusus"
    : selectedBabJudul;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    setGeneratedList([]);

    try {
      const is15 = tipeSoal === "paket_15";
      const fullTopik = fokusTopik.trim()
        ? `${activeTopikName} - Fokus Materi: ${fokusTopik.trim()}`
        : activeTopikName;

      const res = await fetch("/api/guru/generate-soal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topik: fullTopik,
          babId: isCustomBab ? null : selectedBabId,
          mapel: "Matematika",
          tipeSoal,
          tingkatSoal: tingkatKesulitan,
          mode: is15 ? "paket_15" : "soal",
          jumlah: is15 ? 15 : 1,
        }),
      });

      const data = await res.json();

      if (!res.ok && !data.soal && !data.draft) {
        throw new Error(data.error || "Gagal membuat soal dengan AI.");
      }

      if (Array.isArray(data.soal) && data.soal.length > 0) {
        const formatted: ReviewQuestionItem[] = data.soal.map(
          (s: any, idx: number) => ({
            id: s.id || `ai-${Date.now()}-${idx + 1}`,
            pertanyaan: s.pertanyaan || "Pertanyaan matematika...",
            tipeSoal: (s.tipeSoal || "pilihan_ganda") as
              | "pilihan_ganda"
              | "isian_singkat"
              | "esai",
            kunciJawaban: s.kunciJawaban || "",
            pembahasan: s.pembahasan || "",
            poin: 10,
            opsi: (s.opsi || []).map((o: any, oi: number) => ({
              id: `opt-${idx}-${oi}`,
              teks: o.teks || o.teksOpsi || "",
              benar: Boolean(o.benar),
              alasanSalah:
                o.alasanSalah ||
                o.alasan_salah ||
                (o.benar ? "" : "Konsep dasar materi ini perlu diperiksa kembali."),
            })),
          })
        );
        setGeneratedList(formatted);
        setActiveGeneratedIndex(0);
      } else if (data.draft) {
        const d = data.draft;
        const singleQ: ReviewQuestionItem = {
          id: `ai-${Date.now()}-1`,
          pertanyaan: d.pertanyaan || "Pertanyaan matematika...",
          tipeSoal: (d.tipeSoal || tipeSoal) as
            | "pilihan_ganda"
            | "isian_singkat"
            | "esai",
          kunciJawaban: d.kunciJawaban || "",
          pembahasan: d.pembahasan || "",
          poin: 10,
          opsi: (d.opsiSoal || []).map((o: any, oi: number) => ({
            id: `opt-1-${oi}`,
            teks: o.teksOpsi || o.teks || "",
            benar: Boolean(o.benar),
            alasanSalah:
              o.alasanSalah ||
              o.alasan_salah ||
              (o.benar ? "" : "Konsep dasar materi ini perlu diperiksa kembali."),
          })),
        };
        setGeneratedList([singleQ]);
        setActiveGeneratedIndex(0);
      } else {
        throw new Error("Format respons AI tidak dikenali.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat memanggil AI.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInsertActive = () => {
    const q = generatedList[activeGeneratedIndex];
    if (q) {
      onInsertQuestion(q);
      onClose();
    }
  };

  const handleInsertAll = () => {
    if (onInsertMultipleQuestions && generatedList.length > 0) {
      onInsertMultipleQuestions(generatedList);
      onClose();
    } else if (generatedList.length > 0) {
      generatedList.forEach((q) => onInsertQuestion(q));
      onClose();
    }
  };

  const handleUpdateGeneratedItem = (patch: Partial<ReviewQuestionItem>) => {
    setGeneratedList((prev) => {
      const copy = [...prev];
      copy[activeGeneratedIndex] = { ...copy[activeGeneratedIndex], ...patch };
      return copy;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-amber-300 shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white">
                  Kurikulum Merdeka Asisten Guru
                </span>
                <span className="text-[10px] font-bold text-blue-200">
                  Didukung Gemini AI
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white mt-0.5">
                Generator Soal AI Berbasis Bab Materi
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Controls: Bab & Parameters */}
          <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Select Bab Materi */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span>Materi / Bab Kurikulum:</span>
                </label>
                {!isCustomBab ? (
                  <select
                    value={selectedBabId}
                    onChange={(e) => {
                      const id = e.target.value;
                      if (id === "custom") {
                        setIsCustomBab(true);
                      } else {
                        setSelectedBabId(id);
                        const found = MATEMATIKA_SMP_BAB_LIST.find((b) => b.id === id);
                        if (found) setSelectedBabJudul(found.judul);
                      }
                    }}
                    className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  >
                    {MATEMATIKA_SMP_BAB_LIST.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.judul}
                      </option>
                    ))}
                    <option value="custom">✍️ Tulis Bab / Topik Khusus Lainnya...</option>
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customBabText}
                      onChange={(e) => setCustomBabText(e.target.value)}
                      placeholder="Ketik judul bab atau materi matematika..."
                      className="flex-1 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-blue-600"
                    />
                    <button
                      type="button"
                      onClick={() => setIsCustomBab(false)}
                      className="px-2.5 py-1 text-xs font-bold rounded-xl text-slate-600 hover:bg-slate-200"
                    >
                      Batal
                    </button>
                  </div>
                )}
              </div>

              {/* Format / Tipe Soal */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-600" />
                  <span>Format Soal yang Ingin Dibuat:</span>
                </label>
                <select
                  value={tipeSoal}
                  onChange={(e) => setTipeSoal(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                >
                  <option value="pilihan_ganda">1 Butir Pilihan Ganda (A-D + Miskonsepsi)</option>
                  <option value="isian_singkat">1 Butir Isian Singkat (Jawaban Presisi)</option>
                  <option value="esai">1 Butir Esai & Uraian Kontekstual</option>
                  <option value="paket_15">📦 Paket Lengkap 15 Soal Standar (10 PG + 3 Isian + 2 Esai)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tingkat Kesulitan */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>Tingkat Kesulitan:</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["mudah", "sedang", "sulit"] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setTingkatKesulitan(lvl)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold capitalize transition border cursor-pointer ${
                        tingkatKesulitan === lvl
                          ? lvl === "mudah"
                            ? "bg-emerald-500 text-white border-emerald-600 shadow-xs"
                            : lvl === "sedang"
                            ? "bg-blue-600 text-white border-blue-700 shadow-xs"
                            : "bg-purple-600 text-white border-purple-700 shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {lvl === "sulit" ? "HOTS (Sulit)" : lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fokus Topik Spesifik / Catatan Tambahan */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Fokus Sub-Bab / Catatan Guru (Opsional):</span>
                </label>
                <input
                  type="text"
                  value={fokusTopik}
                  onChange={(e) => setFokusTopik(e.target.value)}
                  placeholder="Contoh: Sifat eksponen perkalian & pembagian bertingkat..."
                  className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            {/* Tombol Eksekusi AI */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500 font-medium">
                💡 Formula otomatis diformat dengan KaTeX matematis ($...$).
              </span>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-sm transition active:scale-98 cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>AI Sedang Menyusun Soal...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Buat Soal dengan AI Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Hasil Generate Preview: Review-Style Question Card */}
          {generatedList.length > 0 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-black text-slate-900">
                    Hasil Draft Soal AI ({generatedList.length} Soal Berhasil Dibuat)
                  </h3>
                </div>

                {generatedList.length > 1 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                    {generatedList.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveGeneratedIndex(idx)}
                        className={`w-7 h-7 rounded-lg text-xs font-black transition cursor-pointer ${
                          activeGeneratedIndex === idx
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Render Review-Style Question Card */}
              {generatedList[activeGeneratedIndex] && (
                <div className="rounded-3xl border-2 border-indigo-200 shadow-sm p-1 bg-indigo-50/20">
                  <ReviewStyleQuestionCard
                    question={generatedList[activeGeneratedIndex]}
                    index={activeGeneratedIndex}
                    total={generatedList.length}
                    onUpdate={handleUpdateGeneratedItem}
                    onDelete={() => {
                      const filtered = generatedList.filter(
                        (_, i) => i !== activeGeneratedIndex
                      );
                      setGeneratedList(filtered);
                      if (activeGeneratedIndex >= filtered.length) {
                        setActiveGeneratedIndex(Math.max(0, filtered.length - 1));
                      }
                    }}
                    onAiVariasi={handleGenerate}
                    isGeneratingVariasi={isGenerating}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/70 transition cursor-pointer"
          >
            Tutup
          </button>

          {generatedList.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
                <span>Buat Ulang</span>
              </button>

              {generatedList.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={handleInsertActive}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Masukkan Soal #{activeGeneratedIndex + 1} Saja</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleInsertAll}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Masukkan Semua {generatedList.length} Soal</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleInsertActive}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Masukkan Soal Ini ke Lembar Ujian / Kuis</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
