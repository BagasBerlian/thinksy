import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import BelajarClient from "./BelajarClient";

export default async function BelajarPage({
  searchParams,
}: {
  searchParams?: Promise<{ mapel?: string; babId?: string; semester?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const initialMapel = resolvedSearchParams.mapel || null;
  const initialBabId = resolvedSearchParams.babId || null;
  const initialSemester = resolvedSearchParams.semester
    ? parseInt(resolvedSearchParams.semester, 10)
    : null;

  const supabase = await createClient();
  const adminSupabase = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/masuk");
  }

  // 1. Fetch Student Profile
  const { data: profil } = await supabase
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
    .single();

  const userRole = profil?.peran || "siswa";
  if (userRole !== "siswa") {
    if (userRole === "guru") redirect("/guru");
    if (userRole === "admin_sekolah") redirect("/admin");
    if (userRole === "superadmin") redirect("/super");
  }

  const rawKelas = (profil as any)?.anggota_kelas?.[0]?.kelas;
  const userGrade = rawKelas?.tingkat || 8;
  const namaKelas = rawKelas?.nama || "Kelas 8A";

  // 2. Fetch School Data
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

  // 3. Check today's attendance status in WIB timezone (Asia/Jakarta)
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

  // 4. Fetch Chapters and Materials from Supabase
  const { data: babRows } = await supabase
    .from("bab")
    .select(`
      id,
      judul,
      deskripsi,
      urutan,
      mapel,
      kelas,
      semester,
      materi (
        id,
        judul,
        urutan
      )
    `)
    .order("urutan", { ascending: true });

  // 5. Fetch User Reading Progress from progres_materi
  const { data: progresRows } = await supabase
    .from("progres_materi")
    .select("bab_id, materi_id, status")
    .eq("siswa_id", user.id)
    .eq("status", "selesai");

  const completedMateriSet = new Set((progresRows || []).map((p: any) => p.materi_id));

  // Map chapters with progress
  const chaptersWithProgress = (babRows || []).map((bab: any) => {
    const materiList = bab.materi || [];
    const totalMat = materiList.length;
    const completedMat = materiList.filter((m: any) => completedMateriSet.has(m.id)).length;
    const progressPercent = totalMat > 0 ? Math.round((completedMat / totalMat) * 100) : 0;

    return {
      id: bab.id,
      judul: bab.judul,
      deskripsi: bab.deskripsi,
      urutan: bab.urutan,
      mapel: bab.mapel,
      kelas: bab.kelas,
      semester: bab.semester || (bab.urutan <= 3 ? 1 : 2),
      progress: progressPercent,
      materi: materiList.sort((a: any, b: any) => a.urutan - b.urutan),
    };
  });

  // 6. Fetch Exams & Ulangan Sessions (same unified data source as Home)
  let examsData: any[] = [];
  const { data: dbExams } = await adminSupabase
    .from("ujian")
    .select(`
      id,
      judul,
      deskripsi,
      mapel,
      durasi_menit,
      passing_grade,
      waktu_mulai,
      waktu_berakhir,
      status,
      tipe,
      token,
      bab_id
    `)
    .order("waktu_mulai", { ascending: false });

  let userExamSessions: Record<string, any> = {};
  if (user) {
    const { data: sesiList } = await adminSupabase
      .from("sesi_ujian")
      .select("id, ujian_id, status, nilai_akhir")
      .eq("siswa_id", user.id);

    if (sesiList) {
      sesiList.forEach((s: any) => {
        userExamSessions[s.ujian_id] = s;
      });
    }
  }

  if (dbExams && dbExams.length > 0) {
    examsData = dbExams.map((e: any) => {
      const s = userExamSessions[e.id];
      return {
        ...e,
        tipe: e.tipe || "ulangan",
        token: e.token || "12345",
        sessionStatus: s?.status || "belum_mulai",
        score: s?.nilai_akhir ?? null,
        sesiId: s?.id,
        bab_id: e.bab_id || null,
      };
    });
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-bold text-slate-500">Memuat Ruang Belajar...</p>
          </div>
        </div>
      }
    >
      <BelajarClient
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
        chapters={chaptersWithProgress}
        completedMateriIds={Array.from(completedMateriSet)}
        examsData={examsData}
        initialMapel={initialMapel}
        initialBabId={initialBabId}
        initialSemester={initialSemester}
      />
    </Suspense>
  );
}
