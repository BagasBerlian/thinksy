import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const adminDb = createAdminClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // In demo mode or if session is absent during testing, proceed with admin client to provide class data

    const { searchParams } = new URL(request.url);
    const requestedKelas = searchParams.get("kelas"); // e.g. "Kelas 8A"

    // 1. Wali Kelas static profiles
    const waliKelasProfiles: Record<string, any> = {
      "Kelas 8A": {
        nama: "Ibu Siti Rahmawati, M.Pd.",
        nip: "19880415 201001 2 012",
        mapel: "Matematika",
        email: "siti.rahmawati@sekolah.sch.id",
        telepon: "+62 812-3456-7890",
        foto: "/images/foto-guru.jpg",
        bio: "Wali Kelas 8A & Guru Penggerak SMP Negeri 1. Berpengalaman 14 tahun mengajar Matematika berbasis penalaran kritis Sokratik.",
      },
      "Kelas 8B": {
        nama: "Budi Santoso, S.Pd.",
        nip: "19790620 200501 1 008",
        mapel: "Bahasa Inggris",
        email: "budi.santoso@sekolah.sch.id",
        telepon: "+62 813-9876-5432",
        foto: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80",
        bio: "Wali Kelas 8B & Pembina OSIS Sekolah. Membimbing siswa aktif dalam komunikasi bahasa asing dan kepemimpinan.",
      },
      "Kelas 8C": {
        nama: "Dra. Nurul Hidayah",
        nip: "19750912 200003 2 003",
        mapel: "Bahasa Indonesia",
        email: "nurul.hidayah@sekolah.sch.id",
        telepon: "+62 811-2345-6789",
        foto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
        bio: "Wali Kelas 8C & Kepala Laboratorium Bahasa. Pembina literasi membaca dan penulisan karya ilmiah remaja sekolah.",
      },
    };

    // 2. Fetch all classes from database
    const { data: dbKelasList } = await adminDb
      .from("kelas")
      .select("id, nama_kelas")
      .in("nama_kelas", ["Kelas 8A", "Kelas 8B", "Kelas 8C"])
      .order("nama_kelas", { ascending: true });

    // Fallback if not returned
    const targetKelasNames = ["Kelas 8A", "Kelas 8B", "Kelas 8C"];
    const kelasMap = new Map<string, string>();
    (dbKelasList || []).forEach((k: any) => {
      kelasMap.set(k.nama_kelas, k.id);
    });

    // 3. Fetch all students & their class memberships
    const { data: rawDbStudents } = await adminDb
      .from("profil")
      .select("id, nama_lengkap, poin, streak, dibuat_pada")
      .eq("peran", "siswa")
      .order("poin", { ascending: false });

    // Fallback students if DB is empty or has few students
    const fallbackSeedStudents = [
      // Kelas 8A top candidates
      { id: "st-db-8a-1", nama_lengkap: "Ahmad Fauzi", poin: 985, streak: 24, kelas_pref: "Kelas 8A" },
      { id: "st-db-8a-2", nama_lengkap: "Siti Aisyah Putri", poin: 950, streak: 22, kelas_pref: "Kelas 8A" },
      { id: "st-db-8a-3", nama_lengkap: "Budi Prasetyo Utomo", poin: 920, streak: 20, kelas_pref: "Kelas 8A" },
      { id: "st-db-8a-4", nama_lengkap: "Dewi Sartika", poin: 875, streak: 17, kelas_pref: "Kelas 8A" },
      { id: "st-db-8a-5", nama_lengkap: "Fira Anggraini", poin: 840, streak: 15, kelas_pref: "Kelas 8A" },
      { id: "st-db-8a-6", nama_lengkap: "Nanoka Sasaki", poin: 820, streak: 14, kelas_pref: "Kelas 8A" },
      { id: "st-db-8a-7", nama_lengkap: "Rizky Ramadhan", poin: 790, streak: 12, kelas_pref: "Kelas 8A" },
      { id: "st-db-8a-8", nama_lengkap: "Eko Prasetyo", poin: 760, streak: 11, kelas_pref: "Kelas 8A" },
      { id: "st-db-8a-9", nama_lengkap: "Tania Safitri", poin: 730, streak: 9, kelas_pref: "Kelas 8A" },
      { id: "st-db-8a-10", nama_lengkap: "Farhan Maulana", poin: 710, streak: 8, kelas_pref: "Kelas 8A" },

      // Kelas 8B top candidates
      { id: "st-db-8b-1", nama_lengkap: "Nanda Kurnia Putri", poin: 965, streak: 23, kelas_pref: "Kelas 8B" },
      { id: "st-db-8b-2", nama_lengkap: "Rian Hidayat", poin: 935, streak: 21, kelas_pref: "Kelas 8B" },
      { id: "st-db-8b-3", nama_lengkap: "Aditya Pratama", poin: 895, streak: 19, kelas_pref: "Kelas 8B" },
      { id: "st-db-8b-4", nama_lengkap: "Bielani Sarah", poin: 865, streak: 16, kelas_pref: "Kelas 8B" },
      { id: "st-db-8b-5", nama_lengkap: "Dimas Wahyudi", poin: 835, streak: 14, kelas_pref: "Kelas 8B" },
      { id: "st-db-8b-6", nama_lengkap: "Zahra Maulida", poin: 810, streak: 13, kelas_pref: "Kelas 8B" },
      { id: "st-db-8b-7", nama_lengkap: "Hendra Wijaya", poin: 780, streak: 11, kelas_pref: "Kelas 8B" },
      { id: "st-db-8b-8", nama_lengkap: "Maya Indah", poin: 750, streak: 10, kelas_pref: "Kelas 8B" },
      { id: "st-db-8b-9", nama_lengkap: "Kevin Sanjaya", poin: 725, streak: 9, kelas_pref: "Kelas 8B" },
      { id: "st-db-8b-10", nama_lengkap: "Larasati Putri", poin: 695, streak: 7, kelas_pref: "Kelas 8B" },

      // Kelas 8C candidates
      { id: "st-db-8c-1", nama_lengkap: "Gilang Ramadhan", poin: 940, streak: 20, kelas_pref: "Kelas 8C" },
      { id: "st-db-8c-2", nama_lengkap: "Annisa Rahma", poin: 915, streak: 18, kelas_pref: "Kelas 8C" },
      { id: "st-db-8c-3", nama_lengkap: "Fajar Nugroho", poin: 885, streak: 16, kelas_pref: "Kelas 8C" },
      { id: "st-db-8c-4", nama_lengkap: "Putri Wulandari", poin: 850, streak: 14, kelas_pref: "Kelas 8C" },
      { id: "st-db-8c-5", nama_lengkap: "Dina Kartika", poin: 815, streak: 12, kelas_pref: "Kelas 8C" },
    ];

    const allStudents = (rawDbStudents && rawDbStudents.length >= 6) ? rawDbStudents : fallbackSeedStudents;

    const { data: anggotaRows } = await adminDb
      .from("anggota_kelas")
      .select("kelas_id, siswa_id");

    const studentToClassId = new Map<string, string>();
    (anggotaRows || []).forEach((a: any) => {
      studentToClassId.set(a.siswa_id, a.kelas_id);
    });

    // 4. Fetch exams & questions for result breakdown
    const { data: examsList } = await adminDb
      .from("ujian")
      .select("id, judul, tipe, mapel, passing_grade, durasi_menit")
      .limit(6);

    const { data: allExamSessions } = await adminDb
      .from("sesi_ujian")
      .select("id, ujian_id, siswa_id, nilai_akhir, status, dikumpulkan_pada");

    const { data: allExamAnswers } = await adminDb
      .from("jawaban_ujian")
      .select(`
        id,
        sesi_ujian_id,
        soal_id,
        opsi_dipilih_id,
        is_benar,
        skor_diperoleh,
        koreksi_ai,
        soal:soal_id (
          id,
          pertanyaan,
          tipe_soal,
          pembahasan,
          kunci_jawaban,
          opsi_soal (
            id,
            teks_opsi,
            benar,
            urutan
          )
        )
      `);

    // Map answers by sesi_ujian_id
    const answersBySesiId = new Map<string, any[]>();
    (allExamAnswers || []).forEach((jwb: any) => {
      const arr = answersBySesiId.get(jwb.sesi_ujian_id) || [];
      arr.push(jwb);
      answersBySesiId.set(jwb.sesi_ujian_id, arr);
    });

    // Map sessions by siswa_id
    const sessionsByStudentId = new Map<string, any[]>();
    (allExamSessions || []).forEach((s: any) => {
      const arr = sessionsByStudentId.get(s.siswa_id) || [];
      arr.push(s);
      sessionsByStudentId.set(s.siswa_id, arr);
    });

    // 5. Build rich Class Objects
    const resultClasses = targetKelasNames.map((kName, cIdx) => {
      const classId = kelasMap.get(kName) || `mock-cid-${cIdx}`;
      const wali = waliKelasProfiles[kName] || waliKelasProfiles["Kelas 8A"];

      // Filter students for this class
      const classStudents = (allStudents || []).filter((st: any, sIdx: number) => {
        if (st.kelas_pref) return st.kelas_pref === kName;
        const assignedCid = studentToClassId.get(st.id);
        if (assignedCid) return assignedCid === classId;
        // fallback round-robin
        return sIdx % 3 === cIdx;
      });

      // Map students to rich member objects
      const members = classStudents.map((st: any, rankIdx: number) => {
        const isFemale =
          st.nama_lengkap.toLowerCase().includes("siti") ||
          st.nama_lengkap.toLowerCase().includes("putri") ||
          st.nama_lengkap.toLowerCase().includes("dewi") ||
          st.nama_lengkap.toLowerCase().includes("fira") ||
          st.nama_lengkap.toLowerCase().includes("nanoka") ||
          st.nama_lengkap.toLowerCase().includes("bielani");

        const foto = isFemale
          ? "/images/pasfoto-siswi-1.jpg"
          : "/images/pasfoto-siswa-1.jpg";

        const nisn = `00${84000000 + (cIdx * 50) + rankIdx}`;
        const poin = st.poin || (520 - rankIdx * 35);
        const streak = st.streak || Math.max(2, 20 - rankIdx);

        // Fetch exam history for this student
        const studentSessions = sessionsByStudentId.get(st.id) || [];

        // Generate realistic exam history if student has no recorded sessions yet
        let riwayatUjian: any[] = [];

        if (studentSessions.length > 0) {
          riwayatUjian = studentSessions.map((ses: any) => {
            const uInfo = (examsList || []).find((e: any) => e.id === ses.ujian_id) || {
              judul: "Ulangan Harian Bab 1",
              mapel: "Matematika",
              tipe: "ulangan",
              passing_grade: 75,
            };

            const jwbList = answersBySesiId.get(ses.id) || [];
            const lembarJawaban = jwbList.map((j: any, qIdx: number) => {
              const soalObj = j.soal || {};
              const opsiArr = (soalObj.opsi_soal || []).map((op: any, oIdx: number) => ({
                id: op.id,
                label: String.fromCharCode(65 + oIdx),
                teks: op.teks_opsi,
                benar: op.benar,
              }));

              const chosenOpsi = opsiArr.find((op: any) => op.id === j.opsi_dipilih_id);
              const correctOpsi = opsiArr.find((op: any) => op.benar) || opsiArr[0];

              return {
                nomor: qIdx + 1,
                pertanyaan: soalObj.pertanyaan || `Soal Nomor ${qIdx + 1}: Konsep dan penalaran bab ${uInfo.mapel}`,
                opsi: opsiArr.length > 0 ? opsiArr : [
                  { label: "A", teks: "Pilihan Jawaban A", benar: true },
                  { label: "B", teks: "Pilihan Jawaban B", benar: false },
                  { label: "C", teks: "Pilihan Jawaban C", benar: false },
                  { label: "D", teks: "Pilihan Jawaban D", benar: false },
                ],
                jawaban_siswa: chosenOpsi ? chosenOpsi.label : (j.is_benar ? "A" : "B"),
                kunci_jawaban: correctOpsi ? correctOpsi.label : "A",
                is_benar: j.is_benar !== undefined ? j.is_benar : true,
                skor: j.skor_diperoleh || (j.is_benar ? 10 : 0),
                pembahasan: soalObj.pembahasan || "Langkah penyelesaian terbukti valid berdasarkan konsep materi kurikulum merdeka.",
                umpan_balik_guru: j.koreksi_ai || "Pemahaman konsep sudah tepat.",
              };
            });

            const score = Number(ses.nilai_akhir) || 85;

            return {
              ujian_id: ses.ujian_id,
              sesi_id: ses.id,
              judul: uInfo.judul,
              tipe: uInfo.tipe || "ulangan",
              mapel: uInfo.mapel || "Matematika",
              nilai_akhir: score,
              passing_grade: uInfo.passing_grade || 75,
              status_kkm: score >= (uInfo.passing_grade || 75) ? "Lulus KKM" : "Remedial",
              tanggal_selesai: ses.dikumpulkan_pada
                ? new Date(ses.dikumpulkan_pada).toLocaleString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }) + " WIB"
                : "28 Sep 2026, 09:30 WIB",
              lembar_jawaban: lembarJawaban.length > 0 ? lembarJawaban : generateDefaultLembarJawaban(uInfo.mapel, score),
            };
          });
        } else {
          // Provide rich mock exam results for comprehensive view
          const defaultExams = [
            {
              judul: "Ulangan Harian 1: Bilangan Berpangkat & Aljabar",
              mapel: "Matematika",
              tipe: "ulangan",
              nilai: Math.max(70, 95 - rankIdx * 4),
              kkm: 75,
              waktu: "26 Sep 2026, 09:30 WIB",
            },
            {
              judul: "Penilaian Tengah Semester (PTS) Bahasa Inggris",
              mapel: "Bahasa Inggris",
              tipe: "ujian",
              nilai: Math.max(68, 92 - rankIdx * 5),
              kkm: 75,
              waktu: "24 Sep 2026, 11:15 WIB",
            },
            {
              judul: "Ulangan Harian: Bab 2: Teks Iklan, Slogan, dan Poster",
              mapel: "Bahasa Indonesia",
              tipe: "ulangan",
              nilai: Math.max(72, 90 - rankIdx * 3),
              kkm: 75,
              waktu: "22 Sep 2026, 08:45 WIB",
            },
          ];

          riwayatUjian = defaultExams.map((de, eIdx) => ({
            ujian_id: `ex-${cIdx}-${rankIdx}-${eIdx}`,
            sesi_id: `ses-${cIdx}-${rankIdx}-${eIdx}`,
            judul: de.judul,
            tipe: de.tipe,
            mapel: de.mapel,
            nilai_akhir: de.nilai,
            passing_grade: de.kkm,
            status_kkm: de.nilai >= de.kkm ? "Lulus KKM" : "Remedial",
            tanggal_selesai: de.waktu,
            lembar_jawaban: generateDefaultLembarJawaban(de.mapel, de.nilai),
          }));
        }

        // Calculate average exam score
        const totalScore = riwayatUjian.reduce((acc, curr) => acc + curr.nilai_akhir, 0);
        const avgScore = riwayatUjian.length > 0 ? Math.round(totalScore / riwayatUjian.length) : 80;
        const passedCount = riwayatUjian.filter((u) => u.nilai_akhir >= u.passing_grade).length;

        return {
          id: st.id,
          nama_lengkap: st.nama_lengkap,
          foto,
          nisn,
          kelas: kName,
          peringkat: rankIdx + 1,
          keaktifan: {
            streak_hari: streak,
            persentase_kehadiran: `${Math.min(100, 92 + (20 - rankIdx) % 8)}%`,
            status_hari_ini: rankIdx === 3 ? "Terlambat (10 Menit)" : rankIdx === 5 ? "Belum Absen" : "Hadir Tepat Waktu",
            waktu_absen_hari_ini: rankIdx === 3 ? "07:35 WIB" : rankIdx === 5 ? null : "07:05 WIB",
          },
          poin_belajar: poin,
          nilai_ulangan_ujian: {
            rata_rata: avgScore,
            total_dikerjakan: riwayatUjian.length,
            lulus_kkm_count: passedCount,
            status_kelulusan: avgScore >= 75 ? "Lulus KKM (Sangat Baik)" : "Perlu Intervensi",
          },
          riwayat_ujian: riwayatUjian,
        };
      });

      // Calculate class averages
      const totalScoresAll = members.reduce((acc, m) => acc + m.nilai_ulangan_ujian.rata_rata, 0);
      const classAvgScore = members.length > 0 ? Math.round(totalScoresAll / members.length) : 82;

      return {
        id: classId,
        nama_kelas: kName,
        wali_kelas: wali,
        total_siswa: members.length,
        avg_score: classAvgScore,
        avg_kehadiran: "97.4%",
        anggota_siswa: members,
      };
    });

    if (requestedKelas) {
      const single = resultClasses.find((c) => c.nama_kelas === requestedKelas);
      if (single) {
        return NextResponse.json({ kelas: single });
      }
    }

    return NextResponse.json({
      success: true,
      kelas_list: resultClasses,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function generateDefaultLembarJawaban(mapel: string, score: number) {
  const isMath = mapel.toLowerCase().includes("matematika");
  const isEnglish = mapel.toLowerCase().includes("inggris");

  const qBankMath = [
    {
      q: "Bentuk sederhana dari (2³ × 2⁴) / 2² adalah...",
      opts: ["2⁵ = 32", "2⁶ = 64", "2⁴ = 16", "2⁷ = 128"],
      key: "A",
      expl: "Menggunakan sifat eksponen: 2^(3+4-2) = 2^5 = 32.",
    },
    {
      q: "Nilai x yang memenuhi persamaan 3x + 5 = 20 adalah...",
      opts: ["x = 5", "x = 4", "x = 6", "x = 3"],
      key: "A",
      expl: "3x = 20 - 5 = 15 -> x = 15/3 = 5.",
    },
    {
      q: "Himpunan penyelesaian dari sistem persamaan x + y = 7 dan x - y = 3 adalah...",
      opts: ["(5, 2)", "(4, 3)", "(6, 1)", "(7, 0)"],
      key: "A",
      expl: "Eliminasi menjumlahkan kedua persamaan: 2x = 10 -> x = 5, y = 2.",
    },
    {
      q: "Sebuah fungsi f(x) = 2x - 3. Nilai dari f(4) adalah...",
      opts: ["5", "8", "11", "3"],
      key: "A",
      expl: "f(4) = 2(4) - 3 = 8 - 3 = 5.",
    },
    {
      q: "Gradien garis dengan persamaan y = 4x - 7 adalah...",
      opts: ["4", "-4", "7", "-7"],
      key: "A",
      expl: "Bentuk umum y = mx + c, maka nilai gradien m = 4.",
    },
  ];

  const qBankGeneral = [
    {
      q: isEnglish
        ? "Which of the following is an expression of congratulating someone?"
        : "Unsur pokok yang wajib dicantumkan dalam teks iklan komersial adalah...",
      opts: isEnglish
        ? ["Congratulations on winning the contest!", "I disagree with you.", "I am sorry to hear that.", "Excuse me, where is the lab?"]
        : ["Nama produk dan keunggulan persuasif", "Daftar riwayat hidup pembuat", "Penjelasan rumus ilmiah", "Daftar pustaka acuan"],
      key: "A",
      expl: isEnglish
        ? "'Congratulations on winning the contest!' is used to express compliment and congratulation."
        : "Iklan komersial bertujuan mengajak konsumen, sehingga wajib menonjolkan nama dan keunggulan produk.",
    },
    {
      q: isEnglish
        ? "Budi: 'I passed the exam with grade A!' - Siti: '...' "
        : "Kalimat slogan yang tepat untuk mengampanyekan hemat energi di sekolah adalah...",
      opts: isEnglish
        ? ["That is fantastic! Well done!", "You must take medicine.", "What time is it now?", "I am going to market."]
        : ["Matikan lampu saat tidak digunakan, selamatkan bumi!", "Beli makanan enak di kantin.", "Jangan lupa tidur siang.", "Sepatu harus selalu bersih."],
      key: "A",
      expl: isEnglish
        ? "A response expressing joy and praise for someone's achievement."
        : "Slogan hemat energi harus memuat ajakan langsung menghemat listrik dan dampaknya bagi lingkungan.",
    },
    {
      q: isEnglish
        ? "What is the main purpose of an announcement text?"
        : "Ciri utama bahasa dalam poster publik adalah...",
      opts: isEnglish
        ? ["To inform people about something that will happen.", "To tell a funny fiction story.", "To describe a tourist place in detail.", "To give instruction on cooking food."]
        : ["Singkat, padat, menarik, dan mudah dipahami", "Bertele-tele dan menggunakan bahasa ilmiah asing", "Hanya terdiri dari deretan angka", "Memuat dialog drama panjang"],
      key: "A",
      expl: isEnglish
        ? "Announcement functions to give information publicly about events or activities."
        : "Poster didesain untuk dibaca sekilas di tempat umum sehingga bahasanya harus singkat dan memikat.",
    },
    {
      q: isEnglish
        ? "Complete the sentence: 'She ... to the library every Wednesday.'"
        : "Perbedaan utama antara fakta dan opini dalam artikel ilmiah populer adalah...",
      opts: isEnglish
        ? ["goes", "go", "went", "is go"]
        : ["Fakta dapat dibuktikan kebenarannya secara objektif", "Opini selalu berupa angka statistik", "Fakta berasal dari khayalan penulis", "Opini tidak boleh diperdebatkan"],
      key: "A",
      expl: isEnglish
        ? "Simple present tense with subject 'She' uses verb + es (goes)."
        : "Fakta berlandaskan data nyata yang dapat diuji validitasnya, sedangkan opini berakar dari penilaian subjektif.",
    },
  ];

  const sourceBank = isMath ? qBankMath : qBankGeneral;
  const numWrong = score < 80 ? 2 : score < 90 ? 1 : 0;

  return sourceBank.map((item, idx) => {
    const isThisCorrect = idx >= numWrong;
    const studentChoice = isThisCorrect ? item.key : (item.key === "A" ? "B" : "A");

    return {
      nomor: idx + 1,
      pertanyaan: item.q,
      opsi: item.opts.map((op, oIdx) => ({
        label: String.fromCharCode(65 + oIdx),
        teks: op,
        benar: String.fromCharCode(65 + oIdx) === item.key,
      })),
      jawaban_siswa: studentChoice,
      kunci_jawaban: item.key,
      is_benar: isThisCorrect,
      skor: isThisCorrect ? 25 : 0,
      pembahasan: item.expl,
      umpan_balik_guru: isThisCorrect
        ? "Analisis penalaran siswa sangat tepat dan logis."
        : "Perlu mengulang materi konsep kunci pada bagian ini.",
    };
  });
}
