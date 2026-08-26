import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Anda harus masuk terlebih dahulu." },
        { status: 401 }
      );
    }

    // STRICTLY FILTER BY ROLE = 'siswa' ONLY using adminSupabase (or fallback to supabase)
    let { data: leaderboardData, error } = await adminSupabase
      .from("profil")
      .select(`
        id,
        nama_lengkap,
        poin,
        streak,
        peran,
        dibuat_pada,
        sekolah (
          nama
        )
      `)
      .eq("peran", "siswa")
      .order("poin", { ascending: false })
      .order("dibuat_pada", { ascending: true })
      .limit(100);

    if (error || !leaderboardData || leaderboardData.length <= 1) {
      const fallbackRes = await supabase
        .from("profil")
        .select(`
          id,
          nama_lengkap,
          poin,
          streak,
          peran,
          dibuat_pada,
          sekolah (
            nama
          )
        `)
        .eq("peran", "siswa")
        .order("poin", { ascending: false })
        .order("dibuat_pada", { ascending: true })
        .limit(100);

      if (fallbackRes.data && fallbackRes.data.length > 0) {
        leaderboardData = fallbackRes.data;
      }
    }

    if (error) {
      console.error("[PERINGKAT ERROR]", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Format output leaderboard
    const formattedLeaderboard = (leaderboardData || []).map((student, index) => ({
      rank: index + 1,
      id: student.id,
      name: student.nama_lengkap || "Siswa",
      points: student.poin || 0,
      streak: student.streak || 0,
      school: (student.sekolah as any)?.nama || "SMP Negeri 1 Nusantara",
      isCurrentUser: student.id === user.id,
    }));

    return NextResponse.json({
      success: true,
      leaderboard: formattedLeaderboard,
      totalStudents: formattedLeaderboard.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Terjadi kesalahan server: " + err.message },
      { status: 500 }
    );
  }
}
