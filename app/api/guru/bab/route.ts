import { NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mapel = searchParams.get("mapel") || "Matematika";
    const kelas = Number(searchParams.get("kelas") || 8);

    // 1. Try direct PostgreSQL pool query first
    try {
      const pool = getDbPool();
      const res = await pool.query(
        "SELECT id, judul, deskripsi, urutan, mapel, kelas, semester FROM bab WHERE mapel = $1 AND kelas = $2 ORDER BY urutan ASC",
        [mapel, kelas]
      );
      if (res.rows && res.rows.length > 0) {
        return NextResponse.json({
          success: true,
          babs: res.rows,
        });
      }
    } catch (pgErr) {
      console.warn("[GET BAB PG FALLBACK]", pgErr);
    }

    // 2. Fallback to Supabase client
    const adminDb = createAdminClient();
    const { data: babs, error } = await adminDb
      .from("bab")
      .select("id, judul, deskripsi, urutan, mapel, kelas, semester")
      .eq("mapel", mapel)
      .eq("kelas", kelas)
      .order("urutan", { ascending: true });

    if (error) {
      console.error("[GET BAB ERROR]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      babs: babs || [],
    });
  } catch (error: any) {
    console.error("[GET BAB EXCEPTION]", error);
    return NextResponse.json(
      { error: error.message || "Gagal mengambil data bab dari Supabase." },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, judul, deskripsi, urutan } = body;

    if (!id || !judul) {
      return NextResponse.json(
        { error: "ID dan Judul Bab wajib diisi." },
        { status: 400 }
      );
    }

    // 1. Primary: Direct PostgreSQL pool update with superuser privileges
    try {
      const pool = getDbPool();

      // If id is UUID, update by id directly
      let updateQuery = `
        UPDATE bab 
        SET judul = $1, 
            deskripsi = CASE WHEN $2::text IS NOT NULL THEN $2 ELSE deskripsi END,
            urutan = CASE WHEN $3::int IS NOT NULL THEN $3 ELSE urutan END
        WHERE id = $4
        RETURNING id, judul, deskripsi, urutan, mapel, kelas, semester
      `;
      let res = await pool.query(updateQuery, [
        judul.trim(),
        deskripsi !== undefined ? deskripsi.trim() : null,
        urutan !== undefined ? Number(urutan) : null,
        id,
      ]);

      // If not updated by UUID, check if id is a local string like 'mat-bab-1'
      if (res.rows.length === 0 && urutan) {
        const fallbackQuery = `
          UPDATE bab 
          SET judul = $1, 
              deskripsi = CASE WHEN $2::text IS NOT NULL THEN $2 ELSE deskripsi END
          WHERE mapel = 'Matematika' AND kelas = 8 AND urutan = $3
          RETURNING id, judul, deskripsi, urutan, mapel, kelas, semester
        `;
        res = await pool.query(fallbackQuery, [
          judul.trim(),
          deskripsi !== undefined ? deskripsi.trim() : null,
          Number(urutan),
        ]);
      }

      if (res.rows.length > 0) {
        return NextResponse.json({
          success: true,
          message: `Bab "${judul}" berhasil diperbarui di Supabase!`,
          bab: res.rows[0],
        });
      }
    } catch (pgErr) {
      console.warn("[PUT BAB PG FALLBACK]", pgErr);
    }

    // 2. Fallback to Supabase client
    const adminDb = createAdminClient();
    const updatePayload: Record<string, any> = {
      judul: judul.trim(),
    };
    if (deskripsi !== undefined) updatePayload.deskripsi = deskripsi.trim();
    if (urutan !== undefined) updatePayload.urutan = Number(urutan);

    const { data: updatedBab, error } = await adminDb
      .from("bab")
      .update(updatePayload)
      .eq("id", id)
      .select();

    if (error) {
      console.error("[UPDATE BAB ERROR]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Bab "${judul}" berhasil diperbarui di Supabase!`,
      bab: updatedBab?.[0] || { id, judul, deskripsi, urutan },
    });
  } catch (error: any) {
    console.error("[PUT BAB EXCEPTION]", error);
    return NextResponse.json(
      { error: error.message || "Gagal memperbarui bab di Supabase." },
      { status: 500 }
    );
  }
}

// POST can also be used as fallback for environments where PUT is restricted
export async function POST(req: Request) {
  return PUT(req);
}
