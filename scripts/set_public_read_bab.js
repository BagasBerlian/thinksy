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
  
  await client.query(`DROP POLICY IF EXISTS "bab: user login bisa baca" ON bab;`);
  await client.query(`DROP POLICY IF EXISTS "bab: public read" ON bab;`);
  await client.query(`CREATE POLICY "bab: public read" ON bab FOR SELECT USING (true);`);
  
  await client.query(`DROP POLICY IF EXISTS "materi: user login bisa baca" ON materi;`);
  await client.query(`DROP POLICY IF EXISTS "materi: public read" ON materi;`);
  await client.query(`CREATE POLICY "materi: public read" ON materi FOR SELECT USING (true);`);

  console.log('Public read policy successfully applied to bab and materi.');
  await client.end();
}

run().catch(console.error);
