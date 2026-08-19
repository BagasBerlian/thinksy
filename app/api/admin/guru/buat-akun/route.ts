import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  // Verifikasi bahwa pemanggil adalah admin_sekolah atau super_admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Tidak terautentikasi." },
      { status: 401 }
    );
  }

  const { data: profilPemanggil } = await supabase
    .from("profil")
    .select("peran, nama_lengkap, sekolah_id")
    .eq("id", user.id)
    .single();

  if (
    !profilPemanggil ||
    !["admin_sekolah", "super_admin"].includes(profilPemanggil.peran)
  ) {
    return NextResponse.json(
      { error: "Akses ditolak. Hanya Admin Sekolah yang dapat membuat akun Guru." },
      { status: 403 }
    );
  }

  // Parse body
  let body: { nama_lengkap: string; email: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body tidak valid." }, { status: 400 });
  }

  const { nama_lengkap, email } = body;

  if (!nama_lengkap || !email) {
    return NextResponse.json(
      { error: "Nama lengkap dan email wajib diisi." },
      { status: 400 }
    );
  }

  // Validasi format email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Format email tidak valid." }, { status: 400 });
  }

  const emailNormalized = email.toLowerCase().trim();

  // Cek apakah sudah ada undangan aktif untuk email ini
  const { data: undanganAda } = await supabase
    .from("undangan")
    .select("id, peran, kadaluarsa_pada")
    .eq("email", emailNormalized)
    .eq("digunakan", false)
    .gt("kadaluarsa_pada", new Date().toISOString())
    .single();

  if (undanganAda) {
    return NextResponse.json(
      {
        error: `Email ${emailNormalized} sudah memiliki undangan aktif sebagai ${undanganAda.peran}. Undangan berlaku hingga ${new Date(undanganAda.kadaluarsa_pada).toLocaleDateString("id-ID")}.`,
      },
      { status: 409 }
    );
  }

  // Buat undangan baru untuk guru
  const { data: undanganBaru, error: undanganError } = await supabase
    .from("undangan")
    .insert({
      email: emailNormalized,
      peran: "guru",
      dibuat_oleh: user.id,
      nama_yang_diundang: nama_lengkap.trim(),
      sekolah_id: profilPemanggil.sekolah_id || null,
    })
    .select("id, email, kadaluarsa_pada")
    .single();

  if (undanganError) {
    console.error("[buat-akun-guru] Error:", undanganError.message);
    return NextResponse.json(
      { error: "Gagal membuat undangan. " + undanganError.message },
      { status: 500 }
    );
  }

  console.log(
    `[buat-akun-guru] Undangan guru dibuat oleh ${profilPemanggil.nama_lengkap} untuk ${emailNormalized}`
  );

  return NextResponse.json({
    success: true,
    message: `Undangan berhasil dibuat untuk ${emailNormalized}. Mereka bisa mendaftar atau login dengan email tersebut untuk bergabung sebagai Guru.`,
    undangan: {
      id: undanganBaru.id,
      email: undanganBaru.email,
      berlaku_hingga: undanganBaru.kadaluarsa_pada,
    },
  });
}

// GET: ambil daftar undangan guru yang dibuat oleh admin ini
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
  }

  const { data: profilPemanggil } = await supabase
    .from("profil")
    .select("peran")
    .eq("id", user.id)
    .single();

  if (
    !profilPemanggil ||
    !["admin_sekolah", "super_admin"].includes(profilPemanggil.peran)
  ) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  const query = supabase
    .from("undangan")
    .select("id, email, nama_yang_diundang, digunakan, dibuat_pada, kadaluarsa_pada")
    .eq("peran", "guru")
    .order("dibuat_pada", { ascending: false });

  // Super admin bisa lihat semua, admin_sekolah hanya yang dibuatnya
  if (profilPemanggil.peran === "admin_sekolah") {
    query.eq("dibuat_oleh", user.id);
  }

  const { data: undanganList, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ undangan: undanganList });
}
