const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.trim().split('=');
  if (parts[0] && parts.length > 1) {
    const k = parts[0].trim();
    const v = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
    env[k] = v;
  }
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
  // Test reading from bab and materi with the client
  const { data: bab, error } = await supabase
    .from('bab')
    .select(`
      id,
      judul,
      deskripsi,
      urutan,
      mapel,
      kelas,
      materi (
        id,
        judul,
        konten_markdown,
        urutan
      )
    `)
    .eq('id', '5f649043-e4b7-4d11-a353-991b07a77d5c')
    .single();

  console.log('Bab title:', bab?.judul);
  console.log('Mapel & Kelas:', bab?.mapel, bab?.kelas);
  console.log('Materi count:', bab?.materi?.length);
  bab?.materi?.sort((a, b) => a.urutan - b.urutan).forEach(m => {
    console.log(`\n=== Sub-Bab ${m.urutan}: ${m.judul} ===`);
    console.log(`Length: ${m.konten_markdown?.length} characters`);
    console.log('Snippet (first 250 chars):\n', m.konten_markdown?.substring(0, 250));
    console.log('Has 8 properties:', m.konten_markdown?.includes('Sifat-Sifat Eksponen'));
    console.log('Has Contoh Soal:', m.konten_markdown?.includes('Contoh Soal'));
    console.log('Has Kuis Uji Pemahaman Mandiri:', m.konten_markdown?.includes('Kuis Uji Pemahaman Mandiri'));
  });
}

test().catch(console.error);
