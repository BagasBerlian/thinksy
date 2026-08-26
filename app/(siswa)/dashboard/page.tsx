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
    poin: 1250,
    streak: 14,
    rank: 3,
    totalStudents: 120,
    isCheckedIn: false,
    checkInTime: null as string | null,
    fotoSelfie: null as string | null,
  };

  let completedQuizCount = 0;
  let answeredSoalCount = 0;
  let totalSoalCount = 0;
  let learningProgressPercent = 75; // fallback

  if (user) {
    // Get user profile data
    const { data: profil } = await supabase
      .from("profil")
      .select("nama_lengkap, peran, poin, streak")
      .eq("id", user.id)
      .single();

    const currentPoin = profil?.poin ?? 1250;
    const currentStreak = profil?.streak ?? 14;

    // Calculate completed quiz count (status_sesi = 'selesai')
    const { count: quizDoneCount } = await supabase
      .from("sesi")
      .select("id", { count: "exact", head: true })
      .eq("siswa_id", user.id)
      .eq("status_sesi", "selesai");

    completedQuizCount = quizDoneCount || 0;

    // Points earned directly from completed quizzes (1 quiz = 15 points)
    const pointsFromQuizzes = completedQuizCount * 15;
    const dynamicPoin = Math.max(currentPoin, pointsFromQuizzes);

    // If dynamic points differ from DB poin, sync to profil table
    if (dynamicPoin !== currentPoin) {
      await supabase
        .from("profil")
        .update({ poin: dynamicPoin })
        .eq("id", user.id);
    }

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

    const { data: answeredRows } = await supabase
      .from("jawaban")
      .select("soal_id, sesi!inner(siswa_id)")
      .eq("sesi.siswa_id", user.id);

    const answeredSet = new Set(answeredRows?.map((r) => r.soal_id));
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
      poin: dynamicPoin,
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

  return (
    <StudentDashboardClient
      userProfile={userProfile}
      deadlinesData={deadlines}
      schedulesData={schedules}
      chapters={listBab || []}
      completedQuizCount={completedQuizCount}
      answeredSoalCount={answeredSoalCount}
      totalSoalCount={totalSoalCount}
      learningProgressPercent={learningProgressPercent}
    />
  );
}
// Dashboard Page Updated

