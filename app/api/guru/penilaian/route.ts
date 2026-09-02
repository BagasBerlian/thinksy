import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
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

    // 2. Fetch Teacher Profile for sekolah_id
    const { data: teacherProfil } = await adminDb
      .from("profil")
      .select("sekolah_id, nama_lengkap")
      .eq("id", user.id)
      .single();

    const sekolahId = teacherProfil?.sekolah_id;

    // 3. Query Essay Submissions from `jawaban` table via adminDb
    const { data: jawabanRows, error: dbErr } = await adminDb
      .from("jawaban")
      .select(`
        id,
        sesi_id,
        soal_id,
        opsi_dipilih_id,
        jawaban_teks,
        is_benar,
        nilai,
        umpan_balik_ai,
        dijawab_pada,
        soal (
          id,
          pertanyaan,
          tipe_soal,
          kunci_jawaban,
          pembahasan
        ),
        sesi (
          id,
          siswa_id,
          status_sesi,
          dibuat_pada,
          profil (
            id,
            nama_lengkap,
            email,
            sekolah_id
          )
        )
      `)
      .order("dijawab_pada", { ascending: false });

    if (dbErr) {
      console.error("[GET PENILAIAN ERROR]", dbErr.message);
    }

    const filteredRows = (jawabanRows || []).filter((item: any) => {
      // Filter essay answers
      const isEssay =
        item.soal?.tipe_soal === "esai" ||
        Boolean(item.jawaban_teks && item.jawaban_teks.trim().length > 0);
      
      if (!isEssay) return false;

      // Filter by teacher's school if sekolahId is set
      if (sekolahId && item.sesi?.profil?.sekolah_id) {
        return item.sesi.profil.sekolah_id === sekolahId;
      }
      return true;
    });

    const formattedSubmissions = filteredRows.map((item: any) => {
      const studentName = item.sesi?.profil?.nama_lengkap || "Siswa";
      const initials = studentName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);

      const isHighConfidence = Number(item.nilai || 0) >= 70;

      return {
        id: item.id,
        sesiId: item.sesi_id,
        soalId: item.soal_id,
        name: studentName,
        initials: initials,
        class: "Matematika – Kelas 8",
        confidence: isHighConfidence ? 92 : 45,
        confidenceType: isHighConfidence ? "tinggi" : "rendah",
        aiScore: item.nilai ?? 75,
        currentScore: item.nilai ?? 75,
        soal: item.soal?.pertanyaan || "Soal Esai Matematika",
        jawaban: item.jawaban_teks || "(Tidak ada ketikan jawaban)",
        kunciJawaban: item.soal?.kunci_jawaban || "Penilaian berdasarkan rubrik esai.",
        catatanGuru: item.umpan_balik_ai || "",
        dijawabPada: item.dijawab_pada,
        rubrik: [
          { item: "Pemahaman Konsep", score: `${Math.round((item.nilai || 75) * 0.3)}/30` },
          { item: "Ketepatan Langkah Matematika", score: `${Math.round((item.nilai || 75) * 0.3)}/30` },
          { item: "Kebenaran Jawaban Akhir", score: `${Math.round((item.nilai || 75) * 0.25)}/25` },
          { item: "Kejelasan Struktur Penjelasan", score: `${Math.round((item.nilai || 75) * 0.15)}/15` },
        ],
      };
    });

    return NextResponse.json({
      success: true,
      submissions: formattedSubmissions,
    });
  } catch (error: any) {
    console.error("Error in GET /api/guru/penilaian:", error);
    return NextResponse.json(
      { error: error.message || "Gagal mengambil data penilaian esai." },
      { status: 500 }
    );
  }
}

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

    // 2. Parse Request Body
    const body = await req.json();
    const { jawabanId, nilai, catatanGuru } = body;

    if (!jawabanId) {
      return NextResponse.json(
        { error: "Parameter jawabanId wajib diisi." },
        { status: 400 }
      );
    }

    const numericScore = Math.min(100, Math.max(0, Number(nilai ?? 75)));
    const isBenar = numericScore >= 70;

    // 3. Update `jawaban` table in Supabase via adminDb
    const { data: updatedJawaban, error: updateErr } = await adminDb
      .from("jawaban")
      .update({
        nilai: numericScore,
        umpan_balik_ai: catatanGuru || "Nilai telah disetujui dan diverifikasi oleh Guru.",
        is_benar: isBenar,
      })
      .eq("id", jawabanId)
      .select("id, sesi_id")
      .single();

    if (updateErr) {
      return NextResponse.json(
        { error: "Gagal menyimpan nilai ke database: " + updateErr.message },
        { status: 500 }
      );
    }

    // 4. Recalculate and update `sesi.skor_akhir` for the session if available
    if (updatedJawaban?.sesi_id) {
      const { data: sesiData } = await adminDb
        .from("sesi")
        .select("id, siswa_id")
        .eq("id", updatedJawaban.sesi_id)
        .single();

      const { data: allAnswers } = await adminDb
        .from("jawaban")
        .select("nilai")
        .eq("sesi_id", updatedJawaban.sesi_id);

      if (allAnswers && allAnswers.length > 0) {
        const totalSum = allAnswers.reduce((acc, curr) => acc + Number(curr.nilai || 0), 0);
        const avgScore = Math.round(totalSum / allAnswers.length);

        await adminDb
          .from("sesi")
          .update({
            skor_akhir: avgScore,
            status_sesi: "selesai",
          })
          .eq("id", updatedJawaban.sesi_id);
      }

      // Notify student & award points
      if (sesiData?.siswa_id) {
        await adminDb.from("notifikasi").insert({
          user_id: sesiData.siswa_id,
          judul: `Penilaian Esai Diverifikasi: ${numericScore}/100`,
          pesan: `Guru telah memeriksa jawaban esai Anda. Nilai: ${numericScore}. Catatan: ${catatanGuru || "Bagus! Pertahankan pencapaian Anda."}`,
          tipe: "sukses",
          dibaca: false,
        });

        // Award +20 bonus points to student profile
        const { data: targetProfil } = await adminDb
          .from("profil")
          .select("poin")
          .eq("id", sesiData.siswa_id)
          .single();

        if (targetProfil) {
          await adminDb
            .from("profil")
            .update({ poin: (targetProfil.poin || 0) + 20 })
            .eq("id", sesiData.siswa_id);
        }
      }
    }

    return NextResponse.json({
      success: true,
      jawabanId,
      score: numericScore,
      message: "Nilai, catatan, dan notifikasi ke siswa berhasil disimpan ke database!",
    });
  } catch (error: any) {
    console.error("Error in POST /api/guru/penilaian:", error);
    return NextResponse.json(
      { error: error.message || "Gagal menyimpan nilai ke database." },
      { status: 500 }
    );
  }
}
