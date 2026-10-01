"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import GuruLayout from "@/components/guru/GuruLayout";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Sparkles,
  Save,
  Loader2,
  Clock,
  Award,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Key,
  Layers,
  FileText,
} from "lucide-react";

function GuruBuatUjianContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const paramTipe = searchParams.get("tipe");
  const initialTipe: "ulangan" | "ujian" = paramTipe === "ujian" ? "ujian" : "ulangan";
  const initialMapel = searchParams.get("mapel") || "Matematika";

  const [tipe, setTipe] = useState<"ulangan" | "ujian">(initialTipe);
  const [mapel, setMapel] = useState(initialMapel);
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [durasiMenit, setDurasiMenit] = useState(initialTipe === "ulangan" ? 60 : 90);
  const [passingGrade, setPassingGrade] = useState(75);
  const [token, setToken] = useState(() => {
    const prefix = initialMapel.substring(0, 3).toUpperCase();
    const tag = initialTipe === "ulangan" ? "ULG" : "PTS";
    return `${prefix}-${tag}26`;
  });
  const [babList, setBabList] = useState<Array<{ id: string; judul: string }>>([]);
  const [selectedBabId, setSelectedBabId] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Daftar Soal yang dimasukkan ke ujian ini
  const [soalList, setSoalList] = useState<
    Array<{
      id: string;
      pertanyaan: string;
      opsi: Array<{ teks: string; benar: boolean }>;
    }>
  >([
    {
      id: "demo-1",
      pertanyaan: "Berapakah suku ke-10 dari barisan aritmetika 3, 7, 11, 15, ...?",
      opsi: [
        { teks: "35", benar: false },
        { teks: "39", benar: true },
        { teks: "43", benar: false },
        { teks: "47", benar: false },
      ],
    },
    {
      id: "demo-2",
      pertanyaan: "Berdasarkan Teorema Pythagoras, jika segitiga siku-siku memiliki sisi $a=6$ dan $b=8$, berapakah panjang sisi miring $c$?",
      opsi: [
        { teks: "9", benar: false },
        { teks: "10", benar: true },
        { teks: "12", benar: false },
        { teks: "14", benar: false },
      ],
    },
  ]);

  // Load daftar bab
  useEffect(() => {
    async function loadBab() {
      try {
        const res = await fetch("/api/siswa/chat/riwayat"); // or custom endpoint
        // fallback sample chapters
        setBabList([
          { id: "b1", judul: "Bab 1: Pola Bilangan & Barisan Bilangan" },
          { id: "b2", judul: "Bab 2: Koordinat Kartesius" },
          { id: "b3", judul: "Bab 3: Relasi dan Fungsi" },
          { id: "b4", judul: "Bab 4: Persamaan Garis Lurus" },
          { id: "b5", judul: "Bab 5: Sistem Persamaan Linear Dua Variabel (SPLDV)" },
          { id: "b6", judul: "Bab 6: Teorema Pythagoras" },
          { id: "b7", judul: "Bab 7: Lingkaran" },
          { id: "b8", judul: "Bab 8: Bangun Ruang Sisi Datar" },
          { id: "b9", judul: "Bab 9: Statistika" },
          { id: "b10", judul: "Bab 10: Peluang" },
        ]);
      } catch {}
    }
    loadBab();
  }, []);

  // Add Question Manually
  const handleAddQuestion = () => {
    const newId = `soal-${Date.now()}`;
    setSoalList((prev) => [
      ...prev,
      {
        id: newId,
        pertanyaan: "",
        opsi: [
          { teks: "", benar: true },
          { teks: "", benar: false },
          { teks: "", benar: false },
          { teks: "", benar: false },
        ],
      },
    ]);
  };

  // Remove Question
  const handleRemoveQuestion = (idx: number) => {
    setSoalList((prev) => prev.filter((_, i) => i !== idx));
  };

  // Generate Questions with AI
  const handleGenerateQuestionsAI = async () => {
    if (!judul) {
      alert("Silakan masukkan judul atau topik ujian terlebih dahulu!");
      return;
    }

    try {
      setIsGeneratingAI(true);
      const res = await fetch("/api/guru/generate-soal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topik: judul,
          jumlah: 3,
          tingkatKesulitan: "sedang",
          tipeSoal: "pilihan_ganda",
        }),
      });

      const data = await res.json();
      if (data.soal && Array.isArray(data.soal)) {
        const generated = data.soal.map((s: any, i: number) => ({
          id: `ai-${Date.now()}-${i}`,
          pertanyaan: s.pertanyaan,
          opsi: (s.opsi || []).map((o: any) => ({
            teks: o.teksOpsi || o.teks,
            benar: Boolean(o.benar),
          })),
        }));

        setSoalList((prev) => [...prev, ...generated]);
      } else {
        // Fallback default generated math question
        setSoalList((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            pertanyaan: `Diberikan sistem persamaan $2x + y = 13$ dan $x - y = 2$. Nilai dari $x + y$ adalah...`,
            opsi: [
              { teks: "8", benar: true },
              { teks: "7", benar: false },
              { teks: "6", benar: false },
              { teks: "5", benar: false },
            ],
          },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Submit Exam Creation
  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul) {
      alert("Judul ujian wajib diisi!");
      return;
    }

    try {
      setIsSaving(true);
      const res = await fetch("/api/guru/ujian", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judul,
          deskripsi,
          mapel,
          tipe,
          token: token.trim().toUpperCase(),
          durasiMenit,
          passingGrade,
          babId: selectedBabId || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/guru/ujian");
      } else {
        alert(data.error || "Gagal menyimpan ujian.");
      }
    } catch (err) {
      alert("Terjadi kesalahan saat membuat ujian.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <GuruLayout>
      <form onSubmit={handleSaveExam} className="space-y-8 max-w-5xl mx-auto pb-16">
        {/* Navigation & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/guru/ujian"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Daftar Ujian</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-2xl bg-[#0F172A] hover:bg-[#1E293B] text-white font-extrabold text-xs flex items-center gap-2 transition shadow-md cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menerbitkan Ujian...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-amber-400" />
                  <span>Terbitkan Ujian Sekarang</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Section 1: Exam Metadata */}
        <div className="saas-card rounded-3xl p-6 sm:p-8 bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-black text-[#0F172A]">Informasi & Pengaturan Ujian</h2>
            <p className="text-xs text-slate-500 mt-0.5">Tentukan parameter ujian, durasi waktu server, dan KKM.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Integrasikan ke Card Siswa */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Integrasikan Soal ke Card Dashboard Siswa:</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setTipe("ulangan");
                    setDurasiMenit(60);
                  }}
                  className={`p-4 rounded-2xl border text-left transition flex items-start gap-3 cursor-pointer ${
                    tipe === "ulangan"
                      ? "bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      tipe === "ulangan"
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-xs text-[#0F172A]">
                        Card 1: Ulangan Harian
                      </span>
                      {tipe === "ulangan" && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      Evaluasi formatif bab. Langsung muncul di Card Ulangan siswa.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTipe("ujian");
                    setDurasiMenit(90);
                  }}
                  className={`p-4 rounded-2xl border text-left transition flex items-start gap-3 cursor-pointer ${
                    tipe === "ujian"
                      ? "bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20 shadow-xs"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      tipe === "ujian"
                        ? "bg-[#0F172A] text-white"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    <Clock className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-xs text-[#0F172A]">
                        Card 2: Ujian Resmi (PTS/PAS)
                      </span>
                      {tipe === "ujian" && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      Asesmen sumatif resmi sekolah. Terintegrasi ke Card Ujian siswa.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Judul Ujian / Asesmen *</label>
              <input
                type="text"
                required
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                placeholder="Contoh: Asesmen Sumatif Bab 1 - Pola Bilangan & Barisan"
                className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Deskripsi & Petunjuk Siswa</label>
              <textarea
                rows={2}
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                placeholder="Petunjuk pengerjaan ujian untuk siswa..."
                className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Mata Pelajaran</label>
              <select
                value={mapel}
                onChange={(e) => setMapel(e.target.value)}
                className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Matematika">Matematika</option>
                <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                <option value="Bahasa Inggris">Bahasa Inggris</option>
                <option value="IPA">IPA</option>
                <option value="IPS">IPS</option>
                <option value="PPKN">PPKN</option>
                <option value="PJOK">PJOK</option>
                <option value="SENI">SENI</option>
                <option value="AGAMA">AGAMA</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Topik / Bab Relevan</label>
              <select
                value={selectedBabId}
                onChange={(e) => setSelectedBabId(e.target.value)}
                className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Pilih Bab Kurikulum Merdeka --</option>
                {babList.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.judul}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Durasi Pengerjaan (Menit)</label>
              <div className="relative">
                <input
                  type="number"
                  min={5}
                  max={240}
                  value={durasiMenit}
                  onChange={(e) => setDurasiMenit(Number(e.target.value))}
                  className="w-full p-3.5 pl-10 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Passing Grade / KKM</label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={passingGrade}
                  onChange={(e) => setPassingGrade(Number(e.target.value))}
                  className="w-full p-3.5 pl-10 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Award className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {/* Token Ujian Siswa */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-500" />
                <span>Kode Token Akses Siswa (Wajib Dibagikan ke Siswa) *</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value.toUpperCase())}
                  placeholder="CONTOH: MTK-ULG26"
                  className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-mono font-black uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => {
                    const prefix = mapel.substring(0, 3).toUpperCase();
                    const tag = tipe === "ulangan" ? "ULG" : "PTS";
                    setToken(`${prefix}-${tag}${Math.floor(10 + Math.random() * 90)}`);
                  }}
                  className="px-4 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold shrink-0 border border-slate-200 cursor-pointer"
                >
                  Acak Token
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Siswa harus memasukkan kode token ini setelah memilih mata pelajaran sebelum masuk ke ruang ujian.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Questions Builder */}
        <div className="saas-card rounded-3xl p-6 sm:p-8 bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-black text-[#0F172A]">Daftar Soal Ujian ({soalList.length} Soal)</h2>
              <p className="text-xs text-slate-500 mt-0.5">Susun soal pilihan ganda atau gunakan AI Question Generator.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleGenerateQuestionsAI}
                disabled={isGeneratingAI}
                className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs flex items-center gap-1.5 transition border border-indigo-200 cursor-pointer disabled:opacity-50"
              >
                {isGeneratingAI ? (
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                ) : (
                  <Sparkles className="w-4 h-4 text-amber-500" />
                )}
                <span>Generate Soal AI</span>
              </button>

              <button
                type="button"
                onClick={handleAddQuestion}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Tambah Soal</span>
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {soalList.map((s, sIdx) => (
              <div key={s.id} className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-[#0F172A] text-white">
                    Nomor {sIdx + 1}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(sIdx)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <textarea
                  rows={2}
                  value={s.pertanyaan}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSoalList((prev) =>
                      prev.map((item, i) => (i === sIdx ? { ...item, pertanyaan: val } : item))
                    );
                  }}
                  placeholder="Tuliskan pertanyaan / narasi soal (Mendukung KaTeX)..."
                  className="w-full p-3 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Pilihan Jawaban (Tandai yang Benar):</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {s.opsi.map((op, opIdx) => {
                      const letter = String.fromCharCode(65 + opIdx);
                      return (
                        <div
                          key={opIdx}
                          className={`p-2.5 rounded-xl border flex items-center gap-2.5 bg-white ${
                            op.benar ? "border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/30" : "border-slate-200"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`correct-${s.id}`}
                            checked={op.benar}
                            onChange={() => {
                              setSoalList((prev) =>
                                prev.map((item, i) =>
                                  i === sIdx
                                    ? {
                                        ...item,
                                        opsi: item.opsi.map((o, oi) => ({
                                          ...o,
                                          benar: oi === opIdx,
                                        })),
                                      }
                                    : item
                                )
                              );
                            }}
                            className="cursor-pointer text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-xs font-black text-slate-700">{letter}.</span>
                          <input
                            type="text"
                            value={op.teks}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSoalList((prev) =>
                                prev.map((item, i) =>
                                  i === sIdx
                                    ? {
                                        ...item,
                                        opsi: item.opsi.map((o, oi) =>
                                          oi === opIdx ? { ...o, teks: val } : o
                                        ),
                                      }
                                    : item
                                )
                              );
                            }}
                            placeholder={`Pilihan ${letter}...`}
                            className="flex-1 text-xs text-slate-800 bg-transparent focus:outline-none"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>
    </GuruLayout>
  );
}

export default function GuruBuatUjianPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="w-8 h-8 animate-spin text-[#0B1A2E]" />
        </div>
      }
    >
      <GuruBuatUjianContent />
    </Suspense>
  );
}
