import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { autoClaimMisi } from "@/app/api/siswa/misi/route";
import { checkAndUpdateDailyStreak } from "@/lib/streak";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const adminDb = createAdminClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Anda harus login terlebih dahulu." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { sesiId, answers = {}, autoSubmitted = false } = body;

    if (!sesiId) {
      return NextResponse.json(
        { error: "ID Sesi wajib disertakan." },
        { status: 400 }
      );
    }

    // 1. Fetch Sesi record
    const { data: sesiRow, error: sesiErr } = await adminDb
      .from("sesi")
      .select("id, siswa_id, bab_id, status_sesi, tipe_sesi")
      .eq("id", sesiId)
      .maybeSingle();

    if (sesiErr || !sesiRow) {
      return NextResponse.json(
        { error: "Sesi quiz tidak ditemukan." },
        { status: 404 }
      );
    }

    // If already finalized, return redirect immediately
    if (sesiRow.status_sesi === "selesai") {
      return NextResponse.json({
        success: true,
        redirectUrl: `/hasil/${sesiId}`,
        message: "Sesi ini sudah selesai sebelumnya.",
      });
    }

    // 2. Fetch full question data with correct answer keys securely on server side
    let query = adminDb
      .from("soal")
      .select(`
        id,
        tipe_soal,
        kunci_jawaban,
        pembahasan,
        opsi_soal (
          id,
          teks_opsi,
          benar
        )
      `);

    if (sesiRow.bab_id) {
      query = query.eq("bab_id", sesiRow.bab_id);
    }

    const { data: dbQuestions } = await query.order("dibuat_pada", { ascending: true });

    let correctCount = 0;
    let totalQuestions = dbQuestions && dbQuestions.length > 0 ? dbQuestions.length : Object.keys(answers).length || 1;

    // 3. Process and grade each answer
    if (dbQuestions && dbQuestions.length > 0) {
      for (const q of dbQuestions) {
        const studentChoice = answers[q.id];
        let isCorrect = false;
        let nilai = 0;
        let opsiDipilihId: string | null = null;
        let jawabanTeks: string | null = null;

        if (q.tipe_soal === "pilihan_ganda") {
          const matchingOption = q.opsi_soal?.find(
            (o: any) => o.id === studentChoice || o.teks_opsi === studentChoice
          );
          opsiDipilihId = matchingOption?.id || (studentChoice ? studentChoice : null);
          const correctOption = q.opsi_soal?.find((o: any) => o.benar);

          if (matchingOption && matchingOption.benar) {
            isCorrect = true;
            nilai = 100;
            correctCount += 1;
          } else if (
            studentChoice &&
            q.kunci_jawaban &&
            studentChoice.toLowerCase().trim() === q.kunci_jawaban.toLowerCase().trim()
          ) {
            isCorrect = true;
            nilai = 100;
            correctCount += 1;
          }
        } else {
          // Soal Esai
          jawabanTeks = studentChoice || "";
          isCorrect = false; // Menunggu konfirmasi guru
          nilai = 0;
        }

        // Upsert into jawaban table
        await adminDb.from("jawaban").upsert(
          {
            sesi_id: sesiId,
            soal_id: q.id,
            opsi_dipilih_id: opsiDipilihId,
            jawaban_teks: jawabanTeks,
            is_benar: isCorrect,
            nilai: nilai,
            umpan_balik_ai:
              q.tipe_soal === "esai"
                ? "Skor esai sementara — menunggu konfirmasi guru"
                : q.pembahasan || null,
            dijawab_pada: new Date().toISOString(),
          },
          { onConflict: "sesi_id,soal_id" }
        );
      }
    } else {
      // Fallback if no questions in DB: record provided answers
      for (const [soalId, val] of Object.entries(answers)) {
        await adminDb.from("jawaban").upsert(
          {
            sesi_id: sesiId,
            soal_id: soalId,
            jawaban_teks: typeof val === "string" ? val : JSON.stringify(val),
            is_benar: true,
            nilai: 100,
            dijawab_pada: new Date().toISOString(),
          },
          { onConflict: "sesi_id,soal_id" }
        );
        correctCount += 1;
      }
    }

    const finalScore = Math.min(100, Math.round((correctCount / totalQuestions) * 100));

    // 4. Update sesi to status 'selesai'
    const { error: updateSesiErr } = await adminDb
      .from("sesi")
      .update({
        status_sesi: "selesai",
        skor_akhir: finalScore,
        selesai_pada: new Date().toISOString(),
      })
      .eq("id", sesiId);

    if (updateSesiErr) {
      console.error("[SELESAI SESI ERROR]", updateSesiErr);
    }

    // 5. Award Learning Points (XP)
    const pointsToAdd = finalScore >= 80 ? 100 : finalScore >= 60 ? 75 : 50;
    try {
      const { data: curProfil } = await adminDb
        .from("profil")
        .select("poin_belajar")
        .eq("id", user.id)
        .maybeSingle();

      const newPoints = (curProfil?.poin_belajar || 0) + pointsToAdd;
      await adminDb
        .from("profil")
        .update({ poin_belajar: newPoints })
        .eq("id", user.id);
    } catch (xpErr) {
      console.error("[AWARD XP ERROR]", xpErr);
    }

    // 6. Trigger auto-claim daily missions & streak evaluation
    try {
      await autoClaimMisi(supabase, user.id, "kuis");
      await checkAndUpdateDailyStreak(user.id, "kuis");
    } catch (questErr) {
      console.error("[QUEST CLAIM ERROR]", questErr);
    }

    return NextResponse.json({
      success: true,
      sesiId,
      finalScore,
      pointsAwarded: pointsToAdd,
      autoSubmitted,
      redirectUrl: `/hasil/${sesiId}`,
      message: autoSubmitted
        ? "Waktu pengerjaan telah habis. Jawaban berhasil dikunci otomatis!"
        : "Quiz berhasil diselesaikan!",
    });
  } catch (err: any) {
    console.error("[API SESI SELESAI EXCEPTION]", err);
    return NextResponse.json(
      { error: err.message || "Gagal memproses penyelesaian sesi quiz." },
      { status: 500 }
    );
  }
}
