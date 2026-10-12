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
  const policies = await client.query("SELECT * FROM pg_policies WHERE tablename = 'profil'");
  console.log('Policies on profil:', policies.rows.map(p => ({ name: p.policyname, cmd: p.cmd, qual: p.qual, roles: p.roles })));
  
  // Also check if service role key is in vault or if we can grant SELECT on profil to anon or authenticated
  // Or check if there is an admin service key
  await client.end();
}
run().catch(console.error);
