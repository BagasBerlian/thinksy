const { Client } = require('pg');

const client = new Client({
  host: 'aws-0-ap-southeast-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.mtpnbviztquitgszrfel',
  password: 'programermudaindonesia',
  ssl: { rejectUnauthorized: false }
});

const SIMULASI_CONFIGS = [
  {
    ujianId: 'e7eebc99-9c0b-4ef8-bb6d-6bb9bd380a77',
    mapels: ['Bahasa Indonesia', 'Bahasa Inggris'],
    count: 20
  },
  {
    ujianId: 'e8eebc99-9c0b-4ef8-bb6d-6bb9bd380a88',
    mapels: ['Matematika', 'IPA', 'Informatika'],
    count: 20
  },
  {
    ujianId: 'e9eebc99-9c0b-4ef8-bb6d-6bb9bd380a99',
    mapels: ['Pendidikan Pancasila', 'Pendidikan Agama Islam dan Budi Pekerti', 'IPS'],
    count: 25
  }
];

async function seedSimulasiSoal() {
  await client.connect();

  for (const cfg of SIMULASI_CONFIGS) {
    // Delete existing links for this exam
    await client.query('DELETE FROM ujian_soal WHERE ujian_id = $1', [cfg.ujianId]);

    // Query random questions from the given mapels
    const res = await client.query(`
      SELECT s.id 
      FROM soal s
      JOIN bab b ON s.bab_id = b.id
      WHERE b.mapel = ANY($1::text[])
      ORDER BY RANDOM()
      LIMIT $2;
    `, [cfg.mapels, cfg.count]);

    console.log(`Found ${res.rows.length} random questions for ujian ${cfg.ujianId} (${cfg.mapels.join(', ')})`);

    // Insert into ujian_soal
    for (let i = 0; i < res.rows.length; i++) {
      const soalId = res.rows[i].id;
      await client.query(`
        INSERT INTO ujian_soal (ujian_id, soal_id, urutan, poin_bobot)
        VALUES ($1, $2, $3, $4);
      `, [cfg.ujianId, soalId, i + 1, 5]);
    }

    console.log(`Successfully linked ${res.rows.length} questions to ujian ${cfg.ujianId}`);
  }

  await client.end();
}

seedSimulasiSoal().catch(err => {
  console.error('Error seeding simulasi soal:', err);
  process.exit(1);
});
