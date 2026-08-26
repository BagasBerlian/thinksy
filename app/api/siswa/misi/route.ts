import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Anda harus masuk terlebih dahulu." },
        { status: 401 }
      );
    }

    const todayStr = new Date().toISOString().split("T")[0];

    // 1. Ambil misi harian siswa untuk tanggal hari ini
    const { data: existingMisi } = await supabase
      .from("misi_harian")
      .select("*")
      .eq("siswa_id", user.id)
      .eq("tanggal", todayStr);

    if (existingMisi && existingMisi.length > 0) {
      return NextResponse.json({
        success: true,
        missions: existingMisi,
      });
    }

    // 2. Jika belum ada misi hari ini, hitung progres awal dari aktivitas hari ini
    const { data: presensi } = await supabase
      .from("presensi")
      .select("id")
      .eq("siswa_id", user.id)
      .eq("tanggal", todayStr)
      .maybeSingle();

    const { data: completedSesi } = await supabase
      .from("sesi")
      .select("id")
      .eq("siswa_id", user.id)
      .eq("status_sesi", "selesai");

    const defaultMissions = [
      {
        siswa_id: user.id,
        judul: "Absen Pagi Tepat Waktu",
        progres_saat_ini: presensi ? 1 : 0,
        target_max: 1,
        poin_hadiah: 20,
        diklaim: false,
        tanggal: todayStr,
      },
      {
        siswa_id: user.id,
        judul: "Selesaikan 1 Latihan Matematika",
        progres_saat_ini: (completedSesi?.length || 0) > 0 ? 1 : 0,
        target_max: 1,
        poin_hadiah: 30,
        diklaim: false,
        tanggal: todayStr,
      },
      {
        siswa_id: user.id,
        judul: "Tanya 1 Pertanyaan ke Tutor AI",
        progres_saat_ini: 0,
        target_max: 1,
        poin_hadiah: 25,
        diklaim: false,
        tanggal: todayStr,
      },
    ];

    const { data: createdMissions, error: insertErr } = await supabase
      .from("misi_harian")
      .insert(defaultMissions)
      .select();

    if (insertErr) {
      console.error("[MISI GET INSERT ERROR]", insertErr.message);
      return NextResponse.json(
        { error: "Gagal membuat misi harian: " + insertErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      missions: createdMissions || defaultMissions,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Terjadi kesalahan server: " + err.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const adminDb = createAdminClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Anda harus masuk terlebih dahulu." },
        { status: 401 }
      );
    }

    let body: { misiId?: string; id?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Format request body tidak valid." },
        { status: 400 }
      );
    }

    const targetMisiId = body.misiId || body.id;
    if (!targetMisiId) {
      return NextResponse.json(
        { error: "Parameter misiId (UUID) wajib diisi." },
        { status: 400 }
      );
    }

    // 1. Ambil misi harian berdasarkan ID UUID dan siswa_id
    const { data: misi, error: misiError } = await supabase
      .from("misi_harian")
      .select("*")
      .eq("id", targetMisiId)
      .eq("siswa_id", user.id)
      .single();

    if (misiError || !misi) {
      return NextResponse.json(
        { success: false, error: "Misi tidak ditemukan." },
        { status: 404 }
      );
    }

    // 2. Verifikasi status klaim
    if (misi.diklaim === true) {
      return NextResponse.json(
        { success: false, error: "Misi ini sudah diklaim sebelumnya." },
        { status: 400 }
      );
    }

    // 3. Verifikasi pencapaian target progres
    if (Number(misi.progres_saat_ini) < Number(misi.target_max)) {
      return NextResponse.json(
        {
          success: false,
          error: "Misi belum selesai. Progres belum mencapai target.",
        },
        { status: 400 }
      );
    }

    // 4. Update status diklaim=true pada tabel misi_harian
    const { error: claimErr } = await supabase
      .from("misi_harian")
      .update({ diklaim: true })
      .eq("id", targetMisiId)
      .eq("siswa_id", user.id);

    if (claimErr) {
      return NextResponse.json(
        { success: false, error: "Gagal memperbarui status klaim misi: " + claimErr.message },
        { status: 500 }
      );
    }

    // 5. Tambahkan poin ke profil siswa
    const { data: profil } = await adminDb
      .from("profil")
      .select("poin")
      .eq("id", user.id)
      .single();

    const poinAwal = profil?.poin ?? 1250;
    const poinDitambahkan = Number(misi.poin_hadiah || 20);
    const poinTotal = poinAwal + poinDitambahkan;

    await adminDb
      .from("profil")
      .update({ poin: poinTotal })
      .eq("id", user.id);

    // 6. Catat notifikasi klaim
    try {
      await supabase.from("notifikasi").insert({
        user_id: user.id,
        judul: "Klaim Misi Harian Berhasil",
        pesan: `Selamat! Anda berhasil mengklaim +${poinDitambahkan} poin dari misi "${misi.judul}".`,
        tipe: "urgent",
        dibaca: false,
      });
    } catch {
      // ignore if notification table fails
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil mengklaim +${poinDitambahkan} poin dari misi "${misi.judul}"!`,
      poinDitambahkan: poinDitambahkan,
      poinTotal: poinTotal,
      misiId: targetMisiId,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server: " + err.message },
      { status: 500 }
    );
  }
}
