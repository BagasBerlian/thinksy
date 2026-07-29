-- ============================================================================
-- SEED DATA - APLIKASI PEMBELAJARAN AI (MATEMATIKA KELAS 8)
-- ============================================================================

-- 1. SEED SEKOLAH DUMMY (SMP NEGERI 1 NUSANTARA)
INSERT INTO sekolah (id, nama, npsn, alamat)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'SMP Negeri 1 Nusantara',
    '20101010',
    'Jl. Pendidikan No. 1, Jakarta'
)
ON CONFLICT (id) DO NOTHING;

-- 2. SEED BAB MATEMATIKA KELAS 8 (BAB 1: POLA BILANGAN & BARISAN)
INSERT INTO bab (id, sekolah_id, judul, deskripsi, urutan)
VALUES (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Bab 1: Pola Bilangan & Barisan',
    'Mengenal jenis-jenis pola bilangan, barisan aritmatika, dan deret geometri.',
    1
)
ON CONFLICT (id) DO NOTHING;

-- 3. SEED MATERI PEMBELAJARAN (MATERI 1 & MATERI 2)
INSERT INTO materi (id, bab_id, judul, konten_markdown, urutan)
VALUES 
(
    'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'Mengenal Pola Bilangan Aritmatika',
    '# Mengenal Pola Bilangan Aritmatika

Pola bilangan aritmatika adalah susunan angka yang memiliki **selisih (beda)** yang tetap antara dua suku berurutan.

## Rumus Suku ke-$n$ ($U_n$)
Rumus umum untuk mencari suku ke-$n$ pada barisan aritmatika adalah:

$$U_n = a + (n - 1)b$$

**Keterangan:**
* $U_n$ = Suku ke-$n$
* $a$ = Suku pertama ($U_1$)
* $b$ = Beda / selisih ($U_n - U_{n-1}$)
* $n$ = Urutan suku

### Contoh Soal:
Diketahui barisan aritmatika: $3, 7, 11, 15, \dots$
Tentukan suku ke-$10$ ($U_{10}$)!

**Penyelesaian:**
* $a = 3$
* $b = 7 - 3 = 4$
* $n = 10$

$$U_{10} = 3 + (10 - 1) \times 4 = 3 + (9 \times 4) = 3 + 36 = 39$$

Jadi, suku ke-10 dari barisan tersebut adalah **39**.',
    1
),
(
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'Barisan dan Deret Geometri',
    '# Barisan dan Deret Geometri

Barisan geometri adalah barisan bilangan yang memiliki **rasio (pembanding)** yang tetap antara dua suku yang berurutan.

## Rumus Suku ke-$n$ ($U_n$)
Rumus umum suku ke-$n$ pada barisan geometri adalah:

$$U_n = a \cdot r^{n-1}$$

**Keterangan:**
* $U_n$ = Suku ke-$n$
* $a$ = Suku pertama
* $r$ = Rasio ($\frac{U_n}{U_{n-1}}$)

## Rumus Jumlah $n$ Suku Pertama ($S_n$)
Untuk $r > 1$:
$$S_n = \frac{a(r^n - 1)}{r - 1}$$

Untuk $r < 1$:
$$S_n = \frac{a(1 - r^n)}{1 - r}$$

### Contoh Soal:
Diketahui barisan geometri: $2, 6, 18, 54, \dots$
Tentukan suku ke-$5$ ($U_5$)!

**Penyelesaian:**
* $a = 2$
* $r = \frac{6}{2} = 3$

$$U_5 = 2 \cdot 3^{5-1} = 2 \cdot 3^4 = 2 \cdot 81 = 162$$

Jadi, suku ke-5 dari barisan geometri tersebut adalah **162**.',
    2
)
ON CONFLICT (id) DO NOTHING;

-- 4. SEED BANK SOAL (PILGAN & ESAI)
INSERT INTO soal (id, bab_id, materi_id, pertanyaan, tipe_soal, tingkat_soal, sumber_konten, status_soal, kunci_jawaban, pembahasan)
VALUES
(
    'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'Diketahui barisan aritmatika $3, 7, 11, 15, \dots$. Tentukan nilai dari suku ke-10 ($U_{10}$)!',
    'pilihan_ganda',
    'sedang',
    'manual',
    'dipublikasi',
    '39',
    'Gunakan rumus $U_n = a + (n-1)b$ dengan $a=3, b=4, n=10$. Maka $U_{10} = 3 + 9(4) = 39$.'
),
(
    'd2eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    'Jelaskan perbedaan mendasar antara **Barisan Aritmatika** dan **Barisan Geometri**, serta berikan masing-masing 1 contoh barisan bilangan sederhana!',
    'esai',
    'sedang',
    'manual',
    'dipublikasi',
    'Barisan aritmatika memiliki beda/selisih (b) yang tetap antar suku berurutan (contoh: 2, 4, 6, 8 dengan beda 2). Barisan geometri memiliki rasio/pembanding (r) yang tetap antar suku berurutan (contoh: 2, 4, 8, 16 dengan rasio 2).',
    'Penilaian esai berfokus pada konsep selisih/beda vs rasio/pembanding beserta keakuratan contoh.'
)
ON CONFLICT (id) DO NOTHING;

-- 5. SEED OPSI SOAL PILIHAN GANDA
INSERT INTO opsi_soal (id, soal_id, teks_opsi, benar, urutan)
VALUES
('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a77', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', '35', false, 1),
('e2eebc99-9c0b-4ef8-bb6d-6bb9bd380a88', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', '39', true, 2),
('e3eebc99-9c0b-4ef8-bb6d-6bb9bd380a99', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', '43', false, 3),
('e4eebc99-9c0b-4ef8-bb6d-6bb9bd380aaa', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', '47', false, 4)
ON CONFLICT (id) DO NOTHING;
