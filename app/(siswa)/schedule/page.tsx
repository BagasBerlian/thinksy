import { createClient } from "@/lib/supabase/server";
import ScheduleClient from "./ScheduleClient";

export default async function SchedulePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userProfile = {
    nama_lengkap: "Siswa Thinksy",
    email: "",
  };

  if (user) {
    const { data: profil } = await supabase
      .from("profil")
      .select("nama_lengkap")
      .eq("id", user.id)
      .single();

    userProfile = {
      nama_lengkap: profil?.nama_lengkap || user.email?.split("@")[0] || "Siswa Thinksy",
      email: user.email || "",
    };
  }

  // Fetch Schedules from Database
  let schedules: Array<{
    id: string;
    subject: string;
    teacher: string;
    day: string;
    startTime: string;
    endTime: string;
    time: string;
    room: string;
  }> = [];

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
      startTime: s.jam_mulai.substring(0, 5),
      endTime: s.jam_selesai.substring(0, 5),
      time: `${s.jam_mulai.substring(0, 5)} - ${s.jam_selesai.substring(0, 5)} WIB`,
      room: s.ruangan,
    }));
  } else {
    // Default Schedule fallback if DB is empty
    schedules = [
      { id: "s1", subject: "MATEMATIKA", teacher: "Pak Budi Santoso, S.Pd.", day: "Senin", startTime: "08:00", endTime: "09:30", time: "08:00 - 09:30 WIB", room: "Ruang 204" },
      { id: "s2", subject: "BAHASA INDONESIA", teacher: "Bu Sari Rahmawati, M.Pd.", day: "Senin", startTime: "09:45", endTime: "11:15", time: "09:45 - 11:15 WIB", room: "Ruang 201" },
      { id: "s3", subject: "INFORMATIKA", teacher: "Pak Andi Wijaya, S.Kom.", day: "Senin", startTime: "11:15", endTime: "12:30", time: "11:15 - 12:30 WIB", room: "Lab Komputer" },
      { id: "s4", subject: "IPA (BIOLOGI)", teacher: "Bu Ratna Dewi, M.Si.", day: "Selasa", startTime: "08:00", endTime: "09:30", time: "08:00 - 09:30 WIB", room: "Lab IPA" },
      { id: "s5", subject: "BAHASA INGGRIS", teacher: "Mr. John Doe, M.Ed.", day: "Rabu", startTime: "10:00", endTime: "11:30", time: "10:00 - 11:30 WIB", room: "Ruang 102" },
      { id: "s6", subject: "PENDAFTARAN SOKRATIK AI", teacher: "thinksy AI Tutor", day: "Jumat", startTime: "08:00", endTime: "09:30", time: "08:00 - 09:30 WIB", room: "Lab Multimedia" },
    ];
  }

  return <ScheduleClient userProfile={userProfile} initialSchedules={schedules} />;
}
