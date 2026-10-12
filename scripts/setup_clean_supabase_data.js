const { Client } = require('pg');

const client = new Client({
  host: 'aws-0-ap-southeast-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.mtpnbviztquitgszrfel',
  password: 'programermudaindonesia',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('Connected to Supabase PostgreSQL');

  const SEKOLAH_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

  // 1. Create table `kelas_aktif_mapel` if not exists
  await client.query(`
    CREATE TABLE IF NOT EXISTS kelas_aktif_mapel (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      sekolah_id UUID REFERENCES sekolah(id) ON DELETE CASCADE,
      nama_mapel TEXT NOT NULL UNIQUE,
      kode_mapel TEXT,
      guru_pengampu TEXT,
      is_active BOOLEAN NOT NULL DEFAULT true,
      deskripsi TEXT,
      urutan INT DEFAULT 0,
      dibuat_pada TIMESTAMPTZ DEFAULT now(),
      diperbarui_pada TIMESTAMPTZ DEFAULT now()
    );
  `);
  console.log('Table kelas_aktif_mapel verified.');

  // Enable RLS and permissive policy
  await client.query(`
    ALTER TABLE kelas_aktif_mapel ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public can view kelas_aktif_mapel" ON kelas_aktif_mapel;
    CREATE POLICY "Public can view kelas_aktif_mapel" ON kelas_aktif_mapel FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Allow all for authenticated" ON kelas_aktif_mapel;
    CREATE POLICY "Allow all for authenticated" ON kelas_aktif_mapel FOR ALL USING (true) WITH CHECK (true);
    GRANT ALL ON kelas_aktif_mapel TO anon, authenticated, service_role;
  `);

  // Seed default 3 subjects if empty
  const mapelCheck = await client.query("SELECT count(*) FROM kelas_aktif_mapel");
  if (parseInt(mapelCheck.rows[0].count) === 0) {
    await client.query(`
      INSERT INTO kelas_aktif_mapel (sekolah_id, nama_mapel, kode_mapel, guru_pengampu, is_active, deskripsi, urutan)
      VALUES 
        ($1, 'Matematika', 'MTK-8', 'Ibu Siti Rahmawati, M.Pd.', true, 'Bilangan Berpangkat, Teorema Pythagoras, SPLDV, Relasi & Fungsi', 1),
        ($1, 'Bahasa Inggris', 'ENG-8', 'Budi Santoso, S.Pd.', true, 'Descriptive Text, Congratulation, Explanation & Short Message', 2),
        ($1, 'Bahasa Indonesia', 'IND-8', 'Dra. Nurul Hidayah', true, 'Teks Laporan Hasil Observasi, Iklan & Slogan, Artikel Ilmiah, Puisi', 3)
      ON CONFLICT (nama_mapel) DO NOTHING;
    `, [SEKOLAH_ID]);
    console.log('Default mapel seeded into kelas_aktif_mapel.');
  }

  // 2. Unify Kelas into single "Kelas 8"
  // Find or create "Kelas 8"
  let mainKelasId = 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  await client.query(`
    UPDATE kelas SET nama_kelas = 'Kelas 8' WHERE id = $1;
  `, [mainKelasId]);

  // Update all anggota_kelas to point to Kelas 8
  await client.query(`
    UPDATE anggota_kelas SET kelas_id = $1;
  `, [mainKelasId]);

  // Update all ujian to point to Kelas 8
  await client.query(`
    UPDATE ujian SET kelas_id = $1 WHERE kelas_id IS NOT NULL;
  `, [mainKelasId]);

  // Remove duplicate/old 8B, 8C from kelas if exists to maintain only "Kelas 8"
  await client.query(`
    DELETE FROM kelas WHERE id != $1 AND nama_kelas IN ('Kelas 8A', 'Kelas 8B', 'Kelas 8C');
  `, [mainKelasId]);

  console.log('Class unified to single "Kelas 8" (id: ' + mainKelasId + ').');

  // 3. Fix profil roles: demo accounts should have proper roles, not 'siswa'
  await client.query(`
    UPDATE profil SET peran = 'admin_sekolah' WHERE nama_lengkap = 'Demo ADMIN_SEKOLAH';
    UPDATE profil SET peran = 'super_admin' WHERE nama_lengkap = 'Demo SUPER_ADMIN';
    UPDATE profil SET peran = 'guru' WHERE nama_lengkap ILIKE '%Siti Rahmawati%';
  `);

  // 4. Ensure realistic student NISN and points for all siswa in profil
  const students = await client.query("SELECT id, nama_lengkap, nisn, poin, streak FROM profil WHERE peran = 'siswa' ORDER BY poin DESC");
  console.log(`Found ${students.rows.length} real students in profil.`);

  for (let i = 0; i < students.rows.length; i++) {
    const st = students.rows[i];
    const newNisn = st.nisn || `0089${String(100000 + i * 147)}`;
    const newPoin = st.poin > 0 ? st.poin : (850 - i * 45);
    const newStreak = st.streak > 0 ? st.streak : Math.max(3, 14 - i);
    await client.query(`
      UPDATE profil 
      SET nisn = $1, poin = $2, streak = $3, sekolah_id = $4
      WHERE id = $5
    `, [newNisn, newPoin, newStreak, SEKOLAH_ID, st.id]);

    // Ensure enrolled in anggota_kelas
    const akExist = await client.query("SELECT id FROM anggota_kelas WHERE siswa_id = $1 AND kelas_id = $2", [st.id, mainKelasId]);
    if (akExist.rows.length === 0) {
      await client.query("INSERT INTO anggota_kelas (kelas_id, siswa_id) VALUES ($1, $2)", [mainKelasId, st.id]);
    }
  }

  // 5. Inspect final result
  const finalKelas = await client.query("SELECT * FROM kelas");
  console.log('Final Kelas:', finalKelas.rows);

  const finalMapel = await client.query("SELECT * FROM kelas_aktif_mapel");
  console.log('Final Mapel:', finalMapel.rows);

  const finalStudents = await client.query("SELECT id, nama_lengkap, nisn, poin, streak FROM profil WHERE peran = 'siswa'");
  console.log('Final Students count:', finalStudents.rows.length);

  await client.end();
  console.log('Setup successfully completed.');
}

main().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
