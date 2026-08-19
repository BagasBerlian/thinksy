import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Helper: tentukan path dashboard berdasarkan peran
function getDashboardPath(peran: string): string {
  switch (peran) {
    case "super_admin":
      return "/super";
    case "admin_sekolah":
      return "/admin";
    case "guru":
      return "/guru";
    case "siswa":
    default:
      return "/";
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  console.log("\n=== [OAuth Callback] ===");
  console.log("Code:", code ? `✅ ada (${code.substring(0, 10)}...)` : "❌ tidak ada");
  console.log("Error param:", errorParam || "tidak ada");

  if (errorParam) {
    console.error("❌ OAuth error:", errorParam, errorDescription);
    return NextResponse.redirect(
      `${origin}/masuk?error=${encodeURIComponent(errorDescription || errorParam)}`
    );
  }

  if (!code) {
    console.error("❌ Tidak ada code di URL callback");
    return NextResponse.redirect(
      `${origin}/masuk?error=${encodeURIComponent("Gagal melakukan autentikasi sosial.")}`
    );
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  console.log("Exchange:", exchangeError ? `❌ ${exchangeError.message}` : "✅ berhasil");

  if (exchangeError) {
    console.error("❌ Exchange code gagal:", exchangeError.message);
    return NextResponse.redirect(
      `${origin}/masuk?error=${encodeURIComponent("Autentikasi gagal: " + exchangeError.message)}`
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("User:", user ? `✅ ${user.email}` : "❌ null");

  if (!user) {
    return NextResponse.redirect(
      `${origin}/masuk?error=${encodeURIComponent("Gagal mendapatkan data pengguna.")}`
    );
  }

  // Cek apakah profil sudah ada
  const { data: profilLama } = await supabase
    .from("profil")
    .select("peran")
    .eq("id", user.id)
    .single();

  let finalRole = profilLama?.peran;

  if (!finalRole) {
    // Profil belum ada → ini user baru via OAuth.
    // Cek apakah ada undangan untuk email ini
    const emailUser = user.email?.toLowerCase();
    let peranBaru = "siswa"; // default
    let sekolahId: string | null = null;

    if (emailUser) {
      const { data: undangan } = await supabase
        .from("undangan")
        .select("id, peran, sekolah_id")
        .eq("email", emailUser)
        .eq("digunakan", false)
        .gt("kadaluarsa_pada", new Date().toISOString())
        .order("dibuat_pada", { ascending: false })
        .limit(1)
        .single();

      if (undangan) {
        console.log("Undangan: ✅ ditemukan, peran =", undangan.peran);
        peranBaru = undangan.peran;
        sekolahId = undangan.sekolah_id || null;

        // Tandai undangan sebagai sudah digunakan
        await supabase
          .from("undangan")
          .update({ digunakan: true })
          .eq("id", undangan.id);
      } else {
        console.log("Undangan: tidak ditemukan → default siswa");
      }
    }

    // Buat profil baru
    const namaLengkap =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Pengguna";

    const { error: profilError } = await supabase.from("profil").insert({
      id: user.id,
      nama_lengkap: namaLengkap,
      peran: peranBaru,
      sekolah_id: sekolahId,
    });

    if (profilError) {
      console.error("❌ Gagal buat profil:", profilError.message);
    } else {
      console.log("Profil: ✅ dibuat baru dengan peran =", peranBaru);
    }

    finalRole = peranBaru;
  }

  // Set cookie peran terikat dengan user ID
  cookieStore.set("user_role", `${user.id}:${finalRole}`, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 jam
    path: "/",
  });

  return NextResponse.redirect(`${origin}${getDashboardPath(finalRole)}`);
}
