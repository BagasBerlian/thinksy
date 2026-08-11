"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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

  const peran = profil?.peran || "siswa";

  let targetPath = "/";
  if (peran === "super_admin") targetPath = "/super";
  else if (peran === "admin_sekolah") targetPath = "/admin";
  else if (peran === "guru") targetPath = "/guru";

  redirect(targetPath);
}

export async function registerAction(prevState: any, formData: FormData) {
  const namaLengkap = formData.get("nama_lengkap") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const peranInput = formData.get("peran") as string;

  if (!namaLengkap || !email || !password) {
    return { error: "Semua kolom wajib diisi." };
  }

  if (namaLengkap.trim().length < 3) {
    return { error: "Nama lengkap minimal 3 karakter." };
  }

  if (password.length < 8) {
    return { error: "Kata sandi minimal 8 karakter." };
  }

  // Validate peran
  const validPeran = ["super_admin", "admin_sekolah", "guru", "siswa"];
  const peran = validPeran.includes(peranInput) ? peranInput : "siswa";

  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nama_lengkap: namaLengkap.trim(),
        peran: peran,
      },
    },
  });

  // Log error asli ke terminal untuk debugging
  if (authError) {
    console.error("[REGISTER ERROR]", {
      message: authError.message,
      status: authError.status,
      code: (authError as any).code,
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

    // Tampilkan error asli dari Supabase untuk diagnosa
    return { error: `Gagal mendaftar: ${authError.message} (kode: ${authError.status ?? "unknown"})` };
  }

  if (!authData.user) {
    return { error: "Gagal membuat akun. Silakan coba lagi." };
  }

  // Cek jika email sudah terdaftar (Supabase kadang tidak return error, tapi identities kosong)
  if (authData.user.identities && authData.user.identities.length === 0) {
    return { error: "Email ini sudah terdaftar. Silakan masuk atau gunakan email lain." };
  }

  // Coba update peran secara langsung ke tabel profil jika pengguna langsung terautentikasi (email confirmation mati)
  if (authData.user) {
    try {
      await supabase
        .from("profil")
        .update({ peran })
        .eq("id", authData.user.id);
    } catch (e) {
      console.warn("Direct profile update failed (this is normal if email confirmation is required):", e);
    }
  }

  // Jika Supabase memerlukan konfirmasi email
  if (authData.user && !authData.session) {
    return {
      success: true,
      message: "Pendaftaran berhasil! Silakan cek email Anda untuk konfirmasi akun sebelum masuk.",
    };
  }

  // Jika langsung login (email confirmation dinonaktifkan di Supabase)
  redirect("/masuk?registered=1");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/masuk");
}
