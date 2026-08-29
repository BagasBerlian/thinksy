-- ============================================================================
-- SEED DATA MATEMATIKA THINKSY (BAB, MATERI, SOAL, OPSI)
-- ============================================================================

-- 1. SEED SEKOLAH DUMMY (SMK MUHAMMADIYAH 1 PLAYEN) JIKA BELUM ADA
INSERT INTO sekolah (id, nama, npsn, alamat, motto, deskripsi, bg_image_url, links)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'SMK Muhammadiyah 1 Playen',
    '20402099',
    'Jl. Logandeng No. 1, Playen, Gunungkidul, D.I. Yogyakarta',
    'Pusat Keunggulan • Unggul, Terampil, Berkarakter & Berdaya Saing Global',
    'SMK Muhammadiyah 1 Playen (Muspla) adalah Sekolah Pusat Keunggulan yang berkomitmen mencetak generasi muda yang cerdas, beriman, dan menguasai teknologi serta keahlian industri masa depan.',
    '/images/smk-muh1-playen.jpg',
    '[{"label": "Website Resmi", "url": "https://smkmuh1playen.sch.id", "icon": "Globe"}]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 2. SEED BAB
INSERT INTO bab (id, sekolah_id, judul, deskripsi, urutan, dibuat_pada)
VALUES
('ae1ac5d7-b55e-4ffd-9f39-f742ecee1a71', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Bab 1: Bilangan Bulat', 'Memahami bilangan bulat positif dan negatif, operasi penjumlahan, pengurangan, perkalian, pembagian, serta penerapannya dalam kehidupan sehari-hari.', 1, '2026-08-29 07:00:00.000000+00'),
('44f01e9c-0a9b-45de-8938-fa0b13762c13', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Bab 2: Aljabar', 'Mengenal bentuk aljabar, variabel, koefisien, suku, serta operasi aljabar: penjumlahan, pengurangan, perkalian, dan pemfaktoran.', 2, '2026-08-29 07:00:00.000000+00'),
('ea1c5683-0b03-4636-bbbe-c04235d277fa', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Bab 3: Persamaan dan Pertidaksamaan Linear Satu Variabel', 'Menyusun dan menyelesaikan persamaan dan pertidaksamaan linear satu variabel serta menerapkannya pada masalah kontekstual.', 3, '2026-08-29 07:00:00.000000+00'),
('7605ab68-8ec2-4e35-a00f-7eeffef62ea5', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Bab 4: Perbandingan Senilai dan Berbalik Nilai', 'Memahami konsep perbandingan senilai dan berbalik nilai, skala, proporsi, serta menerapkannya dalam penyelesaian masalah nyata.', 4, '2026-08-29 07:00:00.000000+00'),
('d01565c7-78cb-4dc3-a62a-40152b64932a', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Bab 5: Bangun Datar', 'Mengidentifikasi sifat-sifat bangun datar (segitiga, segiempat, lingkaran), menghitung keliling dan luas, serta memahami hubungan antarsudut.', 5, '2026-08-29 07:00:00.000000+00'),
('bc4ad856-a8b4-48ab-8e88-723891430dfe', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Bab 6: Bilangan Berpangkat dan Bentuk Akar', 'Memahami sifat-sifat bilangan berpangkat bulat, bentuk akar, merasionalkan penyebut, dan notasi ilmiah untuk bilangan sangat besar atau sangat kecil.', 6, '2026-08-29 07:00:00.000000+00'),
('c621a34f-52bf-4744-92b3-8d2bd2b4cdde', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Bab 7: Fungsi Kuadrat', 'Memahami konsep fungsi kuadrat, menggambar grafiknya, menentukan nilai maksimum/minimum, dan menyelesaikan masalah kontekstual.', 7, '2026-08-29 07:00:00.000000+00'),
('6b598e3b-7859-4186-b587-392d01e276c4', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Bab 8: Transformasi Geometri', 'Memahami dan menerapkan translasi, refleksi, rotasi, dan dilatasi pada bangun datar dalam bidang koordinat.', 8, '2026-08-29 07:00:00.000000+00'),
('2ee7d029-7300-4f1f-9c44-c6324d26caaa', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Bab 9: Kesebangunan dan Kekongruenan', 'Menjelaskan sifat-sifat kesebangunan dan kekongruenan pada segitiga dan segiempat, serta menerapkannya untuk menyelesaikan masalah.', 9, '2026-08-29 07:00:00.000000+00'),
('0e67f5b9-88e9-42f5-8edd-d4ab137bf94d', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Bab 10: Statistika dan Peluang', 'Menganalisis data menggunakan ukuran pemusatan (mean, median, modus) dan ukuran penyebaran, serta menghitung peluang suatu kejadian.', 10, '2026-08-29 07:00:00.000000+00')
ON CONFLICT (id) DO UPDATE SET
  sekolah_id = EXCLUDED.sekolah_id,
  judul = EXCLUDED.judul,
  deskripsi = EXCLUDED.deskripsi,
  urutan = EXCLUDED.urutan;

-- 3. SEED MATERI
INSERT INTO materi (id, bab_id, judul, konten_markdown, urutan, dibuat_pada)
VALUES
('1ae1331d-982f-4087-b5d7-1e29a77e2d13', 'ae1ac5d7-b55e-4ffd-9f39-f742ecee1a71', 'Mengenal Bilangan Bulat dan Garis Bilangan', '# Bilangan Bulat dan Garis Bilangan

Bilangan bulat terdiri atas bilangan bulat negatif, nol, dan bilangan bulat positif.

$$\mathbb{Z} = \{\ldots, -3, -2, -1, 0, 1, 2, 3, \ldots\}$$

Pada **garis bilangan**, bilangan yang lebih ke kanan bernilai lebih besar.

**Contoh:** Urutkan dari terkecil: $-5, 3, -1, 0, 7$

Jawab: $-5 < -1 < 0 < 3 < 7$', 1, '2026-08-29 07:00:00.000000+00'),
('2824f2c8-c2ab-4f13-9d2c-99861d551088', 'ae1ac5d7-b55e-4ffd-9f39-f742ecee1a71', 'Operasi Hitung Bilangan Bulat', '# Operasi Hitung Bilangan Bulat

## Penjumlahan & Pengurangan
Aturan tanda:
- $(+) + (+) = (+)$
- $(-) + (-) = (-)$
- $(-) - (-) = (-) + (+)$

## Perkalian & Pembagian
| Tanda | Hasil |
|---|---|
| $(+) \times (+)$ | $+$ |
| $(-) \times (-)$ | $+$ |
| $(+) \times (-)$ | $-$ |

**Contoh:** $(-8) \times (-5) = 40$, $\ (-24) \div 6 = -4$', 2, '2026-08-29 07:00:00.000000+00'),
('4dc03122-50d8-4a73-b57d-16d95f3afef0', 'ae1ac5d7-b55e-4ffd-9f39-f742ecee1a71', 'FPB, KPK, dan Faktorisasi Prima', '# FPB dan KPK

**Faktorisasi Prima** adalah menyatakan bilangan sebagai hasil kali faktor-faktor prima.

$$36 = 2^2 \times 3^2, \quad 48 = 2^4 \times 3$$

- **FPB** = ambil faktor prima **terkecil** yang bersekutu: $\text{FPB}(36, 48) = 2^2 \times 3 = 12$
- **KPK** = ambil faktor prima **terbesar** dari masing-masing: $\text{KPK}(36, 48) = 2^4 \times 3^2 = 144$', 3, '2026-08-29 07:00:00.000000+00'),
('2c43de4b-fa22-47b7-84cb-1deefea68898', '44f01e9c-0a9b-45de-8938-fa0b13762c13', 'Bentuk Aljabar dan Operasinya', '# Bentuk Aljabar

Bentuk aljabar memuat **variabel**, **koefisien**, dan **konstanta**.

Contoh: $3x^2 - 5x + 7$
- Koefisien $x^2$ adalah $3$
- Koefisien $x$ adalah $-5$
- Konstanta adalah $7$

## Operasi Penjumlahan & Pengurangan
Hanya **suku-suku sejenis** yang dapat dijumlahkan.

$$(4x + 3y) - (x - 2y) = 3x + 5y$$', 1, '2026-08-29 07:00:00.000000+00'),
('8e7710bc-475e-4cee-9d9e-226d49269a4e', '44f01e9c-0a9b-45de-8938-fa0b13762c13', 'Perkalian dan Pemfaktoran Bentuk Aljabar', '# Perkalian & Pemfaktoran

## Perkalian
$$(a+b)(a-b) = a^2 - b^2$$
$$(a+b)^2 = a^2 + 2ab + b^2$$

## Pemfaktoran
$$x^2 + 5x + 6 = (x+2)(x+3)$$

**Langkah:** Cari dua bilangan yang **jumlahnya** $5$ dan **kalinya** $6$, yaitu $2$ dan $3$.

**Contoh:** Faktorkan $2x^2 + 7x + 3 = (2x+1)(x+3)$', 2, '2026-08-29 07:00:00.000000+00'),
('1a0634ad-9af2-4d1f-9b6f-8876de0b8f44', 'ea1c5683-0b03-4636-bbbe-c04235d277fa', 'Persamaan Linear Satu Variabel (PLSV)', '# Persamaan Linear Satu Variabel

Persamaan linear satu variabel berbentuk:
$$ax + b = c, \quad a \neq 0$$

**Cara penyelesaian:** lakukan operasi yang sama di kedua ruas.

**Contoh:**
$$3x - 4 = 11$$
$$3x = 15$$
$$x = 5$$

Penyelesaian: $x = 5$, dapat diverifikasi $3(5)-4=11$ ✓', 1, '2026-08-29 07:00:00.000000+00'),
('a2c2ee45-4b81-46fe-809a-bec23c37ed76', 'ea1c5683-0b03-4636-bbbe-c04235d277fa', 'Pertidaksamaan Linear Satu Variabel (PtLSV)', '# Pertidaksamaan Linear Satu Variabel

Bentuk umum: $ax + b > c$ (atau $<$, $\geq$, $\leq$)

⚠️ **Perhatian:** Jika kedua ruas dikalikan/dibagi bilangan **negatif**, tanda pertidaksamaan **berbalik**.

**Contoh:**
$$-2x + 3 > 7$$
$$-2x > 4$$
$$x < -2 \quad \text{(tanda berbalik!)}$$

Himpunan penyelesaian: $\{x \mid x < -2, x \in \mathbb{R}\}$', 2, '2026-08-29 07:00:00.000000+00'),
('7a9792c1-d86d-4da3-a3dd-60da46f8f7b1', '7605ab68-8ec2-4e35-a00f-7eeffef62ea5', 'Perbandingan Senilai', '# Perbandingan Senilai

Dua besaran dikatakan **senilai** jika kenaikan salah satu menyebabkan kenaikan yang lain secara proporsional.

$$\frac{a_1}{b_1} = \frac{a_2}{b_2}$$

**Contoh:** 5 liter bensin untuk 60 km. Berapa km untuk 8 liter?

$$\frac{5}{60} = \frac{8}{x} \Rightarrow x = \frac{8 \times 60}{5} = 96 \text{ km}$$', 1, '2026-08-29 07:00:00.000000+00'),
('1680339e-482a-4da0-b7eb-32aa509a8753', '7605ab68-8ec2-4e35-a00f-7eeffef62ea5', 'Perbandingan Berbalik Nilai', '# Perbandingan Berbalik Nilai

Dua besaran dikatakan **berbalik nilai** jika kenaikan salah satu menyebabkan penurunan yang lain secara proporsional.

$$a_1 \times b_1 = a_2 \times b_2$$

**Contoh:** 6 pekerja menyelesaikan pekerjaan dalam 10 hari. Berapa hari jika dikerjakan 15 pekerja?

$$6 \times 10 = 15 \times x \Rightarrow x = 4 \text{ hari}$$', 2, '2026-08-29 07:00:00.000000+00'),
('5efe755e-5a0e-44c9-8c43-26bc0d387402', 'd01565c7-78cb-4dc3-a62a-40152b64932a', 'Keliling dan Luas Bangun Datar', '# Keliling dan Luas Bangun Datar

| Bangun | Keliling | Luas |
|---|---|---|
| Persegi ($s$) | $4s$ | $s^2$ |
| Persegipanjang ($p, l$) | $2(p+l)$ | $p \times l$ |
| Segitiga ($a, b, c$; $t$) | $a+b+c$ | $\frac{1}{2} \times a \times t$ |
| Lingkaran ($r$) | $2\pi r$ | $\pi r^2$ |

**Contoh:** Lingkaran $r=7$ cm → $L = \pi(7)^2 \approx 154$ cm²', 1, '2026-08-29 07:00:00.000000+00'),
('7d272731-23d6-40a1-a823-575aa0e740ba', 'd01565c7-78cb-4dc3-a62a-40152b64932a', 'Hubungan Antarsudut', '# Hubungan Antarsudut

- **Sudut berpelurus (suplemen):** jumlahnya $180°$
- **Sudut bertolak belakang:** besarnya sama
- **Sudut dalam segitiga:** jumlahnya $180°$
- **Sudut luar segitiga:** = jumlah dua sudut dalam yang tidak berdekatan

**Contoh:** Sudut dalam segitiga: $50°, 70°, x°$
$$x = 180° - 50° - 70° = 60°$$', 2, '2026-08-29 07:00:00.000000+00'),
('ee74ae82-6218-4a32-8cd8-93a663af5da1', 'bc4ad856-a8b4-48ab-8e88-723891430dfe', 'Sifat-sifat Bilangan Berpangkat', '# Bilangan Berpangkat

Sifat-sifat operasi bilangan berpangkat:

| Sifat | Rumus |
|---|---|
| Perkalian | $a^m \times a^n = a^{m+n}$ |
| Pembagian | $a^m \div a^n = a^{m-n}$ |
| Perpangkatan | $(a^m)^n = a^{mn}$ |
| Pangkat nol | $a^0 = 1$ |
| Pangkat negatif | $a^{-n} = \frac{1}{a^n}$ |

**Contoh:** $2^3 \times 2^4 = 2^7 = 128$', 1, '2026-08-29 07:00:00.000000+00'),
('03329b51-eb63-454f-9501-86061d4d3874', 'bc4ad856-a8b4-48ab-8e88-723891430dfe', 'Bentuk Akar dan Notasi Ilmiah', '# Bentuk Akar dan Notasi Ilmiah

## Bentuk Akar
$$\sqrt{a} \times \sqrt{b} = \sqrt{ab}, \qquad \frac{\sqrt{a}}{\sqrt{b}} = \sqrt{\frac{a}{b}}$$

**Merasionalkan penyebut:**
$$\frac{3}{\sqrt{5}} = \frac{3\sqrt{5}}{5}$$

## Notasi Ilmiah
$$a \times 10^n, \quad 1 \leq a < 10$$

**Contoh:** $0{,}000045 = 4{,}5 \times 10^{-5}$', 2, '2026-08-29 07:00:00.000000+00'),
('0f74f2eb-2e68-4e21-a152-4e1d3dc3d351', 'c621a34f-52bf-4744-92b3-8d2bd2b4cdde', 'Persamaan dan Fungsi Kuadrat', '# Fungsi Kuadrat

Fungsi kuadrat berbentuk:
$$f(x) = ax^2 + bx + c, \quad a \neq 0$$

**Menyelesaikan persamaan kuadrat:**
1. Pemfaktoran
2. Melengkapi kuadrat sempurna
3. Rumus kuadrat (ABC): $$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$

**Contoh:** $x^2 - 5x + 6 = 0 \Rightarrow (x-2)(x-3) = 0$
$x_1 = 2, x_2 = 3$', 1, '2026-08-29 07:00:00.000000+00'),
('38c12b32-ef1f-44b7-a95e-dd89ece5744d', 'c621a34f-52bf-4744-92b3-8d2bd2b4cdde', 'Grafik Fungsi Kuadrat dan Nilai Optimum', '# Grafik Fungsi Kuadrat

Grafik fungsi kuadrat berupa **parabola**.

- Jika $a > 0$: parabola terbuka ke **atas** (nilai minimum)
- Jika $a < 0$: parabola terbuka ke **bawah** (nilai maksimum)

**Titik puncak (vertex):**
$$x_p = -\frac{b}{2a}, \qquad y_p = -\frac{D}{4a}$$

dimana $D = b^2 - 4ac$ (diskriminan)

**Contoh:** $f(x) = -x^2 + 4x + 5$, $x_p = 2$, $y_p = 9$ (maks)', 2, '2026-08-29 07:00:00.000000+00'),
('bc92510b-3877-4a22-b0f0-3f380096dbcd', '6b598e3b-7859-4186-b587-392d01e276c4', 'Translasi dan Refleksi', '# Translasi dan Refleksi

## Translasi (Pergeseran)
Titik $A(x, y)$ ditranslasikan oleh vektor $(a, b)$:
$$A''(x+a,\ y+b)$$

## Refleksi (Pencerminan)
| Sumbu Cermin | Bayangan $A(x,y)$ |
|---|---|
| Sumbu $x$ | $A''(x, -y)$ |
| Sumbu $y$ | $A''(-x, y)$ |
| Garis $y=x$ | $A''(y, x)$ |

**Contoh:** $A(3, -2)$ dicerminkan terhadap sumbu $y$ → $A''(-3, -2)$', 1, '2026-08-29 07:00:00.000000+00'),
('7e53e5ab-fa75-4f3f-8819-e3602591d376', '6b598e3b-7859-4186-b587-392d01e276c4', 'Rotasi dan Dilatasi', '# Rotasi dan Dilatasi

## Rotasi
Rotasi titik $A(x,y)$ sebesar $90°$ berlawanan jarum jam terhadap pusat $O(0,0)$:
$$A''(-y,\ x)$$

## Dilatasi
Dilatasi dengan pusat $O(0,0)$ dan faktor skala $k$:
$$A(x,y) \to A''(kx,\ ky)$$

**Contoh:** $A(4, 3)$ didilatasikan dengan $k=2$ → $A''(8, 6)$', 2, '2026-08-29 07:00:00.000000+00'),
('8a10aaa7-cf56-4e71-b711-8848bd5db4d8', '2ee7d029-7300-4f1f-9c44-c6324d26caaa', 'Kesebangunan Bangun Datar', '# Kesebangunan

Dua bangun datar dikatakan **sebangun** jika:
1. Sudut-sudut yang bersesuaian **sama besar**
2. Sisi-sisi yang bersesuaian **sebanding**

$$\frac{AB}{A''B''} = \frac{BC}{B''C''} = \frac{CD}{C''D''} = k \quad (\text{faktor skala})$$

**Contoh:** Foto ukuran $4 \times 6$ cm diperbesar menjadi $10 \times 15$ cm.
$$k = \frac{10}{4} = 2{,}5$$', 1, '2026-08-29 07:00:00.000000+00'),
('7d8b3586-363c-4e3a-a2ae-2f79798fe911', '2ee7d029-7300-4f1f-9c44-c6324d26caaa', 'Kekongruenan Segitiga', '# Kekongruenan

Dua bangun dikatakan **kongruen** ($\cong$) jika mempunyai **bentuk dan ukuran yang sama**.

**Syarat kekongruenan segitiga:**
- **SSS** (Sisi-Sisi-Sisi): ketiga pasang sisi bersesuaian sama panjang
- **SAS** (Sisi-Sudut-Sisi): dua sisi dan sudut apitnya sama
- **ASA** (Sudut-Sisi-Sudut): dua sudut dan sisi apitnya sama
- **AAS** (Sudut-Sudut-Sisi): dua sudut dan sisi yang tidak diapit sama', 2, '2026-08-29 07:00:00.000000+00'),
('82e037ce-b70a-471c-9a60-ce68cbe60b53', '0e67f5b9-88e9-42f5-8edd-d4ab137bf94d', 'Ukuran Pemusatan Data', '# Ukuran Pemusatan Data

## Mean (Rata-rata)
$$\bar{x} = \frac{\sum x_i}{n}$$

## Median
Nilai tengah data **setelah diurutkan**.
- Jika $n$ ganjil: $M_e = x_{\frac{n+1}{2}}$
- Jika $n$ genap: $M_e = \frac{x_{\frac{n}{2}} + x_{\frac{n}{2}+1}}{2}$

## Modus
Nilai yang **paling sering muncul**.

**Contoh:** Data: $4, 6, 6, 7, 8, 9$
→ Mean $= 6{,}67$; Median $= 6{,}5$; Modus $= 6$', 1, '2026-08-29 07:00:00.000000+00'),
('ecc29e8c-dcd2-437c-a6b3-a3f93503a2c4', '0e67f5b9-88e9-42f5-8edd-d4ab137bf94d', 'Peluang Suatu Kejadian', '# Peluang (Probabilitas)

Peluang suatu kejadian $A$:
$$P(A) = \frac{n(A)}{n(S)}$$

dimana $n(A)$ = banyak anggota kejadian $A$, $n(S)$ = banyak anggota ruang sampel.

**Sifat:** $0 \leq P(A) \leq 1$

**Contoh:** Sebuah dadu dilempar sekali. Peluang muncul angka ganjil:
$$P = \frac{3}{6} = \frac{1}{2}$$

(Angka ganjil: 1, 3, 5)', 2, '2026-08-29 07:00:00.000000+00')
ON CONFLICT (id) DO UPDATE SET
  bab_id = EXCLUDED.bab_id,
  judul = EXCLUDED.judul,
  konten_markdown = EXCLUDED.konten_markdown,
  urutan = EXCLUDED.urutan;

-- 4. SEED SOAL
INSERT INTO soal (id, bab_id, materi_id, pembuat_id, pertanyaan, tipe_soal, tingkat_soal, sumber_konten, status_soal, kunci_jawaban, pembahasan, dibuat_pada)
VALUES
('d7b826c5-90c6-47bb-81c3-e2b9df7da938', 'ae1ac5d7-b55e-4ffd-9f39-f742ecee1a71', '1ae1331d-982f-4087-b5d7-1e29a77e2d13', NULL, 'Hasil dari $(-12) + 7 - (-5)$ adalah ...', 'pilihan_ganda'::tipe_soal, 'sedang'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, '0', 'Hitung: $(-12) + 7 = -5$, kemudian $-5 - (-5) = -5 + 5 = 0$', '2026-08-29 07:00:00.000000+00'),
('ec00121d-172b-430e-a2b1-db64aabe11bd', 'ae1ac5d7-b55e-4ffd-9f39-f742ecee1a71', '1ae1331d-982f-4087-b5d7-1e29a77e2d13', NULL, 'Nilai dari $(-4) \times (-7)$ adalah ...', 'pilihan_ganda'::tipe_soal, 'mudah'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, '28', '$(-) \times (-) = (+)$, sehingga $4 \times 7 = 28$', '2026-08-29 07:00:00.000000+00'),
('cbc87caf-3f83-4baf-a29c-eea9ded6c696', 'ae1ac5d7-b55e-4ffd-9f39-f742ecee1a71', '1ae1331d-982f-4087-b5d7-1e29a77e2d13', NULL, 'FPB dari 36 dan 48 adalah ...', 'pilihan_ganda'::tipe_soal, 'sedang'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, '12', '$36 = 2^2 \times 3^2$, $48 = 2^4 \times 3$. FPB $= 2^2 \times 3 = 12$', '2026-08-29 07:00:00.000000+00'),
('1984ada1-5c7f-42a9-9919-3a01b18e81dd', 'ae1ac5d7-b55e-4ffd-9f39-f742ecee1a71', '1ae1331d-982f-4087-b5d7-1e29a77e2d13', NULL, 'KPK dari 4 dan 6 adalah ...', 'pilihan_ganda'::tipe_soal, 'mudah'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, '12', '$4 = 2^2$, $6 = 2 \times 3$. KPK $= 2^2 \times 3 = 12$', '2026-08-29 07:00:00.000000+00'),
('11d8e43a-60f0-46c0-9977-d4acf49d5076', 'ae1ac5d7-b55e-4ffd-9f39-f742ecee1a71', '2824f2c8-c2ab-4f13-9d2c-99861d551088', NULL, 'Suhu di puncak gunung adalah $-8°C$. Suhu di kaki gunung $17°C$ lebih tinggi. Berapakah suhu di kaki gunung? Jelaskan langkah penyelesaiannya!', 'esai'::tipe_soal, 'sulit'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, '$-8 + 17 = 9°C$', 'Suhu kaki gunung = suhu puncak + selisih = $-8 + 17 = 9°C$.', '2026-08-29 07:00:00.000000+00'),
('faf71da7-3d66-4c93-a583-baf9d0166bf7', 'ae1ac5d7-b55e-4ffd-9f39-f742ecee1a71', '1ae1331d-982f-4087-b5d7-1e29a77e2d13', NULL, 'Di antara bilangan-bilangan berikut, yang merupakan faktor prima dari 60 adalah ...', 'pilihan_ganda'::tipe_soal, 'sedang'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, '$2, 3, 5$', '$60 = 2^2 \times 3 \times 5$, sehingga faktor primanya adalah 2, 3, dan 5.', '2026-08-29 07:00:00.000000+00'),
('0fb33725-2f4b-4d99-b7f3-9e515793820b', '44f01e9c-0a9b-45de-8938-fa0b13762c13', '2c43de4b-fa22-47b7-84cb-1deefea68898', NULL, 'Suku-suku sejenis dari $5x^2 - 3x + 2x^2 + 7x - 1$ setelah disederhanakan adalah ...', 'pilihan_ganda'::tipe_soal, 'mudah'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, '$7x^2 + 4x - 1$', 'Kelompokkan: $(5x^2+2x^2) + (-3x+7x) + (-1) = 7x^2 + 4x - 1$', '2026-08-29 07:00:00.000000+00'),
('233b4886-2456-4678-936d-ffb6f2c3f650', '44f01e9c-0a9b-45de-8938-fa0b13762c13', '2c43de4b-fa22-47b7-84cb-1deefea68898', NULL, 'Hasil dari $(x+3)(x-5)$ adalah ...', 'pilihan_ganda'::tipe_soal, 'sedang'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, '$x^2 - 2x - 15$', '$(x+3)(x-5) = x^2 - 5x + 3x - 15 = x^2 - 2x - 15$', '2026-08-29 07:00:00.000000+00'),
('65a8416e-9a79-41b0-bf5a-deee9a41c078', '44f01e9c-0a9b-45de-8938-fa0b13762c13', '2c43de4b-fa22-47b7-84cb-1deefea68898', NULL, 'Faktor dari $x^2 - 9$ adalah ...', 'pilihan_ganda'::tipe_soal, 'sedang'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, '$(x+3)(x-3)$', '$x^2 - 9 = x^2 - 3^2 = (x+3)(x-3)$ (selisih dua kuadrat)', '2026-08-29 07:00:00.000000+00'),
('96436013-aabb-44a8-b1d4-fc0a1cbb5978', '44f01e9c-0a9b-45de-8938-fa0b13762c13', '8e7710bc-475e-4cee-9d9e-226d49269a4e', NULL, 'Koefisien $x$ pada bentuk $4x^2 - 7x + 2$ adalah ...', 'pilihan_ganda'::tipe_soal, 'mudah'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, '$-7$', 'Koefisien adalah bilangan yang mengalikan variabel. Koefisien $x$ pada $-7x$ adalah $-7$.', '2026-08-29 07:00:00.000000+00'),
('85d699eb-4a61-420b-976e-060cf0015f8e', '44f01e9c-0a9b-45de-8938-fa0b13762c13', '8e7710bc-475e-4cee-9d9e-226d49269a4e', NULL, 'Sederhanakan $(3x - 2y)^2 - (3x + 2y)(3x - 2y)$ dan jelaskan setiap langkah pemfaktorannya!', 'esai'::tipe_soal, 'sulit'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, '$9x^2 - 12xy + 4y^2 - (9x^2 - 4y^2) = -12xy + 8y^2$', '$(3x-2y)^2 = 9x^2 - 12xy + 4y^2$; $(3x+2y)(3x-2y) = 9x^2-4y^2$. Selisihnya: $-12xy+8y^2$.', '2026-08-29 07:00:00.000000+00'),
('c2226eb9-f106-46fc-ad96-c6e999f5b763', 'ea1c5683-0b03-4636-bbbe-c04235d277fa', '1a0634ad-9af2-4d1f-9b6f-8876de0b8f44', NULL, 'Penyelesaian dari $2x + 5 = 13$ adalah ...', 'pilihan_ganda'::tipe_soal, 'mudah'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, '$x = 4$', '$2x = 13 - 5 = 8$, maka $x = 4$', '2026-08-29 07:00:00.000000+00'),
('e12bd1b0-9719-4d1e-84d7-16f4568ea40e', 'ea1c5683-0b03-4636-bbbe-c04235d277fa', '1a0634ad-9af2-4d1f-9b6f-8876de0b8f44', NULL, 'Himpunan penyelesaian dari $3x - 4 > 5$ untuk $x \in \mathbb{R}$ adalah ...', 'pilihan_ganda'::tipe_soal, 'sedang'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, '$x > 3$', '$3x > 9$, maka $x > 3$', '2026-08-29 07:00:00.000000+00'),
('dff3fd63-e0f6-46a7-92bc-a53ae46c06ec', 'ea1c5683-0b03-4636-bbbe-c04235d277fa', 'a2c2ee45-4b81-46fe-809a-bec23c37ed76', NULL, 'Umur Budi 3 tahun lebih tua dari Ani. Jumlah umur keduanya 27 tahun. Umur Ani adalah ...', 'pilihan_ganda'::tipe_soal, 'sedang'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, '12 tahun', 'Misal Ani = $x$, Budi = $x+3$. Maka $x + (x+3) = 27 \Rightarrow 2x = 24 \Rightarrow x = 12$', '2026-08-29 07:00:00.000000+00'),
('b54100d2-ba9f-4c86-8f4e-7765773e704a', 'ea1c5683-0b03-4636-bbbe-c04235d277fa', '1a0634ad-9af2-4d1f-9b6f-8876de0b8f44', NULL, 'Nilai $x$ yang memenuhi $5 - x = 2x - 7$ adalah ...', 'pilihan_ganda'::tipe_soal, 'mudah'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, '$x = 4$', '$5 + 7 = 2x + x \Rightarrow 12 = 3x \Rightarrow x = 4$', '2026-08-29 07:00:00.000000+00'),
('171b702c-f22e-4fa1-970a-1e71e9c3d4ca', 'ea1c5683-0b03-4636-bbbe-c04235d277fa', 'a2c2ee45-4b81-46fe-809a-bec23c37ed76', NULL, 'Sebuah persegipanjang memiliki panjang $(3x-1)$ cm dan lebar $(x+2)$ cm. Jika kelilingnya 38 cm, tentukan panjang dan lebar persegipanjang tersebut!', 'esai'::tipe_soal, 'sulit'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, 'panjang 11 cm, lebar 8 cm', '$2(3x-1+x+2)=38 \Rightarrow 2(4x+1)=38 \Rightarrow 4x+1=19 \Rightarrow x=4{,}5$. Panjang$=12{,}5$ cm. Lebar$=6{,}5$ cm.', '2026-08-29 07:00:00.000000+00'),
('f60d8e1c-dcf6-42b9-8026-6c453ebe30fb', '7605ab68-8ec2-4e35-a00f-7eeffef62ea5', '7a9792c1-d86d-4da3-a3dd-60da46f8f7b1', NULL, 'Jika 3 buku seharga Rp15.000, maka harga 7 buku adalah ...', 'pilihan_ganda'::tipe_soal, 'mudah'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, 'Rp35.000', '$\frac{3}{15.000} = \frac{7}{x} \Rightarrow x = \frac{7 \times 15.000}{3} = 35.000$', '2026-08-29 07:00:00.000000+00'),
('9288eb5b-4137-4635-8566-220562adeca5', '7605ab68-8ec2-4e35-a00f-7eeffef62ea5', '7a9792c1-d86d-4da3-a3dd-60da46f8f7b1', NULL, 'Peta berskala $1:500.000$. Jarak dua kota pada peta $6$ cm. Jarak sebenarnya adalah ...', 'pilihan_ganda'::tipe_soal, 'sedang'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, '30 km', 'Jarak nyata $= 6 \times 500.000 = 3.000.000$ cm $= 30$ km', '2026-08-29 07:00:00.000000+00'),
('5d4f1732-19fa-47af-8392-626610a29e7d', '7605ab68-8ec2-4e35-a00f-7eeffef62ea5', '1680339e-482a-4da0-b7eb-32aa509a8753', NULL, '8 pekerja dapat menyelesaikan proyek dalam 15 hari. Jika ditambah 4 pekerja, waktu yang diperlukan adalah ...', 'pilihan_ganda'::tipe_soal, 'sedang'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, '10 hari', '$8 \times 15 = 12 \times x \Rightarrow x = 10$ hari', '2026-08-29 07:00:00.000000+00'),
('83656d5c-0da2-49a0-901a-79ed30e1606a', '7605ab68-8ec2-4e35-a00f-7eeffef62ea5', '7a9792c1-d86d-4da3-a3dd-60da46f8f7b1', NULL, 'Perbandingan uang Andi dan Budi adalah $3:5$. Jika jumlah uang mereka Rp160.000, uang Andi adalah ...', 'pilihan_ganda'::tipe_soal, 'mudah'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, 'Rp60.000', 'Andi $= \frac{3}{8} \times 160.000 = 60.000$', '2026-08-29 07:00:00.000000+00'),
('d8168d06-b365-41b2-93c7-b6dc92496890', '7605ab68-8ec2-4e35-a00f-7eeffef62ea5', '1680339e-482a-4da0-b7eb-32aa509a8753', NULL, 'Sebuah tangki air dapat diisi oleh 3 pipa dalam 8 jam. Jika hanya 2 pipa yang digunakan, berapa jam waktu yang dibutuhkan? Termasuk jenis perbandingan apakah soal ini? Jelaskan!', 'esai'::tipe_soal, 'sulit'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, '12 jam, perbandingan berbalik nilai', '$3 \times 8 = 2 \times x \Rightarrow x = 12$ jam. Ini perbandingan berbalik nilai: semakin sedikit pipa, semakin lama waktu.', '2026-08-29 07:00:00.000000+00'),
('8d739f45-3b0d-4bf8-a12f-2841dde82c66', 'd01565c7-78cb-4dc3-a62a-40152b64932a', '5efe755e-5a0e-44c9-8c43-26bc0d387402', NULL, 'Luas segitiga dengan alas 10 cm dan tinggi 6 cm adalah ...', 'pilihan_ganda'::tipe_soal, 'mudah'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, '30 cm²', '$L = \frac{1}{2} \times 10 \times 6 = 30$ cm²', '2026-08-29 07:00:00.000000+00'),
('788ded17-fb50-479b-a63c-0b548f791beb', 'd01565c7-78cb-4dc3-a62a-40152b64932a', '5efe755e-5a0e-44c9-8c43-26bc0d387402', NULL, 'Sebuah lingkaran memiliki diameter 14 cm. Luasnya ($\pi = \frac{22}{7}$) adalah ...', 'pilihan_ganda'::tipe_soal, 'sedang'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, '154 cm²', '$r = 7$ cm, $L = \frac{22}{7} \times 7^2 = 154$ cm²', '2026-08-29 07:00:00.000000+00'),
('5e5ab704-8a2e-475b-88e1-073638320d15', 'd01565c7-78cb-4dc3-a62a-40152b64932a', '7d272731-23d6-40a1-a823-575aa0e740ba', NULL, 'Dua garis sejajar dipotong sebuah garis transversal. Sudut dalam berseberangan berukuran $(3x+10)°$ dan $(5x-20)°$. Nilai $x$ adalah ...', 'pilihan_ganda'::tipe_soal, 'sedang'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, '$15$', 'Sudut dalam berseberangan sama besar: $3x+10=5x-20 \Rightarrow 30=2x \Rightarrow x=15$', '2026-08-29 07:00:00.000000+00'),
('fed08fbe-f788-433d-b93d-e789a11e0669', 'd01565c7-78cb-4dc3-a62a-40152b64932a', '5efe755e-5a0e-44c9-8c43-26bc0d387402', NULL, 'Keliling persegi dengan sisi 9 cm adalah ...', 'pilihan_ganda'::tipe_soal, 'mudah'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, '36 cm', '$K = 4 \times 9 = 36$ cm', '2026-08-29 07:00:00.000000+00'),
('0b68c52e-9b0a-446e-919a-16f65d1f5602', 'd01565c7-78cb-4dc3-a62a-40152b64932a', '7d272731-23d6-40a1-a823-575aa0e740ba', NULL, 'Sebuah taman berbentuk trapesium dengan panjang sisi sejajar 12 m dan 8 m, serta tinggi 5 m. Hitung luas taman tersebut dan jelaskan rumus yang digunakan!', 'esai'::tipe_soal, 'sulit'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, '50 m²', '$L = \frac{1}{2}(a+b) \times t = \frac{1}{2}(12+8) \times 5 = 50$ m²', '2026-08-29 07:00:00.000000+00'),
('b469b174-64f4-4f16-a94b-58dad46e0b8c', 'bc4ad856-a8b4-48ab-8e88-723891430dfe', 'ee74ae82-6218-4a32-8cd8-93a663af5da1', NULL, 'Nilai dari $3^4 \times 3^{-2}$ adalah ...', 'pilihan_ganda'::tipe_soal, 'mudah'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, '$9$', '$3^4 \times 3^{-2} = 3^{4+(-2)} = 3^2 = 9$', '2026-08-29 07:00:00.000000+00'),
('d669c56a-2602-4e4d-900c-b4ef57f4f79e', 'bc4ad856-a8b4-48ab-8e88-723891430dfe', 'ee74ae82-6218-4a32-8cd8-93a663af5da1', NULL, 'Bentuk sederhana dari $\frac{2^6 \times 2^{-2}}{2^3}$ adalah ...', 'pilihan_ganda'::tipe_soal, 'sedang'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, '$2$', '$= 2^{6-2-3} = 2^1 = 2$', '2026-08-29 07:00:00.000000+00'),
('16c14b02-aa17-4967-8d59-84f069b80665', 'bc4ad856-a8b4-48ab-8e88-723891430dfe', '03329b51-eb63-454f-9501-86061d4d3874', NULL, 'Bentuk dari $0{,}00048$ dalam notasi ilmiah adalah ...', 'pilihan_ganda'::tipe_soal, 'sedang'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, '$4{,}8 \times 10^{-4}$', 'Geser koma ke kanan 4 kali: $0{,}00048 = 4{,}8 \times 10^{-4}$', '2026-08-29 07:00:00.000000+00'),
('6124b797-0084-434d-872c-b91aa350717c', 'bc4ad856-a8b4-48ab-8e88-723891430dfe', 'ee74ae82-6218-4a32-8cd8-93a663af5da1', NULL, 'Nilai $5^0 + 2^{-1}$ adalah ...', 'pilihan_ganda'::tipe_soal, 'mudah'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, '$\frac{3}{2}$', '$5^0 = 1$, $2^{-1} = \frac{1}{2}$. Jumlah: $1 + \frac{1}{2} = \frac{3}{2}$', '2026-08-29 07:00:00.000000+00'),
('a3cd6ba5-adc7-4bee-89d3-5c2656584f2c', 'bc4ad856-a8b4-48ab-8e88-723891430dfe', '03329b51-eb63-454f-9501-86061d4d3874', NULL, 'Sederhanakan $\frac{\sqrt{50} - \sqrt{18}}{\sqrt{2}}$ dan tunjukkan setiap langkah pengerjaannya!', 'esai'::tipe_soal, 'sulit'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, '$4$', '$\sqrt{50}=5\sqrt{2}$, $\sqrt{18}=3\sqrt{2}$. Pembilang $= 5\sqrt{2}-3\sqrt{2}=2\sqrt{2}$. Bagi $\sqrt{2}$: hasilnya $2$. Koreksi: $2\sqrt{2}/\sqrt{2}=2$. Ah cek ulang: $\frac{2\sqrt{2}}{\sqrt{2}}=2$.', '2026-08-29 07:00:00.000000+00'),
('0802a199-0e1c-4c42-86f2-950b7db723c5', 'c621a34f-52bf-4744-92b3-8d2bd2b4cdde', '0f74f2eb-2e68-4e21-a152-4e1d3dc3d351', NULL, 'Akar-akar persamaan $x^2 - 7x + 12 = 0$ adalah ...', 'pilihan_ganda'::tipe_soal, 'sedang'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, '$x = 3$ dan $x = 4$', '$(x-3)(x-4)=0 \Rightarrow x=3$ atau $x=4$', '2026-08-29 07:00:00.000000+00'),
('59c02e29-eba4-43b4-ab63-d4f9d8b5c8ca', 'c621a34f-52bf-4744-92b3-8d2bd2b4cdde', '0f74f2eb-2e68-4e21-a152-4e1d3dc3d351', NULL, 'Diskriminan dari $2x^2 - 3x + 1 = 0$ adalah ...', 'pilihan_ganda'::tipe_soal, 'mudah'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, '$1$', '$D = b^2 - 4ac = 9 - 8 = 1$', '2026-08-29 07:00:00.000000+00'),
('adf708b9-7f8d-4e02-8be9-b7702cb5bf2d', 'c621a34f-52bf-4744-92b3-8d2bd2b4cdde', '38c12b32-ef1f-44b7-a95e-dd89ece5744d', NULL, 'Nilai maksimum dari $f(x) = -x^2 + 6x - 5$ adalah ...', 'pilihan_ganda'::tipe_soal, 'sedang'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, '$4$', '$x_p = -\frac{6}{-2}=3$; $f(3)=-9+18-5=4$', '2026-08-29 07:00:00.000000+00'),
('91635384-1086-40d7-9350-f161bb0088a7', 'c621a34f-52bf-4744-92b3-8d2bd2b4cdde', '0f74f2eb-2e68-4e21-a152-4e1d3dc3d351', NULL, 'Parabola $f(x) = 2x^2 + 3x - 1$ terbuka ke ...', 'pilihan_ganda'::tipe_soal, 'mudah'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, 'atas', 'Karena $a = 2 > 0$, parabola terbuka ke atas (memiliki nilai minimum).', '2026-08-29 07:00:00.000000+00'),
('83429afe-6300-4d91-a1e9-ba6eea63d442', 'c621a34f-52bf-4744-92b3-8d2bd2b4cdde', '38c12b32-ef1f-44b7-a95e-dd89ece5744d', NULL, 'Sebuah peluru ditembakkan ke atas. Ketinggian (meter) setelah $t$ detik: $h(t) = -5t^2 + 20t$. Kapan peluru mencapai ketinggian maksimum dan berapa ketinggian maksimumnya?', 'esai'::tipe_soal, 'sulit'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, '$t=2$ detik, $h=20$ m', '$t_p = -\frac{20}{2(-5)} = 2$ detik; $h(2) = -5(4)+40 = 20$ m', '2026-08-29 07:00:00.000000+00'),
('eaf16d1a-1ba4-4f09-b1f5-aa6b1e7e0b40', '6b598e3b-7859-4186-b587-392d01e276c4', 'bc92510b-3877-4a22-b0f0-3f380096dbcd', NULL, 'Titik $A(2, -3)$ ditranslasikan oleh $(4, 1)$. Bayangan titik A adalah ...', 'pilihan_ganda'::tipe_soal, 'mudah'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, '$A''(6, -2)$', '$(2+4, -3+1) = (6, -2)$', '2026-08-29 07:00:00.000000+00'),
('2d5f56b7-0038-4d8b-926f-432b397d0a69', '6b598e3b-7859-4186-b587-392d01e276c4', 'bc92510b-3877-4a22-b0f0-3f380096dbcd', NULL, 'Titik $B(-3, 5)$ dicerminkan terhadap sumbu $x$. Bayangannya adalah ...', 'pilihan_ganda'::tipe_soal, 'sedang'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, '$B''(-3, -5)$', 'Refleksi terhadap sumbu $x$: $(x,y)\to(x,-y)$, maka $B''(-3,-5)$', '2026-08-29 07:00:00.000000+00'),
('91bd7f44-388b-4b8f-b33b-9cab62867e80', '6b598e3b-7859-4186-b587-392d01e276c4', '7e53e5ab-fa75-4f3f-8819-e3602591d376', NULL, 'Titik $C(4, 3)$ dirotasikan $90°$ berlawanan jarum jam terhadap pusat $O(0,0)$. Bayangannya adalah ...', 'pilihan_ganda'::tipe_soal, 'sedang'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, '$C''(-3, 4)$', 'Rotasi $90°$ berlawanan jarum jam: $(x,y)\to(-y,x)$, maka $C''(-3,4)$', '2026-08-29 07:00:00.000000+00'),
('a373541d-dcf8-4972-85b3-5d77cdad2458', '6b598e3b-7859-4186-b587-392d01e276c4', 'bc92510b-3877-4a22-b0f0-3f380096dbcd', NULL, 'Titik $D(5, 2)$ didilatasikan dengan pusat $O(0,0)$ dan faktor skala $k=3$. Bayangannya adalah ...', 'pilihan_ganda'::tipe_soal, 'mudah'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, '$D''(15, 6)$', '$(kx, ky) = (3 \times 5, 3 \times 2) = (15, 6)$', '2026-08-29 07:00:00.000000+00'),
('26965945-1959-44db-91ee-5ec62004a4ff', '6b598e3b-7859-4186-b587-392d01e276c4', '7e53e5ab-fa75-4f3f-8819-e3602591d376', NULL, 'Segitiga $PQR$ dengan $P(1,1)$, $Q(4,1)$, $R(4,4)$ dicerminkan terhadap garis $y=x$. Tentukan koordinat bayangan segitiga tersebut!', 'esai'::tipe_soal, 'sulit'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, '$P''(1,1)$, $Q''(1,4)$, $R''(4,4)$', 'Refleksi $y=x$: $(x,y)\to(y,x)$. $P''(1,1)$, $Q''(1,4)$, $R''(4,4)$.', '2026-08-29 07:00:00.000000+00'),
('e671b57d-ce9e-4cfb-ba28-76363eab42f1', '2ee7d029-7300-4f1f-9c44-c6324d26caaa', '8a10aaa7-cf56-4e71-b711-8848bd5db4d8', NULL, 'Dua segitiga sebangun. Sisi-sisi segitiga pertama $6, 8, 10$ cm. Sisi terpendek segitiga kedua $9$ cm. Sisi terpanjang segitiga kedua adalah ...', 'pilihan_ganda'::tipe_soal, 'sedang'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, '15 cm', 'Faktor skala $k = \frac{9}{6} = 1{,}5$. Sisi terpanjang $= 10 \times 1{,}5 = 15$ cm.', '2026-08-29 07:00:00.000000+00'),
('62e25827-81a3-43cf-8fc0-fc7559b5b086', '2ee7d029-7300-4f1f-9c44-c6324d26caaa', '8a10aaa7-cf56-4e71-b711-8848bd5db4d8', NULL, 'Dua bangun dikatakan kongruen jika ...', 'pilihan_ganda'::tipe_soal, 'mudah'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, 'bentuk dan ukurannya sama', 'Kongruen artinya memiliki bentuk dan ukuran yang persis sama (dapat berimpit sepenuhnya).', '2026-08-29 07:00:00.000000+00'),
('0b55ff09-4f9b-4fb4-aad2-a1c7023845ea', '2ee7d029-7300-4f1f-9c44-c6324d26caaa', '7d8b3586-363c-4e3a-a2ae-2f79798fe911', NULL, 'Dua segitiga memiliki dua sudut bersesuaian yang sama besar dan sisi yang diapit sama panjang. Syarat kekongruenan yang digunakan adalah ...', 'pilihan_ganda'::tipe_soal, 'sedang'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, 'ASA (Sudut-Sisi-Sudut)', 'Dua sudut dan sisi apit sama → syarat ASA (Angle-Side-Angle).', '2026-08-29 07:00:00.000000+00'),
('21f9bc58-5504-4a7e-8188-5ba0db6dafea', '2ee7d029-7300-4f1f-9c44-c6324d26caaa', '8a10aaa7-cf56-4e71-b711-8848bd5db4d8', NULL, 'Jika foto berukuran $3 \times 5$ cm diperbesar dengan faktor skala 4, ukuran foto baru adalah ...', 'pilihan_ganda'::tipe_soal, 'mudah'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, '$12 \times 20$ cm', '$3 \times 4 = 12$ cm dan $5 \times 4 = 20$ cm.', '2026-08-29 07:00:00.000000+00'),
('049200c9-e250-45d4-877e-1d136aabe8e3', '2ee7d029-7300-4f1f-9c44-c6324d26caaa', '7d8b3586-363c-4e3a-a2ae-2f79798fe911', NULL, 'Sebuah tiang menghasilkan bayangan 6 m. Pada saat yang sama, tongkat setinggi 1,2 m menghasilkan bayangan 2 m. Tentukan tinggi tiang dengan konsep kesebangunan!', 'esai'::tipe_soal, 'sulit'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, '3,6 m', 'Segi tiga sebangun: $\frac{h}{6} = \frac{1{,}2}{2} \Rightarrow h = 3{,}6$ m.', '2026-08-29 07:00:00.000000+00'),
('f8383e7d-f757-4836-828b-9bb01d4966b9', '0e67f5b9-88e9-42f5-8edd-d4ab137bf94d', '82e037ce-b70a-471c-9a60-ce68cbe60b53', NULL, 'Mean dari data $4, 7, 5, 8, 6$ adalah ...', 'pilihan_ganda'::tipe_soal, 'mudah'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, '$6$', '$\bar{x} = \frac{4+7+5+8+6}{5} = \frac{30}{5} = 6$', '2026-08-29 07:00:00.000000+00'),
('dae5121a-63bb-48e6-b24f-5c64e01eaec4', '0e67f5b9-88e9-42f5-8edd-d4ab137bf94d', '82e037ce-b70a-471c-9a60-ce68cbe60b53', NULL, 'Median dari data $3, 7, 5, 9, 1, 8$ setelah diurutkan adalah ...', 'pilihan_ganda'::tipe_soal, 'sedang'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, '$6$', 'Diurutkan: $1,3,5,7,8,9$. Median $= \frac{5+7}{2} = 6$', '2026-08-29 07:00:00.000000+00'),
('96cc158d-7889-4c2c-86c2-42dbceed39bd', '0e67f5b9-88e9-42f5-8edd-d4ab137bf94d', 'ecc29e8c-dcd2-437c-a6b3-a3f93503a2c4', NULL, 'Sebuah kantong berisi 3 bola merah, 4 bola biru, dan 3 bola hijau. Peluang terambil bola biru adalah ...', 'pilihan_ganda'::tipe_soal, 'mudah'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, '$\frac{2}{5}$', '$P = \frac{4}{10} = \frac{2}{5}$', '2026-08-29 07:00:00.000000+00'),
('4d8f1aaa-8853-4571-8018-e46836d30e81', '0e67f5b9-88e9-42f5-8edd-d4ab137bf94d', '82e037ce-b70a-471c-9a60-ce68cbe60b53', NULL, 'Modus dari data $2, 4, 4, 5, 6, 6, 6, 7$ adalah ...', 'pilihan_ganda'::tipe_soal, 'sedang'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, '$6$', 'Angka 6 muncul paling banyak (3 kali), sehingga modusnya adalah 6.', '2026-08-29 07:00:00.000000+00'),
('b4237c53-fbd3-4894-9d38-ce32f8ecde91', '0e67f5b9-88e9-42f5-8edd-d4ab137bf94d', 'ecc29e8c-dcd2-437c-a6b3-a3f93503a2c4', NULL, 'Dari 40 siswa, 15 gemar matematika, 20 gemar IPA, dan 5 gemar keduanya. Berapa peluang siswa yang hanya gemar salah satu pelajaran? Jelaskan!', 'esai'::tipe_soal, 'sulit'::tingkat_soal, 'manual'::sumber_konten, 'dipublikasi'::status_soal, '$\frac{25}{40} = \frac{5}{8}$', 'Hanya matematika: $15-5=10$. Hanya IPA: $20-5=15$. Total hanya salah satu: $25$. $P=\frac{25}{40}=\frac{5}{8}$.', '2026-08-29 07:00:00.000000+00')
ON CONFLICT (id) DO UPDATE SET
  bab_id = EXCLUDED.bab_id,
  materi_id = EXCLUDED.materi_id,
  pertanyaan = EXCLUDED.pertanyaan,
  tipe_soal = EXCLUDED.tipe_soal,
  tingkat_soal = EXCLUDED.tingkat_soal,
  sumber_konten = EXCLUDED.sumber_konten,
  status_soal = EXCLUDED.status_soal,
  kunci_jawaban = EXCLUDED.kunci_jawaban,
  pembahasan = EXCLUDED.pembahasan;

-- 5. SEED OPSI SOAL
INSERT INTO opsi_soal (id, soal_id, teks_opsi, benar, urutan)
VALUES
('23f1ebe2-8bd4-4cae-bde2-1df2ab1e349e', 'd7b826c5-90c6-47bb-81c3-e2b9df7da938', '10', false, 1),
('0db25573-1a2d-43cf-b3e9-edeac209ddc2', 'd7b826c5-90c6-47bb-81c3-e2b9df7da938', '−10', false, 2),
('830f1e6f-705c-4f6a-b306-e769f6b1ca8a', 'd7b826c5-90c6-47bb-81c3-e2b9df7da938', '−4', false, 3),
('d8eca586-b8e4-47f7-a163-94bf23b6b3f1', 'd7b826c5-90c6-47bb-81c3-e2b9df7da938', '0', true, 4),
('a9414cdb-d979-4e13-a8cf-b17b71c123b5', 'ec00121d-172b-430e-a2b1-db64aabe11bd', '28', true, 1),
('128c7053-dedb-4b5a-aeb5-b4fe2793c833', 'ec00121d-172b-430e-a2b1-db64aabe11bd', '−28', false, 2),
('2f3b8132-1ae4-4465-841c-167d8ba582ea', 'ec00121d-172b-430e-a2b1-db64aabe11bd', '−11', false, 3),
('5b4cbc99-334a-4123-bbbe-8c7e6d907c6c', 'ec00121d-172b-430e-a2b1-db64aabe11bd', '11', false, 4),
('13756e17-ed30-415e-b7ad-b088306fc1d6', 'cbc87caf-3f83-4baf-a29c-eea9ded6c696', '18', false, 1),
('eeb363c8-f64e-450f-be55-932ca38b3dcf', 'cbc87caf-3f83-4baf-a29c-eea9ded6c696', '24', false, 2),
('116c922d-56c8-48ad-96fb-7a6151ae1514', 'cbc87caf-3f83-4baf-a29c-eea9ded6c696', '12', true, 3),
('2d11f262-769f-4ea3-8198-f55947fc7457', 'cbc87caf-3f83-4baf-a29c-eea9ded6c696', '6', false, 4),
('c9a30b0e-96c8-4878-a380-637aa6c40153', '1984ada1-5c7f-42a9-9919-3a01b18e81dd', '12', true, 1),
('79521c08-6d69-477f-bfe5-58e1b621dbe1', '1984ada1-5c7f-42a9-9919-3a01b18e81dd', '6', false, 2),
('d07a3085-11a2-405d-942a-07f4a894eb63', '1984ada1-5c7f-42a9-9919-3a01b18e81dd', '24', false, 3),
('56487779-c084-49c7-9fe2-8e85e06a6dcf', '1984ada1-5c7f-42a9-9919-3a01b18e81dd', '8', false, 4),
('92f63cc0-ca3b-4ef5-a4c8-aaa52fd350f6', 'faf71da7-3d66-4c93-a583-baf9d0166bf7', '$2, 5, 7$', false, 1),
('9d3690aa-7026-4714-b94f-1746d7848542', 'faf71da7-3d66-4c93-a583-baf9d0166bf7', '$3, 4, 5$', false, 2),
('72a976e5-de7b-4b58-9716-85b4a10cd4d2', 'faf71da7-3d66-4c93-a583-baf9d0166bf7', '$2, 3, 5$', true, 3),
('098767ff-d49f-478e-a192-43a72d758c03', 'faf71da7-3d66-4c93-a583-baf9d0166bf7', '$2, 3, 7$', false, 4),
('d8375714-dd1b-45b5-ba97-9e473583b95c', '0fb33725-2f4b-4d99-b7f3-9e515793820b', '$7x^2 + 4x - 1$', true, 1),
('604ed128-add3-4434-92bf-530228293134', '0fb33725-2f4b-4d99-b7f3-9e515793820b', '$7x^2 + 4x + 1$', false, 2),
('a3529786-5f88-45b4-83b8-e9ecf7bc44de', '0fb33725-2f4b-4d99-b7f3-9e515793820b', '$3x^2 + 4x - 1$', false, 3),
('e2c0c2b4-c5d7-4b00-85ab-68a1b70deaca', '0fb33725-2f4b-4d99-b7f3-9e515793820b', '$7x^2 - 4x + 1$', false, 4),
('f8681f8e-b7e4-4c4e-bb5c-157203bcb2e1', '233b4886-2456-4678-936d-ffb6f2c3f650', '$x^2 - 2x - 15$', true, 1),
('9872cc96-381e-4fa4-a105-3c7a4fb90175', '233b4886-2456-4678-936d-ffb6f2c3f650', '$x^2 - 2x + 15$', false, 2),
('49a929aa-ba8a-4469-b566-0390538ea3af', '233b4886-2456-4678-936d-ffb6f2c3f650', '$x^2 + 2x - 15$', false, 3),
('6f78f777-4918-4b54-bd01-3c86ef501633', '233b4886-2456-4678-936d-ffb6f2c3f650', '$x^2 + 8x + 15$', false, 4),
('8b2af2e2-002a-4c88-9096-b8c4493dd6e8', '65a8416e-9a79-41b0-bf5a-deee9a41c078', '$(x+3)^2$', false, 1),
('bb1666a7-ec03-4517-b1c6-b35ec8c168cf', '65a8416e-9a79-41b0-bf5a-deee9a41c078', '$(x+9)(x-1)$', false, 2),
('a5fdbcb1-a90b-4ccf-8432-7932ba776ea2', '65a8416e-9a79-41b0-bf5a-deee9a41c078', '$(x+3)(x-3)$', true, 3),
('44c5eddc-52e9-4e75-ad88-5fd65295c10f', '65a8416e-9a79-41b0-bf5a-deee9a41c078', '$(x-3)^2$', false, 4),
('7a420edd-458d-45d7-b28c-3af5d654eb3d', '96436013-aabb-44a8-b1d4-fc0a1cbb5978', '$7$', false, 1),
('88650f0c-b9ef-4f33-8f1a-245aa7f1ae8f', '96436013-aabb-44a8-b1d4-fc0a1cbb5978', '$4$', false, 2),
('745a0424-e206-499f-8cc1-9084aebc68f9', '96436013-aabb-44a8-b1d4-fc0a1cbb5978', '$-4$', false, 3),
('53215e63-74f5-4e88-ae48-62f009b08b05', '96436013-aabb-44a8-b1d4-fc0a1cbb5978', '$-7$', true, 4),
('64dc28cb-0df5-44f0-90e6-229fa1a0d53f', 'c2226eb9-f106-46fc-ad96-c6e999f5b763', '$x = 3$', false, 1),
('b42c8650-56e1-433b-b15b-0a48090d3c96', 'c2226eb9-f106-46fc-ad96-c6e999f5b763', '$x = 5$', false, 2),
('71603c4a-36d0-4a59-a292-630a79b95fb1', 'c2226eb9-f106-46fc-ad96-c6e999f5b763', '$x = 6$', false, 3),
('28f7e019-733d-4763-90d2-d1129fe45f54', 'c2226eb9-f106-46fc-ad96-c6e999f5b763', '$x = 4$', true, 4),
('ee6de98a-45d7-49dc-a326-9ac2e5e3949c', 'e12bd1b0-9719-4d1e-84d7-16f4568ea40e', '$x < 3$', false, 1),
('13fd3912-a449-4a7d-88e1-698d2a967a13', 'e12bd1b0-9719-4d1e-84d7-16f4568ea40e', '$x < -3$', false, 2),
('44e851d7-3dde-4649-a03e-c3e9a071cc7f', 'e12bd1b0-9719-4d1e-84d7-16f4568ea40e', '$x > -3$', false, 3),
('ef8e3beb-ae0f-4f1c-a603-20b29a5280cd', 'e12bd1b0-9719-4d1e-84d7-16f4568ea40e', '$x > 3$', true, 4),
('715d7561-eb6f-4d8f-bb60-6bfde084df6c', 'dff3fd63-e0f6-46a7-92bc-a53ae46c06ec', '12 tahun', true, 1),
('4bc86be3-6c2a-496b-8022-1725d6abea3e', 'dff3fd63-e0f6-46a7-92bc-a53ae46c06ec', '10 tahun', false, 2),
('222c9811-a150-4da7-be24-e6bb98715df9', 'dff3fd63-e0f6-46a7-92bc-a53ae46c06ec', '14 tahun', false, 3),
('5e9188f6-bb4e-4abc-ba05-7b39a3a4fcec', 'dff3fd63-e0f6-46a7-92bc-a53ae46c06ec', '15 tahun', false, 4),
('8eee72b2-a7d8-429c-8804-c9923a18d42a', 'b54100d2-ba9f-4c86-8f4e-7765773e704a', '$x = 3$', false, 1),
('345c1c1c-305f-4309-8e9e-196606527f16', 'b54100d2-ba9f-4c86-8f4e-7765773e704a', '$x = 4$', true, 2),
('95fbc823-d1cb-4659-b8bd-617019a2745d', 'b54100d2-ba9f-4c86-8f4e-7765773e704a', '$x = 5$', false, 3),
('aa72d500-9685-43e4-99c8-e918107f9480', 'b54100d2-ba9f-4c86-8f4e-7765773e704a', '$x = 2$', false, 4),
('6fa605a8-f840-4af2-a176-25db0ab45b27', 'f60d8e1c-dcf6-42b9-8026-6c453ebe30fb', 'Rp21.000', false, 1),
('76af01d9-27ae-418c-9b39-b342cec854f9', 'f60d8e1c-dcf6-42b9-8026-6c453ebe30fb', 'Rp35.000', true, 2),
('a45503d5-6387-4b68-853b-09c6c25a4c52', 'f60d8e1c-dcf6-42b9-8026-6c453ebe30fb', 'Rp28.000', false, 3),
('a3be8cdc-4c28-456d-9459-ad5a177cdc6a', 'f60d8e1c-dcf6-42b9-8026-6c453ebe30fb', 'Rp42.000', false, 4),
('e33c7fc4-627b-4796-82b0-f15760bb5e3b', '9288eb5b-4137-4635-8566-220562adeca5', '3 km', false, 1),
('0070268b-064a-4299-bc53-156497771103', '9288eb5b-4137-4635-8566-220562adeca5', '3.000 km', false, 2),
('89265bf1-9d92-4418-940d-e6a7169a221e', '9288eb5b-4137-4635-8566-220562adeca5', '300 km', false, 3),
('86a39233-294d-4d7c-b19d-a4d4a28c059d', '9288eb5b-4137-4635-8566-220562adeca5', '30 km', true, 4),
('7be0aa3e-de1b-4d02-86b9-d05379668469', '5d4f1732-19fa-47af-8392-626610a29e7d', '6 hari', false, 1),
('cf6aa711-9813-4e94-9edd-45db5689dbe1', '5d4f1732-19fa-47af-8392-626610a29e7d', '10 hari', true, 2),
('db45658c-9291-4137-a278-582c33322e21', '5d4f1732-19fa-47af-8392-626610a29e7d', '12 hari', false, 3),
('9396af1a-0fc5-4f25-ab26-80f5827d0251', '5d4f1732-19fa-47af-8392-626610a29e7d', '8 hari', false, 4),
('18f7d734-2ac4-41e9-bc54-a5fa4d44e197', '83656d5c-0da2-49a0-901a-79ed30e1606a', 'Rp80.000', false, 1),
('daffaf57-e3d4-4ab7-81c0-b00cc96c2906', '83656d5c-0da2-49a0-901a-79ed30e1606a', 'Rp60.000', true, 2),
('75739059-a5bc-4463-89cf-c9e24a1ba1b6', '83656d5c-0da2-49a0-901a-79ed30e1606a', 'Rp100.000', false, 3),
('d90e6af6-b261-4b2b-99f8-167cc14c0912', '83656d5c-0da2-49a0-901a-79ed30e1606a', 'Rp40.000', false, 4),
('d88877a1-c9e3-4453-b573-36f606baab08', '8d739f45-3b0d-4bf8-a12f-2841dde82c66', '15 cm²', false, 1),
('eb8eb37d-d9d5-4c4f-9866-e2e21e38d5e8', '8d739f45-3b0d-4bf8-a12f-2841dde82c66', '20 cm²', false, 2),
('556d6b71-958d-40a6-983a-4333237e7a49', '8d739f45-3b0d-4bf8-a12f-2841dde82c66', '30 cm²', true, 3),
('15f4a894-26c2-42d0-aa4b-4629041cf6cf', '8d739f45-3b0d-4bf8-a12f-2841dde82c66', '60 cm²', false, 4),
('f44430bd-fb77-4c31-8237-f2db4214ab66', '788ded17-fb50-479b-a63c-0b548f791beb', '154 cm²', true, 1),
('5f71a10e-a9b8-4da5-8a72-73e89bf01774', '788ded17-fb50-479b-a63c-0b548f791beb', '132 cm²', false, 2),
('d6911736-ed84-490e-a81a-bdf6352df44e', '788ded17-fb50-479b-a63c-0b548f791beb', '44 cm²', false, 3),
('4055c819-d349-47bc-8010-825e2013a64a', '788ded17-fb50-479b-a63c-0b548f791beb', '176 cm²', false, 4),
('9702d437-7b19-487b-a712-d6b22d6f80b7', '5e5ab704-8a2e-475b-88e1-073638320d15', '$20$', false, 1),
('42100008-d263-4872-81be-c8426bfd3b37', '5e5ab704-8a2e-475b-88e1-073638320d15', '$15$', true, 2),
('a21ee71f-d138-40ea-aadc-7322c2259f7f', '5e5ab704-8a2e-475b-88e1-073638320d15', '$10$', false, 3),
('6c223461-9494-4ec8-a350-7e608ba69a53', '5e5ab704-8a2e-475b-88e1-073638320d15', '$5$', false, 4),
('23bbbeb6-d7c8-4b21-b09a-d2119e9566d7', 'fed08fbe-f788-433d-b93d-e789a11e0669', '27 cm', false, 1),
('b35a5e50-c2f2-4f08-82d8-1c29de0a351d', 'fed08fbe-f788-433d-b93d-e789a11e0669', '18 cm', false, 2),
('100433b7-af67-4d00-9255-5cf52cca8704', 'fed08fbe-f788-433d-b93d-e789a11e0669', '45 cm', false, 3),
('f020c640-7296-4d2f-976a-c807222b2440', 'fed08fbe-f788-433d-b93d-e789a11e0669', '36 cm', true, 4),
('cf2ec190-8e5a-4bcc-8a3f-f0a56989370b', 'b469b174-64f4-4f16-a94b-58dad46e0b8c', '$9$', true, 1),
('a9f6f937-6723-4123-baed-21df921ac73c', 'b469b174-64f4-4f16-a94b-58dad46e0b8c', '$81$', false, 2),
('c0aaed87-7e96-4136-bfa7-4c4bcadb13e5', 'b469b174-64f4-4f16-a94b-58dad46e0b8c', '$27$', false, 3),
('36a33172-687d-4e5f-93a9-884e301a800d', 'b469b174-64f4-4f16-a94b-58dad46e0b8c', '$3$', false, 4),
('699f6bc0-7f4e-4451-b3cc-5d39b30a286f', 'd669c56a-2602-4e4d-900c-b4ef57f4f79e', '$4$', false, 1),
('1ad9733c-a9da-4597-9ae1-3de89f201120', 'd669c56a-2602-4e4d-900c-b4ef57f4f79e', '$8$', false, 2),
('0f265ce7-9fb7-4331-8e45-1623e0c6a6f7', 'd669c56a-2602-4e4d-900c-b4ef57f4f79e', '$1$', false, 3),
('74e94bae-cb8b-4a42-be04-161dd2f447c3', 'd669c56a-2602-4e4d-900c-b4ef57f4f79e', '$2$', true, 4),
('869c281b-d744-40c3-b971-8ab49f35de5b', '16c14b02-aa17-4967-8d59-84f069b80665', '$48 \times 10^{-5}$', false, 1),
('01b455f0-df86-4231-b0fc-b4fe45705e9c', '16c14b02-aa17-4967-8d59-84f069b80665', '$4{,}8 \times 10^{-4}$', true, 2),
('252236b5-e826-4344-bee0-9b66bdf97965', '16c14b02-aa17-4967-8d59-84f069b80665', '$4{,}8 \times 10^{-5}$', false, 3),
('bdc69944-20d9-4e72-a92b-0e13acacdfd8', '16c14b02-aa17-4967-8d59-84f069b80665', '$4{,}8 \times 10^{4}$', false, 4),
('2d2c2e85-d4a4-4d64-a14f-89ffc7e9c239', '6124b797-0084-434d-872c-b91aa350717c', '$\frac{3}{2}$', true, 1),
('dc0b6dbd-1712-41a6-b2de-be6a4a71da53', '6124b797-0084-434d-872c-b91aa350717c', '$2$', false, 2),
('943573fb-b1c2-4be1-ad71-ef3066ff5aae', '6124b797-0084-434d-872c-b91aa350717c', '$\frac{1}{2}$', false, 3),
('4bbf1537-6021-44df-9464-b84ab09b417e', '6124b797-0084-434d-872c-b91aa350717c', '$1$', false, 4),
('ddb3b17b-e175-4aa3-a8bc-61082a6fa05c', '0802a199-0e1c-4c42-86f2-950b7db723c5', '$x = 1$ dan $x = 12$', false, 1),
('7908cd8b-e062-4818-9754-fd654f63288f', '0802a199-0e1c-4c42-86f2-950b7db723c5', '$x = 3$ dan $x = 4$', true, 2),
('a6b65a59-9547-4b4c-a19d-6eac6e247685', '0802a199-0e1c-4c42-86f2-950b7db723c5', '$x = -3$ dan $x = -4$', false, 3),
('e795bf74-8461-4fdd-bddd-ba534576302a', '0802a199-0e1c-4c42-86f2-950b7db723c5', '$x = 2$ dan $x = 6$', false, 4),
('a53e062e-6207-4fd0-bd90-6e2de494c032', '59c02e29-eba4-43b4-ab63-d4f9d8b5c8ca', '$-1$', false, 1),
('960131fd-af52-4a76-8eea-72aec643ae16', '59c02e29-eba4-43b4-ab63-d4f9d8b5c8ca', '$7$', false, 2),
('3ee18a71-29b8-4b1d-99b0-6c3504abc52e', '59c02e29-eba4-43b4-ab63-d4f9d8b5c8ca', '$1$', true, 3),
('37b9972b-a2ec-4a01-b8d0-d216f07c9d43', '59c02e29-eba4-43b4-ab63-d4f9d8b5c8ca', '$0$', false, 4),
('025f9e3e-5cac-4051-99ab-dc19fe269101', 'adf708b9-7f8d-4e02-8be9-b7702cb5bf2d', '$4$', true, 1),
('9bd3358f-ba46-4b60-9d65-047faaf7cec5', 'adf708b9-7f8d-4e02-8be9-b7702cb5bf2d', '$9$', false, 2),
('1f02c3f5-22d3-4d24-9591-90ace2a90d83', 'adf708b9-7f8d-4e02-8be9-b7702cb5bf2d', '$3$', false, 3),
('010e7bef-74c5-4854-b9aa-13bafa4ff83a', 'adf708b9-7f8d-4e02-8be9-b7702cb5bf2d', '$5$', false, 4),
('6f525d85-c46e-4b39-bc2f-7bc2597b0d09', '91635384-1086-40d7-9350-f161bb0088a7', 'kiri', false, 1),
('b5d85b43-45d4-4563-a96b-89b8b17639e8', '91635384-1086-40d7-9350-f161bb0088a7', 'bawah', false, 2),
('395d3136-662e-4c3f-802e-71c9e2ffa9e5', '91635384-1086-40d7-9350-f161bb0088a7', 'atas', true, 3),
('7bbf328d-971d-43b9-b2fc-762da5c866da', '91635384-1086-40d7-9350-f161bb0088a7', 'kanan', false, 4),
('6fbd933f-5f77-4680-9b16-d27868ec4da7', 'eaf16d1a-1ba4-4f09-b1f5-aa6b1e7e0b40', '$A''(-6, -2)$', false, 1),
('4e744c21-8003-462f-80d0-7e146cc9762e', 'eaf16d1a-1ba4-4f09-b1f5-aa6b1e7e0b40', '$A''(6, -2)$', true, 2),
('e2f39be0-10ae-4661-8e5a-359503d5a5c8', 'eaf16d1a-1ba4-4f09-b1f5-aa6b1e7e0b40', '$A''(6, 2)$', false, 3),
('9b942808-9bcd-4089-83d5-14c0d8512db7', 'eaf16d1a-1ba4-4f09-b1f5-aa6b1e7e0b40', '$A''(2, -3)$', false, 4),
('248f202d-1568-4cac-9cae-675cf961e4b4', '2d5f56b7-0038-4d8b-926f-432b397d0a69', '$B''(3, -5)$', false, 1),
('d71db689-4e69-4540-b682-a0f07bd169db', '2d5f56b7-0038-4d8b-926f-432b397d0a69', '$B''(-3, -5)$', true, 2),
('d3748cc3-38b3-4d8b-a137-30cf4d023264', '2d5f56b7-0038-4d8b-926f-432b397d0a69', '$B''(-3, 5)$', false, 3),
('8cb84293-836f-401d-898b-95df062c48a8', '2d5f56b7-0038-4d8b-926f-432b397d0a69', '$B''(3, 5)$', false, 4),
('36da1eb7-e29e-4124-a913-3f4f9b5ae769', '91bd7f44-388b-4b8f-b33b-9cab62867e80', '$C''(4, -3)$', false, 1),
('37d55d41-b213-47ef-8eff-d5d32e47d151', '91bd7f44-388b-4b8f-b33b-9cab62867e80', '$C''(3, 4)$', false, 2),
('f1e7329d-cd9f-4c72-bc38-1419fe150c60', '91bd7f44-388b-4b8f-b33b-9cab62867e80', '$C''(-4, 3)$', false, 3),
('391a5e0c-370e-43ce-94f4-37f2ef28c619', '91bd7f44-388b-4b8f-b33b-9cab62867e80', '$C''(-3, 4)$', true, 4),
('060ffc71-98c5-4a22-9ac2-23934e0ede54', 'a373541d-dcf8-4972-85b3-5d77cdad2458', '$D''(8, 5)$', false, 1),
('56e33c7e-0b69-4272-b40c-7c9ade1b4190', 'a373541d-dcf8-4972-85b3-5d77cdad2458', '$D''(20, 6)$', false, 2),
('b99d0228-3100-4ca5-9dab-c6bc92d08800', 'a373541d-dcf8-4972-85b3-5d77cdad2458', '$D''(15, 6)$', true, 3),
('931fe374-c580-4514-9941-fbdec86cd8e9', 'a373541d-dcf8-4972-85b3-5d77cdad2458', '$D''(5, 2)$', false, 4),
('1458ebd3-1881-4dc2-bb4c-2fbc072650b5', 'e671b57d-ce9e-4cfb-ba28-76363eab42f1', '20 cm', false, 1),
('7e8d5674-b2bc-42e2-930d-3324dbec58aa', 'e671b57d-ce9e-4cfb-ba28-76363eab42f1', '12 cm', false, 2),
('189eaf56-44ac-41a1-b5b5-16d76c71f5c7', 'e671b57d-ce9e-4cfb-ba28-76363eab42f1', '18 cm', false, 3),
('02745fe3-2785-4db5-8300-01329ba1bd10', 'e671b57d-ce9e-4cfb-ba28-76363eab42f1', '15 cm', true, 4),
('c6a11f32-4151-42a0-ba89-244ebdfb75a5', '62e25827-81a3-43cf-8fc0-fc7559b5b086', 'sudut-sudutnya sama', false, 1),
('1072571c-b7d7-4227-ba5f-bf01fd324c30', '62e25827-81a3-43cf-8fc0-fc7559b5b086', 'ukuran sama, bentuk berbeda', false, 2),
('6f4fd72f-0253-4d24-8fd5-30f8875a84cd', '62e25827-81a3-43cf-8fc0-fc7559b5b086', 'bentuk dan ukurannya sama', true, 3),
('835d6cb1-7178-44b5-bdbd-2580db7715b7', '62e25827-81a3-43cf-8fc0-fc7559b5b086', 'bentuk sama, ukuran berbeda', false, 4),
('453edd58-9617-473c-a3c3-c44f78eef487', '0b55ff09-4f9b-4fb4-aad2-a1c7023845ea', 'AAS (Sudut-Sudut-Sisi)', false, 1),
('f092d7ce-9e2b-461b-99ec-694927645a02', '0b55ff09-4f9b-4fb4-aad2-a1c7023845ea', 'ASA (Sudut-Sisi-Sudut)', true, 2),
('1b4eb26d-a47e-41e1-b207-f27b08ac3385', '0b55ff09-4f9b-4fb4-aad2-a1c7023845ea', 'SAS (Sisi-Sudut-Sisi)', false, 3),
('1223470e-1849-4df5-8c07-8c94da1d6453', '0b55ff09-4f9b-4fb4-aad2-a1c7023845ea', 'SSS (Sisi-Sisi-Sisi)', false, 4),
('f599f2c4-2662-4bd2-af3f-a1fbfc7d7667', '21f9bc58-5504-4a7e-8188-5ba0db6dafea', '$6 \times 10$ cm', false, 1),
('0db7dd27-d58f-4439-a128-fd7615fabbcb', '21f9bc58-5504-4a7e-8188-5ba0db6dafea', '$3 \times 5$ cm', false, 2),
('3c640786-8a50-43a0-b770-52e9b22f9a94', '21f9bc58-5504-4a7e-8188-5ba0db6dafea', '$15 \times 25$ cm', false, 3),
('5ae2cc2d-c009-483b-bb7b-65ba8e4c3d5a', '21f9bc58-5504-4a7e-8188-5ba0db6dafea', '$12 \times 20$ cm', true, 4),
('5c97d841-1b60-4995-ab3d-7adacffca472', 'f8383e7d-f757-4836-828b-9bb01d4966b9', '$30$', false, 1),
('894700e9-579b-4f76-b468-cb43c956019e', 'f8383e7d-f757-4836-828b-9bb01d4966b9', '$6$', true, 2),
('006ed870-87e6-4ab9-b49d-1bfebe23ab6b', 'f8383e7d-f757-4836-828b-9bb01d4966b9', '$7$', false, 3),
('d82705fb-3037-4196-b390-afc7b6e131f5', 'f8383e7d-f757-4836-828b-9bb01d4966b9', '$5$', false, 4),
('4ef57a79-22a3-46e6-8750-8d7ef3e63536', 'dae5121a-63bb-48e6-b24f-5c64e01eaec4', '$6$', true, 1),
('e86bbfda-b9e7-4fcb-be28-5d2623d8028e', 'dae5121a-63bb-48e6-b24f-5c64e01eaec4', '$7$', false, 2),
('1ef857a6-e069-4108-b694-d68ae824b9fe', 'dae5121a-63bb-48e6-b24f-5c64e01eaec4', '$5$', false, 3),
('477964c5-2d58-4556-a319-94a09f324484', 'dae5121a-63bb-48e6-b24f-5c64e01eaec4', '$6{,}5$', false, 4),
('7fca7ad3-08d5-4775-9ad5-2625caa6490d', '96cc158d-7889-4c2c-86c2-42dbceed39bd', '$\frac{2}{5}$', true, 1),
('892cec49-cfe1-4699-8b0a-4eaacd0b708f', '96cc158d-7889-4c2c-86c2-42dbceed39bd', '$\frac{3}{5}$', false, 2),
('de17c145-c960-42bc-bc5a-de308a9f98de', '96cc158d-7889-4c2c-86c2-42dbceed39bd', '$\frac{3}{10}$', false, 3),
('3aaebafc-bdd9-4423-8416-ab506f224403', '96cc158d-7889-4c2c-86c2-42dbceed39bd', '$\frac{1}{2}$', false, 4),
('d1062796-0daf-4042-b94f-69322e532aec', '4d8f1aaa-8853-4571-8018-e46836d30e81', '$6$', true, 1),
('d2388994-f9fa-4b4e-94e6-672c9fb0aaa7', '4d8f1aaa-8853-4571-8018-e46836d30e81', '$7$', false, 2),
('31e1c7e4-a605-4182-ab40-0c91ab06cf3c', '4d8f1aaa-8853-4571-8018-e46836d30e81', '$5$', false, 3),
('cd2487ba-5391-4007-8156-c2822d6047fe', '4d8f1aaa-8853-4571-8018-e46836d30e81', '$4$', false, 4)
ON CONFLICT (id) DO UPDATE SET
  soal_id = EXCLUDED.soal_id,
  teks_opsi = EXCLUDED.teks_opsi,
  benar = EXCLUDED.benar,
  urutan = EXCLUDED.urutan;
