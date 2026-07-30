import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // 1. Authenticate User
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

    const { data: profil } = await supabase
      .from("profil")
      .select("sekolah_id")
      .eq("id", user.id)
      .single();

    const sekolahId = profil?.sekolah_id;

    // 2. Parse Request Body
    const body = await req.json();
    const { sesiId, jawabanList = [] } = body;

    const isValidUUID = (str: string) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    if (!sesiId || !isValidUUID(sesiId)) {
      return NextResponse.json(
        { error: "ID Sesi tidak valid. Pastikan sesi sudah dibuat dengan benar sebelum mengumpulkan jawaban." },
        { status: 400 }
      );
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;

    const evaluationResults: any[] = [];
    let totalScoreSum = 0;
    let totalQuestionsGraded = 0;

    for (const item of jawabanList) {
      const { soalId, opsiDipilihId, jawabanTeks } = item;

      // Query Soal data
      const { data: soalData } = await supabase
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
        .single();

      if (!soalData) continue;

      if (soalData.tipe_soal === "pilihan_ganda") {
        // Auto-grade Multiple Choice
        const correctOption = soalData.opsi_soal?.find((o: any) => o.benar);
        const isBenar = correctOption?.id === opsiDipilihId;
        const nilai = isBenar ? 100 : 0;

        totalScoreSum += nilai;
        totalQuestionsGraded += 1;

        // Upsert Answer to database
        await supabase.from("jawaban").upsert({
          sesi_id: sesiId,
          soal_id: soalId,
          opsi_dipilih_id: opsiDipilihId || null,
          is_benar: isBenar,
          nilai: nilai,
          umpan_balik_ai: isBenar
            ? "Jawaban Pilihan Ganda Benar!"
            : `Jawaban kurang tepat. Jawaban benar: ${correctOption?.teks_opsi || ""}`,
        });

        evaluationResults.push({
          soalId,
          tipeSoal: "pilihan_ganda",
          nilai,
          isBenar,
          umpanBalik: isBenar ? "Benar" : "Salah",
        });
      } else if (soalData.tipe_soal === "esai") {
        // Auto-grade Essay using Google Gemini AI
        let nilai = 75;
        let isBenar = true;
        let umpanBalik = "Jawaban esai telah dicatat.";

        if (geminiApiKey && jawabanTeks) {
          const evalPrompt = `Kamu adalah Penilai/Evaluator Otomatis Esai Matematika SMP Kelas 8.
Tugasmu adalah memberikan evaluasi yang objektif, akurat, dan konstruktif.

SOAL ESAI:
${soalData.pertanyaan}

KUNCI JAWABAN / RUBRIK:
${soalData.kunci_jawaban || "Jelaskan konsep dengan rinci."}

JAWABAN SISWA:
${jawabanTeks}

WAJIB MENGEMBALIKAN FORMAT JSON SAJA (TANPA TEKS LAIN):
{
  "nilai": <angka bulat 0 hingga 100>,
  "kemiripanKonsep": "<misal: 85%>",
  "umpanBalik": "<umpan balik konstruktif ringkas dalam Bahasa Indonesia>",
  "isBenar": <true jika nilai >= 70 else false>
}`;

          try {
            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
            const apiResponse = await fetch(geminiUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: evalPrompt }] }],
                generationConfig: {
                  responseMimeType: "application/json",
                  temperature: 0.2,
                  maxOutputTokens: 600
                }
              })
            });

            if (!apiResponse.ok) {
              const errorText = await apiResponse.text();
              throw new Error(`Gemini API Error: ${errorText}`);
            }

            const responseData = await apiResponse.json();
            const rawText = responseData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

            const cleanedJsonText = rawText
              .replace(/```json/g, "")
              .replace(/```/g, "")
              .trim();

            const parsed = JSON.parse(cleanedJsonText);
            nilai = typeof parsed.nilai === "number" ? parsed.nilai : 75;
            isBenar = typeof parsed.isBenar === "boolean" ? parsed.isBenar : nilai >= 70;
            umpanBalik = parsed.umpanBalik || "Evaluasi esai selesai.";

            // Log AI Token usage
            if (sekolahId) {
              const inputTokens = responseData.usageMetadata?.promptTokenCount || 0;
              const outputTokens = responseData.usageMetadata?.candidatesTokenCount || 0;
              await supabase.from("log_ai").insert({
                sekolah_id: sekolahId,
                pengguna_id: user.id,
                fitur: "grading_esai",
                prompt_tokens: inputTokens,
                completion_tokens: outputTokens,
                total_tokens: inputTokens + outputTokens,
                biaya_usd: (inputTokens * 0.075 + outputTokens * 0.3) / 1000000,
              });
            }
          } catch (e) {
            console.error("Error calling Gemini for essay grading:", e);
          }
        }

        totalScoreSum += nilai;
        totalQuestionsGraded += 1;

        // Upsert Answer to database
        await supabase.from("jawaban").upsert({
          sesi_id: sesiId,
          soal_id: soalId,
          jawaban_teks: jawabanTeks || "",
          is_benar: isBenar,
          nilai: nilai,
          umpan_balik_ai: umpanBalik,
        });

        evaluationResults.push({
          soalId,
          tipeSoal: "esai",
          nilai,
          isBenar,
          umpanBalik,
        });
      }
    }

    // Calculate final overall score
    const finalScore =
      totalQuestionsGraded > 0
        ? Math.round(totalScoreSum / totalQuestionsGraded)
        : 0;

    // Update Sesi status & final score in Supabase
    await supabase
      .from("sesi")
      .update({
        skor_akhir: finalScore,
        status_sesi: "selesai",
        selesai_pada: new Date().toISOString(),
      })
      .eq("id", sesiId);

    return NextResponse.json({
      success: true,
      skorAkhir: finalScore,
      detailEvaluasi: evaluationResults,
    });
  } catch (error: any) {
    console.error("Error in grade-essay route:", error);
    return NextResponse.json(
      { error: error.message || "Gagal memproses penilaian esai." },
      { status: 500 }
    );
  }
}
