-- ============================================================================
-- MIGRASI STUDENT LEARNING HUB: CATATAN PRIBADI & GLOBAL SCHOOL CHAT
-- ============================================================================

-- 1. TABEL CATATAN PRIBADI SISWA
CREATE TABLE IF NOT EXISTS catatan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  siswa_id UUID NOT NULL REFERENCES profil(id) ON DELETE CASCADE,
  judul TEXT NOT NULL,
  konten TEXT NOT NULL DEFAULT '',
  mata_pelajaran TEXT NOT NULL DEFAULT 'Umum',
  dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT now(),
  diperbarui_pada TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: catatan (Private - Siswa A tidak bisa membaca catatan Siswa B)
ALTER TABLE catatan ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "catatan: kelola catatan sendiri" ON catatan;
CREATE POLICY "catatan: kelola catatan sendiri"
  ON catatan FOR ALL
  USING (siswa_id = auth.uid());

-- 2. TABEL CHAT KOMUNITAS / GLOBAL SCHOOL CHAT
CREATE TABLE IF NOT EXISTS chat_komunitas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sekolah_id UUID NOT NULL REFERENCES sekolah(id) ON DELETE CASCADE,
  penulis_id UUID NOT NULL REFERENCES profil(id) ON DELETE CASCADE,
  nama_penulis TEXT NOT NULL,
  kelas_penulis TEXT DEFAULT '',
  konten TEXT NOT NULL,
  minat_kategori TEXT DEFAULT 'Umum',
  jumlah_suka INT NOT NULL DEFAULT 0,
  jumlah_komentar INT NOT NULL DEFAULT 0,
  dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: chat_komunitas (School Scope - Hanya siswa dari sekolah yang sama)
ALTER TABLE chat_komunitas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chat_komunitas: baca dalam sekolah" ON chat_komunitas;
CREATE POLICY "chat_komunitas: baca dalam sekolah"
  ON chat_komunitas FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profil p WHERE p.id = auth.uid() AND p.sekolah_id = chat_komunitas.sekolah_id
  ));

DROP POLICY IF EXISTS "chat_komunitas: insert oleh user sekolah" ON chat_komunitas;
CREATE POLICY "chat_komunitas: insert oleh user sekolah"
  ON chat_komunitas FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profil p WHERE p.id = auth.uid() AND p.sekolah_id = chat_komunitas.sekolah_id
  ));

-- 2.1 TABEL BALASAN KOMENTAR CHAT
CREATE TABLE IF NOT EXISTS komentar_chat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES chat_komunitas(id) ON DELETE CASCADE,
  penulis_id UUID NOT NULL REFERENCES profil(id) ON DELETE CASCADE,
  nama_penulis TEXT NOT NULL,
  kelas_penulis TEXT DEFAULT '',
  konten TEXT NOT NULL,
  dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE komentar_chat ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "komentar_chat: baca semua" ON komentar_chat;
CREATE POLICY "komentar_chat: baca semua"
  ON komentar_chat FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "komentar_chat: insert authenticated" ON komentar_chat;
CREATE POLICY "komentar_chat: insert authenticated"
  ON komentar_chat FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 3. TABEL LAPORAN KONTEN / MODERASI
CREATE TABLE IF NOT EXISTS laporan_konten (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chat_komunitas(id) ON DELETE CASCADE,
  pelapor_id UUID NOT NULL REFERENCES profil(id) ON DELETE CASCADE,
  alasan TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'menunggu',
  dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE laporan_konten ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "laporan_konten: kelola laporan sendiri" ON laporan_konten;
CREATE POLICY "laporan_konten: kelola laporan sendiri"
  ON laporan_konten FOR ALL
  USING (pelapor_id = auth.uid());
