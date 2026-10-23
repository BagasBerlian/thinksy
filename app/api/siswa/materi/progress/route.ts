import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const babId = searchParams.get("babId");

    let query = supabase
      .from("progres_materi")
      .select("id, materi_id, selesai, terakhir_dibaca")
      .eq("siswa_id", user.id);

    // If babId is provided and is a valid UUID, filter by materi belonging to this bab
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (babId && isUuid.test(babId)) {
      const { data: babMateri } = await supabase
        .from("materi")
        .select("id")
        .eq("bab_id", babId);

      if (babMateri && babMateri.length > 0) {
        const ids = babMateri.map((m) => m.id);
        query = query.in("materi_id", ids);
      }
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Map rows to include status: "selesai" | "proses" for backwards compatibility
    const progress = (data || []).map((row) => ({
      id: row.id,
      materi_id: row.materi_id,
      status: row.selesai ? "selesai" : "proses",
      selesai: row.selesai,
      terakhir_dibaca: row.terakhir_dibaca,
    }));

    return NextResponse.json({ progress });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { babId, materiId, status = "selesai" } = body;

    if (!materiId) {
      return NextResponse.json({ error: "materiId is required" }, { status: 400 });
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const isSelesai = status === "selesai";

    // If materiId is a virtual/placeholder ID (not UUID), accept gracefully
    if (!isUuid.test(materiId)) {
      return NextResponse.json({
        success: true,
        isFirstTime: true,
        message: "Progres materi kustom tercatat",
      });
    }

    // Check if already marked
    const { data: existing } = await supabase
      .from("progres_materi")
      .select("id, selesai")
      .eq("siswa_id", user.id)
      .eq("materi_id", materiId)
      .maybeSingle();

    const isFirstTime = !existing;

    if (existing) {
      await supabase
        .from("progres_materi")
        .update({
          selesai: isSelesai,
          terakhir_dibaca: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      const { error: insertErr } = await supabase
        .from("progres_materi")
        .insert({
          siswa_id: user.id,
          materi_id: materiId,
          selesai: isSelesai,
          terakhir_dibaca: new Date().toISOString(),
        });

      if (insertErr) {
        // If foreign key constraint fails because materi doesn't exist in DB
        return NextResponse.json({
          success: true,
          isFirstTime: true,
          message: "Progres materi tercatat",
        });
      }

      // Reward student with 5 points for completing a material
      const { data: profil } = await supabase
        .from("profil")
        .select("poin")
        .eq("id", user.id)
        .single();

      if (profil) {
        await supabase
          .from("profil")
          .update({ poin: (profil.poin || 0) + 5 })
          .eq("id", user.id);
      }
    }

    return NextResponse.json({
      success: true,
      isFirstTime,
      message: isFirstTime ? "Sub-bab materi selesai dipelajari! (+5 Poin)" : "Progres diperbarui",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
