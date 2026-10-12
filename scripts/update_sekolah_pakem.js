const { Client } = require('pg');

const client = new Client({
  host: 'aws-0-ap-southeast-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.mtpnbviztquitgszrfel',
  password: 'programermudaindonesia',
  ssl: { rejectUnauthorized: false }
});

async function updateSekolah() {
  await client.connect();
  const updateQuery = `
    UPDATE public.sekolah
    SET 
      nama = $1,
      npsn = $2,
      alamat = $3,
      motto = $4,
      deskripsi = $5,
      bg_image_url = $6,
      links = $7::jsonb
    WHERE id = $8
    RETURNING *;
  `;

  const values = [
    'SMKS Muhammadiyah Pakem',
    '20401318',
    'Jl. Pakem - Turi No.23, Area Sawah, Pakembinangun, Kec. Pakem, Kab. Sleman, D.I. Yogyakarta 55582',
    'Pusat Keunggulan & Pesantren Vokasi • Bahagia Bersama',
    'SMKS Muhammadiyah Pakem (MUPA) merupakan Sekolah Pusat Keunggulan dan Pesantren Vokasi yang berkomitmen mencetak generasi muda berakhlak mulia, terampil, mandiri, dan menguasai keahlian industri masa depan.',
    '/images/smk-muh-pakem-gedung.jpg',
    JSON.stringify([
      { label: 'Website Resmi', url: 'https://smkmuhpakem.sch.id', icon: 'Globe' },
      { label: 'Portal PPDB', url: 'https://smkmuhpakem.sch.id/ppdb/', icon: 'ExternalLink' },
      { label: 'Instagram', url: 'https://www.instagram.com/smkmuhpakem/?hl=id', icon: 'Instagram' }
    ]),
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  ];

  const res = await client.query(updateQuery, values);
  console.log('Update result:', JSON.stringify(res.rows, null, 2));

  // If there are other sekolah rows, let's also update or verify
  const allSekolah = await client.query('SELECT id, nama, npsn, bg_image_url FROM public.sekolah;');
  console.log('All sekolah now:', JSON.stringify(allSekolah.rows, null, 2));

  await client.end();
}

updateSekolah().catch(err => {
  console.error('Error updating sekolah:', err);
  process.exit(1);
});
