"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronUp,
  BookOpen,
} from "lucide-react";

export interface QuizOption {
  text: string;
  isCorrect: boolean;
  feedback: string;
}

export interface CreativeQuizData {
  title: string;
  scenario: string;
  problem: string;
  conceptTag: string;
  hints: string[];
  options: QuizOption[];
  explanation: string;
}

export interface SubBabCreativeQuizProps {
  babId: string;
  babUrutan: number;
  babJudul: string;
  subBabId: string;
  subBabUrutan: number;
  subBabJudul: string;
  isCompleted?: boolean;
  onComplete?: () => void;
  onAskAiHint?: (prompt: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// REPOSITORY KUIS KREATIF TERPANDU PER SUB-BAB (KURIKULUM MATEMATIKA KELAS 8)
// ─────────────────────────────────────────────────────────────────────────────
function getCreativeQuizData(
  babUrutan: number,
  subBabUrutan: number,
  babJudul: string,
  subBabJudul: string
): CreativeQuizData {
  const bTitle = (babJudul || "").toLowerCase();
  const sTitle = (subBabJudul || "").toLowerCase();

  // 1. BAB BILANGAN BERPANGKAT & BENTUK AKAR
  if (bTitle.includes("berpangkat") || bTitle.includes("akar") || bTitle.includes("eksponen") || babUrutan === 1) {
    if (subBabUrutan === 1 || sTitle.includes("sifat") || sTitle.includes("perkalian") || sTitle.includes("dasar")) {
      return {
        title: "Tantangan Eksponen: Pertumbuhan Koloni Bioteknologi",
        scenario:
          "Sebuah laboratorium bioteknologi meneliti pertumbuhan koloni bakteri. Jumlah bakteri bertambah dengan pola eksponensial. Pada wadah A terdapat 2³ bakteri, dan pada wadah B terdapat 2⁴ bakteri.",
        problem:
          "Jika kedua populasi tersebut dikalikan dalam satu formula terpadu (2³ × 2⁴), bentuk perpangkatan paling sederhana yang menyatakan total perkalian tersebut adalah...",
        conceptTag: "Sifat Perkalian Eksponen (aᵐ × aⁿ = aᵐ⁺ⁿ)",
        hints: [
          "Perhatikan basis dari kedua bilangan: keduanya sama-sama memiliki basis angka 2.",
          "Sesuai hukum perpangkatan, jika basisnya sama dan operasinya dikalikan, maka eksponennya (pangkatnya) dijumlahkan.",
          "Hitung penjumlahan eksponennya: 3 + 4 = 7. Basis tetap 2.",
        ],
        options: [
          {
            text: "2⁷",
            isCorrect: true,
            feedback: "Tepat sekali! Karena basisnya sama (2), pangkatnya dijumlahkan: 3 + 4 = 7.",
          },
          {
            text: "2¹²",
            isCorrect: false,
            feedback: "Hampir tepat! Ingat bahwa pada perkalian basis yang sama, pangkatnya DIJUMLAHKAN (3 + 4), bukan dikalikan (3 × 4).",
          },
          {
            text: "4⁷",
            isCorrect: false,
            feedback: "Perhatikan basisnya: basis tetap angka 2 dan tidak ikut dikalikan menjadi 4. Rumusnya adalah aᵐ × aⁿ = aᵐ⁺ⁿ.",
          },
          {
            text: "4¹²",
            isCorrect: false,
            feedback: "Basis tetap angka 2 dan pangkatnya dijumlahkan, bukan dikalikan.",
          },
        ],
        explanation:
          "Sesuai sifat dasar perpangkatan: aᵐ × aⁿ = aᵐ⁺ⁿ. Pada soal ini, 2³ × 2⁴ = 2³⁺⁴ = 2⁷. Logika penalaranmu sudah sangat runtut!",
      };
    }

    if (subBabUrutan === 2 || sTitle.includes("pecahan") || sTitle.includes("operasi") || sTitle.includes("penyederhanaan")) {
      return {
        title: "Tantangan Geometri: Penggabungan Sisi Taman Miniatur",
        scenario:
          "Dua petak taman berbentuk persegi memiliki panjang sisi masing-masing √12 meter dan √27 meter. Seorang perancang ingin menyambungkan kedua sisi tersebut secara berurutan membentuk satu garis lintasan.",
        problem:
          "Bentuk akar paling sederhana yang menyatakan total panjang gabungan (√12 + √27) meter adalah...",
        conceptTag: "Operasi Penjumlahan & Penyederhanaan Bentuk Akar",
        hints: [
          "Bentuk akar tidak dapat dijumlahkan langsung jika angka di dalam akarnya berbeda (√12 + √27 bukan √39).",
          "Sederhanakan √12 menjadi: √(4 × 3) = √4 × √3 = 2√3.",
          "Sederhanakan √27 menjadi: √(9 × 3) = √9 × √3 = 3√3.",
          "Jumlahkan suku-suku yang sejenis: 2√3 + 3√3 = (2 + 3)√3.",
        ],
        options: [
          {
            text: "5√3 meter",
            isCorrect: true,
            feedback: "Luar biasa! √12 = 2√3 dan √27 = 3√3, sehingga 2√3 + 3√3 = 5√3 meter.",
          },
          {
            text: "√39 meter",
            isCorrect: false,
            feedback: "Hati-hati! √(a) + √(b) tidak sama dengan √(a+b). Angka di dalam akar tidak boleh dijumlahkan langsung.",
          },
          {
            text: "6√3 meter",
            isCorrect: false,
            feedback: "Cek kembali penjumlahan koefisien di depan akarnya: 2 + 3 = 5, bukan 6.",
          },
          {
            text: "5√6 meter",
            isCorrect: false,
            feedback: "Bagian di dalam akar tetap √3 karena sudah sejenis, tidak dijumlahkan menjadi √6.",
          },
        ],
        explanation:
          "Langkah terpandu: Sederhanakan masing-masing akar menjadi suku sejenis: √12 = √(4×3) = 2√3 dan √27 = √(9×3) = 3√3. Maka 2√3 + 3√3 = (2+3)√3 = 5√3 meter.",
      };
    }

    // Sub-bab 3
    return {
      title: "Tantangan Teknik: Standardisasi Rasionalisasi Sirkuit",
      scenario:
        "Seorang insinyur elektronika memperoleh hasil pengukuran impedansi sirkuit sebesar 6/√3 Ohm. Dalam aturan baku rekayasa teknik, nilai penyebut pecahan tidak boleh berupa bentuk irasional (akar).",
      problem:
        "Bentuk rasional yang ekuivalen dari pecahan 6/√3 setelah dirasionalkan penyebutnya adalah...",
      conceptTag: "Merasionalkan Penyebut Pecahan Bentuk Akar",
      hints: [
        "Untuk merasionalkan penyebut bentuk a/√b, kalikan pembilang dan penyebut dengan sekawannya yaitu √b/√b.",
        "Kalikan: (6/√3) × (√3/√3) = (6√3) / (√3 × √3).",
        "Ingat bahwa √3 × √3 = 3. Maka diperoleh pecahan: (6√3) / 3.",
        "Sederhanakan pembagian 6 dibagi 3.",
      ],
      options: [
        {
          text: "2√3 Ohm",
          isCorrect: true,
          feedback: "Sempurna! (6 × √3) / 3 = 2√3 Ohm. Penyebut berhasil dirasionalkan dengan tuntas.",
        },
        {
          text: "3√3 Ohm",
          isCorrect: false,
          feedback: "Periksa kembali pembagian akhirnya: 6 dibagi 3 menghasilkan 2, bukan 3.",
        },
        {
          text: "6√3 Ohm",
          isCorrect: false,
          feedback: "Jangan lupa untuk membagi pembilang dengan penyebutnya (3) setelah dikalikan.",
        },
        {
          text: "2 Ohm",
          isCorrect: false,
          feedback: "Faktor √3 pada pembilang tetap ada, tidak hilang.",
        },
      ],
      explanation:
        "Penyelesaian bertahap: Kalikan dengan √3/√3: (6/√3) × (√3/√3) = (6√3) / 3. Bagi 6 dengan 3 menghasilkan 2√3 Ohm.",
    };
  }

  // 2. BAB TEOREMA PYTHAGORAS
  if (bTitle.includes("pythagoras") || bTitle.includes("pitagoras") || babUrutan === 2) {
    if (subBabUrutan === 1) {
      return {
        title: "Tantangan Konstruksi: Menghitung Ketinggian Tangga",
        scenario:
          "Sebuah tangga pemadam kebakaran yang memiliki panjang 10 meter disandarkan pada dinding gedung. Jarak antara kaki tangga di tanah dengan dasar dinding adalah 6 meter.",
        problem:
          "Dengan menerapkan Teorema Pythagoras (c² = a² + b²), berapakah tinggi dinding yang dicapai oleh puncak tangga tersebut?",
        conceptTag: "Dalil Teorema Pythagoras (b = √(c² - a²))",
        hints: [
          "Tangga berperan sebagai hipotenusa (sisi miring c = 10 meter).",
          "Jarak kaki tangga ke dinding adalah sisi alas (a = 6 meter).",
          "Tinggi dinding adalah sisi tegak (b). Rumusnya: b² = c² - a².",
          "Hitung: b² = 10² - 6² = 100 - 36 = 64. Lalu cari nilai √64.",
        ],
        options: [
          { text: "8 meter", isCorrect: true, feedback: "Tepat sekali! b = √(100 - 36) = √64 = 8 meter." },
          { text: "7 meter", isCorrect: false, feedback: "Periksa kembali akar kuadrat dari 64. 7² = 49, bukan 64." },
          { text: "9 meter", isCorrect: false, feedback: "9² = 81. Nilai yang dicari adalah √64 = 8 meter." },
          { text: "12 meter", isCorrect: false, feedback: "Sisi tegak tidak mungkin lebih panjang dari sisi miring tangga (10 meter)." },
        ],
        explanation:
          "Berdasarkan dalil Pythagoras: b = √(c² - a²) = √(10² - 6²) = √(100 - 36) = √64 = 8 meter.",
      };
    }
    if (subBabUrutan === 2) {
      return {
        title: "Tantangan Pemetaan: Identifikasi Karakter Segitiga",
        scenario:
          "Seorang juru ukur tanah mendata tiga patok batas lahan yang membentuk segitiga dengan panjang sisi masing-masing 7 meter, 24 meter, dan 25 meter.",
        problem:
          "Berdasarkan uji kebalikan dalil Pythagoras, apakah jenis segitiga yang dibentuk oleh ketiga patok lahan tersebut?",
        conceptTag: "Tripel Pythagoras & Uji Kebalikan Teorema",
        hints: [
          "Tentukan sisi terpanjang sebagai c: c = 25 meter. Hitung c² = 25² = 625.",
          "Hitung jumlah kuadrat kedua sisi lainnya: a² + b² = 7² + 24² = 49 + 576 = 625.",
          "Bandingkan nilai c² dengan (a² + b²). Jika c² = a² + b², maka segitiga tersebut adalah segitiga siku-siku.",
        ],
        options: [
          { text: "Segitiga Siku-Siku", isCorrect: true, feedback: "Tepat sekali! Karena 25² = 7² + 24² (625 = 625), segitiga ini terbukti siku-siku." },
          { text: "Segitiga Lancip", isCorrect: false, feedback: "Pada segitiga lancip, c² harus lebih kecil dari a² + b²." },
          { text: "Segitiga Tumpul", isCorrect: false, feedback: "Pada segitiga tumpul, c² harus lebih besar dari a² + b²." },
          { text: "Segitiga Sama Kaki", isCorrect: false, feedback: "Ketiga sisi memiliki panjang berbeda (7, 24, 25) sehingga bukan sama kaki." },
        ],
        explanation:
          "Uji kuadrat: c² = 25² = 625. Jumlah kuadrat sisi lain: 7² + 24² = 49 + 576 = 625. Karena c² = a² + b², maka segitiga tersebut tepat bersudut 90° (siku-siku).",
      };
    }
    return {
      title: "Tantangan Navigasi: Jarak Lintasan Terpendek Kapal",
      scenario:
        "Sebuah kapal patroli berlayar dari dermaga menuju ke arah utara sejauh 12 km, kemudian berbelok tepat ke arah timur sejauh 9 km.",
      problem:
        "Berapakah jarak lurus terpendek kapal tersebut dari dermaga titik awal keberangkatan?",
      conceptTag: "Penerapan Teorema Pythagoras pada Navigasi Riil",
      hints: [
        "Arah utara dan arah timur membentuk sudut saling tegak lurus (90°).",
        "Jarak lurus terpendek adalah garis miring hipotenusa (c).",
        "Gunakan rumus: c = √(12² + 9²) = √(144 + 81) = √225.",
      ],
      options: [
        { text: "15 km", isCorrect: true, feedback: "Hebat! c = √(144 + 81) = √225 = 15 km." },
        { text: "21 km", isCorrect: false, feedback: "21 km adalah jarak tempuh total memutar (12 + 9), bukan jarak lurus terpendek (vektor perpindahan)." },
        { text: "17 km", isCorrect: false, feedback: "17² = 289. Akar dari 225 adalah 15 km." },
        { text: "18 km", isCorrect: false, feedback: "Hitung kembali √225 = 15 km." },
      ],
      explanation:
        "Perpindahan lurus membentuk segitiga siku-siku: Hipotenusa = √(12² + 9²) = √(144 + 81) = √225 = 15 km.",
    };
  }

  // 3. FALLBACK DINAMIS CERDAS BERDASARKAN SUB-BAB JUDUL
  return {
    title: `Tantangan Terpandu: ${subBabJudul || `Pemahaman Sub-Bab ${subBabUrutan}`}`,
    scenario: `Pada sub-bab ini, kita mempelajari konsep fundamental tentang ${subBabJudul}. Pemahaman mendalam diuji melalui penalaran konsep berikut:`,
    problem: `Berdasarkan materi yang telah dipelajari, manakah simpulan konsep dan langkah penalaran yang paling tepat mengenai ${subBabJudul}?`,
    conceptTag: `Prinsip Kunci Sub-Bab ${subBabUrutan}`,
    hints: [
      "Perhatikan kembali definisi utama dan konsep dasar yang diterangkan pada bacaan modul.",
      "Hubungkan relasi sebab-akibat atau formulasi yang digunakan untuk memecahkan masalah ini.",
      "Pilihlah opsi yang memberikan penalaran logis paling runtut dan komprehensif.",
    ],
    options: [
      {
        text: `Menganalisis data permasalahan secara sistematis sesuai kaidah ${subBabJudul}`,
        isCorrect: true,
        feedback: "Tepat sekali! Pemahaman konsepmu terhadap sub-bab ini sudah sangat baik.",
      },
      {
        text: "Menebak hasil tanpa memeriksa keterkaitan antar konsep dasar",
        isCorrect: false,
        feedback: "Konsep ini memerlukan penalaran sistematis, bukan tebakan instan.",
      },
      {
        text: "Mengabaikan definisi dasar dan langsung menghitung secara acak",
        isCorrect: false,
        feedback: "Ingat untuk selalu mendasarkan langkah pada definisi fundamental.",
      },
      {
        text: "Menyimpulkan hasil yang bertentangan dengan dalil materi",
        isCorrect: false,
        feedback: "Periksa kembali dalil konsep yang telah diterangkan di materi atas.",
      },
    ],
    explanation:
      `Dengan memahami prinsip ${subBabJudul}, kamu dapat menyelesaikan soal-soal lanjutan secara sistematis dan percaya diri!`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// KOMPONEN UTAMA KUIS KREATIF TERPANDU
// ─────────────────────────────────────────────────────────────────────────────
export default function SubBabCreativeQuiz({
  babId,
  babUrutan,
  babJudul,
  subBabId,
  subBabUrutan,
  subBabJudul,
  isCompleted = false,
  onComplete,
  onAskAiHint,
}: SubBabCreativeQuizProps) {
  const quiz = getCreativeQuizData(babUrutan, subBabUrutan, babJudul, subBabJudul);

  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [revealedHintCount, setRevealedHintCount] = useState(1);
  const [solved, setSolved] = useState(isCompleted);

  // Load status tersimpan dari localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const key = `thinksy_subbab_quiz_${babId}_${subBabId}`;
        const saved = localStorage.getItem(key);
        if (saved === "completed" || isCompleted) {
          setSolved(true);
          setIsCorrect(true);
        }
      } catch {}
    }
  }, [babId, subBabId, isCompleted]);

