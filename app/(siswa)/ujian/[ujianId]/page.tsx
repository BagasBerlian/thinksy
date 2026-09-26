import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import ExamRoomClient from "./ExamRoomClient";

export default async function DetailUjianPage({
  params,
}: {
  params: Promise<{ ujianId: string }>;
}) {
  const { ujianId } = await params;
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const SIMULASI_ALIAS_MAP: Record<string, string> = {
    "sim-literasi": "e7eebc99-9c0b-4ef8-bb6d-6bb9bd380a77",
    "sim-numerasi": "e8eebc99-9c0b-4ef8-bb6d-6bb9bd380a88",
    "sim-karakter": "e9eebc99-9c0b-4ef8-bb6d-6bb9bd380a99",
  };
  const effectiveUjianId = SIMULASI_ALIAS_MAP[ujianId] || ujianId;

  // 1. Ambil detail Ujian
  let { data: ujian } = await adminSupabase
    .from("ujian")
    .select(`
      id,
      judul,
      deskripsi,
      mapel,
      tipe,
      durasi_menit,
      passing_grade,
      waktu_mulai,
      waktu_berakhir,
      status,
      bab_id
    `)
    .eq("id", effectiveUjianId)
    .maybeSingle();

  if (!ujian && (ujianId.startsWith("ulangan-bab-") || ujianId.length > 20)) {
    const babId = ujianId.startsWith("ulangan-bab-") ? ujianId.replace("ulangan-bab-", "") : ujianId;
    const { data: ujianByBab } = await adminSupabase
      .from("ujian")
      .select(`
        id,
        judul,
        deskripsi,
        mapel,
        tipe,
        durasi_menit,
        passing_grade,
        waktu_mulai,
        waktu_berakhir,
        status,
        bab_id
      `)
      .eq("bab_id", babId)
      .maybeSingle();

    if (ujianByBab) {
      ujian = ujianByBab;
    } else {
      const { data: babData } = await adminSupabase
        .from("bab")
        .select("id, judul, deskripsi, mapel, sekolah_id")
        .eq("id", babId)
        .maybeSingle();

      const { data: createdUjian } = await adminSupabase
        .from("ujian")
        .insert({
          judul: babData?.judul
            ? babData.judul.startsWith("Bab")
              ? `Ulangan Harian ${babData.judul}`
              : `Ulangan Harian: ${babData.judul}`
            : "Ulangan Harian Siswa",
          deskripsi: babData?.deskripsi || "Evaluasi formatif kurikulum terstandar.",
          mapel: babData?.mapel || "Matematika",
          tipe: "ulangan",
          durasi_menit: 30,
          passing_grade: 75,
          status: "dipublikasi",
          token: "12345",
          bab_id: babId,
          sekolah_id: babData?.sekolah_id || "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        })
        .select(`
          id,
          judul,
          deskripsi,
          mapel,
          tipe,
          durasi_menit,
          passing_grade,
          waktu_mulai,
          waktu_berakhir,
          status,
          bab_id
        `)
        .maybeSingle();

      if (createdUjian) {
        ujian = createdUjian;
      }
    }
  }

  if (!ujian) {
    notFound();
  }

  // Security Check: Verify user role and exam status
  const { data: userProfil } = await adminSupabase
    .from("profil")
    .select("peran")
    .eq("id", user?.id || "")
    .maybeSingle();

  const isStaff = ["guru", "admin_sekolah", "superadmin"].includes(userProfil?.peran || "");
  const now = new Date();
  const startTime = ujian.waktu_mulai ? new Date(ujian.waktu_mulai) : new Date(0);
  const endTime = ujian.waktu_berakhir ? new Date(ujian.waktu_berakhir) : new Date(Date.now() + 86400000);
  // Status dipublikasi yang disetel oleh guru adalah penentu utama keterbukaan ujian, simulasi selalu terbuka
  const isAvailable = ujian.status === "dipublikasi" || ujian.tipe === "simulasi";

  // Block unauthorized direct URL access if exam is not active
  if (!isAvailable && !isStaff) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto text-2xl shadow-inner">
            🔒
          </div>
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-200 text-xs font-black uppercase tracking-wider">
              Akses Dibatasi
            </span>
            <h2 className="text-xl font-black text-[#0F172A]">
              Ujian Belum Tersedia
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Ujian/Ulangan <strong>&quot;{ujian.judul}&quot;</strong> belum dibuka oleh Guru pengampu atau waktu pengerjaan telah berakhir. Akses langsung melalui URL dinonaktifkan demi integritas ujian.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Status Server:</span>
              <span className="font-bold text-slate-800 uppercase">{ujian.status === 'dipublikasi' ? 'Menunggu Jadwal' : 'Ditutup'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Mulai:</span>
              <span className="font-bold text-slate-800">{startTime.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })} WIB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Selesai:</span>
              <span className="font-bold text-slate-800">{endTime.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })} WIB</span>
            </div>
          </div>

          <a
            href="/"
            className="block w-full py-3 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
          >
            ← Kembali ke Dashboard
          </a>
        </div>
      </div>
    );
  }
  const { data: ujianSoalList } = await adminSupabase
    .from("ujian_soal")
    .select(`
      id,
      urutan,
      poin_bobot,
      soal:soal_id (
        id,
        pertanyaan,
        tipe_soal,
        tingkat_soal,
        pembahasan,
        kunci_jawaban,
        opsi_soal (
          id,
          teks_opsi,
          benar,
          urutan
        )
      )
    `)
    .eq("ujian_id", effectiveUjianId)
    .order("urutan", { ascending: true });

  let formattedQuestions: Array<{
    id: string;
    urutan: number;
    pertanyaan: string;
    tipe_soal: string;
    poin_bobot: number;
    pembahasan?: string | null;
    kunci_jawaban?: string | null;
    opsi: Array<{ id: string; teks_opsi: string; urutan: number; benar?: boolean }>;
  }> = [];

  if (ujianSoalList && ujianSoalList.length > 0) {
    formattedQuestions = ujianSoalList.map((item: any, idx: number) => {
      const s = item.soal;
      const rawOpsi = Array.isArray(s?.opsi_soal) ? s.opsi_soal : [];
      const sortedOpsi = rawOpsi.sort((a: any, b: any) => (a.urutan || 0) - (b.urutan || 0));
      const hasBenar = sortedOpsi.some((o: any) => o.benar);

      return {
        id: s?.id || item.id,
        urutan: item.urutan || idx + 1,
        pertanyaan: s?.pertanyaan || "Pertanyaan ujian",
        tipe_soal: s?.tipe_soal || "pilihan_ganda",
        poin_bobot: item.poin_bobot || 5,
        pembahasan: s?.pembahasan || null,
        kunci_jawaban: s?.kunci_jawaban || null,
        opsi: sortedOpsi.map((o: any) => ({
          id: o.id,
          teks_opsi: o.teks_opsi,
          urutan: o.urutan,
          benar:
            o.benar === true ||
            (!hasBenar &&
              Boolean(s?.kunci_jawaban) &&
              o.teks_opsi?.trim().toLowerCase() === s?.kunci_jawaban?.trim().toLowerCase()),
        })),
      };
    });
  } else {
    // Fallback dari tabel soal
    let query = adminSupabase
      .from("soal")
      .select(`
        id,
        pertanyaan,
        tipe_soal,
        pembahasan,
        kunci_jawaban,
        opsi_soal (
          id,
          teks_opsi,
          benar,
          urutan
        )
      `);

    if (ujian.bab_id) {
      query = query.eq("bab_id", ujian.bab_id);
    }

    const { data: fallbackQuestions } = await query.order("urutan", { ascending: true }).limit(20);

    if (fallbackQuestions && fallbackQuestions.length > 0) {
      formattedQuestions = fallbackQuestions.map((q: any, idx: number) => {
        const rawOpsi = Array.isArray(q.opsi_soal) ? q.opsi_soal : [];
        const sortedOpsi = rawOpsi.sort((a: any, b: any) => (a.urutan || 0) - (b.urutan || 0));
        const hasBenar = sortedOpsi.some((o: any) => o.benar);

        return {
          id: q.id,
          urutan: idx + 1,
          pertanyaan: q.pertanyaan,
          tipe_soal: q.tipe_soal || "pilihan_ganda",
          poin_bobot: 5,
          pembahasan: q.pembahasan || null,
          kunci_jawaban: q.kunci_jawaban || null,
          opsi: sortedOpsi.map((o: any) => ({
            id: o.id,
            teks_opsi: o.teks_opsi,
            urutan: o.urutan,
            benar:
              o.benar === true ||
              (!hasBenar &&
                Boolean(q.kunci_jawaban) &&
                o.teks_opsi?.trim().toLowerCase() === q.kunci_jawaban?.trim().toLowerCase()),
          })),
        };
      });
    }
  }

  // 3. Ambil sesi_ujian siswa saat ini jika ada
  let currentSession = null;
  let savedAnswers: Record<
    string,
    {
      opsiId?: string;
      jawabanEsai?: string;
      isBenar?: boolean | null;
      skorDiperoleh?: number;
      koreksiAi?: string;
    }
  > = {};
  let remainingSeconds = (ujian.durasi_menit || 60) * 60;

  if (user) {
    const { data: sesiSiswa } = await adminSupabase
      .from("sesi_ujian")
      .select("*")
      .eq("ujian_id", effectiveUjianId)
      .eq("siswa_id", user.id)
      .maybeSingle();

    if (sesiSiswa) {
      currentSession = sesiSiswa;

      const { data: jawabanList } = await adminSupabase
        .from("jawaban_ujian")
        .select("soal_id, opsi_dipilih_id, jawaban_esai, is_benar, skor_diperoleh, koreksi_ai")
        .eq("sesi_ujian_id", sesiSiswa.id);

      if (jawabanList) {
        jawabanList.forEach((j) => {
          savedAnswers[j.soal_id] = {
            opsiId: j.opsi_dipilih_id || undefined,
            jawabanEsai: j.jawaban_esai || undefined,
            isBenar: j.is_benar,
            skorDiperoleh: j.skor_diperoleh ? Number(j.skor_diperoleh) : 0,
            koreksiAi: j.koreksi_ai || undefined,
          };
        });
      }

      if (sesiSiswa.status === "selesai" || sesiSiswa.status === "habis_waktu") {
        remainingSeconds = 0;
      } else if (sesiSiswa.server_end_time) {
        const now = new Date();
        const endTime = new Date(sesiSiswa.server_end_time);
        const diffMs = endTime.getTime() - now.getTime();
        remainingSeconds = Math.max(0, Math.floor(diffMs / 1000));
      }
    }
  }

  return (
    <ExamRoomClient
      ujian={ujian}
      initialQuestions={formattedQuestions}
      initialSession={currentSession}
      initialSavedAnswers={savedAnswers}
      initialRemainingSeconds={remainingSeconds}
    />
  );
}
