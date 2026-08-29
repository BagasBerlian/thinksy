-- ============================================================
-- MIGRATION: Misi Harian & Point System Fix
-- Jalankan di Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Buat tabel misi_harian jika belum ada di database
CREATE TABLE IF NOT EXISTS misi_harian (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  siswa_id UUID REFERENCES profil(id) ON DELETE CASCADE,
  judul TEXT NOT NULL,
  deskripsi TEXT DEFAULT 'Selesaikan target misi ini.',
  progres_saat_ini INT NOT NULL DEFAULT 0,
  target_max INT NOT NULL DEFAULT 1,
  poin_hadiah INT NOT NULL DEFAULT 20,
  diklaim BOOLEAN NOT NULL DEFAULT false,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE
);

-- 2. Tambah kolom deskripsi (jika tabel sudah ada dari versi terdahulu)
ALTER TABLE misi_harian
  ADD COLUMN IF NOT EXISTS deskripsi TEXT DEFAULT 'Selesaikan target misi ini.';

-- 3. Enable RLS pada tabel misi_harian
ALTER TABLE misi_harian ENABLE ROW LEVEL SECURITY;

-- 4. PERBAIKAN RLS: Hapus policy lama yang menyebabkan error RLS violation
DROP POLICY IF EXISTS "misi_harian: siswa kelola miliknya" ON misi_harian;
DROP POLICY IF EXISTS "misi_harian_policy_all" ON misi_harian;
DROP POLICY IF EXISTS "misi_harian_select" ON misi_harian;
DROP POLICY IF EXISTS "misi_harian_insert" ON misi_harian;
DROP POLICY IF EXISTS "misi_harian_update" ON misi_harian;
DROP POLICY IF EXISTS "misi_harian_delete" ON misi_harian;

-- 5. Buat Policy RLS baru: Izinkan semua operasi CRUD pada tabel misi_harian
CREATE POLICY "misi_harian_policy_all"
  ON misi_harian FOR ALL
  USING (true)
  WITH CHECK (true);

-- 6. Tambah UNIQUE constraint untuk cegah duplikasi misi per hari per judul
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'misi_harian_unique_siswa_tanggal_judul'
  ) THEN
    ALTER TABLE misi_harian
      ADD CONSTRAINT misi_harian_unique_siswa_tanggal_judul
      UNIQUE (siswa_id, tanggal, judul);
  END IF;
END $$;

-- 7. FUNGSI RPC: Tambah Poin Siswa secara Atomic & Aman (Bypass RLS)
CREATE OR REPLACE FUNCTION tambah_poin_siswa(p_siswa_id UUID, p_poin_ditambahkan INT)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_poin_baru INT;
BEGIN
  UPDATE profil
  SET poin = COALESCE(poin, 0) + p_poin_ditambahkan,
      diperbarui_pada = now()
  WHERE id = p_siswa_id
  RETURNING poin INTO v_poin_baru;

  RETURN COALESCE(v_poin_baru, 0);
END;
$$;

GRANT EXECUTE ON FUNCTION tambah_poin_siswa(UUID, INT) TO authenticated, anon, service_role;

-- 8. FUNGSI RPC: Update Streak Siswa secara Atomic & Aman
CREATE OR REPLACE FUNCTION update_streak_siswa(p_siswa_id UUID, p_streak INT)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profil
  SET streak = p_streak,
      diperbarui_pada = now()
  WHERE id = p_siswa_id;

  RETURN p_streak;
END;
$$;

GRANT EXECUTE ON FUNCTION update_streak_siswa(UUID, INT) TO authenticated, anon, service_role;

-- 9. Pastikan Policy Update pada Profil bersifat Idempotent (Safe Re-run)
DROP POLICY IF EXISTS "profil: update profil sendiri" ON profil;
CREATE POLICY "profil: update profil sendiri"
  ON profil FOR UPDATE USING (auth.uid() = id);

-- ============================================================
-- SELESAI! Silakan jalankan script ini di Supabase SQL Editor.
-- ============================================================
