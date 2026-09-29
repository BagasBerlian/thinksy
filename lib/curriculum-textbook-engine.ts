/**
 * Curriculum Textbook Engine (Engine Modul Ajar & Buku Teks Digital)
 * Menghasilkan materi bacaan panjang, komprehensif, dan terstruktur standar buku teks/PDF
 * untuk seluruh mata pelajaran dan bab di Kurikulum Merdeka (Kelas 7, 8, 9).
 */

export interface TextbookModule {
  urutan: number;
  judul: string;
  durasiMenit: number;
  konten_markdown: string;
}

export interface ChapterTextbookData {
  judulBab: string;
  mapel: string;
  kelas: number;
  deskripsi: string;
  capaianPembelajaran: string;
  modules: TextbookModule[];
}

// =============================================================================
// SPESIFIKASI MODUL LENGKAP UNTUK BAB-BAB UTAMA (DEEP CURRICULUM TEXTBOOK DATA)
// =============================================================================

export function generateTextbookModules(
  judulBab: string,
  mapel: string = "Matematika",
  kelas: number = 8,
  deskripsiBab?: string
): TextbookModule[] {
  const cleanTitle = (judulBab || "").replace(/^Bab\s*\d+\s*:\s*/i, "").trim();
  const lowerTitle = cleanTitle.toLowerCase();
  const lowerMapel = (mapel || "").toLowerCase();

  // 1. MATEMATIKA
  if (lowerMapel.includes("matematika") || lowerMapel === "mtk" || lowerMapel.includes("math")) {
    if (lowerTitle.includes("bilangan bulat")) {
      return getBilanganBulatModules(kelas);
    }
    if (lowerTitle.includes("aljabar")) {
      return getAljabarModules(kelas);
    }
    if (lowerTitle.includes("persamaan") && lowerTitle.includes("linear") && (lowerTitle.includes("satu variabel") || lowerTitle.includes("plsv") || lowerTitle.includes("pertidaksamaan"))) {
      return getPLSVModules(kelas);
    }
    if (lowerTitle.includes("persamaan linear") && (lowerTitle.includes("dua") || lowerTitle.includes("spldv"))) {
      return getSPLDVModules(kelas);
    }
    if (lowerTitle.includes("perbandingan")) {
      return getPerbandinganModules(kelas);
    }
    if (lowerTitle.includes("bangun datar") || lowerTitle.includes("segitiga") || lowerTitle.includes("lingkaran")) {
      return getBangunDatarModules(kelas);
    }
    if (lowerTitle.includes("bangun ruang") || lowerTitle.includes("brsd") || lowerTitle.includes("limas")) {
      return getBangunRuangModules(kelas);
    }
    if (lowerTitle.includes("berpangkat") || lowerTitle.includes("eksponen") || lowerTitle.includes("akar")) {
      return getBilanganBerpangkatModules(kelas);
    }
    if (lowerTitle.includes("pythagoras") || lowerTitle.includes("pitagoras")) {
      return getPythagorasModules(kelas);
    }
    if (lowerTitle.includes("relasi") || lowerTitle.includes("fungsi")) {
      return getRelasiFungsiModules(kelas);
    }
    if (lowerTitle.includes("garis lurus") || lowerTitle.includes("gradien") || lowerTitle.includes("pgl")) {
      return getPersamaanGarisLurusModules(kelas);
    }
    if (lowerTitle.includes("transformasi") || lowerTitle.includes("translasi") || lowerTitle.includes("refleksi")) {
      return getTransformasiGeometriModules(kelas);
    }
    if (lowerTitle.includes("statistika") || lowerTitle.includes("data") || lowerTitle.includes("mean")) {
      return getStatistikaModules(kelas);
    }
    if (lowerTitle.includes("peluang") || lowerTitle.includes("probabilitas") || lowerTitle.includes("sampel")) {
      return getPeluangModules(kelas);
    }
    if (lowerTitle.includes("pola bilangan") || lowerTitle.includes("barisan")) {
      return getPolaBilanganModules(kelas);
    }
    return getGenericMathModules(cleanTitle, kelas, deskripsiBab);
  }

  // 2. BAHASA INDONESIA
  if (lowerMapel.includes("indonesia") || lowerMapel === "bindo") {
    if (lowerTitle.includes("deskripsi") || lowerTitle.includes("jelajah nusantara")) {
      return getTeksDeskripsiModules(cleanTitle, kelas);
    }
    if (lowerTitle.includes("observasi") || lowerTitle.includes("lho") || lowerTitle.includes("laporan")) {
      return getTeksLHOModules(cleanTitle, kelas);
    }
    if (lowerTitle.includes("iklan") || lowerTitle.includes("poster") || lowerTitle.includes("slogan")) {
      return getTeksIklanPosterModules(cleanTitle, kelas);
    }
    if (lowerTitle.includes("artikel ilmiah") || lowerTitle.includes("ilmiah populer") || lowerTitle.includes("karya ilmiah")) {
      return getArtikelIlmiahModules(cleanTitle, kelas);
    }
    if (lowerTitle.includes("puisi") || lowerTitle.includes("sastra") || lowerTitle.includes("drama")) {
      return getPuisiDramaModules(cleanTitle, kelas);
    }
    if (lowerTitle.includes("pidato") || lowerTitle.includes("persuasif") || lowerTitle.includes("ceramah")) {
      return getPidatoPersuasifModules(cleanTitle, kelas);
    }
    if (lowerTitle.includes("eksplanasi") || lowerTitle.includes("fenomena")) {
      return getTeksEksplanasiModules(cleanTitle, kelas);
    }
    if (lowerTitle.includes("fiksi") || lowerTitle.includes("cerpen") || lowerTitle.includes("imajinasi") || lowerTitle.includes("cerita")) {
      return getTeksFiksiCeritaModules(cleanTitle, kelas);
    }
    return getGenericBahasaIndonesiaModules(cleanTitle, kelas, deskripsiBab);
  }

  // 3. BAHASA INGGRIS
  if (lowerMapel.includes("inggris") || lowerMapel.includes("english") || lowerMapel === "bing") {
    return getEnglishModules(cleanTitle, kelas, deskripsiBab);
  }

  // 4. IPA (ILMU PENGETAHUAN ALAM)
  if (lowerMapel.includes("ipa") || lowerMapel.includes("alam") || lowerMapel.includes("sains")) {
    return getIPAModules(cleanTitle, kelas, deskripsiBab);
  }

  // 5. IPS (ILMU PENGETAHUAN SOSIAL)
  if (lowerMapel.includes("ips") || lowerMapel.includes("sosial") || lowerMapel.includes("sejarah") || lowerMapel.includes("geografi")) {
    return getIPSModules(cleanTitle, kelas, deskripsiBab);
  }

  // 6. INFORMATIKA
  if (lowerMapel.includes("informatika") || lowerMapel.includes("komputer") || lowerMapel.includes("tik")) {
    return getInformatikaModules(cleanTitle, kelas, deskripsiBab);
  }

  // 7. PENDIDIKAN PANCASILA / PPKN
  if (lowerMapel.includes("pancasila") || lowerMapel.includes("ppkn") || lowerMapel.includes("kewarganegaraan")) {
    return getPancasilaModules(cleanTitle, kelas, deskripsiBab);
  }

  // 8. PJOK (PENDIDIKAN JASMANI, OLAHRAGA, DAN KESEHATAN)
  if (lowerMapel.includes("pjok") || lowerMapel.includes("jasmani") || lowerMapel.includes("olahraga")) {
    return getPJOKModules(cleanTitle, kelas, deskripsiBab);
  }

  // 9. SENI MUSIK & SENI RUPA
  if (lowerMapel.includes("seni") || lowerMapel.includes("musik") || lowerMapel.includes("rupa")) {
    return getSeniModules(cleanTitle, kelas, deskripsiBab);
  }

  // 10. PAI / AGAMA
  if (lowerMapel.includes("agama") || lowerMapel.includes("islam") || lowerMapel.includes("pai") || lowerMapel.includes("budi pekerti")) {
    return getAgamaModules(cleanTitle, kelas, deskripsiBab);
  }

  // DEFAULT FALLBACK UNIVERSAL
  return getUniversalTextbookModules(cleanTitle, mapel, kelas, deskripsiBab);
}

// =============================================================================
// 1. DETAIL MATERI MATEMATIKA SPESIFIK
// =============================================================================

function getBilanganBulatModules(kelas: number): TextbookModule[] {
  return [
    {
      urutan: 1,
      judul: "Hakekat Bilangan Bulat, Nilai Tempat, dan Garis Bilangan",
      durasiMenit: 20,
      konten_markdown: `# Modul 1: Hakekat Bilangan Bulat dan Garis Bilangan

> **Capaian Pembelajaran (Fase D)**: Peserta didik mampu memahami konsep bilangan bulat positif dan negatif, membandingkan nilainya, dan merepresentasikannya secara visual pada garis bilangan horizontal maupun vertikal.

---

## 1. Pengantar Kontekstual & Apersepsi
Dalam kehidupan nyata, bilangan tidak hanya digunakan untuk menghitung benda nyata yang bernilai positif (seperti 5 buah apel atau 10 buah buku). Sering kali kita menemui kondisi yang bernilai berlawanan atau berada di bawah titik acuan netral (nol):
- **Suhu Ekstrem**: Suhu di puncak gunung saat malam hari mencapai $4^\\circ\\text{C}$ di bawah nol, ditulis sebagai $-4^\\circ\\text{C}$.
- **Ketinggian dan Kedalaman Geografis**: Permukaan air laut ditetapkan sebagai ketinggian $0\\text{ meter}$. Penyelam yang berada di kedalaman $15\\text{ meter}$ di bawah permukaan laut berada pada posisi $-15\\text{ meter}$.
- **Transaksi Keuangan**: Laba dicatat positif $(+)$, sedangkan rugi atau utang dicatat sebagai bilangan negatif $(-)$.

Himpunan **Bilangan Bulat** dilambangkan dengan huruf $\\mathbb{Z}$ (*Zahlen* dari bahasa Jerman):
$$\\mathbb{Z} = \\{\\ldots, -4, -3, -2, -1, 0, 1, 2, 3, 4, \\ldots\\}$$

---

## 2. Struktur Visual Garis Bilangan
Garis bilangan merupakan representasi geometri dari bilangan real di mana setiap titik berjarak teratur:

\`\`\`text
<---|---|---|---|---|---|---|---|---|--->
   -4  -3  -2  -1   0   1   2   3   4
   <-- Nilai Semakin Kecil     Nilai Semakin Besar -->
\`\`\`

### Kaidah Penting Garis Bilangan:
1. **Arah Kanan**: Semakin ke kanan letak suatu bilangan pada garis bilangan horizontal, maka nilainya **semakin besar** ($a > b$).
2. **Arah Kiri**: Semakin ke kiri letak suatu bilangan, maka nilainya **semakin kecil** ($a < b$).
3. **Konsep Lawan Bilangan (Invers Tambah)**: Lawan dari bilangan positif $a$ adalah bilangan negatif $-a$, dan sebaliknya. Jarak bilangan $a$ dan $-a$ ke titik $0$ adalah sama besar.
   $$a + (-a) = 0$$

---

## 3. Tabel Karakteristik Nilai Bilangan

| Kategori Bilangan | Simbol / Notasi | Rentang Nilai | Contoh Nilai |
|---|---|---|---|
| **Bilangan Bulat Positif (Bilangan Asli)** | $\\mathbb{Z}^+$ atau $\\mathbb{N}$ | Bilangan riil $> 0$ | $1, 2, 3, 4, 100, \\dots$ |
| **Bilangan Nol (Netral)** | $\\{0\\}$ | Titik pusat acuan | $0$ |
| **Bilangan Bulat Negatif** | $\\mathbb{Z}^-$ | Bilangan riil $< 0$ | $-1, -2, -3, -50, \\dots$ |
| **Bilangan Cacah** | $\\mathbb{W}$ | Gabungan nol & bulat positif | $0, 1, 2, 3, 4, \\dots$ |

---

## 4. Contoh Soal & Pembahasan Bertahap

### Contoh Soal 1 (Level Pemahaman):
Urutkanlah bilangan-bilangan berikut dari yang terkecil ke yang terbesar:
$$7, -12, 0, -4, 15, -1, 3$$

**Langkah Penyelesaian:**
1. Pisahkan bilangan negatif, nol, dan positif:
   - Bilangan negatif: $-12, -4, -1$
   - Bilangan nol: $0$
   - Bilangan positif: $3, 7, 15$
2. Urutkan bilangan negatif (ingat: semakin besar angkanya pada tanda minus, nilainya semakin kecil):
   $$-12 < -4 < -1$$
3. Gabungkan seluruh urutan secara berkesinambungan:
   $$-12, -4, -1, 0, 3, 7, 15$$

---

## 5. Pojok Peringatan Miskonsepsi
> ⚠️ **Hati-hati!** Banyak siswa menganggap bahwa $-25$ lebih besar dari $-5$ karena angka $25 > 5$. Padahal, pada bilangan negatif, semakin besar nilai mutlaknya, letak pada garis bilangan justru semakin ke kiri, sehingga nilainya **lebih kecil**:
> $$-25 < -5$$
`
    },
    {
      urutan: 2,
      judul: "Operasi Hitung Penjumlahan, Pengurangan, Perkalian & Pembagian",
      durasiMenit: 25,
      konten_markdown: `# Modul 2: Operasi Aritmetika Lengkap pada Bilangan Bulat

> **Tujuan Pembelajaran**: Menguasai kaidah tanda dan sifat-sifat operasi aritmetika (komutatif, asosiatif, distributif) serta mampu memecahkan perhitungan bertingkat dengan aturan urutan operasi (KABATAKU / PEMDAS).

---

## 1. Kaidah Operasi Penjumlahan & Pengurangan

### A. Penjumlahan
- Jika kedua bilangan bertanda sama, jumlahkan kedua bilangan lalu berikan tanda yang sama:
  $$(+a) + (+b) = +(a + b) \\quad \\text{dan} \\quad (-a) + (-b) = -(a + b)$$
  *Contoh*: $(-7) + (-8) = -15$
- Jika kedua bilangan berlawanan tanda, kurangkan bilangan yang lebih besar nilai mutlaknya dengan yang lebih kecil, lalu ikuti tanda bilangan yang lebih besar:
  $$(+15) + (-8) = +7 \\qquad (-20) + (+6) = -14$$

### B. Pengurangan
Pengurangan dengan bilangan bulat setara dengan **penjumlahan dengan lawannya**:
$$a - b = a + (-b) \\qquad a - (-b) = a + b$$

*Contoh Kasus*:
$$12 - (-7) = 12 + 7 = 19$$
$$-15 - 8 = -15 + (-8) = -23$$

---

## 2. Kaidah Perkalian & Pembagian

Tanda hasil perkalian dan pembagian dua bilangan bulat ditentukan oleh tabel tanda berikut:

| Tanda Bilangan Pertama | Operasi | Tanda Bilangan Kedua | Tanda Hasil Akhir | Contoh |
|:---:|:---:|:---:|:---:|:---|
| Positif $(+)$ | $\\times$ atau $\\div$ | Positif $(+)$ | **Positif $(+)$** | $8 \\times 4 = 32$ |
| Negatif $(-)$ | $\\times$ atau $\\div$ | Negatif $(-)$ | **Positif $(+)$** | $(-6) \\times (-5) = +30$ |
| Positif $(+)$ | $\\times$ atau $\\div$ | Negatif $(-)$ | **Negatif $(-)$** | $9 \\times (-4) = -36$ |
| Negatif $(-)$ | $\\times$ atau $\\div$ | Positif $(+)$ | **Negatif $(-)$** | $(-28) \\div 7 = -4$ |

---

## 3. Aturan Urutan Operasi (Order of Operations - PEMDAS / KABATAKU)
Dalam suatu ekspresi gabungan yang memuat berbagai operasi, pengerjaan wajib mengikuti urutan prioritas:
1. **Kurung (Parentheses)**: Selesaikan perhitungan di dalam kurung terdalam terlebih dahulu.
2. **Pangkat & Akar (Exponents)**: Hitung bentuk pangkat atau akar.
3. **Perkalian & Pembagian (Multiply & Divide)**: Hitung secara berurutan dari kiri ke kanan.
4. **Penjumlahan & Pengurangan (Add & Subtract)**: Hitung secara berurutan dari kiri ke kanan.

---

## 4. Contoh Soal Pembahasan Mendalam

### Contoh Soal 2 (Tipe Soal Analisis Bertingkat):
Hitunglah nilai dari ekspresi berikut:
$$-18 + (-6) \\times 4 - (-36) \\div (-9)$$

**Langkah Pengerjaan Sistematis:**
1. **Langkah 1 (Perkalian & Pembagian)**:
   $$(-6) \\times 4 = -24$$
   $$(-36) \\div (-9) = +4$$
2. **Langkah 2 (Substitusi kembali ke persamaan)**:
   $$-18 + (-24) - (4)$$
3. **Langkah 3 (Penjumlahan dan Pengurangan dari kiri ke kanan)**:
   $$[-18 + (-24)] - 4 = -42 - 4 = -46$$

**Jawaban Akhir**: Hasil perhitungan adalah **$-46$**.
`
    },
    {
      urutan: 3,
      judul: "Faktorisasi Prima, FPB, KPK, dan Masalah Kontekstual Nyata",
      durasiMenit: 25,
      konten_markdown: `# Modul 3: FPB, KPK, dan Pemecahan Masalah Kehidupan Nyata

> **Tujuan Pembelajaran**: Memahami faktorisasi prima pohon faktor, menentukan Faktor Persekutuan Terbesar (FPB) dan Kelipatan Persekutuan Terkecil (KPK), serta menerapkannya dalam penyelesaian masalah nyata (pembagian paket bantuan, jadwal berkala).

---

## 1. Konsep Faktorisasi Prima
Setiap bilangan bulat positif yang lebih besar dari $1$ dapat dinyatakan secara tunggal sebagai perkalian bilangan-bilangan prima (Teorema Fundamental Aritmetika).

Misalkan kita akan memfaktorkan $72$ dan $120$:
$$72 = 2 \\times 2 \\times 2 \\times 3 \\times 3 = 2^3 \\times 3^2$$
$$120 = 2 \\times 2 \\times 2 \\times 3 \\times 5 = 2^3 \\times 3^1 \\times 5^1$$

---

## 2. Metode Menentukan FPB dan KPK

### A. Faktor Persekutuan Terbesar (FPB / GCD)
- **Kaidah**: Ambil faktor prima yang **sama/bersekutu** di kedua bilangan dengan pangkat **terkecil**.
  $$\\text{FPB}(72, 120) = 2^3 \\times 3^1 = 8 \\times 3 = 24$$

### B. Kelipatan Persekutuan Terkecil (KPK / LCM)
- **Kaidah**: Ambil **seluruh** faktor prima yang muncul, jika ada yang sama pilih yang berpangkat **terbesar**.
  $$\\text{KPK}(72, 120) = 2^3 \\times 3^2 \\times 5^1 = 8 \\times 9 \\times 5 = 360$$

---

## 3. Studi Kasus Kontekstual Dunia Nyata

### Kasus 1: Masalah Pembagian Parsial (Aplikasi FPB)
*Panitia bakti sosial sekolah memiliki $84\\text{ kg}$ beras, $56\\text{ bungkus}$ minyak goreng, dan $140\\text{ butir}$ telur. Seluruh barang tersebut akan dibagikan ke dalam paket sembako dengan jumlah yang sama rata untuk setiap jenis barang tanpa ada yang tersisa.*
1. Berapa paket sembako terbanyak yang dapat dibuat?
2. Berapa isi masing-masing barang pada setiap paket?

**Solusi:**
1. Menentukan jumlah paket maksimal = $\\text{FPB}(84, 56, 140)$:
   - $84 = 2^2 \\times 3 \\times 7$
   - $56 = 2^3 \\times 7$
   - $140 = 2^2 \\times 5 \\times 7$
   - $\\text{FPB} = 2^2 \\times 7 = 4 \\times 7 = 28$ paket.
2. Isi tiap paket:
   - Beras: $84 \\div 28 = 3\\text{ kg}$
   - Minyak: $56 \\div 28 = 2\\text{ bungkus}$
   - Telur: $140 \\div 28 = 5\\text{ butir}$

---

## 4. Rangkuman Inti Bab (Key Summary)
- Bilangan bulat mencakup $\\mathbb{Z}^+$, $0$, dan $\\mathbb{Z}^-$.
- Operasi dua tanda minus berturut-turut menjadi positif: $a - (-b) = a + b$.
- FPB digunakan untuk persoalan **pembagian sama rata / pembungkusan paket**.
- KPK digunakan untuk persoalan **kejadian berulang berkala / pertemuan jadwal bersama**.
`
    }
  ];
}

