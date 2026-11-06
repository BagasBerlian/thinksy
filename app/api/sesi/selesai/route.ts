import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { gradeSingleEssayWithAi } from "@/app/api/nilai-esai/route";
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

    const body = await req.json().catch(() => ({}));
    const { sesiId, babId, autoSubmitted = false, answers = {} } = body;

    if (!sesiId && !babId) {
      return NextResponse.json(
        { error: "ID Sesi atau Bab wajib disertakan." },
        { status: 400 }
      );
    }

    const isValidUUID = (str?: string) =>
      Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

    // 1. Ambil data sesi (dengan fallback jika yang dikirim adalah bab_id atau sesi belum terbuat)
    let sesiRow: any = null;
    if (isValidUUID(sesiId)) {
      const { data: sRow } = await adminDb
        .from("sesi")
        .select("id, siswa_id, bab_id, status_sesi, tipe_sesi")
        .eq("id", sesiId)
        .maybeSingle();
      sesiRow = sRow;
    }

    if (!sesiRow) {
      const targetBab = babId || sesiId;
      const { data: fallbackSesi } = await adminDb
        .from("sesi")
        .select("id, siswa_id, bab_id, status_sesi, tipe_sesi")
        .eq("siswa_id", user.id)
        .eq("bab_id", targetBab)
        .order("mulai_pada", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fallbackSesi) {
        sesiRow = fallbackSesi;
      }
    }

    // Auto-create sesi jika belum tercatat di database agar pekerjaan siswa tidak hilang
    if (!sesiRow) {
      let resolvedBabId: string | null = isValidUUID(babId) ? babId : isValidUUID(sesiId) ? sesiId : null;

      // Jika babId adalah string biasa seperti "bab-1", cari UUID aslinya dari database
      if (!resolvedBabId) {
        const { data: firstBab } = await adminDb
          .from("bab")
          .select("id")
          .order("urutan", { ascending: true })
          .limit(1)
          .maybeSingle();
        resolvedBabId = firstBab?.id || "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
      }

      const { data: newSesi, error: insertSesiErr } = await adminDb
        .from("sesi")
        .insert({
          id: isValidUUID(sesiId) ? sesiId : undefined,
          siswa_id: user.id,
          bab_id: resolvedBabId,
          tipe_sesi: "kuis",
          status_sesi: "aktif",
          batas_menit: 30,
          mulai_pada: new Date().toISOString(),
        })
        .select("id, siswa_id, bab_id, status_sesi, tipe_sesi")
        .maybeSingle();

      if (insertSesiErr) {
        console.error("Gagal auto-create sesi kuis:", insertSesiErr);
      }
      sesiRow = newSesi;
    }

    if (!sesiRow) {
      return NextResponse.json(
        { error: "Sesi tidak ditemukan." },
        { status: 404 }
      );
    }

    const effectiveSesiId = sesiRow.id;

    // 2. Query semua soal bab terkait untuk evaluasi menyeluruh
    const { data: babQuestions } = await adminDb
      .from("soal")
      .select(`
        id,
        pertanyaan,
        tipe_soal,
        kunci_jawaban,
        pembahasan,
        rubrik,
        poin,
        opsi_soal (
          id,
          teks_opsi,
          benar,
          alasan_salah
        )
      `)
      .eq("bab_id", sesiRow.bab_id)
      .order("dibuat_pada", { ascending: true })
      .limit(15);

    // Ambil jawaban yang sudah tercatat sebelumnya di database
    const { data: existingJawaban } = await adminDb
      .from("jawaban")
      .select("id, soal_id, opsi_dipilih_id, jawaban_teks, is_benar, nilai, status_penilaian")
      .eq("sesi_id", effectiveSesiId);

    const jawabanMap = new Map((existingJawaban || []).map((j: any) => [j.soal_id, j]));

    let totalScoreSum = 0;
    let benarCount = 0;
    const questionsToEvaluate = babQuestions || [];
    const totalQuestions = questionsToEvaluate.length > 0 ? questionsToEvaluate.length : 15;

    // 3. Evaluasi setiap butir soal & sinkronkan ke tabel `jawaban`
    for (const soal of questionsToEvaluate) {
      const clientAns = answers[soal.id];
      const prevJ = jawabanMap.get(soal.id);

      let currentNilai = 0;
      let isCorrect = false;
      const poinMaks = soal.poin || 10;

      if (soal.tipe_soal === "pilihan_ganda") {
        const matchingOpt = soal.opsi_soal?.find(
          (o: any) => o.id === (clientAns || prevJ?.opsi_dipilih_id)
        ) || (clientAns
          ? soal.opsi_soal?.find(
              (o: any) => o.teks_opsi?.trim().toLowerCase() === String(clientAns).trim().toLowerCase()
            )
          : null);

        isCorrect = Boolean(matchingOpt?.benar);
        currentNilai = isCorrect ? poinMaks : 0;

        await adminDb.from("jawaban").upsert(
          {
            sesi_id: effectiveSesiId,
            soal_id: soal.id,
            opsi_dipilih_id: matchingOpt?.id || null,
            jawaban_teks: matchingOpt?.teks_opsi || (clientAns ? String(clientAns) : null),
            is_benar: isCorrect,
            nilai: currentNilai,
            status_penilaian: "selesai",
            dijawab_pada: new Date().toISOString(),
          },
          { onConflict: "sesi_id, soal_id" }
        );

        if (isCorrect) benarCount += 1;
      } else if (soal.tipe_soal === "isian_singkat") {
        const rawInput = String(clientAns || prevJ?.jawaban_teks || "").trim();
        const studentInput = rawInput.toLowerCase().replace(/\s+/g, " ");
        const officialKey = (soal.kunci_jawaban || "").trim().toLowerCase().replace(/\s+/g, " ");
        const keyOptions = officialKey.split(/[,/|]/).map((k: string) => k.trim());

        isCorrect = Boolean(studentInput && keyOptions.includes(studentInput));
        currentNilai = isCorrect ? poinMaks : 0;

        await adminDb.from("jawaban").upsert(
          {
            sesi_id: effectiveSesiId,
            soal_id: soal.id,
            opsi_dipilih_id: null,
            jawaban_teks: rawInput || null,
            is_benar: isCorrect,
            nilai: currentNilai,
            status_penilaian: "selesai",
            dijawab_pada: new Date().toISOString(),
          },
          { onConflict: "sesi_id, soal_id" }
        );

        if (isCorrect) benarCount += 1;
      } else if (soal.tipe_soal === "esai") {
        const essayText = String(clientAns || prevJ?.jawaban_teks || "").trim();

        if (essayText.length > 0) {
          if (prevJ?.nilai !== null && prevJ?.nilai !== undefined && prevJ.nilai > 0) {
            currentNilai = prevJ.nilai;
            isCorrect = Boolean(prevJ.is_benar);
          } else {
            try {
              const { result } = await gradeSingleEssayWithAi(
                soal.pertanyaan,
                soal.rubrik,
                essayText,
                soal.kunci_jawaban,
                soal.pembahasan
              );
              currentNilai = result?.skor_total ?? 8;
              isCorrect = currentNilai >= 7;
            } catch {
              currentNilai = 8;
              isCorrect = true;
            }
          }

          await adminDb.from("jawaban").upsert(
            {
              sesi_id: effectiveSesiId,
              soal_id: soal.id,
              opsi_dipilih_id: null,
              jawaban_teks: essayText,
              nilai: currentNilai,
              is_benar: isCorrect,
              status_penilaian: "sementara_menunggu_guru",
              dijawab_pada: new Date().toISOString(),
            },
            { onConflict: "sesi_id, soal_id" }
          );

          if (isCorrect) benarCount += 1;
        } else {
          await adminDb.from("jawaban").upsert(
            {
              sesi_id: effectiveSesiId,
              soal_id: soal.id,
              opsi_dipilih_id: null,
              jawaban_teks: null,
              nilai: 0,
              is_benar: false,
              status_penilaian: "selesai",
              dijawab_pada: new Date().toISOString(),
            },
            { onConflict: "sesi_id, soal_id" }
          );
        }
      }

      totalScoreSum += currentNilai;
    }

    // 4. Hitung skor akhir persentase (0-100)
    const maxPossibleScore = totalQuestions * 10;
    const finalScore =
      totalQuestions > 0
        ? Math.min(100, Math.round((totalScoreSum / maxPossibleScore) * 100))
        : 100;

    // 5. Update sesi menjadi selesai
    await adminDb
      .from("sesi")
      .update({
        status_sesi: "selesai",
        skor_akhir: finalScore,
        selesai_pada: new Date().toISOString(),
      })
      .eq("id", effectiveSesiId);

    // 6. Bonus gamifikasi (XP/Misi) jika profil siswa aktif
    try {
      await autoClaimMisi(supabase, user.id, "kuis");
      await checkAndUpdateDailyStreak(user.id, "kuis");
    } catch {
      // Non-fatal
    }

    return NextResponse.json({
      success: true,
      sesiId: effectiveSesiId,
      skorAkhir: finalScore,
      totalSoal: totalQuestions,
      benarCount,
      redirectUrl: `/hasil/${effectiveSesiId}`,
      message: autoSubmitted
        ? "Waktu pengerjaan habis. Sesi kuis telah dikunci dan dinilai otomatis!"
        : "Sesi berhasil diselesaikan dan dihitung!",
    });
  } catch (err: any) {
    console.error("[API SESI SELESAI EXCEPTION]", err);
    return NextResponse.json(
      { error: err.message || "Gagal memproses penyelesaian sesi." },
      { status: 500 }
    );
  }
}
