import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import DaftarUjianClient from "./DaftarUjianClient";

export default async function DaftarUjianPage() {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/masuk");
  }

  // 1. Ambil profil siswa
  const { data: profil } = await adminSupabase
    .from("profil")
    .select(`
      id,
      nama_lengkap,
      email,
      peran,
      poin,
      streak,
      nisn,
      nis,
      jurusan,
      tahun_ajaran,
      foto_url,
      sekolah_id,
      anggota_kelas (
        kelas (
          id,
          nama,
          tingkat
        )
      )
    `)
    .eq("id", user.id)
    .maybeSingle();

  const rawKelas = (profil as any)?.anggota_kelas?.[0]?.kelas;
  const userGrade = rawKelas?.tingkat || 8;
  const namaKelas = rawKelas?.nama || "Kelas 8A";

  // 2. Ambil data sekolah
  let sekolahData = null;
  if (profil?.sekolah_id) {
    const { data: sek } = await supabase
      .from("sekolah")
      .select("id, nama, motto, deskripsi, bg_image_url, links, alamat, npsn, jam_masuk, jam_terlambat, jam_tutup")
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
        jam_masuk: sek.jam_masuk || "07:00:00",
        jam_terlambat: sek.jam_terlambat || "07:15:00",
        jam_tutup: sek.jam_tutup || "08:00:00",
      };
    }
  }

  if (!sekolahData) {
    sekolahData = {
      id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      nama: "SMK Muhammadiyah Pakem",
      npsn: "20402099",
      alamat: "Jl. Pakem - Turi No.23, Area Sawah, Pakembinangun, Kec. Pakem, Kab. Sleman, D.I. Yogyakarta",
      motto: "Pusat Keunggulan & Pesantren Vokasi • Bahagia Bersama",
      deskripsi: "SMK Muhammadiyah Pakem (MUPA) merupakan Sekolah Pusat Keunggulan dan Sekolah yang mengusung konsep Pesantren Vokasi dengan jurusan unggulan berstandar industri dan teknologi modern.",
      bg_image_url: "/images/smk-muh-pakem.png",
      links: [
        { label: "Website Resmi", url: "https://smkmuhpakem.sch.id/#", icon: "Globe" },
        { label: "Portal SPMB", url: "https://smkmuhpakem.sch.id/ppdb/", icon: "ExternalLink" },
        { label: "Instagram", url: "https://www.instagram.com/smkmuhpakem/?hl=id", icon: "Instagram" },
      ],
      jam_masuk: "07:00:00",
      jam_terlambat: "07:15:00",
      jam_tutup: "08:00:00",
    };
  }

  // 3. Ambil data presensi hari ini (Asia/Jakarta)
  const todayWIB = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const { data: presensiToday } = await supabase
    .from("presensi")
    .select("waktu_masuk, status")
    .eq("siswa_id", user.id)
    .eq("tanggal", todayWIB)
    .maybeSingle();

  let isCheckedIn = false;
  let checkInTime: string | null = null;
  let checkInStatus: string | null = null;

  if (presensiToday) {
    isCheckedIn = true;
    checkInTime = new Date(presensiToday.waktu_masuk).toLocaleTimeString("id-ID", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
    });
    checkInStatus = presensiToday.status || "Hadir (Tepat Waktu)";
  }

  // 3b. Ambil data bab / kurikulum untuk ulangan per bab
  const { data: listBab } = await supabase
    .from("bab")
    .select(`
      id,
      judul,
      deskripsi,
      urutan,
      mapel,
      kelas,
      semester
    `)
    .order("urutan", { ascending: true });

  // 4. Ambil daftar ujian aktif
  let query = adminSupabase
    .from("ujian")
    .select(`
      id,
      judul,
      deskripsi,
      mapel,
      tipe,
      durasi_menit,
      passing_grade,
      waktu_mulai,
      waktu_berakhir,
      status,
      dibuat_pada
    `)
    .in("status", ["dipublikasi", "ditutup"])
    .order("waktu_mulai", { ascending: false });

  if (profil?.sekolah_id) {
    query = query.eq("sekolah_id", profil.sekolah_id);
  }

  const { data: rawExams } = await query;

  // 5. Ambil riwayat sesi_ujian siswa
  let userSessions: Record<string, any> = {};
  const { data: sesiList } = await adminSupabase
    .from("sesi_ujian")
    .select("id, ujian_id, status, nilai_akhir, server_start_time, server_end_time")
    .eq("siswa_id", user.id);

  if (sesiList) {
    sesiList.forEach((s) => {
      userSessions[s.ujian_id] = s;
    });
  }

  const exams = (rawExams || []).map((u) => {
    const sesi = userSessions[u.id];
    let sessionStatus = "belum_mulai";
    let score = null;

    if (sesi) {
      sessionStatus = sesi.status;
      score = sesi.nilai_akhir;
    }

    const calculatedTipe: "ulangan" | "ujian" =
      u.tipe === "ulangan" || u.tipe === "ujian"
        ? u.tipe
        : (u.judul || "").toLowerCase().includes("ulangan")
        ? "ulangan"
        : "ujian";

    return {
      id: u.id,
      judul: u.judul,
      deskripsi: u.deskripsi,
      mapel: u.mapel,
      tipe: calculatedTipe,
      durasi_menit: u.durasi_menit,
      passing_grade: u.passing_grade,
      sessionStatus,
      score,
      sesiId: sesi?.id,
      status: u.status || "dipublikasi",
    };
  });

  return (
    <DaftarUjianClient
      userProfile={{
        nama_lengkap: profil?.nama_lengkap || "Siswa THINKSY",
        email: profil?.email || user.email || "",
        peran: "siswa",
        poin: profil?.poin || 0,
        streak: profil?.streak || 0,
        rank: 1,
        totalStudents: 1,
        isCheckedIn,
        checkInTime,
        checkInStatus,
        tingkat_kelas: userGrade,
        nama_kelas: namaKelas,
        nisn: profil?.nisn || "0089247182",
        nis: profil?.nis || "260481",
        jurusan: profil?.jurusan || "Teknik Komputer & Jaringan",
        tahun_ajaran: profil?.tahun_ajaran || "2026/2027",
        foto_url: profil?.foto_url || null,
      }}
      sekolahData={sekolahData}
      exams={exams}
      chapters={listBab || []}
    />
  );
}
