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
  const SEKOLAH_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  const KELAS_ID = 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

  // Additional realistic students for Kelas 8
  const additionalStudents = [
    { nama: 'Ahmad Fauzi', nisn: '0089201145', poin: 1180, streak: 15 },
    { nama: 'Siti Aisyah Putri', nisn: '0089201146', poin: 1120, streak: 12 },
    { nama: 'Rian Hidayat', nisn: '0089201147', poin: 980, streak: 10 },
    { nama: 'Nanda Kurnia Putri', nisn: '0089201148', poin: 940, streak: 9 },
    { nama: 'Dimas Wahyudi', nisn: '0089201149', poin: 890, streak: 8 },
    { nama: 'Dewi Sartika', nisn: '0089201150', poin: 860, streak: 7 },
    { nama: 'Fira Anggraini', nisn: '0089201151', poin: 820, streak: 6 },
    { nama: 'Gilang Ramadhan', nisn: '0089201152', poin: 780, streak: 5 },
  ];

  for (const st of additionalStudents) {
    const existing = await client.query("SELECT id FROM profil WHERE nama_lengkap = $1", [st.nama]);
    let studentId;
    if (existing.rows.length === 0) {
      const ins = await client.query(`
        INSERT INTO profil (id, nama_lengkap, nisn, poin, streak, peran, sekolah_id)
        VALUES (gen_random_uuid(), $1, $2, $3, $4, 'siswa', $5)
        RETURNING id
      `, [st.nama, st.nisn, st.poin, st.streak, SEKOLAH_ID]);
      studentId = ins.rows[0].id;
      console.log(`Created student: ${st.nama} (${studentId})`);
    } else {
      studentId = existing.rows[0].id;
      await client.query(`
        UPDATE profil SET nisn = $1, poin = $2, streak = $3, sekolah_id = $4 WHERE id = $5
      `, [st.nisn, st.poin, st.streak, SEKOLAH_ID, studentId]);
    }

    // Ensure enrolled in Kelas 8
    const akExist = await client.query("SELECT id FROM anggota_kelas WHERE siswa_id = $1 AND kelas_id = $2", [studentId, KELAS_ID]);
    if (akExist.rows.length === 0) {
      await client.query("INSERT INTO anggota_kelas (kelas_id, siswa_id) VALUES ($1, $2)", [KELAS_ID, studentId]);
    }
  }

  // Ensure presensi records exist for all students
  const allStudents = await client.query("SELECT id, nama_lengkap FROM profil WHERE peran = 'siswa'");
  console.log(`Total students now: ${allStudents.rows.length}`);

  const today = new Date();
  for (const st of allStudents.rows) {
    const presCount = await client.query("SELECT count(*) FROM presensi WHERE siswa_id = $1", [st.id]);
    if (parseInt(presCount.rows[0].count) < 5) {
      for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
        const d = new Date(today);
        d.setDate(d.getDate() - dayOffset);
        await client.query(`
          INSERT INTO presensi (siswa_id, tanggal, waktu_masuk, status)
          VALUES ($1, $2, $3, 'Hadir')
        `, [st.id, d.toISOString().split('T')[0], d.toISOString()]);
      }
    }
  }

  // Fetch available exams to ensure every student has exam sessions
  const exams = await client.query("SELECT id, tipe, mapel, passing_grade FROM ujian");
  if (exams.rows.length > 0) {
    for (const st of allStudents.rows) {
      const sessCount = await client.query("SELECT count(*) FROM sesi_ujian WHERE siswa_id = $1", [st.id]);
      if (parseInt(sessCount.rows[0].count) < 2) {
        for (let i = 0; i < Math.min(3, exams.rows.length); i++) {
          const ex = exams.rows[i];
          const randomScore = Math.floor(75 + Math.random() * 23); // 75 - 98
          await client.query(`
            INSERT INTO sesi_ujian (ujian_id, siswa_id, status, nilai_akhir, server_start_time, server_end_time, dikumpulkan_pada)
            VALUES ($1, $2, 'selesai', $3, now() - interval '2 days', now() - interval '2 days' + interval '45 minutes', now() - interval '2 days' + interval '45 minutes')
          `, [ex.id, st.id, randomScore]);
        }
      }
    }
  }

  console.log('Student records, attendance, and exam sessions successfully enriched in Supabase.');
  await client.end();
}

main().catch(console.error);
