import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const adminDb = createAdminClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    let body: any = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { foto_url, nama_lengkap, nisn, nis, jurusan, tahun_ajaran } = body;

    const updateData: Record<string, any> = {};
    if (foto_url !== undefined) updateData.foto_url = foto_url;
    if (nama_lengkap) updateData.nama_lengkap = nama_lengkap.trim();
    if (nisn) updateData.nisn = nisn.trim();
    if (nis) updateData.nis = nis.trim();
    if (jurusan) updateData.jurusan = jurusan;
    if (tahun_ajaran) updateData.tahun_ajaran = tahun_ajaran;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "No fields to update" }, { status: 200 });
    }

    if (user) {
      const { data, error } = await adminDb
        .from("profil")
        .update(updateData)
        .eq("id", user.id)
        .select()
        .single();

      if (error) {
        console.error("[POST /api/siswa/profil Error]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, profil: data });
    } else {
      // In guest / mock mode, if nisn or name provided, update matching student
      if (nisn || nama_lengkap) {
        let query = adminDb.from("profil").update(updateData);
        if (nisn) {
          query = query.eq("nisn", nisn.trim());
        } else if (nama_lengkap) {
          query = query.ilike("nama_lengkap", `%${nama_lengkap.trim()}%`);
        }
        const { data, error } = await query.select();
        if (!error && data && data.length > 0) {
          return NextResponse.json({ success: true, profil: data[0] });
        }
      }

      return NextResponse.json({
        success: true,
        message: "Profile updated in local session (unauthenticated)",
        data: updateData,
      });
    }
  } catch (err: any) {
    console.error("[POST /api/siswa/profil Error]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
