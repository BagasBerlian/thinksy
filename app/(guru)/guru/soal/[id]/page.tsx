"use client";

import { useState, useEffect, use } from "react";
import GuruLayout from "@/components/guru/GuruLayout";
import MarkdownRenderer from "@/components/materi/MarkdownRenderer";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Save,
  Clock,
  Sparkles,
  Bot,
  AlertCircle,
  Eye,
  Plus,
  Trash2,
  FileCheck,
} from "lucide-react";

interface OpsiItem {
  id?: string;
  teks_opsi: string;
  benar: boolean;
  urutan: number;
}

export default function EditorSoalReviewGatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const soalId = resolvedParams.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pertanyaan, setPertanyaan] = useState("");
  const [tipeSoal, setTipeSoal] = useState("pilihan_ganda");
  const [tingkatSoal, setTingkatSoal] = useState("sedang");
  const [statusSoal, setStatusSoal] = useState("review");
  const [kunciJawaban, setKunciJawaban] = useState("");
  const [pembahasan, setPembahasan] = useState("");
  const [babJudul, setBabJudul] = useState("");
  const [opsiList, setOpsiList] = useState<OpsiItem[]>([]);
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchDetailSoal();
  }, [soalId]);

  const fetchDetailSoal = async () => {
    setLoading(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const { data: soalData, error: sErr } = await supabase
        .from("soal")
        .select(`
          id,
          pertanyaan,
          tipe_soal,
          tingkat_soal,
          status_soal,
          kunci_jawaban,
          pembahasan,
          sumber_konten,
          bab (
            id,
            judul
          ),
          opsi_soal (
            id,
            teks_opsi,
            benar,
            urutan
          )
        `)
        .eq("id", soalId)
        .maybeSingle();

      if (sErr || !soalData) {
        setNotification({ type: "error", text: "Soal tidak ditemukan di database." });
        return;
      }

      setPertanyaan(soalData.pertanyaan || "");
      setTipeSoal(soalData.tipe_soal || "pilihan_ganda");
      setTingkatSoal(soalData.tingkat_soal || "sedang");
      setStatusSoal(soalData.status_soal || "review");
      setKunciJawaban(soalData.kunci_jawaban || "");
      setPembahasan(soalData.pembahasan || "");
      setBabJudul((soalData as any)?.bab?.judul || "Matematika Kelas 8");

      const sortedOpsi = ((soalData as any)?.opsi_soal || []).sort(
        (a: OpsiItem, b: OpsiItem) => a.urutan - b.urutan
      );
      if (sortedOpsi.length > 0) {
        setOpsiList(sortedOpsi);
      } else {
        setOpsiList([
          { teks_opsi: "", benar: true, urutan: 1 },
          { teks_opsi: "", benar: false, urutan: 2 },
          { teks_opsi: "", benar: false, urutan: 3 },
          { teks_opsi: "", benar: false, urutan: 4 },
        ]);
      }
    } catch (err: any) {
      setNotification({ type: "error", text: err.message || "Gagal memuat soal." });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (publishImmediately: boolean = false) => {
    setSaving(true);
    setNotification(null);

    const targetStatus = publishImmediately ? "dipublikasi" : statusSoal;

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      // 1. Update record di table soal
      const { error: updateErr } = await supabase
        .from("soal")
        .update({
          pertanyaan,
          tipe_soal: tipeSoal,
          tingkat_soal: tingkatSoal,
          status_soal: targetStatus,
          kunci_jawaban: kunciJawaban,
          pembahasan,
        })
        .eq("id", soalId);

      if (updateErr) throw updateErr;

      // 2. Update opsi_soal jika pilihan ganda
      if (tipeSoal === "pilihan_ganda") {
        for (const op of opsiList) {
          if (op.id) {
            await supabase
              .from("opsi_soal")
              .update({
                teks_opsi: op.teks_opsi,
                benar: op.benar,
              })
              .eq("id", op.id);
          }
        }
      }

      setStatusSoal(targetStatus);
      setNotification({
        type: "success",
        text: publishImmediately
          ? "🎉 Soal berhasil disetujui & diterbitkan ke siswa (Review Gate Passed)!"
          : "✅ Perubahan soal berhasil disimpan.",
      });

      if (publishImmediately) {
        setTimeout(() => {
          router.push("/guru/soal");
        }, 1200);
      }
    } catch (err: any) {
      setNotification({ type: "error", text: err.message || "Gagal menyimpan perubahan." });
    } finally {
      setSaving(false);
    }
  };

  const isReviewStatus = statusSoal === "review" || statusSoal === "perlu_review";
  const isPublished = statusSoal === "dipublikasi" || statusSoal === "terbit";

  return (
    <GuruLayout>
      <div className="space-y-6 max-w-4xl mx-auto pb-20">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3">
            <Link
              href="/guru/soal"
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Editor Soal & Review Gate
                </h1>
                {isReviewStatus && (
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    Menunggu Review Guru
                  </span>
                )}
                {isPublished && (
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Terbit ke Siswa
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Topik: <span className="font-semibold text-slate-700">{babJudul}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Draft</span>
            </button>

            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Terbitkan Soal (Review Gate)</span>
            </button>
          </div>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
              notification.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            )}
            <span>{notification.text}</span>
          </div>
        )}

        {loading ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-xs text-slate-500">
            Memuat rincian soal...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Meta Attributes */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Atribut & Pengaturan Soal
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1.5">
                    Tipe Soal
                  </label>
                  <select
                    value={tipeSoal}
                    onChange={(e) => setTipeSoal(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
                  >
                    <option value="pilihan_ganda">Pilihan Ganda (Objektif)</option>
                    <option value="esai">Esai (Uraian)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1.5">
                    Tingkat Kesulitan
                  </label>
                  <select
                    value={tingkatSoal}
                    onChange={(e) => setTingkatSoal(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:outline-hidden focus:border-[#1967D2] focus:ring-2 focus:ring-blue-100 bg-white font-sans"
                  >
                    <option value="mudah">Mudah</option>
                    <option value="sedang">Sedang</option>
                    <option value="sulit">Sulit</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Status Publikasi
                  </label>
                  <select
                    value={statusSoal}
                    onChange={(e) => setStatusSoal(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:outline-hidden focus:border-[#1967D2] focus:ring-2 focus:ring-blue-100 bg-white font-sans"
                  >
                    <option value="review">Perlu Review (Tertahan)</option>
                    <option value="dipublikasi">Dipublikasi (Aktif untuk Siswa)</option>
                    <option value="draft">Draft Guru</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Question Text & KaTeX Live Preview */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Teks Pertanyaan (Mendukung LaTeX $...$)
                </label>
                <span className="text-[11px] text-slate-400">Gunakan $...$ untuk rumus KaTeX</span>
              </div>

              <textarea
                rows={4}
                value={pertanyaan}
                onChange={(e) => setPertanyaan(e.target.value)}
                className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl p-3 font-sans focus:outline-hidden focus:border-[#1967D2] focus:ring-2 focus:ring-blue-100"
                placeholder="Tuliskan soal di sini, contoh: Tentukan nilai $x$ jika $2x + 6 = 14$..."
              />

              {/* Live Preview Box */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Pratinjau Tampilan Siswa
                </span>
                <div className="text-xs sm:text-sm text-slate-900 leading-relaxed">
                  <MarkdownRenderer content={pertanyaan || "_Belum ada teks pertanyaan._"} />
                </div>
              </div>
            </div>

            {/* Options or Essay Answer Key */}
            {tipeSoal === "pilihan_ganda" ? (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-xs">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Opsi Jawaban (Tandai Tepat Satu Jawaban Benar)
                </h2>

                <div className="space-y-3">
                  {opsiList.map((op, idx) => {
                    const label = String.fromCharCode(65 + idx);
                    return (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                          op.benar ? "bg-blue-50/60 border-[#1967D2]/40" : "bg-white border-slate-200/80"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setOpsiList((prev) =>
                              prev.map((item, i) => ({ ...item, benar: i === idx }))
                            );
                            setKunciJawaban(op.teks_opsi);
                          }}
                          className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer transition-colors ${
                            op.benar ? "bg-[#1967D2] text-white shadow-xs" : "border border-slate-300 text-slate-500 hover:border-slate-400"
                          }`}
                        >
                          {label}
                        </button>

                        <div className="flex-1 space-y-1">
                          <input
                            type="text"
                            value={op.teks_opsi}
                            onChange={(e) => {
                              const val = e.target.value;
                              setOpsiList((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, teks_opsi: val } : item))
                              );
                              if (op.benar) setKunciJawaban(val);
                            }}
                            placeholder={`Teks pilihan jawaban ${label}...`}
                            className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:outline-hidden focus:border-[#1967D2] focus:ring-2 focus:ring-blue-100 bg-white font-sans"
                          />
                          <div className="text-[11px] text-slate-600 px-1">
                            <MarkdownRenderer content={op.teks_opsi || "_Kosong_"} />
                          </div>
                        </div>

                        {op.benar && (
                          <span className="text-[11px] font-bold text-[#1967D2] px-2.5 py-0.5 bg-blue-100 rounded-full self-center">
                            Kunci Jawaban
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3 shadow-xs">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Kunci Konsep / Rubrik Esai
                </label>
                <textarea
                  rows={3}
                  value={kunciJawaban}
                  onChange={(e) => setKunciJawaban(e.target.value)}
                  placeholder="Kriteria jawaban benar rujukan materi yang akan digunakan AI untuk menilai..."
                  className="w-full text-xs border border-slate-200 rounded-xl p-3 focus:outline-hidden focus:border-[#1967D2] focus:ring-2 focus:ring-blue-100 font-sans"
                />
              </div>
            )}

            {/* Explanation / Discussion */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3 shadow-xs">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Pembahasan Langkah demi Langkah
              </label>
              <textarea
                rows={4}
                value={pembahasan}
                onChange={(e) => setPembahasan(e.target.value)}
                placeholder="Langkah 1: ...&#10;Langkah 2: ...&#10;Langkah 3: ..."
                className="w-full text-xs border border-slate-200 rounded-xl p-3 focus:outline-hidden focus:border-[#1967D2] focus:ring-2 focus:ring-blue-100 font-sans"
              />

              {pembahasan && (
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Pratinjau Pembahasan
                  </span>
                  <div className="text-xs text-slate-800 leading-relaxed">
                    <MarkdownRenderer content={pembahasan} />
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions Thumb-Zone Bar */}
            <div className="sticky bottom-4 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
              <span className="text-xs text-slate-500">
                Pastikan kunci jawaban & pembahasan bebas dari halusinasi sebelum menerbitkan.
              </span>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleSave(false)}
                  disabled={saving}
                  className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Simpan Perubahan
                </button>
                <button
                  type="button"
                  onClick={() => handleSave(true)}
                  disabled={saving}
                  className="flex-1 sm:flex-none px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Terbitkan Soal</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </GuruLayout>
  );
}