function getPythagorasModules(kelas: number): TextbookModule[] {
  return [
    {
      urutan: 1,
      judul: "Sejarah, Pembuktian Geometris, dan Teorema Pythagoras",
      durasiMenit: 20,
      konten_markdown: `# Modul 1: Sejarah dan Konsep Dasar Teorema Pythagoras

> **Capaian Pembelajaran (Fase D)**: Peserta didik mampu membuktikan Teorema Pythagoras secara visual/geometris, mengidentifikasi sisi miring (hipotenusa) dan sisi siku-siku, serta menyusun hubungan kuadrat sisi pada segitiga siku-siku.

---

## 1. Sejarah & Pembuktian Visual Geometri
Teorema Pythagoras dinamai dari matematikawan Yunani kuno, **Pythagoras dari Samos** (sekitar 570–495 SM). Teorema ini menyatakan hubungan fundamental antara ketiga sisi pada **segitiga siku-siku**.

> **Dalil Pythagoras**:
> "Pada suatu segitiga siku-siku, luas persegi yang dibangun pada sisi miring (hipotenusa) sama dengan jumlah luas persegi yang dibangun pada kedua sisi siku-sikunya."

\`\`\`text
         |\\
         | \\
       a |  \\ c (Hipotenusa)
         |   \\
         |____\\
           b
\`\`\`

Jika $a$ dan $b$ adalah panjang sisi-sisi siku-siku, dan $c$ adalah panjang sisi terpanjang (hipotenusa yang berada tepat di hadapan sudut siku-siku $90^\\circ$), maka:
$$c^2 = a^2 + b^2$$

Rumus Turunan:
$$c = \\sqrt{a^2 + b^2}$$
$$a = \\sqrt{c^2 - b^2}$$
$$b = \\sqrt{c^2 - a^2}$$

---

## 2. Menemukan dan Mengidentifikasi Tripel Pythagoras
**Tripel Pythagoras** adalah tiga bilangan bulat positif $(a, b, c)$ yang memenuhi persamaan $a^2 + b^2 = c^2$.

### Pasangan Tripel Pythagoras Baku & Kelipatannya:
1. **Pola $(3, 4, 5)$**:
   - Kelipatan $2$: $(6, 8, 10)$
   - Kelipatan $3$: $(9, 12, 15)$
   - Kelipatan $4$: $(12, 16, 20)$
   - Kelipatan $5$: $(15, 20, 25)$
2. **Pola $(5, 12, 13)$**:
   - Kelipatan $2$: $(10, 24, 26)$
   - Kelipatan $3$: $(15, 36, 39)$
3. **Pola $(7, 24, 25)$**:
   - Kelipatan $2$: $(14, 48, 50)$
4. **Pola $(8, 15, 17)$**:
   - Kelipatan $2$: $(16, 30, 34)$
5. **Pola $(9, 40, 41)$**

---

## 3. Kebalikan Teorema Pythagoras (Uji Jenis Segitiga)
Kita dapat menentukan jenis suatu segitiga dengan membandingkan kuadrat sisi terpanjang ($c$) terhadap jumlah kuadrat kedua sisi lainnya ($a^2 + b^2$):
- **Segitiga Siku-Siku**: Jika $c^2 = a^2 + b^2$
- **Segitiga Lancip**: Jika $c^2 < a^2 + b^2$
- **Segitiga Tumpul**: Jika $c^2 > a^2 + b^2$

### Contoh Soal Uji Jenis Segitiga:
Segitiga $ABC$ memiliki panjang sisi $6\\text{ cm}, 8\\text{ cm},$ dan $11\\text{ cm}$. Tentukan jenis segitiga tersebut!
- Sisi terpanjang $c = 11$, maka $c^2 = 11^2 = 121$.
- Jumlah kuadrat dua sisi lainnya: $a^2 + b^2 = 6^2 + 8^2 = 36 + 64 = 100$.
- Karena $121 > 100$ ($c^2 > a^2 + b^2$), maka segitiga $ABC$ adalah **segitiga tumpul**.
`
    },
    {
      urutan: 2,
      judul: "Segitiga Khusus (Sudut Istimewa) & Diagonal Ruang Geometri",
      durasiMenit: 25,
      konten_markdown: `# Modul 2: Segitiga Siku-Siku Khusus dan Geometri Dimensi Tiga

> **Tujuan Pembelajaran**: Memahami perbandingan panjang sisi-sisi pada segitiga bersudut istimewa ($30^\\circ-60^\\circ-90^\\circ$ dan $45^\\circ-45^\\circ-90^\\circ$) serta menghitung diagonal bidang dan diagonal ruang pada bangun ruang.

---

## 1. Perbandingan Sisi pada Segitiga Siku-Siku Istimewa

### A. Segitiga Siku-Siku Sama Kaki ($45^\\circ - 45^\\circ - 90^\\circ$)
Berasal dari sebuah persegi yang dipotong sepanjang garis diagonalnya:

$$\\text{Perbandingan Sisi: } a : a : a\\sqrt{2} = 1 : 1 : \\sqrt{2}$$

- Panjang Hipotenusa = $\\text{sisi siku-siku} \\times \\sqrt{2}$

### B. Segitiga Bersudut $30^\\circ - 60^\\circ - 90^\\circ$
Berasal dari segitiga sama sisi yang dibagi dua sama besar oleh garis tinggi:

$$\\text{Perbandingan Sisi: } \\text{sisi depan } 30^\\circ : \\text{sisi depan } 60^\\circ : \\text{hipotenusa } (90^\\circ) = 1 : \\sqrt{3} : 2$$

- Sisi di depan sudut $30^\\circ = \\frac{1}{2} \\times \\text{hipotenusa}$
- Sisi di depan sudut $60^\\circ = \\text{sisi pendek} \\times \\sqrt{3}$

---

## 2. Penerapan Pythagoras pada Kubus dan Balok

### A. Diagonal Bidang (Sisi)
Pada kubus dengan rusuk $s$:
$$d_b = \\sqrt{s^2 + s^2} = s\\sqrt{2}$$

### B. Diagonal Ruang
Garis yang menghubungkan dua titik sudut yang berhadapan melintasi bagian dalam ruang:
- **Pada Kubus (rusuk $s$)**:
  $$d_r = \\sqrt{s^2 + s^2 + s^2} = s\\sqrt{3}$$
- **Pada Balok (panjang $p$, lebar $l$, tinggi $t$)**:
  $$d_r = \\sqrt{p^2 + l^2 + t^2}$$

---

## 3. Contoh Soal & Pembahasan Terperinci

**Soal**: Sebuah balok memiliki ukuran panjang $12\\text{ cm}$, lebar $4\\text{ cm}$, dan tinggi $3\\text{ cm}$. Hitunglah panjang diagonal ruang balok tersebut!

**Penyelesaian**:
$$d_r = \\sqrt{p^2 + l^2 + t^2}$$
$$d_r = \\sqrt{12^2 + 4^2 + 3^2} = \\sqrt{144 + 16 + 9} = \\sqrt{169} = 13\\text{ cm}$$

Jadi, panjang diagonal ruang balok tersebut adalah **$13\\text{ cm}$**.
`
    },
    {
      urutan: 3,
      judul: "Aplikasi Kontekstual Dunia Nyata & Soal HOTS Pythagoras",
      durasiMenit: 25,
      konten_markdown: `# Modul 3: Penerapan Pythagoras dalam Pemecahan Masalah Kehidupan Nyata

> **Tujuan Pembelajaran**: Menerapkan Teorema Pythagoras dalam navigasi pelayaran kapal, perhitungan jarak pada sistem koordinat geodesi/GPS, dan rancang bangun teknik sipil.

---

## 1. Studi Kasus 1: Navigasi Kapal di Laut Lepas
*Sebuah kapal berlayar dari pelabuhan $A$ ke arah timur sejauh $80\\text{ mil}$ menuju titik $B$. Dari titik $B$, kapal tersebut berbelok ke arah utara sejauh $60\\text{ mil}$ menuju pelabuhan $C$.*
Berapakah jarak terpendek (garis lurus) dari pelabuhan $A$ langsung ke pelabuhan $C$?

**Analisis Masalah:**
- Pergerakan ke arah timur dan kemudian ke arah utara membentuk sudut siku-siku $90^\\circ$.
- $AB = 80\\text{ mil}$ (sisi siku-siku alas)
- $BC = 60\\text{ mil}$ (sisi siku-siku tegak)
- Jarak lurus $AC$ adalah sisi miring (hipotenusa).

**Perhitungan:**
$$AC = \\sqrt{AB^2 + BC^2}$$
$$AC = \\sqrt{80^2 + 60^2} = \\sqrt{6.400 + 3.600} = \\sqrt{10.000} = 100\\text{ mil}$$

*(Perhatikan bahwa angka ini merupakan kelipatan 20 dari tripel dasar $3, 4, 5$, yaitu $3(20)=60$, $4(20)=80$, $5(20)=100$).*

---

## 2. Studi Kasus 2: Posisi Tangga dan Dinding Rumah
*Sebuah tangga dengan panjang $5\\text{ meter}$ disandarkan pada dinding tembok vertikal. Jarak ujung bawah tangga ke dasar dinding adalah $1,4\\text{ meter}$. Jika ujung atas tangga melorot (turun) sejauh $0,8\\text{ meter}$, berapakah pergeseran ujung bawah tangga menjauhi dinding?*

**Langkah 1: Hitung tinggi dinding mula-mula ($t_1$)**:
$$t_1 = \\sqrt{5^2 - (1,4)^2} = \\sqrt{25 - 1,96} = \\sqrt{23,04} = 4,8\\text{ meter}$$

**Langkah 2: Hitung tinggi dinding setelah melorot ($t_2$)**:
$$t_2 = 4,8 - 0,8 = 4,0\\text{ meter}$$

**Langkah 3: Hitung jarak ujung bawah tangga baru ke dinding ($x_2$)**:
Panjang tangga tetap $5\\text{ meter}$:
$$x_2 = \\sqrt{5^2 - (4,0)^2} = \\sqrt{25 - 16} = \\sqrt{9} = 3,0\\text{ meter}$$

**Langkah 4: Hitung pergeseran ujung bawah**:
$$\\Delta x = x_2 - x_1 = 3,0 - 1,4 = 1,6\\text{ meter}$$

**Kesimpulan**: Ujung bawah tangga bergeser menjauhi dinding sejauh **$1,6\\text{ meter}$**.

---

## 3. Rangkuman Inti Bab
- Teorema Pythagoras berlaku khusus pada segitiga siku-siku: $c^2 = a^2 + b^2$.
- Sisi terpanjang (hipotenusa) selalu terletak tepat di depan sudut siku-siku $90^\\circ$.
- Tripel Pythagoras mempermudah kalkulasi cepat tanpa perlu akar kuadrat rumit.
`
    }
  ];
}

function getAljabarModules(kelas: number): TextbookModule[] {
  return [
    {
      urutan: 1,
      judul: "Struktur Bentuk Aljabar, Suku Sejenis, dan Operasi Dasar",
      durasiMenit: 20,
      konten_markdown: `# Modul 1: Mengenal Unsur Bentuk Aljabar & Operasi Penjumlahan

> **Capaian Pembelajaran (Fase D)**: Peserta didik mampu mengidentifikasi variabel, koefisien, konstanta, derajat suku, mengelompokkan suku sejenis, dan melakukan operasi penjumlahan serta pengurangan bentuk aljabar.

---

## 1. Anatomi dan Struktur Bentuk Aljabar
Bentuk aljabar adalah representasi matematika yang memuat huruf (variabel) untuk menyatakan kuantitas yang belum diketahui nilainya.

Perhatikan ekspresi berikut:
$$5x^2 - 3x + 12$$

### Komponen Utama:
1. **Variabel (Peubah)**: Lambang pengganti suatu bilangan (misal: $x, y, a, b$).
2. **Koefisien**: Bilangan pengali di depan variabel. Pada $5x^2$, koefisien $x^2$ adalah $5$; pada $-3x$, koefisien $x$ adalah $-3$.
3. **Konstanta**: Suku yang berupa bilangan tetap tanpa variabel ($+12$).
4. **Suku**: Bagian dari bentuk aljabar yang dipisahkan oleh operasi penjumlahan atau pengurangan.
   - Suku tunggal (Monomial): $4x$
   - Suku dua (Binomial): $2x + 5$
   - Suku tiga (Trinomial): $ax^2 + bx + c$
   - Suku banyak (Polinomial)

---

## 2. Konsep Suku Sejenis
> **Prinsip Utama**: Operasi penjumlahan dan pengurangan **HANYA** dapat dilakukan pada **suku-suku sejenis**, yaitu suku yang memiliki variabel dan pangkat variabel yang persis sama.

- $3x$ dan $7x$ $\\rightarrow$ **Suku Sejenis** (bisa dijumlahkan: $3x + 7x = 10x$)
- $4x^2$ dan $5x^2$ $\\rightarrow$ **Suku Sejenis** ($4x^2 + 5x^2 = 9x^2$)
- $5x$ dan $5y$ $\\rightarrow$ **Bukan Suku Sejenis** (variabel berbeda, tidak bisa disatukan)
- $2x^2$ dan $2x$ $\\rightarrow$ **Bukan Suku Sejenis** (pangkat variabel berbeda)

---

## 3. Contoh Soal Operasi Aljabar

**Soal**: Sederhanakan bentuk aljabar berikut:
$$(7a^2 - 3ab + 5b^2) - (2a^2 + 4ab - 3b^2)$$

**Langkah Pengerjaan**:
1. Buka tanda kurung dengan memperhatikan tanda minus pada suku pengurang:
   $$= 7a^2 - 3ab + 5b^2 - 2a^2 - 4ab + 3b^2$$
2. Kelompokkan suku-suku sejenis:
   $$= (7a^2 - 2a^2) + (-3ab - 4ab) + (5b^2 + 3b^2)$$
3. Hitung hasil penyederhanaan:
   $$= 5a^2 - 7ab + 8b^2$$
`
    },
    {
      urutan: 2,
      judul: "Perkalian Aljabar, Sifat Distributif, dan Pemfaktoran",
      durasiMenit: 25,
      konten_markdown: `# Modul 2: Perkalian Istimewa dan Pemfaktoran Bentuk Aljabar

> **Tujuan Pembelajaran**: Menguasai perkalian suku dua dengan sifat distributif, memahami bentuk kuadrat sempurna, selisih dua kuadrat, serta memfaktorkan bentuk kuadrat $ax^2 + bx + c$.

---

## 1. Rumus-Rumus Perkalian Istimewa

1. **Sifat Distributif Sederhana**:
   $$a(b + c) = ab + ac$$
2. **Kuadrat Penjumlahan Suku Dua**:
   $$(a + b)^2 = a^2 + 2ab + b^2$$
3. **Kuadrat Pengurangan Suku Dua**:
   $$(a - b)^2 = a^2 - 2ab + b^2$$
4. **Selisih Dua Kuadrat (Faktor Sekawan)**:
   $$(a + b)(a - b) = a^2 - b^2$$

---

## 2. Teknik Pemfaktoran Bentuk Kuadrat

### Kasus A: $x^2 + bx + c = (x + p)(x + q)$
Cari dua bilangan $p$ dan $q$ yang memenuhi:
- $p + q = b$ (hasil penjumlahan sama dengan koefisien $x$)
- $p \\times q = c$ (hasil perkalian sama dengan konstanta)

*Contoh*: Faktorkan $x^2 + 7x + 12$
- Cari faktor $12$ yang berjumlah $7$: yaitu $3$ dan $4$ ($3 + 4 = 7$ dan $3 \\times 4 = 12$).
- Hasil faktorisasi:
  $$x^2 + 7x + 12 = (x + 3)(x + 4)$$

### Kasus B: Selisih Dua Kuadrat
$$a^2 - b^2 = (a + b)(a - b)$$
*Contoh*: Faktorkan $4x^2 - 49$
- $4x^2 = (2x)^2$ dan $49 = 7^2$
- Hasil faktorisasi:
  $$4x^2 - 49 = (2x + 7)(2x - 7)$$
`
    },
    {
      urutan: 3,
      judul: "Pecahan Bentuk Aljabar dan Aplikasi Pemodelan Masalah",
      durasiMenit: 25,
      konten_markdown: `# Modul 3: Pecahan Aljabar dan Pemodelan Matematika

> **Tujuan Pembelajaran**: Menyelesaikan operasi penjumlahan, perkalian, dan penyederhanaan pecahan aljabar serta memodelkan persoalan sehari-hari ke dalam model matematika aljabar.

---

## 1. Penyederhanaan Pecahan Aljabar
Untuk menyederhanakan pecahan aljabar, faktorkan pembilang dan penyebut terlebih dahulu, lalu coret faktor persekutuan yang bernilai sama:

$$\\frac{x^2 - 9}{x^2 + 5x + 6} = \\frac{(x+3)(x-3)}{(x+2)(x+3)} = \\frac{x-3}{x+2} \\quad (x \\neq -2, -3)$$

---

## 2. Pemodelan Soal Cerita Kontekstual

**Studi Kasus**:
*Umur Pak Budi saat ini adalah $3$ kali umur anaknya, Reno. Jika $5$ tahun yang akan datang jumlah umur mereka berdua adalah $58\\text{ tahun}$, berapakah umur Reno sekarang?*

**Langkah Pemodelan Matematika:**
1. Misalkan umur Reno sekarang $= x\\text{ tahun}$.
2. Maka umur Pak Budi sekarang $= 3x\\text{ tahun}$.
3. Lima tahun yang akan datang:
   - Umur Reno $= x + 5$
   - Umur Pak Budi $= 3x + 5$
4. Buat persamaan aljabar dari jumlah umur:
   $$(x + 5) + (3x + 5) = 58$$
   $$4x + 10 = 58$$
   $$4x = 48$$
   $$x = 12$$

**Kesimpulan**: Umur Reno saat ini adalah **$12\\text{ tahun}$** dan umur Pak Budi adalah $3(12) = 36\\text{ tahun}$.
`
    }
  ];
}

