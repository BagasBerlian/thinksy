import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ujianId } = await params;
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verifikasi peran guru atau admin
    const { data: profil } = await adminSupabase
      .from("profil")
      .select("id, peran, sekolah_id")
      .eq("id", user.id)
      .single();

    if (!profil || !["guru", "admin_sekolah", "superadmin"].includes(profil.peran)) {
      return NextResponse.json({ error: "Forbidden: Khusus guru dan pengawas" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { siswaId, mode = "fresh" } = body;

    if (!siswaId) {
      return NextResponse.json({ error: "siswaId wajib disertakan" }, { status: 400 });
    }

    // 1. Cari sesi_ujian untuk siswa dan ujian ini
    const { data: existingSesi } = await adminSupabase
      .from("sesi_ujian")
      .select("id, status, server_start_time, server_end_time")
      .eq("ujian_id", ujianId)
      .eq("siswa_id", siswaId)
      .maybeSingle();

    if (!existingSesi) {
      return NextResponse.json(
        { error: "Sesi ujian siswa tidak ditemukan." },
        { status: 404 }
      );
    }

    // Ambil data ujian untuk durasi jika perpanjangan waktu
    const { data: ujianData } = await adminSupabase
      .from("ujian")
      .select("durasi_menit, judul")
      .eq("id", ujianId)
      .single();

    const durasiMenit = ujianData?.durasi_menit || 60;

    if (mode === "unlock") {
      // MODE BUKA KUNCI: Siswa diizinkan kembali melanjutkan jawaban yang sudah dikerjakan
      const now = new Date();
      // Perpanjang server_end_time jika sisa waktu kurang dari 5 menit
      const currentEnd = new Date(existingSesi.server_end_time);
      let newEnd = currentEnd;
      if (currentEnd.getTime() <= now.getTime()) {
        newEnd = new Date(now.getTime() + durasiMenit * 60 * 1000);
      }

      await adminSupabase
        .from("sesi_ujian")
        .update({
          status: "sedang_mengerjakan",
          server_end_time: newEnd.toISOString(),
        })
        .eq("id", existingSesi.id);

      // Catat audit log
      await adminSupabase.from("audit_log").insert({
        actor_id: user.id,
        role: profil.peran,
        aksi: "EXAM_UNLOCKED_BY_TEACHER",
        target_resource: `sesi_ujian:${existingSesi.id}`,
        detail: { ujianId, siswaId, mode: "unlock" },
      });

      return NextResponse.json({
        success: true,
        message: "Kunci ujian berhasil dibuka. Siswa kini dapat melanjutkan pengerjaan.",
        mode: "unlock",
      });
    } else {
      // MODE FRESH / RESET TOTAL: Hapus jawaban dan hapus sesi sehingga siswa memulai dari awal
      await adminSupabase
        .from("jawaban_ujian")
        .delete()
        .eq("sesi_ujian_id", existingSesi.id);

      await adminSupabase
        .from("sesi_ujian")
        .delete()
        .eq("id", existingSesi.id);

      // Catat audit log
      await adminSupabase.from("audit_log").insert({
        actor_id: user.id,
        role: profil.peran,
        aksi: "EXAM_RESET_BY_TEACHER",
        target_resource: `ujian:${ujianId}:siswa:${siswaId}`,
        detail: { ujianId, siswaId, mode: "fresh" },
      });

      return NextResponse.json({
        success: true,
        message: "Sesi ujian berhasil di-reset total. Siswa dapat memulai kembali ujian dari awal.",
        mode: "fresh",
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

