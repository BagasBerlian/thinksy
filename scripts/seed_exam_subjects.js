const { Client } = require('pg');

const client = new Client({
  host: 'aws-0-ap-southeast-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.mtpnbviztquitgszrfel',
  password: 'programermudaindonesia',
  ssl: { rejectUnauthorized: false }
});

const EXAM_DEFINITIONS = [
  // 1. ULANGAN HARIAN
  {
    id: 'e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    tipe: 'ulangan',
    mapel: 'Matematika',
    judul: 'Ulangan Harian 1: Bilangan Berpangkat & Aljabar',
    deskripsi: 'Evaluasi formatif bab bilangan berpangkat, pola bilangan, dan bentuk aljabar dengan pendekatan sokratik terstruktur.',
    durasi_menit: 60,
    passing_grade: 75,
    token: 'MTK-ULG26',
    status: 'dipublikasi'
  },
  {
    id: 'e3eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    tipe: 'ulangan',
    mapel: 'Bahasa Indonesia',
    judul: 'Ulangan Harian: Teks Laporan Hasil Observasi & Kalimat Efektif',
    deskripsi: 'Uji pemahaman struktur teks LHO, konjungsi intrakalimat, dan penulisan objektif berbasis bimbingan penalaran sokratik.',
    durasi_menit: 60,
    passing_grade: 75,
    token: 'IND-ULG26',
    status: 'dipublikasi'
  },
  {
    id: 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    tipe: 'ulangan',
    mapel: 'Bahasa Inggris',
    judul: 'Ulangan Harian: Descriptive Text & Daily Routines',
    deskripsi: 'Evaluasi tenses, vocabulary, adjectives, dan pemahaman konteks deskriptif dengan panduan sokratik reflektif.',
    durasi_menit: 60,
    passing_grade: 75,
    token: 'ENG-ULG26',
    status: 'dipublikasi'
  },

  // 2. UJIAN RESMI (PTS / SUMATIF)
  {
    id: 'e5eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    tipe: 'ujian',
    mapel: 'Matematika',
    judul: 'Penilaian Tengah Semester (PTS) Matematika Terpadu',
    deskripsi: 'Asesmen sumatif resmi tengah semester mata pelajaran Matematika Kelas 8 materi Aljabar, Relasi Fungsi, dan Teorema Pythagoras.',
    durasi_menit: 90,
    passing_grade: 75,
    token: 'MTK-PTS26',
    status: 'dipublikasi'
  },
  {
    id: 'e6eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
    tipe: 'ujian',
    mapel: 'Bahasa Indonesia',
    judul: 'Penilaian Tengah Semester (PTS) Bahasa Indonesia',
    deskripsi: 'Asesmen sumatif resmi tengah semester mata pelajaran Bahasa Indonesia pemahaman bacaan sastra, artikel opini, dan kaidah kebahasaan.',
    durasi_menit: 90,
    passing_grade: 75,
    token: 'IND-PTS26',
    status: 'dipublikasi'
  },
  {
    id: 'e2eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    tipe: 'ujian',
    mapel: 'Bahasa Inggris',
    judul: 'Penilaian Tengah Semester (PTS) Bahasa Inggris',
    deskripsi: 'Asesmen sumatif resmi tengah semester mata pelajaran Bahasa Inggris menguji reading comprehension, dialogues, and grammar syntax.',
    durasi_menit: 90,
    passing_grade: 75,
    token: 'ENG-PTS26',
    status: 'dipublikasi'
  }
];

async function seedExams() {
  try {
    await client.connect();
    console.log('Connected to DB');

    const defaultSekolahId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const defaultKelasId = 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const defaultGuruId = '0167f654-305e-4a13-a623-62111a51a009'; // Ibu Rani

    const now = new Date();
    const startTime = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 jam yang lalu
    const endTime = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000); // 60 hari ke depan

    for (const exam of EXAM_DEFINITIONS) {
      console.log(`Processing: ${exam.judul} (${exam.mapel} - ${exam.tipe})...`);

      // 1. Upsert Ujian
      await client.query(
        `INSERT INTO ujian (
          id, sekolah_id, guru_id, kelas_id, mapel, judul, deskripsi, 
          durasi_menit, passing_grade, waktu_mulai, waktu_berakhir, 
          status, tipe, token, is_sequential, acak_soal, acak_opsi
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, false, false, false
        ) ON CONFLICT (id) DO UPDATE SET
          judul = EXCLUDED.judul,
          deskripsi = EXCLUDED.deskripsi,
          mapel = EXCLUDED.mapel,
          tipe = EXCLUDED.tipe,
          durasi_menit = EXCLUDED.durasi_menit,
          passing_grade = EXCLUDED.passing_grade,
          waktu_mulai = EXCLUDED.waktu_mulai,
          waktu_berakhir = EXCLUDED.waktu_berakhir,
          status = EXCLUDED.status,
          token = EXCLUDED.token;`,
        [
          exam.id,
          defaultSekolahId,
          defaultGuruId,
          defaultKelasId,
          exam.mapel,
          exam.judul,
          exam.deskripsi,
          exam.durasi_menit,
          exam.passing_grade,
          startTime.toISOString(),
          endTime.toISOString(),
          exam.status,
          exam.tipe,
          exam.token
        ]
      );

      // 2. Cek apakah ujian_soal sudah ada
      const countRes = await client.query(
        `SELECT COUNT(*) FROM ujian_soal WHERE ujian_id = $1`,
        [exam.id]
      );
      const existingCount = parseInt(countRes.rows[0].count, 10);

      if (existingCount < 10) {
        // Ambil 10 soal dari mapel terkait
        const questionsRes = await client.query(
          `SELECT s.id 
           FROM bab b 
           JOIN soal s ON s.bab_id = b.id 
           WHERE b.mapel = $1 
           LIMIT 10;`,
          [exam.mapel]
        );

        if (questionsRes.rows.length > 0) {
          // Hapus soal lama jika ada agar bersih
          await client.query(`DELETE FROM ujian_soal WHERE ujian_id = $1`, [exam.id]);

          // Insert 10 soal
          for (let i = 0; i < questionsRes.rows.length; i++) {
            const q = questionsRes.rows[i];
            await client.query(
              `INSERT INTO ujian_soal (ujian_id, soal_id, urutan, poin_bobot)
               VALUES ($1, $2, $3, $4)
               ON CONFLICT DO NOTHING;`,
              [exam.id, q.id, i + 1, 10]
            );
          }
          console.log(`  -> Linked ${questionsRes.rows.length} questions for exam ${exam.id}`);
        } else {
          console.warn(`  -> Warning: No questions found in DB for mapel ${exam.mapel}`);
        }
      } else {
        console.log(`  -> Already has ${existingCount} questions linked.`);
      }
    }

    console.log('All 6 exams have been seeded & configured successfully!');
    await client.end();
  } catch (err) {
    console.error('Error seeding exams:', err);
  }
}

seedExams();
