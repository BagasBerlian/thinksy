import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // 1. Authenticate user
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
      .select("sekolah_id, peran")
      .eq("id", user.id)
      .single();

    if (
      !profil ||
      !["guru", "admin_sekolah", "super_admin"].includes(profil.peran)
    ) {
      return NextResponse.json(
        { error: "Akses ditolak. Hanya Guru dan Admin yang dapat membuat soal." },
        { status: 403 }
      );
    }

    // 2. Parse Request Body
    const body = await req.json();
    const {
      babId,
      topik = "Pola Bilangan Aritmatika",
      tingkatSoal = "sedang",
      tipeSoal = "pilihan_ganda",
    } = body;

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: "Kunci API Gemini belum dikonfigurasi di server." },
        { status: 500 }
      );
    }

    const prompt = `Kamu adalah Pembuat Soal Matematika profesional untuk SMP Kelas 8.
Tugasmu adalah menghasilkan 1 paket draft soal berkualitas tinggi.

SPESIFIKASI SOAL:
- Topik Spesifik: ${topik}
- Tingkat Kesulitan: ${tingkatSoal} (mudah / sedang / sulit)
- Tipe Soal: ${tipeSoal} (pilihan_ganda atau esai)

ATURAN RUMUS MATEMATIKA:
WAJIB menggunakan format KaTeX ($...$ untuk inline, $$...$$ untuk blok). Contoh: $U_n = a + (n-1)b$.

WAJIB MENGEMBALIKAN HANYA FORMAT JSON SAJA (TANPA TEKS LAIN SEPERTI MARKDOWN BLOCK):
{
  "pertanyaan": "<teks pertanyaan soal lengkap beserta ekspresi KaTeX>",
  "kunciJawaban": "<kunci jawaban atau ringkasan rubrik>",
  "pembahasan": "<penjelasan dan langkah penyelesaian rinci>",
  "opsiSoal": [
    { "teksOpsi": "<pilihan A>", "benar": false },
    { "teksOpsi": "<pilihan B>", "benar": true },
    { "teksOpsi": "<pilihan C>", "benar": false },
    { "teksOpsi": "<pilihan D>", "benar": false }
  ]
}
Catatan: Jika tipeSoal adalah 'esai', buat opsiSoal sebagai array kosong []. Jika 'pilihan_ganda', buat tepat 4 opsi dengan tepat 1 opsi yang benar = true.`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${geminiApiKey}`;
    const apiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7,
          maxOutputTokens: 1200
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

    const draftData = JSON.parse(cleanedJsonText);

    // Log AI usage
    if (profil.sekolah_id) {
      const inputTokens = responseData.usageMetadata?.promptTokenCount || 0;
      const outputTokens = responseData.usageMetadata?.candidatesTokenCount || 0;
      await supabase.from("log_ai").insert({
        sekolah_id: profil.sekolah_id,
        pengguna_id: user.id,
        fitur: "generate_soal",
        prompt_tokens: inputTokens,
        completion_tokens: outputTokens,
        total_tokens: inputTokens + outputTokens,
        biaya_usd: (inputTokens * 0.075 + outputTokens * 0.3) / 1000000,
      });
    }

    return NextResponse.json({
      success: true,
      draft: {
        babId,
        topik,
        tingkatSoal,
        tipeSoal,
        pertanyaan: draftData.pertanyaan,
        kunciJawaban: draftData.kunciJawaban,
        pembahasan: draftData.pembahasan,
        opsiSoal: draftData.opsiSoal || [],
      },
    });
  } catch (error: any) {
    console.error("Error in generate-soal route:", error);
    return NextResponse.json(
      { error: error.message || "Gagal membuat draft soal dari AI." },
      { status: 500 }
    );
  }
}
