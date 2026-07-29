# Project Context: Aplikasi Pembelajaran Berbasis AI (MVP - Multi-Tenant)

## 1. Ringkasan Proyek
Proyek ini adalah MVP (Minimum Viable Product) untuk aplikasi web pembelajaran mandiri berbasis AI, yang difokuskan khusus untuk **Matematika Kelas 8**[cite: 1]. Aplikasi ini mendukung arsitektur *multi-tenant* (banyak sekolah), di mana setiap sekolah memiliki data dan penggunanya sendiri yang terisolasi. 

Fitur utama meliputi materi bacaan (mendukung Markdown & KaTeX), Latihan Manual, Eksplorasi (Soal AI), Kuis berwaktu, dan Assessment dengan esai yang dinilai otomatis oleh AI[cite: 1].

## 2. Tech Stack Utama
*   **Framework:** Next.js 14+ (App Router) + TypeScript[cite: 1]
*   **Database & Auth:** Supabase (Postgres, Auth, Row Level Security, Storage)[cite: 1]
*   **Styling:** Tailwind CSS + shadcn/ui[cite: 1]
*   **AI Provider:** Anthropic API (Claude) - *Strictly Server-Side*[cite: 1]
*   **Render Matematika:** `react-katex` / `rehype-katex` + `react-markdown`[cite: 1]
*   **Tema:** `next-themes` (Mendukung Dark/Light Mode)

## 3. Hierarki Peran (Roles)
Sistem memiliki 4 peran pengguna dalam enum `peran`:
1.  **`super_admin`:** Pemilik sistem. Mengelola master data sekolah (tenant) dan memantau biaya/penggunaan API AI lintas sekolah.
2.  **`admin_sekolah`:** Pengelola level institusi. Melakukan CRUD data Guru, Siswa, dan Kelas dalam ruang lingkup sekolahnya sendiri.
3.  **`guru`:** Pengelola konten pembelajaran. Membuat soal manual, mereview soal buatan AI, memantau skor siswa, dan mengonfirmasi nilai esai[cite: 1].
4.  **`siswa`:** Pengguna akhir. Mengerjakan tugas, membaca materi, dan berinteraksi dengan AI Tutor[cite: 1].

## 4. Konsep Konten (Strict Rules)
*   **Mata Pelajaran:** Hanya Matematika Kelas 8 (Satu mapel, satu jenjang untuk MVP)[cite: 1].
*   **Soal Latihan (Manual):** Dibuat dan diinput 100% oleh Guru secara manual.
*   **Soal Eksplorasi (AI-Generated):** Dibuat otomatis oleh script (batch), HANYA bisa dikerjakan siswa jika sudah di-review dan di-publish oleh Guru[cite: 1].
*   **Tutor Sokratik AI:** Hadir saat sesi Latihan dan Eksplorasi. AI TIDAK PERNAH memberikan jawaban akhir[cite: 1]. AI hanya memberikan petunjuk bertahap (Sokratik)[cite: 1].
*   **Kuis & Assessment:** Menggunakan timer, TANPA bantuan AI Tutor, dan auto-submit[cite: 1].

## 5. Panduan Desain & UI (Desktop-First)
*   **Tipografi:** `Plus Jakarta Sans` (Google Fonts). Konten matematika minimal 16px.
*   **Warna Utama:** 
    *   Primary: `#193446` (Navy/Dark Teal)
    *   Accent: `#E9C77B` (Gold/Sand)
*   **Layout Utama:**
    *   *Super Admin / Admin / Guru:* Layout Sidebar Navigation (Kiri) + Main Content (Kanan).
    *   *Siswa (Dashboard):* Topbar navigation, max-width center layout.
    *   *Siswa (Belajar/Latihan):* Split-screen (Desktop). Kiri untuk Soal/Materi (60%), Kanan untuk Panel Chat Tutor AI (40%). Di mobile, panel AI menjadi *Floating Action Button* yang membuka *Bottom Sheet/Drawer*.

## 6. Aturan Keamanan & Backend (Wajib Patuh)
1.  **Row Level Security (RLS) Wajib:** Semua tabel memiliki `sekolah_id` (kecuali tabel master `sekolah`). Data HARUS difilter berdasarkan `sekolah_id` dan `auth.uid()`. Cross-tenant data leak adalah kesalahan fatal[cite: 1].
2.  **Proteksi Kunci Jawaban:** Kunci jawaban objektif (`kunci_jawaban` dan `opsi_soal.benar`) TIDAK BOLEH dikirim ke client browser selama sesi latihan/kuis berjalan[cite: 1]. Gunakan route handler untuk mengecek kebenaran.
3.  **AI Route Handler:** Semua pemanggilan API Anthropic WAJIB dari `/api/tutor` atau `/api/nilai-esai` (Server-side)[cite: 1].
4.  **Rate Limiting & Logging:** Maksimal interaksi chat AI adalah 20 pesan/siswa/hari[cite: 1]. Setiap penggunaan token WAJIB dicatat di tabel `log_ai` dengan menyertakan `sekolah_id`[cite: 1].

## 7. Batasan (Out-of-Scope MVP)
DILARANG keras menambahkan fitur berikut tanpa persetujuan eksplisit:
*   Gamifikasi (Leaderboard, Poin, Streak, Badge)[cite: 1].
*   Notifikasi Email / Push / Real-time chat antar manusia[cite: 1].
*   Pembayaran / Subscription gateway[cite: 1].
*   Upload video pembelajaran[cite: 1].
*   Aplikasi Native iOS/Android[cite: 1].

## 8. Peta Rute (Route Structure)
```text
app/
├── (auth)/
│   └── masuk/                  # Halaman Login
├── (siswa)/
│   ├── page.tsx                # Dashboard Siswa
│   ├── bab/[id]/               # Daftar materi
│   ├── latihan/[sesiId]/       # Mode split-screen + AI
│   ├── eksplorasi/[sesiId]/    # Mode split-screen + AI
│   ├── quiz/[sesiId]/          # Kuis + Timer (Tanpa AI)
│   ├── assessment/[sesiId]/    # Assessment + Esai (Tanpa AI)
│   └── hasil/[sesiId]/         # Laporan skor & pembahasan
├── (guru)/
│   ├── guru/                   # Dashboard Guru
│   ├── guru/siswa/[id]/        # Pantau progress & log AI siswa
│   ├── guru/soal/latihan/      # CRUD Manual
│   ├── guru/soal/eksplorasi/   # Antrean kurasi AI
│   └── guru/penilaian/         # Override nilai esai AI
├── (admin)/
│   ├── admin/                  # Dashboard Sekolah
│   ├── admin/guru/             # CRUD Guru
│   ├── admin/siswa/            # CRUD Siswa
│   └── admin/kelas/            # CRUD Kelas & Wali Kelas
├── (super)/
│   ├── super/                  # Dashboard (Global & Biaya AI)
│   ├── super/sekolah/          # Tenant Management
│   └── super/admin-sekolah/    # CRUD Akun Admin Sekolah
└── api/
    ├── tutor/                  # Route handler Sokratik AI
    ├── nilai-esai/             # Route handler Auto-grading AI
    └── sesi/                   # Logic mulai, cek jawab, selesai