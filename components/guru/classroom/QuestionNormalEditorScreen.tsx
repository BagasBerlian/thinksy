"use client";

import { useState, useRef, useMemo } from "react";
import {
  ArrowLeft,
  Award,
  Check,
  Eye,
  HelpCircle,
  Sparkles,
  FileText,
  Monitor,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import MarkdownRenderer from "@/components/materi/MarkdownRenderer";
import type { BabQuizQuestion } from "./EditBabNormalScreen";

interface QuestionNormalEditorScreenProps {
  question: BabQuizQuestion;
  questionNumber: number;
  babNomor: number;
  babJudul: string;
  subjectName?: string;
  classNameTitle?: string;
  onSave: (updated: BabQuizQuestion) => void;
  onBack: () => void;
}

export default function QuestionNormalEditorScreen({
  question,
  questionNumber,
  babNomor,
  babJudul,
  subjectName = "Matematika",
  classNameTitle = "Matematika (Kelas 8)",
  onSave,
  onBack,
}: QuestionNormalEditorScreenProps) {
  const [tipe, setTipe] = useState<"pilihan_ganda" | "esai">(question.tipe);
  const [bobot, setBobot] = useState<number>(question.bobot || 20);
  const [pertanyaan, setPertanyaan] = useState<string>(question.pertanyaan || "");
  const [opsi, setOpsi] = useState<string[]>(
    question.opsi && question.opsi.length >= 4
      ? question.opsi
      : ["A. ", "B. ", "C. ", "D. "]
  );
  const [kunciJawaban, setKunciJawaban] = useState<string>(
    question.kunciJawaban || "A"
  );
  const [pembahasan, setPembahasan] = useState<string>(question.pembahasan || "");

  // Interactive preview state
  const [previewSelectedAnswer, setPreviewSelectedAnswer] = useState<string | null>(null);
  const [showPembahasanInPreview, setShowPembahasanInPreview] = useState(false);
  const [activeMobileView, setActiveMobileView] = useState<"editor" | "preview">("editor");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertSnippet = (before: string, after: string = "", placeholder: string = "") => {
    const el = textareaRef.current;
    if (!el) {
      setPertanyaan((prev) => prev + before + placeholder + after);
      return;
    }

    el.focus();
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const selected = el.value.substring(start, end) || placeholder;
    const replacement = before + selected + after;

    const newValue =
      el.value.substring(0, start) + replacement + el.value.substring(end);
    setPertanyaan(newValue);

    el.value = newValue;
    const newPos = start + before.length + selected.length;
    el.setSelectionRange(newPos, newPos);
    el.dispatchEvent(new Event("input", { bubbles: true }));

    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(newPos, newPos);
    });
  };

  const handleSave = () => {
    if (!pertanyaan.trim()) {
      alert("Pertanyaan soal wajib diisi!");
      return;
    }

    const updated: BabQuizQuestion = {
      ...question,
      tipe,
      bobot: Math.max(5, bobot || 20),
      pertanyaan: pertanyaan.trim(),
      opsi: tipe === "pilihan_ganda" ? opsi : undefined,
      kunciJawaban: kunciJawaban.trim(),
      pembahasan: pembahasan.trim() || undefined,
    };

    onSave(updated);
  };

  return (
    <div className="w-full min-h-screen bg-slate-50/70 text-slate-900 pb-24 font-sans animate-in fade-in duration-150">
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TOP STICKY BAR                                                        */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onBack}
              className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer shrink-0"
              title="Kembali ke Edit Bab"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 truncate">
                <span>{classNameTitle}</span>
                <span>•</span>
                <span>
                  Bab {babNomor}: {babJudul}
                </span>
                <span>•</span>
                <span className="text-amber-700 font-bold">Editor Soal Kuis</span>
              </div>
              <div className="flex items-center gap-2.5 mt-0.5 flex-wrap">
                <h1 className="text-base sm:text-lg font-black text-slate-900 truncate">
                  Butir Soal #{questionNumber}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
                  {tipe === "pilihan_ganda" ? "Pilihan Ganda" : "Esai"}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  Bobot {bobot} Poin
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
            {/* View switcher on Mobile */}
            <div className="flex lg:hidden bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-bold mr-1">
              <button
                type="button"
                onClick={() => setActiveMobileView("editor")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeMobileView === "editor"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Editor
              </button>
              <button
                type="button"
                onClick={() => setActiveMobileView("preview")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeMobileView === "preview"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Pratinjau
              </button>
            </div>

            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Butir Soal</span>
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* MAIN CONTAINER: 2-COLUMN SPLIT SCREEN                                 */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: FORM EDIT SOAL (7 COLS) */}
          <div
            className={`lg:col-span-7 space-y-5 ${
              activeMobileView === "preview" ? "hidden lg:block" : "block"
            }`}
          >
            {/* Card 1: Pengaturan Tipe & Bobot */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center justify-center font-bold">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Konfigurasi Soal
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Pilih tipe butir soal dan bobot persentase nilai.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                    Tipe Soal
                  </label>
                  <select
                    value={tipe}
                    onChange={(e) => {
                      const nextType = e.target.value as "pilihan_ganda" | "esai";
                      setTipe(nextType);
                      if (nextType === "pilihan_ganda" && (!opsi || opsi.length < 4)) {
                        setOpsi(["A. ", "B. ", "C. ", "D. "]);
                      }
                    }}
                    className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-600"
                  >
                    <option value="pilihan_ganda">Pilihan Ganda (A, B, C, D)</option>
                    <option value="esai">Esai / Jawaban Uraian</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Bobot Nilai
                    </label>
                    <span className="text-[10px] font-bold text-amber-700">
                      {bobot} Poin
                    </span>
                  </div>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={bobot}
                    onChange={(e) =>
                      setBobot(parseInt(e.target.value, 10) || 20)
                    }
                    className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Pertanyaan Soal */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-700" />
                  <span>Isi Pertanyaan Soal</span>
                </h3>
                <span className="text-[11px] text-slate-400">
                  Mendukung rumus LaTeX ($...$)
                </span>
              </div>

              {/* Math toolbar */}
              <div className="p-2 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold text-slate-500 mr-1">
                  Sisipkan Rumus:
                </span>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => insertSnippet("$", "$", "2^4 \\times 2^3")}
                  className="px-2 py-1 rounded-lg bg-amber-100/70 hover:bg-amber-200 active:scale-95 text-amber-800 font-mono font-bold text-xs transition cursor-pointer select-none"
                >
                  $x^n$
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => insertSnippet("$\\sqrt{", "}$", "72")}
                  className="px-2 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 active:scale-95 text-slate-800 font-mono font-bold text-xs transition cursor-pointer select-none"
                >
                  √x
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => insertSnippet("$\\frac{", "}{b}$", "a")}
                  className="px-2 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 active:scale-95 text-slate-800 font-mono font-bold text-xs transition cursor-pointer select-none"
                >
                  a/b
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => insertSnippet(" \\times ", "")}
                  className="px-2 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 active:scale-95 text-slate-800 font-mono font-bold text-xs transition cursor-pointer select-none"
                >
                  ×
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => insertSnippet("$$\n", "\n$$", "formula")}
                  className="px-2 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 active:scale-95 text-slate-800 font-mono font-bold text-xs transition cursor-pointer select-none"
                >
                  $$..$$
                </button>
              </div>

              <textarea
                ref={textareaRef}
                rows={5}
                required
                value={pertanyaan}
                onChange={(e) => setPertanyaan(e.target.value)}
                placeholder="Tuliskan pertanyaan soal kuis di sini. Contoh: Berapakah hasil dari $2^4 \times 2^3$?"
                className="w-full text-xs sm:text-sm font-sans p-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100 transition leading-relaxed resize-y"
              />
            </div>

            {/* Card 3: Pilihan Jawaban atau Kunci Esai */}
            {tipe === "pilihan_ganda" ? (
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900">
                    Pilihan Jawaban (A, B, C, D) & Kunci Benar
                  </h3>
                  <span className="text-[11px] text-emerald-700 font-bold">
                    Pilih Radio Kunci yang Benar
                  </span>
                </div>

                <div className="space-y-3">
                  {["A", "B", "C", "D"].map((letter, idx) => {
                    const currentOpsi = opsi[idx] || "";
                    const isKey = kunciJawaban.toUpperCase() === letter;

                    return (
                      <div
                        key={letter}
                        className={`p-3 rounded-2xl border transition flex items-center gap-3 ${
                          isKey
                            ? "bg-emerald-50/60 border-emerald-300"
                            : "bg-slate-50/50 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <label className="flex items-center gap-2 cursor-pointer shrink-0">
                          <input
                            type="radio"
                            name="kunciJawabanGroup"
                            checked={isKey}
                            onChange={() => setKunciJawaban(letter)}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <span
                            className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center ${
                              isKey
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "bg-white text-slate-700 border border-slate-200"
                            }`}
                          >
                            {letter}
                          </span>
                        </label>

                        <input
                          type="text"
                          value={currentOpsi}
                          onChange={(e) => {
                            const newOps = [...opsi];
                            newOps[idx] = e.target.value;
                            setOpsi(newOps);
                          }}
                          placeholder={`Pilihan teks / rumus jawaban ${letter}...`}
                          className="flex-1 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
                <div className="pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900">
                    Kunci Jawaban / Pedoman Penilaian Esai
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Tuliskan kata kunci atau rumus final jawaban yang diharapkan dari siswa.
                  </p>
                </div>

                <textarea
                  rows={3}
                  value={kunciJawaban}
                  onChange={(e) => setKunciJawaban(e.target.value)}
                  placeholder="Pedoman jawaban esai atau rumus akhir..."
                  className="w-full text-xs font-medium p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-600"
                />
              </div>
            )}

            {/* Card 4: Pembahasan / Solusi Soal */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">
                  Pembahasan & Langkah Penyelesaian (Opsional)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Akan ditampilkan kepada siswa setelah mereka menyelesaikan sesi kuis untuk bahan evaluasi mandiri.
                </p>
              </div>

              <textarea
                rows={4}
                value={pembahasan}
                onChange={(e) => setPembahasan(e.target.value)}
                placeholder="Contoh: Berdasarkan sifat eksponen $a^m \times a^n = a^{m+n}$..."
                className="w-full text-xs font-medium p-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-amber-600 leading-relaxed resize-y"
              />
            </div>
          </div>

          {/* RIGHT COLUMN: LIVE REALTIME STUDENT QUIZ PREVIEW (5 COLS) */}
          <div
            className={`lg:col-span-5 space-y-4 lg:sticky lg:top-24 ${
              activeMobileView === "editor" ? "hidden lg:block" : "block"
            }`}
          >
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
              <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-xs font-bold tracking-wide">
                    Pratinjau Kuis Siswa (Live)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-300 font-medium">
                  <Monitor className="w-3.5 h-3.5 text-slate-400" />
                  <span>Sesi Kuis Siswa</span>
                </div>
              </div>

              <div className="p-5 sm:p-6 max-h-[calc(100vh-180px)] overflow-y-auto space-y-5 bg-white">
                {/* Meta Soal */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-[11px]">
                  <span className="font-extrabold text-slate-900">
                    Pertanyaan {questionNumber}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    +{bobot} Poin
                  </span>
                </div>

                {/* Render Pertanyaan */}
                <div className="space-y-2">
                  {pertanyaan.trim() ? (
                    <MarkdownRenderer
                      content={pertanyaan}
                      className="text-sm font-semibold text-slate-900 leading-relaxed"
                    />
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      Pertanyaan soal akan muncul di sini...
                    </p>
                  )}
                </div>

                {/* Render Pilihan Opsi */}
                {tipe === "pilihan_ganda" && (
                  <div className="space-y-2.5 pt-2">
                    {["A", "B", "C", "D"].map((letter, idx) => {
                      const optText = opsi[idx] || "";
                      const isSimulated = previewSelectedAnswer === letter;
                      const isKey = kunciJawaban.toUpperCase() === letter;

                      return (
                        <div
                          key={letter}
                          onClick={() => setPreviewSelectedAnswer(letter)}
                          className={`p-3 rounded-2xl border text-xs font-medium cursor-pointer transition flex items-center justify-between ${
                            isSimulated
                              ? "bg-blue-50 border-blue-400 shadow-2xs"
                              : "bg-slate-50/70 hover:bg-slate-100/70 border-slate-200"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
                            <span
                              className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                                isSimulated
                                  ? "bg-blue-600 text-white"
                                  : "bg-white text-slate-700 border border-slate-200"
                              }`}
                            >
                              {letter}
                            </span>
                            <div className="min-w-0 flex-1">
                              {optText ? (
                                <MarkdownRenderer
                                  content={optText}
                                  className="text-xs"
                                  isCompact
                                />
                              ) : (
                                <span className="text-slate-400 italic">
                                  Opsi {letter} kosong
                                </span>
                              )}
                            </div>
                          </div>

                          {isKey && (
                            <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                              Kunci Jawaban
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Render Pembahasan Accordion */}
                {pembahasan.trim() && (
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() =>
                        setShowPembahasanInPreview(!showPembahasanInPreview)
                      }
                      className="w-full flex items-center justify-between text-xs font-bold text-slate-700 hover:text-blue-700 py-1 cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Pratinjau Pembahasan Soal</span>
                      </span>
                      {showPembahasanInPreview ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </button>

                    {showPembahasanInPreview && (
                      <div className="mt-2 p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1">
                        <MarkdownRenderer
                          content={pembahasan}
                          className="text-xs leading-relaxed"
                          isCompact
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
