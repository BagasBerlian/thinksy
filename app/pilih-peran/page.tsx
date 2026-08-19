import { redirect } from "next/navigation";

// Halaman ini sudah tidak digunakan lagi.
// Peran ditentukan otomatis saat pendaftaran (default: siswa)
// atau melalui undangan dari admin.
export default function PilihPeranPage() {
  redirect("/");
}
