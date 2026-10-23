const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envLocal = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envLocal.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) envVars[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const s = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function check() {
  const { data, error } = await s
    .from('bab')
    .select('id, judul, mapel, kelas, urutan')
    .order('urutan', { ascending: true });

  if (error) {
    console.error('Error:', error);
    return;
  }
  const filtered = data.filter(b => {
    const isMath = !b.mapel || /matematika|mtk/i.test(b.mapel);
    const isKelas8 = !b.kelas || Number(b.kelas) === 8;
    return isMath && isKelas8;
  });

  console.log(`Found ${filtered.length} Matematika Kelas 8 bab rows:`);
  filtered.forEach(b => console.log(`[${b.urutan}] (${b.mapel || 'NULL'} - Kelas ${b.kelas}) ${b.judul} (ID: ${b.id})`));
}

check();
