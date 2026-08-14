"use client";

import { useState } from "react";
import { X, Sparkles, Save, HelpCircle, CheckCircle2 } from "lucide-react";
import MarkdownRenderer from "@/components/materi/MarkdownRenderer";

interface EditorSoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (newQuestion: any) => void;
}

export default function EditorSoalModal({ isOpen, onClose, onSave }: EditorSoalModalProps) {
  const [bab, setBab] = useState("Bab 4: Persamaan Linear Dua Variabel");
  const [kesulitan, setKesulitan] = useState("mudah");
  const [tipeSoal, setTipeSoal] = useState<"pilihan_ganda" | "isian" | "esai">("pilihan_ganda");
  const [pertanyaan, setPertanyaan] = useState("Tuliskan pertanyaan di sini... Gunakan $ untuk inline math atau $$ untuk block math.");
  const [opsiA, setOpsiA] = useState("Opsi A...");
  const [opsiB, setOpsiB] = useState("Opsi B...");
  const [opsiC, setOpsiC] = useState("Opsi C...");
  const [opsiD, setOpsiD] = useState("Opsi D...");
  const [jawabanBenar, setJawabanBenar] = useState<"A" | "B" | "C" | "D">("A");
  const [pembahasan, setPembahasan] = useState("Tuliskan pembahasan langkah-demi-langkah di sini...");
  const [isPreview, setIsPreview] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newQuestion = {
      id: `#Q-${Math.floor(1000 + Math.random() * 9000)}`,
      bab,
      kesulitan,
      tipeSoal,
      pertanyaan,
      opsi: [opsiA, opsiB, opsiC, opsiD],
      jawabanBenar,
      pembahasan,
    };
    if (onSave) onSave(newQuestion);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-300">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-base font-extrabold text-[#0F172A]">Editor Soal Baru</h2>
            <p className="text-xs text-slate-500 font-medium">
              Tambahkan pertanyaan manual ke Bank Soal Latihan.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Bab & Kesulitan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Bab & Materi *
              </label>
              <select
                value={bab}
                onChange={(e) => setBab(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F172A] bg-slate-50"
              >
                <option value="Bab 4: Persamaan Linear Dua Variabel">Bab 4: Persamaan Linear Dua Variabel</option>
                <option value="Bab 3: Relasi dan Fungsi">Bab 3: Relasi dan Fungsi</option>
                <option value="Bab 2: Persamaan Kuadrat">Bab 2: Persamaan Kuadrat</option>
                <option value="Bab 1: Pola Bilangan">Bab 1: Pola Bilangan</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Tingkat Kesulitan *
              </label>
              <select
                value={kesulitan}
                onChange={(e) => setKesulitan(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F172A] bg-slate-50"
              >
                <option value="mudah">Mudah</option>
                <option value="sedang">Sedang</option>
                <option value="sulit">Sulit</option>
              </select>
            </div>
          </div>

          {/* Tipe Soal Tabs */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              Tipe Soal *
            </label>
            <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl">
              {(["pilihan_ganda", "isian", "esai"] as const).map((tipe) => (
                <button
                  key={tipe}
                  type="button"
                  onClick={() => setTipeSoal(tipe)}
                  className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer capitalize ${
                    tipeSoal === tipe
                      ? "bg-[#0F172A] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tipe.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Input Pertanyaan */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Pertanyaan *
              </label>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                Mendukung Markdown & $LaTeX$
              </span>
            </div>
            <textarea
              rows={4}
              value={pertanyaan}
              onChange={(e) => setPertanyaan(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F172A] bg-slate-50 font-mono"
            />
          </div>

          {/* Options for Pilihan Ganda */}
          {tipeSoal === "pilihan_ganda" && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Opsi Jawaban
                </label>
                <span className="text-[10px] text-slate-500 font-semibold">
                  Pilih radio button untuk jawaban benar
                </span>
              </div>

              {[
                { label: "A", val: opsiA, set: setOpsiA },
                { label: "B", val: opsiB, set: setOpsiB },
                { label: "C", val: opsiC, set: setOpsiC },
                { label: "D", val: opsiD, set: setOpsiD },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="jawabanBenar"
                    checked={jawabanBenar === item.label}
                    onChange={() => setJawabanBenar(item.label as any)}
                    className="w-4 h-4 text-[#0F172A] focus:ring-[#0F172A] cursor-pointer"
                  />
                  <span className="w-6 text-xs font-extrabold text-slate-500">
                    {item.label}
                  </span>
                  <input
                    type="text"
                    value={item.val}
                    onChange={(e) => item.set(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F172A] bg-slate-50"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Pembahasan */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              Pembahasan Langkah-demi-Langkah
            </label>
            <textarea
              rows={3}
              value={pembahasan}
              onChange={(e) => setPembahasan(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F172A] bg-slate-50 font-mono"
            />
          </div>

          {/* Live Preview Toggle */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsPreview(!isPreview)}
              className="text-xs font-extrabold text-[#0F172A] hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{isPreview ? "Sembunyikan Live Preview" : "Tampilkan Live Preview Rumus"}</span>
            </button>

            {isPreview && (
              <div className="mt-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="font-extrabold text-slate-600 uppercase text-[10px]">Preview Formula KaTeX:</div>
                <MarkdownRenderer content={pertanyaan} />
              </div>
            )}
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-extrabold text-xs hover:bg-slate-100 transition cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white font-extrabold text-xs shadow-xs transition flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>Simpan Soal</span>
          </button>
        </div>
      </div>
    </div>
  );
}
