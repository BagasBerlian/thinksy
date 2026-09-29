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
  console.log('Connected to PostgreSQL database.');

  // 1. Ensure REPLICA IDENTITY FULL on important tables so all columns are included in WAL/realtime
  const replicaTables = ['profil', 'presensi', 'notifikasi', 'ujian', 'sesi', 'sesi_ujian', 'jawaban', 'jawaban_ujian'];
  for (const table of replicaTables) {
    try {
      await client.query(`ALTER TABLE public.${table} REPLICA IDENTITY FULL`);
      console.log(`✓ Set REPLICA IDENTITY FULL on ${table}`);
    } catch (e) {
      console.warn(`! Warning setting replica identity on ${table}:`, e.message);
    }
  }

  // 2. Add tables to supabase_realtime publication
  for (const table of replicaTables) {
    try {
      await client.query(`ALTER PUBLICATION supabase_realtime ADD TABLE public.${table}`);
      console.log(`✓ Added public.${table} to supabase_realtime publication`);
    } catch (e) {
      if (e.message.includes('already in publication')) {
        console.log(`- public.${table} already in publication`);
      } else {
        console.warn(`! Error adding ${table} to publication:`, e.message);
      }
    }
  }

  // 3. Verify publication tables
  const pubRes = await client.query("SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime'");
  console.log('Final tables in supabase_realtime:', pubRes.rows.map(r => r.tablename));

  // 4. Verify get_peringkat_sekolah function
  const funcRes = await client.query("SELECT routine_name FROM information_schema.routines WHERE routine_name = 'get_peringkat_sekolah'");
  console.log('get_peringkat_sekolah function exists:', funcRes.rows.length > 0);

  await client.end();
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
