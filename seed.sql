-- ============================================================================
-- SEED DATA - KURIKULUM MERDEKA MATEMATIKA SMP KELAS 8 (FASE D)
-- ============================================================================

-- 1. SEED SEKOLAH DUMMY (SMK MUHAMMADIYAH 1 PLAYEN)
INSERT INTO sekolah (id, nama, npsn, alamat, motto, deskripsi, bg_image_url, links)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'SMK Muhammadiyah 1 Playen',
    '20402099',
    'Jl. Logandeng No. 1, Playen, Gunungkidul, D.I. Yogyakarta',
    'Pusat Keunggulan • Unggul, Terampil, Berkarakter & Berdaya Saing Global',
    'SMK Muhammadiyah 1 Playen (Muspla) adalah Sekolah Pusat Keunggulan yang berkomitmen mencetak generasi muda yang cerdas, beriman, dan menguasai teknologi serta keahlian industri masa depan.',
    '/images/smk-muh1-playen.jpg',
    '[{"label": "Website Resmi", "url": "https://smkmuh1playen.sch.id", "icon": "Globe"}, {"label": "Portal PPDB", "url": "https://ppdb.smkmuh1playen.sch.id", "icon": "ExternalLink"}, {"label": "Instagram", "url": "https://instagram.com/smkmuh1playen", "icon": "Instagram"}]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  npsn = EXCLUDED.npsn,
  alamat = EXCLUDED.alamat,
  motto = EXCLUDED.motto,
  deskripsi = EXCLUDED.deskripsi,
  bg_image_url = EXCLUDED.bg_image_url,
  links = EXCLUDED.links;

-- 2. SEED BAB MATEMATIKA KELAS 8 (FASE D)
INSERT INTO bab (id, sekolah_id, judul, deskripsi, urutan)
VALUES 
(
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Bab 1: Pola Bilangan & Barisan Bilangan',
    'CP: Menggeneralisasi pola susunan benda dan barisan bilangan. TP: Menentukan suku ke-n (Un) dan jumlah n suku (Sn) pada barisan aritmetika dan geometri.',
    1
),
(
    'b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Bab 2: Bentuk Aljabar & PLSV/PTLSV',
    'CP: Menyederhanakan bentuk aljabar dan menyelesaikan persamaan/pertidaksamaan linear satu variabel. TP: Operasi aljabar serta penyelesaian PLSV dan PTLSV kontekstual.',
    2
),
(
    'b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Bab 3: Relasi & Fungsi',
    'CP: Memahami konsep relasi dan fungsi serta menyajikannya. TP: Menentukan domain, kodomain, range, diagram panah, dan nilai fungsi f(x) = ax + b.',
    3
),
(
    'b4eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Bab 4: Persamaan Garis Lurus (PGL)',
    'CP: Mengenal konsep kemiringan garis dan menyusun persamaan garis lurus. TP: Menghitung gradien (m), menyusun PGL melalui 1 atau 2 titik, dan garis sejajar/tegak lurus.',
    4
),
(
    'b5eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Bab 5: Sistem Persamaan Linear Dua Variabel (SPLDV)',
    'CP: Menyelesaikan sistem persamaan linear dua variabel. TP: Menggunakan metode eliminasi, substitusi, dan campuran pada masalah kehidupan nyata.',
    5
),
(
    'b6eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Bab 6: Teorema Pythagoras',
    'CP: Membuktikan dan menerapkan Teorema Pythagoras. TP: Menghitung panjang sisi segitiga siku-siku, memeriksa tripel Pythagoras, dan menguji jenis segitiga.',
    6
),
(
    'b7eebc99-9c0b-4ef8-bb6d-6bb9bd380a77',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Bab 7: Bangun Ruang Sisi Datar (BRSD)',
    'CP: Menentukan luas permukaan dan volume bangun ruang sisi datar. TP: Menghitung luas permukaan dan volume Kubus, Balok, Prisma Tegak, dan Limas.',
    7
),
(
    'b8eebc99-9c0b-4ef8-bb6d-6bb9bd380a88',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Bab 8: Statistika & Peluang',
    'CP: Mengolah data dan menentukan peluang kejadian tunggal. TP: Menghitung Mean, Median, Modus, penyajian tabel/grafik, serta peluang teoritik & empirik.',
    8
)
ON CONFLICT (id) DO NOTHING;

