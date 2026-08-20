import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Anda harus masuk terlebih dahulu." },
        { status: 401 }
      );
    }

    let body: { questId: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Request body tidak valid." }, { status: 400 });
    }

    const { questId } = body;

    if (!questId) {
      return NextResponse.json({ error: "questId wajib diisi." }, { status: 400 });
    }

    // 1. Ambil data misi dari DB atau fallback
    let rewardPoints = 20;
    let questTitle = "Misi Harian";

    const { data: quest, error: questError } = await supabase
      .from("misi_harian")
      .select("*")
      .eq("id", questId)
      .maybeSingle();

    if (quest) {
      if (quest.diklaim) {
        return NextResponse.json(
          { error: "Misi ini sudah diklaim sebelumnya." },
          { status: 400 }
        );
      }
      if (quest.progres_saat_ini < quest.target_max) {
        return NextResponse.json(
          { error: "Misi belum selesai." },
          { status: 400 }
        );
      }
      rewardPoints = quest.poin_hadiah;
      questTitle = quest.judul;

      // Tandai misi sebagai diklaim di DB jika ada
      await supabase
        .from("misi_harian")
        .update({ diklaim: true })
        .eq("id", questId);
    } else {
      // Fallback jika ID misi berbentuk 'q1', 'q2', 'q3'
      if (questId === "q1") rewardPoints = 20;
      else if (questId === "q2") rewardPoints = 50;
      else if (questId === "q3") rewardPoints = 30;
      else rewardPoints = 20;
    }

    // 3. Tambah poin di tabel profil
    const { data: profil } = await supabase
      .from("profil")
      .select("poin")
      .eq("id", user.id)
      .single();

    const poinLama = profil?.poin || 1250;
    const poinBaru = poinLama + rewardPoints;

    await supabase
      .from("profil")
      .update({ poin: poinBaru })
      .eq("id", user.id);

    return NextResponse.json({
      success: true,
      message: `Berhasil mengklaim ${rewardPoints} poin!`,
      reward: rewardPoints,
      totalPoin: poinBaru,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Terjadi kesalahan server: " + err.message },
      { status: 500 }
    );
  }
}
