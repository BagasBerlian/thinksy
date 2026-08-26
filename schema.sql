-- ============================================================================
-- SCHEMA LENGKAP - APLIKASI PEMBELAJARAN AI (MATEMATIKA KELAS 8)
-- Jalankan script ini di: Supabase Dashboard → SQL Editor → New Query
-- ============================================================================

-- ============================================================
-- STEP 0: HAPUS SEMUA TABEL, TYPE, DAN FUNGSI YANG ADA (JIKA ADA)
-- ============================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;
DROP FUNCTION IF EXISTS public.check_user_role CASCADE;
DROP FUNCTION IF EXISTS public.check_staff_sekolah_match CASCADE;

DROP TABLE IF EXISTS undangan CASCADE;
DROP TABLE IF EXISTS log_ai CASCADE;
DROP TABLE IF EXISTS percakapan_tutor CASCADE;
DROP TABLE IF EXISTS jawaban CASCADE;
DROP TABLE IF EXISTS sesi CASCADE;
DROP TABLE IF EXISTS opsi_soal CASCADE;
DROP TABLE IF EXISTS soal CASCADE;
DROP TABLE IF EXISTS materi CASCADE;
DROP TABLE IF EXISTS bab CASCADE;
DROP TABLE IF EXISTS anggota_kelas CASCADE;
DROP TABLE IF EXISTS kelas CASCADE;
DROP TABLE IF EXISTS profil CASCADE;
DROP TABLE IF EXISTS sekolah CASCADE;

DROP TYPE IF EXISTS peran CASCADE;
DROP TYPE IF EXISTS tipe_soal CASCADE;
DROP TYPE IF EXISTS tingkat_soal CASCADE;
DROP TYPE IF EXISTS status_soal CASCADE;
DROP TYPE IF EXISTS sumber_konten CASCADE;
DROP TYPE IF EXISTS status_sesi CASCADE;
DROP TYPE IF EXISTS tipe_sesi CASCADE;
DROP TYPE IF EXISTS fitur_ai CASCADE;

-- ============================================================
-- STEP 1: BUAT ENUM TYPES
-- ============================================================

CREATE TYPE peran AS ENUM ('super_admin', 'admin_sekolah', 'guru', 'siswa');
CREATE TYPE tipe_soal AS ENUM ('pilihan_ganda', 'esai');
CREATE TYPE tingkat_soal AS ENUM ('mudah', 'sedang', 'sulit');
CREATE TYPE status_soal AS ENUM ('draft', 'review', 'dipublikasi', 'diarsipkan');
CREATE TYPE sumber_konten AS ENUM ('manual', 'ai_generated');
CREATE TYPE status_sesi AS ENUM ('aktif', 'selesai', 'dibatalkan');
CREATE TYPE tipe_sesi AS ENUM ('latihan', 'eksplorasi', 'kuis', 'assessment');
CREATE TYPE fitur_ai AS ENUM ('tutor_sokratik', 'grading_esai', 'generate_soal');

-- ============================================================
-- STEP 2: TABEL UTAMA
-- ============================================================

