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

  const SEKOLAH_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

  // 1. Ensure Kelas 8A, 8B, 8C exist
  const classes = [
    { nama: 'Kelas 8A', wali: 'Ibu Siti Rahmawati, M.Pd.', nip: '19820415 200801 2 014' },
    { nama: 'Kelas 8B', wali: 'Budi Santoso, S.Pd.', nip: '19790620 200501 1 008' },
    { nama: 'Kelas 8C', wali: 'Dra. Nurul Hidayah', nip: '19750912 200003 2 003' }
  ];

  const classMap = {};

  for (const c of classes) {
    const existing = await client.query('SELECT * FROM kelas WHERE sekolah_id = $1 AND nama_kelas = $2', [SEKOLAH_ID, c.nama]);
    if (existing.rows.length > 0) {
      classMap[c.nama] = existing.rows[0].id;
      console.log(`Found ${c.nama} with ID ${existing.rows[0].id}`);
    } else {
      const ins = await client.query('INSERT INTO kelas (sekolah_id, nama_kelas) VALUES ($1, $2) RETURNING id', [SEKOLAH_ID, c.nama]);
      classMap[c.nama] = ins.rows[0].id;
      console.log(`Created ${c.nama} with ID ${ins.rows[0].id}`);
    }
  }

  // 2. Fetch existing students
  const studentsRes = await client.query("SELECT id, nama_lengkap, poin FROM profil WHERE peran = 'siswa' ORDER BY dibuat_pada ASC");
  console.log(`Total existing students: ${studentsRes.rows.length}`);

  // Distribute existing students into 8A, 8B, 8C
  for (let i = 0; i < studentsRes.rows.length; i++) {
    const s = studentsRes.rows[i];
    const targetClass = i % 3 === 0 ? 'Kelas 8A' : i % 3 === 1 ? 'Kelas 8B' : 'Kelas 8C';
    const classId = classMap[targetClass];

    // Check anggota_kelas
    const existAk = await client.query('SELECT * FROM anggota_kelas WHERE siswa_id = $1', [s.id]);
    if (existAk.rows.length === 0) {
      await client.query('INSERT INTO anggota_kelas (kelas_id, siswa_id) VALUES ($1, $2)', [classId, s.id]);
      console.log(`Enrolled ${s.nama_lengkap} into ${targetClass}`);
    } else {
      console.log(`Student ${s.nama_lengkap} already enrolled`);
    }
  }

  console.log('Seeding finished successfully');
  await client.end();
}

main().catch(console.error);
