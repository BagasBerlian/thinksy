import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  // Verifikasi bahwa pemanggil adalah super_admin
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
    .select("peran, nama_lengkap")
    .eq("id", user.id)
    .single();

  if (!profilPemanggil || profilPemanggil.peran !== "super_admin") {
    return NextResponse.json(
      { error: "Akses ditolak. Hanya Super Admin yang dapat membuat akun Admin Sekolah." },
      { status: 403 }
    );
  }

  // Parse body
  let body: { nama_lengkap: string; email: string; sekolah_id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body tidak valid." }, { status: 400 });
  }

  const { nama_lengkap, email, sekolah_id } = body;

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

  // Buat undangan baru untuk admin_sekolah
  const insertData: any = {
    email: emailNormalized,
    peran: "admin_sekolah",
    dibuat_oleh: user.id,
    nama_yang_diundang: nama_lengkap.trim(),
  };

  if (sekolah_id) {
    insertData.sekolah_id = sekolah_id;
  }

  const { data: undanganBaru, error: undanganError } = await supabase
    .from("undangan")
    .insert(insertData)
    .select("id, email, kadaluarsa_pada")
    .single();

  if (undanganError) {
    console.error("[buat-akun-admin-sekolah] Error:", undanganError.message);
    return NextResponse.json(
      { error: "Gagal membuat undangan. " + undanganError.message },
      { status: 500 }
    );
  }

  console.log(
    `[buat-akun-admin-sekolah] Undangan admin_sekolah dibuat oleh ${profilPemanggil.nama_lengkap} untuk ${emailNormalized}`
  );

  return NextResponse.json({
    success: true,
    message: `Undangan berhasil dibuat untuk ${emailNormalized}. Mereka bisa mendaftar atau login dengan email tersebut untuk bergabung sebagai Admin Sekolah.`,
    undangan: {
      id: undanganBaru.id,
      email: undanganBaru.email,
      berlaku_hingga: undanganBaru.kadaluarsa_pada,
    },
  });
}

// GET: ambil daftar semua undangan admin_sekolah
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

  if (!profilPemanggil || profilPemanggil.peran !== "super_admin") {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  const { data: undanganList, error } = await supabase
    .from("undangan")
    .select("id, email, nama_yang_diundang, digunakan, dibuat_pada, kadaluarsa_pada, sekolah_id")
    .eq("peran", "admin_sekolah")
    .order("dibuat_pada", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ undangan: undanganList });
}