-- 3. SEED MATERI PEMBELAJARAN (MATERI 1 - 22)
INSERT INTO materi (id, bab_id, judul, konten_markdown, urutan)
VALUES 
-- BAB 1 MATERI
(
    'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Pola Bilangan & Konfigurasi Objek',
    '# Pola Bilangan & Konfigurasi Objek

**Tujuan Pembelajaran (TP 1.1):** Peserta didik mampu mengidentifikasi dan menentukan suku berikutnya dari pola konfigurasi objek serta barisan bilangan sederhana.

---

## 1. Pengertian Pola Bilangan
Pola bilangan adalah susunan angka-angka yang membentuk aturan atau pola tertentu.

### Contoh Pola Konfigurasi Objek:
* **Pola Persegi:** $1, 4, 9, 16, 25, \dots$ (Rumus: $U_n = n^2$)
* **Pola Persegi Panjang:** $2, 6, 12, 20, \dots$ (Rumus: $U_n = n(n+1)$)
* **Pola Segitiga:** $1, 3, 6, 10, 15, \dots$ (Rumus: $U_n = \frac{n(n+1)}{2}$)

---

## 2. Menentukan Suku Berikutnya
Untuk menentukan suku berikutnya, amati selisih (beda) atau rasio antar suku yang berurutan.

> **Contoh Soal:**
> Tentukan 2 suku berikutnya dari barisan $2, 5, 8, 11, \dots$
> 
> **Penyelesaian:**
> Selisih antar suku: $+3$.
> Suku ke-5: $11 + 3 = 14$
> Suku ke-6: $14 + 3 = 17$
> Jadi dua suku berikutnya adalah **14 dan 17**.',
    1
),
(
    'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Barisan & Deret Aritmetika',
    '# Barisan & Deret Aritmetika

**Tujuan Pembelajaran (TP 1.2):** Peserta didik mampu menggeneralisasi rumus suku ke-$n$ ($U_n$) dan jumlah $n$ suku pertama ($S_n$) pada barisan aritmetika.

---

## 1. Rumus Suku ke-$n$ ($U_n$)
Barisan aritmetika adalah barisan bilangan dengan **beda ($b$)** yang konstan.

$$U_n = a + (n - 1)b$$

* $U_n$ = Suku ke-$n$
* $a$ = Suku pertama ($U_1$)
* $b$ = Beda ($U_n - U_{n-1}$)

---

## 2. Rumus Jumlah $n$ Suku Pertama ($S_n$)
Deret aritmetika adalah penjumlahan suku-suku barisan aritmetika.

$$S_n = \frac{n}{2} (a + U_n) \quad \text{atau} \quad S_n = \frac{n}{2} [2a + (n - 1)b]$$

---

### Contoh Soal:
Diketahui barisan aritmetika $5, 9, 13, 17, \dots$
Hitunglah $U_{15}$ dan $S_{10}$!

**Penyelesaian:**
* $a = 5$
* $b = 9 - 5 = 4$

1. **Suku ke-15 ($U_{15}$):**
   $$U_{15} = 5 + (15 - 1) \cdot 4 = 5 + 14 \cdot 4 = 5 + 56 = 61$$

2. **Jumlah 10 Suku Pertama ($S_{10}$):**
   $$S_{10} = \frac{10}{2} [2(5) + (10 - 1)4] = 5 [10 + 36] = 5 \cdot 46 = 230$$',
    2
),
(
    'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Barisan & Deret Geometri',
    '# Barisan & Deret Geometri

**Tujuan Pembelajaran (TP 1.3):** Peserta didik mampu memprediksi suku ke-$n$ dan jumlah $n$ suku pertama dari barisan geometri.

---

## 1. Rumus Suku ke-$n$ ($U_n$)
Barisan geometri memiliki **rasio ($r$)** yang konstan antar dua suku berurutan.

$$U_n = a \cdot r^{n-1}$$

* $r = \frac{U_2}{U_1} = \frac{U_n}{U_{n-1}}$

---

## 2. Jumlah $n$ Suku Pertama ($S_n$)
* Untuk $r > 1$: $S_n = \frac{a(r^n - 1)}{r - 1}$
* Untuk $r < 1$: $S_n = \frac{a(1 - r^n)}{1 - r}$

> **Contoh Soal:**
> Diketahui barisan geometri $3, 6, 12, 24, \dots$
> Tentukan nilai suku ke-6 ($U_6$)!
>
> **Penyelesaian:**
> $a = 3$, $r = \frac{6}{3} = 2$.
> $$U_6 = 3 \cdot 2^{6-1} = 3 \cdot 2^5 = 3 \cdot 32 = 96$$',
    3
),

