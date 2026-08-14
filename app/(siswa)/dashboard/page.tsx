import { createClient } from "@/lib/supabase/server";
import StudentDashboardClient from "./StudentDashboardClient";

export default async function SiswaDashboardPage() {
  const supabase = await createClient();

  // Get current authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get user profile data
  let userProfile = {
    nama_lengkap: "Budi Kartika",
    email: "budi.kartika@sekolah.sch.id",
    peran: "siswa",
  };

  if (user) {
    const { data: profil } = await supabase
      .from("profil")
      .select("nama_lengkap, peran")
      .eq("id", user.id)
      .single();

    userProfile = {
      nama_lengkap: profil?.nama_lengkap || user.email?.split("@")[0] || "Budi Kartika",
      email: user.email || "budi.kartika@sekolah.sch.id",
      peran: profil?.peran || "siswa",
    };
  }

  // Get list of chapters and modules from Supabase
  const { data: listBab } = await supabase
    .from("bab")
    .select(
      `
      id,
      judul,
      deskripsi,
      urutan,
      materi (
        id,
        judul,
        urutan
      )
    `
    )
    .order("urutan", { ascending: true });

  return (
    <StudentDashboardClient
      userProfile={userProfile}
      chapters={listBab || []}
    />
  );
}
