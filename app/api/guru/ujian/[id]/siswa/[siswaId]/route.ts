import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string; siswaId: string }> }
) {
  try {
    const { id: ujianId, siswaId } = await params;
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verifikasi peran Guru / Admin
    const { data: guruProfil } = await adminSupabase
      .from("profil")
      .select("id, peran, sekolah_id")
      .eq("id", user.id)
      .maybeSingle();

    if (
      !guruProfil ||
      !["guru", "admin_sekolah", "super_admin", "superadmin"].includes(guruProfil.peran)
    ) {
      return NextResponse.json({ error: "Forbidden: Akses khusus Dewan Guru" }, { status: 403 });
    }

    // 1. Ambil detail Ujian
    const { data: ujian, error: ujianErr } = await adminSupabase
      .from("ujian")
      .select(`
        id,
        judul,
        deskripsi,
        mapel,
        tipe,
        durasi_menit,
        passing_grade,
        status,
        bab_id
      `)
      .eq("id", ujianId)
      .single();

    if (ujianErr || !ujian) {
      return NextResponse.json({ error: "Ujian tidak ditemukan" }, { status: 404 });
    }

    // 2. Ambil profil Siswa dari database
    const { data: siswaProfil } = await adminSupabase
      .from("profil")
      .select("id, nama_lengkap, email, nisn")
      .eq("id", siswaId)
      .maybeSingle();

    if (!siswaProfil) {
      return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 });
    }

    // 3. Ambil sesi_ujian siswa
    const { data: sesiSiswa } = await adminSupabase
      .from("sesi_ujian")
      .select("*")
      .eq("ujian_id", ujianId)
      .eq("siswa_id", siswaId)
      .maybeSingle();

    // 4. Ambil butir soal ujian
    const { data: ujianSoalList } = await adminSupabase
      .from("ujian_soal")
      .select(`
        id,
        urutan,
        poin_bobot,
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
      `)
      .eq("ujian_id", ujianId)
      .order("urutan", { ascending: true });

    let rawQuestions: any[] = [];

    if (ujianSoalList && ujianSoalList.length > 0) {
      rawQuestions = ujianSoalList.map((item: any, idx: number) => {
        const s = item.soal;
        const rawOpsi = Array.isArray(s?.opsi_soal) ? s.opsi_soal : [];
        const sortedOpsi = rawOpsi.sort((a: any, b: any) => (a.urutan || 0) - (b.urutan || 0));

        return {
          id: s?.id || item.id,
          urutan: item.urutan || idx + 1,
          pertanyaan: s?.pertanyaan || "Pertanyaan Ujian",
          tipe_soal: s?.tipe_soal || "pilihan_ganda",
          poin_bobot: item.poin_bobot || 5,
          pembahasan: s?.pembahasan || null,
          kunci_jawaban: s?.kunci_jawaban || null,
          opsi: sortedOpsi.map((o: any) => ({
            id: o.id,
            teks_opsi: o.teks_opsi,
            benar: o.benar ?? false,
            urutan: o.urutan,
          })),
        };
      });
    } else {
      // Fallback
      let qQuery = adminSupabase.from("soal").select(`
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
      `);
      if (ujian.bab_id) {
        qQuery = qQuery.eq("bab_id", ujian.bab_id);
      }
      const { data: fallbackQuestions } = await qQuery.limit(20);
      rawQuestions = (fallbackQuestions || []).map((q: any, idx: number) => {
        const rawOpsi = Array.isArray(q.opsi_soal) ? q.opsi_soal : [];
        return {
          id: q.id,
          urutan: idx + 1,
          pertanyaan: q.pertanyaan,
          tipe_soal: q.tipe_soal || "pilihan_ganda",
          poin_bobot: 5,
          pembahasan: q.pembahasan || null,
          kunci_jawaban: q.kunci_jawaban || null,
          opsi: rawOpsi.map((o: any) => ({
            id: o.id,
            teks_opsi: o.teks_opsi,
            benar: o.benar ?? false,
            urutan: o.urutan,
          })),
        };
      });
    }

    // 5. Ambil data jawaban_ujian siswa
    const answersMap = new Map<string, any>();
    if (sesiSiswa?.id) {
      const { data: jawabanList } = await adminSupabase
        .from("jawaban_ujian")
        .select("soal_id, opsi_dipilih_id, jawaban_esai, is_benar, skor_diperoleh, koreksi_ai")
        .eq("sesi_ujian_id", sesiSiswa.id);

      (jawabanList || []).forEach((j: any) => {
        answersMap.set(j.soal_id, j);
      });
    }

    // 6. Hitung evaluasi Benar / Salah per nomor soal
    let correctCount = 0;
    let partialCount = 0;
    let wrongCount = 0;
    let calculatedScore = 0;

    const evaluatedQuestions = rawQuestions.map((q) => {
      const ans = answersMap.get(q.id);
      let isCorrect = false;
      let isPartial = false;
      let isWrong = false;
      let earnedScore = 0;

      if (q.tipe_soal === "pilihan_ganda") {
        const correctOpt = q.opsi?.find((o: any) => o.benar);
        const chosenOpt = q.opsi?.find((o: any) => o.id === ans?.opsi_dipilih_id);

        if (ans?.is_benar !== undefined && ans?.is_benar !== null) {
          isCorrect = ans.is_benar === true;
          isWrong = !isCorrect;
          earnedScore = isCorrect ? (ans.skor_diperoleh ?? q.poin_bobot) : 0;
        } else {
          isCorrect = Boolean(chosenOpt && correctOpt && chosenOpt.id === correctOpt.id);
          isWrong = !isCorrect;
          earnedScore = isCorrect ? q.poin_bobot : 0;
        }
      } else {
        // Esai
        if (ans?.is_benar === true) {
          isCorrect = true;
          earnedScore = ans.skor_diperoleh ?? q.poin_bobot;
        } else if (
          (ans?.is_benar === null && ans?.skor_diperoleh && ans.skor_diperoleh > 0) ||
          (ans?.is_benar === null && ans?.jawaban_esai && ans.jawaban_esai.trim().length > 3)
        ) {
          isPartial = true;
          earnedScore = ans.skor_diperoleh ?? q.poin_bobot / 2;
        } else {
          isWrong = true;
          earnedScore = 0;
        }
      }

      if (isCorrect) correctCount++;
      else if (isPartial) partialCount++;
      else wrongCount++;

      calculatedScore += earnedScore;

      return {
        id: q.id,
        urutan: q.urutan,
        pertanyaan: q.pertanyaan,
        tipe_soal: q.tipe_soal,
        poin_bobot: q.poin_bobot,
        pembahasan: q.pembahasan,
        kunci_jawaban: q.kunci_jawaban,
        opsi: q.opsi,
        studentAnswer: {
          opsiId: ans?.opsi_dipilih_id || null,
          jawabanEsai: ans?.jawaban_esai || null,
          isBenar: isCorrect ? true : isPartial ? null : false,
          skorDiperoleh: earnedScore,
          koreksiAi: ans?.koreksi_ai || null,
        },
      };
    });

    const finalScore =
      sesiSiswa?.nilai_akhir !== null && sesiSiswa?.nilai_akhir !== undefined
        ? Number(sesiSiswa.nilai_akhir)
        : Math.round(calculatedScore);

    return NextResponse.json({
      success: true,
      student: {
        id: siswaProfil.id,
        nama_lengkap: siswaProfil.nama_lengkap || "Siswa",
        email: siswaProfil.email,
        nisn: siswaProfil.nisn || "-",
      },
      session: sesiSiswa
        ? {
            id: sesiSiswa.id,
            status: sesiSiswa.status,
            nilai_akhir: finalScore,
            server_start_time: sesiSiswa.server_start_time,
            dikumpulkan_pada: sesiSiswa.dikumpulkan_pada,
          }
        : null,
      summary: {
        totalQuestions: rawQuestions.length,
        correctCount,
        partialCount,
        wrongCount,
        totalScore: finalScore,
        passingGrade: ujian.passing_grade || 75,
        isPassed: finalScore >= (ujian.passing_grade || 75),
      },
      questions: evaluatedQuestions,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