  const handleSelectOption = (idx: number) => {
    setSelectedIdx(idx);
    const option = quiz.options[idx];
    setIsAnswered(true);

    if (option.isCorrect) {
      setIsCorrect(true);
      setSolved(true);
      try {
        localStorage.setItem(`thinksy_subbab_quiz_${babId}_${subBabId}`, "completed");
      } catch {}
      if (onComplete) {
        onComplete();
      }
    } else {
      setIsCorrect(false);
    }
  };

  const handleReset = () => {
    setSelectedIdx(null);
    setIsAnswered(false);
    setIsCorrect(false);
  };

  return (
    <div className="mt-8 pt-6 border-t-2 border-dashed border-blue-200/80 dark:border-slate-800">
      <div className="rounded-2xl border border-blue-200/90 dark:border-blue-900/40 bg-linear-to-b from-blue-50/50 via-white to-slate-50/40 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-slate-900/80 p-5 sm:p-6 shadow-xs transition-all">
        {/* Header Kuis */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-blue-100 dark:border-slate-800">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            {quiz.title}
          </h3>

          {solved && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-bold border border-emerald-300/60">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Sub-Bab Selesai Dipahami</span>
            </span>
          )}
        </div>

        {/* Konteks Studi Kasus & Pertanyaan */}
        <div className="py-4 space-y-3">
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            <span className="font-bold text-blue-700 dark:text-blue-400 mr-1.5">📖 Kasus Nyata:</span>
            {quiz.scenario}
          </div>

          <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
            {quiz.problem}
          </div>
        </div>

        {/* Section Bantuan: Petunjuk Penalaran Bertahap */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowHints(!showHints)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-400 hover:text-blue-800 py-1.5 px-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/50 hover:bg-blue-100 transition cursor-pointer border border-blue-200/60 dark:border-blue-800/50"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>{showHints ? "Tutup Petunjuk Penalaran" : "💡 Butuh Bantuan? Buka Petunjuk Bertahap"}</span>
            {showHints ? <ChevronUp className="w-3.5 h-3.5 ml-0.5" /> : <ChevronDown className="w-3.5 h-3.5 ml-0.5" />}
          </button>

          {showHints && (
            <div className="mt-2.5 p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 space-y-2.5 text-xs animate-in fade-in duration-150">
              <div className="font-bold text-amber-900 dark:text-amber-300 flex items-center justify-between">
                <span>Panduan Berpikir Langkah demi Langkah:</span>
                <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                  Petunjuk 1 sampai {revealedHintCount} dari {quiz.hints.length}
                </span>
              </div>

              <div className="space-y-1.5">
                {quiz.hints.slice(0, revealedHintCount).map((hint, hIdx) => (
                  <div key={hIdx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {hIdx + 1}
                    </span>
                    <p className="leading-relaxed">{hint}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-amber-200/60 dark:border-amber-900/40">
                {revealedHintCount < quiz.hints.length && (
                  <button
                    type="button"
                    onClick={() => setRevealedHintCount((prev) => Math.min(quiz.hints.length, prev + 1))}
                    className="text-[11px] font-bold text-amber-800 dark:text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Buka Langkah Petunjuk Berikutnya ({revealedHintCount + 1}) →</span>
                  </button>
                )}

                {onAskAiHint && (
                  <button
                    type="button"
                    onClick={() =>
                      onAskAiHint(
                        `Tolong beri panduan berpikir sokratik langkah demi langkah untuk memecahkan kuis sub-bab ${subBabUrutan}: "${quiz.problem}". Jangan langsung berikan jawaban akhir, bimbing saya memahami konsep dasarnya.`
                      )
                    }
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-blue-500" />
                    <span>Tanya Asisten AI Sokratik</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Pilihan Jawaban Interaktif */}
        <div className="space-y-2.5">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Pilihlah jawaban yang paling tepat:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {quiz.options.map((opt, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const isThisSelected = selectedIdx === idx;

              let btnStyle =
                "bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-blue-400 hover:bg-blue-50/40 dark:hover:bg-slate-700";

              if (isThisSelected) {
                if (opt.isCorrect) {
                  btnStyle =
                    "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-400/30 font-bold";
                } else {
                  btnStyle =
                    "bg-rose-50 dark:bg-rose-950/40 border-rose-400 text-rose-900 dark:text-rose-100 ring-2 ring-rose-400/20";
                }
              } else if (isAnswered && opt.isCorrect && solved) {
                btnStyle =
                  "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 text-emerald-800 dark:text-emerald-200";
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(idx)}
                  className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 cursor-pointer shadow-2xs ${btnStyle}`}
                >
                  <span
                    className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                      isThisSelected && opt.isCorrect
                        ? "bg-emerald-600 text-white"
                        : isThisSelected && !opt.isCorrect
                        ? "bg-rose-600 text-white"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {isThisSelected && opt.isCorrect ? <Check className="w-3.5 h-3.5" /> : letter}
                  </span>
                  <span className="text-xs font-medium leading-snug pt-0.5">{opt.text}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Umpan Balik / Feedback Terpandu */}
        {isAnswered && selectedIdx !== null && (
          <div className="mt-4 animate-in fade-in duration-200">
            {quiz.options[selectedIdx].isCorrect ? (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-100 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Hebat! Penalaranmu Benar & Tepat!</span>
                </div>
                <p className="leading-relaxed">{quiz.explanation}</p>
                <div className="pt-2 flex items-center justify-between text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  <span>✓ Sub-bab ini telah berhasil kamu pahami dengan tuntas.</span>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="underline hover:text-emerald-900 cursor-pointer"
                  >
                    Coba Latihan Lagi
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-100 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  <span>Petunjuk Bimbingan Berpikir:</span>
                </div>
                <p className="leading-relaxed">{quiz.options[selectedIdx].feedback}</p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 py-1 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] transition cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Coba Pikirkan & Pilih Ulang</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