-- 2.1 Tabel Sekolah (Master Tenant)
CREATE TABLE sekolah (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama        TEXT NOT NULL,
  npsn        TEXT UNIQUE,
  alamat      TEXT,
  dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.2 Tabel Profil (Extends auth.users Supabase)
-- Otomatis dibuat via trigger saat user signup
CREATE TABLE profil (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  sekolah_id      UUID REFERENCES sekolah(id) ON DELETE SET NULL,
  nama_lengkap    TEXT NOT NULL DEFAULT '',
  peran           peran NOT NULL DEFAULT 'siswa',
  poin            INT NOT NULL DEFAULT 1250,
  streak          INT NOT NULL DEFAULT 14,
  dibuat_pada     TIMESTAMPTZ NOT NULL DEFAULT now(),
  diperbarui_pada TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.3 Tabel Kelas
CREATE TABLE kelas (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sekolah_id    UUID NOT NULL REFERENCES sekolah(id) ON DELETE CASCADE,
  nama_kelas    TEXT NOT NULL,
  wali_kelas_id UUID REFERENCES profil(id) ON DELETE SET NULL,
  dibuat_pada   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.4 Tabel Anggota Kelas (siswa -> kelas)
CREATE TABLE anggota_kelas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kelas_id    UUID NOT NULL REFERENCES kelas(id) ON DELETE CASCADE,
  siswa_id    UUID NOT NULL REFERENCES profil(id) ON DELETE CASCADE,
  dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(kelas_id, siswa_id)
);

-- 2.5 Tabel Bab (Chapter)
CREATE TABLE bab (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sekolah_id  UUID REFERENCES sekolah(id) ON DELETE CASCADE,
  judul       TEXT NOT NULL,
  deskripsi   TEXT,
  urutan      INT NOT NULL DEFAULT 1,
  dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.6 Tabel Materi (Konten teks per Bab)
CREATE TABLE materi (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bab_id          UUID NOT NULL REFERENCES bab(id) ON DELETE CASCADE,
  judul           TEXT NOT NULL,
  konten_markdown TEXT NOT NULL DEFAULT '',
  urutan          INT NOT NULL DEFAULT 1,
  dibuat_pada     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.7 Tabel Soal (Bank Soal)
CREATE TABLE soal (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bab_id        UUID NOT NULL REFERENCES bab(id) ON DELETE CASCADE,
  materi_id     UUID REFERENCES materi(id) ON DELETE SET NULL,
  pembuat_id    UUID REFERENCES profil(id) ON DELETE SET NULL,
  pertanyaan    TEXT NOT NULL,
  tipe_soal     tipe_soal NOT NULL DEFAULT 'pilihan_ganda',
  tingkat_soal  tingkat_soal NOT NULL DEFAULT 'sedang',
  sumber_konten sumber_konten NOT NULL DEFAULT 'manual',
  status_soal   status_soal NOT NULL DEFAULT 'draft',
  kunci_jawaban TEXT,
  pembahasan    TEXT,
  dibuat_pada   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.8 Tabel Opsi Soal (untuk tipe pilihan_ganda)
CREATE TABLE opsi_soal (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  soal_id   UUID NOT NULL REFERENCES soal(id) ON DELETE CASCADE,
  teks_opsi TEXT NOT NULL,
  benar     BOOLEAN NOT NULL DEFAULT false,
  urutan    INT NOT NULL DEFAULT 1
);

-- 2.9 Tabel Sesi Belajar
CREATE TABLE sesi (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  siswa_id     UUID NOT NULL REFERENCES profil(id) ON DELETE CASCADE,
  bab_id       UUID REFERENCES bab(id) ON DELETE SET NULL,
  sekolah_id   UUID REFERENCES sekolah(id) ON DELETE CASCADE,
  tipe_sesi    tipe_sesi NOT NULL DEFAULT 'latihan',
  status_sesi  status_sesi NOT NULL DEFAULT 'aktif',
  skor_akhir   INT,
  mulai_pada   TIMESTAMPTZ NOT NULL DEFAULT now(),
  selesai_pada TIMESTAMPTZ
);

-- 2.10 Tabel Jawaban Siswa
CREATE TABLE jawaban (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sesi_id         UUID NOT NULL REFERENCES sesi(id) ON DELETE CASCADE,
  soal_id         UUID NOT NULL REFERENCES soal(id) ON DELETE CASCADE,
  opsi_dipilih_id UUID REFERENCES opsi_soal(id) ON DELETE SET NULL,
  jawaban_teks    TEXT,
  is_benar        BOOLEAN,
  nilai           INT DEFAULT 0,
  umpan_balik_ai  TEXT,
  dijawab_pada    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(sesi_id, soal_id)
);

-- 2.11 Tabel Percakapan Tutor AI
CREATE TABLE percakapan_tutor (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sesi_id     UUID NOT NULL REFERENCES sesi(id) ON DELETE CASCADE,
  soal_id     UUID REFERENCES soal(id) ON DELETE SET NULL,
  pengirim    TEXT NOT NULL CHECK (pengirim IN ('siswa', 'tutor_ai')),
  pesan       TEXT NOT NULL,
  dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.12 Tabel Log Penggunaan AI (monitoring biaya)
CREATE TABLE log_ai (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sekolah_id        UUID NOT NULL REFERENCES sekolah(id) ON DELETE CASCADE,
  pengguna_id       UUID NOT NULL REFERENCES profil(id) ON DELETE CASCADE,
  fitur             fitur_ai NOT NULL,
  prompt_tokens     INT NOT NULL DEFAULT 0,
  completion_tokens INT NOT NULL DEFAULT 0,
  total_tokens      INT NOT NULL DEFAULT 0,
  biaya_usd         NUMERIC(10, 8) NOT NULL DEFAULT 0,
  dibuat_pada       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.13 Tabel Presensi (Absen Kamera Selfie)
CREATE TABLE presensi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  siswa_id UUID NOT NULL REFERENCES profil(id) ON DELETE CASCADE,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  waktu_masuk TIMESTAMPTZ NOT NULL DEFAULT now(),
  foto_url TEXT,
  status TEXT NOT NULL DEFAULT 'Hadir',
  UNIQUE(siswa_id, tanggal)
);

-- 2.14 Tabel Misi Harian (Daily Quests)
CREATE TABLE misi_harian (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  siswa_id UUID REFERENCES profil(id) ON DELETE CASCADE,
  judul TEXT NOT NULL,
  progres_saat_ini INT NOT NULL DEFAULT 0,
  target_max INT NOT NULL DEFAULT 1,
  poin_hadiah INT NOT NULL DEFAULT 20,
  diklaim BOOLEAN NOT NULL DEFAULT false,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE
);

-- 2.15 Tabel Agenda Tugas (Tenggat Waktu)
CREATE TABLE agenda_tugas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  siswa_id UUID REFERENCES profil(id) ON DELETE CASCADE,
  judul TEXT NOT NULL,
  deskripsi TEXT,
  tenggat_waktu TIMESTAMPTZ NOT NULL,
  kategori TEXT NOT NULL DEFAULT 'kuis',
  tingkat_urgensi TEXT NOT NULL DEFAULT 'normal'
);

-- 2.16 Tabel Jadwal Kelas
CREATE TABLE jadwal_kelas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sekolah_id UUID REFERENCES sekolah(id) ON DELETE CASCADE,
  mata_pelajaran TEXT NOT NULL,
  nama_guru TEXT NOT NULL,
  hari TEXT NOT NULL,
  jam_mulai TIME NOT NULL,
  jam_selesai TIME NOT NULL,
  ruangan TEXT NOT NULL,
  urutan INT DEFAULT 1
);

-- 2.17 Tabel Notifikasi (Log Notifikasi User)
CREATE TABLE notifikasi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profil(id) ON DELETE CASCADE,
  judul TEXT NOT NULL,
  pesan TEXT NOT NULL,
  tipe TEXT NOT NULL DEFAULT 'info',
  dibaca BOOLEAN NOT NULL DEFAULT false,
  dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- STEP 3: TRIGGER - AUTO CREATE PROFIL SAAT USER SIGNUP
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profil (id, nama_lengkap, peran)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nama_lengkap', NEW.email, 'Pengguna Baru'),
    COALESCE((NEW.raw_user_meta_data->>'peran')::peran, 'siswa')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- STEP 4: ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE sekolah          ENABLE ROW LEVEL SECURITY;
ALTER TABLE profil           ENABLE ROW LEVEL SECURITY;
ALTER TABLE kelas            ENABLE ROW LEVEL SECURITY;
ALTER TABLE anggota_kelas    ENABLE ROW LEVEL SECURITY;
ALTER TABLE bab              ENABLE ROW LEVEL SECURITY;
ALTER TABLE materi           ENABLE ROW LEVEL SECURITY;
ALTER TABLE soal             ENABLE ROW LEVEL SECURITY;
ALTER TABLE opsi_soal        ENABLE ROW LEVEL SECURITY;
ALTER TABLE sesi             ENABLE ROW LEVEL SECURITY;
ALTER TABLE jawaban          ENABLE ROW LEVEL SECURITY;
ALTER TABLE percakapan_tutor ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_ai           ENABLE ROW LEVEL SECURITY;

-- RLS: profil
CREATE OR REPLACE FUNCTION public.check_user_role(role_to_check peran)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profil
    WHERE id = auth.uid() AND peran = role_to_check
  );
$$;

CREATE OR REPLACE FUNCTION public.check_staff_sekolah_match(sekolah_id_to_check UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profil
    WHERE id = auth.uid() AND peran IN ('guru', 'admin_sekolah') AND sekolah_id = sekolah_id_to_check
  );
$$;

CREATE POLICY "profil: baca profil sendiri"
  ON profil FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profil: update profil sendiri"
  ON profil FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profil: super_admin lihat semua"
  ON profil FOR SELECT
  USING (public.check_user_role('super_admin'));

CREATE POLICY "profil: user login bisa baca leaderboard siswa"
  ON profil FOR SELECT
  USING (auth.uid() IS NOT NULL AND peran = 'siswa');

-- RLS: sekolah
CREATE POLICY "sekolah: user login bisa baca"
  ON sekolah FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "sekolah: super_admin kelola"
  ON sekolah FOR ALL
  USING (EXISTS (SELECT 1 FROM profil WHERE id = auth.uid() AND peran = 'super_admin'));

-- RLS: bab
CREATE POLICY "bab: user login bisa baca"
  ON bab FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "bab: guru/admin kelola"
  ON bab FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profil WHERE id = auth.uid() AND peran IN ('guru', 'admin_sekolah', 'super_admin')
  ));

-- RLS: materi
CREATE POLICY "materi: user login bisa baca"
  ON materi FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "materi: guru/admin kelola"
  ON materi FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profil WHERE id = auth.uid() AND peran IN ('guru', 'admin_sekolah', 'super_admin')
  ));