-- BAB 2 MATERI
(
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a21',
    'b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'Operasi Hitung Bentuk Aljabar',
    '# Operasi Hitung Bentuk Aljabar

**Tujuan Pembelajaran (TP 2.1):** Peserta didik dapat melakukan operasi penjumlahan, pengurangan, perkalian, dan pembagian pada bentuk aljabar.

---

## 1. Unsur-unsur Aljabar
Pada bentuk aljabar $3x^2 + 5x - 7$:
* **Variabel:** $x$
* **Koefisien:** $3$ (pada $x^2$) dan $5$ (pada $x$)
* **Konstanta:** $-7$

---

## 2. Penjumlahan & Pengurangan Suku Sejenis
Hanya suku-suku dengan variabel dan pangkat variabel yang **sama (sejenis)** yang dapat dijumlahkan/dikurangkan.

> **Contoh:**
> Sederhanakan $(4x + 7y - 3) + (2x - 3y + 8)$!
> 
> **Penyelesaian:**
> $= (4x + 2x) + (7y - 3y) + (-3 + 8)$
> $= 6x + 4y + 5$',
    1
),
(
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'Persamaan Linear Satu Variabel (PLSV)',
    '# Persamaan Linear Satu Variabel (PLSV)

**Tujuan Pembelajaran (TP 2.2):** Peserta didik mampu menyelesaikan bentuk persamaan linear satu variabel dan penerapannya.

---

## 1. Bentuk Umum PLSV
$$ax + b = c \quad (a \neq 0)$$

Prinsip penyelesaian: Tambahkan, kurangkan, kalikan, atau bagilah kedua ruas dengan bilangan yang sama hingga diperoleh nilai variabel.

> **Contoh Soal:**
> Selesaikan persamaan $3x - 5 = 16$!
> 
> **Penyelesaian:**
> 1. Tambah kedua ruas dengan $5$:
>    $$3x = 16 + 5 \implies 3x = 21$$
> 2. Bagi kedua ruas dengan $3$:
>    $$x = \frac{21}{3} = 7$$
> Jadi himpunan penyelesaiannya adalah $x = 7$.',
    2
),
(
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a23',
    'b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'Pertidaksamaan Linear Satu Variabel (PTLSV)',
    '# Pertidaksamaan Linear Satu Variabel (PTLSV)

**Tujuan Pembelajaran (TP 2.3):** Peserta didik mampu menyelesaikan pertidaksamaan linear satu variabel dan menyatakan himpunan penyelesaiannya.

---

## Aturan Penting PTLSV
Jika kedua ruas **dikalikan atau dibagi dengan bilangan negatif**, maka **tanda pertidaksamaan harus dibalik** ($>$ menjadi $<$, dan sebaliknya).

> **Contoh Soal:**
> Carilah himpunan penyelesaian dari $-2x + 4 \ge 10$ untuk $x \in \mathbb{R}$!
> 
> **Penyelesaian:**
> $$-2x \ge 10 - 4 \implies -2x \ge 6$$
> Bagi kedua ruas dengan $-2$ (tanda dibalik):
> $$x \le \frac{6}{-2} \implies x \le -3$$',
    3
),

