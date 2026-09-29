const { Client } = require('pg');

const client = new Client({
  host: 'aws-0-ap-southeast-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.mtpnbviztquitgszrfel',
  password: 'programermudaindonesia',
  ssl: { rejectUnauthorized: false }
});

// ============================================================================
// DATA MATERI RUANGGURU LENGKAP: MATEMATIKA KELAS 8 (BAB 1 S.D. BAB 6)
// Setiap latihan akhir kini berupa CONTOH SOAL LATIHAN DENGAN PEMBAHASAN LENGKAP
// ============================================================================

const MATERI_KELAS_8 = [
  // --------------------------------------------------------------------------
  // BAB 1: BILANGAN BERPANGKAT (ID: 5f649043-e4b7-4d11-a353-991b07a77d5c)
  // --------------------------------------------------------------------------
  {
    bab_id: '5f649043-e4b7-4d11-a353-991b07a77d5c',
    modules: [
      {
        urutan: 1,
        judul: 'Pengertian Eksponen, Bentuk Umum & 8 Sifat Operasi Bilangan Berpangkat',
        konten_markdown: `# Pengertian Eksponen (Bilangan Berpangkat)

Eksponen adalah bilangan berpangkat, yakni **bilangan yang dikalikan dengan dirinya sendiri hingga beberapa tingkat**. Notasi pangkat digunakan untuk menuliskan berapa kali suatu bilangan dikalikan secara berulang dalam bentuk yang lebih sederhana.

Misalnya, kita memiliki faktor $a$ yang dikalikan berulang sebanyak tiga kali, maka dapat ditulis:
$$a^3 = a \\times a \\times a$$

Angka 3 dituliskan di sebelah kanan atas $a$, yang menunjukkan bahwa angka 3 ini merupakan pangkat dari $a$.

Contohnya:
$$2^3 = 2 \\times 2 \\times 2 = 8$$

---

## Bentuk Umum Bilangan Berpangkat

Secara umum, perkalian berulang dari bilangan $a$ sebanyak $n$ faktor dirumuskan sebagai berikut:

$$a^n = \\underbrace{a \\times a \\times a \\times \\dots \\times a}_{n \\text{ kali}}$$

Di mana:
- **$a$** disebut sebagai **bilangan pokok (basis)**
- **$n$** disebut sebagai **bilangan pangkat (eksponen)**

Bilangan berpangkat bisa terdiri atas bilangan dengan **pangkat bulat positif** (bilangan asli), bilangan dengan **pangkat bulat negatif**, bilangan dengan **pangkat nol**, bilangan dengan **pangkat rasional**, dan bilangan dengan **pangkat riil**.

---

## Sifat-Sifat Eksponen (Bilangan Berpangkat)

Bilangan berpangkat atau eksponen memiliki sifat-sifat yang perlu kamu pahami agar kamu bisa menyelesaikan **persamaan eksponen** maupun pertidaksamaan eksponen dengan lebih mudah. Ada **8 sifat eksponen** utama yang menjadi kunci perhitungan aljabar. *Cus, kita bahas satu per satu!*

### 1. Perkalian Bilangan Berpangkat dengan Basis Sama
Jika dua bilangan berpangkat dengan basis yang sama dikalikan, maka pangkatnya dijumlahkan:
$$a^m \\times a^n = a^{m+n}$$

*Contoh:*
$$2^3 \\times 2^4 = 2^{3+4} = 2^7 = 128$$

### 2. Pembagian Bilangan Berpangkat dengan Basis Sama
Jika dua bilangan berpangkat dengan basis yang sama dibagi, maka pangkatnya dikurangkan:
$$\\frac{a^m}{a^n} = a^{m-n} \\quad (a \\neq 0)$$

*Contoh:*
$$\\frac{5^6}{5^2} = 5^{6-2} = 5^4 = 625$$

### 3. Pangkat dari Suatu Bilangan Berpangkat
Jika bilangan berpangkat dipangkatkan lagi, maka pangkat-pangkatnya dikalikan:
$$(a^m)^n = a^{m \\cdot n}$$

*Contoh:*
$$(3^2)^3 = 3^{2 \\times 3} = 3^6 = 729$$

### 4. Pangkat dari Perkalian Bilangan
Perkalian dua bilangan yang dipangkatkan sama dengan perkalian dari masing-masing bilangan yang dipangkatkan:
$$(a \\cdot b)^m = a^m \\cdot b^m$$

*Contoh:*
$$(2 \\times 3)^3 = 2^3 \\times 3^3 = 8 \\times 27 = 216$$

### 5. Pangkat dari Pembagian (Pecahan)
Pembagian bilangan yang dipangkatkan sama dengan pembagian masing-masing bilangan berpangkat tersebut:
$$\\left(\\frac{a}{b}\\right)^m = \\frac{a^m}{b^m} \\quad (b \\neq 0)$$

*Contoh:*
$$\\left(\\frac{2}{3}\\right)^4 = \\frac{2^4}{3^4} = \\frac{16}{81}$$

### 6. Pangkat Bulat Negatif
Bilangan berpangkat negatif sama dengan satu per bilangan berpangkat positif:
$$a^{-n} = \\frac{1}{a^n} \\quad (a \\neq 0)$$

*Contoh:*
$$4^{-2} = \\frac{1}{4^2} = \\frac{1}{16}$$

### 7. Pangkat Pecahan dan Bentuk Akar
Pangkat berbentuk pecahan dapat diubah menjadi bentuk akar, di mana penyebut menjadi indeks akar dan pembilang menjadi pangkat di dalam akar:
$$\\sqrt[n]{a^m} = a^{\\frac{m}{n}}$$

*Contoh:*
$$\\sqrt[3]{8^2} = 8^{\\frac{2}{3}} = (2^3)^{\\frac{2}{3}} = 2^{3 \\times \\frac{2}{3}} = 2^2 = 4$$

### 8. Pangkat Nol
Setiap bilangan riil bukan nol yang dipangkatkan dengan nol hasilnya selalu sama dengan 1:
$$a^0 = 1 \\quad (a \\neq 0)$$

*Contoh:*
$$999^0 = 1, \\quad (-7)^0 = 1, \\quad \\left(\\frac{3}{5}\\right)^0 = 1$$

---

## 💡 Pojok Penting & Awas Jebakan Miskonsepsi!

> ⚠️ **Awas Jebakan Minus!**
> Perhatikan letak tanda kurung:
> - $(-3)^2 = (-3) \\times (-3) = +9$ (tanda minus ikut dipangkatkan)
> - $-3^2 = -(3 \\times 3) = -9$ (yang dipangkatkan hanya angka 3)
>
> ⚠️ **Awas Penjumlahan Basis Sama!**
> $2^3 + 2^4 \\neq 2^{3+4}$. Sifat penjumlahan pangkat HANYA berlaku untuk **perkalian** ($2^3 \\times 2^4 = 2^7$). Untuk penjumlahan, hitung manual: $2^3 + 2^4 = 8 + 16 = 24$.

---

## 📝 Contoh Soal dan Pembahasan Lengkap

### Contoh Soal 1 (Level Pemahaman Konsep)
Sederhanakan bentuk operasi eksponen berikut:
$$(6a^3)^2 : 2a^4$$

**Langkah Pengerjaan:**
1. Gunakan sifat $(a \\cdot b)^m = a^m \\cdot b^m$ dan $(a^m)^n = a^{mn}$:
   $$(6a^3)^2 = 6^2 \\cdot (a^3)^2 = 36a^{3 \\times 2} = 36a^6$$
2. Lakukan pembagian dengan $2a^4$:
   $$\\frac{36a^6}{2a^4} = \\left(\\frac{36}{2}\\right) \\cdot \\left(\\frac{a^6}{a^4}\\right)$$
3. Gunakan sifat pembagian eksponen $\\frac{a^m}{a^n} = a^{m-n}$:
   $$= 18 \\cdot a^{6-4} = 18a^2$$

**Jawaban Akhir:** Bentuk sederhananya adalah **$18a^2$**.

---

### Contoh Soal 2 (Level Penerapan Campuran)
Tentukan nilai dari:
$$\\frac{2^5 \\times 3^4 \\times 2^{-2}}{2^2 \\times 3^2}$$

**Langkah Pengerjaan:**
1. Kelompokkan bilangan-bilangan yang memiliki basis sama:
   $$= \\frac{2^{5 + (-2)} \\times 3^4}{2^2 \\times 3^2} = \\frac{2^3 \\times 3^4}{2^2 \\times 3^2}$$
2. Kurangkan pangkat dari basis yang sama:
   $$= 2^{3-2} \\times 3^{4-2} = 2^1 \\times 3^2$$
3. Hitung hasil akhirnya:
   $$= 2 \\times 9 = 18$$

**Jawaban Akhir:** Nilai dari ekspresi tersebut adalah **$18$**.

---

### Contoh Soal 3 (Level Soal HOTS Aljabar)
Sederhanakan bentuk aljabar berikut ke dalam pangkat bulat positif:
$$\\left( \\frac{x^3 y^{-2}}{x^{-1} y^4} \\right)^{-2}$$

**Langkah Pengerjaan:**
1. Selesaikan terlebih dahulu bagian dalam kurung dengan mengurangkan pangkat:
   $$x^{3 - (-1)} = x^{3 + 1} = x^4$$
   $$y^{-2 - 4} = y^{-6}$$
   Maka bentuk di dalam kurung menjadi: $(x^4 y^{-6})^{-2}$
2. Kalikan pangkat luar $-2$ ke setiap pangkat di dalam kurung:
   $$(x^4)^{-2} \\cdot (y^{-6})^{-2} = x^{4 \\times (-2)} \\cdot y^{-6 \\times (-2)} = x^{-8} y^{12}$$
3. Ubah pangkat negatif menjadi pangkat positif di penyebut:
   $$x^{-8} y^{12} = \\frac{y^{12}}{x^8}$$

**Jawaban Akhir:** Hasil penyederhanaan adalah **$\\frac{y^{12}}{x^8}$**.

---

## 🎯 Contoh Soal Latihan Mandiri & Pembahasan Lengkap

Berikut adalah contoh soal latihan mandiri untuk memperdalam penguasaan konsep eksponen, lengkap dengan kunci jawaban dan pembahasan langkah demi langkah:

### Contoh Soal Latihan 1:
Nilai dari $(-2)^4 - (-2)^3$ adalah ...
- A. $8$
- B. $16$
- C. $24$
- D. $-24$

> **Kunci Jawaban:** **C**
>
> **Pembahasan Lengkap:**
> 1. Hitung nilai suku pertama: $(-2)^4 = (-2) \\times (-2) \\times (-2) \\times (-2) = 16$.
> 2. Hitung nilai suku kedua: $(-2)^3 = (-2) \\times (-2) \\times (-2) = -8$.
> 3. Lakukan operasi pengurangan:
>    $$16 - (-8) = 16 + 8 = 24$$
> Jadi, jawaban yang tepat adalah **C ($24$)**.

---

### Contoh Soal Latihan 2:
Bentuk sederhana dari $\\frac{(p^2 q^3)^4}{p^5 q^2}$ adalah ...
- A. $p^3 q^{10}$
- B. $p^3 q^8$
- C. $p^8 q^{10}$
- D. $p^{13} q^{14}$

> **Kunci Jawaban:** **A**
>
> **Pembahasan Lengkap:**
> 1. Terapkan sifat $(a^m)^n = a^{mn}$ pada bagian pembilang:
>    $$(p^2 q^3)^4 = p^{2 \\times 4} q^{3 \\times 4} = p^8 q^{12}$$
> 2. Lakukan pembagian basis sejenis dengan mengurangkan pangkatnya:
>    $$\\frac{p^8 q^{12}}{p^5 q^2} = p^{8-5} q^{12-2} = p^3 q^{10}$$
> Jadi, jawaban yang tepat adalah **A ($p^3 q^{10}$)**.

---

### Contoh Soal Latihan 3:
Jika $3^{x+1} = 81$, maka nilai dari $2x - 1$ adalah ...
- A. $3$
- B. $5$
- C. $7$
- D. $9$

> **Kunci Jawaban:** **B**
>
> **Pembahasan Lengkap:**
> 1. Samakan basis kedua ruas dengan mengubah angka $81$ ke basis $3$:
>    $$81 = 3^4$$
>    Sehingga persamaannya menjadi: $3^{x+1} = 3^4$
> 2. Karena basis sudah sama-sama $3$, maka pangkatnya harus sama:
>    $$x + 1 = 4 \\implies x = 4 - 1 = 3$$
> 3. Hitung nilai $2x - 1$ dengan mensubstitusikan $x = 3$:
>    $$2(3) - 1 = 6 - 1 = 5$$
> Jadi, jawaban yang tepat adalah **B ($5$)**.`
      },
      {
        urutan: 2,
        judul: 'Bentuk Akar, Operasi Aljabar Akar & Merasionalkan Penyebut',
        konten_markdown: `# Bentuk Akar dan Operasi Aljabar

Halo Sobat Belajar! Setelah menguasai sifat-sifat bilangan berpangkat, kita akan melangkah ke topik yang saling berkaitan erat, yaitu **Bentuk Akar**.

---

## 1. Pengertian Bentuk Akar

Tidak semua bilangan yang berada di dalam tanda akar ($\\sqrt{\\phantom{x}}$) disebut sebagai bentuk akar. 

> **Definisi:**
> **Bentuk akar** adalah akar dari suatu bilangan rasional yang hasilnya merupakan **bilangan irasional** (bilangan yang tidak dapat dinyatakan dalam bentuk pecahan $\\frac{a}{b}$, di mana $a, b$ bilangan bulat dan $b \\neq 0$).

### Contoh Perbandingan:
- $\\sqrt{4} = 2$ $\\rightarrow$ **Bukan bentuk akar** (karena hasilnya bilangan rasional bulat $2$).
- $\\sqrt{9} = 3$ $\\rightarrow$ **Bukan bentuk akar**.
- $\\sqrt{2} = 1,41421356\\dots$ $\\rightarrow$ **Bentuk akar** (hasilnya bilangan irasional tak berujung).
- $\\sqrt{3}, \\sqrt{5}, \\sqrt{7}, \\sqrt{10}$ $\\rightarrow$ **Bentuk akar**.

---

## 2. Hubungan Bentuk Akar dan Pangkat Pecahan

Berdasarkan sifat eksponen ke-7:
$$\\sqrt[n]{a^m} = a^{\\frac{m}{n}}$$

Khusus untuk akar kuadrat (indeks akar 2), angka 2 di luar akar biasanya tidak dituliskan:
$$\\sqrt{a} = a^{\\frac{1}{2}}$$

---

## 3. Menyederhanakan Bentuk Akar

Untuk menyederhanakan bentuk akar $\\sqrt{c}$, faktorkan bilangan $c$ menjadi perkalian dua bilangan di mana salah satunya adalah **bilangan kuadrat murni** ($4, 9, 16, 25, 36, 49, 64, 81, 100, \\dots$):
$$\\sqrt{a \\times b} = \\sqrt{a} \\times \\sqrt{b}$$

### Contoh Menyederhanakan:
- $\\sqrt{12} = \\sqrt{4 \\times 3} = \\sqrt{4} \\times \\sqrt{3} = 2\\sqrt{3}$
- $\\sqrt{50} = \\sqrt{25 \\times 2} = \\sqrt{25} \\times \\sqrt{2} = 5\\sqrt{2}$
- $\\sqrt{72} = \\sqrt{36 \\times 2} = \\sqrt{36} \\times \\sqrt{2} = 6\\sqrt{2}$
- $\\sqrt{300} = \\sqrt{100 \\times 3} = 10\\sqrt{3}$

---

## 4. Operasi Aljabar pada Bentuk Akar

### A. Penjumlahan dan Pengurangan
Penjumlahan dan pengurangan bentuk akar **hanya dapat dilakukan jika bilangan di dalam akarnya sejenis (sama)**:
$$p\\sqrt{a} + q\\sqrt{a} = (p + q)\\sqrt{a}$$
$$p\\sqrt{a} - q\\sqrt{a} = (p - q)\\sqrt{a}$$

*Contoh:*
$$3\\sqrt{5} + 7\\sqrt{5} = (3 + 7)\\sqrt{5} = 10\\sqrt{5}$$
$$8\\sqrt{2} - 3\\sqrt{2} = (8 - 3)\\sqrt{2} = 5\\sqrt{2}$$

### B. Perkalian Bentuk Akar
Perkalian bentuk akar tidak mensyaratkan akar harus sejenis:
$$\\sqrt{a} \\times \\sqrt{b} = \\sqrt{a \\times b}$$
$$(p\\sqrt{a}) \\times (q\\sqrt{b}) = (p \\times q)\\sqrt{a \\times b}$$

*Contoh:*
$$2\\sqrt{3} \\times 5\\sqrt{6} = (2 \\times 5)\\sqrt{3 \\times 6} = 10\\sqrt{18} = 10\\sqrt{9 \\times 2} = 10 \\times 3\\sqrt{2} = 30\\sqrt{2}$$

---

## 5. Merasionalkan Penyebut Pecahan Bentuk Akar

Di dalam kaidah baku penulisan matematika, pecahan yang memiliki bentuk akar pada penyebutnya harus dirasionalkan dengan mengalikannya dengan bentuk sekawannya.

### Tipe 1: Pecahan Berbentuk $\\frac{a}{\\sqrt{b}}$
$$\\frac{a}{\\sqrt{b}} = \\frac{a}{\\sqrt{b}} \\times \\frac{\\sqrt{b}}{\\sqrt{b}} = \\frac{a\\sqrt{b}}{b}$$

### Tipe 2: Pecahan Berbentuk $\\frac{c}{a + \\sqrt{b}}$
$$\\frac{c}{a + \\sqrt{b}} = \\frac{c}{a + \\sqrt{b}} \\times \\frac{a - \\sqrt{b}}{a - \\sqrt{b}} = \\frac{c(a - \\sqrt{b})}{a^2 - b}$$

---

## 📝 Contoh Soal dan Pembahasan Lengkap

### Contoh Soal 1:
Sederhanakan ekspresi berikut:
$$\\sqrt{48} + \\sqrt{75} - \\sqrt{108}$$

**Langkah Pengerjaan:**
1. Faktorkan setiap bilangan ke bentuk perkalian dengan bilangan kuadrat:
   - $\\sqrt{48} = \\sqrt{16 \\times 3} = 4\\sqrt{3}$
   - $\\sqrt{75} = \\sqrt{25 \\times 3} = 5\\sqrt{3}$
   - $\\sqrt{108} = \\sqrt{36 \\times 3} = 6\\sqrt{3}$
2. Lakukan operasi penjumlahan dan pengurangan:
   $$4\\sqrt{3} + 5\\sqrt{3} - 6\\sqrt{3} = (4 + 5 - 6)\\sqrt{3} = 3\\sqrt{3}$$

**Jawaban:** Hasil sederhananya adalah **$3\\sqrt{3}$**.

---

## 🎯 Contoh Soal Latihan Mandiri & Pembahasan Lengkap

### Contoh Soal Latihan 1:
Bentuk sederhana dari $2\\sqrt{20} - \\sqrt{45} + 3\\sqrt{5}$ adalah ...
- A. $2\\sqrt{5}$
- B. $4\\sqrt{5}$
- C. $6\\sqrt{5}$
- D. $8\\sqrt{5}$

> **Kunci Jawaban:** **B**
>
> **Pembahasan Lengkap:**
> 1. Sederhanakan $\\sqrt{20}$:
>    $$2\\sqrt{20} = 2\\sqrt{4 \\times 5} = 2 \\times 2\\sqrt{5} = 4\\sqrt{5}$$
> 2. Sederhanakan $\\sqrt{45}$:
>    $$\\sqrt{45} = \\sqrt{9 \\times 5} = 3\\sqrt{5}$$
> 3. Gabungkan suku-suku sejenis:
>    $$4\\sqrt{5} - 3\\sqrt{5} + 3\\sqrt{5} = (4 - 3 + 3)\\sqrt{5} = 4\\sqrt{5}$$
> Jadi, jawaban yang tepat adalah **B ($4\\sqrt{5}$)**.

---

### Contoh Soal Latihan 2:
Bentuk rasional dari $\\frac{10}{\\sqrt{5}}$ adalah ...
- A. $2\\sqrt{5}$
- B. $5\\sqrt{2}$
- C. $10\\sqrt{5}$
- D. $2$

> **Kunci Jawaban:** **A**
>
> **Pembahasan Lengkap:**
> 1. Kalikan pembilang dan penyebut dengan $\\sqrt{5}$:
>    $$\\frac{10}{\\sqrt{5}} \\times \\frac{\\sqrt{5}}{\\sqrt{5}} = \\frac{10\\sqrt{5}}{5}$$
> 2. Bagi koefisien 10 dengan 5:
>    $$\\frac{10}{5}\\sqrt{5} = 2\\sqrt{5}$$
> Jadi, bentuk rasionalnya adalah **A ($2\\sqrt{5}$)**.

---

### Contoh Soal Latihan 3:
Hasil dari $(3\\sqrt{2} + 2\\sqrt{3})(3\\sqrt{2} - 2\\sqrt{3})$ adalah ...
- A. $6$
- B. $12$
- C. $18$
- D. $30$

> **Kunci Jawaban:** **A**
>
> **Pembahasan Lengkap:**
> 1. Gunakan identitas aljabar selisih dua kuadrat $(a+b)(a-b) = a^2 - b^2$:
>    $$(3\\sqrt{2} + 2\\sqrt{3})(3\\sqrt{2} - 2\\sqrt{3}) = (3\\sqrt{2})^2 - (2\\sqrt{3})^2$$
> 2. Kuadratkan masing-masing suku:
>    $$(3\\sqrt{2})^2 = 3^2 \\times (\\sqrt{2})^2 = 9 \\times 2 = 18$$
>    $$(2\\sqrt{3})^2 = 2^2 \\times (\\sqrt{3})^2 = 4 \\times 3 = 12$$
> 3. Kurangkan kedua hasil:
>    $$18 - 12 = 6$$
> Jadi, jawaban yang tepat adalah **A ($6$)**.`
      },
      {
        urutan: 3,
        judul: 'Notasi Ilmiah (Bentuk Baku), Aplikasi Kontekstual & Rangkuman Bab 1',
        konten_markdown: `# Notasi Ilmiah dan Penerapan Nyata Eksponen

Halo Sobat Belajar! Tahukah kamu seberapa jauh jarak bumi ke matahari? Jaraknya sekitar $149.600.000.000\\text{ meter}$. Jika ditulis secara konvensional, angka-angka tersebut sangat panjang dan rawan salah tulis. Di sinilah **Notasi Ilmiah (Bentuk Baku)** hadir sebagai solusi cerdas!

---

## 1. Pengertian Notasi Ilmiah (Bentuk Baku)

Bentuk umum notasi ilmiah adalah:
$$a \\times 10^n$$

Dengan syarat:
1. **$1 \\leq a < 10$**
2. **$n$** adalah bilangan bulat.

---

## 2. Aturan Mengubah Bilangan ke Bentuk Baku

- **Bilangan Besar ($A \\geq 10$):** Geser koma ke kiri, pangkat bertanda positif ($+n$).
  *Contoh:* $150.000.000 = 1,5 \\times 10^8$.
- **Bilangan Kecil ($0 < A < 1$):** Geser koma ke kanan, pangkat bertanda negatif ($-n$).
  *Contoh:* $0,0000045 = 4,5 \\times 10^{-6}$.

---

## 3. 📝 Contoh Soal Kontekstual & Aplikasi Nyata Eksponen

### Contoh Soal 1 (Pertumbuhan Populasi Bakteri / Pembelahan Sel):
*Di sebuah laboratorium biologi, suatu koloni bakteri membelah diri menjadi 2 setiap 20 menit. Jika pada awal pengamatan terdapat 100 bakteri, berapakah jumlah bakteri setelah 2 jam?*

**Langkah Pengerjaan:**
1. Waktu total $= 2\\text{ jam} = 120\\text{ menit}$.
2. Frekuensi pembelahan ($n$) $= \\frac{120}{20} = 6\\text{ kali}$.
3. Rumus pertumbuhan eksponensial:
   $$P_n = P_0 \\times 2^n = 100 \\times 2^6 = 100 \\times 64 = 6.400\\text{ bakteri}$$

---

## 🎯 Contoh Soal Latihan Mandiri & Pembahasan Lengkap

### Contoh Soal Latihan 1:
Bentuk baku dari bilangan $0,0000000678$ adalah ...
- A. $6,78 \\times 10^{-7}$
- B. $6,78 \\times 10^{-8}$
- C. $67,8 \\times 10^{-9}$
- D. $6,78 \\times 10^8$

> **Kunci Jawaban:** **B**
>
> **Pembahasan Lengkap:**
> 1. Pindahkan tanda koma ke kanan hingga berada tepat di belakang angka bukan nol yang pertama (antara angka 6 dan 7).
> 2. Hitung jumlah pergeseran koma ke kanan, yaitu sebanyak 8 langkah.
> 3. Karena digeser ke kanan pada bilangan kecil, pangkat 10 bertanda negatif: $-8$.
> Maka bentuk bakunya adalah **B ($6,78 \\times 10^{-8}$)**.

---

### Contoh Soal Latihan 2:
Sebuah partikel berukuran $2,4 \\times 10^{-5}\\text{ cm}$. Jika dilihat di bawah mikroskop dengan perbesaran $500$ kali, ukuran partikel yang tampak adalah ...
- A. $1,2 \\times 10^{-2}\\text{ cm}$
- B. $1,2 \\times 10^{-3}\\text{ cm}$
- C. $7,4 \\times 10^{-2}\\text{ cm}$
- D. $1,2 \\times 10^3\\text{ cm}$

> **Kunci Jawaban:** **A**
>
> **Pembahasan Lengkap:**
> 1. Kalikan ukuran partikel dengan faktor perbesaran:
>    $$\\text{Ukuran} = (2,4 \\times 10^{-5}) \\times 500$$
> 2. Ubah 500 ke bentuk baku $5 \\times 10^2$:
>    $$= (2,4 \\times 5) \\times (10^{-5} \\times 10^2) = 12 \\times 10^{-3}$$
> 3. Ubah $12$ menjadi $1,2 \\times 10^1$:
>    $$= 1,2 \\times 10^1 \\times 10^{-3} = 1,2 \\times 10^{-2}\\text{ cm}$$
> Jadi, ukuran partikel adalah **A ($1,2 \\times 10^{-2}\\text{ cm}$)**.

---

### Contoh Soal Latihan 3:
Diketahui $a = 2\\sqrt{3}$ dan $b = 3\\sqrt{2}$. Nilai dari $a^2 + b^2$ adalah ...
- A. $24$
- B. $30$
- C. $36$
- D. $42$

> **Kunci Jawaban:** **B**
>
> **Pembahasan Lengkap:**
> 1. Hitung $a^2 = (2\\sqrt{3})^2 = 2^2 \\times (\\sqrt{3})^2 = 4 \\times 3 = 12$.
> 2. Hitung $b^2 = (3\\sqrt{2})^2 = 3^2 \\times (\\sqrt{2})^2 = 9 \\times 2 = 18$.
> 3. Jumlahkan keduanya:
>    $$a^2 + b^2 = 12 + 18 = 30$$
> Jadi, jawaban yang tepat adalah **B ($30$)**.`
      }
    ]
  },

  // --------------------------------------------------------------------------
  // BAB 2: TEOREMA PYTHAGORAS (ID: b4ae1851-1aa0-435f-8379-34cfe59afd6f)
  // --------------------------------------------------------------------------
  {
    bab_id: 'b4ae1851-1aa0-435f-8379-34cfe59afd6f',
    modules: [
      {
        urutan: 1,
        judul: 'Konsep Dasar Teorema Pythagoras, Pembuktian Geometris & Tripel Pythagoras',
        konten_markdown: `# Konsep Dasar Teorema Pythagoras dan Tripel Pythagoras

Halo Sobat Belajar! Teorema Pythagoras menjabarkan hubungan matematis antara panjang sisi-sisi pada segitiga siku-siku.

---

## 1. Dalil dan Rumus Teorema Pythagoras

> **Bunyi Teorema Pythagoras:**
> "Pada suatu segitiga siku-siku, kuadrat dari panjang sisi miring (hipotenusa) sama dengan jumlah kuadrat dari panjang sisi-sisi penyikunya."

Rumus hubungan Pythagoras:
$$c^2 = a^2 + b^2$$

- **Sisi miring ($c$):** $c = \\sqrt{a^2 + b^2}$
- **Sisi tegak ($a$):** $a = \\sqrt{c^2 - b^2}$
- **Sisi alas ($b$):** $b = \\sqrt{c^2 - a^2}$

---

## 2. Mengenal Tripel Pythagoras

Kombinasi tiga bilangan asli yang memenuhi persamaan $a^2 + b^2 = c^2$:
- $(3, 4, 5)$ dan kelipatannya: $(6, 8, 10), (9, 12, 15), \\dots$
- $(5, 12, 13)$ dan kelipatannya: $(10, 24, 26), \\dots$
- $(7, 24, 25)$ dan kelipatannya: $(14, 48, 50), \\dots$
- $(8, 15, 17)$ dan kelipatannya: $(16, 30, 34), \\dots$

---

## 📝 Contoh Soal dan Pembahasan Lengkap

### Contoh Soal 1:
Sebuah segitiga siku-siku memiliki alas $12\\text{ cm}$ dan sisi miring $15\\text{ cm}$. Tentukan panjang sisi tegak segitiga tersebut!

**Langkah Pengerjaan:**
$$a = \\sqrt{15^2 - 12^2} = \\sqrt{225 - 144} = \\sqrt{81} = 9\\text{ cm}$$

---

## 🎯 Contoh Soal Latihan Mandiri & Pembahasan Lengkap

### Contoh Soal Latihan 1:
Kelompok bilangan berikut yang merupakan tripel Pythagoras adalah ...
- A. $4, 5, 6$
- B. $9, 12, 15$
- C. $8, 10, 12$
- D. $10, 20, 25$

> **Kunci Jawaban:** **B**
>
> **Pembahasan Lengkap:**
> Uji rumus Pythagoras $a^2 + b^2 = c^2$:
> $$9^2 + 12^2 = 81 + 144 = 225 = 15^2$$
> Karena memenuhi dalil Pythagoras, maka $(9, 12, 15)$ adalah tripel Pythagoras (kelipatan 3 dari 3, 4, 5).
> Jadi, jawaban yang tepat adalah **B**.

---

### Contoh Soal Latihan 2:
Segitiga dengan panjang sisi $6\\text{ cm}, 8\\text{ cm},$ dan $9\\text{ cm}$ tergolong sebagai ...
- A. Segitiga siku-siku
- B. Segitiga lancip
- C. Segitiga tumpul
- D. Segitiga sama sisi

> **Kunci Jawaban:** **B**
>
> **Pembahasan Lengkap:**
> 1. Kuadrat sisi terpanjang: $9^2 = 81$.
> 2. Jumlah kuadrat dua sisi lainnya: $6^2 + 8^2 = 36 + 64 = 100$.
> 3. Karena $81 < 100$ ($c^2 < a^2 + b^2$), maka segitiga tersebut adalah **segitiga lancip**.
> Jadi, jawaban yang tepat adalah **B**.

---

### Contoh Soal Latihan 3:
Panjang sisi miring segitiga siku-siku sama kaki dengan panjang sisi penyiku $7\\text{ cm}$ adalah ...
- A. $7\\sqrt{2}\\text{ cm}$
- B. $14\\text{ cm}$
- C. $7\\sqrt{3}\\text{ cm}$
- D. $49\\text{ cm}$

> **Kunci Jawaban:** **A**
>
> **Pembahasan Lengkap:**
> Sisi miring segitiga siku-siku sama kaki berpenyiku $a$ dirumuskan:
> $$c = \\sqrt{a^2 + a^2} = \\sqrt{2a^2} = a\\sqrt{2}$$
> Dengan $a = 7\\text{ cm}$, maka $c = 7\\sqrt{2}\\text{ cm}$.
> Jadi, jawaban yang tepat adalah **A ($7\\sqrt{2}\\text{ cm}$)**.`
      },
      {
        urutan: 2,
        judul: 'Segitiga Siku-Siku Khusus (Sudut Istimewa) & Geometri Dimensi Tiga',
        konten_markdown: `# Segitiga Siku-Siku Istimewa dan Geometri Tiga Dimensi

Halo Sobat Belajar! Terdapat dua segitiga siku-siku khusus dengan rasio perbandingan sisi yang sangat khas:

---

## 1. Segitiga Siku-Siku Khusus ($45^\\circ - 45^\\circ - 90^\\circ$)
$$\\text{Alas} : \\text{Tinggi} : \\text{Hipotenusa} = 1 : 1 : \\sqrt{2}$$

## 2. Segitiga Siku-Siku Khusus ($30^\\circ - 60^\\circ - 90^\\circ$)
$$\\text{Sisi di depan } 30^\\circ : \\text{Sisi di depan } 60^\\circ : \\text{Hipotenusa } (90^\\circ) = 1 : \\sqrt{3} : 2$$

---

## 🎯 Contoh Soal Latihan Mandiri & Pembahasan Lengkap

### Contoh Soal Latihan 1:
Panjang diagonal ruang sebuah kubus dengan panjang rusuk $8\\text{ cm}$ adalah ...
- A. $8\\sqrt{2}\\text{ cm}$
- B. $8\\sqrt{3}\\text{ cm}$
- C. $16\\text{ cm}$
- D. $24\\text{ cm}$

> **Kunci Jawaban:** **B**
>
> **Pembahasan Lengkap:**
> Rumus diagonal ruang kubus dengan rusuk $s$ adalah:
> $$d_r = s\\sqrt{3}$$
> Dengan $s = 8\\text{ cm}$, maka $d_r = 8\\sqrt{3}\\text{ cm}$.
> Jadi, jawaban yang tepat adalah **B ($8\\sqrt{3}\\text{ cm}$)**.

---

### Contoh Soal Latihan 2:
Pada segitiga siku-siku dengan sudut $45^\\circ - 45^\\circ - 90^\\circ$, jika panjang sisi miringnya $10\\sqrt{2}\\text{ cm}$, maka panjang sisi siku-sikunya adalah ...
- A. $5\\text{ cm}$
- B. $10\\text{ cm}$
- C. $10\\sqrt{2}\\text{ cm}$
- D. $20\\text{ cm}$

> **Kunci Jawaban:** **B**
>
> **Pembahasan Lengkap:**
> Berdasarkan perbandingan $x : x : x\\sqrt{2}$:
> $$x\\sqrt{2} = 10\\sqrt{2} \\implies x = 10\\text{ cm}$$
> Jadi, panjang sisi siku-sikunya adalah **B ($10\\text{ cm}$)**.

---

### Contoh Soal Latihan 3:
Segitiga $ABC$ siku-siku di $B$ dengan $\\angle A = 60^\\circ$. Jika $AB = 6\\text{ cm}$, maka panjang sisi miring $AC$ adalah ...
- A. $6\\sqrt{3}\\text{ cm}$
- B. $9\\text{ cm}$
- C. $12\\text{ cm}$
- D. $12\\sqrt{3}\\text{ cm}$

> **Kunci Jawaban:** **C**
>
> **Pembahasan Lengkap:**
> Sisi $AB$ terletak di depan sudut $30^\\circ$ ($AB = x = 6\\text{ cm}$).
> Sisi miring $AC$ berada di depan sudut $90^\\circ$, dengan perbandingan $2x$:
> $$AC = 2 \\times 6 = 12\\text{ cm}$$
> Jadi, jawaban yang tepat adalah **C ($12\\text{ cm}$)**.`
      },
      {
        urutan: 3,
        judul: 'Aplikasi Kontekstual Nyata Pythagoras, Pemodelan Masalah & Rangkuman',
        konten_markdown: `# Penerapan Teorema Pythagoras dalam Pemecahan Masalah Nyata

Halo Sobat Belajar! Teorema Pythagoras sering digunakan dalam navigasi laut, konstruksi bangunan, dan kehidupan sehari-hari.

---

## 📝 Contoh Soal Penerapan Nyata dan Pembahasan Lengkap

### Contoh Soal 1: Navigasi Kapal di Laut Lepas
*Sebuah kapal berlayar dari pelabuhan A ke arah timur sejauh $80\\text{ mil}$ menuju titik B, lalu berbelok ke utara sejauh $60\\text{ mil}$ menuju pelabuhan C. Berapakah jarak terpendek dari pelabuhan A langsung ke C?*

**Pembahasan Lengkap:**
$$AC = \\sqrt{80^2 + 60^2} = \\sqrt{6.400 + 3.600} = \\sqrt{10.000} = 100\\text{ mil}$$

---

## 🎯 Contoh Soal Latihan Mandiri & Pembahasan Lengkap

### Contoh Soal Latihan 1:
Seorang anak menaikkan layang-layang dengan benang sepanjang $100\\text{ meter}$. Jika jarak anak ke titik tepat di bawah layang-layang adalah $60\\text{ meter}$, maka tinggi layang-layang adalah ...
- A. $70\\text{ meter}$
- B. $80\\text{ meter}$
- C. $90\\text{ meter}$
- D. $120\\text{ meter}$

> **Kunci Jawaban:** **B**
>
> **Pembahasan Lengkap:**
> Posisi benang, jarak tanah, dan tinggi membentuk segitiga siku-siku:
> $$\\text{Tinggi} = \\sqrt{100^2 - 60^2} = \\sqrt{10.000 - 3.600} = \\sqrt{6.400} = 80\\text{ meter}$$
> Jadi, tinggi layang-layang adalah **B ($80\\text{ meter}$)**.

---

### Contoh Soal Latihan 2:
Tiang pemancar setinggi $24\\text{ meter}$ diikat dengan kawat ke pasak tanah berjarak $10\\text{ meter}$ dari pangkal tiang. Panjang kawat tersebut adalah ...
- A. $26\\text{ meter}$
- B. $28\\text{ meter}$
- C. $30\\text{ meter}$
- D. $34\\text{ meter}$

> **Kunci Jawaban:** **A**
>
> **Pembahasan Lengkap:**
> $$\\text{Panjang kawat} = \\sqrt{24^2 + 10^2} = \\sqrt{576 + 100} = \\sqrt{676} = 26\\text{ meter}$$
> Jadi, jawaban yang tepat adalah **A ($26\\text{ meter}$)**.

---

### Contoh Soal Latihan 3:
Luas segitiga siku-siku yang memiliki panjang hipotenusa $13\\text{ cm}$ dan salah satu sisi siku-sikunya $5\\text{ cm}$ adalah ...
- A. $30\\text{ cm}^2$
- B. $60\\text{ cm}^2$
- C. $65\\text{ cm}^2$
- D. $120\\text{ cm}^2$

> **Kunci Jawaban:** **A**
>
> **Pembahasan Lengkap:**
> 1. Cari panjang sisi penyiku lainnya:
>    $$\\text{Alas} = \\sqrt{13^2 - 5^2} = \\sqrt{169 - 25} = \\sqrt{144} = 12\\text{ cm}$$
> 2. Hitung luas segitiga:
>    $$\\text{Luas} = \\frac{1}{2} \\times \\text{alas} \\times \\text{tinggi} = \\frac{1}{2} \\times 12 \\times 5 = 30\\text{ cm}^2$$
> Jadi, luas segitiga adalah **A ($30\\text{ cm}^2$)**.`
      }
    ]
  },

  // --------------------------------------------------------------------------
  // BAB 3: PLSV & PtLSV (ID: a1fb5fd1-bcf8-451b-8dcc-01f09b30c768)
  // --------------------------------------------------------------------------
  {
    bab_id: 'a1fb5fd1-bcf8-451b-8dcc-01f09b30c768',
    modules: [
      {
        urutan: 1,
        judul: 'Konsep Dasar Persamaan Linear Satu Variabel (PLSV) & Prinsip Kesetaraan',
        konten_markdown: `# Persamaan Linear Satu Variabel (PLSV)

Halo Sobat Belajar! Bentuk umum PLSV adalah:
$$ax + b = c \\quad (a \\neq 0)$$

Prinsip kesetaraan: Perlakuan pada ruas kiri harus sama persis dengan perlakuan pada ruas kanan.

---

## 📝 Contoh Soal dan Pembahasan Lengkap

### Contoh Soal:
Tentukan nilai $x$ dari persamaan $5x - 7 = 3x + 9$!

**Pembahasan Lengkap:**
$$5x - 3x = 9 + 7 \\implies 2x = 16 \\implies x = 8$$

---

## 🎯 Contoh Soal Latihan Mandiri & Pembahasan Lengkap

### Contoh Soal Latihan 1:
Nilai $x$ yang memenuhi persamaan $4(2x - 3) = 3x + 8$ adalah ...
- A. $2$
- B. $4$
- C. $5$
- D. $6$

> **Kunci Jawaban:** **B**
>
> **Pembahasan Lengkap:**
> 1. Jabarkan tanda kurung: $8x - 12 = 3x + 8$.
> 2. Pindahkan variabel $x$ ke ruas kiri dan konstanta ke ruas kanan:
>    $$8x - 3x = 8 + 12 \\implies 5x = 20$$
> 3. Bagi kedua ruas dengan 5:
>    $$x = \\frac{20}{5} = 4$$
> Jadi, jawaban yang tepat adalah **B ($4$)**.

---

### Contoh Soal Latihan 2:
Jika $3x + 5 = -7$, maka nilai dari $2x - 3$ adalah ...
- A. $-11$
- B. $-7$
- C. $-4$
- D. $5$

> **Kunci Jawaban:** **A**
>
> **Pembahasan Lengkap:**
> 1. Cari nilai $x$:
>    $$3x = -7 - 5 \\implies 3x = -12 \\implies x = -4$$
> 2. Substitusikan $x = -4$ ke bentuk $2x - 3$:
>    $$2(-4) - 3 = -8 - 3 = -11$$
> Jadi, jawaban yang tepat adalah **A ($-11$)**.

---

### Contoh Soal Latihan 3:
Persamaan berikut yang **bukan** merupakan PLSV adalah ...
- A. $2x + 5 = 11$
- B. $3y - 4 = y + 6$
- C. $x^2 - 4 = 0$
- D. $\\frac{1}{2}a + 3 = 7$

> **Kunci Jawaban:** **C**
>
> **Pembahasan Lengkap:**
> Pada persamaan $x^2 - 4 = 0$, variabel $x$ memiliki pangkat tertinggi 2 (persamaan kuadrat), bukan persamaan linear berpangkat 1.
> Jadi, jawaban yang tepat adalah **C**.`
      },
      {
        urutan: 2,
        judul: 'Pertidaksamaan Linear Satu Variabel (PtLSV) & Aturan Pembalikan Tanda',
        konten_markdown: `# Pertidaksamaan Linear Satu Variabel (PtLSV)

Halo Sobat Belajar! 

> ⚠️ **ATURAN EMAS PEMBALIKAN TANDA:**
> Jika kedua ruas pertidaksamaan dikali atau dibagi dengan bilangan negatif, tanda ketidaksamaan **wajib dibalik** ($< \\leftrightarrow >$ dan $\\leq \\leftrightarrow \\geq$).

---

## 🎯 Contoh Soal Latihan Mandiri & Pembahasan Lengkap

### Contoh Soal Latihan 1:
Himpunan penyelesaian dari $2x - 3 < 7$ untuk $x$ bilangan asli adalah ...
- A. $\\{1, 2, 3, 4\\}$
- B. $\\{1, 2, 3, 4, 5\\}$
- C. $\\{0, 1, 2, 3, 4\\}$
- D. $\\{5, 6, 7, \\dots\\}$

> **Kunci Jawaban:** **A**
>
> **Pembahasan Lengkap:**
> 1. Tambah 3 di kedua ruas: $2x < 7 + 3 \\implies 2x < 10$.
> 2. Bagi 2: $x < 5$.
> 3. Himpunan bilangan asli ($1, 2, 3, \\dots$) yang lebih kecil dari 5 adalah $\\{1, 2, 3, 4\\}$.
> Jadi, jawaban yang tepat adalah **A**.

---

### Contoh Soal Latihan 2:
Bentuk sederhana dari pertidaksamaan $-4x \\geq 20$ adalah ...
- A. $x \\geq -5$
- B. $x \\leq -5$
- C. $x \\geq 5$
- D. $x \\leq 5$

> **Kunci Jawaban:** **B**
>
> **Pembahasan Lengkap:**
> Bagi kedua ruas dengan $-4$. Karena dibagi bilangan negatif, tanda $\\geq$ dibalik menjadi $\\leq$:
> $$x \\leq \\frac{20}{-4} \\implies x \\leq -5$$
> Jadi, jawaban yang tepat adalah **B ($x \\leq -5$)**.

---

### Contoh Soal Latihan 3:
Himpunan penyelesaian dari $3(x - 2) \\leq 5x + 6$ adalah ...
- A. $x \\leq -6$
- B. $x \\geq -6$
- C. $x \\leq 6$
- D. $x \\geq 6$

> **Kunci Jawaban:** **B**
>
> **Pembahasan Lengkap:**
> 1. Buka kurung: $3x - 6 \\leq 5x + 6$.
> 2. Kumpulkan variabel: $3x - 5x \\leq 6 + 6 \\implies -2x \\leq 12$.
> 3. Bagi dengan $-2$ (tanda berbalik):
>    $$x \\geq \\frac{12}{-2} \\implies x \\geq -6$$
> Jadi, jawaban yang tepat adalah **B ($x \\geq -6$)**.`
      },
      {
        urutan: 3,
        judul: 'Aplikasi Pemodelan Soal Cerita PLSV & PtLSV dalam Kehidupan Sehari-hari',
        konten_markdown: `# Pemodelan Matematika dan Rangkuman Bab 3

Halo Sobat Belajar! Di sini kita memodelkan masalah nyata ke dalam bentuk matematika.

---

## 2. 📝 Contoh Soal Pemodelan Matematika dan Pembahasan Lengkap

### Contoh Soal 1: Masalah Geometri Persegi Panjang (PLSV)
*Sebuah kebun persegi panjang memiliki panjang $(2x - 3)\\text{ meter}$ dan lebar $(x + 1)\\text{ meter}$. Jika kelilingnya $38\\text{ meter}$, tentukan luas kebun!*

**Pembahasan Lengkap:**
$$2[(2x - 3) + (x + 1)] = 38 \\implies 2(3x - 2) = 38 \\implies 6x - 4 = 38 \\implies 6x = 42 \\implies x = 7$$
- Panjang $= 2(7) - 3 = 11\\text{ meter}$
- Lebar $= 7 + 1 = 8\\text{ meter}$
- Luas $= 11 \\times 8 = 88\\text{ m}^2$

---

## 🎯 Contoh Soal Latihan Mandiri & Pembahasan Lengkap

### Contoh Soal Latihan 1:
Umur Ayah saat ini 3 kali umur Budi. Jika selisih umur mereka adalah $30\\text{ tahun}$, berapakah umur Ayah?
- A. $35\\text{ tahun}$
- B. $40\\text{ tahun}$
- C. $45\\text{ tahun}$
- D. $50\\text{ tahun}$

> **Kunci Jawaban:** **C**
>
> **Pembahasan Lengkap:**
> 1. Misalkan umur Budi $= x$, maka umur Ayah $= 3x$.
> 2. Selisih umur mereka:
>    $$3x - x = 30 \\implies 2x = 30 \\implies x = 15\\text{ tahun}$$
> 3. Umur Ayah $= 3(15) = 45\\text{ tahun}$.
> Jadi, jawaban yang tepat adalah **C ($45\\text{ tahun}$)**.

---

### Contoh Soal Latihan 2:
Pak Anto memiliki mobil box pengangkut barang dengan daya angkut tidak lebih dari $800\\text{ kg}$. Berat Pak Anto adalah $60\\text{ kg}$ dan ia akan mengangkut kardus seberat $20\\text{ kg}$. Jumlah kardus maksimal yang dapat diangkut adalah ...
- A. $35$ kardus
- B. $37$ kardus
- C. $40$ kardus
- D. $42$ kardus

> **Kunci Jawaban:** **B**
>
> **Pembahasan Lengkap:**
> 1. Model pertidaksamaan muatan: $20x + 60 \\leq 800$.
> 2. Selesaikan pertidaksamaan:
>    $$20x \\leq 800 - 60 \\implies 20x \\leq 740 \\implies x \\leq 37$$
> Jadi, jumlah kardus maksimal yang dapat diangkut adalah **B (37 kardus)**.

---

### Contoh Soal Latihan 3:
Tiga bilangan bulat berurutan berjumlah $72$. Bilangan terbesar di antara ketiganya adalah ...
- A. $23$
- B. $24$
- C. $25$
- D. $26$

> **Kunci Jawaban:** **C**
>
> **Pembahasan Lengkap:**
> 1. Misalkan ketiga bilangan tersebut adalah $x, x+1, x+2$.
> 2. Jumlah ketiga bilangan:
>    $$x + (x+1) + (x+2) = 72 \\implies 3x + 3 = 72 \\implies 3x = 69 \\implies x = 23$$
> 3. Bilangan terbesar adalah $x + 2 = 23 + 2 = 25$.
> Jadi, jawaban yang tepat adalah **C ($25$)**.`
      }
    ]
  },

  // --------------------------------------------------------------------------
  // BAB 4: RELASI DAN FUNGSI (ID: 1fd7a8c2-079c-4044-be29-207c4c5da83b)
  // --------------------------------------------------------------------------
  {
    bab_id: '1fd7a8c2-079c-4044-be29-207c4c5da83b',
    modules: [
      {
        urutan: 1,
        judul: 'Pengertian Relasi, Representasi Diagram & Mengenal Fungsi (Pemetaan)',
        konten_markdown: `# Mengenal Relasi dan Fungsi (Pemetaan)

Halo Sobat Belajar! Fungsi (Pemetaan) adalah relasi khusus di mana setiap anggota domain dipasangkan dengan tepat satu anggota kodomain.

---

## 🎯 Contoh Soal Latihan Mandiri & Pembahasan Lengkap

### Contoh Soal Latihan 1:
Di antara himpunan pasangan berurutan berikut, manakah yang merupakan fungsi?
- A. $\\{(1, a), (1, b), (2, c)\\}$
- B. $\\{(1, a), (2, a), (3, a)\\}$
- C. $\\{(1, a), (2, b), (2, c)\\}$
- D. $\\{(1, a), (3, b), (1, c)\\}$

> **Kunci Jawaban:** **B**
>
> **Pembahasan Lengkap:**
> Syarat fungsi: Setiap anggota pertama (domain) hanya boleh muncul tepat satu kali (tidak boleh mendua/bercabang).
> - Pada pilihan B: Domain $\\{1, 2, 3\\}$ masing-masing muncul tepat satu kali.
> - Pada pilihan A, C, dan D terdapat anggota domain yang bercabang.
> Jadi, jawaban yang tepat adalah **B**.

---

### Contoh Soal Latihan 2:
Diketahui $A = \\{\\text{faktor dari } 6\\}$ dan $B = \\{\\text{faktor prima dari } 10\\}$. Banyak pemetaan yang mungkin dari $B$ ke $A$ adalah ...
- A. $8$
- B. $16$
- C. $64$
- D. $81$

> **Kunci Jawaban:** **B**
>
> **Pembahasan Lengkap:**
> 1. Anggota $A = \\{1, 2, 3, 6\\} \\implies n(A) = 4$.
> 2. Anggota $B = \\{2, 5\\} \\implies n(B) = 2$.
> 3. Rumus banyak pemetaan dari $B$ ke $A$ adalah:
>    $$[n(A)]^{n(B)} = 4^2 = 16$$
> Jadi, jawaban yang tepat adalah **B ($16$)**.`
      },
      {
        urutan: 2,
        judul: 'Notasi Fungsi, Menghitung Nilai Fungsi & Menentukan Rumus Fungsi $f(x) = ax + b$',
        konten_markdown: `# Notasi dan Nilai Fungsi Aljabar

Halo Sobat Belajar! 

---

## 🎯 Contoh Soal Latihan Mandiri & Pembahasan Lengkap

### Contoh Soal Latihan 1:
Diketahui $g(x) = 5 - 2x$. Bayangan dari $-4$ oleh fungsi $g$ adalah ...
- A. $-13$
- B. $-3$
- C. $13$
- D. $18$

> **Kunci Jawaban:** **C**
>
> **Pembahasan Lengkap:**
> Substitusikan $x = -4$ ke dalam rumus fungsi $g(x)$:
> $$g(-4) = 5 - 2(-4) = 5 + 8 = 13$$
> Jadi, bayangan dari $-4$ adalah **C ($13$)**.

---

### Contoh Soal Latihan 2:
Suatu fungsi dirumuskan $f(x) = ax + b$. Jika $f(3) = 11$ dan $f(1) = 5$, maka nilai dari $a + b$ adalah ...
- A. $5$
- B. $6$
- C. $7$
- D. $8$

> **Kunci Jawaban:** **A**
>
> **Pembahasan Lengkap:**
> Perhatikan bahwa $f(1) = a(1) + b = a + b$.
> Karena pada soal langsung diketahui bahwa $f(1) = 5$, maka:
> $$a + b = 5$$
> Jadi, jawaban yang tepat adalah **A ($5$)**.`
      },
      {
        urutan: 3,
        judul: 'Korespondensi Satu-Satu & Rangkuman Bab 4',
        konten_markdown: `# Korespondensi Satu-Satu dan Rangkuman Bab 4

Halo Sobat Belajar! Korespondensi satu-satu mensyaratkan $n(A) = n(B) = n$, dengan banyaknya kemungkinan $n!$.

---

## 🎯 Contoh Soal Latihan Mandiri & Pembahasan Lengkap

### Contoh Soal Latihan 1:
Hubungan berikut yang merupakan korespondensi satu-satu dalam kehidupan nyata adalah ...
- A. Siswa dengan makanan kesukaannya
- B. Pasien rumah sakit dengan penyakitnya
- C. Negara dengan lagu kebangsaannya
- D. Guru dengan murid di sekolah

> **Kunci Jawaban:** **C**
>
> **Pembahasan Lengkap:**
> Satu negara hanya memiliki tepat satu lagu kebangsaan resmi, dan satu lagu kebangsaan resmi hanya dimiliki oleh tepat satu negara. Ini memenuhi relasi timbal balik satu-ke-satu.
> Jadi, jawaban yang tepat adalah **C**.

---

### Contoh Soal Latihan 2:
Jika $n(A) = n(B) = 4$, banyak korespondensi satu-satu yang mungkin terjadi adalah ...
- A. $8$
- B. $16$
- C. $24$
- D. $64$

> **Kunci Jawaban:** **C**
>
> **Pembahasan Lengkap:**
> Rumus banyak korespondensi satu-satu:
> $$n! = 4! = 4 \\times 3 \\times 2 \\times 1 = 24$$
> Jadi, jawaban yang tepat adalah **C ($24$)**.`
      }
    ]
  },

  // --------------------------------------------------------------------------
  // BAB 5: PERSAMAAN GARIS LURUS (ID: 4a215311-c0b3-4cc5-8177-48eb40221f9e)
  // --------------------------------------------------------------------------
  {
    bab_id: '4a215311-c0b3-4cc5-8177-48eb40221f9e',
    modules: [
      {
        urutan: 1,
        judul: 'Bentuk Umum Persamaan Garis Lurus & Kemiringan Garis (Gradien $m$)',
        konten_markdown: `# Bentuk Umum PGL dan Konsep Kemiringan Garis (Gradien)

Halo Sobat Belajar! Gradien adalah tingkat kemiringan garis:
$$m = \\frac{y_2 - y_1}{x_2 - x_1} \\quad \\text{atau} \\quad m = -\\frac{A}{B}$$

---

## 🎯 Contoh Soal Latihan Mandiri & Pembahasan Lengkap

### Contoh Soal Latihan 1:
Gradien dari persamaan garis $3x - 6y + 12 = 0$ adalah ...
- A. $-2$
- B. $-\\frac{1}{2}$
- C. $\\frac{1}{2}$
- D. $2$

> **Kunci Jawaban:** **C**
>
> **Pembahasan Lengkap:**
> Bentuk $Ax + By + C = 0$ memiliki $A = 3$ dan $B = -6$.
> Rumus gradien:
> $$m = -\\frac{A}{B} = -\\frac{3}{-6} = \\frac{1}{2}$$
> Jadi, gradien garis tersebut adalah **C ($\\frac{1}{2}$)**.

---

### Contoh Soal Latihan 2:
Garis yang melalui titik $(3, 5)$ dan $(7, 13)$ memiliki gradien sebesar ...
- A. $2$
- B. $3$
- C. $4$
- D. $5$

> **Kunci Jawaban:** **A**
>
> **Pembahasan Lengkap:**
> $$m = \\frac{y_2 - y_1}{x_2 - x_1} = \\frac{13 - 5}{7 - 3} = \\frac{8}{4} = 2$$
> Jadi, gradien garis adalah **A ($2$)**.`
      },
      {
        urutan: 2,
        judul: 'Menyusun Persamaan Garis Lurus (Melalui 1 Titik & 2 Titik)',
        konten_markdown: `# Menyusun Persamaan Garis Lurus

Halo Sobat Belajar! 

Rumus melalui 1 titik bergradien $m$:
$$y - y_1 = m(x - x_1)$$

---

## 🎯 Contoh Soal Latihan Mandiri & Pembahasan Lengkap

### Contoh Soal Latihan 1:
Persamaan garis yang bergradien $-3$ dan melalui titik $(0, 4)$ adalah ...
- A. $y = -3x + 4$
- B. $y = 3x + 4$
- C. $y = -3x - 4$
- D. $3x + y + 4 = 0$

> **Kunci Jawaban:** **A**
>
> **Pembahasan Lengkap:**
> Titik $(0, 4)$ adalah titik potong dengan sumbu Y ($c = 4$).
> Bentuk eksplisit $y = mx + c$ langsung menjadi:
> $$y = -3x + 4$$
> Jadi, jawaban yang tepat adalah **A ($y = -3x + 4$)**.

---

### Contoh Soal Latihan 2:
Persamaan garis yang melalui titik $(2, 3)$ dan $(4, 7)$ adalah ...
- A. $y = 2x - 1$
- B. $y = 2x + 1$
- C. $y = x + 1$
- D. $y = 3x - 3$

> **Kunci Jawaban:** **A**
>
> **Pembahasan Lengkap:**
> 1. Cari gradien: $m = \\frac{7 - 3}{4 - 2} = \\frac{4}{2} = 2$.
> 2. Susun persamaan menggunakan titik $(2, 3)$:
>    $$y - 3 = 2(x - 2) \\implies y - 3 = 2x - 4 \\implies y = 2x - 1$$
> Jadi, jawaban yang tepat adalah **A ($y = 2x - 1$)**.`
      },
      {
        urutan: 3,
        judul: 'Hubungan Dua Garis (Sejajar & Tegak Lurus), Aplikasi Tarif & Rangkuman',
        konten_markdown: `# Hubungan Dua Garis Lurus dan Rangkuman Bab 5

Halo Sobat Belajar! 
- Garis sejajar: $m_1 = m_2$
- Garis tegak lurus: $m_1 \\times m_2 = -1$

---

## 3. 📝 Contoh Soal Aplikasi Tarif Taksi Online dan Pembahasan Lengkap

### Contoh Soal:
*Sebuah layanan taksi online mematok tarif buka pintu $\\text{Rp}10.000$ dan tarif $\\text{Rp}4.000$ per km. Jika jarak tempuh $15\\text{ km}$, total biaya adalah:*
$$y = 4.000(15) + 10.000 = 60.000 + 10.000 = \\text{Rp}70.000$$

---

## 🎯 Contoh Soal Latihan Mandiri & Pembahasan Lengkap

### Contoh Soal Latihan 1:
Persamaan garis yang melalui titik $(1, 2)$ dan sejajar dengan garis $y = 3x - 5$ adalah ...
- A. $y = 3x - 1$
- B. $y = 3x + 1$
- C. $y = -3x + 5$
- D. $y = 3x - 5$

> **Kunci Jawaban:** **A**
>
> **Pembahasan Lengkap:**
> 1. Garis sejajar memiliki gradien sama: $m_2 = m_1 = 3$.
> 2. Rumus garis melalui titik $(1, 2)$:
>    $$y - 2 = 3(x - 1) \\implies y - 2 = 3x - 3 \\implies y = 3x - 1$$
> Jadi, jawaban yang tepat adalah **A ($y = 3x - 1$)**.

---

### Contoh Soal Latihan 2:
Gradien garis yang tegak lurus dengan garis $2x - 4y + 8 = 0$ adalah ...
- A. $\\frac{1}{2}$
- B. $-\\frac{1}{2}$
- C. $2$
- D. $-2$

> **Kunci Jawaban:** **D**
>
> **Pembahasan Lengkap:**
> 1. Cari gradien garis pertama: $m_1 = -\\frac{2}{-4} = \\frac{1}{2}$.
> 2. Syarat tegak lurus: $m_1 \\times m_2 = -1 \\implies \\frac{1}{2} \\times m_2 = -1 \\implies m_2 = -2$.
> Jadi, jawaban yang tepat adalah **D ($-2$)**.`
      }
    ]
  },

  // --------------------------------------------------------------------------
  // BAB 6: STATISTIKA (ID: fd4ebc86-d354-4f40-a886-48a76cd0ef48)
  // --------------------------------------------------------------------------
  {
    bab_id: 'fd4ebc86-d354-4f40-a886-48a76cd0ef48',
    modules: [
      {
        urutan: 1,
        judul: 'Pengumpulan & Penyajian Data (Tabel Distribusi, Diagram Batang, Garis, Lingkaran)',
        konten_markdown: `# Pengumpulan dan Penyajian Data Statistika

Halo Sobat Belajar! Penyajian data mencakup tabel frekuensi, diagram batang, diagram garis, dan diagram lingkaran.

---

## 🎯 Contoh Soal Latihan Mandiri & Pembahasan Lengkap

### Contoh Soal Latihan 1:
Dalam suatu kelas terdapat 40 siswa. Sebanyak 10 siswa gemar bulu tangkis. Jika disajikan dalam diagram lingkaran, besar sudut sektor untuk bulu tangkis adalah ...
- A. $45^\\circ$
- B. $90^\\circ$
- C. $100^\\circ$
- D. $120^\\circ$

> **Kunci Jawaban:** **B**
>
> **Pembahasan Lengkap:**
> Rumus besar sudut sektor pada diagram lingkaran:
> $$\\text{Sudut} = \\frac{\\text{Frekuensi}}{\\text{Total Siswa}} \\times 360^\\circ$$
> $$\\text{Sudut} = \\frac{10}{40} \\times 360^\\circ = \\frac{1}{4} \\times 360^\\circ = 90^\\circ$$
> Jadi, besar sudut sektornya adalah **B ($90^\\circ$)**.`
      },
      {
        urutan: 2,
        judul: 'Ukuran Pemusatan Data: Mean (Rata-rata), Median (Nilai Tengah), dan Modus',
        konten_markdown: `# Ukuran Pemusatan Data (Mean, Median, Modus)

Halo Sobat Belajar! 
- Mean: $\\bar{x} = \\frac{\\sum x}{n}$
- Median: Nilai tengah setelah data diurutkan.
- Modus: Nilai dengan frekuensi terbanyak.

---

## 🎯 Contoh Soal Latihan Mandiri & Pembahasan Lengkap

### Contoh Soal Latihan 1:
Rata-rata nilai matematika 10 siswa adalah 75. Jika nilai seorang siswa baru bernama Anton digabungkan, nilai rata-ratanya menjadi 76. Berapakah nilai Anton?
- A. $80$
- B. $82$
- C. $84$
- D. $86$

> **Kunci Jawaban:** **D**
>
> **Pembahasan Lengkap:**
> 1. Jumlah total nilai 10 siswa semula:
>    $$10 \\times 75 = 750$$
> 2. Jumlah total nilai setelah ditambah Anton (11 siswa):
>    $$11 \\times 76 = 836$$
> 3. Nilai Anton adalah selisih kedua total:
>    $$\\text{Nilai Anton} = 836 - 750 = 86$$
> Jadi, nilai Anton adalah **D ($86$)**.

---

### Contoh Soal Latihan 2:
Median dari data $6, 7, 8, 5, 9, 6, 7, 8$ adalah ...
- A. $6,5$
- B. $7,0$
- C. $7,5$
- D. $8,0$

> **Kunci Jawaban:** **B**
>
> **Pembahasan Lengkap:**
> 1. Urutkan data dari yang terkecil:
>    $$5, 6, 6, 7, 7, 8, 8, 9 \\quad (n = 8)$$
> 2. Karena $n$ genap, median adalah rata-rata data ke-4 dan ke-5:
>    $$Me = \\frac{7 + 7}{2} = 7,0$$
> Jadi, median data tersebut adalah **B ($7,0$)**.`
      },
      {
        urutan: 3,
        judul: 'Ukuran Penyebaran (Jangkauan, Kuartil) & Rangkuman Bab 6',
        konten_markdown: `# Ukuran Penyebaran Data dan Rangkuman Bab 6

Halo Sobat Belajar! Ukuran penyebaran mencakup Jangkauan ($J = x_{\\text{maks}} - x_{\\text{min}}$) dan Kuartil ($Q_1, Q_2, Q_3$).

---

## 3. 📝 Contoh Soal Jangkauan & Kuartil Beserta Pembahasan Lengkap

### Contoh Soal:
Diberikan sekumpulan data nilai tugas: $5, 6, 7, 7, 8, 9, 10, 10, 12$.
Tentukan:
1. Jangkauan ($J$)
2. Kuartil Bawah ($Q_1$), Median ($Q_2$), dan Kuartil Atas ($Q_3$)
3. Jangkauan Interkuartil ($QR$)

**Langkah Pengerjaan:**
Data sudah terurut dengan $n = 9$ data:
$$5, 6, 7, 7, 8, 9, 10, 10, 12$$

1. **Jangkauan:**
   $$J = x_{\\text{maks}} - x_{\\text{min}} = 12 - 5 = 7$$
2. **Kuartil:**
   - Median ($Q_2$) adalah data ke-5 = $8$.
   - Data paruh bawah: $5, 6, 7, 7$. $Q_1 = \\frac{6 + 7}{2} = 6,5$.
   - Data paruh atas: $9, 10, 10, 12$. $Q_3 = \\frac{10 + 10}{2} = 10$.
3. **Jangkauan Interkuartil:**
   $$QR = Q_3 - Q_1 = 10 - 6,5 = 3,5$$

---

## 🎯 Contoh Soal Latihan Mandiri & Pembahasan Lengkap

### Contoh Soal Latihan 1:
Diketahui data terurut: $3, 4, 5, 6, 7, 8, 9$. Jangkauan interkuartil dari data tersebut adalah ...
- A. $2$
- B. $4$
- C. $6$
- D. $8$

> **Kunci Jawaban:** **B**
>
> **Pembahasan Lengkap:**
> 1. Data sudah terurut ($n = 7$).
> 2. Median ($Q_2$) adalah data ke-4, yaitu $6$.
> 3. Kuartil bawah ($Q_1$) adalah nilai tengah dari kelompok data di bawah median ($3, 4, 5$), yaitu $4$.
> 4. Kuartil atas ($Q_3$) adalah nilai tengah dari kelompok data di atas median ($7, 8, 9$), yaitu $8$.
> 5. Jangkauan interkuartil:
>    $$QR = Q_3 - Q_1 = 8 - 4 = 4$$
> Jadi, jawaban yang tepat adalah **B ($4$)**.`
      }
    ]
  }
];

