import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const adminDb = createAdminClient();

    // 1. Authenticate Teacher User
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Anda harus masuk terlebih dahulu." },
        { status: 401 }
      );
    }

    // 2. Parse Body
    const body = await req.json();
    const { judul, deskripsi, tenggatWaktu, kategori, tingkatUrgensi, targetKelas } = body;

    if (!judul || !tenggatWaktu) {
      return NextResponse.json(
        { error: "Judul dan tenggat waktu wajib diisi." },
        { status: 400 }
      );
    }

    // 3. Fetch Teacher Profile
    const { data: teacherProfil } = await adminDb
      .from("profil")
      .select("sekolah_id, nama_lengkap")
      .eq("id", user.id)
      .single();

    const sekolahId = teacherProfil?.sekolah_id;

    // 4. Fetch Target Students (all students in school or class)
    let studentQuery = adminDb.from("profil").select("id").eq("peran", "siswa");
    if (sekolahId) {
      studentQuery = studentQuery.eq("sekolah_id", sekolahId);
    }
    const { data: studentsList } = await studentQuery;

    if (studentsList && studentsList.length > 0) {
      // 5. Insert into `agenda_tugas` for each student
      const tugasRows = studentsList.map((st: any) => ({
        siswa_id: st.id,
        judul: judul.trim(),
        deskripsi: deskripsi?.trim() || "Kerjakan latihan matematika ini dengan teliti.",
        tenggat_waktu: new Date(tenggatWaktu).toISOString(),
        kategori: kategori || "kuis",
        tingkat_urgensi: tingkatUrgensi || "normal",
      }));

      await adminDb.from("agenda_tugas").insert(tugasRows);

      // 6. Insert into `notifikasi` for each student
      const notifRows = studentsList.map((st: any) => ({
        user_id: st.id,
        judul: `Tugas Baru: ${judul.trim()}`,
        pesan: `${teacherProfil?.nama_lengkap || "Guru"} telah memberikan tugas baru (${kategori || "Tugas"}). Tenggat: ${new Date(tenggatWaktu).toLocaleString("id-ID")}`,
        tipe: tingkatUrgensi === "tinggi" ? "peringatan" : "info",
        dibaca: false,
      }));

      await adminDb.from("notifikasi").insert(notifRows);
    }

    return NextResponse.json({
      success: true,
      message: `Tugas "${judul}" berhasil disiarkan ke ${studentsList?.length || 0} siswa!`,
    });
  } catch (error: any) {
    console.error("[POST BROADCAST TUGAS ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Gagal menyiarkan tugas." },
      { status: 500 }
    );
  }
}
