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
  const SEKOLAH_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  const KELAS_ID = 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

  const userProfiles = [
    { id: '6bf6783e-e504-4ed6-9a4c-f7795c32a05c', nama: 'Siti Rahayu', nisn: '0089201140', poin: 950, streak: 12 },
    { id: '2d0a8cf9-56ab-47c5-9cc3-36e8a229e72d', nama: 'Ahmad Fauzi', nisn: '0089201141', poin: 920, streak: 11 },
    { id: 'afb0e867-541c-4291-bff7-7e9686265d6b', nama: 'Nadela Oktavia', nisn: '0089201142', poin: 880, streak: 9 },
    { id: '5f27d18b-de64-4edd-aefa-d80935b28801', nama: 'Nanoka Sasaki', nisn: '0089201143', poin: 840, streak: 8 },
    { id: '6a51fdc9-1401-4a27-af28-378da635a037', nama: 'Sarah Bielani', nisn: '0089201144', poin: 810, streak: 7 },
    { id: '6339d0f9-4c65-4841-be2e-771bdf8b39d2', nama: 'Zafa Kuncoro', nisn: '0089201145', poin: 790, streak: 6 },
  ];

  for (const up of userProfiles) {
    const existing = await client.query('SELECT id FROM profil WHERE id = $1', [up.id]);
    if (existing.rows.length === 0) {
      await client.query(`
        INSERT INTO profil (id, nama_lengkap, nisn, poin, streak, peran, sekolah_id)
        VALUES ($1, $2, $3, $4, $5, 'siswa', $6)
      `, [up.id, up.nama, up.nisn, up.poin, up.streak, SEKOLAH_ID]);
    } else {
      await client.query(`
        UPDATE profil SET nama_lengkap = $2, nisn = $3, poin = $4, streak = $5, peran = 'siswa', sekolah_id = $6
        WHERE id = $1
      `, [up.id, up.nama, up.nisn, up.poin, up.streak, SEKOLAH_ID]);
    }

    const ak = await client.query('SELECT id FROM anggota_kelas WHERE siswa_id = $1 AND kelas_id = $2', [up.id, KELAS_ID]);
    if (ak.rows.length === 0) {
      await client.query('INSERT INTO anggota_kelas (kelas_id, siswa_id) VALUES ($1, $2)', [KELAS_ID, up.id]);
    }
  }

  // Ensure presensi records exist
  const allStudents = await client.query("SELECT id, nama_lengkap FROM profil WHERE peran = 'siswa'");
  const today = new Date();
  for (const st of allStudents.rows) {
    const presCount = await client.query("SELECT count(*) FROM presensi WHERE siswa_id = $1", [st.id]);
    if (parseInt(presCount.rows[0].count) < 3) {
      for (let dayOffset = 1; dayOffset <= 5; dayOffset++) {
        const d = new Date(today);
        d.setDate(d.getDate() - dayOffset);
        await client.query(`
          INSERT INTO presensi (siswa_id, tanggal, waktu_masuk, status)
          VALUES ($1, $2, $3, 'Hadir')
        `, [st.id, d.toISOString().split('T')[0], d.toISOString()]);
      }
    }
  }

  // Ensure exam sessions exist
  const exams = await client.query("SELECT id, tipe, mapel FROM ujian");
  for (const st of allStudents.rows) {
    const sessCount = await client.query("SELECT count(*) FROM sesi_ujian WHERE siswa_id = $1", [st.id]);
    if (parseInt(sessCount.rows[0].count) < 2) {
      for (let i = 0; i < Math.min(3, exams.rows.length); i++) {
        const ex = exams.rows[i];
        const randomScore = Math.floor(75 + Math.random() * 23);
        await client.query(`
          INSERT INTO sesi_ujian (ujian_id, siswa_id, status, nilai_akhir, server_start_time, server_end_time, dikumpulkan_pada)
          VALUES ($1, $2, 'selesai', $3, now() - interval '3 days', now() - interval '3 days' + interval '40 minutes', now() - interval '3 days' + interval '40 minutes')
        `, [ex.id, st.id, randomScore]);
      }
    }
  }

  const allSiswa = await client.query("SELECT p.id, p.nama_lengkap, p.nisn, p.poin, p.streak, k.nama_kelas FROM profil p JOIN anggota_kelas ak ON p.id = ak.siswa_id JOIN kelas k ON ak.kelas_id = k.id WHERE p.peran = 'siswa' ORDER BY p.poin DESC");
  console.log('Total enrolled Kelas 8 students:', allSiswa.rows.length);
  console.log(allSiswa.rows);

  await client.end();
}
run().catch(console.error);
