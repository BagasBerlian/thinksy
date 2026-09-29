import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const currentUserId = user?.id || null;

    // 1. Ambil profil user saat ini (jika login) untuk mengetahui sekolah_id miliknya
    let userSekolahId: string | null = null;
    if (currentUserId) {
      const { data: userProfil } = await adminSupabase
        .from("profil")
        .select("sekolah_id")
        .eq("id", currentUserId)
        .maybeSingle();

      userSekolahId = userProfil?.sekolah_id || null;
    }

    // 2. Panggil RPC SECURITY DEFINER `get_peringkat_sekolah` per sekolah_id
    let rpcData: any[] | null = null;
    try {
      const res = await adminSupabase.rpc("get_peringkat_sekolah", {
        p_sekolah_id: userSekolahId,
      });
      if (!res.error && Array.isArray(res.data) && res.data.length > 0) {
        rpcData = res.data;
      }
    } catch (e) {
      console.warn("[RPC GET_PERINGKAT ERROR]", e);
    }

    // Jika kosong dengan filter sekolah tertentu, ambil seluruh siswa aktif (p_sekolah_id: null)
    if (!rpcData || rpcData.length === 0) {
      try {
        const { data: allRpcData, error: allRpcErr } = await adminSupabase.rpc(
          "get_peringkat_sekolah",
          { p_sekolah_id: null }
        );
        if (!allRpcErr && Array.isArray(allRpcData) && allRpcData.length > 0) {
          rpcData = allRpcData;
        }
      } catch (e) {
        console.warn("[RPC GET_PERINGKAT GLOBAL ERROR]", e);
      }
    }

    let leaderboardRows: any[] = [];

    if (rpcData && rpcData.length > 0) {
      leaderboardRows = rpcData.map((row: any, idx: number) => ({
        rank: Number(row.rank) || idx + 1,
        id: row.student_id || row.id,
        name: row.nama_lengkap || "Siswa",
        points: Number(row.poin) || 0,
        streak: Number(row.streak) || 0,
        school: row.nama_sekolah || "SMK Muhammadiyah Pakem",
        isCurrentUser: currentUserId ? (row.student_id || row.id) === currentUserId : false,
      }));
    } else {
      // 3. Fallback jika RPC tidak mengembalikan data: Query tabel profil langsung dari adminSupabase
      let query = adminSupabase
        .from("profil")
        .select(`
          id,
          nama_lengkap,
          poin,
          streak,
          sekolah_id,
          dibuat_pada,
          sekolah:sekolah_id ( nama )
        `)
        .eq("peran", "siswa")
        .order("poin", { ascending: false })
        .order("dibuat_pada", { ascending: true })
        .limit(100);

      const { data: fallbackData } = await query;

      leaderboardRows = (fallbackData || []).map((student: any, index: number) => ({
        rank: index + 1,
        id: student.id,
        name: student.nama_lengkap || "Siswa",
        points: Number(student.poin) || 0,
        streak: Number(student.streak) || 0,
        school: student.sekolah?.nama || "SMK Muhammadiyah Pakem",
        isCurrentUser: currentUserId ? student.id === currentUserId : false,
      }));
    }

    return NextResponse.json(
      {
        success: true,
        leaderboard: leaderboardRows,
        totalStudents: leaderboardRows.length,
        scope: "sekolah",
        updatedAt: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "Terjadi kesalahan server: " + err.message },
      { status: 500 }
    );
  }
}