-- BAB 3 MATERI
(
    'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a31',
    'b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'Konsep Relasi & Penyajiannya',
    '# Konsep Relasi & Penyajiannya

**Tujuan Pembelajaran (TP 3.1):** Memahami relasi dua himpunan dan menyajikannya dalam bentuk diagram panah, himpunan pasangan berurutan, dan diagram Kartesius.

---

## 3 Cara Menyajikan Relasi:
1. **Diagram Panah**
2. **Himpunan Pasangan Berurutan:** $\{(x_1, y_1), (x_2, y_2), \dots\}$
3. **Diagram Kartesius**

> **Contoh:** Himpunan $A = \{1, 2, 3\}$ dan $B = \{2, 4, 6\}$.
> Relasi "Setengah dari" dari $A$ ke $B$:
> $\{(1, 2), (2, 4), (3, 6)\}$.',
    1
),
(
    'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a32',
    'b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'Fungsi, Domain, Kodomain, dan Range',
    '# Fungsi, Domain, Kodomain, dan Range

**Tujuan Pembelajaran (TP 3.2):** Menjelaskan perbedaan relasi dan fungsi, serta menentukan domain, kodomain, dan range.

---

## Syarat Fungsi (Pemetaan):
Setiap anggota domain (himpunan asal) **harus memiliki tepat satu pasangan** di anggota kodomain (himpunan kawan).

* **Domain ($D_f$):** Himpunan daerah asal.
* **Kodomain ($K_f$):** Himpunan daerah kawan.
* **Range ($R_f$):** Himpunan daerah hasil (anggota kodomain yang punya pasangan).',
    2
),
(
    'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'Notasi & Nilai Fungsi Linear',
    '# Notasi & Nilai Fungsi Linear

**Tujuan Pembelajaran (TP 3.3):** Menentukan rumus dan nilai fungsi $f(x) = ax + b$.

---

## Rumus Fungsi:
$$f(x) = ax + b$$

> **Contoh Soal:**
> Diketahui fungsi $f(x) = 3x - 4$. Hitunglah nilai $f(5)$!
> 
> **Penyelesaian:**
> Substitusi $x = 5$:
> $$f(5) = 3(5) - 4 = 15 - 4 = 11$$',
    3
),

-- BAB 4 MATERI
(
    'c4eebc99-9c0b-4ef8-bb6d-6bb9bd380a41',
    'b4eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    'Gradien Garis Lurus (m)',
    '# Gradien Garis Lurus (m)

**Tujuan Pembelajaran (TP 4.1):** Menentukan kemiringan/gradien ($m$) suatu garis lurus dari grafik atau 2 titik.

---

## Rumus Gradien:
1. **Melalui 2 Titik $(x_1, y_1)$ dan $(x_2, y_2)$:**
   $$m = \frac{\Delta y}{\Delta x} = \frac{y_2 - y_1}{x_2 - x_1}$$

2. **Dari Persamaan $ax + by + c = 0$:**
   $$m = -\frac{a}{b}$$

> **Contoh:** Gradien garis yang melalui titik $(2, 3)$ dan $(4, 11)$:
> $$m = \frac{11 - 3}{4 - 2} = \frac{8}{2} = 4$$',
    1
),
(
    'c4eebc99-9c0b-4ef8-bb6d-6bb9bd380a42',
    'b4eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    'Membentuk Persamaan Garis Lurus',
    '# Membentuk Persamaan Garis Lurus

**Tujuan Pembelajaran (TP 4.2):** Menyusun persamaan garis lurus yang diketahui gradien dan titik yang dilaluinya.

---

## Rumus Persamaan Garis:
* **Melalui 1 titik $(x_1, y_1)$ dengan gradien $m$:**
  $$y - y_1 = m(x - x_1)$$

> **Contoh:** Persamaan garis melalui $(3, 5)$ dengan $m = 2$:
> $$y - 5 = 2(x - 3) \implies y - 5 = 2x - 6 \implies y = 2x - 1$$',
    2
),

-- BAB 5 MATERI
(
    'c5eebc99-9c0b-4ef8-bb6d-6bb9bd380a51',
    'b5eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    'Metode Penyelesaian SPLDV',
    '# Metode Penyelesaian SPLDV

**Tujuan Pembelajaran (TP 5.1):** Menyelesaikan SPLDV dengan metode eliminasi, substitusi, dan gabungan.

---

## Bentuk Umum SPLDV:
$$\begin{cases} a_1 x + b_1 y = c_1 \\ a_2 x + b_2 y = c_2 \end{cases}$$

> **Contoh Soal:**
> Selesaikan sistem persamaan:
> $x + y = 5$ dan $2x - y = 4$
> 
> **Penyelesaian (Metode Eliminasi):**
> Jumlahkan kedua persamaan:
> $(x + y) + (2x - y) = 5 + 4 \implies 3x = 9 \implies x = 3$
> Substitusi $x = 3 \implies 3 + y = 5 \implies y = 2$.
> Jadi HP = $\{(3, 2)\}$.',
    1
),

