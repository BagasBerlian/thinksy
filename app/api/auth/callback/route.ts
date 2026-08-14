import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Ambil data user yang baru saja login
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Ambil peran dari tabel profil
        const { data: profil } = await supabase
          .from("profil")
          .select("peran")
          .eq("id", user.id)
          .single();

        const peran = profil?.peran ?? "siswa";

        // Tentukan halaman tujuan berdasarkan peran
        let targetPath = "/";
        if (peran === "super_admin") targetPath = "/super";
        else if (peran === "admin_sekolah") targetPath = "/admin";
        else if (peran === "guru") targetPath = "/guru";

        return NextResponse.redirect(`${origin}${targetPath}`);
      }

      // Fallback jika user tidak ditemukan (seharusnya tidak terjadi)
      return NextResponse.redirect(`${origin}/`);
    }
  }

  // Redirect ke halaman masuk dengan pesan error jika gagal
  return NextResponse.redirect(`${origin}/masuk?error=Gagal melakukan autentikasi sosial.`);
}

