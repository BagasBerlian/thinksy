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
  console.log('Connected to DB');

  // Fetch some exams
  const exams = await client.query("SELECT id, judul, mapel, passing_grade FROM ujian LIMIT 4");
  const students = await client.query("SELECT id, nama_lengkap FROM profil WHERE peran = 'siswa' LIMIT 10");

  for (const s of students.rows) {
    for (const u of exams.rows) {
      // Check if session exists
      const existSesi = await client.query("SELECT id FROM sesi_ujian WHERE ujian_id = $1 AND siswa_id = $2", [u.id, s.id]);
      let sessionId;
      if (existSesi.rows.length === 0) {
        // Random score between 75 and 98
        const score = Math.floor(Math.random() * 24) + 75;
        const ins = await client.query(`
          INSERT INTO sesi_ujian (
            ujian_id, siswa_id, status, nilai_akhir, skor_objektif, skor_esai, 
            server_start_time, server_end_time, dikumpulkan_pada
          ) VALUES ($1, $2, 'selesai', $3, $4, 0, NOW() - INTERVAL '1 days', NOW() - INTERVAL '1 days' + INTERVAL '45 minutes', NOW() - INTERVAL '1 days' + INTERVAL '45 minutes')
          RETURNING id
        `, [u.id, s.id, score, score]);
        sessionId = ins.rows[0].id;
        console.log(`Created sesi_ujian for ${s.nama_lengkap} on ${u.judul} with score ${score}`);
      } else {
        sessionId = existSesi.rows[0].id;
      }

      // Check questions and options
      const questions = await client.query(`
        SELECT us.soal_id, s.pertanyaan, s.tipe_soal
        FROM ujian_soal us 
        JOIN soal s ON us.soal_id = s.id 
        WHERE us.ujian_id = $1 
        ORDER BY us.urutan ASC
      `, [u.id]);

      for (const q of questions.rows) {
        const existJwb = await client.query("SELECT id FROM jawaban_ujian WHERE sesi_ujian_id = $1 AND soal_id = $2", [sessionId, q.soal_id]);
        if (existJwb.rows.length === 0) {
          const ops = await client.query("SELECT id, benar, teks_opsi FROM opsi_soal WHERE soal_id = $1 ORDER BY urutan ASC", [q.soal_id]);
          if (ops.rows.length > 0) {
            const correctOpt = ops.rows.find(o => o.benar) || ops.rows[0];
            const isCorrect = Math.random() < 0.85;
            const chosen = isCorrect ? correctOpt : (ops.rows.find(o => !o.benar) || correctOpt);

            await client.query(`
              INSERT INTO jawaban_ujian (
                sesi_ujian_id, soal_id, opsi_dipilih_id, is_benar, skor_diperoleh, koreksi_ai, dijawab_pada
              ) VALUES ($1, $2, $3, $4, $5, $6, NOW() - INTERVAL '1 days' + INTERVAL '10 minutes')
            `, [
              sessionId, 
              q.soal_id, 
              chosen.id, 
              chosen.benar, 
              chosen.benar ? 10 : 0, 
              chosen.benar ? 'Jawaban tepat sesuai kaidah dan materi.' : 'Perlu ketelitian dalam memahami konsep dasar.'
            ]);
          }
        }
      }
    }
  }

  console.log('Seeded exam answers successfully');
  await client.end();
}

main().catch(console.error);
