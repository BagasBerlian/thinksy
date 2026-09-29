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
    SELECT tablename, rowsecurity 
    FROM pg_tables 
    WHERE tablename IN ('bab', 'materi')
  `);
  console.log('RLS status:', res.rows);

  const policies = await client.query(`
    SELECT tablename, policyname, roles, cmd, qual 
    FROM pg_policies 
    WHERE tablename IN ('bab', 'materi')
  `);
  console.log('Policies:', policies.rows);

  await client.end();
}
run();
