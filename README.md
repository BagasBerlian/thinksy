# 🧠 thinksy — Platform Belajar Matematika Berbasis AI

Platform pembelajaran Matematika Kelas 8 SMP dengan asisten AI Sokratik (**thinksy AI**) yang membimbing siswa langkah demi langkah tanpa memberikan jawaban secara langsung.

---

## ⚡ Quick Setup (Untuk Pemilik / Collaborator)

### Prasyarat
- Node.js v20+
- Akun [Supabase](https://supabase.com) (project sudah ada)
- Google Gemini API Key dari [aistudio.google.com](https://aistudio.google.com/apikey)

---

### Step 1 — Clone & Install

```bash
git clone https://github.com/<username>/thinksy.git
cd thinksy
npm install
```

---

### Step 2 — Buat File `.env.local`

Buat file `.env.local` di root project (sejajar `package.json`):

```env
# Supabase — dari Settings → API di dashboard Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# Google Gemini AI — dari aistudio.google.com/apikey
GEMINI_API_KEY=AIzaSy...
```

> ⚠️ File ini **tidak ikut di-push** (sudah di `.gitignore`). Harus dibuat manual di setiap mesin.

---

### Step 3 — Setup Database Supabase (Sekali Saja)

1. Buka **Supabase Dashboard → SQL Editor → New Query**
2. Paste isi file **`schema.sql`** → klik **Run**
3. *(Opsional)* Paste isi file **`seed.sql`** → klik **Run** (untuk data contoh soal & materi)

**Nonaktifkan konfirmasi email untuk development:**
- Supabase Dashboard → **Authentication → Settings** → matikan **Enable email confirmations**

---

### Step 4 — Jalankan

```bash
npm run dev
```

Buka **http://localhost:3000**

---

### Step 5 — Buat Akun Admin

1. Daftar di `/daftar`
2. Di Supabase → **Table Editor → profil** → ubah kolom `peran` akun kamu menjadi `super_admin`

---

## 🗂️ Halaman Utama

| URL | Deskripsi |
|---|---|
| `/dashboard` | Dashboard siswa |
| `/bab/[id]` | Belajar materi + Thinksy AI |
| `/latihan/sesi-demo` | Latihan soal + Thinksy AI |
| `/quiz/sesi-demo` | Kuis mandiri (tanpa AI) |

---

## 🛠️ Tech Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router + Turbopack) |
| Database & Auth | Supabase (PostgreSQL + RLS) |
| AI | Google Gemini 2.5 Flash |
| Styling | Tailwind CSS v4 |
| Math | KaTeX |
| Language | TypeScript |

---

## ❗ Troubleshooting

| Error | Solusi |
|---|---|
| `infinite recursion in policy "profil"` | Jalankan ulang `schema.sql` di SQL Editor |
| `Kunci API Gemini belum dikonfigurasi` | Cek isi `.env.local`, pastikan `GEMINI_API_KEY` terisi |
| Redirect loop di `/latihan/sesi-demo` | Login dulu di `/masuk` sebelum mengakses halaman latihan |
| Popup download PDF diblokir | Izinkan popup untuk `localhost:3000` di browser |

---

## 🚀 Panduan Deploy (Vercel)

Karena menggunakan Next.js, project ini paling mudah di-deploy ke **Vercel**. Tidak perlu ubah kode apa pun, Vercel akan otomatis mengenali project ini. Namun, ada 2 hal wajib yang harus dikonfigurasi:

### 1. Set Environment Variables di Vercel
Vercel butuh kredensial dari `.env.local` untuk membangun aplikasi:
- Buka Project di Vercel → **Settings** → **Environment Variables**.
- Tambahkan ketiga kunci ini beserta nilainya:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `GEMINI_API_KEY`

### 2. Daftarkan Domain Vercel ke Supabase
Agar fitur Auth (Login/Daftar) tidak diblokir di production:
- Buka Dashboard Supabase → **Authentication** → **URL Configuration**.
- Ganti **Site URL** menjadi domain Vercel kamu (contoh: `https://thinksy.vercel.app`).
- Tambahkan domain Vercel kamu ke bagian **Redirect URLs**.
