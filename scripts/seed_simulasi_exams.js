const { Client } = require('pg');

const client = new Client({
  host: 'aws-0-ap-southeast-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.mtpnbviztquitgszrfel',
  password: 'programermudaindonesia',
  ssl: { rejectUnauthorized: false }
});

const SIMULASI_DEFS = [
  {
    id: 'e7eebc99-9c0b-4ef8-bb6d-6bb9bd380a77',
    tipe: 'simulasi',
    mapel: 'Literasi Membaca',
    judul: 'Simulasi ANBK: Literasi Membaca & Analisis Wacana',
    deskripsi: 'Latihan simulasi mandiri model Asesmen Kompetensi Minimum (AKM) Kemendikbudristek untuk mengasah nalar membaca kritis dan interpretasi wacana informasi.',
    durasi_menit: 60,
    passing_grade: 70,
    token: '12345',
    status: 'dipublikasi'
  },
  {
    id: 'e8eebc99-9c0b-4ef8-bb6d-6bb9bd380a88',
    tipe: 'simulasi',
    mapel: 'Numerasi Logika',
    judul: 'Simulasi ANBK: Numerasi Bernalar & Logika Kuantitatif',
    deskripsi: 'Latihan simulasi mandiri pemecahan masalah konteks saintifik, nalar numerasi, dan logika kuantitatif standar Pusmendik Kemendikbudristek.',
    durasi_menit: 60,
    passing_grade: 70,
    token: '12345',
    status: 'dipublikasi'
  },
  {
    id: 'e9eebc99-9c0b-4ef8-bb6d-6bb9bd380a99',
    tipe: 'simulasi',
    mapel: 'Survei Karakter',
    judul: 'Simulasi Survei Karakter & Profil Pelajar Pancasila',
    deskripsi: 'Latihan evaluasi mandiri sikap, nilai kebiasaan, integritas, dan iklim kebinekaan dalam lingkungan belajar sekolah berkarakter.',
    durasi_menit: 45,
    passing_grade: 75,
    token: '12345',
    status: 'dipublikasi'
  }
];

async function seedSimulasi() {
  await client.connect();

  // Allow 'simulasi' in check constraint
  await client.query(`
    ALTER TABLE ujian DROP CONSTRAINT IF EXISTS ujian_tipe_check;
    ALTER TABLE ujian ADD CONSTRAINT ujian_tipe_check CHECK (tipe = ANY (ARRAY['ulangan'::text, 'ujian'::text, 'simulasi'::text]));
  `);
  console.log('Updated constraint ujian_tipe_check');

  const defaultSekolahId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  const defaultKelasId = 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  const defaultGuruId = '0167f654-305e-4a13-a623-62111a51a009';

  const now = new Date();
  const startTime = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const endTime = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

  for (const sim of SIMULASI_DEFS) {
    await client.query(
      `INSERT INTO ujian (
        id, sekolah_id, guru_id, kelas_id, mapel, judul, deskripsi, 
        durasi_menit, passing_grade, waktu_mulai, waktu_berakhir, 
        status, tipe, token, is_sequential, acak_soal, acak_opsi
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, false, true, true
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
        sim.id,
        defaultSekolahId,
        defaultGuruId,
        defaultKelasId,
        sim.mapel,
        sim.judul,
        sim.deskripsi,
        sim.durasi_menit,
        sim.passing_grade,
        startTime.toISOString(),
        endTime.toISOString(),
        sim.status,
        sim.tipe,
        sim.token
      ]
    );
    console.log(`Seeded simulasi: ${sim.judul}`);
  }

  await client.end();
}

seedSimulasi().catch(err => {
  console.error('Error seeding simulasi:', err);
  process.exit(1);
});
