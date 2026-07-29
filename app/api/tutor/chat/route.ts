import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

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
      history = [],
    } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Pesan tidak boleh kosong." },
        { status: 400 }
      );
    }

    // 5. Build Socratic System Prompt
    const systemPrompt = `Kamu adalah "Tutor AI Sokratik", pendamping belajar Matematika Kelas 8 SMP yang ramah, sabar, dan komunikatif.

ATURAN UTAMA (KETAT & TIDAK BOLEH DILANGGAR):
1. DILARANG KERAS memberikan jawaban akhir atau penyelesaian akhir soal matematika secara langsung!
2. Gunakan METODE SOKRATIK: Bimbing siswa step-by-step dengan memberikan petunjuk bertahap (clue) dan mengajukan pertanyaan balik agar siswa dapat menemukan jawabannya secara mandiri.
3. Selalu berikan sapaan dan semangat yang ramah khas siswa SMP.
4. FORMAT RUMUS MATEMATIKA: Bila menuliskan simbol/rumus matematika, WAJIB menggunakan format KaTeX ($...$ untuk inline, $$...$$ untuk blok). Contoh: $U_n = a + (n-1)b$.
5. Jika siswa tampak kesulitan, pecah soal menjadi langkah-langkah yang lebih kecil dan sederhana.

KONTEKS MATERI SAAT INI:
- Judul Materi: ${materiJudul || "Matematika Kelas 8"}
- Ringkasan Materi: ${materiKonten ? materiKonten.substring(0, 500) : "Pola Bilangan & Barisan"}`;

    // 6. Call Anthropic Claude API
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicApiKey) {
      return NextResponse.json(
        { error: "Kunci API Anthropic belum dikonfigurasi di server." },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({
      apiKey: anthropicApiKey,
    });

    // Format message history for Anthropic SDK
    const formattedMessages = [
      ...history.map((msg: { role: string; content: string }) => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      system: systemPrompt,
      messages: formattedMessages,
    });

    const assistantReply =
      response.content[0]?.type === "text"
        ? response.content[0].text
        : "Maaf, Tutor AI tidak dapat memproses jawaban saat ini.";

    const inputTokens = response.usage.input_tokens || 0;
    const outputTokens = response.usage.output_tokens || 0;
    const totalTokens = inputTokens + outputTokens;
    // Estimated cost calculations (Claude 3.5 Sonnet: ~$3/M input, $15/M output)
    const costUsd = (inputTokens * 3 + outputTokens * 15) / 1000000;

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

    // 8. Log AI Token Usage
    if (sekolahId) {
      await supabase.from("log_ai").insert({
        sekolah_id: sekolahId,
        pengguna_id: user.id,
        fitur: "tutor_sokratik",
        prompt_tokens: inputTokens,
        completion_tokens: outputTokens,
        total_tokens: totalTokens,
        biaya_usd: costUsd,
      });
    }

    const remainingQuota = MAX_DAILY_CHAT - (currentCount + 1);

    return NextResponse.json({
      reply: assistantReply,
      remainingQuota: Math.max(0, remainingQuota),
      usage: {
        totalTokens,
      },
    });
  } catch (error: any) {
    console.error("Error in Tutor AI Route:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan internal pada server AI." },
      { status: 500 }
    );
  }
}