async function seedMateri() {
  await client.connect();
  console.log('Connected to PostgreSQL database.');

  for (const chapter of MATERI_KELAS_8) {
    console.log(`\nProcessing Bab ID: ${chapter.bab_id}...`);
    
    // Check existing materi for this bab
    const existing = await client.query('SELECT id, urutan, judul FROM materi WHERE bab_id = $1 ORDER BY urutan', [chapter.bab_id]);
    console.log(`Existing materi rows in DB: ${existing.rows.length}`);

    for (const mod of chapter.modules) {
      const match = existing.rows.find(r => r.urutan === mod.urutan);
      if (match) {
        // Update existing row
        await client.query(`
          UPDATE materi 
          SET judul = $1, konten_markdown = $2
          WHERE id = $3
        `, [mod.judul, mod.konten_markdown, match.id]);
        console.log(`  [UPDATE] Sub ${mod.urutan}: ${mod.judul} (${mod.konten_markdown.length} chars)`);
      } else {
        // Insert new row
        await client.query(`
          INSERT INTO materi (bab_id, urutan, judul, konten_markdown)
          VALUES ($1, $2, $3, $4)
        `, [chapter.bab_id, mod.urutan, mod.judul, mod.konten_markdown]);
        console.log(`  [INSERT] Sub ${mod.urutan}: ${mod.judul} (${mod.konten_markdown.length} chars)`);
      }
    }
  }

  console.log('\n--- VERIFICATION QUERY ---');
  const verify = await client.query(`
    SELECT b.urutan as bab_urutan, b.judul as bab_judul, m.urutan as sub_urutan, m.judul as sub_judul, LENGTH(m.konten_markdown) as len
    FROM bab b
    JOIN materi m ON b.id = m.bab_id
    WHERE b.id = ANY($1::uuid[])
    ORDER BY b.urutan, m.urutan
  `, [MATERI_KELAS_8.map(c => c.bab_id)]);

  verify.rows.forEach(r => {
    console.log(`Bab ${r.bab_urutan}: ${r.bab_judul} | Sub ${r.sub_urutan}: ${r.sub_judul} | Length: ${r.len} chars`);
  });

  await client.end();
  console.log('\nSeeding completed successfully!');
}

seedMateri().catch(err => {
  console.error('Seeding error:', err);
  client.end();
});
