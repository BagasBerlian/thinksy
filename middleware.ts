import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const isAuthPage = pathname === "/masuk" || pathname === "/daftar";
  // API routes tidak diblokir middleware — termasuk /api/auth/callback
  const isApiRoute = pathname.startsWith("/api/");

  // User belum login → redirect ke /masuk (kecuali halaman auth atau API)
  if (!user && !isAuthPage && !isApiRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/masuk";
    return NextResponse.redirect(url);
  }

  if (user) {
    // Baca peran dari cookie (diisi oleh login/callback/set-peran)
    // Jika tidak ada cookie, fetch dari DB satu kali lalu simpan ke cookie
    const roleCookie = request.cookies.get("user_role")?.value;

    let peran = roleCookie;

    if (!peran) {
      const { data: profil } = await supabase
        .from("profil")
        .select("peran")
        .eq("id", user.id)
        .single();

      if (!profil) {
        // Profil belum ada (sangat jarang) → buat otomatis sebagai siswa
        const namaLengkap =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "Pengguna";

        await supabase.from("profil").insert({
          id: user.id,
          nama_lengkap: namaLengkap,
          peran: "siswa",
        });

        peran = "siswa";
      } else {
        peran = profil.peran;
      }

      // Simpan ke cookie agar permintaan berikutnya tidak perlu query DB
      supabaseResponse.cookies.set("user_role", peran, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24 jam
        path: "/",
      });
    }

    const getHomeForRole = (role: string) => {
      switch (role) {
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
    };

    // User sudah login tapi akses halaman auth → redirect ke dashboard
    if (isAuthPage) {
      const url = request.nextUrl.clone();
      url.pathname = getHomeForRole(peran);
      return NextResponse.redirect(url);
    }

    // Redirect root "/" ke dashboard spesifik peran (kecuali siswa yang memang di "/")
    if (pathname === "/") {
      const targetHome = getHomeForRole(peran);
      if (targetHome !== "/") {
        const url = request.nextUrl.clone();
        url.pathname = targetHome;
        return NextResponse.redirect(url);
      }
    }

    // Proteksi rute berdasarkan peran
    if (pathname.startsWith("/super") && peran !== "super_admin") {
      const url = request.nextUrl.clone();
      url.pathname = getHomeForRole(peran);
      return NextResponse.redirect(url);
    }

    if (
      pathname.startsWith("/admin") &&
      !["admin_sekolah", "super_admin"].includes(peran)
    ) {
      const url = request.nextUrl.clone();
      url.pathname = getHomeForRole(peran);
      return NextResponse.redirect(url);
    }

    if (
      pathname.startsWith("/guru") &&
      !["guru", "admin_sekolah", "super_admin"].includes(peran)
    ) {
      const url = request.nextUrl.clone();
      url.pathname = getHomeForRole(peran);
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
