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

  console.log('--- SESI UJIAN SAMPLE ---');
  const sesi = await client.query("SELECT id, ujian_id, siswa_id, status, nilai_akhir FROM sesi_ujian LIMIT 10");
  console.log(sesi.rows);

  console.log('--- PRESENSI SAMPLE ---');
  const presensiSample = await client.query("SELECT id, siswa_id, status, tanggal, poin_didapat FROM presensi LIMIT 10");
  console.log(presensiSample.rows);

  console.log('--- PROGRES MATERI ---');
  const progCount = await client.query("SELECT count(*) FROM progres_materi");
  console.log('progres_materi count:', progCount.rows[0].count);

  console.log('--- BAB PER MAPEL ---');
  const mapelsInBab = await client.query("SELECT mata_pelajaran, count(*) as jml_bab FROM bab GROUP BY mata_pelajaran");
  console.log(mapelsInBab.rows);

  console.log('--- SOAL COUNT PER UJIAN / TIPE ---');
  const ujianSummary = await client.query("SELECT u.tipe, u.mapel, count(us.id) as jml_soal FROM ujian u LEFT JOIN ujian_soal us ON u.id = us.ujian_id GROUP BY u.tipe, u.mapel");
  console.log(ujianSummary.rows);

  await client.end();
}
main().catch(console.error);
