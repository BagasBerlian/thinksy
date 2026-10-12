const fs = require('fs');
const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const { createClient } = require('@supabase/supabase-js');
const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const all = await client.from('profil').select('id, nama_lengkap, nisn, peran');
  console.log('All profiles:', all.data);

  const testLike = await client.from('profil').select('id, nama_lengkap').ilike('nama_lengkap', '%Devida%');
  console.log('Test ilike:', testLike.data);

  const testOr = await client.from('profil').select('id, nama_lengkap').or('nama_lengkap.ilike.*Devida*,nama_lengkap.ilike.%Devida%');
  console.log('Test or:', testOr.data);
}
test();
