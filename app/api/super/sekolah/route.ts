import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: Daftar semua sekolah (tenant)
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
  }

  const { data: profil } = await supabase
    .from("profil")
    .select("peran")
    .eq("id", user.id)
    .single();

  if (!profil || profil.peran !== "super_admin") {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  const { data: sekolahList, error } = await supabase
    .from("sekolah")
    .select("id, nama, npsn, alamat, dibuat_pada")
    .order("dibuat_pada", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sekolah: sekolahList || [] });
}

// POST: Registrasi tenant sekolah baru
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
  }

  const { data: profil } = await supabase
    .from("profil")
    .select("peran, nama_lengkap")
    .eq("id", user.id)
    .single();

  if (!profil || profil.peran !== "super_admin") {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  let body: { nama: string; npsn?: string; alamat?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body tidak valid." }, { status: 400 });
  }

  const { nama, npsn, alamat } = body;

  if (!nama || nama.trim().length < 3) {
    return NextResponse.json(
      { error: "Nama sekolah wajib diisi (minimal 3 karakter)." },
      { status: 400 }
    );
  }

  // Cek duplikat NPSN jika diisi
  if (npsn && npsn.trim()) {
    const { data: existing } = await supabase
      .from("sekolah")
      .select("id")
      .eq("npsn", npsn.trim())
      .single();

    if (existing) {
      return NextResponse.json(
        { error: `NPSN ${npsn} sudah terdaftar untuk sekolah lain.` },
        { status: 409 }
      );
    }
  }

  const { data: newSekolah, error: insertError } = await supabase
    .from("sekolah")
    .insert({
      nama: nama.trim(),
      npsn: npsn?.trim() || null,
      alamat: alamat?.trim() || null,
    })
    .select("id, nama, npsn, alamat, dibuat_pada")
    .single();

  if (insertError) {
    console.error("[super/sekolah] Insert error:", insertError.message);
    return NextResponse.json(
      { error: "Gagal mendaftarkan sekolah: " + insertError.message },
      { status: 500 }
    );
  }

  console.log(
    `[super/sekolah] Tenant baru didaftarkan oleh ${profil.nama_lengkap}: ${nama}`
  );

  return NextResponse.json({
    success: true,
    message: `Sekolah "${nama}" berhasil didaftarkan sebagai tenant baru.`,
    sekolah: newSekolah,
  });
}

// DELETE: Hapus sekolah (tenant)
export async function DELETE(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
  }

  const { data: profil } = await supabase
    .from("profil")
    .select("peran")
    .eq("id", user.id)
    .single();

  if (!profil || profil.peran !== "super_admin") {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const sekolahId = searchParams.get("id");

  if (!sekolahId) {
    return NextResponse.json({ error: "ID sekolah wajib disertakan." }, { status: 400 });
  }

  const { error: deleteError } = await supabase
    .from("sekolah")
    .delete()
    .eq("id", sekolahId);

  if (deleteError) {
    console.error("[super/sekolah] Delete error:", deleteError.message);
    return NextResponse.json(
      { error: "Gagal menghapus sekolah: " + deleteError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Sekolah berhasil dihapus.",
  });
}
