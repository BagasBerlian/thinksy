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
    SELECT b.id as bab_id, b.judul as bab_judul, b.kelas, b.urutan as bab_urutan, 
           m.id as materi_id, m.urutan as materi_urutan, m.judul as materi_judul, 
           LENGTH(m.konten_markdown) as len,
           SUBSTRING(m.konten_markdown, 1, 150) as snippet
    FROM bab b
    LEFT JOIN materi m ON b.id = m.bab_id
    WHERE b.mapel ILIKE '%matematika%' AND b.kelas = 8
    ORDER BY b.urutan, m.urutan
  `);
  res.rows.forEach(r => {
    console.log(`Bab ${r.bab_urutan}: ${r.bab_judul} (id: ${r.bab_id}) | Sub ${r.materi_urutan}: ${r.materi_judul} | len: ${r.len}`);
    console.log(`   Snippet: ${r.snippet?.replace(/\n/g, ' ')}\n`);
  });
  await client.end();
}
run();
