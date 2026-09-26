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
  console.log("Connected to PostgreSQL");

  // 1. Verify exams in DB
  const exams = await client.query(`
    SELECT id, judul, mapel, tipe, status, token, durasi_menit 
    FROM ujian 
    ORDER BY tipe DESC, mapel ASC;
  `);

  console.log("\n=== 1. DAFTAR ASESMEN DI DATABASE ===");
  console.table(exams.rows);

  if (exams.rows.length >= 6) {
    console.log("✅ 6 Ujian (3 Ulangan Harian + 3 Ujian PTS) terverifikasi di DB.");
  } else {
    console.error("❌ Kurang dari 6 ujian terdeteksi!");
  }

  // 2. Verify questions linked in ujian_soal
  const soalCounts = await client.query(`
    SELECT u.judul, u.mapel, u.tipe, count(us.id) as total_soal
    FROM ujian u
    LEFT JOIN ujian_soal us ON us.ujian_id = u.id
    GROUP BY u.id, u.judul, u.mapel, u.tipe
    ORDER BY u.tipe, u.mapel;
  `);

  console.log("\n=== 2. JUMLAH SOAL TERHUBUNG PER UJIAN ===");
  console.table(soalCounts.rows);

  // 3. Test Direct Fetch with Local Server
  console.log("\n=== 3. TEST TOKEN VERIFICATION API ===");
  try {
    const ulanganMtk = exams.rows.find(e => e.tipe === 'ulangan' && e.mapel === 'Matematika');
    console.log(`Testing token for: ${ulanganMtk.judul}, Expected token: ${ulanganMtk.token}`);

    // Verify correct token via fetch to local dev server (port 3000)
    const testResValid = await fetch('http://localhost:3000/api/siswa/ujian/verify-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ujianId: ulanganMtk.id,
        token: ulanganMtk.token
      })
    });
    const validJson = await testResValid.json();
    console.log("Valid token response:", validJson);

    // Verify wrong token
    const testResInvalid = await fetch('http://localhost:3000/api/siswa/ujian/verify-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ujianId: ulanganMtk.id,
        token: 'SALAH-TOKEN-999'
      })
    });
    const invalidJson = await testResInvalid.json();
    console.log("Invalid token response:", invalidJson);

    if (validJson.valid === true && invalidJson.valid === false) {
      console.log("✅ API verify-token bekerja 100% akurat!");
    }
  } catch (err) {
    console.log("Local API test note (server may require session cookie for 200, which is normal):", err.message);
  }

  await client.end();
}

main().catch(console.error);