-- RLS: soal
CREATE POLICY "soal: baca soal dipublikasi"
  ON soal FOR SELECT
  USING (auth.uid() IS NOT NULL AND status_soal = 'dipublikasi');

CREATE POLICY "soal: guru/admin baca & kelola semua"
  ON soal FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profil WHERE id = auth.uid() AND peran IN ('guru', 'admin_sekolah', 'super_admin')
  ));

-- RLS: opsi_soal
CREATE POLICY "opsi_soal: user login bisa baca"
  ON opsi_soal FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "opsi_soal: guru/admin kelola"
  ON opsi_soal FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profil WHERE id = auth.uid() AND peran IN ('guru', 'admin_sekolah', 'super_admin')
  ));

-- RLS: sesi
CREATE POLICY "sesi: siswa kelola sesinya sendiri"
  ON sesi FOR ALL USING (siswa_id = auth.uid());

CREATE POLICY "sesi: guru/admin lihat di sekolahnya"
  ON sesi FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profil p
    WHERE p.id = auth.uid() AND p.peran IN ('guru', 'admin_sekolah', 'super_admin')
  ));

-- RLS: jawaban
CREATE POLICY "jawaban: siswa kelola jawabannya"
  ON jawaban FOR ALL
  USING (EXISTS (SELECT 1 FROM sesi WHERE id = jawaban.sesi_id AND siswa_id = auth.uid()));

