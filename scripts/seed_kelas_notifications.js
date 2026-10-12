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

  const classesToEnsure = [
    'Level 10 - Artificial Intelligence',
    'Science',
    'Orientasi',
    'Matematika',
    'Bahasa Indonesia',
    'Bahasa Inggris'
  ];

  for (const name of classesToEnsure) {
    const check = await client.query('SELECT id FROM kelas WHERE nama_kelas = $1', [name]);
    if (check.rows.length === 0) {
      await client.query('INSERT INTO kelas (sekolah_id, nama_kelas) VALUES ($1, $2)', [
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        name
      ]);
      console.log('Inserted class:', name);
    } else {
      console.log('Already exists:', name);
    }
  }

  const all = await client.query('SELECT id, nama_kelas FROM kelas ORDER BY dibuat_pada ASC');
  console.log('ALL KELAS NOW:', all.rows);

  await client.end();
}

main().catch(console.error);
