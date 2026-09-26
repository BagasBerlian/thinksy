const { Client } = require('pg');

const client = new Client({
  host: 'aws-0-ap-southeast-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.mtpnbviztquitgszrfel',
  password: 'programermudaindonesia',
  ssl: { rejectUnauthorized: false }
});

async function testTeacherUpdate() {
  await client.connect();

  // Test updating token directly via DB to ensure state transition works smoothly
  const testExamId = 'e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  const newTestToken = 'SUPER-MTK99';

  await client.query(`UPDATE ujian SET token = $1 WHERE id = $2`, [newTestToken, testExamId]);
  console.log(`Updated exam ${testExamId} token to ${newTestToken}`);

  // Test verify-token with new token
  const res = await fetch('http://localhost:3000/api/siswa/ujian/verify-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ujianId: testExamId,
      token: newTestToken
    })
  });
  const data = await res.json();
  console.log("Verify with new token:", data);

  // Restore token to MTK-ULG26
  await client.query(`UPDATE ujian SET token = $1 WHERE id = $2`, ['MTK-ULG26', testExamId]);
  console.log("Restored token to MTK-ULG26");

  await client.end();
}

testTeacherUpdate().catch(console.error);