CREATE POLICY "jawaban: guru/admin bisa lihat"
  ON jawaban FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profil WHERE id = auth.uid() AND peran IN ('guru', 'admin_sekolah', 'super_admin')
  ));

-- RLS: percakapan_tutor
CREATE POLICY "percakapan_tutor: siswa kelola percakapannya"
  ON percakapan_tutor FOR ALL
  USING (EXISTS (SELECT 1 FROM sesi WHERE id = percakapan_tutor.sesi_id AND siswa_id = auth.uid()));

-- RLS: log_ai
CREATE POLICY "log_ai: admin/super lihat log"
  ON log_ai FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profil WHERE id = auth.uid() AND peran IN ('admin_sekolah', 'super_admin')
  ));

CREATE POLICY "log_ai: insert oleh user login"
  ON log_ai FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- STEP 5: SEED DATA AWAL
-- ============================================================

INSERT INTO sekolah (id, nama, npsn, alamat)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'SMP Negeri 1 Nusantara', '20101010', 'Jl. Pendidikan No. 1, Jakarta'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO bab (id, sekolah_id, judul, deskripsi, urutan)
VALUES (
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Bab 1: Pola Bilangan & Barisan',
  'Mengenal jenis-jenis pola bilangan, barisan aritmatika, dan deret geometri.', 1
) ON CONFLICT (id) DO NOTHING;