// =============================================================================
// 2. DETAIL MATERI BAHASA INDONESIA SPESIFIK
// =============================================================================

function getTeksDeskripsiModules(cleanTitle: string, kelas: number): TextbookModule[] {
  return [
    {
      urutan: 1,
      judul: "Hakikat Teks Deskripsi, Ciri Objek, dan Struktur Penulisan",
      durasiMenit: 20,
      konten_markdown: `# Modul 1: Hakikat, Ciri-Ciri, dan Struktur Teks Deskripsi

> **Capaian Pembelajaran (Fase D)**: Peserta didik mampu menganalisis informasi, ciri umum, tujuan, dan struktur pembangun teks deskripsi yang menggambarkan objek (wisata, tempat bersejarah, tokoh, atau pentas seni) secara rinci dan terstruktur.

---

## 1. Pengertian Teks Deskripsi
**Teks Deskripsi** adalah teks yang memaparkan atau menggambarkan suatu objek, tempat, suasana, atau orang secara terperinci dan konkret. Tujuannya adalah agar pembaca seolah-olah dapat **melihat, mendengar, merasakan, atau mengalami sendiri** hal yang dideskripsikan oleh penulis.

### Ciri-Ciri Utama Teks Deskripsi:
1. **Menggambarkan Objek Tertentu**: Objek yang dibahas bersifat khusus dan personal (misalnya bukan pantai secara umum, melainkan *Pantai Parangtritis saat Matahari Terbenam*).
2. **Melibatkan Panca Indra**: Menggunakan kata-kata yang merangsang indra penglihatan, pendengaran, penciuman, pengecapan, dan perabaan.
3. **Memaparkan Ciri Fisik & Sifat**: Menjelaskan bentuk, ukuran, warna, serta karakteristik secara rinci dan spesifik.

---

## 2. Struktur Teks Deskripsi

\`\`\`text
+-------------------------------------------------------------+
| 1. JUDUL: Menarik dan mewakili objek yang dideskripsikan    |
+-------------------------------------------------------------+
| 2. IDENTIFIKASI / DESKRIPSI UMUM:                           |
|    - Nama objek, lokasi, sejarah, atau gambaran umum        |
+-------------------------------------------------------------+
| 3. DESKRIPSI BAGIAN:                                        |
|    - Perincian detail bagian-bagian objek                   |
|    - Efek visual, suasana, aroma, suara yang ditangkap      |
+-------------------------------------------------------------+
| 4. SIMPULAN / KESAN:                                        |
|    - Pendapat akhir atau kesan personal penulis             |
+-------------------------------------------------------------+
\`\`\`

---

## 3. Contoh Teks Deskripsi Lengkap

### *Pesona Megah Candi Borobudur di Pagi Hari*

**[Identifikasi]**
Candi Borobudur adalah mahakarya arsitektur Buddha terbesar di dunia yang terletak di Magelang, Jawa Tengah. Monumen megah ini didirikan sekitar abad ke-8 pada masa Wangsa Syailendra dan kini diakui sebagai salah satu Warisan Budaya Dunia oleh UNESCO.

**[Deskripsi Bagian]**
Saat fajar menyingsing, kabut tipis perlahan terangkat menyelimuti relief batu andesit yang hitam keabuan. Bangunan ini terdiri atas sembilan teras berundak dengan dinding-dinding yang dihiasi ribuan panel relief pahatan naratif yang sangat halus. Di pelataran stupa tertinggi, hembusan angin pagi terasa sejuk menyentuh kulit, diiringi aroma tanah basah dan pemandangan siluet Gunung Merapi yang berdiri kokoh di kejauhan.

**[Simpulan]**
Keanggunan Borobudur bukan hanya bukti kejeniusan nenek moyang bangsa Indonesia dalam seni rancang bangun, melainkan juga simbol kedamaian yang menyentuh jiwa setiap pengunjung.
`
    },
    {
      urutan: 2,
      judul: "Kaidah Kebahasaan Teks Deskripsi: Majas, Kata Konkret & Panca Indra",
      durasiMenit: 25,
      konten_markdown: `# Modul 2: Kaidah Kebahasaan Teks Deskripsi

> **Tujuan Pembelajaran**: Mengidentifikasi unsur kebahasaan teks deskripsi meliputi penggunaan kata sifat, kata berimbuhan, kata rujukan, kata khusus, dan majas (personifikasi, metafora, simile).

---

## 1. Unsur Kebahasaan Utama

### A. Penggunaan Kata Konkret & Kata Khusus
Kata konkret adalah kata yang rujukannya mudah diserap panca indra.
- **Kata Umum**: Membawa $\\rightarrow$ **Kata Khusus**: Menggendong, memikul, menjinjing, memapah.
- **Kata Umum**: Indah $\\rightarrow$ **Kata Khusus**: Menawan, memukau, elok, memesona.

### B. Penggunaan Kalimat Bermajas (Gaya Bahasa)
1. **Majas Personifikasi**: Memberikan sifat-sifat manusia kepada benda mati.
   *Contoh*: "Ombak pantai berkejaran mencium bibir pantai dengan lembut."
2. **Majas Simile (Perumpamaan)**: Membandingkan dua hal menggunakan kata pembanding (*seperti, laksana, bak, bagai*).
   *Contoh*: "Kulitnya putih bersih laksana pualam."
3. **Majas Metafora**: Perbandingan langsung tanpa kata pembanding.
   *Contoh*: "Raja siang perlahan turun ke peraduannya."

---

## 2. Tabel Analisis Kalimat Panca Indra

| Kalimat Deskriptif | Citraan Indra yang Terlibat | Efek yang Dirasakan Pembaca |
|---|:---:|---|
| *"Dinding batu itu terasa kasar dan dingin saat disentuh jemari."* | **Perabaan (Taktil)** | Merasakan tekstur fisik permukaan batu |
| *"Suara deburan ombak berdentum memecah keheningan senja."* | **Pendengaran (Auditif)** | Mendengar suara keras air laut |
| *"Pendar cahaya keemasan terpantul indah di atas riak air telaga."* | **Penglihatan (Visual)** | Membayangkan warna dan kilau cahaya |
| *"Aroma wangi bunga melati semerbak terbawa angin malam."* | **Penciuman (Olfaktori)** | Mencium keharuman bunga |
`
    },
    {
      urutan: 3,
      judul: "Menyunting, Menyusun, dan Menilai Teks Deskripsi",
      durasiMenit: 20,
      konten_markdown: `# Modul 3: Langkah Menyusun dan Menyunting Teks Deskripsi

> **Tujuan Pembelajaran**: Mampu merancang kerangka penulisan, mengembangkan teks deskripsi dari pengamatan langsung, serta menyunting ejaan dan tanda baca sesuai EYD V.

---

## 1. Langkah-Langkah Penulisan
1. **Menentukan Topik/Objek**: Pilih objek yang menarik dan memiliki kekhasan.
2. **Menentukan Tujuan Deskripsi**: Menetapkan fokus kesan apa yang ingin disampaikan ke pembaca.
3. **Mengumpulkan Data**: Melakukan observasi langsung, mencatat rincian panca indra.
4. **Menyusun Kerangka**: Mengurutkan dari Identifikasi $\\rightarrow$ Deskripsi Bagian $\\rightarrow$ Simpulan.
5. **Mengembangkan Paragraf**: Menggunakan kata konkret dan majas yang tepat.
6. **Menyunting Teks**: Memeriksa penulisan huruf kapital, kata depan (*di* dan *ke*), serta tanda baca.
`
    }
  ];
}

function getTeksLHOModules(cleanTitle: string, kelas: number): TextbookModule[] {
  return [
    {
      urutan: 1,
      judul: "Hakikat Teks Laporan Hasil Observasi (LHO) & Ciri Fakta Ilmiah",
      durasiMenit: 20,
      konten_markdown: `# Modul 1: Hakikat dan Struktur Teks LHO

> **Capaian Pembelajaran**: Menganalisis laporan hasil observasi berbasis fakta ilmiah obyektif, membedakan fakta dan opini, serta memahami struktur pernyataan umum, deskripsi bagian, dan deskripsi manfaat.

---

## 1. Pengertian Teks LHO
Teks Laporan Hasil Observasi (LHO) adalah teks yang memuat klasifikasi dan pemaparan sistematis mengenai suatu fenomena alam, benda, atau kondisi sosial berdasarkan pengamatan objektif dan data faktual.

### Sifat Utama Teks LHO:
- **Objektif**: Berdasarkan kenyataan nyata di lapangan tanpa pengaruh opini pribadi.
- **Universal**: Membahas objek dari sudut pandang klasifikasi keilmuan secara luas.
- **Faktual**: Didukung oleh data kuantitatif atau fakta ilmiah teruji.
`
    },
    {
      urutan: 2,
      judul: "Struktur Lengkap & Kaidah Kebahasaan Teks LHO",
      durasiMenit: 25,
      konten_markdown: `# Modul 2: Struktur dan Kaidah Kebahasaan Teks LHO

## 1. Struktur Teks LHO
1. **Pernyataan Umum (Klasifikasi)**: Definisi, klasifikasi taksonomi, atau pengelompokan objek.
2. **Deskripsi Bagian**: Penjelasan detail mengenai habitat, anatomi, ciri morfologi, atau perilaku.
3. **Deskripsi Manfaat/Fungsi**: Nilai guna atau peranan objek bagi ekosistem dan manusia.

## 2. Unsur Kebahasaan
- Menggunakan **kalimat definisi** (kata kerja kopula: *adalah, merupakan, yaitu*).
- Menggunakan **istilah teknis/keilmuan** (*fotosintesis, karnivora, nocturnal, ekosistem*).
- Menggunakan **kalimat deskripsi** yang bersifat objektif.
`
    },
    {
      urutan: 3,
      judul: "Menyunting dan Mengubah Teks LHO ke Bentuk Infografis",
      durasiMenit: 20,
      konten_markdown: `# Modul 3: Diseminasi Data dan Penyuntingan Teks LHO

Materi ini membahas teknik menyajikan laporan observasi dalam bentuk ringkasan infografis, poster ilmiah populer, serta kaidah penulisan kutipan dan sumber rujukan data.
`
    }
  ];
}

// =============================================================================
// 3. DETAIL MATERI IPA (ILMU PENGETAHUAN ALAM)
// =============================================================================

function getIPAModules(cleanTitle: string, kelas: number, deskripsiBab?: string): TextbookModule[] {
  return [
    {
      urutan: 1,
      judul: `Konsep Fundamental & Landasan Ilmiah: ${cleanTitle}`,
      durasiMenit: 20,
      konten_markdown: `# Modul 1: Konsep Fundamental & Teori Sains: ${cleanTitle}

> **Capaian Pembelajaran IPA (Fase D)**: Peserta didik mampu memahami konsep dasar, prinsip fisika/biologi/kimia, serta fenomena alam terkait **${cleanTitle}** melalui pendekatan penyelidikan ilmiah dan literasi sains.

---

## 1. Pengantar Konsep & Fenomena Alam
Dalam sains, **${cleanTitle}** merupakan pilar penting dalam memahami cara kerja alam semesta, keteraturan sistem biologis makhluk hidup, interaksi materi dan energi, serta perkembangan teknologi modern.

### Pertanyaan Pemantik Penyelidikan:
- Bagaimana proses ilmiah ini berlangsung di alam sekitar kita?
- Mengapa fenomena ini terjadi dan faktor-faktor apa yang mempengaruhinya secara langsung?
- Apa dampak positif dan negatifnya terhadap kelangsungan ekosistem dan kehidupan manusia?

---

## 2. Prinsip Kerja & Teori Ilmiah Utama
Pembahasan konsep mencakup:
1. **Hukum-Hukum Alam & Teori Pendukung**: Keterkaitan variabel penyebab dan akibat.
2. **Struktur & Karakteristik**: Komponen pembentuk sistem dan fungsinya masing-masing.
3. **Transformasi & Reaksi**: Perubahan energi atau materi yang menyertai fenomena tersebut.

---

## 3. Tabel Klasifikasi dan Parameter Ilmiah

| Komponen / Variabel | Satuan / Parameter | Peranan & Fungsi | Dampak terhadap Sistem |
|---|:---:|---|---|
| **Variabel Bebas** | Sesuai instrumen | Faktor yang sengaja diubah dalam eksperimen | Mengontrol respon sistem |
| **Variabel Terikat** | Parameter terukur | Hasil pengamatan yang dicatat | Mengukur efektivitas fenomena |
| **Variabel Kontrol** | Nilai konstan | Kondisi yang dijaga tetap stabil | Menjaga validitas penyelidikan |
`
    },
    {
      urutan: 2,
      judul: `Mekanisme Kerja, Rumus Matematis & Contoh Analisis Sains`,
      durasiMenit: 25,
      konten_markdown: `# Modul 2: Mekanisme Proses, Formulasi Sains & Contoh Analisis

## 1. Hubungan Antarvariabel Sains & Formulasi
Pada topik **${cleanTitle}**, berlaku prinsip kesetimbangan dan hukum kekekalan materi/energi yang dapat dirumuskan secara matematis dan analitis.

$$\\text{Efisiensi Sistem} = \\frac{\\text{Output Bermanfaat}}{\\text{Input Total}} \\times 100\\%$$

---

## 2. Contoh Soal & Pembahasan Bertahap

**Studi Kasus Penyelidikan Sains**:
Dua kelompok siswa melakukan pengamatan terhadap variabel pada topik ${cleanTitle}. Dari hasil pengukuran laboratorium didapatkan data kuantitatif terukur.

**Langkah Analisis Data**:
1. Menentukan hipotesis awal penyelidikan.
2. Memeriksa kesesuaian data hasil percobaan dengan teori dasar sains.
3. Menarik kesimpulan berdasarkan bukti ilmiah yang valid (*evidence-based reasoning*).
`
    },
    {
      urutan: 3,
      judul: `Aplikasi Teknologi, Dampak Lingkungan & Rangkuman Materi`,
      durasiMenit: 20,
      konten_markdown: `# Modul 3: Penerapan Teknologi dan Rangkuman Esensial

## 1. Penerapan Nyata dalam Industri & Kehidupan
- **Teknologi Ramah Lingkungan**: Inovasi berkelanjutan berbasis prinsip ${cleanTitle}.
- **Mitigasi & Konservasi**: Langkah pencegahan kerusakan lingkungan dan penghematan sumber daya.

## 2. Rangkuman Inti Bab (Key Summary)
- Konsep dasar ${cleanTitle} saling terhubung dengan siklus materi dan energi bumi.
- Sikap ilmiah, ketelitian observasi, dan etika riset sangat penting dalam pengembangan ilmu sains.
`
    }
  ];
}

// =============================================================================
// 4. DETAIL MATERI BAHASA INGGRIS
// =============================================================================

function getEnglishModules(cleanTitle: string, kelas: number, deskripsiBab?: string): TextbookModule[] {
  return [
    {
      urutan: 1,
      judul: `Social Function & Language Features: ${cleanTitle}`,
      durasiMenit: 20,
      konten_markdown: `# Module 1: Social Function and Core Expressions: ${cleanTitle}

> **Learning Objectives (Phase D - Grade ${kelas})**: Students will be able to identify the communicative purpose, target audience, and key language expressions related to **${cleanTitle}** in spoken and written contexts.

---

## 1. Social Function & Communicative Context
In English communication, mastering **${cleanTitle}** enables learners to interact effectively in both formal and informal everyday situations.

### Key Purposes:
- To convey precise information clearly and politely.
- To express ideas, opinions, thoughts, and feelings appropriately.
- To understand authentic cultural contexts in the global community.

---

## 2. Essential Vocabulary & Idiomatic Expressions

| Vocabulary / Expression | Part of Speech | Indonesian Meaning | Example in Context |
|---|:---:|---|---|
| **Core Topic Vocabulary** | Noun / Verb | Makna inti topik | *"We observed the detailed process."* |
| **Connecting Words** | Conjunction | Kata penghubung | *"Furthermore, they continued the task."* |
| **Descriptive Adjectives** | Adjective | Kata sifat pendukung | *"The outcome was remarkably significant."* |
`
    },
    {
      urutan: 2,
      judul: `Grammar Focus, Sentence Structures & Model Texts`,
      durasiMenit: 25,
      konten_markdown: `# Module 2: Grammar Focus and Text Structure

## 1. Grammar & Syntactic Patterns
Understanding the core grammatical structures used in **${cleanTitle}**:
- **Tenses Application**: (Present, Past, or Future depending on context)
- **Modal Auxiliaries & Action Verbs**: Expressing capability, obligation, or procedure.
- **Punctuation and Capitalization**: Standard English conventions.

---

## 2. Example Reading Passage with Comprehension Analysis

\`\`\`text
[Title: Understanding ${cleanTitle}]
In our rapidly changing modern world, effective communication is vital. 
When individuals learn to express ${cleanTitle} clearly, collaboration 
becomes significantly smoother and more meaningful.
\`\`\`

### Comprehension Check:
1. *What is the primary message of the passage above?*
2. *Identify the transitional markers and verbs used.*
`
    },
    {
      urutan: 3,
      judul: `Guided Practice, Writing Tasks & Summary`,
      durasiMenit: 20,
      konten_markdown: `# Module 3: Guided Practice and Summary

## 1. Practical Speaking & Writing Challenge
Create your own dialogue or short paragraph applying the grammar and vocabulary learned in this unit.

## 2. Chapter Summary
- Mastered the social purpose and vocabulary of ${cleanTitle}.
- Applied correct grammatical rules in communicative contexts.
`
    }
  ];
}

