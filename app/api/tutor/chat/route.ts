import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { autoClaimMisi } from "@/app/api/siswa/misi/route";

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

    // 2. Fetch User Profile
    const { data: profil } = await supabase
      .from("profil")
      .select("sekolah_id, nama_lengkap, peran")
      .eq("id", user.id)
      .single();

    const sekolahId = profil?.sekolah_id;

    // 3. Rate Limiting Check (Max 20 AI interaction logs per day per student)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count: todayLogsCount, error: countError } = await supabase
      .from("log_ai")
      .select("id", { count: "exact", head: true })
      .eq("pengguna_id", user.id)
      .eq("fitur", "tutor_sokratik")
      .gte("dibuat_pada", today.toISOString());

    const currentCount = todayLogsCount || 0;
    const MAX_DAILY_CHAT = 20;

    if (currentCount >= MAX_DAILY_CHAT) {
      return NextResponse.json(
        {
          error:
            "Batas harian interaksi Tutor AI telah tercapai (20 pesan/hari). Silakan coba lagi besok!",
          remainingQuota: 0,
        },
        { status: 429 }
      );
    }

    // 4. Parse Request Body
    const body = await req.json();
    const {
      sesiId,
      soalId,
      materiJudul,
      materiKonten,
      message,
      image,
      history = [],
      mode,
      isGeneralAi,
    } = body;

    if ((!message || typeof message !== "string") && !image) {
      return NextResponse.json(
        { error: "Pesan atau gambar tidak boleh kosong." },
        { status: 400 }
      );
    }

    const isGeneralMode = mode === "general" || isGeneralAi === true;

    // 5. Build System Prompt (General vs Socratic)
    const systemPrompt = isGeneralMode
      ? `Kamu adalah "thinksy AI", asisten AI pintar, ramah, seru, dan serba tahu yang dirancang khusus untuk mendampingi belajar siswa sekolah! 🚀✨

PERSONA & TUGAS UTAMA:
1. Kamu berfungsi sebagai asisten AI pembelajaran umum (seperti ChatGPT / Gemini / Claude) untuk membantu siswa mencari informasi, menjawab pertanyaan akademis, memberikan jawaban lengkap, menjelaskan konsep pelajaran, merangkum materi, dan memberikan saran belajar.
2. Jika siswa mengirimkan GAMBAR/FOTO (misalnya foto soal tugas, diagram, tabel, grafik, atau catatan materi):
   - Analisis dan bacalah isi gambar tersebut secara cermat dan teliti.
   - Berikan penjelasan lengkap, langkah-langkah penyelesaian, atau rangkuman dari gambar yang dikirimkan.
3. Jawablah pertanyaan siswa secara JELAS, LENGKAP, AKURAT, dan INFORMATIF. Tidak perlu menahan jawaban akhir.
4. Gunakan bahasa yang ramah, sopan, bersahabat, dan seru khas anak sekolah.
5. Gunakan format Markdown yang rapi dengan bullet points, tebal (bold), dan contoh-contoh visual agar mudah dibaca.
6. Gunakan format KaTeX untuk menulis rumus matematika ($...$ untuk inline, $$...$$ untuk baris baru).

KONTEKS MATERI/DISKUSI (Jika ada):
- **Judul:** ${materiJudul || "Pendamping Belajar Mandiri"}
- **Topik:** ${materiKonten || "Pencarian Informasi & Bimbingan Akademis Siswa"}`
      : `Kamu adalah "thinksy AI", pendamping belajar Matematika Kelas 8 SMP yang sangat fun, seru, bersahabat, sabar, dan pembimbing matematika yang luar biasa! 😊✨

GAYA & PERSONA:
- Gunakan bahasa yang santai, bersahabat, dan seru khas anak SMP (gunakan emoji sesekali agar menarik 🚀✨).
- Selalu berikan apresiasi atas usaha siswa sekecil apa pun!
- Tetap sopan, ramah, dan bersemangat dalam membantu belajar.

METODE SOKRATIK & PANDUAN BELAJAR (KETAT):
1. DILARANG KERAS memberikan jawaban akhir, solusi instan, atau hasil hitung akhir secara langsung!
2. Jika siswa menanyakan jawaban dari suatu soal, berikan **cara/rumus umum** dan **contoh analogi soal yang mirip** dengan angka yang berbeda. Jangan hitungkan soal asli milik siswa.
3. Bimbing siswa langkah-demi-langkah (step-by-step) dengan memberikan petunjuk bertahap (clue) dan menanyakan pertanyaan pancingan yang memandu mereka agar dapat menemukan jawabannya sendiri.
4. Jika siswa tampak bingung atau kesulitan, pecah konsep/soal menjadi sub-langkah yang jauh lebih kecil dan mudah dipahami.
5. Gunakan format KaTeX untuk menulis rumus matematika agar rapi ($...$ untuk inline, $$...$$ untuk baris baru). Contoh: $U_n = a + (n-1)b$.

PENTING – ATURAN FORMAT RESPONS:
- WAJIB menyelesaikan jawaban hingga selesai penuh. Jangan pernah memotong jawaban di tengah kalimat.
- Jika kamu memberikan beberapa langkah panduan, tuliskan SEMUA langkah tersebut dalam satu respons hingga tuntas.
- Respons harus selalu diakhiri dengan kalimat yang lengkap, bukan berakhir dengan kata sambung atau kata yang menggantung.

KONTEKS MATERI YANG SEDANG DIBUKA USER SAAT INI (Gunakan info ini agar obrolan nyambung dan relevan dengan halaman/materi yang sedang mereka baca/kerjakan):
- **Judul Materi:** ${materiJudul || "Matematika Kelas 8"}
- **Teks Soal/Konten Aktif:** ${materiKonten || "Pola Bilangan & Barisan"}`;


    // 6. Call Google Gemini API (gemini-3.6-flash)
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: "Kunci API Gemini belum dikonfigurasi di server." },
        { status: 500 }
      );
    }

    // Format latest message parts (Text + optional Image)
    const userParts: any[] = [];
    if (image && typeof image === "string" && image.startsWith("data:image/")) {
      const mimeType = image.match(/data:(.*?);base64,/)?.[1] || "image/jpeg";
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      userParts.push({
        inlineData: {
          mimeType,
          data: base64Data,
        },
      });
    }

    userParts.push({ text: message || "Jelaskan gambar ini dan berikan pembahasannya." });

    // Format message history for Gemini API (uses 'model' role instead of 'assistant')
    const formattedMessages = [
      ...history.map((msg: { role: string; content: string }) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      })),
      { role: "user", parts: userParts },
    ];

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${geminiApiKey}`;

    const apiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: formattedMessages,
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
          stopSequences: []
        }
      })
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      throw new Error(`Gemini API Error: ${errorText || apiResponse.statusText}`);
    }

    const responseData = await apiResponse.json();
    const candidate = responseData.candidates?.[0];
    const finishReason = candidate?.finishReason;
    const assistantReply = candidate?.content?.parts?.[0]?.text || "Maaf, thinksy AI tidak dapat memproses jawaban saat ini.";

    // Log jika response terpotong
    if (finishReason && finishReason !== "STOP") {
      console.warn(`[thinksy AI] Response finished with reason: ${finishReason}`);
    }

    const inputTokens = responseData.usageMetadata?.promptTokenCount || 0;
    const outputTokens = responseData.usageMetadata?.candidatesTokenCount || 0;
    const totalTokens = inputTokens + outputTokens;
    
    // Estimated cost calculations (Gemini 2.5 Flash-lite: ~$0.075/M input, $0.30/M output)
    const costUsd = (inputTokens * 0.075 + outputTokens * 0.3) / 1000000;

    // 7. Save chat messages to database if sesiId provided
    if (sesiId) {
      await supabase.from("percakapan_tutor").insert([
        {
          sesi_id: sesiId,
          soal_id: soalId || null,
          pengirim: "siswa",
          pesan: message,
        },
        {
          sesi_id: sesiId,
          soal_id: soalId || null,
          pengirim: "tutor_ai",
          pesan: assistantReply,
        },
      ]);
    }

    // 8. Log AI Token Usage (Always log to log_ai even if sekolahId is NULL)
    let misiClaimResult = { claimed: false, poinDitambahkan: 0 };
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const adminDb = createAdminClient();

      await adminDb.from("log_ai").insert({
        sekolah_id: sekolahId || null,
        pengguna_id: user.id,
        fitur: "tutor_sokratik",
        prompt_tokens: inputTokens,
        completion_tokens: outputTokens,
        total_tokens: totalTokens,
        biaya_usd: costUsd,
      });

      // AUTO-KLAIM misi sokratik jika ini interaksi pertama hari ini
      // currentCount adalah jumlah log SEBELUM insert ini, jadi jika 0 = ini yang pertama
      if (currentCount === 0) {
        misiClaimResult = await autoClaimMisi(supabase, user.id, "sokratik");
        if (!misiClaimResult.claimed) {
          misiClaimResult = await autoClaimMisi(supabase, user.id, "eksplorasi");
        }
      }
    } catch (logErr) {
      console.error("Error writing to log_ai:", logErr);
    }

    const remainingQuota = MAX_DAILY_CHAT - (currentCount + 1);

    return NextResponse.json({
      reply: assistantReply,
      remainingQuota: Math.max(0, remainingQuota),
      usage: {
        totalTokens,
      },
      misiAutoClaimed: misiClaimResult.claimed,
      misiPoinDitambahkan: misiClaimResult.poinDitambahkan,
    });
  } catch (error: any) {
    console.error("Error in Tutor AI Route:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan internal pada server AI." },
      { status: 500 }
    );
  }
}
