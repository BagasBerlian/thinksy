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
  console.log("Connected to DB");
  
  // Allow all on ujian, ujian_soal, sesi_ujian, jawaban_ujian for server operations
  await client.query(`DROP POLICY IF EXISTS "ujian_public_all" ON ujian;`);
  await client.query(`CREATE POLICY "ujian_public_all" ON ujian FOR ALL USING (true) WITH CHECK (true);`);

  await client.query(`DROP POLICY IF EXISTS "ujian_soal_public_all" ON ujian_soal;`);
  await client.query(`CREATE POLICY "ujian_soal_public_all" ON ujian_soal FOR ALL USING (true) WITH CHECK (true);`);

  await client.query(`DROP POLICY IF EXISTS "sesi_ujian_public_all" ON sesi_ujian;`);
  await client.query(`CREATE POLICY "sesi_ujian_public_all" ON sesi_ujian FOR ALL USING (true) WITH CHECK (true);`);

  await client.query(`DROP POLICY IF EXISTS "jawaban_ujian_public_all" ON jawaban_ujian;`);
  await client.query(`CREATE POLICY "jawaban_ujian_public_all" ON jawaban_ujian FOR ALL USING (true) WITH CHECK (true);`);

  console.log("Policies updated successfully!");
  await client.end();
}

main().catch(console.error);
