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
  const tablesRes = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
  console.log('Tables:', tablesRes.rows.map(r => r.table_name).join(', '));
  
  const kelas = await client.query("SELECT * FROM kelas");
  console.log('Kelas rows:', kelas.rows);

  const anggota = await client.query("SELECT * FROM anggota_kelas LIMIT 5");
  console.log('Anggota kelas sample:', anggota.rows);

  const profilSample = await client.query("SELECT id, nama_lengkap, nisn, poin, streak, peran FROM profil WHERE peran = 'siswa'");
  console.log('Siswa count:', profilSample.rows.length);
  console.log('Siswa rows:', profilSample.rows);

  // Check presensi, ujian, kuis, jawaban, etc.
  const presensiSample = await client.query("SELECT * FROM presensi LIMIT 5");
  console.log('Presensi sample:', presensiSample.rows);

  const ujianCols = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'ujian'");
  console.log('Ujian columns:', ujianCols.rows.map(r => r.column_name));

  const ujianSample = await client.query("SELECT id, judul, jenis, mata_pelajaran, kelas FROM ujian LIMIT 5");
  console.log('Ujian sample:', ujianSample.rows);

  const babSample = await client.query("SELECT id, judul, mata_pelajaran, kelas FROM bab LIMIT 5");
  console.log('Bab sample:', babSample.rows);

  await client.end();
}
main().catch(console.error);