// =============================================================================
// 5. DETAIL MATERI IPS (ILMU PENGETAHUAN SOSIAL)
// =============================================================================

function getIPSModules(cleanTitle: string, kelas: number, deskripsiBab?: string): TextbookModule[] {
  return [
    {
      urutan: 1,
      judul: `Kondisi Spasial, Sosial & Latar Belakang Sejarah: ${cleanTitle}`,
      durasiMenit: 20,
      konten_markdown: `# Modul 1: Latar Belakang Sosial & Spasial: ${cleanTitle}

> **Capaian Pembelajaran IPS (Fase D)**: Memahami dinamika interaksi sosial, ruang geografis, kegiatan ekonomi, dan perjalanan sejarah bangsa Indonesia dalam tema **${cleanTitle}**.

---

## 1. Pengantar Konsep Sosial & Kebangsaan
Tema **${cleanTitle}** mencerminkan bagaimana manusia berinteraksi dengan lingkungan alam dan lingkungan sosialnya untuk memenuhi kebutuhan hidup serta membangun peradaban.

### Dimensi Utama Kajian IPS:
1. **Geografi & Keruangan**: Letak geografis, bentang alam, dan potensi sumber daya.
2. **Sosiologi & Interaksi Sosial**: Norma, nilai, stratifikasi sosial, dan keragaman budaya.
3. **Ekonomi**: Kegiatan produksi, distribusi, konsumsi, dan pasar.
4. **Sejarah**: Peristiwa masa lampau yang membentuk identitas bangsa saat ini.
`
    },
    {
      urutan: 2,
      judul: `Dinamika Ekonomi, Kelembagaan & Hubungan Antarmanusia`,
      durasiMenit: 25,
      konten_markdown: `# Modul 2: Dinamika Kelembagaan dan Kegiatan Ekonomi

## 1. Analisis Faktor Pendorong & Penghambat
Membahas faktor-faktor yang mempengaruhi perubahan sosial dan pertumbuhan ekonomi dalam konteks **${cleanTitle}**:
- Faktor Geografis dan Ketersediaan Sumber Daya Alam
- Faktor Kualitas Sumber Daya Manusia (SDM) dan Pendidikan
- Faktor Kebijakan Pemerintah dan Globalisasi

---

## 2. Studi Kasus Sosial Nyata
Analisis masalah sosial kontekstual di masyarakat serta alternatif solusi berkelanjutan yang berkeadilan.
`
    },
    {
      urutan: 3,
      judul: `Pemberdayaan Masyarakat, Kearifan Lokal & Rangkuman`,
      durasiMenit: 20,
      konten_markdown: `# Modul 3: Pemberdayaan dan Rangkuman Materi

## 1. Peran Kearifan Lokal dan Kebijakan Publik
Bagaimana nilai-nilai luhur budaya nusantara menjaga keharmonisan masyarakat dan kelestarian alam dalam menghadapi tantangan modernisasi.

## 2. Rangkuman Esensial Bab
- Pemahaman utuh mengenai ${cleanTitle} memperkuat rasa nasionalisme dan kepedulian sosial.
`
    }
  ];
}

// =============================================================================
// 6. DETAIL MATERI INFORMATIKA
// =============================================================================

function getInformatikaModules(cleanTitle: string, kelas: number, deskripsiBab?: string): TextbookModule[] {
  return [
    {
      urutan: 1,
      judul: `Berpikir Komputasional & Landasan Konsep: ${cleanTitle}`,
      durasiMenit: 20,
      konten_markdown: `# Modul 1: Landasan Konsep Informatika: ${cleanTitle}

> **Capaian Pembelajaran Informatika (Fase D)**: Peserta didik mampu menerapkan 4 pilar berpikir komputasional (Dekomposisi, Pengenalan Pola, Abstraksi, Algoritma) dalam memecahkan masalah terkait **${cleanTitle}**.

---

## 1. 4 Pilar Berpikir Komputasional (Computational Thinking)
1. **Dekomposisi**: Memecah masalah kompleks menjadi bagian-bagian yang lebih kecil dan mudah dikelola.
2. **Pengenalan Pola (Pattern Recognition)**: Mengidentifikasi kesamaan karakteristik atau pola berulang dari data.
3. **Abstraksi**: Menyaring informasi yang penting dan mengabaikan rincian yang tidak relevan.
4. **Perancangan Algoritma**: Menyusun langkah-langkah terurut dan logis untuk menyelesaikan masalah.
`
    },
    {
      urutan: 2,
      judul: `Struktur Logika, Arsitektur Sistem & Praktik Algoritma`,
      durasiMenit: 25,
      konten_markdown: `# Modul 2: Arsitektur Sistem dan Implementasi Logika

## 1. Alur Logika dan Pseudocode
Merancang alur pemecahan masalah dengan diagram alir (*flowchart*) dan representasi terstruktur:

\`\`\`text
START
  INPUT Data
  IF (Kondisi Valid) THEN
    PROSES Perhitungan
    OUTPUT Hasil
  ELSE
    TAMPILKAN Pesan Error
  ENDIF
END
\`\`\`

## 2. Keamanan Data & Etika Komputasi
Pentingnya menjaga privasi data, enkripsi, dan etika dalam pemanfaatan teknologi digital.
`
    },
    {
      urutan: 3,
      judul: `Proyek Aplikasi Nyata, Dampak Sosial & Rangkuman`,
      durasiMenit: 20,
      konten_markdown: `# Modul 3: Dampak Sosial dan Rangkuman Informatika

Membahas bagaimana implementasi ${cleanTitle} mentransformasi efisiensi industri, komunikasi masyarakat, serta kesiapan menyongsong era kecerdasan buatan (AI).
`
    }
  ];
}

// =============================================================================
// 7. DETAIL MATERI PENDIDIKAN PANCASILA / PPKN
// =============================================================================

function getPancasilaModules(cleanTitle: string, kelas: number, deskripsiBab?: string): TextbookModule[] {
  return [
    {
      urutan: 1,
      judul: `Nilai-Nilai Luhur Pancasila & Konstitusi: ${cleanTitle}`,
      durasiMenit: 20,
      konten_markdown: `# Modul 1: Nilai Luhur dan Konstitusi: ${cleanTitle}

> **Capaian Pembelajaran**: Menginternalisasi nilai-nilai Pancasila, Undang-Undang Dasar Negara Republik Indonesia Tahun 1945, Bhinneka Tunggal Ika, dan komitmen menjaga keutuhan NKRI.

---

## 1. Landasan Filosofis & Historis
Pancasila adalah dasar negara, pandangan hidup bangsa, dan ideologi terbuka yang menjadi pedoman dalam kehidupan bermasyarakat, berbangsa, dan bernegara.
`
    },
    {
      urutan: 2,
      judul: `Hak dan Kewajiban Warga Negara serta Penegakan Norma`,
      durasiMenit: 25,
      konten_markdown: `# Modul 2: Norma, Hak, dan Kewajiban Warga Negara

## 1. Keseimbangan Hak dan Kewajiban
Setiap warga negara memiliki hak asasi yang dilindungi oleh konstitusi, yang diimbangi dengan kewajiban mematuhi hukum, membayar pajak, serta membela negara.

## 2. Ketaatan terhadap Norma Hukum dan Moral
Menumbuhkan budaya sadar hukum dan toleransi dalam kehidupan sehari-hari di sekolah, keluarga, dan masyarakat.
`
    },
    {
      urutan: 3,
      judul: `Keteladanan Kewarganegaraan, Gotong Royong & Rangkuman`,
      durasiMenit: 20,
      konten_markdown: `# Modul 3: Penerapan Nyata dan Rangkuman

Menerapkan semangat gotong royong, musyawarah untuk mufakat, dan cinta tanah air dalam menjaga persatuan bangsa Indonesia.
`
    }
  ];
}

// =============================================================================
// 8. DETAIL MATERI PJOK
// =============================================================================

function getPJOKModules(cleanTitle: string, kelas: number, deskripsiBab?: string): TextbookModule[] {
  return [
    {
      urutan: 1,
      judul: `Keterampilan Gerak Spesifik & Peraturan: ${cleanTitle}`,
      durasiMenit: 20,
      konten_markdown: `# Modul 1: Teknik Dasar dan Keterampilan Gerak: ${cleanTitle}

> **Capaian Pembelajaran PJOK (Fase D)**: Peserta didik mampu mempraktikkan keterampilan gerak spesifik, memahami peraturan permainan/aktivitas, serta menumbuhkan sportivitas dan kerjasama tim.

---

## 1. Pengenalan Aktivitas & Manfaat Kesehatan
Aktivitas fisik teratur dalam **${cleanTitle}** meningkatkan kebugaran jasmani, daya tahan kardiovaskular, kelenturan otot, serta kesehatan mental.
`
    },
    {
      urutan: 2,
      judul: `Analisis Variasi Gerak, Taktik & Keselamatan Olahraga`,
      durasiMenit: 25,
      konten_markdown: `# Modul 2: Variasi Gerak dan Pencegahan Cedera

## 1. Tahapan Latihan
1. **Pemanasan (Warm-up)**: Mempersiapkan otot dan meningkatkan suhu tubuh guna mencegah cedera.
2. **Latihan Inti**: Mempelajari teknik gerak spesifik secara bertahap.
3. **Pendinginan (Cool-down)**: Menurunkan detak jantung secara bertahap dan meregangkan otot.
`
    },
    {
      urutan: 3,
      judul: `Pola Hidup Sehat, Kebugaran & Rangkuman`,
      durasiMenit: 20,
      konten_markdown: `# Modul 3: Gaya Hidup Aktif dan Rangkuman

Membiasakan pola hidup bersih dan sehat, nutrisi seimbang, istirahat cukup, dan manajemen stres.
`
    }
  ];
}

// =============================================================================
// 9. DETAIL MATERI SENI
// =============================================================================

function getSeniModules(cleanTitle: string, kelas: number, deskripsiBab?: string): TextbookModule[] {
  return [
    {
      urutan: 1,
      judul: `Konsep Estetika, Sejarah & Teori Seni: ${cleanTitle}`,
      durasiMenit: 20,
      konten_markdown: `# Modul 1: Konsep Estetika dan Sejarah: ${cleanTitle}

> **Capaian Pembelajaran Seni (Fase D)**: Mengapresiasi keindahan karya seni budaya nusantara dan mancanegara, serta mengekspresikan gagasan kreatif melalui medium seni.

---

## 1. Unsur-Unsur Pembentuk Karya Seni
Memahami unsur-unsur dasar seperti nada, ritme, melodi, harmoni, tempo, dan dinamika dalam musik, serta garis, bentuk, warna, dan tekstur dalam seni rupa.
`
    },
    {
      urutan: 2,
      judul: `Teknik Berkarya, Eksplorasi Media & Kreativitas`,
      durasiMenit: 25,
      konten_markdown: `# Modul 2: Teknik Berkarya dan Eksplorasi Kreatif

## 1. Eksplorasi Media dan Teknik
Mempelajari teknik pembuatan dan penyajian karya seni secara bertahap mulai dari perancangan sketsa/partitur hingga tahap *finishing*.
`
    },
    {
      urutan: 3,
      judul: `Apresiasi Seni, Pameran/Pertunjukan & Rangkuman`,
      durasiMenit: 20,
      konten_markdown: `# Modul 3: Apresiasi dan Rangkuman Materi Seni

Menyelenggarakan pergelaran seni sederhana serta menilai keunikan karya seni sebagai warisan budaya bangsa yang bernilai tinggi.
`
    }
  ];
}

// =============================================================================
// 10. DETAIL MATERI PENDIDIKAN AGAMA ISLAM / BUDI PEKERTI
// =============================================================================

function getAgamaModules(cleanTitle: string, kelas: number, deskripsiBab?: string): TextbookModule[] {
  return [
    {
      urutan: 1,
      judul: `Dalil Naqli, Nilai Spiritual & Dasar Konsep: ${cleanTitle}`,
      durasiMenit: 20,
      konten_markdown: `# Modul 1: Landasan Dalil dan Pemahaman Konsep: ${cleanTitle}

> **Capaian Pembelajaran PAI & Budi Pekerti (Fase D)**: Memahami makna ayat Al-Qur'an dan Hadis terkait **${cleanTitle}**, menginternalisasi nilai-nilai keimanan, serta meneladani akhlak mulia dalam kehidupan sehari-hari.

---

## 1. Makna dan Hakikat Ajaran
Topik **${cleanTitle}** mengajarkan kita untuk senantiasa memperkuat keimanan, menjaga integritas moral, berbuat ihsan kepada sesama makhluk, dan meneladani suri teladan Rasulullah SAW.
`
    },
    {
      urutan: 2,
      judul: `Tata Cara Ibadah, Akhlakul Karimah & Hikmah Pelaksanaan`,
      durasiMenit: 25,
      konten_markdown: `# Modul 2: Implementasi Ibadah dan Budi Pekerti

## 1. Ketentuan Syariat & Adab Berakhlak
Memahami syarat, rukun, serta tata cara pelaksanaan yang benar sesuai tuntunan syariat Islam yang membawa rahmat bagi semesta alam (*rahmatan lil 'alamin*).
`
    },
    {
      urutan: 3,
      judul: `Refleksi Diri, Penerapan Kehidupan Sehari-hari & Rangkuman`,
      durasiMenit: 20,
      konten_markdown: `# Modul 3: Refleksi Kehidupan dan Rangkuman

Menerapkan nilai kejujuran, disiplin, toleransi, dan tolong-menolong dalam lingkungan keluarga, sekolah, dan masyarakat luas.
`
    }
  ];
}

// =============================================================================
// FALLBACKS UNTUK TOPIK MATEMATIKA DAN MAPEL LAINNYA
// =============================================================================

function getPolaBilanganModules(kelas: number): TextbookModule[] {
  return [
    {
      urutan: 1,
      judul: "Pola Bilangan, Barisan Aritmetika & Geometri Dasar",
      durasiMenit: 20,
      konten_markdown: `# Modul 1: Mengenal Pola Bilangan dan Barisan Aritmetika

> **Capaian Pembelajaran (Fase D)**: Peserta didik mampu menggeneralisasi pola susunan benda dan barisan bilangan, serta menentukan rumus suku ke-$n$ ($U_n$) pada barisan aritmetika dan geometri.

---

## 1. Pengertian Barisan Bilangan
Barisan bilangan adalah susunan bilangan yang diurutkan menurut aturan atau pola tertentu. Setiap bilangan dalam barisan disebut **suku** ($U$).

### Jenis-Jenis Pola Bilangan Khusus:
1. **Pola Bilangan Asli**: $1, 2, 3, 4, 5, \\dots \\rightarrow U_n = n$
2. **Pola Bilangan Genap**: $2, 4, 6, 8, 10, \\dots \\rightarrow U_n = 2n$
3. **Pola Bilangan Ganjil**: $1, 3, 5, 7, 9, \\dots \\rightarrow U_n = 2n - 1$
4. **Pola Bilangan Persegi (Kuadrat)**: $1, 4, 9, 16, 25, \\dots \\rightarrow U_n = n^2$
5. **Pola Bilangan Segitiga**: $1, 3, 6, 10, 15, \\dots \\rightarrow U_n = \\frac{n(n+1)}{2}$
6. **Pola Bilangan Persegi Panjang**: $2, 6, 12, 20, 30, \\dots \\rightarrow U_n = n(n+1)$
7. **Pola Bilangan Fibonacci**: $1, 1, 2, 3, 5, 8, 13, \\dots$ (setiap suku adalah jumlah dua suku sebelumnya).

---

## 2. Barisan dan Deret Aritmetika
**Barisan Aritmetika** adalah barisan bilangan dengan selisih (beda, $b$) antara dua suku yang berurutan selalu konstan/tetap.

### Rumus Utama:
- **Beda ($b$)**:
  $$b = U_n - U_{n-1}$$
- **Suku ke-$n$ ($U_n$)**:
  $$U_n = a + (n - 1)b$$
  *(di mana $a = U_1$ adalah suku pertama, $b$ adalah beda, $n$ adalah urutan suku)*
- **Jumlah $n$ Suku Pertama / Deret ($S_n$)**:
  $$S_n = \\frac{n}{2}(a + U_n) = \\frac{n}{2}[2a + (n - 1)b]$$
`
    },
    {
      urutan: 2,
      judul: "Barisan dan Deret Geometri: Rasio & Pertumbuhan",
      durasiMenit: 25,
      konten_markdown: `# Modul 2: Barisan Geometri dan Rasio Pengali

## 1. Konsep Barisan Geometri
Barisan Geometri adalah barisan bilangan di mana perbandingan (rasio, $r$) antara dua suku yang berurutan selalu tetap.

$$r = \\frac{U_n}{U_{n-1}}$$

### Rumus Suku ke-$n$ ($U_n$):
$$U_n = a \\cdot r^{n-1}$$

### Rumus Jumlah $n$ Suku Pertama ($S_n$):
- Untuk $r > 1$:
  $$S_n = \\frac{a(r^n - 1)}{r - 1}$$
- Untuk $r < 1$:
  $$S_n = \\frac{a(1 - r^n)}{1 - r}$$
`
    },
    {
      urutan: 3,
      judul: "Aplikasi Nyata: Bunga Bank, Bakteri & Rangkuman",
      durasiMenit: 20,
      konten_markdown: `# Modul 3: Penerapan Nyata dan Rangkuman

## 1. Pertumbuhan Bakteri (Eksponensial Geometri)
Sebuah sel bakteri membelah diri menjadi $2$ setiap $20\\text{ menit}$. Jika mula-mula terdapat $5$ bakteri, berapakah jumlah bakteri setelah $2\\text{ jam}$?
- Waktu total $= 120\\text{ menit} \\rightarrow n = \\frac{120}{20} = 6\\text{ kali pembelahan}$.
- $a = 5, r = 2$.
- $U_7 = a \\cdot r^6 = 5 \\times 2^6 = 5 \\times 64 = 320\\text{ bakteri}$.
`
    }
  ];
}

