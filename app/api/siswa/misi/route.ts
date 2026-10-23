import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// ─── Helper: Auto-klaim misi (Dinonaktifkan demi kepatuhan Modul MVP) ────────
export async function autoClaimMisi(
  _adminDb: ReturnType<typeof createAdminClient>,
  _siswaId: string,
  _judulKeyword: string
): Promise<{ claimed: boolean; poinDitambahkan: number; poinTotal: number }> {
  // Sesuai modul MVP Handbook §7: Dilarang gamifikasi (leaderboard, poin, streak, badge).
  return { claimed: false, poinDitambahkan: 0, poinTotal: 0 };
}

// ─── GET: Ambil misi harian siswa (Kosong sesuai batasan MVP) ───────────────
export async function GET() {
  return NextResponse.json({
    success: true,
    missions: [],
    message: "Gamifikasi & misi harian dinonaktifkan sesuai modul kerja MVP Thinksy.",
  });
}

// ─── POST: Klaim reward misi harian (Dinonaktifkan) ───────────────────────────
export async function POST() {
  return NextResponse.json({
    success: false,
    error: "Fitur klaim misi dan poin telah dinonaktifkan sesuai spesifikasi modul kerja MVP.",
  });
}
