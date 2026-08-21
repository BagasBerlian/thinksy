import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: Ambil metrik dashboard super admin
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

  // Total sekolah
  const { count: totalSekolah } = await supabase
    .from("sekolah")
    .select("id", { count: "exact", head: true });

  // Total admin sekolah
  const { count: totalAdmin } = await supabase
    .from("profil")
    .select("id", { count: "exact", head: true })
    .eq("peran", "admin_sekolah");

  // Total biaya AI
  const { data: biayaData } = await supabase
    .from("log_ai")
    .select("biaya_usd");

  let totalBiaya = 0;
  if (biayaData && biayaData.length > 0) {
    totalBiaya = biayaData.reduce(
      (sum: number, row: { biaya_usd: number }) => sum + Number(row.biaya_usd || 0),
      0
    );
  }

  // Total guru
  const { count: totalGuru } = await supabase
    .from("profil")
    .select("id", { count: "exact", head: true })
    .eq("peran", "guru");

  // Total siswa
  const { count: totalSiswa } = await supabase
    .from("profil")
    .select("id", { count: "exact", head: true })
    .eq("peran", "siswa");

  return NextResponse.json({
    totalSekolah: totalSekolah || 0,
    totalAdmin: totalAdmin || 0,
    totalGuru: totalGuru || 0,
    totalSiswa: totalSiswa || 0,
    totalBiayaUsd: totalBiaya,
  });
}
