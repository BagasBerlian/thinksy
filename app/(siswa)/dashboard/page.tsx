import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import StudentDashboardClient from "./StudentDashboardClient";

export default async function SiswaDashboardPage() {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  // 1. Get current authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Default User Profile
  let userProfile = {
    nama_lengkap: "Budi Kartika",
    email: "budi.kartika@sekolah.sch.id",
    peran: "siswa",
    poin: 0,
    streak: 0,
    rank: 3,
    totalStudents: 120,
    isCheckedIn: false,
    checkInTime: null as string | null,
    fotoSelfie: null as string | null,
  };

  let completedQuizCount = 0;
  let answeredSoalCount = 0;
  let totalSoalCount = 0;
  let learningProgressPercent = 0;

  let sekolahData: {
    id: string;
    nama: string;
    motto?: string | null;
    deskripsi?: string | null;
    bg_image_url?: string | null;
    links?: { label: string; url: string; icon?: string }[] | null;
    alamat?: string | null;
    npsn?: string | null;
  } | null = null;

  if (user) {
    // Get user profile data
    const { data: profil } = await supabase
      .from("profil")
      .select("nama_lengkap, peran, poin, streak, sekolah_id")
      .eq("id", user.id)
      .single();

    if (profil?.sekolah_id) {
      const { data: sek } = await supabase
        .from("sekolah")
        .select("id, nama, motto, deskripsi, bg_image_url, links, alamat, npsn")
        .eq("id", profil.sekolah_id)
        .single();

      if (sek) {
        let parsedLinks = [];
        if (typeof sek.links === "string") {
          try {
            parsedLinks = JSON.parse(sek.links);
          } catch {}
        } else if (Array.isArray(sek.links)) {
          parsedLinks = sek.links;
        }

        sekolahData = {
          id: sek.id,
          nama: sek.nama,
          motto: sek.motto,
          deskripsi: sek.deskripsi,
          bg_image_url: sek.bg_image_url,
          links: parsedLinks,
          alamat: sek.alamat,
          npsn: sek.npsn,
        };
      }
    }

    const currentPoin = profil?.poin ?? 0;
    const currentStreak = profil?.streak ?? 0;

    // Calculate completed quiz count (status_sesi = 'selesai')
    const { count: quizDoneCount } = await supabase
      .from("sesi")
      .select("id", { count: "exact", head: true })
      .eq("siswa_id", user.id)
      .eq("status_sesi", "selesai");

    completedQuizCount = quizDoneCount || 0;

    // Calculate dynamic student rank among ALL users with peran = 'siswa' sorted by learning points
    let { data: allStudents } = await adminSupabase
      .from("profil")
      .select("id, poin")
      .eq("peran", "siswa")
      .order("poin", { ascending: false })
      .order("dibuat_pada", { ascending: true });

    if (!allStudents || allStudents.length <= 1) {
      const fallbackAll = await supabase
        .from("profil")
        .select("id, poin")
        .eq("peran", "siswa")
        .order("poin", { ascending: false })
        .order("dibuat_pada", { ascending: true });

      if (fallbackAll.data && fallbackAll.data.length > 0) {
        allStudents = fallbackAll.data;
      }
    }

    const totalSiswaCount = allStudents?.length || 1;
    const studentIndex = allStudents?.findIndex((s) => s.id === user.id) ?? -1;
    const studentRank = studentIndex >= 0 ? studentIndex + 1 : 1;

    // Calculate Learning Progress from answered questions vs total published questions in DB via secure view
    const { count: dbTotalSoal } = await supabase
      .from("soal_publik")
      .select("id", { count: "exact", head: true });

    totalSoalCount = dbTotalSoal || 10;

    const { data: answeredRows } = await adminSupabase
      .from("jawaban")
      .select("soal_id, sesi!inner(siswa_id)")
      .eq("sesi.siswa_id", user.id);

    const answeredSet = new Set(answeredRows?.map((r: any) => r.soal_id));
    answeredSoalCount = answeredSet.size;

    if (totalSoalCount > 0) {
      learningProgressPercent = Math.min(
        100,
        Math.round((answeredSoalCount / totalSoalCount) * 100)
      );
    }

    // Check today's attendance status
    const formattedDate = new Date().toISOString().split("T")[0];
    const { data: presensiToday } = await supabase
      .from("presensi")
      .select("waktu_masuk, foto_url, status")
      .eq("siswa_id", user.id)
      .eq("tanggal", formattedDate)
      .maybeSingle();

    let isCheckedIn = false;
    let checkInTime = null;
    let fotoSelfie = null;

    if (presensiToday) {
      isCheckedIn = true;
      checkInTime = new Date(presensiToday.waktu_masuk).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
      fotoSelfie = presensiToday.foto_url || null;
    }

    userProfile = {
      nama_lengkap: profil?.nama_lengkap || user.email?.split("@")[0] || "Budi Kartika",
      email: user.email || "budi.kartika@sekolah.sch.id",
      peran: profil?.peran || "siswa",
      poin: currentPoin,
      streak: currentStreak,
      rank: studentRank,
      totalStudents: totalSiswaCount,
      isCheckedIn,
      checkInTime,
      fotoSelfie,
    };
  }

  // 2. Fetch Agenda & Tenggat Waktu (Deadlines)
  let deadlines = [
    {
      id: "a1",
      title: "Kuis Matematika Bab 1: Pola Bilangan",
      desc: "Selesai pukul 23:59 WIB",
      dayBadge: "HARI INI",
      dateNum: "15",
      badgeColor: "bg-red-100 text-red-700 border-red-200",
      iconColor: "text-red-500",
      urgency: "Mendesak",
    },
    {
      id: "a2",
      title: "Tugas Matematika: Latihan Pythagoras",
      desc: "Selesai pukul 12:00 WIB",
      dayBadge: "BESOK",
      dateNum: "16",
      badgeColor: "bg-blue-100 text-blue-700 border-blue-200",
      iconColor: "text-blue-500",
      urgency: "Tugas",
    },
  ];

  if (user) {
    const { data: dbDeadlines } = await supabase
      .from("agenda_tugas")
      .select("id, judul, deskripsi, tenggat_waktu, kategori, tingkat_urgensi")
      .or(`siswa_id.eq.${user.id},siswa_id.is.null`)
      .gt("tenggat_waktu", new Date().toISOString())
      .order("tenggat_waktu", { ascending: true })
      .limit(5);

    if (dbDeadlines && dbDeadlines.length > 0) {
      deadlines = dbDeadlines.map((d) => {
        const dt = new Date(d.tenggat_waktu);
        const isToday = dt.toDateString() === new Date().toDateString();
        return {
          id: d.id,
          title: d.judul,
          desc: d.deskripsi || `Selesai ${dt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB`,
          dayBadge: isToday ? "HARI INI" : "MENDATANG",
          dateNum: String(dt.getDate()),
          badgeColor: d.tingkat_urgensi === "mendesak" ? "bg-red-100 text-red-700 border-red-200" : "bg-blue-100 text-blue-700 border-blue-200",
          iconColor: d.tingkat_urgensi === "mendesak" ? "text-red-500" : "text-blue-500",
          urgency: d.tingkat_urgensi === "mendesak" ? "Mendesak" : "Tugas",
        };
      });
    }
  }

  // 4. Fetch Jadwal Kelas Pelajaran Mingguan
  let schedules = [
    { id: "s1", subject: "Matematika", teacher: "Ibu Siti Rahmawati, S.Pd.", day: "Senin", time: "08:00 - 09:30 WIB", room: "Ruang 8A" },
    { id: "s2", subject: "Matematika", teacher: "Budi Santoso, S.Pd.", day: "Rabu", time: "10:00 - 11:30 WIB", room: "Ruang 8A" },
    { id: "s3", subject: "Matematika (AI Sokratik)", teacher: "thinksy AI Tutor", day: "Jumat", time: "08:00 - 09:30 WIB", room: "Lab Komputer" },
  ];

  const { data: dbSchedules } = await supabase
    .from("jadwal_kelas")
    .select("*")
    .order("urutan", { ascending: true });

  if (dbSchedules && dbSchedules.length > 0) {
    schedules = dbSchedules.map((s) => ({
      id: s.id,
      subject: s.mata_pelajaran,
      teacher: s.nama_guru,
      day: s.hari,
      time: `${s.jam_mulai.substring(0, 5)} - ${s.jam_selesai.substring(0, 5)} WIB`,
      room: s.ruangan,
    }));
  }

  // 5. Get list of chapters and modules from Supabase
  const { data: listBab } = await supabase
    .from("bab")
    .select(
      `
      id,
      judul,
      deskripsi,
      urutan,
      materi (
        id,
        judul,
        urutan
      )
    `
    )
    .order("urutan", { ascending: true });

  // 6. Active Classes Data (Kurikulum Merdeka)
  const activeClassesData = [
    {
      id: "8a",
      code: "8A",
      title: "Matematika 8–A (Reguler - Kurikulum Merdeka)",
      teacher: "Ibu Siti Rahmawati, M.Pd.",
      room: "Ruang 204",
      elemenFocus: "Elemen Aljabar & Geometri Dasar",
      description: "Kelas reguler utama matematika SMP Kelas 8 sesuai Capaian Pembelajaran Fase D Kurikulum Merdeka.",
      schedule: "Senin & Rabu, 08:00 - 09:30 WIB",
      studentsCount: 32,
      activeBab: "Bab 4: Sistem Persamaan Linear Dua Variabel (SPLDV)",
      badge: "Utama / Reguler",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    },
    {
      id: "8b",
      code: "8B",
      title: "Matematika 8–B (Penguatan Sokratik & Remedial)",
      teacher: "Budi Santoso, S.Pd. & thinksy AI",
      room: "Ruang 301 / Lab Komputer",
      elemenFocus: "Elemen Bilangan & Bentuk Aljabar",
      description: "Kelas pendalaman konsep matematika dengan bantuan Tutor AI Sokratik bertahap.",
      schedule: "Selasa & Kamis, 10:00 - 11:30 WIB",
      studentsCount: 30,
      activeBab: "Bab 2: Bentuk Aljabar & PLSV/PTLSV",
      badge: "Pendalaman Sokratik",
      badgeColor: "bg-[#0F172A]/10 text-[#0F172A] border-[#0F172A]/20",
    },
    {
      id: "8c",
      code: "8C",
      title: "Matematika 8–C (Pengayaan HOTS & AKM)",
      teacher: "Ibu Ratna Dewi, M.Si.",
      room: "Ruang 105",
      elemenFocus: "Elemen Pengukuran, Geometri & Statistika",
      description: "Kelas pengayaan soal tantangan penalaran matematika tinggi (HOTS) dan persiapan AKM.",
      schedule: "Rabu & Jumat, 13:00 - 14:30 WIB",
      studentsCount: 28,
      activeBab: "Bab 6: Teorema Pythagoras & Aplikasi Kontekstual",
      badge: "Pengayaan HOTS",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    },
    {
      id: "8d",
      code: "8D",
      title: "Kelas Pendalaman 8–D (Persiapan Asesmen Sumatif)",
      teacher: "thinksy AI Tutor & Tim Guru Matematika",
      room: "Lab Multimedia",
      elemenFocus: "Elemen Analisis Data, Peluang & Tryout CP",
      description: "Kelas intensif latihan soal dan review kisi-kisi Asesmen Sumatif Akhir Semester Kurikulum Merdeka.",
      schedule: "Jumat, 08:00 - 10:00 WIB",
      studentsCount: 35,
      activeBab: "Bab 8: Statistika Pemusatan Data & Peluang",
      badge: "Persiapan Asesmen",
      badgeColor: "bg-amber-100 text-amber-900 border-amber-200",
    },
  ];

  const kurikulumMetadata = {
    kurikulumName: "Kurikulum Merdeka",
    fase: "Fase D (SMP Kelas 8)",
    mataPelajaran: "Matematika",
    elemenCP: [
      { id: "bilangan", nama: "Elemen Bilangan", deskripsi: "Pola Bilangan, Barisan & Deret Aritmetika/Geometri" },
      { id: "aljabar", nama: "Elemen Aljabar", deskripsi: "Bentuk Aljabar, PLSV/PTLSV, SPLDV, & Fungsi Linear" },
      { id: "geometri", nama: "Elemen Pengukuran & Geometri", deskripsi: "Teorema Pythagoras, Lingkaran, & Bangun Ruang Sisi Datar" },
      { id: "analisis_data", nama: "Elemen Analisis Data & Peluang", deskripsi: "Statistika (Mean, Median, Modus) & Peluang Kejadian" },
    ],
  };

  if (!user && !sekolahData) {
    sekolahData = {
      id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      nama: "SMK Muhammadiyah 1 Playen",
      npsn: "20402099",
      alamat: "Jl. Logandeng No. 1, Playen, Gunungkidul, D.I. Yogyakarta",
      motto: "Pusat Keunggulan • Unggul, Terampil, Berkarakter & Berdaya Saing Global",
      deskripsi: "SMK Muhammadiyah 1 Playen (Muspla) adalah Sekolah Pusat Keunggulan yang berkomitmen mencetak generasi muda yang cerdas, beriman, dan menguasai teknologi serta keahlian industri masa depan.",
      bg_image_url: "/images/smk-muh1-playen.jpg",
      links: [
        { label: "Website Resmi", url: "https://smkmuh1playen.sch.id", icon: "Globe" },
        { label: "Portal PPDB", url: "https://ppdb.smkmuh1playen.sch.id", icon: "ExternalLink" },
        { label: "Instagram", url: "https://instagram.com/smkmuh1playen", icon: "Instagram" }
      ]
    };
  }

  return (
    <StudentDashboardClient
      userProfile={userProfile}
      sekolahData={sekolahData}
      deadlinesData={deadlines}
      schedulesData={schedules}
      chapters={listBab || []}
      completedQuizCount={completedQuizCount}
      answeredSoalCount={answeredSoalCount}
      totalSoalCount={totalSoalCount}
      learningProgressPercent={learningProgressPercent}
      activeClassesData={activeClassesData}
      kurikulumMetadata={kurikulumMetadata}
    />
  );
}
// Dashboard Page Updated

