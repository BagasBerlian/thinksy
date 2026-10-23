import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = await createClient();
    const adminDb = createAdminClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Default configuration
    const defaultSettings = {
      kelas: {
        enabled: true,
        dailyTokens: 20,
        guidanceLevel: "socratic",
        allowExplanation: true,
      },
      kuis: {
        enabled: true,
        tokensPerQuiz: 5,
        strictAntiCheat: true,
        cooldownSeconds: 30,
        showQuotaWarning: true,
      },
    };

    if (!user) {
      return NextResponse.json({ success: true, settings: defaultSettings });
    }

    // Try fetching from sekolah metadata or return default
    const { data: profile } = await adminDb
      .from("profil")
      .select("sekolah_id")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.sekolah_id) {
      const { data: sekolah } = await adminDb
        .from("sekolah")
        .select("konfigurasi")
        .eq("id", profile.sekolah_id)
        .maybeSingle();

      if (sekolah?.konfigurasi?.ai_settings) {
        return NextResponse.json({
          success: true,
          settings: sekolah.konfigurasi.ai_settings,
        });
      }
    }

    return NextResponse.json({ success: true, settings: defaultSettings });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const adminDb = createAdminClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await req.json();

    if (user) {
      const { data: profile } = await adminDb
        .from("profil")
        .select("sekolah_id")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.sekolah_id) {
        const { data: sekolah } = await adminDb
          .from("sekolah")
          .select("konfigurasi")
          .eq("id", profile.sekolah_id)
          .maybeSingle();

        const currentConfig = sekolah?.konfigurasi || {};
        const updatedConfig = {
          ...currentConfig,
          ai_settings: body,
        };

        await adminDb
          .from("sekolah")
          .update({ konfigurasi: updatedConfig })
          .eq("id", profile.sekolah_id);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Pengaturan AI Siswa berhasil disimpan",
      settings: body,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
