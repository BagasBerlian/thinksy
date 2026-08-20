import { createClient } from "@/lib/supabase/server";
import StudentDashboardClient from "./StudentDashboardClient";

export default async function SiswaDashboardPage() {
  const supabase = await createClient();

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

  if (user) {
    // Get user profile data
    const { data: profil } = await supabase
      .from("profil")
      .select("nama_lengkap, peran, poin, streak")
      .eq("id", user.id)
      .single();

    const currentPoin = profil?.poin ?? 1250;
    const currentStreak = profil?.streak ?? 14;

    // Calculate dynamic student rank
    const { count: higherRankCount } = await supabase
      .from("profil")
      .select("id", { count: "exact", head: true })
      .eq("peran", "siswa")
      .gt("poin", currentPoin);

    const { count: totalSiswaCount } = await supabase
      .from("profil")
      .select("id", { count: "exact", head: true })
      .eq("peran", "siswa");

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
      rank: (higherRankCount || 0) + 1,
      totalStudents: totalSiswaCount || 120,
      isCheckedIn,
      checkInTime,
      fotoSelfie,
    };
  }

  // 2. Fetch Misi Harian (Daily Quests)
  let quests = [
    {
      id: "q1",
      title: "Absen Pagi Tepat Waktu",
      progress: userProfile.isCheckedIn ? 1 : 0,
      max: 1,
      reward: 20,
      claimed: false,
    },
    {
      id: "q2",
      title: "Selesaikan 1 Bab Pembelajaran",
      progress: 1,
      max: 1,
      reward: 50,
      claimed: false,
    },
    {
      id: "q3",
      title: "Jawab 5 Soal Kuis Tanpa Salah",
      progress: 3,
      max: 5,
      reward: 30,
      claimed: false,
    },
  ];

  if (user) {
    const { data: dbQuests } = await supabase
      .from("misi_harian")
      .select("id, judul, progres_saat_ini, target_max, poin_hadiah, diklaim")
      .or(`siswa_id.eq.${user.id},siswa_id.is.null`)
      .order("id", { ascending: true });

    if (dbQuests && dbQuests.length > 0) {
      quests = dbQuests.map((q) => {
        let currentProgress = q.progres_saat_ini;
        if (q.judul.toLowerCase().includes("absen") && userProfile.isCheckedIn) {
          currentProgress = q.target_max;
        }
        return {
          id: q.id,
          title: q.judul,
          progress: currentProgress,
          max: q.target_max,
          reward: q.poin_hadiah,
          claimed: q.diklaim,
        };
      });
    }
  }

  // 3. Fetch Agenda & Tenggat Waktu (Deadlines)
  let deadlines = [
    {
      id: "a1",
      title: "Kuis Biologi Bab 3: Genetika Sel",
      desc: "Selesai pukul 23:59 WIB",
      dayBadge: "HARI INI",
      dateNum: "15",
      badgeColor: "bg-red-100 text-red-700 border-red-200",
      iconColor: "text-red-500",
      urgency: "Mendesak",
    },
    {
      id: "a2",
      title: "Tugas Makalah Sejarah Indonesia",
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
    { id: "s1", subject: "Matematika", teacher: "Ibu Siti Rahmawati", day: "Senin", time: "08:00 - 09:30 WIB", room: "Ruang 8A" },
    { id: "s2", subject: "Fisika", teacher: "Budi Santoso, S.Pd.", day: "Senin", time: "10:00 - 11:30 WIB", room: "Lab Fisika" },
    { id: "s3", subject: "Biologi", teacher: "Citra Wulandari, S.Si.", day: "Selasa", time: "08:00 - 09:30 WIB", room: "Lab Biologi" },
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
      questsData={quests}
      deadlinesData={deadlines}
      schedulesData={schedules}
      chapters={listBab || []}
    />
  );
}
