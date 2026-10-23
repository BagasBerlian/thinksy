import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const adminDb = createAdminClient();

    // 1. Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Anda harus masuk terlebih dahulu." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { sesiId, soalId, opsiId, jawabanTeks } = body;

    if (!sesiId || !soalId) {
      return NextResponse.json(
        { error: "Parameter sesiId dan soalId wajib diisi." },
        { status: 400 }
      );
    }

    // 2. Verifikasi kepemilikan sesi
    const { data: sesi, error: sesiErr } = await adminDb
      .from("sesi")
      .select("id, siswa_id, tipe_sesi, status_sesi")
      .eq("id", sesiId)
      .maybeSingle();

    if (sesiErr || !sesi) {
      return NextResponse.json(
        { error: "Sesi tidak ditemukan." },
        { status: 404 }
      );
    }

    if (sesi.siswa_id !== user.id) {
      return NextResponse.json(
        { error: "Akses ditolak: sesi bukan milik Anda." },
        { status: 403 }
      );
    }

    // 3. Ambil data soal & kunci jawaban dari DB (Server-Side Only)
    let soal: any = null;
    const { data: dbSoal } = await adminDb
      .from("soal")
      .select(`
        id,
        tipe_soal,
        kunci_jawaban,
        pembahasan,
        poin,
        opsi_soal (
          id,
          label,
          teks_opsi,
          benar,
          alasan_salah
        )
      `)
      .eq("id", soalId)
      .maybeSingle();

    soal = dbSoal;

    if (!soal) {
      // Cek apakah soal adalah soal kurikulum / fallback dari bab
      const { data: sesiRow } = await adminDb
        .from("sesi")
        .select("bab_id, bab:bab_id(judul, mapel)")
        .eq("id", sesiId)
        .maybeSingle();

      const { generateChapterQuestions } = await import("@/lib/curriculum-quiz-engine");
      const babJudul = (sesiRow?.bab as any)?.judul || "Pola Bilangan";
      const mapel = (sesiRow?.bab as any)?.mapel || "Matematika";
      const chapterQuestions = generateChapterQuestions(babJudul, mapel, 8);
      const foundQ = chapterQuestions.find((q) => q.id === soalId);

      if (foundQ) {
        soal = {
          id: foundQ.id,
          tipe_soal: foundQ.tipeSoal,
          kunci_jawaban: foundQ.kunciJawaban,
          pembahasan: foundQ.pembahasan,
          poin: 10,
          opsi_soal: foundQ.opsiSoal?.map((o, idx) => ({
            id: o.id,
            label: String.fromCharCode(65 + idx),
            teks_opsi: o.teksOpsi,
            benar: o.benar,
            alasan_salah: o.benar
              ? null
              : `Jawaban ini keliru. Perhatikan kembali konsep pada pembahasan.`,
          })) || [],
        };
      }
    }

    if (!soal) {
      return NextResponse.json(
        { error: "Soal tidak ditemukan." },
        { status: 404 }
      );
    }

    // 4. Hitung kebenaran jawaban berdasarkan tipe soal
    let isBenar: boolean | null = null;
    let selectedOption: any = null;
    let calculatedNilai: number | null = 0;
    const poinMaks = soal.poin || 10;

    if (soal.tipe_soal === "pilihan_ganda") {
      if (opsiId && Array.isArray(soal.opsi_soal)) {
        selectedOption = soal.opsi_soal.find((o: any) => o.id === opsiId);
        isBenar = Boolean(selectedOption?.benar);
        calculatedNilai = isBenar ? poinMaks : 0;
      }
    } else if (soal.tipe_soal === "isian_singkat") {
      const studentInput = (jawabanTeks || "").trim().toLowerCase().replace(/\s+/g, " ");
      const officialKey = (soal.kunci_jawaban || "").trim().toLowerCase().replace(/\s+/g, " ");

      if (studentInput && officialKey) {
        const keyOptions = officialKey.split(/[,/|]/).map((k: string) => k.trim());
        isBenar = keyOptions.includes(studentInput);
        calculatedNilai = isBenar ? poinMaks : 0;
      } else {
        isBenar = false;
        calculatedNilai = 0;
      }
    } else {
      // Esai: Menunggu penilaian AI/Guru
      isBenar = null;
      calculatedNilai = null;
    }

    // 5. Simpan ke tabel `jawaban` (Upsert per sesi_id & soal_id jika UUID valid)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(soalId);
    if (isUuid) {
      await adminDb
        .from("jawaban")
        .upsert(
          {
            sesi_id: sesiId,
            soal_id: soalId,
            opsi_dipilih_id: opsiId || null,
            jawaban_teks: jawabanTeks || (selectedOption?.teks_opsi ?? null),
            is_benar: isBenar,
            nilai: calculatedNilai,
            dijawab_pada: new Date().toISOString(),
          },
          { onConflict: "sesi_id,soal_id" }
        );
    }

    // 6. Response berbasis jenis sesi (Handbook: latihan kembalikan feedback langsung, kuis HANYA simpan)
    const isLatihan = sesi.tipe_sesi === "latihan";

    if (isLatihan) {
      const correctOption = Array.isArray(soal.opsi_soal)
        ? soal.opsi_soal.find((o: any) => o.benar)
        : null;

      return NextResponse.json({
        success: true,
        mode: "latihan",
        isBenar,
        nilai: calculatedNilai,
        pembahasan: soal.pembahasan || "Pembahasan untuk soal ini belum tersedia.",
        alasanSalah: isBenar ? null : (selectedOption?.alasan_salah || "Jawaban belum tepat, silakan pelajari kembali konsepnya."),
        kunciJawaban: soal.kunci_jawaban || correctOption?.teks_opsi,
        correctOpsiId: correctOption?.id || null,
        correctOpsiLabel: correctOption?.label || null,
        correctOpsiTeks: correctOption?.teks_opsi || null,
      });
    }

    // Quiz & Assessment: Kunci jawaban & pembahasan RAHASIA MUTLAK
    return NextResponse.json({
      success: true,
      mode: "quiz",
      saved: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Gagal memproses jawaban." },
      { status: 500 }
    );
  }
}
