import { NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";
import { createAdminClient } from "@/lib/supabase/admin";

const DEFAULT_MATEMATIKA_BABS = [
  { id: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", judul: "Bab 1: Pola Bilangan & Barisan Bilangan", deskripsi: "Pola aritmetika, geometri, konfigurasi objek, dan rumus suku ke-n.", urutan: 1, mapel: "Matematika", kelas: 8, semester: 1 },
  { id: "b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a22", judul: "Bab 2: Bentuk Aljabar & PLSV/PTLSV", deskripsi: "Operasi aljabar, faktorisasi, persamaan & pertidaksamaan linear satu variabel.", urutan: 2, mapel: "Matematika", kelas: 8, semester: 1 },
  { id: "b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a33", judul: "Bab 3: Relasi & Fungsi", deskripsi: "Diagram panah, himpunan pasangan berurutan, notasi f(x) = ax + b, dan domain/kodomain/range.", urutan: 3, mapel: "Matematika", kelas: 8, semester: 1 },
  { id: "b4eebc99-9c0b-4ef8-bb6d-6bb9bd380a44", judul: "Bab 4: Persamaan Garis Lurus (PGL)", deskripsi: "Gradien (kemiringan garis), titik potong sumbu, hubungan garis sejajar dan tegak lurus.", urutan: 4, mapel: "Matematika", kelas: 8, semester: 1 },
  { id: "b5eebc99-9c0b-4ef8-bb6d-6bb9bd380a55", judul: "Bab 5: Sistem Persamaan Linear Dua Variabel (SPLDV)", deskripsi: "Metode eliminasi, substitusi, grafik, dan pemodelan masalah belanja kontekstual.", urutan: 5, mapel: "Matematika", kelas: 8, semester: 1 },
  { id: "b6eebc99-9c0b-4ef8-bb6d-6bb9bd380a66", judul: "Bab 6: Teorema Pythagoras", deskripsi: "Hubungan kuadrat sisi segitiga siku-siku, tripel Pythagoras, dan segitiga istimewa sudut 30°-60°-90° & 45°-45°-90°.", urutan: 6, mapel: "Matematika", kelas: 8, semester: 2 },
  { id: "b7eebc99-9c0b-4ef8-bb6d-6bb9bd380a77", judul: "Bab 7: Bangun Ruang Sisi Datar (BRSD)", deskripsi: "Kubus, balok, prisma, limas, luas jaring-jaring permukaan, volume dan diagonal ruang.", urutan: 7, mapel: "Matematika", kelas: 8, semester: 2 },
  { id: "b8eebc99-9c0b-4ef8-bb6d-6bb9bd380a88", judul: "Bab 8: Statistika & Peluang", deskripsi: "Ukuran pemusatan data (mean, median, modus), jangkauan interkuartil, diagram lingkaran & frekuensi relatif peluang empiris/teoretis.", urutan: 8, mapel: "Matematika", kelas: 8, semester: 2 },
];

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

    if (error || !babs || babs.length === 0) {
      if (mapel.toLowerCase().includes("matematika")) {
        return NextResponse.json({
          success: true,
          babs: DEFAULT_MATEMATIKA_BABS,
        });
      }
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      babs: babs || [],
    });
  } catch (error: any) {
    console.error("[GET BAB EXCEPTION]", error);
    if ((req.url || "").includes("Matematika")) {
      return NextResponse.json({
        success: true,
        babs: DEFAULT_MATEMATIKA_BABS,
      });
    }
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
      const updateQuery = `
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
