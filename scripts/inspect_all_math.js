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
    SELECT b.id, b.kelas, b.urutan, b.judul, count(m.id) as materi_count, COALESCE(sum(length(m.konten_markdown)), 0) as total_len
    FROM bab b
    LEFT JOIN materi m ON b.id = m.bab_id
    WHERE b.mapel ILIKE '%matematika%'
    GROUP BY b.id, b.kelas, b.urutan, b.judul
    ORDER BY b.kelas, b.urutan
  `);
  console.log('ALL MATEMATIKA CHAPTERS STATUS:');
  res.rows.forEach(r => {
    console.log(`Kelas ${r.kelas} Bab ${r.urutan}: ${r.judul} | ID: ${r.id} | Materi Rows: ${r.materi_count} | Total Length: ${r.total_len} chars`);
  });
  await client.end();
}
run();
