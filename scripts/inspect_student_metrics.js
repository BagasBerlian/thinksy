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

  const sessions = await client.query(`
    SELECT 
      su.id as sesi_id,
      su.siswa_id,
      p.nama_lengkap,
      u.judul,
      u.tipe,
      u.mapel,
      su.nilai_akhir,
      su.status
    FROM sesi_ujian su
    JOIN ujian u ON su.ujian_id = u.id
    JOIN profil p ON su.siswa_id = p.id
    ORDER BY p.nama_lengkap, u.tipe
  `);
  console.log('Total sesi ujian in DB:', sessions.rows.length);
  console.log('Sample sesi ujian:', sessions.rows.slice(0, 10));

  // Count by tipe
  const countsByTipe = await client.query(`
    SELECT u.tipe, count(su.id) as total_sesi, avg(su.nilai_akhir) as avg_nilai
    FROM sesi_ujian su
    JOIN ujian u ON su.ujian_id = u.id
    GROUP BY u.tipe
  `);
  console.log('Counts by tipe:', countsByTipe.rows);

  // Check presensi per siswa
  const presensiPerSiswa = await client.query(`
    SELECT p.nama_lengkap, pr.siswa_id, count(*) as total_hadir
    FROM presensi pr
    JOIN profil p ON pr.siswa_id = p.id
    WHERE pr.status = 'Hadir'
    GROUP BY p.nama_lengkap, pr.siswa_id
  `);
  console.log('Presensi per siswa:', presensiPerSiswa.rows);

  // Check progres_materi per siswa
  const progresPerSiswa = await client.query(`
    SELECT p.nama_lengkap, count(pm.id) as materi_selesai
    FROM progres_materi pm
    JOIN profil p ON pm.siswa_id = p.id
    GROUP BY p.nama_lengkap
  `);
  console.log('Progres materi per siswa:', progresPerSiswa.rows);

  await client.end();
}
run().catch(console.error);
