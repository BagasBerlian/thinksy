const fs = require('fs');
const path = require('path');

// Read seed_ruangguru_materi.js
const seedContent = fs.readFileSync(path.join(__dirname, 'seed_ruangguru_materi.js'), 'utf8');

// Extract MATERI_KELAS_8
const startIdx = seedContent.indexOf('const MATERI_KELAS_8 = [');
const endIdx = seedContent.indexOf('async function seedMateri()');
const dataStr = seedContent.substring(startIdx + 'const MATERI_KELAS_8 = '.length, endIdx).trim().replace(/;$/, '');

const data = eval(dataStr);

const enginePath = path.join(__dirname, '..', 'lib', 'curriculum-textbook-engine.ts');
let engineContent = fs.readFileSync(enginePath, 'utf8');

// Bab 1: Bilangan Berpangkat
const bab1 = data.find(d => d.bab_id === '5f649043-e4b7-4d11-a353-991b07a77d5c');
const bab1Replacement = `function getBilanganBerpangkatModules(kelas: number): TextbookModule[] {
  return [
    {
      urutan: 1,
      judul: ${JSON.stringify(bab1.modules[0].judul)},
      durasiMenit: 20,
      konten_markdown: ${JSON.stringify(bab1.modules[0].konten_markdown)}
    },
    {
      urutan: 2,
      judul: ${JSON.stringify(bab1.modules[1].judul)},
      durasiMenit: 25,
      konten_markdown: ${JSON.stringify(bab1.modules[1].konten_markdown)}
    },
    {
      urutan: 3,
      judul: ${JSON.stringify(bab1.modules[2].judul)},
      durasiMenit: 20,
      konten_markdown: ${JSON.stringify(bab1.modules[2].konten_markdown)}
    }
  ];
}`;

// Replace in engineContent
const getBilanganBerpangkatRegex = /function getBilanganBerpangkatModules\(kelas: number\): TextbookModule\[\] \{[\s\S]*?\n\}/;
engineContent = engineContent.replace(getBilanganBerpangkatRegex, bab1Replacement);

// Bab 4: Relasi dan Fungsi
const bab4 = data.find(d => d.bab_id === '1fd7a8c2-079c-4044-be29-207c4c5da83b');
const bab4Replacement = `function getRelasiFungsiModules(kelas: number): TextbookModule[] {
  return [
    {
      urutan: 1,
      judul: ${JSON.stringify(bab4.modules[0].judul)},
      durasiMenit: 20,
      konten_markdown: ${JSON.stringify(bab4.modules[0].konten_markdown)}
    },
    {
      urutan: 2,
      judul: ${JSON.stringify(bab4.modules[1].judul)},
      durasiMenit: 25,
      konten_markdown: ${JSON.stringify(bab4.modules[1].konten_markdown)}
    },
    {
      urutan: 3,
      judul: ${JSON.stringify(bab4.modules[2].judul)},
      durasiMenit: 20,
      konten_markdown: ${JSON.stringify(bab4.modules[2].konten_markdown)}
    }
  ];
}`;
const getRelasiFungsiRegex = /function getRelasiFungsiModules\(kelas: number\): TextbookModule\[\] \{[\s\S]*?\n\}/;
engineContent = engineContent.replace(getRelasiFungsiRegex, bab4Replacement);

// Bab 5: Persamaan Garis Lurus
const bab5 = data.find(d => d.bab_id === '4a215311-c0b3-4cc5-8177-48eb40221f9e');
const bab5Replacement = `function getPersamaanGarisLurusModules(kelas: number): TextbookModule[] {
  return [
    {
      urutan: 1,
      judul: ${JSON.stringify(bab5.modules[0].judul)},
      durasiMenit: 20,
      konten_markdown: ${JSON.stringify(bab5.modules[0].konten_markdown)}
    },
    {
      urutan: 2,
      judul: ${JSON.stringify(bab5.modules[1].judul)},
      durasiMenit: 25,
      konten_markdown: ${JSON.stringify(bab5.modules[1].konten_markdown)}
    },
    {
      urutan: 3,
      judul: ${JSON.stringify(bab5.modules[2].judul)},
      durasiMenit: 20,
      konten_markdown: ${JSON.stringify(bab5.modules[2].konten_markdown)}
    }
  ];
}`;
const getPGLRegex = /function getPersamaanGarisLurusModules\(kelas: number\): TextbookModule\[\] \{[\s\S]*?\n\}/;
engineContent = engineContent.replace(getPGLRegex, bab5Replacement);

// Bab 6: Statistika
const bab6 = data.find(d => d.bab_id === 'fd4ebc86-d354-4f40-a886-48a76cd0ef48');
const bab6Replacement = `function getStatistikaModules(kelas: number): TextbookModule[] {
  return [
    {
      urutan: 1,
      judul: ${JSON.stringify(bab6.modules[0].judul)},
      durasiMenit: 20,
      konten_markdown: ${JSON.stringify(bab6.modules[0].konten_markdown)}
    },
    {
      urutan: 2,
      judul: ${JSON.stringify(bab6.modules[1].judul)},
      durasiMenit: 25,
      konten_markdown: ${JSON.stringify(bab6.modules[1].konten_markdown)}
    },
    {
      urutan: 3,
      judul: ${JSON.stringify(bab6.modules[2].judul)},
      durasiMenit: 20,
      konten_markdown: ${JSON.stringify(bab6.modules[2].konten_markdown)}
    }
  ];
}`;
const getStatistikaRegex = /function getStatistikaModules\(kelas: number\): TextbookModule\[\] \{[\s\S]*?\n\}/;
engineContent = engineContent.replace(getStatistikaRegex, bab6Replacement);

// Bab 3: PLSV
const bab3 = data.find(d => d.bab_id === 'a1fb5fd1-bcf8-451b-8dcc-01f09b30c768');
const bab3Replacement = `function getPLSVModules(kelas: number): TextbookModule[] {
  return [
    {
      urutan: 1,
      judul: ${JSON.stringify(bab3.modules[0].judul)},
      durasiMenit: 20,
      konten_markdown: ${JSON.stringify(bab3.modules[0].konten_markdown)}
    },
    {
      urutan: 2,
      judul: ${JSON.stringify(bab3.modules[1].judul)},
      durasiMenit: 25,
      konten_markdown: ${JSON.stringify(bab3.modules[1].konten_markdown)}
    },
    {
      urutan: 3,
      judul: ${JSON.stringify(bab3.modules[2].judul)},
      durasiMenit: 20,
      konten_markdown: ${JSON.stringify(bab3.modules[2].konten_markdown)}
    }
  ];
}`;
const getPLSVRegex = /function getPLSVModules\(kelas: number\): TextbookModule\[\] \{[\s\S]*?\n\}/;
engineContent = engineContent.replace(getPLSVRegex, bab3Replacement);

fs.writeFileSync(enginePath, engineContent, 'utf8');
console.log('Successfully updated lib/curriculum-textbook-engine.ts with Ruangguru curriculum modules!');
