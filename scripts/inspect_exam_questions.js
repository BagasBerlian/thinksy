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
    const res = await client.query(`
      SELECT us.ujian_id, us.urutan, us.poin_bobot, s.pertanyaan, s.mapel, s.kunci_jawaban
      FROM ujian_soal us
      JOIN soal s ON us.soal_id = s.id
      ORDER BY us.ujian_id, us.urutan
      LIMIT 20;
    `);
    console.log("Exam questions count:", res.rows.length);
    console.log("Sample questions:", res.rows.slice(0, 3));

    const allSoal = await client.query(`SELECT count(*) FROM soal;`);
    console.log("Total questions in soal table:", allSoal.rows[0].count);

    await client.end();
  } catch (err) {
    console.error(err);
  }
}
run();
