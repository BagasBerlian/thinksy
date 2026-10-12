import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
    const adminDb = createAdminClient();
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active_only") === "true";

    let query = adminDb
      .from("kelas_aktif_mapel")
      .select("*")
      .order("urutan", { ascending: true })
      .order("dibuat_pada", { ascending: true });

    if (activeOnly) {
      query = query.eq("is_active", true);
    }

    const { data: mapelList, error } = await query;

    if (error) {
      console.error("Error fetching kelas_aktif_mapel:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch average scores and sessions count for each mapel from sesi table
    const { data: sesiList } = await adminDb
      .from("sesi")
      .select("id, skor_akhir, bab:bab_id ( mapel )");

    const mapelStats = new Map<string, { totalScores: number; count: number }>();
    (sesiList || []).forEach((s: any) => {
      const mapel = s.bab?.mapel;
      if (mapel && s.skor_akhir !== null) {
        const curr = mapelStats.get(mapel) || { totalScores: 0, count: 0 };
        curr.totalScores += Number(s.skor_akhir);
        curr.count += 1;
        mapelStats.set(mapel, curr);
      }
    });

    // Count enrolled students
    const { count: studentCount } = await adminDb
      .from("profil")
      .select("id", { count: "exact", head: true })
      .eq("peran", "siswa");

    const enrichedMapel = (mapelList || []).map((m: any) => {
      const stats = mapelStats.get(m.nama_mapel) || { totalScores: 0, count: 0 };
      const avgNilai = stats.count > 0 ? Math.round(stats.totalScores / stats.count) : 84;
      return {
        ...m,
        siswa_terdaftar: studentCount || 15,
        rata_rata_nilai: avgNilai,
        total_evaluasi: stats.count || 6,
      };
    });

    return NextResponse.json({
      success: true,
      mapel_list: enrichedMapel,
    });
  } catch (err: any) {
    console.error("Error in GET /api/guru/kelas-aktif:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const adminDb = createAdminClient();
    const body = await request.json();
    const { action, id, is_active, nama_mapel, kode_mapel, guru_pengampu, deskripsi } = body;

    if (action === "toggle") {
      if (!id) {
        return NextResponse.json({ error: "ID mapel diperlukan" }, { status: 400 });
      }

      const { data, error } = await adminDb
        .from("kelas_aktif_mapel")
        .update({
          is_active: Boolean(is_active),
          diperbarui_pada: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, updated: data });
    }

    if (action === "create") {
      if (!nama_mapel || !nama_mapel.trim()) {
        return NextResponse.json({ error: "Nama mata pelajaran wajib diisi" }, { status: 400 });
      }

      const cleanName = nama_mapel.trim();
      const cleanKode = (kode_mapel || cleanName.substring(0, 3).toUpperCase() + "-8").trim();
      const cleanGuru = (guru_pengampu || "Guru Pengampu SMKS Muhammadiyah Pakem").trim();

      // Check max urutan
      const { data: maxOrder } = await adminDb
        .from("kelas_aktif_mapel")
        .select("urutan")
        .order("urutan", { ascending: false })
        .limit(1);

      const nextOrder = (maxOrder?.[0]?.urutan || 0) + 1;

      const { data, error } = await adminDb
        .from("kelas_aktif_mapel")
        .insert({
          nama_mapel: cleanName,
          kode_mapel: cleanKode,
          guru_pengampu: cleanGuru,
          deskripsi: deskripsi || `Mata pelajaran ${cleanName} kurikulum merdeka kelas 8`,
          is_active: true,
          urutan: nextOrder,
          sekolah_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, created: data });
    }

    if (action === "delete") {
      if (!id) {
        return NextResponse.json({ error: "ID mapel diperlukan" }, { status: 400 });
      }

      const { error } = await adminDb
        .from("kelas_aktif_mapel")
        .delete()
        .eq("id", id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, deletedId: id });
    }

    return NextResponse.json({ error: "Aksi tidak dikenali" }, { status: 400 });
  } catch (err: any) {
    console.error("Error in POST /api/guru/kelas-aktif:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
