"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email dan kata sandi wajib diisi." };
  }

  const supabase = await createClient();

  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (authError) {
    return { error: "Email atau kata sandi tidak valid. Silakan periksa kembali." };
  }

  if (!authData.user) {
    return { error: "Gagal mendapatkan data akun." };
  }

  const userId = authData.user.id;
  const userEmail = authData.user.email?.toLowerCase();

  // Ambil peran dari tabel profil
  const { data: profil } = await supabase
    .from("profil")
    .select("peran, sekolah_id")
    .eq("id", userId)
    .single();

  let resolvedPeran = profil?.peran;

  // Jika profil belum ada di database, buat profil otomatis
  if (!resolvedPeran) {
    let peranBaru = "siswa";
    let sekolahId: string | null = null;

    if (userEmail) {
      const { data: undangan } = await supabase
        .from("undangan")
        .select("id, peran, sekolah_id")
        .eq("email", userEmail)
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
      authData.user.user_metadata?.full_name ||
      authData.user.user_metadata?.name ||
      userEmail?.split("@")[0] ||
      "Pengguna";

    await supabase.from("profil").insert({
      id: userId,
      nama_lengkap: namaLengkap,
      peran: peranBaru,
      sekolah_id: sekolahId,
    });

    resolvedPeran = peranBaru;
  }

  // Set cookie peran terisolasi dengan user ID
  const cookieStore = await cookies();
  cookieStore.set("user_role", `${userId}:${resolvedPeran}`, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 jam
    path: "/",
  });

  redirect(getDashboardPath(resolvedPeran));
}

export async function registerAction(prevState: any, formData: FormData) {
  const namaLengkap = formData.get("nama_lengkap") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!namaLengkap || !email || !password) {
    return { error: "Semua kolom wajib diisi." };
  }

  if (namaLengkap.trim().length < 3) {
    return { error: "Nama lengkap minimal 3 karakter." };
  }

  if (password.length < 8) {
    return { error: "Kata sandi minimal 8 karakter." };
  }

  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nama_lengkap: namaLengkap.trim(),
      },
    },
  });

  if (authError) {
    console.error("[REGISTER ERROR]", {
      message: authError.message,
      status: authError.status,
    });

    const msg = authError.message.toLowerCase();

    if (msg.includes("already registered") || msg.includes("user already registered")) {
      return { error: "Email ini sudah terdaftar. Silakan masuk atau gunakan email lain." };
    }
    if (msg.includes("email") && (msg.includes("invalid") || msg.includes("not valid"))) {
      return { error: "Format email tidak valid. Gunakan email yang benar (contoh: nama@gmail.com)." };
    }
    if (msg.includes("password") && msg.includes("weak")) {
      return { error: "Kata sandi terlalu lemah. Gunakan kombinasi huruf, angka, dan simbol." };
    }
    if (msg.includes("signup") && msg.includes("disabled")) {
      return { error: "Pendaftaran akun saat ini dinonaktifkan. Hubungi administrator." };
    }
    if (msg.includes("rate limit") || msg.includes("too many")) {
      return { error: "Terlalu banyak percobaan. Silakan tunggu beberapa menit lalu coba lagi." };
    }
    if (msg.includes("database") || msg.includes("relation") || msg.includes("does not exist")) {
      return { error: "Database belum siap. Pastikan schema.sql sudah dijalankan di Supabase SQL Editor." };
    }

    return { error: `Gagal mendaftar: ${authError.message}` };
  }

  if (!authData.user) {
    return { error: "Gagal membuat akun. Silakan coba lagi." };
  }

  // Cek apakah email sudah terdaftar sebelumnya
  if (authData.user.identities && authData.user.identities.length === 0) {
    return { error: "Email ini sudah terdaftar. Silakan masuk atau gunakan email lain." };
  }

  const emailNormalized = email.toLowerCase().trim();
  let peranBaru = "siswa";
  let sekolahId: string | null = null;

  // Cek apakah ada undangan untuk email pendaftar ini
  const { data: undangan } = await supabase
    .from("undangan")
    .select("id, peran, sekolah_id")
    .eq("email", emailNormalized)
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

  // Buat profil pengguna di database
  if (authData.session) {
    const { error: profilError } = await supabase.from("profil").upsert({
      id: authData.user.id,
      nama_lengkap: namaLengkap.trim(),
      peran: peranBaru,
      sekolah_id: sekolahId,
    });

    if (profilError) {
      console.error("[REGISTER] Gagal membuat profil:", profilError.message);
    }

    // Set cookie peran terikat dengan user ID
    const cookieStore = await cookies();
    cookieStore.set("user_role", `${authData.user.id}:${peranBaru}`, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 jam
      path: "/",
    });

    redirect(getDashboardPath(peranBaru));
  }

  return {
    success: true,
    message:
      "Pendaftaran berhasil! Silakan cek email Anda untuk konfirmasi akun sebelum masuk.",
  };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  // Hapus cookie peran saat logout
  const cookieStore = await cookies();
  cookieStore.delete("user_role");

  redirect("/masuk");
}
