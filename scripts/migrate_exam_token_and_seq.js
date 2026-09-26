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
  try {
    await client.connect();
    console.log("Connected to DB, altering ujian table...");
    
    await client.query(`
      ALTER TABLE ujian 
      ADD COLUMN IF NOT EXISTS token VARCHAR(50) DEFAULT 'THINKSY26',
      ADD COLUMN IF NOT EXISTS is_sequential BOOLEAN DEFAULT false;
    `);

    // Update default exams with realistic tokens
    await client.query(`
      UPDATE ujian 
      SET token = 'MTK-ULANGAN1', is_sequential = true 
      WHERE id = 'e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    `);

    await client.query(`
      UPDATE ujian 
      SET token = 'PTS-BING26', is_sequential = false 
      WHERE id = 'e2eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
    `);

    const res = await client.query(`SELECT id, judul, tipe, token, is_sequential FROM ujian;`);
    console.log("Updated exams:", res.rows);

    await client.end();
  } catch (err) {
    console.error("Migration error:", err);
  }
}
run();