function getPLSVModules(kelas: number): TextbookModule[] {
  return [
    {
      urutan: 1,
      judul: "Konsep Dasar Persamaan Linear Satu Variabel (PLSV) & Prinsip Kesetaraan",
      durasiMenit: 20,
      konten_markdown: "# Persamaan Linear Satu Variabel (PLSV)\n\nHalo Sobat Belajar! Bentuk umum PLSV adalah:\n$ax + b = c \\quad (a \\neq 0)$\n\nPrinsip kesetaraan: Perlakuan pada ruas kiri harus sama persis dengan perlakuan pada ruas kanan.\n\n---\n\n## 📝 Contoh Soal dan Pembahasan Lengkap\n\n### Contoh Soal:\nTentukan nilai $x$ dari persamaan $5x - 7 = 3x + 9$!\n\n**Pembahasan Lengkap:**\n$5x - 3x = 9 + 7 \\implies 2x = 16 \\implies x = 8$\n\n---\n\n## 🎯 Contoh Soal Latihan Mandiri & Pembahasan Lengkap\n\n### Contoh Soal Latihan 1:\nNilai $x$ yang memenuhi persamaan $4(2x - 3) = 3x + 8$ adalah ...\n- A. $2$\n- B. $4$\n- C. $5$\n- D. $6$\n\n> **Kunci Jawaban:** **B**\n>\n> **Pembahasan Lengkap:**\n> 1. Jabarkan tanda kurung: $8x - 12 = 3x + 8$.\n> 2. Pindahkan variabel $x$ ke ruas kiri dan konstanta ke ruas kanan:\n>    $8x - 3x = 8 + 12 \\implies 5x = 20$\n> 3. Bagi kedua ruas dengan 5:\n>    $x = \\frac{20}{5} = 4$\n> Jadi, jawaban yang tepat adalah **B ($4$)**.\n\n---\n\n### Contoh Soal Latihan 2:\nJika $3x + 5 = -7$, maka nilai dari $2x - 3$ adalah ...\n- A. $-11$\n- B. $-7$\n- C. $-4$\n- D. $5$\n\n> **Kunci Jawaban:** **A**\n>\n> **Pembahasan Lengkap:**\n> 1. Cari nilai $x$:\n>    $3x = -7 - 5 \\implies 3x = -12 \\implies x = -4$\n> 2. Substitusikan $x = -4$ ke bentuk $2x - 3$:\n>    $2(-4) - 3 = -8 - 3 = -11$\n> Jadi, jawaban yang tepat adalah **A ($-11$)**.\n\n---\n\n### Contoh Soal Latihan 3:\nPersamaan berikut yang **bukan** merupakan PLSV adalah ...\n- A. $2x + 5 = 11$\n- B. $3y - 4 = y + 6$\n- C. $x^2 - 4 = 0$\n- D. $\\frac{1}{2}a + 3 = 7$\n\n> **Kunci Jawaban:** **C**\n>\n> **Pembahasan Lengkap:**\n> Pada persamaan $x^2 - 4 = 0$, variabel $x$ memiliki pangkat tertinggi 2 (persamaan kuadrat), bukan persamaan linear berpangkat 1.\n> Jadi, jawaban yang tepat adalah **C**."
    },
    {
      urutan: 2,
      judul: "Pertidaksamaan Linear Satu Variabel (PtLSV) & Aturan Pembalikan Tanda",
      durasiMenit: 25,
      konten_markdown: "# Pertidaksamaan Linear Satu Variabel (PtLSV)\n\nHalo Sobat Belajar! \n\n> ⚠️ **ATURAN EMAS PEMBALIKAN TANDA:**\n> Jika kedua ruas pertidaksamaan dikali atau dibagi dengan bilangan negatif, tanda ketidaksamaan **wajib dibalik** ($< \\leftrightarrow >$ dan $\\leq \\leftrightarrow \\geq$).\n\n---\n\n## 🎯 Contoh Soal Latihan Mandiri & Pembahasan Lengkap\n\n### Contoh Soal Latihan 1:\nHimpunan penyelesaian dari $2x - 3 < 7$ untuk $x$ bilangan asli adalah ...\n- A. $\\{1, 2, 3, 4\\}$\n- B. $\\{1, 2, 3, 4, 5\\}$\n- C. $\\{0, 1, 2, 3, 4\\}$\n- D. $\\{5, 6, 7, \\dots\\}$\n\n> **Kunci Jawaban:** **A**\n>\n> **Pembahasan Lengkap:**\n> 1. Tambah 3 di kedua ruas: $2x < 7 + 3 \\implies 2x < 10$.\n> 2. Bagi 2: $x < 5$.\n> 3. Himpunan bilangan asli ($1, 2, 3, \\dots$) yang lebih kecil dari 5 adalah $\\{1, 2, 3, 4\\}$.\n> Jadi, jawaban yang tepat adalah **A**.\n\n---\n\n### Contoh Soal Latihan 2:\nBentuk sederhana dari pertidaksamaan $-4x \\geq 20$ adalah ...\n- A. $x \\geq -5$\n- B. $x \\leq -5$\n- C. $x \\geq 5$\n- D. $x \\leq 5$\n\n> **Kunci Jawaban:** **B**\n>\n> **Pembahasan Lengkap:**\n> Bagi kedua ruas dengan $-4$. Karena dibagi bilangan negatif, tanda $\\geq$ dibalik menjadi $\\leq$:\n> $x \\leq \\frac{20}{-4} \\implies x \\leq -5$\n> Jadi, jawaban yang tepat adalah **B ($x \\leq -5$)**.\n\n---\n\n### Contoh Soal Latihan 3:\nHimpunan penyelesaian dari $3(x - 2) \\leq 5x + 6$ adalah ...\n- A. $x \\leq -6$\n- B. $x \\geq -6$\n- C. $x \\leq 6$\n- D. $x \\geq 6$\n\n> **Kunci Jawaban:** **B**\n>\n> **Pembahasan Lengkap:**\n> 1. Buka kurung: $3x - 6 \\leq 5x + 6$.\n> 2. Kumpulkan variabel: $3x - 5x \\leq 6 + 6 \\implies -2x \\leq 12$.\n> 3. Bagi dengan $-2$ (tanda berbalik):\n>    $x \\geq \\frac{12}{-2} \\implies x \\geq -6$\n> Jadi, jawaban yang tepat adalah **B ($x \\geq -6$)**."
    },
    {
      urutan: 3,
      judul: "Aplikasi Pemodelan Soal Cerita PLSV & PtLSV dalam Kehidupan Sehari-hari",
      durasiMenit: 20,
      konten_markdown: "# Pemodelan Matematika dan Rangkuman Bab 3\n\nHalo Sobat Belajar! Di sini kita memodelkan masalah nyata ke dalam bentuk matematika.\n\n---\n\n## 2. 📝 Contoh Soal Pemodelan Matematika dan Pembahasan Lengkap\n\n### Contoh Soal 1: Masalah Geometri Persegi Panjang (PLSV)\n*Sebuah kebun persegi panjang memiliki panjang $(2x - 3)\\text{ meter}$ dan lebar $(x + 1)\\text{ meter}$. Jika kelilingnya $38\\text{ meter}$, tentukan luas kebun!*\n\n**Pembahasan Lengkap:**\n$2[(2x - 3) + (x + 1)] = 38 \\implies 2(3x - 2) = 38 \\implies 6x - 4 = 38 \\implies 6x = 42 \\implies x = 7$\n- Panjang $= 2(7) - 3 = 11\\text{ meter}$\n- Lebar $= 7 + 1 = 8\\text{ meter}$\n- Luas $= 11 \\times 8 = 88\\text{ m}^2$\n\n---\n\n## 🎯 Contoh Soal Latihan Mandiri & Pembahasan Lengkap\n\n### Contoh Soal Latihan 1:\nUmur Ayah saat ini 3 kali umur Budi. Jika selisih umur mereka adalah $30\\text{ tahun}$, berapakah umur Ayah?\n- A. $35\\text{ tahun}$\n- B. $40\\text{ tahun}$\n- C. $45\\text{ tahun}$\n- D. $50\\text{ tahun}$\n\n> **Kunci Jawaban:** **C**\n>\n> **Pembahasan Lengkap:**\n> 1. Misalkan umur Budi $= x$, maka umur Ayah $= 3x$.\n> 2. Selisih umur mereka:\n>    $3x - x = 30 \\implies 2x = 30 \\implies x = 15\\text{ tahun}$\n> 3. Umur Ayah $= 3(15) = 45\\text{ tahun}$.\n> Jadi, jawaban yang tepat adalah **C ($45\\text{ tahun}$)**.\n\n---\n\n### Contoh Soal Latihan 2:\nPak Anto memiliki mobil box pengangkut barang dengan daya angkut tidak lebih dari $800\\text{ kg}$. Berat Pak Anto adalah $60\\text{ kg}$ dan ia akan mengangkut kardus seberat $20\\text{ kg}$. Jumlah kardus maksimal yang dapat diangkut adalah ...\n- A. $35$ kardus\n- B. $37$ kardus\n- C. $40$ kardus\n- D. $42$ kardus\n\n> **Kunci Jawaban:** **B**\n>\n> **Pembahasan Lengkap:**\n> 1. Model pertidaksamaan muatan: $20x + 60 \\leq 800$.\n> 2. Selesaikan pertidaksamaan:\n>    $20x \\leq 800 - 60 \\implies 20x \\leq 740 \\implies x \\leq 37$\n> Jadi, jumlah kardus maksimal yang dapat diangkut adalah **B (37 kardus)**.\n\n---\n\n### Contoh Soal Latihan 3:\nTiga bilangan bulat berurutan berjumlah $72$. Bilangan terbesar di antara ketiganya adalah ...\n- A. $23$\n- B. $24$\n- C. $25$\n- D. $26$\n\n> **Kunci Jawaban:** **C**\n>\n> **Pembahasan Lengkap:**\n> 1. Misalkan ketiga bilangan tersebut adalah $x, x+1, x+2$.\n> 2. Jumlah ketiga bilangan:\n>    $x + (x+1) + (x+2) = 72 \\implies 3x + 3 = 72 \\implies 3x = 69 \\implies x = 23$\n> 3. Bilangan terbesar adalah $x + 2 = 23 + 2 = 25$.\n> Jadi, jawaban yang tepat adalah **C ($25$)**."
    }
  ];
}

function getSPLDVModules(kelas: number): TextbookModule[] {
  return [
    {
      urutan: 1,
      judul: "Konsep SPLDV, Metode Grafik & Substitusi",
      durasiMenit: 20,
      konten_markdown: `# Modul 1: Sistem Persamaan Linear Dua Variabel (SPLDV)

> **Capaian Pembelajaran**: Menyelesaikan SPLDV dengan metode grafik, substitusi, eliminasi, dan metode campuran (gabungan).

$$\\begin{cases}
a_1 x + b_1 y = c_1 \\\\
a_2 x + b_2 y = c_2
\\end{cases}$$
`
    },
    {
      urutan: 2,
      judul: "Metode Eliminasi & Campuran pada SPLDV",
      durasiMenit: 25,
      konten_markdown: `# Modul 2: Metode Eliminasi dan Gabungan

Menghilangkan salah satu variabel dengan menyamakan koefisiennya melalui operasi perkalian silang dan pengurangan/penjumlahan kedua persamaan.
`
    },
    {
      urutan: 3,
      judul: "Studi Kasus Transaksi Pasar & Pemecahan Masalah Nyata",
      durasiMenit: 20,
      konten_markdown: `# Modul 3: Aplikasi Nyata SPLDV

Penerapan SPLDV dalam menentukan harga satuan barang saat berbelanja, tiket masuk wahana rekreasi, dan kapasitas muatan kendaraan.
`
    }
  ];
}

function getPerbandinganModules(kelas: number): TextbookModule[] {
  return [
    {
      urutan: 1,
      judul: "Perbandingan Senilai: Skala Peta & Proporsi Langsung",
      durasiMenit: 20,
      konten_markdown: `# Modul 1: Perbandingan Senilai dan Skala

$$\\frac{a_1}{b_1} = \\frac{a_2}{b_2} \\implies a_1 \\cdot b_2 = a_2 \\cdot b_1$$
`
    },
    {
      urutan: 2,
      judul: "Perbandingan Berbalik Nilai: Waktu, Kecepatan & Pekerja",
      durasiMenit: 25,
      konten_markdown: `# Modul 2: Perbandingan Berbalik Nilai

$$a_1 \\cdot b_1 = a_2 \\cdot b_2$$
`
    },
    {
      urutan: 3,
      judul: "Aplikasi Kontekstual & Latihan Soal Terbimbing",
      durasiMenit: 20,
      konten_markdown: `# Modul 3: Penerapan dan Rangkuman Perbandingan
`
    }
  ];
}

function getBangunDatarModules(kelas: number): TextbookModule[] {
  return [
    {
      urutan: 1,
      judul: "Sifat Geometri Segitiga & Segiempat",
      durasiMenit: 20,
      konten_markdown: `# Modul 1: Karakteristik Bangun Datar Segitiga & Segiempat
`
    },
    {
      urutan: 2,
      judul: "Keliling, Luas & Hubungan Antarsudut",
      durasiMenit: 25,
      konten_markdown: `# Modul 2: Rumus Keliling, Luas, dan Garis Sejajar
`
    },
    {
      urutan: 3,
      judul: "Penyelesaian Soal Gabungan & Aplikasi Nyata",
      durasiMenit: 20,
      konten_markdown: `# Modul 3: Luas Daerah Gabungan dan Pemecahan Masalah
`
    }
  ];
}

function getBangunRuangModules(kelas: number): TextbookModule[] {
  return [
    {
      urutan: 1,
      judul: "Unsur, Jaring-Jaring Kubus, Balok, Prisma & Limas",
      durasiMenit: 20,
      konten_markdown: `# Modul 1: Bangun Ruang Sisi Datar: Unsur dan Jaring-Jaring
`
    },
    {
      urutan: 2,
      judul: "Luas Permukaan dan Volume Bangun Ruang Sisi Datar",
      durasiMenit: 25,
      konten_markdown: `# Modul 2: Formulasi Luas Permukaan dan Volume
`
    },
    {
      urutan: 3,
      judul: "Aplikasi Wadah, Tenda & Bangun Ruang Gabungan",
      durasiMenit: 20,
      konten_markdown: `# Modul 3: Penerapan Praktis dan Rangkuman BRSD
`
    }
  ];
}

