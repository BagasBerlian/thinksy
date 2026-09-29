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

async function testAll() {
  const { data: babs } = await supabase
    .from('bab')
    .select(`
      id,
      judul,
      urutan,
      materi (
        id,
        judul,
        urutan,
        konten_markdown
      )
    `)
    .eq('mapel', 'Matematika')
    .eq('kelas', 8)
    .order('urutan');

  console.log('=== VERIFIKASI SEMUA BAB MATEMATIKA KELAS 8 ===');
  babs.forEach(b => {
    console.log(`\n📘 Bab ${b.urutan}: ${b.judul} (ID: ${b.id})`);
    b.materi?.sort((a, b) => a.urutan - b.urutan).forEach(m => {
      const hasContoh = m.konten_markdown?.includes('Contoh Soal') || m.konten_markdown?.includes('Contoh');
      const hasKuis = m.konten_markdown?.includes('Kuis Uji Pemahaman Mandiri');
      console.log(`   - Sub ${m.urutan}: ${m.judul} | ${m.konten_markdown?.length} chars | Contoh: ${hasContoh ? '✅' : '❌'} | Akhir Kuis: ${hasKuis ? '✅' : '❌'}`);
    });
  });
}

testAll().catch(console.error);
