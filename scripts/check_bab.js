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
  
  const babs = await client.query('SELECT id, judul, mapel, kelas, urutan FROM bab ORDER BY mapel, urutan');
  console.log('--- BAB LIST (Total: ' + babs.rows.length + ') ---');
  babs.rows.forEach(b => console.log(`[Bab ${b.urutan}] ${b.judul} | Mapel: ${b.mapel} | Kelas: ${b.kelas} | ID: ${b.id}`));

  const materi = await client.query('SELECT id, bab_id, judul, urutan, LENGTH(konten_markdown) as len FROM materi ORDER BY bab_id, urutan');
  console.log('\n--- MATERI LIST (Total: ' + materi.rows.length + ') ---');
  materi.rows.forEach(m => console.log(`Bab: ${m.bab_id} | Sub ${m.urutan}. ${m.judul} | Len: ${m.len} chars`));

  await client.end();
}

main().catch(console.error);
