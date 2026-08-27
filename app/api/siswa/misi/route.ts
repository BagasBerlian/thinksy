import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
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

    const todayStr = new Date().toISOString().split("T")[0];

    // Check today's real activity
    const { data: presensi } = await adminDb
      .from("presensi")
      .select("id")
      .eq("siswa_id", user.id)
      .eq("tanggal", todayStr)
      .maybeSingle();

    const { data: completedSesi } = await adminDb
      .from("sesi")
      .select("id")
      .eq("siswa_id", user.id)
      .eq("status_sesi", "selesai");

    const isPresensiPresent = Boolean(presensi);
    const hasCompletedSesi = Boolean(completedSesi && completedSesi.length > 0);

    // 1. Ambil misi harian siswa untuk tanggal hari ini via adminDb
    let { data: existingMisi } = await adminDb
      .from("misi_harian")
      .select("*")
      .eq("siswa_id", user.id)
      .eq("tanggal", todayStr);

    if (!existingMisi || existingMisi.length === 0) {
      // Create default daily missions with real UUIDs in database
      const defaultMissions = [
        {
          siswa_id: user.id,
          judul: "Presensi Selfie Harian",
          progres_saat_ini: isPresensiPresent ? 1 : 0,
          target_max: 1,
          poin_hadiah: 20,
          diklaim: false,
          tanggal: todayStr,
        },
        {
          siswa_id: user.id,
          judul: "Selesaikan 1 Kuis / Latihan",
          progres_saat_ini: hasCompletedSesi ? 1 : 0,
          target_max: 1,
          poin_hadiah: 50,
          diklaim: false,
          tanggal: todayStr,
        },
        {
          siswa_id: user.id,
          judul: "Eksplorasi Soal Sokratik",
          progres_saat_ini: 0,
          target_max: 3,
          poin_hadiah: 30,
          diklaim: false,
          tanggal: todayStr,
        },
      ];

      const { data: createdMissions, error: insertErr } = await adminDb
        .from("misi_harian")
        .insert(defaultMissions)
        .select();

      if (insertErr) {
        console.error("[MISI GET INSERT ERROR]", insertErr.message);
      } else if (createdMissions) {
        existingMisi = createdMissions;
      }
    } else {
      // Dynamically sync progress for existing unclaimed missions
      for (const m of existingMisi) {
        if (!m.diklaim) {
          let updatedProgress = m.progres_saat_ini;
          if (m.judul.includes("Presensi") && isPresensiPresent) {
            updatedProgress = 1;
          } else if (m.judul.includes("Kuis") && hasCompletedSesi) {
            updatedProgress = 1;
          }
          if (updatedProgress !== m.progres_saat_ini) {
            m.progres_saat_ini = updatedProgress;
            await adminDb
              .from("misi_harian")
              .update({ progres_saat_ini: updatedProgress })
              .eq("id", m.id);
          }
        }
      }
    }

    const missionsList = existingMisi || [];

    return NextResponse.json({
      success: true,
      missions: missionsList,
      misi: missionsList,
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

    const isValidUUID = (str: string) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    let misi: any = null;

    if (isValidUUID(targetMisiId)) {
      const { data } = await adminDb
        .from("misi_harian")
        .select("*")
        .eq("id", targetMisiId)
        .eq("siswa_id", user.id)
        .maybeSingle();
      misi = data;
    }

    const todayStr = new Date().toISOString().split("T")[0];

    // Fallback lookup: Jika targetMisiId berupa ID fallback ("m1", "m2", "m3") atau UUID belum ada
    if (!misi) {
      let { data: todayMissions } = await adminDb
        .from("misi_harian")
        .select("*")
        .eq("siswa_id", user.id)
        .eq("tanggal", todayStr);

      if (!todayMissions || todayMissions.length === 0) {
        const { data: presensi } = await adminDb
          .from("presensi")
          .select("id")
          .eq("siswa_id", user.id)
          .eq("tanggal", todayStr)
          .maybeSingle();

        const { data: completedSesi } = await adminDb
          .from("sesi")
          .select("id")
          .eq("siswa_id", user.id)
          .eq("status_sesi", "selesai");

        const defaultMissions = [
          {
            siswa_id: user.id,
            judul: "Presensi Selfie Harian",
            progres_saat_ini: presensi ? 1 : 0,
            target_max: 1,
            poin_hadiah: 20,
            diklaim: false,
            tanggal: todayStr,
          },
          {
            siswa_id: user.id,
            judul: "Selesaikan 1 Kuis / Latihan",
            progres_saat_ini: (completedSesi && completedSesi.length > 0) ? 1 : 0,
            target_max: 1,
            poin_hadiah: 50,
            diklaim: false,
            tanggal: todayStr,
          },
          {
            siswa_id: user.id,
            judul: "Eksplorasi Soal Sokratik",
            progres_saat_ini: 0,
            target_max: 3,
            poin_hadiah: 30,
            diklaim: false,
            tanggal: todayStr,
          },
        ];

        const { data: created } = await adminDb
          .from("misi_harian")
          .insert(defaultMissions)
          .select();
        todayMissions = created || [];
      }

      if (todayMissions && todayMissions.length > 0) {
        if (targetMisiId === "m1" || targetMisiId?.toLowerCase().includes("presensi")) {
          misi = todayMissions.find((m: any) => m.judul.toLowerCase().includes("presensi"));
        } else if (targetMisiId === "m2" || targetMisiId?.toLowerCase().includes("kuis")) {
          misi = todayMissions.find((m: any) => m.judul.toLowerCase().includes("kuis") || m.judul.toLowerCase().includes("latihan"));
        } else if (targetMisiId === "m3" || targetMisiId?.toLowerCase().includes("sokratik")) {
          misi = todayMissions.find((m: any) => m.judul.toLowerCase().includes("sokratik") || m.judul.toLowerCase().includes("tutor"));
        }
        if (!misi) {
          misi = todayMissions[0];
        }
      }
    }

    if (!misi) {
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

    // 3. Verifikasi pencapaian target progres (jika misi presensi & user sudah presensi hari ini, izinkan klaim)
    const { data: checkPresensi } = await adminDb
      .from("presensi")
      .select("id")
      .eq("siswa_id", user.id)
      .eq("tanggal", todayStr)
      .maybeSingle();

    if (misi.judul.toLowerCase().includes("presensi") && checkPresensi) {
      misi.progres_saat_ini = 1;
    }

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
    const { error: claimErr } = await adminDb
      .from("misi_harian")
      .update({ diklaim: true, progres_saat_ini: misi.progres_saat_ini })
      .eq("id", misi.id)
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

    const poinAwal = profil?.poin ?? 0;
    const poinDitambahkan = Number(misi.poin_hadiah || 20);
    const poinTotal = poinAwal + poinDitambahkan;

    await adminDb
      .from("profil")
      .update({ poin: poinTotal })
      .eq("id", user.id);

    // 6. Catat notifikasi klaim
    try {
      await adminDb.from("notifikasi").insert({
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
