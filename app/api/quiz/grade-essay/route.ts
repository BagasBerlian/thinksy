import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkAndUpdateDailyStreak } from "@/lib/streak";

interface BatchItem {
  soalId: string;
  pertanyaan: string;
  jawabanSiswa: string;
  kunciJawaban: string;
  isBenar: boolean;
  konsepKunci: string;
}

async function generateBatchAiExplanations(
  items: BatchItem[],
  apiKey: string
): Promise<Record<string, string>> {
  if (!items.length || !apiKey) return {};

  const prompt = `Kamu adalah Asisten Guru Thinksy.
Tugasmu adalah membuat pembahasan ringkas, edukatif, dan to-the-point untuk setiap nomor soal kuis berikut.

ATURAN PEMBAHASAN:
1. Panjang: Tepat 2 sampai 3 kalimat per soal. Wajib hemat token: padat, lugas, jangan bertele-tele atau berbasa-basi.
2. Gaya bahasa: Sopan, santun, objektif, dan fokus pada konsep inti/logika penyelesaian.
3. Jika jawaban siswa BENAR (isBenar = true): Jelaskan mengapa jawaban tersebut benar dan pertegas prinsip kuncinya.
4. Jika jawaban siswa SALAH (isBenar = false): Jelaskan secara jelas mengapa kunci jawaban tersebut tepat dan berikan pemahaman atas konsep materi tanpa menyalahkan siswa.
5. Format output: WAJIB HANYA format JSON object murni tanpa markdown lain:
{
  "<soalId>": "Pembahasan 2-3 kalimat..."
}

Daftar Soal & Jawaban Siswa:
${JSON.stringify(items, null, 2)}`;

  const models = [
    "gemini-3.1-flash-lite",
    "gemini-1.5-flash",
    "gemini-2.0-flash",
  ];

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
            maxOutputTokens: 1200,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        const parsed = JSON.parse(rawText.replace(/```json|```/g, "").trim());
        if (parsed && typeof parsed === "object") {
          return parsed as Record<string, string>;
        }
      }
    } catch (e) {
      console.warn(`[GRADE-AI] Model ${model} failed, trying fallback...`, e);
    }
  }

  return {};
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const adminDb = createAdminClient();

    // 1. Authenticate User (with fallback for demo testing)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const activeUserId = user?.id || "531d16b6-a4ba-4a60-a50e-d37fc14e0f25";

    const { data: profil } = await adminDb
      .from("profil")
      .select("sekolah_id, poin")
      .eq("id", activeUserId)
      .maybeSingle();

    const sekolahId = profil?.sekolah_id || null;

    // 2. Parse Request Body
    const body = await req.json();
    const { sesiId, babId, jawabanList = [] } = body;

    let activeSesiId = sesiId;
    const isValidUUID = (str: string) =>
      Boolean(str) && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    // Verify if sesi exists in database
    let sesiExists = false;
    if (isValidUUID(activeSesiId)) {
      const { data: existingSesi } = await adminDb
        .from("sesi")
        .select("id")
        .eq("id", activeSesiId)
        .maybeSingle();
      if (existingSesi) {
        sesiExists = true;
      }
    }

    if (!sesiExists) {
      // Create new session in Supabase sesi table
      const { data: newSesi, error: insertSesiErr } = await adminDb
        .from("sesi")
        .insert({
          siswa_id: activeUserId,
          sekolah_id: sekolahId,
          bab_id: babId || null,
          tipe_sesi: "kuis",
          status_sesi: "aktif",
        })
        .select("id")
        .single();

      if (newSesi) {
        activeSesiId = newSesi.id;
      } else {
        console.error("[GRADE] Failed creating session:", insertSesiErr);
        throw new Error("Gagal menginisialisasi sesi kuis di database.");
      }
    } else if (babId) {
      await adminDb
        .from("sesi")
        .update({ bab_id: babId, sekolah_id: sekolahId })
        .eq("id", activeSesiId);
    }

    // 3. Collect Questions Data from Database for Accurate Evaluation
    const batchItemsToGrade: Array<{
      soalId: string;
      pertanyaan: string;
      opsiDipilihId?: string;
      jawabanTeks: string;
      kunciJawaban: string;
      pembahasanDb: string;
      isBenar: boolean;
      nilai: number;
    }> = [];

    for (const item of jawabanList) {
      const { soalId, opsiDipilihId, jawabanTeks } = item;

      const { data: soalData } = await adminDb
        .from("soal")
        .select(`
          id,
          pertanyaan,
          tipe_soal,
          kunci_jawaban,
          pembahasan,
          opsi_soal (
            id,
            teks_opsi,
            benar
          )
        `)
        .eq("id", soalId)
        .maybeSingle();

      if (!soalData) continue;

      if (soalData.tipe_soal === "pilihan_ganda") {
        const correctOption = soalData.opsi_soal?.find((o: any) => o.benar);
        const selectedOption = soalData.opsi_soal?.find((o: any) => o.id === opsiDipilihId);

        const isBenar = Boolean(
          correctOption && opsiDipilihId && correctOption.id === opsiDipilihId
        );
        const nilai = isBenar ? 10 : 0;
        const studentText = selectedOption?.teks_opsi || jawabanTeks || "Tidak Dijawab";
        const correctText = correctOption?.teks_opsi || soalData.kunci_jawaban || "-";

        batchItemsToGrade.push({
          soalId,
          pertanyaan: soalData.pertanyaan,
          opsiDipilihId: opsiDipilihId || undefined,
          jawabanTeks: studentText,
          kunciJawaban: correctText,
          pembahasanDb: soalData.pembahasan || "",
          isBenar,
          nilai,
        });
      } else {
        // Essay question
        const trimmed = (jawabanTeks || "").trim();
        const containsKeywords = (soalData.kunci_jawaban || "")
          .toLowerCase()
          .split(" ")
          .filter((w: string) => w.length > 4)
          .some((w: string) => trimmed.toLowerCase().includes(w));

        const isBenar = Boolean(trimmed.length > 20 && containsKeywords);
        const nilai = isBenar ? 10 : trimmed.length > 10 ? 5 : 0;

        batchItemsToGrade.push({
          soalId,
          pertanyaan: soalData.pertanyaan,
          jawabanTeks: trimmed || "Tidak Dijawab",
          kunciJawaban: soalData.kunci_jawaban || "Sesuai kriteria bab",
          pembahasanDb: soalData.pembahasan || "",
          isBenar,
          nilai,
        });
      }
    }

    // 4. Batch Generate AI Discussion for ALL questions (correct and incorrect)
    const geminiApiKey = process.env.GEMINI_API_KEY || "";
    const aiPromptItems: BatchItem[] = batchItemsToGrade.map((q) => ({
      soalId: q.soalId,
      pertanyaan: q.pertanyaan,
      jawabanSiswa: q.jawabanTeks,
      kunciJawaban: q.kunciJawaban,
      isBenar: q.isBenar,
      konsepKunci: q.pembahasanDb,
    }));

    let aiExplanations: Record<string, string> = {};
    if (geminiApiKey && aiPromptItems.length > 0) {
      aiExplanations = await generateBatchAiExplanations(aiPromptItems, geminiApiKey);
    }

    // 5. Store Each Graded Answer into Supabase `jawaban` Table
    let totalScoreSum = 0;
    const evaluationResults: any[] = [];

    for (const q of batchItemsToGrade) {
      totalScoreSum += q.nilai;

      // Extract generated AI explanation or build clean fallback
      let explanation = aiExplanations[q.soalId]?.trim();
      if (!explanation) {
        if (q.isBenar) {
          explanation = `Jawaban Anda tepat. Pilihan ini benar karena ${
            q.pembahasanDb || "konsep yang diterapkan sudah sesuai dengan materi pembahasan."
          }`;
        } else {
          explanation = `Jawaban yang tepat adalah ${q.kunciJawaban}. ${
            q.pembahasanDb || "Pelajari kembali konsep inti materi ini untuk memperdalam pemahaman."
          }`;
        }
      }

      await adminDb.from("jawaban").upsert(
        {
          sesi_id: activeSesiId,
          soal_id: q.soalId,
          opsi_dipilih_id: q.opsiDipilihId || null,
          jawaban_teks: q.jawabanTeks,
          is_benar: q.isBenar,
          nilai: q.nilai,
          umpan_balik_ai: explanation,
          dijawab_pada: new Date().toISOString(),
        },
        { onConflict: "sesi_id,soal_id" }
      );

      evaluationResults.push({
        soalId: q.soalId,
        nilai: q.nilai,
        isBenar: q.isBenar,
        umpanBalik: explanation,
      });
    }

    // 6. Compute Final Score & Award Learning Points
    const maxPossiblePoints = Math.max(1, batchItemsToGrade.length * 10);
    const finalScore = Math.min(100, Math.round((totalScoreSum / maxPossiblePoints) * 100));
    const earnedPoints = finalScore >= 80 ? 100 : finalScore >= 60 ? 75 : 50;

    // Update Sesi status
    await adminDb
      .from("sesi")
      .update({
        skor_akhir: finalScore,
        status_sesi: "selesai",
        selesai_pada: new Date().toISOString(),
      })
      .eq("id", activeSesiId);

    // Update student profile points
    const currentPoints = profil?.poin ?? 0;
    const totalPoinSiswa = currentPoints + earnedPoints;

    await adminDb
      .from("profil")
      .update({ poin: totalPoinSiswa })
      .eq("id", activeUserId);

    // Update streak if applicable
    try {
      await checkAndUpdateDailyStreak(activeUserId, "kuis");
    } catch (streakErr: any) {
      console.warn("[STREAK UPDATE]", streakErr.message);
    }

    return NextResponse.json({
      success: true,
      sesiId: activeSesiId,
      skorAkhir: finalScore,
      earnedPoints,
      totalPoinSiswa,
      detailEvaluasi: evaluationResults,
    });
  } catch (error: any) {
    console.error("Error in grade-essay route:", error);
    return NextResponse.json(
      { error: error.message || "Gagal memproses penilaian kuis." },
      { status: 500 }
    );
  }
}