function getBilanganBerpangkatModules(kelas: number): TextbookModule[] {
  return [
    {
      urutan: 1,
      judul: "Pengertian Eksponen, Bentuk Umum & 8 Sifat Operasi Bilangan Berpangkat",
      durasiMenit: 20,
      konten_markdown: "# Pengertian Eksponen (Bilangan Berpangkat)\n\nEksponen adalah bilangan berpangkat, yakni **bilangan yang dikalikan dengan dirinya sendiri hingga beberapa tingkat**. Notasi pangkat digunakan untuk menuliskan berapa kali suatu bilangan dikalikan secara berulang dalam bentuk yang lebih sederhana.\n\nMisalnya, kita memiliki faktor $a$ yang dikalikan berulang sebanyak tiga kali, maka dapat ditulis:\n$a^3 = a \\times a \\times a$\n\nAngka 3 dituliskan di sebelah kanan atas $a$, yang menunjukkan bahwa angka 3 ini merupakan pangkat dari $a$.\n\nContohnya:\n$2^3 = 2 \\times 2 \\times 2 = 8$\n\n---\n\n## Bentuk Umum Bilangan Berpangkat\n\nSecara umum, perkalian berulang dari bilangan $a$ sebanyak $n$ faktor dirumuskan sebagai berikut:\n\n$a^n = \\underbrace{a \\times a \\times a \\times \\dots \\times a}_{n \\text{ kali}}$\n\nDi mana:\n- **$a$** disebut sebagai **bilangan pokok (basis)**\n- **$n$** disebut sebagai **bilangan pangkat (eksponen)**\n\nBilangan berpangkat bisa terdiri atas bilangan dengan **pangkat bulat positif** (bilangan asli), bilangan dengan **pangkat bulat negatif**, bilangan dengan **pangkat nol**, bilangan dengan **pangkat rasional**, dan bilangan dengan **pangkat riil**.\n\n---\n\n## Sifat-Sifat Eksponen (Bilangan Berpangkat)\n\nBilangan berpangkat atau eksponen memiliki sifat-sifat yang perlu kamu pahami agar kamu bisa menyelesaikan **persamaan eksponen** maupun pertidaksamaan eksponen dengan lebih mudah. Ada **8 sifat eksponen** utama yang menjadi kunci perhitungan aljabar. *Cus, kita bahas satu per satu!*\n\n### 1. Perkalian Bilangan Berpangkat dengan Basis Sama\nJika dua bilangan berpangkat dengan basis yang sama dikalikan, maka pangkatnya dijumlahkan:\n$a^m \\times a^n = a^{m+n}$\n\n*Contoh:*\n$2^3 \\times 2^4 = 2^{3+4} = 2^7 = 128$\n\n### 2. Pembagian Bilangan Berpangkat dengan Basis Sama\nJika dua bilangan berpangkat dengan basis yang sama dibagi, maka pangkatnya dikurangkan:\n$\\frac{a^m}{a^n} = a^{m-n} \\quad (a \\neq 0)$\n\n*Contoh:*\n$\\frac{5^6}{5^2} = 5^{6-2} = 5^4 = 625$\n\n### 3. Pangkat dari Suatu Bilangan Berpangkat\nJika bilangan berpangkat dipangkatkan lagi, maka pangkat-pangkatnya dikalikan:\n$(a^m)^n = a^{m \\cdot n}$\n\n*Contoh:*\n$(3^2)^3 = 3^{2 \\times 3} = 3^6 = 729$\n\n### 4. Pangkat dari Perkalian Bilangan\nPerkalian dua bilangan yang dipangkatkan sama dengan perkalian dari masing-masing bilangan yang dipangkatkan:\n$(a \\cdot b)^m = a^m \\cdot b^m$\n\n*Contoh:*\n$(2 \\times 3)^3 = 2^3 \\times 3^3 = 8 \\times 27 = 216$\n\n### 5. Pangkat dari Pembagian (Pecahan)\nPembagian bilangan yang dipangkatkan sama dengan pembagian masing-masing bilangan berpangkat tersebut:\n$\\left(\\frac{a}{b}\\right)^m = \\frac{a^m}{b^m} \\quad (b \\neq 0)$\n\n*Contoh:*\n$\\left(\\frac{2}{3}\\right)^4 = \\frac{2^4}{3^4} = \\frac{16}{81}$\n\n### 6. Pangkat Bulat Negatif\nBilangan berpangkat negatif sama dengan satu per bilangan berpangkat positif:\n$a^{-n} = \\frac{1}{a^n} \\quad (a \\neq 0)$\n\n*Contoh:*\n$4^{-2} = \\frac{1}{4^2} = \\frac{1}{16}$\n\n### 7. Pangkat Pecahan dan Bentuk Akar\nPangkat berbentuk pecahan dapat diubah menjadi bentuk akar, di mana penyebut menjadi indeks akar dan pembilang menjadi pangkat di dalam akar:\n$\\sqrt[n]{a^m} = a^{\\frac{m}{n}}$\n\n*Contoh:*\n$\\sqrt[3]{8^2} = 8^{\\frac{2}{3}} = (2^3)^{\\frac{2}{3}} = 2^{3 \\times \\frac{2}{3}} = 2^2 = 4$\n\n### 8. Pangkat Nol\nSetiap bilangan riil bukan nol yang dipangkatkan dengan nol hasilnya selalu sama dengan 1:\n$a^0 = 1 \\quad (a \\neq 0)$\n\n*Contoh:*\n$999^0 = 1, \\quad (-7)^0 = 1, \\quad \\left(\\frac{3}{5}\\right)^0 = 1$\n\n---\n\n## 💡 Pojok Penting & Awas Jebakan Miskonsepsi!\n\n> ⚠️ **Awas Jebakan Minus!**\n> Perhatikan letak tanda kurung:\n> - $(-3)^2 = (-3) \\times (-3) = +9$ (tanda minus ikut dipangkatkan)\n> - $-3^2 = -(3 \\times 3) = -9$ (yang dipangkatkan hanya angka 3)\n>\n> ⚠️ **Awas Penjumlahan Basis Sama!**\n> $2^3 + 2^4 \\neq 2^{3+4}$. Sifat penjumlahan pangkat HANYA berlaku untuk **perkalian** ($2^3 \\times 2^4 = 2^7$). Untuk penjumlahan, hitung manual: $2^3 + 2^4 = 8 + 16 = 24$.\n\n---\n\n## 📝 Contoh Soal dan Pembahasan Lengkap\n\n### Contoh Soal 1 (Level Pemahaman Konsep)\nSederhanakan bentuk operasi eksponen berikut:\n$(6a^3)^2 : 2a^4$\n\n**Langkah Pengerjaan:**\n1. Gunakan sifat $(a \\cdot b)^m = a^m \\cdot b^m$ dan $(a^m)^n = a^{mn}$:\n   $(6a^3)^2 = 6^2 \\cdot (a^3)^2 = 36a^{3 \\times 2} = 36a^6$\n2. Lakukan pembagian dengan $2a^4$:\n   $\\frac{36a^6}{2a^4} = \\left(\\frac{36}{2}\\right) \\cdot \\left(\\frac{a^6}{a^4}\\right)$\n3. Gunakan sifat pembagian eksponen $\\frac{a^m}{a^n} = a^{m-n}$:\n   $= 18 \\cdot a^{6-4} = 18a^2$\n\n**Jawaban Akhir:** Bentuk sederhananya adalah **$18a^2$**.\n\n---\n\n### Contoh Soal 2 (Level Penerapan Campuran)\nTentukan nilai dari:\n$\\frac{2^5 \\times 3^4 \\times 2^{-2}}{2^2 \\times 3^2}$\n\n**Langkah Pengerjaan:**\n1. Kelompokkan bilangan-bilangan yang memiliki basis sama:\n   $= \\frac{2^{5 + (-2)} \\times 3^4}{2^2 \\times 3^2} = \\frac{2^3 \\times 3^4}{2^2 \\times 3^2}$\n2. Kurangkan pangkat dari basis yang sama:\n   $= 2^{3-2} \\times 3^{4-2} = 2^1 \\times 3^2$\n3. Hitung hasil akhirnya:\n   $= 2 \\times 9 = 18$\n\n**Jawaban Akhir:** Nilai dari ekspresi tersebut adalah **$18$**.\n\n---\n\n### Contoh Soal 3 (Level Soal HOTS Aljabar)\nSederhanakan bentuk aljabar berikut ke dalam pangkat bulat positif:\n$\\left( \\frac{x^3 y^{-2}}{x^{-1} y^4} \\right)^{-2}$\n\n**Langkah Pengerjaan:**\n1. Selesaikan terlebih dahulu bagian dalam kurung dengan mengurangkan pangkat:\n   $x^{3 - (-1)} = x^{3 + 1} = x^4$\n   $y^{-2 - 4} = y^{-6}$\n   Maka bentuk di dalam kurung menjadi: $(x^4 y^{-6})^{-2}$\n2. Kalikan pangkat luar $-2$ ke setiap pangkat di dalam kurung:\n   $(x^4)^{-2} \\cdot (y^{-6})^{-2} = x^{4 \\times (-2)} \\cdot y^{-6 \\times (-2)} = x^{-8} y^{12}$\n3. Ubah pangkat negatif menjadi pangkat positif di penyebut:\n   $x^{-8} y^{12} = \\frac{y^{12}}{x^8}$\n\n**Jawaban Akhir:** Hasil penyederhanaan adalah **$\\frac{y^{12}}{x^8}$**.\n\n---\n\n## 🎯 Contoh Soal Latihan Mandiri & Pembahasan Lengkap\n\nBerikut adalah contoh soal latihan mandiri untuk memperdalam penguasaan konsep eksponen, lengkap dengan kunci jawaban dan pembahasan langkah demi langkah:\n\n### Contoh Soal Latihan 1:\nNilai dari $(-2)^4 - (-2)^3$ adalah ...\n- A. $8$\n- B. $16$\n- C. $24$\n- D. $-24$\n\n> **Kunci Jawaban:** **C**\n>\n> **Pembahasan Lengkap:**\n> 1. Hitung nilai suku pertama: $(-2)^4 = (-2) \\times (-2) \\times (-2) \\times (-2) = 16$.\n> 2. Hitung nilai suku kedua: $(-2)^3 = (-2) \\times (-2) \\times (-2) = -8$.\n> 3. Lakukan operasi pengurangan:\n>    $16 - (-8) = 16 + 8 = 24$\n> Jadi, jawaban yang tepat adalah **C ($24$)**.\n\n---\n\n### Contoh Soal Latihan 2:\nBentuk sederhana dari $\\frac{(p^2 q^3)^4}{p^5 q^2}$ adalah ...\n- A. $p^3 q^{10}$\n- B. $p^3 q^8$\n- C. $p^8 q^{10}$\n- D. $p^{13} q^{14}$\n\n> **Kunci Jawaban:** **A**\n>\n> **Pembahasan Lengkap:**\n> 1. Terapkan sifat $(a^m)^n = a^{mn}$ pada bagian pembilang:\n>    $(p^2 q^3)^4 = p^{2 \\times 4} q^{3 \\times 4} = p^8 q^{12}$\n> 2. Lakukan pembagian basis sejenis dengan mengurangkan pangkatnya:\n>    $\\frac{p^8 q^{12}}{p^5 q^2} = p^{8-5} q^{12-2} = p^3 q^{10}$\n> Jadi, jawaban yang tepat adalah **A ($p^3 q^{10}$)**.\n\n---\n\n### Contoh Soal Latihan 3:\nJika $3^{x+1} = 81$, maka nilai dari $2x - 1$ adalah ...\n- A. $3$\n- B. $5$\n- C. $7$\n- D. $9$\n\n> **Kunci Jawaban:** **B**\n>\n> **Pembahasan Lengkap:**\n> 1. Samakan basis kedua ruas dengan mengubah angka $81$ ke basis $3$:\n>    $81 = 3^4$\n>    Sehingga persamaannya menjadi: $3^{x+1} = 3^4$\n> 2. Karena basis sudah sama-sama $3$, maka pangkatnya harus sama:\n>    $x + 1 = 4 \\implies x = 4 - 1 = 3$\n> 3. Hitung nilai $2x - 1$ dengan mensubstitusikan $x = 3$:\n>    $2(3) - 1 = 6 - 1 = 5$\n> Jadi, jawaban yang tepat adalah **B ($5$)**."
    },
    {
      urutan: 2,
      judul: "Bentuk Akar, Operasi Aljabar Akar & Merasionalkan Penyebut",
      durasiMenit: 25,
      konten_markdown: "# Bentuk Akar dan Operasi Aljabar\n\nHalo Sobat Belajar! Setelah menguasai sifat-sifat bilangan berpangkat, kita akan melangkah ke topik yang saling berkaitan erat, yaitu **Bentuk Akar**.\n\n---\n\n## 1. Pengertian Bentuk Akar\n\nTidak semua bilangan yang berada di dalam tanda akar ($\\sqrt{\\phantom{x}}$) disebut sebagai bentuk akar. \n\n> **Definisi:**\n> **Bentuk akar** adalah akar dari suatu bilangan rasional yang hasilnya merupakan **bilangan irasional** (bilangan yang tidak dapat dinyatakan dalam bentuk pecahan $\\frac{a}{b}$, di mana $a, b$ bilangan bulat dan $b \\neq 0$).\n\n### Contoh Perbandingan:\n- $\\sqrt{4} = 2$ $\\rightarrow$ **Bukan bentuk akar** (karena hasilnya bilangan rasional bulat $2$).\n- $\\sqrt{9} = 3$ $\\rightarrow$ **Bukan bentuk akar**.\n- $\\sqrt{2} = 1,41421356\\dots$ $\\rightarrow$ **Bentuk akar** (hasilnya bilangan irasional tak berujung).\n- $\\sqrt{3}, \\sqrt{5}, \\sqrt{7}, \\sqrt{10}$ $\\rightarrow$ **Bentuk akar**.\n\n---\n\n## 2. Hubungan Bentuk Akar dan Pangkat Pecahan\n\nBerdasarkan sifat eksponen ke-7:\n$\\sqrt[n]{a^m} = a^{\\frac{m}{n}}$\n\nKhusus untuk akar kuadrat (indeks akar 2), angka 2 di luar akar biasanya tidak dituliskan:\n$\\sqrt{a} = a^{\\frac{1}{2}}$\n\n---\n\n## 3. Menyederhanakan Bentuk Akar\n\nUntuk menyederhanakan bentuk akar $\\sqrt{c}$, faktorkan bilangan $c$ menjadi perkalian dua bilangan di mana salah satunya adalah **bilangan kuadrat murni** ($4, 9, 16, 25, 36, 49, 64, 81, 100, \\dots$):\n$\\sqrt{a \\times b} = \\sqrt{a} \\times \\sqrt{b}$\n\n### Contoh Menyederhanakan:\n- $\\sqrt{12} = \\sqrt{4 \\times 3} = \\sqrt{4} \\times \\sqrt{3} = 2\\sqrt{3}$\n- $\\sqrt{50} = \\sqrt{25 \\times 2} = \\sqrt{25} \\times \\sqrt{2} = 5\\sqrt{2}$\n- $\\sqrt{72} = \\sqrt{36 \\times 2} = \\sqrt{36} \\times \\sqrt{2} = 6\\sqrt{2}$\n- $\\sqrt{300} = \\sqrt{100 \\times 3} = 10\\sqrt{3}$\n\n---\n\n## 4. Operasi Aljabar pada Bentuk Akar\n\n### A. Penjumlahan dan Pengurangan\nPenjumlahan dan pengurangan bentuk akar **hanya dapat dilakukan jika bilangan di dalam akarnya sejenis (sama)**:\n$p\\sqrt{a} + q\\sqrt{a} = (p + q)\\sqrt{a}$\n$p\\sqrt{a} - q\\sqrt{a} = (p - q)\\sqrt{a}$\n\n*Contoh:*\n$3\\sqrt{5} + 7\\sqrt{5} = (3 + 7)\\sqrt{5} = 10\\sqrt{5}$\n$8\\sqrt{2} - 3\\sqrt{2} = (8 - 3)\\sqrt{2} = 5\\sqrt{2}$\n\n### B. Perkalian Bentuk Akar\nPerkalian bentuk akar tidak mensyaratkan akar harus sejenis:\n$\\sqrt{a} \\times \\sqrt{b} = \\sqrt{a \\times b}$\n$(p\\sqrt{a}) \\times (q\\sqrt{b}) = (p \\times q)\\sqrt{a \\times b}$\n\n*Contoh:*\n$2\\sqrt{3} \\times 5\\sqrt{6} = (2 \\times 5)\\sqrt{3 \\times 6} = 10\\sqrt{18} = 10\\sqrt{9 \\times 2} = 10 \\times 3\\sqrt{2} = 30\\sqrt{2}$\n\n---\n\n## 5. Merasionalkan Penyebut Pecahan Bentuk Akar\n\nDi dalam kaidah baku penulisan matematika, pecahan yang memiliki bentuk akar pada penyebutnya harus dirasionalkan dengan mengalikannya dengan bentuk sekawannya.\n\n### Tipe 1: Pecahan Berbentuk $\\frac{a}{\\sqrt{b}}$\n$\\frac{a}{\\sqrt{b}} = \\frac{a}{\\sqrt{b}} \\times \\frac{\\sqrt{b}}{\\sqrt{b}} = \\frac{a\\sqrt{b}}{b}$\n\n### Tipe 2: Pecahan Berbentuk $\\frac{c}{a + \\sqrt{b}}$\n$\\frac{c}{a + \\sqrt{b}} = \\frac{c}{a + \\sqrt{b}} \\times \\frac{a - \\sqrt{b}}{a - \\sqrt{b}} = \\frac{c(a - \\sqrt{b})}{a^2 - b}$\n\n---\n\n## 📝 Contoh Soal dan Pembahasan Lengkap\n\n### Contoh Soal 1:\nSederhanakan ekspresi berikut:\n$\\sqrt{48} + \\sqrt{75} - \\sqrt{108}$\n\n**Langkah Pengerjaan:**\n1. Faktorkan setiap bilangan ke bentuk perkalian dengan bilangan kuadrat:\n   - $\\sqrt{48} = \\sqrt{16 \\times 3} = 4\\sqrt{3}$\n   - $\\sqrt{75} = \\sqrt{25 \\times 3} = 5\\sqrt{3}$\n   - $\\sqrt{108} = \\sqrt{36 \\times 3} = 6\\sqrt{3}$\n2. Lakukan operasi penjumlahan dan pengurangan:\n   $4\\sqrt{3} + 5\\sqrt{3} - 6\\sqrt{3} = (4 + 5 - 6)\\sqrt{3} = 3\\sqrt{3}$\n\n**Jawaban:** Hasil sederhananya adalah **$3\\sqrt{3}$**.\n\n---\n\n## 🎯 Contoh Soal Latihan Mandiri & Pembahasan Lengkap\n\n### Contoh Soal Latihan 1:\nBentuk sederhana dari $2\\sqrt{20} - \\sqrt{45} + 3\\sqrt{5}$ adalah ...\n- A. $2\\sqrt{5}$\n- B. $4\\sqrt{5}$\n- C. $6\\sqrt{5}$\n- D. $8\\sqrt{5}$\n\n> **Kunci Jawaban:** **B**\n>\n> **Pembahasan Lengkap:**\n> 1. Sederhanakan $\\sqrt{20}$:\n>    $2\\sqrt{20} = 2\\sqrt{4 \\times 5} = 2 \\times 2\\sqrt{5} = 4\\sqrt{5}$\n> 2. Sederhanakan $\\sqrt{45}$:\n>    $\\sqrt{45} = \\sqrt{9 \\times 5} = 3\\sqrt{5}$\n> 3. Gabungkan suku-suku sejenis:\n>    $4\\sqrt{5} - 3\\sqrt{5} + 3\\sqrt{5} = (4 - 3 + 3)\\sqrt{5} = 4\\sqrt{5}$\n> Jadi, jawaban yang tepat adalah **B ($4\\sqrt{5}$)**.\n\n---\n\n### Contoh Soal Latihan 2:\nBentuk rasional dari $\\frac{10}{\\sqrt{5}}$ adalah ...\n- A. $2\\sqrt{5}$\n- B. $5\\sqrt{2}$\n- C. $10\\sqrt{5}$\n- D. $2$\n\n> **Kunci Jawaban:** **A**\n>\n> **Pembahasan Lengkap:**\n> 1. Kalikan pembilang dan penyebut dengan $\\sqrt{5}$:\n>    $\\frac{10}{\\sqrt{5}} \\times \\frac{\\sqrt{5}}{\\sqrt{5}} = \\frac{10\\sqrt{5}}{5}$\n> 2. Bagi koefisien 10 dengan 5:\n>    $\\frac{10}{5}\\sqrt{5} = 2\\sqrt{5}$\n> Jadi, bentuk rasionalnya adalah **A ($2\\sqrt{5}$)**.\n\n---\n\n### Contoh Soal Latihan 3:\nHasil dari $(3\\sqrt{2} + 2\\sqrt{3})(3\\sqrt{2} - 2\\sqrt{3})$ adalah ...\n- A. $6$\n- B. $12$\n- C. $18$\n- D. $30$\n\n> **Kunci Jawaban:** **A**\n>\n> **Pembahasan Lengkap:**\n> 1. Gunakan identitas aljabar selisih dua kuadrat $(a+b)(a-b) = a^2 - b^2$:\n>    $(3\\sqrt{2} + 2\\sqrt{3})(3\\sqrt{2} - 2\\sqrt{3}) = (3\\sqrt{2})^2 - (2\\sqrt{3})^2$\n> 2. Kuadratkan masing-masing suku:\n>    $(3\\sqrt{2})^2 = 3^2 \\times (\\sqrt{2})^2 = 9 \\times 2 = 18$\n>    $(2\\sqrt{3})^2 = 2^2 \\times (\\sqrt{3})^2 = 4 \\times 3 = 12$\n> 3. Kurangkan kedua hasil:\n>    $18 - 12 = 6$\n> Jadi, jawaban yang tepat adalah **A ($6$)**."
    },
    {
      urutan: 3,
      judul: "Notasi Ilmiah (Bentuk Baku), Aplikasi Kontekstual & Rangkuman Bab 1",
      durasiMenit: 20,
      konten_markdown: "# Notasi Ilmiah dan Penerapan Nyata Eksponen\n\nHalo Sobat Belajar! Tahukah kamu seberapa jauh jarak bumi ke matahari? Jaraknya sekitar $149.600.000.000\\text{ meter}$. Jika ditulis secara konvensional, angka-angka tersebut sangat panjang dan rawan salah tulis. Di sinilah **Notasi Ilmiah (Bentuk Baku)** hadir sebagai solusi cerdas!\n\n---\n\n## 1. Pengertian Notasi Ilmiah (Bentuk Baku)\n\nBentuk umum notasi ilmiah adalah:\n$a \\times 10^n$\n\nDengan syarat:\n1. **$1 \\leq a < 10$**\n2. **$n$** adalah bilangan bulat.\n\n---\n\n## 2. Aturan Mengubah Bilangan ke Bentuk Baku\n\n- **Bilangan Besar ($A \\geq 10$):** Geser koma ke kiri, pangkat bertanda positif ($+n$).\n  *Contoh:* $150.000.000 = 1,5 \\times 10^8$.\n- **Bilangan Kecil ($0 < A < 1$):** Geser koma ke kanan, pangkat bertanda negatif ($-n$).\n  *Contoh:* $0,0000045 = 4,5 \\times 10^{-6}$.\n\n---\n\n## 3. 📝 Contoh Soal Kontekstual & Aplikasi Nyata Eksponen\n\n### Contoh Soal 1 (Pertumbuhan Populasi Bakteri / Pembelahan Sel):\n*Di sebuah laboratorium biologi, suatu koloni bakteri membelah diri menjadi 2 setiap 20 menit. Jika pada awal pengamatan terdapat 100 bakteri, berapakah jumlah bakteri setelah 2 jam?*\n\n**Langkah Pengerjaan:**\n1. Waktu total $= 2\\text{ jam} = 120\\text{ menit}$.\n2. Frekuensi pembelahan ($n$) $= \\frac{120}{20} = 6\\text{ kali}$.\n3. Rumus pertumbuhan eksponensial:\n   $P_n = P_0 \\times 2^n = 100 \\times 2^6 = 100 \\times 64 = 6.400\\text{ bakteri}$\n\n---\n\n## 🎯 Contoh Soal Latihan Mandiri & Pembahasan Lengkap\n\n### Contoh Soal Latihan 1:\nBentuk baku dari bilangan $0,0000000678$ adalah ...\n- A. $6,78 \\times 10^{-7}$\n- B. $6,78 \\times 10^{-8}$\n- C. $67,8 \\times 10^{-9}$\n- D. $6,78 \\times 10^8$\n\n> **Kunci Jawaban:** **B**\n>\n> **Pembahasan Lengkap:**\n> 1. Pindahkan tanda koma ke kanan hingga berada tepat di belakang angka bukan nol yang pertama (antara angka 6 dan 7).\n> 2. Hitung jumlah pergeseran koma ke kanan, yaitu sebanyak 8 langkah.\n> 3. Karena digeser ke kanan pada bilangan kecil, pangkat 10 bertanda negatif: $-8$.\n> Maka bentuk bakunya adalah **B ($6,78 \\times 10^{-8}$)**.\n\n---\n\n### Contoh Soal Latihan 2:\nSebuah partikel berukuran $2,4 \\times 10^{-5}\\text{ cm}$. Jika dilihat di bawah mikroskop dengan perbesaran $500$ kali, ukuran partikel yang tampak adalah ...\n- A. $1,2 \\times 10^{-2}\\text{ cm}$\n- B. $1,2 \\times 10^{-3}\\text{ cm}$\n- C. $7,4 \\times 10^{-2}\\text{ cm}$\n- D. $1,2 \\times 10^3\\text{ cm}$\n\n> **Kunci Jawaban:** **A**\n>\n> **Pembahasan Lengkap:**\n> 1. Kalikan ukuran partikel dengan faktor perbesaran:\n>    $\\text{Ukuran} = (2,4 \\times 10^{-5}) \\times 500$\n> 2. Ubah 500 ke bentuk baku $5 \\times 10^2$:\n>    $= (2,4 \\times 5) \\times (10^{-5} \\times 10^2) = 12 \\times 10^{-3}$\n> 3. Ubah $12$ menjadi $1,2 \\times 10^1$:\n>    $= 1,2 \\times 10^1 \\times 10^{-3} = 1,2 \\times 10^{-2}\\text{ cm}$\n> Jadi, ukuran partikel adalah **A ($1,2 \\times 10^{-2}\\text{ cm}$)**.\n\n---\n\n### Contoh Soal Latihan 3:\nDiketahui $a = 2\\sqrt{3}$ dan $b = 3\\sqrt{2}$. Nilai dari $a^2 + b^2$ adalah ...\n- A. $24$\n- B. $30$\n- C. $36$\n- D. $42$\n\n> **Kunci Jawaban:** **B**\n>\n> **Pembahasan Lengkap:**\n> 1. Hitung $a^2 = (2\\sqrt{3})^2 = 2^2 \\times (\\sqrt{3})^2 = 4 \\times 3 = 12$.\n> 2. Hitung $b^2 = (3\\sqrt{2})^2 = 3^2 \\times (\\sqrt{2})^2 = 9 \\times 2 = 18$.\n> 3. Jumlahkan keduanya:\n>    $a^2 + b^2 = 12 + 18 = 30$\n> Jadi, jawaban yang tepat adalah **B ($30$)**."
    }
  ];
}