-- BAB 6 MATERI
(
    'c6eebc99-9c0b-4ef8-bb6d-6bb9bd380a61',
    'b6eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
    'Konsep Teorema Pythagoras & Tripel Pythagoras',
    '# Konsep Teorema Pythagoras & Tripel Pythagoras

**Tujuan Pembelajaran (TP 6.1):** Memahami Teorema Pythagoras dan menemukan kelompok bilangan tripel Pythagoras.

---

## Rumus Utama:
Pada segitiga siku-siku dengan hipotenusa (sisi miring) $c$ serta sisi tegak $a$ dan $b$:

$$c^2 = a^2 + b^2 \implies c = \sqrt{a^2 + b^2}$$

---

## Tripel Pythagoras Populer:
* $3, 4, 5$
* $5, 12, 13$
* $7, 24, 25$
* $8, 15, 17$

> **Contoh:** Panjang alas segitiga $6\text{ cm}$ dan tinggi $8\text{ cm}$. Hipotenusa:
> $$c = \sqrt{6^2 + 8^2} = \sqrt{36 + 64} = \sqrt{100} = 10\text{ cm}$$',
    1
),

-- BAB 7 MATERI
(
    'c7eebc99-9c0b-4ef8-bb6d-6bb9bd380a71',
    'b7eebc99-9c0b-4ef8-bb6d-6bb9bd380a77',
    'Kubus & Balok: Luas Permukaan & Volume',
    '# Kubus & Balok: Luas Permukaan & Volume

**Tujuan Pembelajaran (TP 7.1):** Menghitung luas permukaan dan volume Kubus dan Balok.

---

## 1. Kubus (Rusuk $s$)
* **Luas Permukaan:** $L = 6 \cdot s^2$
* **Volume:** $V = s^3$

---

## 2. Balok (Panjang $p$, Lebar $l$, Tinggi $t$)
* **Luas Permukaan:** $L = 2(pl + pt + lt)$
* **Volume:** $V = p \cdot l \cdot t$',
    1
),

-- BAB 8 MATERI
(
    'c8eebc99-9c0b-4ef8-bb6d-6bb9bd380a81',
    'b8eebc99-9c0b-4ef8-bb6d-6bb9bd380a88',
    'Ukuran Pemusatan Data: Mean, Median, dan Modus',
    '# Ukuran Pemusatan Data: Mean, Median, dan Modus

**Tujuan Pembelajaran (TP 8.1):** Menentukan nilai rata-rata (mean), nilai tengah (median), dan modus dari sekumpulan data tunggal.

---

## 1. Mean (Rata-rata)
$$\bar{x} = \frac{\sum x}{n} = \frac{\text{Jumlah seluruh data}}{\text{Banyak data}}$$

## 2. Median (Nilai Tengah)
Nilai tengah setelah data diurutkan dari terkecil ke terbesar.

## 3. Modus
Nilai yang paling sering muncul (frekuensi tertinggi).

> **Contoh Data:** $6, 7, 8, 8, 9, 10$
> * **Mean:** $\frac{6+7+8+8+9+10}{6} = \frac{48}{6} = 8$
> * **Median:** $\frac{8+8}{2} = 8$
> * **Modus:** $8$ (muncul 2 kali)',
    1
)
ON CONFLICT (id) DO NOTHING;

