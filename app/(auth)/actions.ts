"use server";

import { createClient } from "@/lib/supabase/server";
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

  // Ambil peran dari tabel profil
  const { data: profil } = await supabase
    .from("profil")
    .select("peran")
    .eq("id", authData.user.id)
    .single();

  // Jika profil belum ada (edge case: user OAuth yang belum lengkap), buat profil siswa
  if (!profil) {
    const namaLengkap =
      authData.user.user_metadata?.full_name ||
      authData.user.user_metadata?.name ||
      authData.user.email?.split("@")[0] ||
      "Pengguna";

    await supabase.from("profil").insert({
      id: authData.user.id,
      nama_lengkap: namaLengkap,
      peran: "siswa",
    });

    redirect("/");
  }

  redirect(getDashboardPath(profil.peran));
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

  // Daftar ke Supabase Auth — peran SELALU siswa, tidak bisa dipilih sendiri
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nama_lengkap: namaLengkap.trim(),
        // peran tidak disimpan di metadata — hanya di tabel profil
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

  // Cek apakah email sudah terdaftar sebelumnya (Supabase kadang tidak return error)
  if (authData.user.identities && authData.user.identities.length === 0) {
    return { error: "Email ini sudah terdaftar. Silakan masuk atau gunakan email lain." };
  }

  // Jika langsung terautentikasi (email confirmation dimatikan di Supabase),
  // buat profil siswa di database
  if (authData.session) {
    const { error: profilError } = await supabase.from("profil").upsert({
      id: authData.user.id,
      nama_lengkap: namaLengkap.trim(),
      peran: "siswa", // selalu siswa saat daftar mandiri
    });

    if (profilError) {
      console.error("[REGISTER] Gagal membuat profil:", profilError.message);
    }

    redirect("/"); // langsung ke dashboard siswa
  }

  // Jika Supabase memerlukan konfirmasi email terlebih dahulu
  return {
    success: true,
    message:
      "Pendaftaran berhasil! Silakan cek email Anda untuk konfirmasi akun sebelum masuk.",
  };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/masuk");
}
