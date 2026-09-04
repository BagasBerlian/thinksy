"use client";

import React, { useState, useEffect } from "react";
import GuruLayout from "@/components/guru/GuruLayout";
import MarkdownRenderer from "@/components/materi/MarkdownRenderer";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  FileText,
  Clock,
  BookOpen,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ChevronDown,
  UserCheck,
  Sparkles,
  Loader2,
  Bot,
} from "lucide-react";

export default function GuruDetailSiswaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = React.use(params);
  const studentId = unwrappedParams?.id || "1";

  const [activeTab, setActiveTab] = useState<"riwayat" | "log_ai">("riwayat");

  const [studentData, setStudentData] = useState({
    id: studentId,
    name: "Ahmad Raihan",
    nis: "19283746",
    class: "Kelas 8A",
    attendance: "98%",
    target: "Bab 4 Selesai",
    status: "Aktif",
    overallScore: 82,
    classAverage: 76,
    totalTime: "24j 15m",
    modulesCompleted: 18,
    performanceTrend: "+5.2% Bulan ini",
  });

  const [sessionHistory, setSessionHistory] = useState<any[]>([
    {
      id: 1,
      date: "Hari Ini",
      topic: "Persamaan Kuadrat Lanjut",
      type: "Kuis",
      typeColor: "bg-amber-100 text-amber-900 border-amber-200",
      score: 85,
      duration: "45m",
      status: "Selesai",
    },
  ]);

  const [aiTutorLogs, setAiTutorLogs] = useState<any[]>([]);
  const [aiDiagnosis, setAiDiagnosis] = useState<string | null>(null);
  const [isGeneratingDiagnosis, setIsGeneratingDiagnosis] = useState(false);

  useEffect(() => {
    async function fetchStudentDetail() {
      try {
        const res = await fetch(`/api/guru/siswa/${studentId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.student) {
            setStudentData((prev) => ({
              ...prev,
              id: data.student.id,
              name: data.student.name,
              overallScore: data.student.overallScore,
              status: data.student.status || "Aktif",
            }));
          }
          if (data.sessionHistory && data.sessionHistory.length > 0) {
            setSessionHistory(data.sessionHistory);
          }
          if (data.aiTutorLogs) {
            setAiTutorLogs(data.aiTutorLogs);
          }
        }
      } catch {
        // fallback
      }
    }
    fetchStudentDetail();
  }, [studentId]);

  const handleGenerateAIDiagnosis = async () => {
    setIsGeneratingDiagnosis(true);
    setAiDiagnosis(null);
    try {
      const res = await fetch(`/api/guru/siswa/${studentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: studentData.name,
          scores: `${studentData.overallScore}%`,
          weakTopics: "Persamaan Kuadrat, Operasi Aljabar & Pemfaktoran",
        }),
      });
      const data = await res.json();
      if (res.ok && data.diagnosis) {
        setAiDiagnosis(data.diagnosis);
      } else {
        alert(data.error || "Gagal menghasilkan rekomendasi AI.");
      }
    } catch {
      alert("Terjadi kesalahan sistem saat membuat analisis AI.");
    } finally {
      setIsGeneratingDiagnosis(false);
    }
  };

  return (
    <GuruLayout>
      <div className="space-y-6">
        {/* 1. TOP HEADER NAVIGATION & ACTIONS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/guru/siswa"
            className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-600 hover:text-[#0F172A] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>KEMBALI KE DAFTAR KELAS</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleGenerateAIDiagnosis}
              disabled={isGeneratingDiagnosis}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-2 shadow-md transition cursor-pointer disabled:opacity-50"
            >
              {isGeneratingDiagnosis ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menganalisis AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analisis & Remedial AI</span>
                </>
              )}
            </button>
            <button className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-extrabold flex items-center gap-2 shadow-xs transition cursor-pointer">
              <Download className="w-4 h-4 text-slate-500" />
              <span>Unduh PDF</span>
            </button>
          </div>
        </div>

        {/* AI DIAGNOSIS CARD IF GENERATED */}
        {aiDiagnosis && (
          <div className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white p-6 sm:p-8 rounded-3xl border border-amber-500/40 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-extrabold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Hasil Asesmen Diagnostik & Intervensi AI</span>
              </div>
              <button
                onClick={() => setAiDiagnosis(null)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-white/10"
              >
                Tutup
              </button>
            </div>
            <div className="prose prose-invert prose-sm max-w-none text-slate-200 font-medium">
              <MarkdownRenderer content={aiDiagnosis} />
            </div>
          </div>
        )}

        {/* 2. STUDENT PROFILE & OVERALL SCORE HERO CARD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Student Profile Card (7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
            {/* Student Avatar */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-3xl bg-[#0F172A] text-white flex items-center justify-center font-extrabold text-2xl border-4 border-white shadow-md">
                AR
              </div>
              <span className="absolute bottom-0 right-0 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold border-2 border-white">
                {studentData.status}
              </span>
            </div>

            {/* Info Details */}
            <div className="space-y-3 text-center sm:text-left flex-1">
              <div>
                <h1 className="text-xl font-extrabold text-[#0F172A]">
                  {studentData.name}
                </h1>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  NIS: {studentData.nis} • {studentData.class}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                    STATUS KEHADIRAN
                  </div>
                  <div className="text-sm font-extrabold text-[#0F172A] mt-0.5">
                    {studentData.attendance}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                    TARGET KURIKULUM
                  </div>
                  <div className="text-sm font-extrabold text-[#0F172A] mt-0.5">
                    {studentData.target}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rata-rata Keseluruhan Chart Gauge Card (5 cols) */}
          <div className="lg:col-span-5 bg-[#0F172A] p-6 sm:p-8 rounded-3xl border border-slate-800 text-white shadow-xs flex flex-col items-center justify-center text-center space-y-4">
            <div className="text-xs font-extrabold text-slate-300 uppercase tracking-widest">
              RATA-RATA KESELURUHAN
            </div>

            {/* Gauge Circle */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-amber-400"
                  strokeDasharray="82, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-2xl font-extrabold text-white">
                {studentData.overallScore}%
              </span>
            </div>

            <p className="text-xs text-slate-300 font-semibold">
              Di atas rata-rata kelas ({studentData.classAverage}%)
            </p>
          </div>
        </div>

        {/* 3. TABS & SESSION METRICS */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          {/* Nav Tabs */}
          <div className="flex items-center border-b border-slate-200 gap-6 text-xs font-extrabold">
            <button
              onClick={() => setActiveTab("riwayat")}
              className={`pb-3 transition cursor-pointer border-b-2 ${
                activeTab === "riwayat"
                  ? "border-[#0F172A] text-[#0F172A]"
                  : "border-transparent text-slate-400 hover:text-slate-700"
              }`}
            >
              Riwayat Sesi
            </button>
            <button
              onClick={() => setActiveTab("log_ai")}
              className={`pb-3 transition cursor-pointer border-b-2 flex items-center gap-1.5 ${
                activeTab === "log_ai"
                  ? "border-[#0F172A] text-[#0F172A]"
                  : "border-transparent text-slate-400 hover:text-slate-700"
              }`}
            >
              <span>Log Chat AI Tutor</span>
              <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[9px]">
                2 Baru
              </span>
            </button>
          </div>

          {activeTab === "riwayat" ? (
            <div className="space-y-6">
              {/* Summary Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-slate-700">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-extrabold text-slate-400 uppercase">
                      TOTAL WAKTU BELAJAR
                    </div>
                    <div className="text-sm font-extrabold text-[#0F172A]">
                      {studentData.totalTime}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-slate-700">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-extrabold text-slate-400 uppercase">
                      MODUL DISELESAIKAN
                    </div>
                    <div className="text-sm font-extrabold text-[#0F172A]">
                      {studentData.modulesCompleted} Modul
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-extrabold text-slate-400 uppercase">
                      TREN PERFORMA
                    </div>
                    <div className="text-sm font-extrabold text-emerald-700">
                      {studentData.performanceTrend}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sessions Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">TANGGAL</th>
                      <th className="px-5 py-3.5">MATERI / TOPIK</th>
                      <th className="px-5 py-3.5">TIPE</th>
                      <th className="px-5 py-3.5">SKOR</th>
                      <th className="px-5 py-3.5">DURASI</th>
                      <th className="px-5 py-3.5">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {sessionHistory.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-5 py-4 text-slate-500 font-semibold">
                          {s.date}
                        </td>
                        <td className="px-5 py-4 font-extrabold text-[#0F172A]">
                          {s.topic}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${s.typeColor}`}
                          >
                            ● {s.type}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {s.score !== null ? (
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-[#0F172A] w-6">
                                {s.score}
                              </span>
                              <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className="h-full bg-[#0F172A] rounded-full"
                                  style={{ width: `${s.score}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-extrabold">–</span>
                          )}
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-600">
                          {s.duration}
                        </td>
                        <td className="px-5 py-4">
                          <span className="flex items-center gap-1 font-extrabold text-slate-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{s.status}</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Load More Button */}
              <div className="text-center pt-2">
                <button className="px-5 py-2 rounded-xl text-xs font-extrabold text-slate-600 hover:text-[#0F172A] inline-flex items-center gap-1 cursor-pointer">
                  <span>Muat lebih banyak</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#0F172A]">
                      Konsol Log Percakapan AI Sokratik
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Menampilkan riwayat dialog bimbingan Sokratik antara {studentData.name} dan Tutor AI
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#0F172A] text-white text-[10px] font-extrabold">
                  {aiTutorLogs.length > 0 ? `${aiTutorLogs.length} Pesan Terrekam` : "Sesi Sokratik Aktif"}
                </span>
              </div>

              {aiTutorLogs.length > 0 ? (
                <div className="space-y-3 max-h-[500px] overflow-y-auto p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  {aiTutorLogs.map((chat: any) => {
                    const isUser = chat.pengirim === "siswa";
                    return (
                      <div
                        key={chat.id}
                        className={`flex gap-3 max-w-2xl ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            isUser ? "bg-[#0F172A] text-white" : "bg-amber-500 text-slate-950"
                          }`}
                        >
                          {isUser ? "S" : <Bot className="w-4 h-4" />}
                        </div>
                        <div
                          className={`p-4 rounded-2xl text-xs font-medium space-y-1 ${
                            isUser
                              ? "bg-[#0F172A] text-white rounded-tr-none"
                              : "bg-white text-slate-800 border border-slate-200 shadow-xs rounded-tl-none"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4 text-[10px] opacity-75 font-bold mb-1">
                            <span>{isUser ? studentData.name : "Tutor AI Sokratik"}</span>
                            <span>{new Date(chat.dibuat_pada || Date.now()).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                          <MarkdownRenderer content={chat.pesan} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex gap-3 max-w-2xl mr-auto">
                    <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-bold shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="p-4 rounded-2xl text-xs font-medium bg-white text-slate-800 border border-slate-200 shadow-xs rounded-tl-none space-y-1">
                      <div className="flex items-center justify-between gap-4 text-[10px] text-amber-700 font-bold mb-1">
                        <span>Tutor AI Sokratik</span>
                        <span>08:15 WIB</span>
                      </div>
                      <p>Halo {studentData.name}! Sebelum kita memfaktorkan $2x^2 + 5x - 3 = 0$, angka berapa jika dikalikan menghasilkan $-6$ dan jika dijumlahkan menghasilkan $5$?</p>
                    </div>
                  </div>

                  <div className="flex gap-3 max-w-2xl ml-auto flex-row-reverse">
                    <div className="w-8 h-8 rounded-full bg-[#0F172A] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      S
                    </div>
                    <div className="p-4 rounded-2xl text-xs font-medium bg-[#0F172A] text-white rounded-tr-none space-y-1">
                      <div className="flex items-center justify-between gap-4 text-[10px] opacity-75 font-bold mb-1">
                        <span>{studentData.name}</span>
                        <span>08:16 WIB</span>
                      </div>
                      <p>Angka 6 dan -1!</p>
                    </div>
                  </div>

                  <div className="flex gap-3 max-w-2xl mr-auto">
                    <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-bold shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="p-4 rounded-2xl text-xs font-medium bg-white text-slate-800 border border-slate-200 shadow-xs rounded-tl-none space-y-1">
                      <div className="flex items-center justify-between gap-4 text-[10px] text-amber-700 font-bold mb-1">
                        <span>Tutor AI Sokratik</span>
                        <span>08:17 WIB</span>
                      </div>
                      <p>Tepat sekali! Sekarang uraikan $5x$ menjadi $6x - 1x$ dan lakukan pemfaktoran kelompok.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </GuruLayout>
  );
}
