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

  if (!user && !isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/masuk";
    return NextResponse.redirect(url);
  }

  if (user) {
    const { data: profil } = await supabase
      .from("profil")
      .select("peran")
      .eq("id", user.id)
      .single();

    const peran = profil?.peran || "siswa";

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

    if (isAuthPage) {
      const url = request.nextUrl.clone();
      url.pathname = getHomeForRole(peran);
      return NextResponse.redirect(url);
    }

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
