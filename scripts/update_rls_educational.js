const { Client } = require('pg');

const client = new Client({
  host: 'aws-0-ap-southeast-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.mtpnbviztquitgszrfel',
  password: 'programermudaindonesia',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();

  // Allow read access for siswa profiles so school dashboard, leaderboard, search, and management can read real student data
  await client.query(`DROP POLICY IF EXISTS "profil: public read siswa" ON profil;`);
  await client.query(`CREATE POLICY "profil: public read siswa" ON profil FOR SELECT USING (peran = 'siswa');`);

  // Allow read access for kelas, anggota_kelas, kelas_aktif_mapel
  await client.query(`DROP POLICY IF EXISTS "kelas: public read" ON kelas;`);
  await client.query(`CREATE POLICY "kelas: public read" ON kelas FOR SELECT USING (true);`);

  await client.query(`DROP POLICY IF EXISTS "anggota_kelas: public read" ON anggota_kelas;`);
  await client.query(`CREATE POLICY "anggota_kelas: public read" ON anggota_kelas FOR SELECT USING (true);`);

  await client.query(`DROP POLICY IF EXISTS "presensi: public read" ON presensi;`);
  await client.query(`CREATE POLICY "presensi: public read" ON presensi FOR SELECT USING (true);`);

  await client.query(`DROP POLICY IF EXISTS "ujian: public read" ON ujian;`);
  await client.query(`CREATE POLICY "ujian: public read" ON ujian FOR SELECT USING (true);`);

  await client.query(`DROP POLICY IF EXISTS "sesi_ujian: public read" ON sesi_ujian;`);
  await client.query(`CREATE POLICY "sesi_ujian: public read" ON sesi_ujian FOR SELECT USING (true);`);

  await client.query(`DROP POLICY IF EXISTS "jawaban_ujian: public read" ON jawaban_ujian;`);
  await client.query(`CREATE POLICY "jawaban_ujian: public read" ON jawaban_ujian FOR SELECT USING (true);`);

  await client.query(`DROP POLICY IF EXISTS "soal: public read" ON soal;`);
  await client.query(`CREATE POLICY "soal: public read" ON soal FOR SELECT USING (true);`);

  await client.query(`DROP POLICY IF EXISTS "opsi_soal: public read" ON opsi_soal;`);
  await client.query(`CREATE POLICY "opsi_soal: public read" ON opsi_soal FOR SELECT USING (true);`);

  console.log('Policies updated successfully.');
  await client.end();
}
run().catch(console.error);
