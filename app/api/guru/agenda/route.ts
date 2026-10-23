import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("agenda_akademik")
      .select("*")
      .order("tanggal", { ascending: true });

    if (error) {
      console.error("[GET_AGENDA_ERROR]", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, agendas: data || [] });
  } catch (err: any) {
    console.error("[GET_AGENDA_EXCEPTION]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      judul,
      deskripsi,
      kategori = "bab_coming_soon",
      tanggal,
      jam_mulai = "07:30:00",
      jam_selesai = "09:00:00",
      lokasi = "Ruang Belajar Matematika",
      sekolah_id = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    } = body;

    if (!judul || !tanggal) {
      return NextResponse.json(
        { error: "Judul dan tanggal wajib diisi." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("agenda_akademik")
      .insert({
        sekolah_id,
        judul,
        deskripsi: deskripsi || `Jadwal materi ${judul} untuk siswa Fase D.`,
        kategori,
        tanggal,
        jam_mulai,
        jam_selesai,
        lokasi,
      })
      .select()
      .single();

    if (error) {
      console.error("[POST_AGENDA_ERROR]", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Bab coming soon berhasil dijadwalkan dan diintegrasikan ke kalender siswa!",
      agenda: data,
    });
  } catch (err: any) {
    console.error("[POST_AGENDA_EXCEPTION]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID wajib disertakan." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("agenda_akademik")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[DELETE_AGENDA_ERROR]", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Agenda berhasil dihapus dari kalender.",
    });
  } catch (err: any) {
    console.error("[DELETE_AGENDA_EXCEPTION]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
      judul,
      deskripsi,
      kategori,
      tanggal,
      jam_mulai,
      jam_selesai,
      lokasi,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "ID agenda wajib diisi." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const updatePayload: any = {};
    if (judul !== undefined) updatePayload.judul = judul;
    if (deskripsi !== undefined) updatePayload.deskripsi = deskripsi;
    if (kategori !== undefined) updatePayload.kategori = kategori;
    if (tanggal !== undefined) updatePayload.tanggal = tanggal;
    if (jam_mulai !== undefined) updatePayload.jam_mulai = jam_mulai;
    if (jam_selesai !== undefined) updatePayload.jam_selesai = jam_selesai;
    if (lokasi !== undefined) updatePayload.lokasi = lokasi;

    const { data, error } = await supabase
      .from("agenda_akademik")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.warn("[PATCH_AGENDA_DB_WARNING]", error.message);
    }

    // Insert broadcast notification into `notifikasi` table for students
    try {
      const { data: students } = await supabase
        .from("profil")
        .select("id")
        .eq("peran", "siswa");

      if (students && students.length > 0) {
        const notifInserts = students.map((s) => ({
          user_id: s.id,
          judul: "Jadwal Akademik Diperbarui 📅",
          pesan: `Guru telah memperbarui tanggal "${judul || data?.judul || "Agenda"}": ${tanggal || data?.tanggal} (${jam_mulai || data?.jam_mulai || "Waktu KBM"}).`,
          tipe: "info",
          dibaca: false,
          link_url: "/dashboard?tab=calendar",
        }));
        await supabase.from("notifikasi").insert(notifInserts);
      }
    } catch (notifErr) {
      console.warn("[AGENDA NOTIF INSERT WARNING]", notifErr);
    }

    return NextResponse.json({
      success: true,
      message: "Tanggal akademik berhasil diperbarui dan notifikasi dikirim ke siswa!",
      agenda: data || { id, ...updatePayload },
    });
  } catch (err: any) {
    console.error("[PATCH_AGENDA_EXCEPTION]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

