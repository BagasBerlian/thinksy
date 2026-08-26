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

    // 1. Ambil profil user saat ini untuk mengetahui sekolah_id miliknya
    const { data: userProfil } = await supabase
      .from("profil")
      .select("sekolah_id")
      .eq("id", user.id)
      .single();

    const userSekolahId = userProfil?.sekolah_id || null;

    // 2. Panggil RPC SECURITY DEFINER `get_peringkat_sekolah` per sekolah_id
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "get_peringkat_sekolah",
      { p_sekolah_id: userSekolahId }
    );

    let leaderboardRows: any[] = [];

    if (!rpcError && rpcData && rpcData.length > 0) {
      leaderboardRows = rpcData.map((row: any) => ({
        rank: Number(row.rank),
        id: row.student_id,
        name: row.nama_lengkap || "Siswa",
        points: row.poin || 0,
        streak: row.streak || 0,
        school: row.nama_sekolah || "Sekolah",
        isCurrentUser: row.student_id === user.id,
      }));
    } else {
      // 3. Fallback jika RPC belum di-deploy: Query via adminSupabase difilter ketat per sekolah_id & peran = 'siswa'
      let query = adminSupabase
        .from("profil")
        .select(`
          id,
          nama_lengkap,
          poin,
          streak,
          sekolah_id,
          sekolah (
            nama
          )
        `)
        .eq("peran", "siswa")
        .order("poin", { ascending: false })
        .order("dibuat_pada", { ascending: true })
        .limit(100);

      if (userSekolahId) {
        query = query.eq("sekolah_id", userSekolahId);
      }

      const { data: fallbackData } = await query;

      leaderboardRows = (fallbackData || []).map((student: any, index: number) => ({
        rank: index + 1,
        id: student.id,
        name: student.nama_lengkap || "Siswa",
        points: student.poin || 0,
        streak: student.streak || 0,
        school: student.sekolah?.nama || "Sekolah",
        isCurrentUser: student.id === user.id,
      }));
    }

    return NextResponse.json({
      success: true,
      leaderboard: leaderboardRows,
      totalStudents: leaderboardRows.length,
      scope: "sekolah",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Terjadi kesalahan server: " + err.message },
      { status: 500 }
    );
  }
}
