"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  Award,
  Flame,
  Zap,
  FileCheck,
  Search,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  BookOpen,
  ArrowLeft,
  X,
  Bot,
  Filter,
  BarChart3,
  Check,
  Eye,
  FileText,
} from "lucide-react";
import GuruLayout from "@/components/guru/GuruLayout";
import MarkdownRenderer from "@/components/materi/MarkdownRenderer";

interface StudentClass {
  id: string;
  nama: string;
  deskripsi: string;
}

interface StudentItem {
  id: string;
  nama: string;
  initials: string;
  email: string;
  nisn: string;
  kelasId: string;
  namaKelas: string;
  skorRataRata: number;
  streakHari: number;
  poinXP: number;
  lencanaCount: number;
  statusRemedial: "Perlu Remedial" | "Tuntas";
}

interface ExamQuestion {
  id: string;
  pertanyaan: string;
  tipeSoal: string;
  jawabanSiswa: string;
  kunciJawaban: string;
  pembahasan: string;
  isBenar: boolean;
  nilai: number;
  umpanBalik: string;
}

interface ExamAttempt {
  id: string;
  judulUjian: string;
  tanggal: string;
  skorAkhir: number;
  status: "Tuntas" | "Remedial";
  soalList: ExamQuestion[];
}

export default function GuruPenilaianSiswaPage() {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<StudentClass[]>([]);
  const [students, setStudents] = useState<StudentItem[]>([]);
  
  // Selection states
  const [selectedClassId, setSelectedClassId] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<"ujian" | "kuis" | "streak" | "poin" | "ai_diagnostic">("ujian");
  
  // Search & Filter
  const [studentSearch, setStudentSearch] = useState("");

  // Exam Questions Modal
  const [selectedExam, setSelectedExam] = useState<ExamAttempt | null>(null);

  // Mock Exam Attempts Generator per Student
  const getExamAttemptsForStudent = (student: StudentItem): ExamAttempt[] => {
    return [
      {
        id: `exam-1-${student.id}`,
        judulUjian: "Ujian Tengah Semester 1 — Matematika 8",
        tanggal: "28 Agt 2026",
        skorAkhir: student.skorRataRata,
        status: student.skorRataRata >= 70 ? "Tuntas" : "Remedial",
        soalList: [
          {
            id: "q-1",
            pertanyaan: "Diketahui sistem persamaan linear dua variabel:\n$$2x + y = 13$$\n$$x - y = 2$$\nTentukan nilai dari $x + 2y$!",
            tipeSoal: "pilihan_ganda",
            jawabanSiswa: "$x + 2y = 11$",
            kunciJawaban: "Opsi B ($x + 2y = 11$)",
            pembahasan: "**Langkah Solusi:**\n1. Jumlahkan kedua persamaan:\n   $(2x + y) + (x - y) = 13 + 2 \\implies 3x = 15 \\implies x = 5$\n2. Substitusi $x = 5$ ke $x - y = 2 \\implies 5 - y = 2 \\implies y = 3$.\n3. Hitung $x + 2y = 5 + 2(3) = 11$.",
            isBenar: student.skorRataRata >= 70,
            nilai: student.skorRataRata >= 70 ? 100 : 40,
            umpanBalik: "Pemahaman konsep substitusi dan eliminasi SPLDV sangat baik.",
          },
          {
            id: "q-2",
            pertanyaan: "Sebuah segitiga siku-siku memiliki panjang sisi tegak $a = 6\\text{ cm}$ dan $b = 8\\text{ cm}$. Tentukan panjang sisi miring $c$!",
            tipeSoal: "pilihan_ganda",
            jawabanSiswa: "$c = 10\\text{ cm}$",
            kunciJawaban: "$c = 10\\text{ cm}$",
            pembahasan: "**Langkah Solusi Pythagoras:**\n$$c = \\sqrt{a^2 + b^2} = \\sqrt{6^2 + 8^2} = \\sqrt{36 + 64} = \\sqrt{100} = 10\\text{ cm}$$",
            isBenar: true,
            nilai: 100,
            umpanBalik: "Perhitungan tripel Pythagoras tepat.",
          },
          {
            id: "q-3",
            pertanyaan: "Jelaskan langkah-langkah menentukan akar-akar persamaan kuadrat $x^2 - 5x + 6 = 0$ dengan metode pemfaktoran!",
            tipeSoal: "esai",
            jawabanSiswa: "Cari dua bilangan yang dikali sama dengan 6 dan dijumlah sama dengan -5, yaitu -2 dan -3. Maka $(x - 2)(x - 3) = 0$, sehingga $x = 2$ atau $x = 3$.",
            kunciJawaban: "Pemfaktoran: $(x - 2)(x - 3) = 0 \\implies x_1 = 2, x_2 = 3$.",
            pembahasan: "**Langkah Pemfaktoran:**\nPersamaan $x^2 - 5x + 6 = 0$.\nNilai $a = 1, b = -5, c = 6$.\nPasangan bilangan: $-2$ dan $-3$.\nBentuk faktor: $(x - 2)(x - 3) = 0 \\implies x_1 = 2 \\text{ atau } x_2 = 3$.",
            isBenar: true,
            nilai: 90,
            umpanBalik: "Penjelasan uraian esai runtut dan jelas.",
          },
        ],
      },
      {
        id: `exam-2-${student.id}`,
        judulUjian: "Kuis Akhir Bab 4 — Pemfaktoran Aljabar",
        tanggal: "15 Agt 2026",
        skorAkhir: Math.min(100, student.skorRataRata + 5),
        status: "Tuntas",
        soalList: [
          {
            id: "q-4",
            pertanyaan: "Faktorkan bentuk aljabar berikut:\n$$4x^2 - 9$$",
            tipeSoal: "pilihan_ganda",
            jawabanSiswa: "$(2x - 3)(2x + 3)$",
            kunciJawaban: "$(2x - 3)(2x + 3)$",
            pembahasan: "**Rumus Selisih Kuadrat:**\n$$a^2 - b^2 = (a - b)(a + b)$$\n$$(2x)^2 - 3^2 = (2x - 3)(2x + 3)$$",
            isBenar: true,
            nilai: 100,
            umpanBalik: "Sangat memahami rumus selisih dua kuadrat.",
          },
        ],
      },
    ];
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/guru/penilaian-siswa");
        const data = await res.json();
        if (data.success) {
          setClasses(data.classes || []);
          setStudents(data.students || []);
          if (data.students && data.students.length > 0) {
            setSelectedStudent(data.students[0]);
          }
        }
      } catch {
        // Fallback demo data
        const demoClasses = [
          { id: "kelas-8a", nama: "Kelas 8-A", deskripsi: "Matematika SMP Kelas 8 Unggulan" },
          { id: "kelas-8b", nama: "Kelas 8-B", deskripsi: "Matematika SMP Kelas 8 Reguler A" },
          { id: "kelas-8c", nama: "Kelas 8-C", deskripsi: "Matematika SMP Kelas 8 Reguler B" },
          { id: "kelas-9a", nama: "Kelas 9-A", deskripsi: "Matematika SMP Kelas 9 Unggulan" },
        ];
        const demoStudents: StudentItem[] = [
          { id: "st-1", nama: "Ahmad Raihan", initials: "AR", email: "ahmad@sekolah.sch.id", nisn: "00849201", kelasId: "kelas-8a", namaKelas: "Kelas 8-A", skorRataRata: 85, streakHari: 14, poinXP: 1450, lencanaCount: 6, statusRemedial: "Tuntas" },
          { id: "st-2", nama: "Budi Santoso", initials: "BS", email: "budi@sekolah.sch.id", nisn: "00849214", kelasId: "kelas-8a", namaKelas: "Kelas 8-A", skorRataRata: 62, streakHari: 5, poinXP: 920, lencanaCount: 3, statusRemedial: "Perlu Remedial" },
          { id: "st-3", nama: "Citra Dewi", initials: "CD", email: "citra@sekolah.sch.id", nisn: "00849227", kelasId: "kelas-8b", namaKelas: "Kelas 8-B", skorRataRata: 90, streakHari: 21, poinXP: 1890, lencanaCount: 8, statusRemedial: "Tuntas" },
          { id: "st-4", nama: "Dina Aulia", initials: "DA", email: "dina@sekolah.sch.id", nisn: "00849240", kelasId: "kelas-8b", namaKelas: "Kelas 8-B", skorRataRata: 78, streakHari: 9, poinXP: 1100, lencanaCount: 5, statusRemedial: "Tuntas" },
          { id: "st-5", nama: "Eko Prasetyo", initials: "EP", email: "eko@sekolah.sch.id", nisn: "00849253", kelasId: "kelas-8c", namaKelas: "Kelas 8-C", skorRataRata: 68, streakHari: 4, poinXP: 850, lencanaCount: 2, statusRemedial: "Perlu Remedial" },
        ];
        setClasses(demoClasses);
        setStudents(demoStudents);
        setSelectedStudent(demoStudents[0]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredStudents = students.filter((st) => {
    const matchClass = selectedClassId === "all" || st.kelasId === selectedClassId;
    const matchSearch =
      st.nama.toLowerCase().includes(studentSearch.toLowerCase()) ||
      st.nisn.includes(studentSearch) ||
      st.namaKelas.toLowerCase().includes(studentSearch.toLowerCase());
    return matchClass && matchSearch;
  });

  return (
    <GuruLayout>
      <div className="space-y-6 max-w-7xl mx-auto font-sans pb-12">
        {/* PAGE HEADER BAR */}
        <div className="bg-gradient-to-r from-[#0F172A] via-slate-900 to-[#0F172A] text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-black">
              <GraduationCap className="w-4 h-4" />
              <span>Portal Penilaian & Rapor Seluruh Guru</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black tracking-tight">
              Laporan Penilaian & Evaluasi Siswa
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-2xl">
              Pilih kelas dan siswa untuk melihat hasil Ujian, Kuis, Streak Belajar, Poin XP, serta inspeksi detail soal & jawaban siswa.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/guru"
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-2 transition border border-slate-700 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400" />
              <span>Dashboard Utama</span>
            </Link>
          </div>
        </div>

        {/* ======================================================== */}
        {/* LANGKAH 1: PILIHAN BUTTON KELAS GRID                      */}
        {/* ======================================================== */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h2 className="text-sm font-black text-[#0F172A]">
                Langkah 1: Pilih Kelas Siswa ({classes.length} Kelas Aktif)
              </h2>
            </div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              Dapat Diakses Semua Guru
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Button "Semua Kelas" */}
            <button
              onClick={() => setSelectedClassId("all")}
              className={`px-5 py-3 rounded-2xl text-xs font-black flex items-center gap-2.5 transition cursor-pointer border ${
                selectedClassId === "all"
                  ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-md"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Semua Kelas ({students.length} Siswa)</span>
            </button>

            {/* Grid Button Pilihan Kelas */}
            {classes.map((cls) => {
              const isSelected = selectedClassId === cls.id;
              const countInClass = students.filter((s) => s.kelasId === cls.id).length;
              return (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClassId(cls.id)}
                  className={`px-5 py-3 rounded-2xl text-xs font-black flex items-center gap-3 transition cursor-pointer border ${
                    isSelected
                      ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-md"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black ${isSelected ? "bg-white text-blue-700" : "bg-slate-200 text-slate-700"}`}>
                    {cls.nama.replace("Kelas ", "")}
                  </div>
                  <div className="text-left">
                    <div>{cls.nama}</div>
                    <div className={`text-[10px] font-medium ${isSelected ? "text-blue-100" : "text-slate-400"}`}>
                      {countInClass} Siswa
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* MAIN SPLIT CONTENT: STUDENT LIST (LEFT) & DIAGNOSTIC PANEL (RIGHT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ======================================================== */}
          {/* LANGKAH 2: PILIHAN NAMA SISWA LIST (5 COLS)              */}
          {/* ======================================================== */}
          <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="text-xs font-black text-[#0F172A] flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-amber-500" />
                  <span>Langkah 2: Pilih Nama Siswa ({filteredStudents.length})</span>
                </div>
              </div>

              {/* Search Student Input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Cari nama siswa atau NISN..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0F172A] focus:outline-none"
                />
              </div>

              {/* Student Cards List */}
              <div className="space-y-2.5 max-h-[540px] overflow-y-auto pr-1">
                {filteredStudents.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs font-medium bg-slate-50 rounded-2xl border border-slate-200">
                    Siswa tidak ditemukan.
                  </div>
                ) : (
                  filteredStudents.map((st) => {
                    const isSelected = selectedStudent?.id === st.id;
                    return (
                      <div
                        key={st.id}
                        onClick={() => setSelectedStudent(st)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                          isSelected
                            ? "bg-blue-50/90 border-blue-500 shadow-md ring-2 ring-blue-500/20"
                            : "bg-slate-50/60 hover:bg-slate-100 border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black shrink-0 ${isSelected ? "bg-blue-600 text-white shadow-sm" : "bg-slate-200 text-slate-700"}`}>
                            {st.initials}
                          </div>
                          <div className="truncate">
                            <div className="text-xs font-black text-[#0F172A] truncate">
                              {st.nama}
                            </div>
                            <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-2 mt-0.5">
                              <span>NISN: {st.nisn}</span>
                              <span>•</span>
                              <span className="text-blue-600 font-bold">{st.namaKelas}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className={`text-xs font-black px-2.5 py-0.5 rounded-full ${st.skorRataRata >= 70 ? "bg-emerald-100 text-emerald-900" : "bg-red-100 text-red-900"}`}>
                            {st.skorRataRata}%
                          </div>
                          <div className="text-[9px] font-bold text-amber-600 mt-1 flex items-center justify-end gap-1">
                            <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                            <span>{st.streakHari} Hari</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* LANGKAH 3: PANELS & 5 BUTTONS CATEGORIES (8 COLS)         */}
          {/* ======================================================== */}
          <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6 flex flex-col justify-between">
            {selectedStudent ? (
              <div className="space-y-6">
                {/* Student Summary Top Card */}
                <div className="bg-gradient-to-r from-slate-900 to-[#0F172A] text-white p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center text-base font-black shadow-md shrink-0">
                      {selectedStudent.initials}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white flex items-center gap-2">
                        <span>{selectedStudent.nama}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                          {selectedStudent.namaKelas}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">
                        NISN: {selectedStudent.nisn} • {selectedStudent.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="bg-slate-800/80 px-3.5 py-2 rounded-xl text-center border border-slate-700">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Rata-rata</div>
                      <div className="text-sm font-black text-amber-400">{selectedStudent.skorRataRata}%</div>
                    </div>
                    <div className="bg-slate-800/80 px-3.5 py-2 rounded-xl text-center border border-slate-700">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Streak</div>
                      <div className="text-sm font-black text-orange-400 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                        <span>{selectedStudent.streakHari}H</span>
                      </div>
                    </div>
                    <div className="bg-slate-800/80 px-3.5 py-2 rounded-xl text-center border border-slate-700">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Poin XP</div>
                      <div className="text-sm font-black text-blue-400">{selectedStudent.poinXP} XP</div>
                    </div>
                  </div>
                </div>

                {/* 5 CATEGORY BUTTONS (UJIAN, KUIS, STREAK, POIN, DIAGNOSTIK AI) */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-100">
                  <button
                    onClick={() => setActiveCategory("ujian")}
                    className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer shrink-0 border ${
                      activeCategory === "ujian"
                        ? "bg-blue-600 text-white border-blue-600 shadow-md"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>📝 Hasil Ujian</span>
                  </button>

                  <button
                    onClick={() => setActiveCategory("kuis")}
                    className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer shrink-0 border ${
                      activeCategory === "kuis"
                        ? "bg-blue-600 text-white border-blue-600 shadow-md"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                    <span>⚡ Kuis & Latihan</span>
                  </button>

                  <button
                    onClick={() => setActiveCategory("streak")}
                    className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer shrink-0 border ${
                      activeCategory === "streak"
                        ? "bg-blue-600 text-white border-blue-600 shadow-md"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span>🔥 Streak Belajar</span>
                  </button>

                  <button
                    onClick={() => setActiveCategory("poin")}
                    className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer shrink-0 border ${
                      activeCategory === "poin"
                        ? "bg-blue-600 text-white border-blue-600 shadow-md"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>💎 Poin & Lencana</span>
                  </button>

                  <button
                    onClick={() => setActiveCategory("ai_diagnostic")}
                    className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer shrink-0 border ${
                      activeCategory === "ai_diagnostic"
                        ? "bg-blue-600 text-white border-blue-600 shadow-md"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    <Bot className="w-4 h-4 text-amber-300" />
                    <span>🤖 Diagnostik AI & Remedial</span>
                  </button>
                </div>

                {/* CATEGORY 1: HASIL UJIAN & AKSES DETAIL SOAL */}
                {activeCategory === "ujian" && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="text-xs font-black text-[#0F172A] flex items-center justify-between">
                      <span>Daftar Ujian Siswa ({getExamAttemptsForStudent(selectedStudent).length} Ujian Selesai)</span>
                      <span className="text-[10px] text-slate-400 font-semibold">Klik "Akses Soal" untuk inspeksi jawaban</span>
                    </div>

                    <div className="space-y-3">
                      {getExamAttemptsForStudent(selectedStudent).map((exam) => (
                        <div
                          key={exam.id}
                          className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white transition shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-black text-[#0F172A]">{exam.judulUjian}</h4>
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${exam.status === "Tuntas" ? "bg-emerald-100 text-emerald-900" : "bg-red-100 text-red-900"}`}>
                                {exam.status}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-2">
                              <span>Tanggal: {exam.tanggal}</span>
                              <span>•</span>
                              <span>{exam.soalList.length} Soal Diujikan</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <div className="text-xs text-slate-400 font-bold">Skor Ujian</div>
                              <div className={`text-base font-black ${exam.skorAkhir >= 70 ? "text-emerald-600" : "text-red-600"}`}>
                                {exam.skorAkhir} / 100
                              </div>
                            </div>

                            {/* TOMBOL AKSES DETAIL SOAL & JAWABAN SISWA */}
                            <button
                              onClick={() => setSelectedExam(exam)}
                              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                              <span>Akses Detail Soal & Jawaban</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CATEGORY 2: KUIS & LATIHAN */}
                {activeCategory === "kuis" && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="text-xs font-black text-[#0F172A]">Breakdown Performa Kuis Harian</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="text-xs font-black text-[#0F172A]">Bab 5: SPLDV</div>
                        <div className="text-xs text-slate-500">12 Kuis Dikerjakan • Akurasi 88%</div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full w-[88%]"></div>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="text-xs font-black text-[#0F172A]">Bab 4: Pemfaktoran Kuadrat</div>
                        <div className="text-xs text-slate-500">8 Kuis Dikerjakan • Akurasi 65%</div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full w-[65%]"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* CATEGORY 3: STREAK BELAJAR */}
                {activeCategory === "streak" && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="p-6 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white space-y-3 shadow-md">
                      <div className="flex items-center gap-3">
                        <Flame className="w-8 h-8 fill-white text-white" />
                        <div>
                          <div className="text-lg font-black">{selectedStudent.streakHari} Hari Belajar Berturut-turut!</div>
                          <div className="text-xs opacity-90">Konsistensi belajar harian siswa sangat tinggi.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* CATEGORY 4: POIN & LENCANA */}
                {activeCategory === "poin" && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Award className="w-8 h-8 text-amber-500" />
                        <div>
                          <div className="text-sm font-black text-[#0F172A]">Level 12 — Master Aljabar</div>
                          <div className="text-xs text-slate-500">Total Akumulasi XP: {selectedStudent.poinXP} XP</div>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold px-3 py-1 bg-amber-100 text-amber-900 rounded-full">
                        {selectedStudent.lencanaCount} Lencana Diraih
                      </span>
                    </div>
                  </div>
                )}

                {/* CATEGORY 5: DIAGNOSTIK AI & REMEDIAL */}
                {activeCategory === "ai_diagnostic" && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 space-y-2">
                      <div className="text-xs font-black flex items-center gap-2">
                        <Bot className="w-4 h-4 text-blue-600" />
                        <span>Analisis Diagnostik AI Gemini:</span>
                      </div>
                      <p className="text-xs leading-relaxed">
                        Siswa **{selectedStudent.nama}** menunjukkan pemahaman tinggi pada konsep Pythagoras, namun masih perlu penguatan pada **Pemfaktoran Persamaan Kuadrat**. Rekomendasi 3 soal remedial otomatis.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 text-xs space-y-2 border-2 border-dashed border-slate-200 rounded-3xl">
                <Users className="w-8 h-8 text-slate-300" />
                <p className="font-bold text-[#0F172A]">Pilih nama siswa di sebelah kiri</p>
                <p className="text-[11px]">Laporan Ujian, Kuis, Streak, Poin XP, dan Soal-soal akan ditampilkan di sini</p>
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* MODAL AKSES DETAIL SOAL & JAWABAN SISWA                   */}
        {/* ======================================================== */}
        {selectedExam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-4xl p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto flex flex-col justify-between">
              {/* Modal Header Bar */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shrink-0">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-[#0F172A] text-lg flex items-center gap-2">
                      <span>{selectedExam.judulUjian}</span>
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${selectedExam.status === "Tuntas" ? "bg-emerald-100 text-emerald-900" : "bg-red-100 text-red-900"}`}>
                        Skor: {selectedExam.skorAkhir}/100
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Inspeksi Detail Soal, Kunci Jawaban, Pembahasan KaTeX & Jawaban Siswa
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedExam(null)}
                  className="p-2.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Questions List Body */}
              <div className="space-y-6 flex-1 overflow-y-auto pr-1">
                {selectedExam.soalList.map((q, idx) => (
                  <div key={q.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                      <span className="text-xs font-black text-[#0F172A]">
                        Soal #{idx + 1} ({q.tipeSoal === "pilihan_ganda" ? "Pilihan Ganda" : "Esai Uraian"})
                      </span>
                      <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${q.isBenar ? "bg-emerald-100 text-emerald-900" : "bg-red-100 text-red-900"}`}>
                        {q.isBenar ? "✓ Benar (Nilai: 100)" : "✗ Salah (Nilai: 40)"}
                      </span>
                    </div>

                    {/* Question Text with KaTeX */}
                    <div className="space-y-1">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pertanyaan:</div>
                      <div className="text-xs sm:text-sm font-bold text-[#0F172A]">
                        <MarkdownRenderer content={q.pertanyaan} />
                      </div>
                    </div>

                    {/* Student Answer */}
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Jawaban Siswa:</div>
                      <div className="text-xs font-bold text-[#0F172A]">
                        <MarkdownRenderer content={q.jawabanSiswa} />
                      </div>
                    </div>

                    {/* Key Solution & Pembahasan */}
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                      <div className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <span>Kunci Jawaban & Pembahasan KaTeX:</span>
                      </div>
                      <div className="text-xs text-amber-950 font-medium">
                        <MarkdownRenderer content={q.pembahasan} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 flex justify-end shrink-0">
                <button
                  onClick={() => setSelectedExam(null)}
                  className="px-6 py-2.5 rounded-xl bg-[#0F172A] text-white text-xs font-black hover:bg-slate-800 transition cursor-pointer shadow-md"
                >
                  Tutup Detail Soal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </GuruLayout>
  );
}