function getRelasiFungsiModules(kelas: number): TextbookModule[] {
  return [
    {
      urutan: 1,
      judul: "Pengertian Relasi, Representasi Diagram & Mengenal Fungsi (Pemetaan)",
      durasiMenit: 20,
      konten_markdown: "# Mengenal Relasi dan Fungsi (Pemetaan)\n\nHalo Sobat Belajar! Fungsi (Pemetaan) adalah relasi khusus di mana setiap anggota domain dipasangkan dengan tepat satu anggota kodomain.\n\n---\n\n## 🎯 Contoh Soal Latihan Mandiri & Pembahasan Lengkap\n\n### Contoh Soal Latihan 1:\nDi antara himpunan pasangan berurutan berikut, manakah yang merupakan fungsi?\n- A. $\\{(1, a), (1, b), (2, c)\\}$\n- B. $\\{(1, a), (2, a), (3, a)\\}$\n- C. $\\{(1, a), (2, b), (2, c)\\}$\n- D. $\\{(1, a), (3, b), (1, c)\\}$\n\n> **Kunci Jawaban:** **B**\n>\n> **Pembahasan Lengkap:**\n> Syarat fungsi: Setiap anggota pertama (domain) hanya boleh muncul tepat satu kali (tidak boleh mendua/bercabang).\n> - Pada pilihan B: Domain $\\{1, 2, 3\\}$ masing-masing muncul tepat satu kali.\n> - Pada pilihan A, C, dan D terdapat anggota domain yang bercabang.\n> Jadi, jawaban yang tepat adalah **B**.\n\n---\n\n### Contoh Soal Latihan 2:\nDiketahui $A = \\{\\text{faktor dari } 6\\}$ dan $B = \\{\\text{faktor prima dari } 10\\}$. Banyak pemetaan yang mungkin dari $B$ ke $A$ adalah ...\n- A. $8$\n- B. $16$\n- C. $64$\n- D. $81$\n\n> **Kunci Jawaban:** **B**\n>\n> **Pembahasan Lengkap:**\n> 1. Anggota $A = \\{1, 2, 3, 6\\} \\implies n(A) = 4$.\n> 2. Anggota $B = \\{2, 5\\} \\implies n(B) = 2$.\n> 3. Rumus banyak pemetaan dari $B$ ke $A$ adalah:\n>    $[n(A)]^{n(B)} = 4^2 = 16$\n> Jadi, jawaban yang tepat adalah **B ($16$)**."
    },
    {
      urutan: 2,
      judul: "Notasi Fungsi, Menghitung Nilai Fungsi & Menentukan Rumus Fungsi $f(x) = ax + b$",
      durasiMenit: 25,
      konten_markdown: "# Notasi dan Nilai Fungsi Aljabar\n\nHalo Sobat Belajar! \n\n---\n\n## 🎯 Contoh Soal Latihan Mandiri & Pembahasan Lengkap\n\n### Contoh Soal Latihan 1:\nDiketahui $g(x) = 5 - 2x$. Bayangan dari $-4$ oleh fungsi $g$ adalah ...\n- A. $-13$\n- B. $-3$\n- C. $13$\n- D. $18$\n\n> **Kunci Jawaban:** **C**\n>\n> **Pembahasan Lengkap:**\n> Substitusikan $x = -4$ ke dalam rumus fungsi $g(x)$:\n> $g(-4) = 5 - 2(-4) = 5 + 8 = 13$\n> Jadi, bayangan dari $-4$ adalah **C ($13$)**.\n\n---\n\n### Contoh Soal Latihan 2:\nSuatu fungsi dirumuskan $f(x) = ax + b$. Jika $f(3) = 11$ dan $f(1) = 5$, maka nilai dari $a + b$ adalah ...\n- A. $5$\n- B. $6$\n- C. $7$\n- D. $8$\n\n> **Kunci Jawaban:** **A**\n>\n> **Pembahasan Lengkap:**\n> Perhatikan bahwa $f(1) = a(1) + b = a + b$.\n> Karena pada soal langsung diketahui bahwa $f(1) = 5$, maka:\n> $a + b = 5$\n> Jadi, jawaban yang tepat adalah **A ($5$)**."
    },
    {
      urutan: 3,
      judul: "Korespondensi Satu-Satu & Rangkuman Bab 4",
      durasiMenit: 20,
      konten_markdown: "# Korespondensi Satu-Satu dan Rangkuman Bab 4\n\nHalo Sobat Belajar! Korespondensi satu-satu mensyaratkan $n(A) = n(B) = n$, dengan banyaknya kemungkinan $n!$.\n\n---\n\n## 🎯 Contoh Soal Latihan Mandiri & Pembahasan Lengkap\n\n### Contoh Soal Latihan 1:\nHubungan berikut yang merupakan korespondensi satu-satu dalam kehidupan nyata adalah ...\n- A. Siswa dengan makanan kesukaannya\n- B. Pasien rumah sakit dengan penyakitnya\n- C. Negara dengan lagu kebangsaannya\n- D. Guru dengan murid di sekolah\n\n> **Kunci Jawaban:** **C**\n>\n> **Pembahasan Lengkap:**\n> Satu negara hanya memiliki tepat satu lagu kebangsaan resmi, dan satu lagu kebangsaan resmi hanya dimiliki oleh tepat satu negara. Ini memenuhi relasi timbal balik satu-ke-satu.\n> Jadi, jawaban yang tepat adalah **C**.\n\n---\n\n### Contoh Soal Latihan 2:\nJika $n(A) = n(B) = 4$, banyak korespondensi satu-satu yang mungkin terjadi adalah ...\n- A. $8$\n- B. $16$\n- C. $24$\n- D. $64$\n\n> **Kunci Jawaban:** **C**\n>\n> **Pembahasan Lengkap:**\n> Rumus banyak korespondensi satu-satu:\n> $n! = 4! = 4 \\times 3 \\times 2 \\times 1 = 24$\n> Jadi, jawaban yang tepat adalah **C ($24$)**."
    }
  ];
}

function getPersamaanGarisLurusModules(kelas: number): TextbookModule[] {
  return [
    {
      urutan: 1,
      judul: "Bentuk Umum Persamaan Garis Lurus & Kemiringan Garis (Gradien $m$)",
      durasiMenit: 20,
      konten_markdown: "# Bentuk Umum PGL dan Konsep Kemiringan Garis (Gradien)\n\nHalo Sobat Belajar! Gradien adalah tingkat kemiringan garis:\n$m = \\frac{y_2 - y_1}{x_2 - x_1} \\quad \\text{atau} \\quad m = -\\frac{A}{B}$\n\n---\n\n## 🎯 Contoh Soal Latihan Mandiri & Pembahasan Lengkap\n\n### Contoh Soal Latihan 1:\nGradien dari persamaan garis $3x - 6y + 12 = 0$ adalah ...\n- A. $-2$\n- B. $-\\frac{1}{2}$\n- C. $\\frac{1}{2}$\n- D. $2$\n\n> **Kunci Jawaban:** **C**\n>\n> **Pembahasan Lengkap:**\n> Bentuk $Ax + By + C = 0$ memiliki $A = 3$ dan $B = -6$.\n> Rumus gradien:\n> $m = -\\frac{A}{B} = -\\frac{3}{-6} = \\frac{1}{2}$\n> Jadi, gradien garis tersebut adalah **C ($\\frac{1}{2}$)**.\n\n---\n\n### Contoh Soal Latihan 2:\nGaris yang melalui titik $(3, 5)$ dan $(7, 13)$ memiliki gradien sebesar ...\n- A. $2$\n- B. $3$\n- C. $4$\n- D. $5$\n\n> **Kunci Jawaban:** **A**\n>\n> **Pembahasan Lengkap:**\n> $m = \\frac{y_2 - y_1}{x_2 - x_1} = \\frac{13 - 5}{7 - 3} = \\frac{8}{4} = 2$\n> Jadi, gradien garis adalah **A ($2$)**."
    },
    {
      urutan: 2,
      judul: "Menyusun Persamaan Garis Lurus (Melalui 1 Titik & 2 Titik)",
      durasiMenit: 25,
      konten_markdown: "# Menyusun Persamaan Garis Lurus\n\nHalo Sobat Belajar! \n\nRumus melalui 1 titik bergradien $m$:\n$y - y_1 = m(x - x_1)$\n\n---\n\n## 🎯 Contoh Soal Latihan Mandiri & Pembahasan Lengkap\n\n### Contoh Soal Latihan 1:\nPersamaan garis yang bergradien $-3$ dan melalui titik $(0, 4)$ adalah ...\n- A. $y = -3x + 4$\n- B. $y = 3x + 4$\n- C. $y = -3x - 4$\n- D. $3x + y + 4 = 0$\n\n> **Kunci Jawaban:** **A**\n>\n> **Pembahasan Lengkap:**\n> Titik $(0, 4)$ adalah titik potong dengan sumbu Y ($c = 4$).\n> Bentuk eksplisit $y = mx + c$ langsung menjadi:\n> $y = -3x + 4$\n> Jadi, jawaban yang tepat adalah **A ($y = -3x + 4$)**.\n\n---\n\n### Contoh Soal Latihan 2:\nPersamaan garis yang melalui titik $(2, 3)$ dan $(4, 7)$ adalah ...\n- A. $y = 2x - 1$\n- B. $y = 2x + 1$\n- C. $y = x + 1$\n- D. $y = 3x - 3$\n\n> **Kunci Jawaban:** **A**\n>\n> **Pembahasan Lengkap:**\n> 1. Cari gradien: $m = \\frac{7 - 3}{4 - 2} = \\frac{4}{2} = 2$.\n> 2. Susun persamaan menggunakan titik $(2, 3)$:\n>    $y - 3 = 2(x - 2) \\implies y - 3 = 2x - 4 \\implies y = 2x - 1$\n> Jadi, jawaban yang tepat adalah **A ($y = 2x - 1$)**."
    },
    {
      urutan: 3,
      judul: "Hubungan Dua Garis (Sejajar & Tegak Lurus), Aplikasi Tarif & Rangkuman",
      durasiMenit: 20,
      konten_markdown: "# Hubungan Dua Garis Lurus dan Rangkuman Bab 5\n\nHalo Sobat Belajar! \n- Garis sejajar: $m_1 = m_2$\n- Garis tegak lurus: $m_1 \\times m_2 = -1$\n\n---\n\n## 3. 📝 Contoh Soal Aplikasi Tarif Taksi Online dan Pembahasan Lengkap\n\n### Contoh Soal:\n*Sebuah layanan taksi online mematok tarif buka pintu $\\text{Rp}10.000$ dan tarif $\\text{Rp}4.000$ per km. Jika jarak tempuh $15\\text{ km}$, total biaya adalah:*\n$y = 4.000(15) + 10.000 = 60.000 + 10.000 = \\text{Rp}70.000$\n\n---\n\n## 🎯 Contoh Soal Latihan Mandiri & Pembahasan Lengkap\n\n### Contoh Soal Latihan 1:\nPersamaan garis yang melalui titik $(1, 2)$ dan sejajar dengan garis $y = 3x - 5$ adalah ...\n- A. $y = 3x - 1$\n- B. $y = 3x + 1$\n- C. $y = -3x + 5$\n- D. $y = 3x - 5$\n\n> **Kunci Jawaban:** **A**\n>\n> **Pembahasan Lengkap:**\n> 1. Garis sejajar memiliki gradien sama: $m_2 = m_1 = 3$.\n> 2. Rumus garis melalui titik $(1, 2)$:\n>    $y - 2 = 3(x - 1) \\implies y - 2 = 3x - 3 \\implies y = 3x - 1$\n> Jadi, jawaban yang tepat adalah **A ($y = 3x - 1$)**.\n\n---\n\n### Contoh Soal Latihan 2:\nGradien garis yang tegak lurus dengan garis $2x - 4y + 8 = 0$ adalah ...\n- A. $\\frac{1}{2}$\n- B. $-\\frac{1}{2}$\n- C. $2$\n- D. $-2$\n\n> **Kunci Jawaban:** **D**\n>\n> **Pembahasan Lengkap:**\n> 1. Cari gradien garis pertama: $m_1 = -\\frac{2}{-4} = \\frac{1}{2}$.\n> 2. Syarat tegak lurus: $m_1 \\times m_2 = -1 \\implies \\frac{1}{2} \\times m_2 = -1 \\implies m_2 = -2$.\n> Jadi, jawaban yang tepat adalah **D ($-2$)**."
    }
  ];
}

function getTransformasiGeometriModules(kelas: number): TextbookModule[] {
  return [
    {
      urutan: 1,
      judul: "Translasi (Pergeseran) & Refleksi (Pencerminan)",
      durasiMenit: 20,
      konten_markdown: `# Modul 1: Translasi dan Refleksi pada Koordinat Kartesius
`
    },
    {
      urutan: 2,
      judul: "Rotasi (Perputaran) & Dilatasi (Perbesaran/Pengecilan)",
      durasiMenit: 25,
      konten_markdown: `# Modul 2: Rotasi dan Dilatasi Bangun Geometri
`
    },
    {
      urutan: 3,
      judul: "Komposisi Transformasi & Rancang Pola Batik",
      durasiMenit: 20,
      konten_markdown: `# Modul 3: Aplikasi Desain Grafis dan Pola Ornamen
`
    }
  ];
}

