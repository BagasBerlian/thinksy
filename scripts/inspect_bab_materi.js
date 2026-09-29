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
  const mapelRes = await client.query('SELECT mapel, COUNT(*) as count FROM bab GROUP BY mapel ORDER BY count DESC');
  console.log('Mapel in bab:', mapelRes.rows);

  const mtkBab = await client.query("SELECT id, urutan, judul, mapel, kelas, semester FROM bab WHERE mapel ILIKE '%matematika%' ORDER BY urutan ASC");
  console.log('Matematika chapters:');
  for (const b of mtkBab.rows) {
    const materiRes = await client.query("SELECT id, judul, urutan, LENGTH(konten_markdown) as len FROM materi WHERE bab_id = $1 ORDER BY urutan ASC", [b.id]);
    console.log(`Bab ${b.urutan}: [${b.id}] ${b.judul} (${b.mapel}) -> ${materiRes.rows.length} materi`);
    for (const m of materiRes.rows) {
      console.log(`   - [${m.urutan}] ${m.judul} (${m.len} chars)`);
    }
  }

  const mtk = await client.query("SELECT id, urutan, judul, deskripsi, mapel, kelas, semester FROM bab WHERE mapel ILIKE '%matematika%' ORDER BY urutan ASC, dibuat_pada ASC");
  console.log(`Matematika chapters count: ${mtk.rows.length}`);
  mtk.rows.forEach(b => console.log(`[Bab ${b.urutan}] [Kelas ${b.kelas} Sem ${b.semester}] ${b.judul} (${b.id})`));

  await client.end();
}

run().catch(console.error);
