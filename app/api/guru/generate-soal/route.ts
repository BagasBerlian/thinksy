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
      !["guru", "admin_sekolah", "superadmin", "super_admin"].includes(profil.peran)
    ) {
      return NextResponse.json(
        { error: "Akses ditolak. Hanya Guru dan Admin yang dapat membuat soal dan materi." },
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
      fileBase64,
      fileMimeType,
      mode = "auto", // "soal" | "materi" | "auto"
    } = body;

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: "Kunci API Gemini belum dikonfigurasi di server." },
        { status: 500 }
      );
    }

    const isMateriRequested =
      mode === "materi" ||
      /materi|modul|rpp|penjelasan|rangkuman|pembelajaran/i.test(topik);

    let promptText = "";

    if (isMateriRequested) {
      promptText = `Kamu adalah Pakar Kurikulum Matematika dan Asisten Guru profesional SMP.
Tugasmu adalah menyusun Paket **Materi Pembelajaran Lengkap & Modul Pelajaran** sekaligus 1 Paket Latihan Soal berdasarkan topik/berkas terlampir.

SPESIFIKASI MODUL & MATERI:
- Topik Pelajaran: ${topik}
- Sasaran: SMP Kelas 8
- Format Notasi: WAJIB menggunakan KaTeX ($...$ untuk inline, $$...$$ untuk blok).

MENGEMBALIKAN DALAM FORMAT JSON BERIKUT (TANPA MARKDOWN CODE BLOCK BLOCK KECUALI JSON):
{
  "materiLengkap": "# MATERI PEMBELAJARAN: <Judul Topik>\\n\\n## 🎯 Tujuan Pembelajaran\\n- <Tujuan 1>\\n- <Tujuan 2>\\n\\n## 📖 Penjelasan Konsep & Rumus Kunci\\n<Penjelasan mendalam beserta ekspresi KaTeX>\\n\\n## 💡 Contoh Soal & Pembahasan Langkah demi Langkah\\n<Contoh soal kontekstual dan langkah pengerjaan rinci>",
  "pertanyaan": "<soal latihan mandiri siswa berdasarkan materi>",
  "kunciJawaban": "<kunci jawaban latihan>",
  "pembahasan": "<penjelasan lengkap solusi latihan>",
  "opsiSoal": [
    { "teksOpsi": "<pilihan A>", "benar": false },
    { "teksOpsi": "<pilihan B>", "benar": true },
    { "teksOpsi": "<pilihan C>", "benar": false },
    { "teksOpsi": "<pilihan D>", "benar": false }
  ]
}`;
    } else {
      promptText = `Kamu adalah Pembuat Soal Matematika profesional untuk SMP Kelas 8.
Tugasmu adalah menghasilkan 1 paket draft soal berkualitas tinggi berdasarkan instruksi, serta mendeteksi/menelaah materi dari berkas foto atau dokumen PDF yang dilampirkan jika ada.

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
    }

    if (fileBase64 && fileMimeType) {
      promptText += `\n\nCATATAN LAMPIRAN BERKAS (${fileMimeType}): Analisis foto / dokumen PDF terlampir dan susun materi pembelajaran / soal yang mengekstrak langsung materi dari lampiran tersebut.`;
    }

    const parts: any[] = [{ text: promptText }];

    if (fileBase64 && fileMimeType) {
      const cleanBase64 = fileBase64.replace(/^data:[^;]+;base64,/, "");
      parts.push({
        inline_data: {
          mime_type: fileMimeType,
          data: cleanBase64,
        },
      });
    }

    // Try Gemini 3.1 Flash Lite API endpoint first, fallback to 2.5/1.5 flash
    const modelsToTry = [
      "gemini-3.1-flash-lite",
      "gemini-2.5-flash",
      "gemini-1.5-flash",
    ];

    let apiResponse: Response | null = null;
    let lastErrorText = "";

    for (const modelName of modelsToTry) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey}`;
      try {
        const resp = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts }],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.7,
              maxOutputTokens: 2000,
            },
          }),
        });

        if (resp.ok) {
          apiResponse = resp;
          break;
        } else {
          lastErrorText = await resp.text();
        }
      } catch (err: any) {
        lastErrorText = err.message;
      }
    }

    if (!apiResponse) {
      throw new Error(`Gemini API Error: ${lastErrorText}`);
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
        fitur: isMateriRequested ? "generate_materi_pembelajaran" : "generate_soal_multimodal",
        prompt_tokens: inputTokens,
        completion_tokens: outputTokens,
        total_tokens: inputTokens + outputTokens,
        biaya_usd: (inputTokens * 0.075 + outputTokens * 0.3) / 1000000,
      });
    }

    return NextResponse.json({
      success: true,
      modelUsed: "Gemini 3.1 Flash Lite",
      materiLengkap: draftData.materiLengkap || null,
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
      { error: error.message || "Gagal membuat draft materi/soal dari AI." },
      { status: 500 }
    );
  }
}