function getStatistikaModules(kelas: number): TextbookModule[] {
  return [
    {
      urutan: 1,
      judul: "Pengumpulan & Penyajian Data (Tabel Distribusi, Diagram Batang, Garis, Lingkaran)",
      durasiMenit: 20,
      konten_markdown: "# Pengumpulan dan Penyajian Data Statistika\n\nHalo Sobat Belajar! Penyajian data mencakup tabel frekuensi, diagram batang, diagram garis, dan diagram lingkaran.\n\n---\n\n## 🎯 Contoh Soal Latihan Mandiri & Pembahasan Lengkap\n\n### Contoh Soal Latihan 1:\nDalam suatu kelas terdapat 40 siswa. Sebanyak 10 siswa gemar bulu tangkis. Jika disajikan dalam diagram lingkaran, besar sudut sektor untuk bulu tangkis adalah ...\n- A. $45^\\circ$\n- B. $90^\\circ$\n- C. $100^\\circ$\n- D. $120^\\circ$\n\n> **Kunci Jawaban:** **B**\n>\n> **Pembahasan Lengkap:**\n> Rumus besar sudut sektor pada diagram lingkaran:\n> $\\text{Sudut} = \\frac{\\text{Frekuensi}}{\\text{Total Siswa}} \\times 360^\\circ$\n> $\\text{Sudut} = \\frac{10}{40} \\times 360^\\circ = \\frac{1}{4} \\times 360^\\circ = 90^\\circ$\n> Jadi, besar sudut sektornya adalah **B ($90^\\circ$)**."
    },
    {
      urutan: 2,
      judul: "Ukuran Pemusatan Data: Mean (Rata-rata), Median (Nilai Tengah), dan Modus",
      durasiMenit: 25,
      konten_markdown: "# Ukuran Pemusatan Data (Mean, Median, Modus)\n\nHalo Sobat Belajar! \n- Mean: $\\bar{x} = \\frac{\\sum x}{n}$\n- Median: Nilai tengah setelah data diurutkan.\n- Modus: Nilai dengan frekuensi terbanyak.\n\n---\n\n## 🎯 Contoh Soal Latihan Mandiri & Pembahasan Lengkap\n\n### Contoh Soal Latihan 1:\nRata-rata nilai matematika 10 siswa adalah 75. Jika nilai seorang siswa baru bernama Anton digabungkan, nilai rata-ratanya menjadi 76. Berapakah nilai Anton?\n- A. $80$\n- B. $82$\n- C. $84$\n- D. $86$\n\n> **Kunci Jawaban:** **D**\n>\n> **Pembahasan Lengkap:**\n> 1. Jumlah total nilai 10 siswa semula:\n>    $10 \\times 75 = 750$\n> 2. Jumlah total nilai setelah ditambah Anton (11 siswa):\n>    $11 \\times 76 = 836$\n> 3. Nilai Anton adalah selisih kedua total:\n>    $\\text{Nilai Anton} = 836 - 750 = 86$\n> Jadi, nilai Anton adalah **D ($86$)**.\n\n---\n\n### Contoh Soal Latihan 2:\nMedian dari data $6, 7, 8, 5, 9, 6, 7, 8$ adalah ...\n- A. $6,5$\n- B. $7,0$\n- C. $7,5$\n- D. $8,0$\n\n> **Kunci Jawaban:** **B**\n>\n> **Pembahasan Lengkap:**\n> 1. Urutkan data dari yang terkecil:\n>    $5, 6, 6, 7, 7, 8, 8, 9 \\quad (n = 8)$\n> 2. Karena $n$ genap, median adalah rata-rata data ke-4 dan ke-5:\n>    $Me = \\frac{7 + 7}{2} = 7,0$\n> Jadi, median data tersebut adalah **B ($7,0$)**."
    },
    {
      urutan: 3,
      judul: "Ukuran Penyebaran (Jangkauan, Kuartil) & Rangkuman Bab 6",
      durasiMenit: 20,
      konten_markdown: "# Ukuran Penyebaran Data dan Rangkuman Bab 6\n\nHalo Sobat Belajar! Ukuran penyebaran mencakup Jangkauan ($J = x_{\\text{maks}} - x_{\\text{min}}$) dan Kuartil ($Q_1, Q_2, Q_3$).\n\n---\n\n## 3. 📝 Contoh Soal Jangkauan & Kuartil Beserta Pembahasan Lengkap\n\n### Contoh Soal:\nDiberikan sekumpulan data nilai tugas: $5, 6, 7, 7, 8, 9, 10, 10, 12$.\nTentukan:\n1. Jangkauan ($J$)\n2. Kuartil Bawah ($Q_1$), Median ($Q_2$), dan Kuartil Atas ($Q_3$)\n3. Jangkauan Interkuartil ($QR$)\n\n**Langkah Pengerjaan:**\nData sudah terurut dengan $n = 9$ data:\n$5, 6, 7, 7, 8, 9, 10, 10, 12$\n\n1. **Jangkauan:**\n   $J = x_{\\text{maks}} - x_{\\text{min}} = 12 - 5 = 7$\n2. **Kuartil:**\n   - Median ($Q_2$) adalah data ke-5 = $8$.\n   - Data paruh bawah: $5, 6, 7, 7$. $Q_1 = \\frac{6 + 7}{2} = 6,5$.\n   - Data paruh atas: $9, 10, 10, 12$. $Q_3 = \\frac{10 + 10}{2} = 10$.\n3. **Jangkauan Interkuartil:**\n   $QR = Q_3 - Q_1 = 10 - 6,5 = 3,5$\n\n---\n\n## 🎯 Contoh Soal Latihan Mandiri & Pembahasan Lengkap\n\n### Contoh Soal Latihan 1:\nDiketahui data terurut: $3, 4, 5, 6, 7, 8, 9$. Jangkauan interkuartil dari data tersebut adalah ...\n- A. $2$\n- B. $4$\n- C. $6$\n- D. $8$\n\n> **Kunci Jawaban:** **B**\n>\n> **Pembahasan Lengkap:**\n> 1. Data sudah terurut ($n = 7$).\n> 2. Median ($Q_2$) adalah data ke-4, yaitu $6$.\n> 3. Kuartil bawah ($Q_1$) adalah nilai tengah dari kelompok data di bawah median ($3, 4, 5$), yaitu $4$.\n> 4. Kuartil atas ($Q_3$) adalah nilai tengah dari kelompok data di atas median ($7, 8, 9$), yaitu $8$.\n> 5. Jangkauan interkuartil:\n>    $QR = Q_3 - Q_1 = 8 - 4 = 4$\n> Jadi, jawaban yang tepat adalah **B ($4$)**."
    }
  ];
}

function getPeluangModules(kelas: number): TextbookModule[] {
  return [
    {
      urutan: 1,
      judul: "Ruang Sampel, Titik Sampel & Peluang Teoritik",
      durasiMenit: 20,
      konten_markdown: `# Modul 1: Ruang Sampel dan Peluang Teoritik

$$P(A) = \\frac{n(A)}{n(S)}$$
`
    },
    {
      urutan: 2,
      judul: "Peluang Empirik (Frekuensi Relatif) & Frekuensi Harapan",
      durasiMenit: 25,
      konten_markdown: `# Modul 2: Peluang Empirik dan Frekuensi Harapan

$$F_h(A) = P(A) \\times N$$
`
    },
    {
      urutan: 3,
      judul: "Aplikasi Mitigasi Risiko, Game Teori & Rangkuman",
      durasiMenit: 20,
      konten_markdown: `# Modul 3: Penerapan Probabilitas dalam Asuransi dan Cuaca
`
    }
  ];
}

// Fallback Generators
function getGenericMathModules(cleanTitle: string, kelas: number, deskripsi?: string): TextbookModule[] {
  return [
    {
      urutan: 1,
      judul: `Konsep Dasar & Definisi Matematis: ${cleanTitle}`,
      durasiMenit: 20,
      konten_markdown: `# Modul 1: Landasan Konsep & Definisi: ${cleanTitle}

> **Capaian Pembelajaran (Fase D - Kelas ${kelas})**: Peserta didik memahami teori, definisi formal, dan prinsip dasar pada topik **${cleanTitle}** secara mendalam.

---

## 1. Pengantar Kontekstual
Topik **${cleanTitle}** memiliki peranan sentral dalam kurikulum matematika untuk melatih kemampuan berpikir kritis, penalaran deduktif, dan representasi simbolik.

${deskripsi ? `*Cakupan:* ${deskripsi}\n` : ""}

---

## 2. Definisi & Struktur Utama
Pembahasan konsep mencakup pembuktian sifat-sifat matematis, notasi baku, dan keterkaitannya dengan cabang aljabar, geometri, dan analisis data.
`
    },
    {
      urutan: 2,
      judul: `Formulasi, Teorema & Contoh Soal Bertahap`,
      durasiMenit: 25,
      konten_markdown: `# Modul 2: Teorema dan Contoh Pembahasan Terperinci

## 1. Rumus Inti & Teorema
Mempelajari penurunan rumus utama dan kaidah pengerjaan matematis yang sistematis.

## 2. Contoh Soal & Pembahasan Bertahap
Menyajikan langkah-langkah solusi analitis mulai dari tingkat dasar hingga tingkat penalaran tinggi (HOTS).
`
    },
    {
      urutan: 3,
      judul: `Penerapan Nyata, Latihan Terbimbing & Rangkuman`,
      durasiMenit: 20,
      konten_markdown: `# Modul 3: Penerapan dan Rangkuman Esensial

Membahas pemodelan persoalan kehidupan sehari-hari, latihan terbimbing dengan petunjuk penyelesaian, dan poin-poin kesimpulan penting.
`
    }
  ];
}

function getTeksIklanPosterModules(cleanTitle: string, kelas: number): TextbookModule[] {
  return [
    {
      urutan: 1,
      judul: "Hakikat Iklan, Slogan, dan Poster: Perbedaan & Ciri",
      durasiMenit: 20,
      konten_markdown: `# Modul 1: Mengenal Teks Iklan, Slogan, dan Poster

> **Capaian Pembelajaran**: Mengidentifikasi unsur-unsur iklan, slogan, dan poster, membedakan fungsi persuasifnya, serta menganalisis pesan visual dan verbal.
`
    },
    {
      urutan: 2,
      judul: "Kaidah Kebahasaan Teks Persuasif & Kalimat Imperatif",
      durasiMenit: 25,
      konten_markdown: `# Modul 2: Unsur Kebahasaan Iklan dan Poster
`
    },
    {
      urutan: 3,
      judul: "Merancang Iklan Kreatif & Kampanye Sosial",
      durasiMenit: 20,
      konten_markdown: `# Modul 3: Praktik Merancang Poster dan Iklan
`
    }
  ];
}

function getArtikelIlmiahModules(cleanTitle: string, kelas: number): TextbookModule[] {
  return [
    {
      urutan: 1,
      judul: "Karakteristik Artikel Ilmiah Populer & Perbedaan dengan Ilmiah Murni",
      durasiMenit: 20,
      konten_markdown: `# Modul 1: Mengenal Artikel Ilmiah Populer
`
    },
    {
      urutan: 2,
      judul: "Fakta, Opini, Bukti Data & Kaidah Kebahasaan",
      durasiMenit: 25,
      konten_markdown: `# Modul 2: Menyusun Argumen Berbasis Fakta
`
    },
    {
      urutan: 3,
      judul: "Teknik Menulis dan Publikasi Artikel Opini Remaja",
      durasiMenit: 20,
      konten_markdown: `# Modul 3: Praktik Menulis Artikel Ilmiah Populer
`
    }
  ];
}

function getPuisiDramaModules(cleanTitle: string, kelas: number): TextbookModule[] {
  return [
    {
      urutan: 1,
      judul: "Unsur Fisik & Batin Puisi: Diksi, Rima, Majas, Tipografi",
      durasiMenit: 20,
      konten_markdown: `# Modul 1: Menyelami Keindahan Puisi dan Drama
`
    },
    {
      urutan: 2,
      judul: "Musikalisasi Puisi, Deklamasi & Pementasan Drama",
      durasiMenit: 25,
      konten_markdown: `# Modul 2: Pementasan dan Interpretasi Naskah
`
    },
    {
      urutan: 3,
      judul: "Mencipta Karya Puisi Orisinal & Rangkuman",
      durasiMenit: 20,
      konten_markdown: `# Modul 3: Praktik Berkarya Sastra
`
    }
  ];
}

function getPidatoPersuasifModules(cleanTitle: string, kelas: number): TextbookModule[] {
  return [
    {
      urutan: 1,
      judul: "Struktur Teks Pidato Persuasif & Unsur Etika Orator",
      durasiMenit: 20,
      konten_markdown: `# Modul 1: Hakikat dan Struktur Pidato Persuasif
`
    },
    {
      urutan: 2,
      judul: "Teknik Memikat Audiens: Etos, Patos, dan Logos",
      durasiMenit: 25,
      konten_markdown: `# Modul 2: Seni Mempengaruhi dan Kaidah Bahasa
`
    },
    {
      urutan: 3,
      judul: "Praktik Orasi, Intonasi, Gestur & Evaluasi Pidato",
      durasiMenit: 20,
      konten_markdown: `# Modul 3: Praktik Berpidato dan Refleksi
`
    }
  ];
}

function getTeksEksplanasiModules(cleanTitle: string, kelas: number): TextbookModule[] {
  return [
    {
      urutan: 1,
      judul: "Hakikat Teks Eksplanasi & Urutan Kronologis/Kausalitas",
      durasiMenit: 20,
      konten_markdown: `# Modul 1: Memahami Fenomena Alam dan Sosial melalui Eksplanasi
`
    },
    {
      urutan: 2,
      judul: "Konjungsi Kausalitas, Kata Kerja Pasif & Istilah Ilmiah",
      durasiMenit: 25,
      konten_markdown: `# Modul 2: Kaidah Kebahasaan Teks Eksplanasi
`
    },
    {
      urutan: 3,
      judul: "Menyusun Teks Eksplanasi Berdasarkan Data Observasi",
      durasiMenit: 20,
      konten_markdown: `# Modul 3: Praktik Menulis Teks Eksplanasi
`
    }
  ];
}

function getTeksFiksiCeritaModules(cleanTitle: string, kelas: number): TextbookModule[] {
  return [
    {
      urutan: 1,
      judul: "Unsur Intrinsik & Ekstrinsik Karya Fiksi (Cerpen/Novel)",
      durasiMenit: 20,
      konten_markdown: `# Modul 1: Menjelajahi Struktur Karya Fiksi
`
    },
    {
      urutan: 2,
      judul: "Karakterisasi Tokoh, Alur Plot & Sudut Pandang",
      durasiMenit: 25,
      konten_markdown: `# Modul 2: Teknik Menghidupkan Cerita Fiksi
`
    },
    {
      urutan: 3,
      judul: "Mengulas (Resensi) Karya Fiksi & Menulis Cerita Pendek",
      durasiMenit: 20,
      konten_markdown: `# Modul 3: Apresiasi dan Penulisan Karya Fiksi
`
    }
  ];
}

function getGenericBahasaIndonesiaModules(cleanTitle: string, kelas: number, deskripsi?: string): TextbookModule[] {
  return [
    {
      urutan: 1,
      judul: `Konsep Dasar, Tujuan & Struktur Teks: ${cleanTitle}`,
      durasiMenit: 20,
      konten_markdown: `# Modul 1: Konsep dan Struktur: ${cleanTitle}

> **Capaian Pembelajaran Bahasa Indonesia (Fase D - Kelas ${kelas})**: Peserta didik mampu mengidentifikasi ide pokok, struktur penulisan, dan tujuan komunikatif dari teks **${cleanTitle}**.

---

## 1. Pengantar Konsep
${deskripsi ? `*Deskripsi:* ${deskripsi}\n\n` : ""}
Dalam pembelajaran Bahasa Indonesia, pemahaman mendalam terhadap **${cleanTitle}** memperkuat keterampilan membaca kritis, menyimak, serta memproduksi teks yang efektif dan santun.
`
    },
    {
      urutan: 2,
      judul: `Ciri Kebahasaan, Diksi & Analisis Contoh Teks`,
      durasiMenit: 25,
      konten_markdown: `# Modul 2: Kaidah Kebahasaan dan Analisis Teks

Mempelajari pilihan kata (diksi), ejaan bahasa Indonesia yang disempurnakan (EYD V), tanda baca, serta kalimat efektif.
`
    },
    {
      urutan: 3,
      judul: `Praktik Menulis, Menyunting & Rangkuman Materi`,
      durasiMenit: 20,
      konten_markdown: `# Modul 3: Praktik Berkarya dan Rangkuman Esensial
`
    }
  ];
}

function getUniversalTextbookModules(cleanTitle: string, mapel: string, kelas: number, deskripsi?: string): TextbookModule[] {
  return [
    {
      urutan: 1,
      judul: `Konsep Dasar & Tujuan Pembelajaran: ${cleanTitle}`,
      durasiMenit: 20,
      konten_markdown: `# Modul 1: Landasan Konsep: ${cleanTitle}

> **Mata Pelajaran**: ${mapel} • Kelas ${kelas} (Fase D)

---

## 1. Capaian Pembelajaran & Apersepsi
Materi **${cleanTitle}** bertujuan untuk membekali peserta didik dengan pemahaman menyeluruh terhadap konsep inti yang dipelajari.

${deskripsi ? `*Tinjauan Materi:* ${deskripsi}\n` : ""}
`
    },
    {
      urutan: 2,
      judul: `Pendalaman Materi, Studi Kasus & Contoh Terbimbing`,
      durasiMenit: 25,
      konten_markdown: `# Modul 2: Pendalaman Materi dan Analisis Kasus

Pembahasan komprehensif mengenai metode, kaidah, studi kasus, serta contoh penerapan praktis.
`
    },
    {
      urutan: 3,
      judul: `Aplikasi Nyata, Latihan Terbimbing & Rangkuman`,
      durasiMenit: 20,
      konten_markdown: `# Modul 3: Penerapan dan Rangkuman Esensial
`
    }
  ];
}
