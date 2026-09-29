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
  const res = await client.query(`
    SELECT b.id, b.urutan, b.judul, b.mapel, b.kelas, b.semester,
           COUNT(m.id) as materi_count,
           SUM(LENGTH(COALESCE(m.konten_markdown, ''))) as total_chars
    FROM bab b
    LEFT JOIN materi m ON m.bab_id = b.id
    WHERE b.mapel ILIKE '%matematika%'
    GROUP BY b.id, b.urutan, b.judul, b.mapel, b.kelas, b.semester
    ORDER BY b.kelas ASC, b.urutan ASC
  `);

  console.log('--- DAFTAR BAB MATEMATIKA ---');
  res.rows.forEach(r => {
    console.log(`[Kelas ${r.kelas} Sem ${r.semester}] Bab ${r.urutan}: ${r.judul}`);
    console.log(`   ID: ${r.id} | Materi count: ${r.materi_count} | Total chars: ${r.total_chars}`);
  });

  // Also check other mapel if any
  const otherRes = await client.query(`
    SELECT b.mapel, COUNT(DISTINCT b.id) as bab_count
    FROM bab b
    GROUP BY b.mapel
    ORDER BY bab_count DESC
  `);
  console.log('\n--- MAPEL LAINNYA DI DATABASE ---');
  otherRes.rows.forEach(r => console.log(`${r.mapel}: ${r.bab_count} bab`));

  await client.end();
}

run().catch(console.error);