-- 4. SEED BANK SOAL (PILGAN & ESAI)
INSERT INTO soal (id, bab_id, materi_id, pertanyaan, tipe_soal, tingkat_soal, sumber_konten, status_soal, kunci_jawaban, pembahasan)
VALUES
(
    'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    'Diketahui barisan aritmatika $3, 7, 11, 15, \dots$. Tentukan nilai dari suku ke-10 ($U_{10}$)!',
    'pilihan_ganda',
    'sedang',
    'manual',
    'dipublikasi',
    '39',
    'Gunakan rumus $U_n = a + (n-1)b$ dengan $a=3, b=4, n=10$. Maka $U_{10} = 3 + 9(4) = 39$.'
),
(
    'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
    'Jelaskan perbedaan mendasar antara **Barisan Aritmatika** dan **Barisan Geometri**, serta berikan masing-masing 1 contoh barisan bilangan sederhana!',
    'esai',
    'sedang',
    'manual',
    'dipublikasi',
    'Barisan aritmatika memiliki beda/selisih (b) yang tetap antar suku berurutan (contoh: 2, 4, 6, 8 dengan beda 2). Barisan geometri memiliki rasio/pembanding (r) yang tetap antar suku berurutan (contoh: 2, 4, 8, 16 dengan rasio 2).',
    'Penilaian esai berfokus pada pemahaman perbedaan beda vs rasio serta contoh barisan yang akurat.'
),
(
    'd2eebc99-9c0b-4ef8-bb6d-6bb9bd380a21',
    'b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'Selesaikan persamaan linear satu variabel berikut: $4x - 7 = 2x + 9$. Berapakah nilai $x$?',
    'pilihan_ganda',
    'mudah',
    'manual',
    'dipublikasi',
    '8',
    'Kelompokkan suku ber-variabel: $4x - 2x = 9 + 7 \implies 2x = 16 \implies x = 8$.'
),
(
    'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a31',
    'b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'Diketahui rumus fungsi $f(x) = 5x - 3$. Nilai dari $f(4)$ adalah...',
    'pilihan_ganda',
    'mudah',
    'manual',
    'dipublikasi',
    '17',
    'Substitusi $x = 4$ ke dalam $f(x)$: $f(4) = 5(4) - 3 = 20 - 3 = 17$.'
),
(
    'd4eebc99-9c0b-4ef8-bb6d-6bb9bd380a41',
    'b4eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    'c4eebc99-9c0b-4ef8-bb6d-6bb9bd380a41',
    'Berapakah gradien ($m$) dari garis lurus yang melalui titik $(1, 2)$ dan $(3, 10)$?',
    'pilihan_ganda',
    'sedang',
    'manual',
    'dipublikasi',
    '4',
    'Gunakan rumus gradien $m = \frac{y_2 - y_1}{x_2 - x_1} = \frac{10 - 2}{3 - 1} = \frac{8}{2} = 4$.'
),
(
    'd5eebc99-9c0b-4ef8-bb6d-6bb9bd380a51',
    'b5eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    'c5eebc99-9c0b-4ef8-bb6d-6bb9bd380a51',
    'Harga 2 buku dan 3 pensil adalah Rp17.000, sedangkan harga 1 buku dan 2 pensil adalah Rp10.000. Tentukan harga 1 buah buku!',
    'esai',
    'sulit',
    'manual',
    'dipublikasi',
    'Rp4.000',
    'Misal buku = x, pensil = y. Persamaan: (1) 2x + 3y = 17.000; (2) x + 2y = 10.000. Dari (2) x = 10.000 - 2y. Substitusi ke (1): 2(10.000 - 2y) + 3y = 17.000 \implies 20.000 - y = 17.000 \implies y = 3.000. Maka x = 10.000 - 2(3.000) = 4.000. Jadi harga 1 buku = Rp4.000.'
),
(
    'd6eebc99-9c0b-4ef8-bb6d-6bb9bd380a61',
    'b6eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
    'c6eebc99-9c0b-4ef8-bb6d-6bb9bd380a61',
    'Sebuah segitiga siku-siku memiliki panjang alas $9\text{ cm}$ dan tinggi $12\text{ cm}$. Tentukan panjang hipotenusa (sisi miring) segitiga tersebut!',
    'pilihan_ganda',
    'mudah',
    'manual',
    'dipublikasi',
    '15 cm',
    'Gunakan Teorema Pythagoras $c = \sqrt{a^2 + b^2} = \sqrt{9^2 + 12^2} = \sqrt{81 + 144} = \sqrt{225} = 15\text{ cm}$.'
),
(
    'd7eebc99-9c0b-4ef8-bb6d-6bb9bd380a71',
    'b7eebc99-9c0b-4ef8-bb6d-6bb9bd380a77',
    'c7eebc99-9c0b-4ef8-bb6d-6bb9bd380a71',
    'Sebuah balok memiliki panjang $10\text{ cm}$, lebar $6\text{ cm}$, dan tinggi $4\text{ cm}$. Hitunglah volume balok tersebut!',
    'pilihan_ganda',
    'mudah',
    'manual',
    'dipublikasi',
    '240 cm³',
    'Volume Balok $V = p \cdot l \cdot t = 10 \cdot 6 \cdot 4 = 240\text{ cm}^3$.'
),
(
    'd8eebc99-9c0b-4ef8-bb6d-6bb9bd380a81',
    'b8eebc99-9c0b-4ef8-bb6d-6bb9bd380a88',
    'c8eebc99-9c0b-4ef8-bb6d-6bb9bd380a81',
    'Nilai ulangan Matematika 7 siswa adalah: $7, 8, 6, 9, 8, 10, 8$. Berapakah nilai rata-rata (mean) ulangan tersebut?',
    'pilihan_ganda',
    'sedang',
    'manual',
    'dipublikasi',
    '8',
    'Mean = \frac{7 + 8 + 6 + 9 + 8 + 10 + 8}{7} = \frac{56}{7} = 8.'
)
ON CONFLICT (id) DO NOTHING;

