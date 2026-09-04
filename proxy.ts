import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
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
  // API routes tidak diblokir proxy — termasuk /api/auth/callback
  const isApiRoute = pathname.startsWith("/api/");

  // User belum login → redirect ke /masuk (kecuali halaman auth atau API)
  if (!user && !isAuthPage && !isApiRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/masuk";
    return NextResponse.redirect(url);
  }

  if (user) {
    // Format cookie: "userId:peran" untuk mencegah bentrok antar user pada browser yang sama
    const roleCookie = request.cookies.get("user_role")?.value;
    let peran = "siswa";
    let hasRoleFromCookie = false;

    if (roleCookie && roleCookie.includes(":")) {
      const [cookieUserId, cookieRole] = roleCookie.split(":");
      if (cookieUserId === user.id && cookieRole) {
        peran = cookieRole;
        hasRoleFromCookie = true;
      }
    }

    // Jika cookie tidak cocok dengan user.id saat ini atau belum ada, query DB
    if (!hasRoleFromCookie) {
      const { data: profil } = await supabase
        .from("profil")
        .select("peran")
        .eq("id", user.id)
        .single();

      if (profil?.peran) {
        peran = profil.peran;
      } else {
        // Cek tabel undangan jika profil belum ada
        const emailUser = user.email?.toLowerCase();
        let peranBaru = "siswa";
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
            peranBaru = undangan.peran;
            sekolahId = undangan.sekolah_id || null;
            await supabase
              .from("undangan")
              .update({ digunakan: true })
              .eq("id", undangan.id);
          }
        }

        const namaLengkap =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "Pengguna";

        await supabase.from("profil").insert({
          id: user.id,
          nama_lengkap: namaLengkap,
          peran: peranBaru,
          sekolah_id: sekolahId,
        });

        peran = peranBaru;
      }

      // Simpan ke cookie terikat dengan user.id
      supabaseResponse.cookies.set("user_role", `${user.id}:${peran}`, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24 jam
        path: "/",
      });
    }

    const getHomeForRole = (role?: string) => {
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

    const targetDashboard = getHomeForRole(peran);

    // User sudah login tapi akses halaman auth (/masuk atau /daftar) → redirect ke dashboardnya
    if (isAuthPage) {
      const url = request.nextUrl.clone();
      url.pathname = targetDashboard;
      return NextResponse.redirect(url);
    }

    // Redirect root "/" ke dashboard spesifik peran (jika bukan siswa)
    if (pathname === "/") {
      if (targetDashboard !== "/") {
        const url = request.nextUrl.clone();
        url.pathname = targetDashboard;
        return NextResponse.redirect(url);
      }
    }

    // Proteksi rute berdasarkan peran
    if (pathname.startsWith("/super") && peran !== "super_admin") {
      const url = request.nextUrl.clone();
      url.pathname = targetDashboard;
      return NextResponse.redirect(url);
    }

    if (
      pathname.startsWith("/admin") &&
      !["admin_sekolah", "super_admin"].includes(peran)
    ) {
      const url = request.nextUrl.clone();
      url.pathname = targetDashboard;
      return NextResponse.redirect(url);
    }

    if (
      pathname.startsWith("/guru") &&
      !["guru", "admin_sekolah", "super_admin"].includes(peran)
    ) {
      const url = request.nextUrl.clone();
      url.pathname = targetDashboard;
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
