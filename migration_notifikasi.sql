-- ============================================================================
-- MIGRASI TABEL NOTIFIKASI (LOG NOTIFIKASI USER & SISTEM)
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifikasi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profil(id) ON DELETE CASCADE,
  judul TEXT NOT NULL,
  pesan TEXT NOT NULL,
  tipe TEXT NOT NULL DEFAULT 'info', -- 'info', 'urgent', 'success', 'warning'
  dibaca BOOLEAN NOT NULL DEFAULT false,
  dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexing untuk query cepat berdasarkan user_id dan status dibaca
CREATE INDEX IF NOT EXISTS idx_notifikasi_user_id ON notifikasi(user_id);
CREATE INDEX IF NOT EXISTS idx_notifikasi_dibaca ON notifikasi(user_id, dibaca);

-- Enable Row Level Security (RLS)
ALTER TABLE notifikasi ENABLE ROW LEVEL SECURITY;

-- Policy: User hanya dapat melihat notifikasi miliknya sendiri
DROP POLICY IF EXISTS "notifikasi: baca milik sendiri" ON notifikasi;
CREATE POLICY "notifikasi: baca milik sendiri"
  ON notifikasi FOR SELECT
  USING (user_id = auth.uid());

-- Policy: User / Service dapat membuat notifikasi
DROP POLICY IF EXISTS "notifikasi: insert authenticated" ON notifikasi;
CREATE POLICY "notifikasi: insert authenticated"
  ON notifikasi FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: User dapat mengupdate status baca notifikasi miliknya
DROP POLICY IF EXISTS "notifikasi: update milik sendiri" ON notifikasi;
CREATE POLICY "notifikasi: update milik sendiri"
  ON notifikasi FOR UPDATE
  USING (user_id = auth.uid());

-- Policy: User dapat menghapus notifikasi miliknya
DROP POLICY IF EXISTS "notifikasi: delete milik sendiri" ON notifikasi;
CREATE POLICY "notifikasi: delete milik sendiri"
  ON notifikasi FOR DELETE
  USING (user_id = auth.uid());