-- 5. SEED OPSI SOAL PILIHAN GANDA
INSERT INTO opsi_soal (id, soal_id, teks_opsi, benar, urutan)
VALUES
-- Soal Pola Bilangan
('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '35', false, 1),
('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '39', true, 2),
('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '43', false, 3),
('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '47', false, 4),

-- Soal PLSV
('e2eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'd2eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', '6', false, 1),
('e2eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'd2eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', '8', true, 2),
('e2eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'd2eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', '10', false, 3),
('e2eebc99-9c0b-4ef8-bb6d-6bb9bd380a24', 'd2eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', '12', false, 4),

-- Soal Nilai Fungsi
('e3eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', '14', false, 1),
('e3eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', '17', true, 2),
('e3eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', '20', false, 3),
('e3eebc99-9c0b-4ef8-bb6d-6bb9bd380a34', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', '23', false, 4),

-- Soal Gradien PGL
('e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a41', 'd4eebc99-9c0b-4ef8-bb6d-6bb9bd380a41', '2', false, 1),
('e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a42', 'd4eebc99-9c0b-4ef8-bb6d-6bb9bd380a41', '3', false, 2),
('e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a43', 'd4eebc99-9c0b-4ef8-bb6d-6bb9bd380a41', '4', true, 3),
('e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'd4eebc99-9c0b-4ef8-bb6d-6bb9bd380a41', '5', false, 4),

-- Soal Pythagoras
('e6eebc99-9c0b-4ef8-bb6d-6bb9bd380a61', 'd6eebc99-9c0b-4ef8-bb6d-6bb9bd380a61', '13 cm', false, 1),
('e6eebc99-9c0b-4ef8-bb6d-6bb9bd380a62', 'd6eebc99-9c0b-4ef8-bb6d-6bb9bd380a61', '14 cm', false, 2),
('e6eebc99-9c0b-4ef8-bb6d-6bb9bd380a63', 'd6eebc99-9c0b-4ef8-bb6d-6bb9bd380a61', '15 cm', true, 3),
('e6eebc99-9c0b-4ef8-bb6d-6bb9bd380a64', 'd6eebc99-9c0b-4ef8-bb6d-6bb9bd380a61', '16 cm', false, 4),

-- Soal Volume Balok
('e7eebc99-9c0b-4ef8-bb6d-6bb9bd380a71', 'd7eebc99-9c0b-4ef8-bb6d-6bb9bd380a71', '180 cm³', false, 1),
('e7eebc99-9c0b-4ef8-bb6d-6bb9bd380a72', 'd7eebc99-9c0b-4ef8-bb6d-6bb9bd380a71', '240 cm³', true, 2),
('e7eebc99-9c0b-4ef8-bb6d-6bb9bd380a73', 'd7eebc99-9c0b-4ef8-bb6d-6bb9bd380a71', '300 cm³', false, 3),
('e7eebc99-9c0b-4ef8-bb6d-6bb9bd380a74', 'd7eebc99-9c0b-4ef8-bb6d-6bb9bd380a71', '360 cm³', false, 4),

-- Soal Mean Statistika
('e8eebc99-9c0b-4ef8-bb6d-6bb9bd380a81', 'd8eebc99-9c0b-4ef8-bb6d-6bb9bd380a81', '7,5', false, 1),
('e8eebc99-9c0b-4ef8-bb6d-6bb9bd380a82', 'd8eebc99-9c0b-4ef8-bb6d-6bb9bd380a81', '8', true, 2),
('e8eebc99-9c0b-4ef8-bb6d-6bb9bd380a83', 'd8eebc99-9c0b-4ef8-bb6d-6bb9bd380a81', '8,5', false, 3),
('e8eebc99-9c0b-4ef8-bb6d-6bb9bd380a84', 'd8eebc99-9c0b-4ef8-bb6d-6bb9bd380a81', '9', false, 4)
ON CONFLICT (id) DO NOTHING;