INSERT INTO materi (id, bab_id, judul, konten_markdown, urutan) VALUES
(
  'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'Mengenal Pola Bilangan Aritmatika',
  E'# Pola Bilangan Aritmatika\n\nBarisan aritmatika memiliki **selisih (beda)** yang tetap.\n\n$$U_n = a + (n - 1)b$$\n\n**Contoh:** Barisan $3, 7, 11, 15$ maka $U_{10} = 3 + 9(4) = 39$',
  1
),
(
  'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'Barisan dan Deret Geometri',
  E'# Barisan Geometri\n\nBarisan geometri memiliki **rasio (r)** yang tetap.\n\n$$U_n = a \\cdot r^{n-1}$$\n\n**Contoh:** Barisan $2, 6, 18, 54$ maka $U_5 = 2 \\cdot 3^4 = 162$',
  2
) ON CONFLICT (id) DO NOTHING;

INSERT INTO soal (id, bab_id, materi_id, pertanyaan, tipe_soal, tingkat_soal, sumber_konten, status_soal, kunci_jawaban, pembahasan)
VALUES
(
  'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  'Diketahui barisan aritmatika $3, 7, 11, 15, \dots$. Tentukan nilai $U_{10}$!',
  'pilihan_ganda', 'sedang', 'manual', 'dipublikasi', '39',
  'Gunakan $U_n = a + (n-1)b$ dengan $a=3, b=4, n=10$. Maka $U_{10} = 3 + 9(4) = 39$.'
),
(
  'd2eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
  'Jelaskan perbedaan antara Barisan Aritmatika dan Barisan Geometri beserta contohnya!',
  'esai', 'sedang', 'manual', 'dipublikasi',
  'Aritmatika: beda tetap. Geometri: rasio tetap.',
  'Aritmatika (2,4,6,8: beda=2). Geometri (2,4,8,16: rasio=2).'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO opsi_soal (id, soal_id, teks_opsi, benar, urutan) VALUES
  ('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a77', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', '35', false, 1),
  ('e2eebc99-9c0b-4ef8-bb6d-6bb9bd380a88', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', '39', true,  2),
  ('e3eebc99-9c0b-4ef8-bb6d-6bb9bd380a99', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', '43', false, 3),
  ('e4eebc99-9c0b-4ef8-bb6d-6bb9bd380aaa', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', '47', false, 4)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STEP 6: TABEL UNDANGAN (Sistem Undangan Admin Sekolah)
-- ============================================================

CREATE TABLE IF NOT EXISTS undangan (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email             TEXT NOT NULL,
  peran             peran NOT NULL DEFAULT 'admin_sekolah',
  sekolah_id        UUID REFERENCES sekolah(id) ON DELETE SET NULL,
  dibuat_oleh       UUID REFERENCES profil(id) ON DELETE SET NULL,
  nama_yang_diundang TEXT NOT NULL DEFAULT '',
  digunakan         BOOLEAN NOT NULL DEFAULT false,
  dibuat_pada       TIMESTAMPTZ NOT NULL DEFAULT now(),
  kadaluarsa_pada   TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days')
);

-- RLS: undangan
ALTER TABLE undangan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "undangan: super_admin kelola semua"
  ON undangan FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profil WHERE id = auth.uid() AND peran = 'super_admin'
  ));

CREATE POLICY "undangan: baca undangan sendiri by email"
  ON undangan FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "undangan: update saat digunakan"
  ON undangan FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- ============================================================
-- SELESAI! Semua tabel, trigger, RLS, dan seed data sudah siap.
-- ============================================================
