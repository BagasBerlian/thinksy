// Route ini sudah tidak digunakan — peran tidak lagi dipilih oleh user sendiri.
// Dihapus sebagai bagian dari sistem peran berbasis undangan.
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Endpoint ini sudah tidak aktif. Peran ditentukan otomatis saat pendaftaran." },
    { status: 410 }
  );
}
