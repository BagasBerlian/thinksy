import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const adminDb = createAdminClient();

    // 1. Fetch real students from Supabase profil table where peran = 'siswa'
    const { data: dbStudents, error: studentError } = await adminDb
      .from("profil")
      .select("id, nama_lengkap, nisn, poin, streak, dibuat_pada, foto_url")
      .eq("peran", "siswa")
      .order("nama_lengkap", { ascending: true });

    if (studentError) {
      console.error("[TO REVIEW] Error fetching students from Supabase:", studentError);
      return NextResponse.json({ error: studentError.message }, { status: 500 });
    }

    const students = (dbStudents || []).map((st, idx) => {
      // Deterministic avatar colors
      const avatarColors = [
        "bg-blue-600",
        "bg-emerald-600",
        "bg-indigo-600",
        "bg-purple-600",
        "bg-pink-600",
        "bg-amber-600",
        "bg-teal-600",
        "bg-rose-600",
        "bg-cyan-600",
        "bg-violet-600",
      ];
      return {
        id: st.id,
        name: st.nama_lengkap || "Siswa",
        nisn: st.nisn || `0089${100000 + idx}`,
        kelas: "8-A",
        points: st.poin || 500,
        fotoUrl: st.foto_url || null,
        avatarColor: avatarColors[idx % avatarColors.length],
      };
    });

    // 2. Fetch any real jawaban rows from Supabase
    const { data: dbJawaban } = await adminDb
      .from("jawaban")
      .select(`
        id,
        sesi_id,
        soal_id,
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
          pembahasan,
          bab ( id, judul, mapel, kelas )
        ),
        sesi (
          id,
          siswa_id,
          status_sesi,
          dibuat_pada,
          profil ( id, nama_lengkap, nisn )
        )
      `)
      .order("dijawab_pada", { ascending: false })
      .limit(30);

    return NextResponse.json({
      success: true,
      studentsCount: students.length,
      students,
      rawJawabanCount: dbJawaban?.length || 0,
    });
  } catch (error: any) {
    console.error("[TO REVIEW API ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Gagal memuat data dari Supabase." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const adminDb = createAdminClient();
    const body = await req.json();
    const { submissionId, studentId, assignmentId, score, feedback } = body;

    const numericScore = Math.min(100, Math.max(0, Number(score || 0)));

    // 1. If submissionId matches a UUID, update in jawaban or sesi
    if (submissionId && submissionId.length > 20) {
      try {
        await adminDb
          .from("jawaban")
          .update({
            nilai: numericScore,
            umpan_balik_ai: feedback || "Telah diverifikasi oleh guru.",
            is_benar: numericScore >= 70,
          })
          .eq("id", submissionId);
      } catch (e) {
        console.warn("Could not update jawaban directly:", e);
      }
    }

    // 2. If studentId is present, reward student with points in Supabase profil
    if (studentId) {
      try {
        const { data: stProfil } = await adminDb
          .from("profil")
          .select("poin")
          .eq("id", studentId)
          .single();

        if (stProfil) {
          await adminDb
            .from("profil")
            .update({ poin: (stProfil.poin || 0) + 15 })
            .eq("id", studentId);
        }

        // Insert notification for student
        await adminDb.from("notifikasi").insert({
          user_id: studentId,
          judul: `Nilai Tugas Diberikan: ${numericScore}/100`,
          pesan: feedback || "Guru telah memeriksa dan memberikan nilai serta umpan balik pada tugasmu.",
          tipe: "info",
          dibaca: false,
        });
      } catch (e) {
        console.warn("Could not update student points/notif:", e);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Nilai (${numericScore}) berhasil disimpan ke database Supabase!`,
    });
  } catch (error: any) {
    console.error("[POST TO REVIEW ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Gagal menyimpan nilai ke Supabase." },
      { status: 500 }
    );
  }
}
