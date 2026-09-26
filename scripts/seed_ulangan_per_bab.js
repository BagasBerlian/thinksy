const { Client } = require('pg');

const client = new Client({
  host: 'aws-0-ap-southeast-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.mtpnbviztquitgszrfel',
  password: 'programermudaindonesia',
  ssl: { rejectUnauthorized: false },
});

function getMapelTokenPrefix(mapel) {
  const m = (mapel || '').toLowerCase();
  if (m.includes('matematika')) return 'MTK';
  if (m.includes('indonesia')) return 'IND';
  if (m.includes('inggris')) return 'ENG';
  if (m.includes('ipa')) return 'IPA';
  if (m.includes('ips')) return 'IPS';
  if (m.includes('informatika')) return 'INF';
  if (m.includes('pancasila')) return 'PPKN';
  if (m.includes('agama') || m.includes('islam')) return 'PAI';
  if (m.includes('pjok')) return 'PJK';
  if (m.includes('seni')) return 'SNI';
  return 'ULG';
}

async function seedUlanganPerBab() {
  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL database.');

    const defaultSekolahId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const defaultKelasId = 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const defaultGuruId = '0167f654-305e-4a13-a623-62111a51a009'; // Ibu Rani

    const now = new Date();
    const startTime = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 jam yang lalu
    const endTime = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 hari ke depan

    // Ambil seluruh bab kelas 8
    const { rows: chapters } = await client.query(
      `SELECT id, judul, mapel, urutan, kelas FROM bab WHERE kelas = 8 ORDER BY mapel, urutan`
    );
    console.log(`Found ${chapters.length} chapters for Kelas 8.`);

    let createdCount = 0;
    for (const ch of chapters) {
      const prefix = getMapelTokenPrefix(ch.mapel);
      const token = `${prefix}-B${ch.urutan || 1}`;

      // Bersihkan kata 'Bab X:' jika judul sudah ada awalan 'Bab'
      let cleanTitle = ch.judul;
      if (!cleanTitle.toLowerCase().startsWith('ulangan')) {
        cleanTitle = `Ulangan Harian: ${cleanTitle}`;
      }

      // Upsert ke tabel ujian dengan tipe = 'ulangan' dan bab_id
      // Cek apakah sudah ada ujian tipe 'ulangan' untuk bab_id ini
      const checkRes = await client.query(
        `SELECT id FROM ujian WHERE bab_id = $1 AND tipe = 'ulangan' LIMIT 1`,
        [ch.id]
      );

      let ujianId;
      if (checkRes.rows.length > 0) {
        ujianId = checkRes.rows[0].id;
        await client.query(
          `UPDATE ujian SET 
             judul = $1, 
             mapel = $2, 
             status = 'dipublikasi', 
             token = $3, 
             waktu_mulai = $4, 
             waktu_berakhir = $5
           WHERE id = $6`,
          [cleanTitle, ch.mapel, token, startTime, endTime, ujianId]
        );
      } else {
        const insertRes = await client.query(
          `INSERT INTO ujian (
             sekolah_id, guru_id, kelas_id, bab_id, mapel, judul, deskripsi, 
             durasi_menit, passing_grade, waktu_mulai, waktu_berakhir, 
             status, tipe, token, is_sequential, acak_soal, acak_opsi
           ) VALUES (
             $1, $2, $3, $4, $5, $6, $7, 
             60, 75, $8, $9, 
             'dipublikasi', 'ulangan', $10, false, false, false
           ) RETURNING id`,
          [
            defaultSekolahId,
            defaultGuruId,
            defaultKelasId,
            ch.id,
            ch.mapel,
            cleanTitle,
            `Evaluasi formatif bab ${ch.judul} (${ch.mapel}) kurikulum terstandar dengan pendampingan Sokratik AI.`,
            startTime,
            endTime,
            token,
          ]
        );
        ujianId = insertRes.rows[0].id;
        createdCount++;
      }

      // Hubungkan soal-soal bab ini ke ujian_soal jika belum ada
      const existingSoalRes = await client.query(
        `SELECT count(*) FROM ujian_soal WHERE ujian_id = $1`,
        [ujianId]
      );
      if (parseInt(existingSoalRes.rows[0].count) === 0) {
        const soalListRes = await client.query(
          `SELECT id FROM soal WHERE bab_id = $1 ORDER BY dibuat_pada LIMIT 10`,
          [ch.id]
        );
        for (let i = 0; i < soalListRes.rows.length; i++) {
          await client.query(
            `INSERT INTO ujian_soal (ujian_id, soal_id, urutan, poin_bobot)
             VALUES ($1, $2, $3, 10)
             ON CONFLICT DO NOTHING`,
            [ujianId, soalListRes.rows[i].id, i + 1]
          );
        }
      }
    }

    console.log(`Successfully synced ${chapters.length} ulangan per bab. Newly inserted: ${createdCount}`);

    // Pastikan 3 UJIAN RESMI (PTS) tetap aktif & memiliki tipe = 'ujian'
    const PTS_DEFINITIONS = [
      {
        id: 'e5eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
        tipe: 'ujian',
        mapel: 'Matematika',
        judul: 'Penilaian Tengah Semester (PTS) Matematika Terpadu',
        token: 'MTK-PTS26',
        durasi: 90,
      },
      {
        id: 'e6eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
        tipe: 'ujian',
        mapel: 'Bahasa Indonesia',
        judul: 'Penilaian Tengah Semester (PTS) Bahasa Indonesia',
        token: 'IND-PTS26',
        durasi: 90,
      },
      {
        id: 'e2eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
        tipe: 'ujian',
        mapel: 'Bahasa Inggris',
        judul: 'Penilaian Tengah Semester (PTS) Bahasa Inggris',
        token: 'ENG-PTS26',
        durasi: 90,
      },
    ];

    for (const pts of PTS_DEFINITIONS) {
      await client.query(
        `INSERT INTO ujian (
           id, sekolah_id, guru_id, kelas_id, mapel, judul, deskripsi, 
           durasi_menit, passing_grade, waktu_mulai, waktu_berakhir, 
           status, tipe, token, is_sequential, acak_soal, acak_opsi
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7, 
           $8, 75, $9, $10, 
           'dipublikasi', 'ujian', $11, false, false, false
         ) ON CONFLICT (id) DO UPDATE SET
           tipe = 'ujian',
           mapel = EXCLUDED.mapel,
           judul = EXCLUDED.judul,
           token = EXCLUDED.token,
           status = 'dipublikasi'`,
        [
          pts.id,
          defaultSekolahId,
          defaultGuruId,
          defaultKelasId,
          pts.mapel,
          pts.judul,
          `Asesmen sumatif resmi tengah semester mata pelajaran ${pts.mapel} Kelas 8 kurikulum terstandar.`,
          pts.durasi,
          startTime,
          endTime,
          pts.token,
        ]
      );
    }

    console.log('Verified 3 official PTS exams for Matematika, Bahasa Indonesia, and Bahasa Inggris.');

    await client.end();
  } catch (err) {
    console.error('Error seeding ulangan per bab:', err);
  }
}

seedUlanganPerBab();
