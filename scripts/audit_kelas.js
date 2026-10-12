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
  const fks = await client.query(`
    SELECT
      tc.table_name, kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name 
    FROM information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
    WHERE ccu.table_name = 'kelas'
  `);
  console.log('Foreign keys referencing kelas:', fks.rows);

  const existingKelas = await client.query("SELECT * FROM kelas");
  console.log('Current kelas:', existingKelas.rows);

  await client.end();
}
run().catch(console.error);
