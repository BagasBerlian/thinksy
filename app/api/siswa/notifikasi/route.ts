import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ notifications: [] });
    }

    const { data: dbNotif, error } = await supabase
      .from("notifikasi")
      .select("id, judul, pesan, tipe, dibaca, dibuat_pada")
      .eq("user_id", user.id)
      .order("dibuat_pada", { ascending: false })
      .limit(20);

    if (error || !dbNotif || dbNotif.length === 0) {
      // Fallback initial notifications if DB table empty/not created yet
      return NextResponse.json({
        notifications: [
          {
            id: "n1",
            title: "Tenggat Waktu Kuis Biologi",
            desc: "Kuis Biologi Bab 3 berakhir malam ini pukul 23:59 WIB.",
            time: "10 menit yang lalu",
            type: "urgent",
            dibaca: false,
          },
          {
            id: "n2",
            title: "Pengumuman Guru Matematika",
            desc: "Materi Faktorisasi Kuadrat telah diperbarui oleh Ibu Rahma.",
            time: "1 jam yang lalu",
            type: "info",
            dibaca: false,
          },
          {
            id: "n3",
            title: "Jadwal Kelas Pengganti Fisika",
            desc: "Sesi Sokratik AI Fisika dijadwalkan besok pukul 09:30 WIB.",
            time: "3 jam yang lalu",
            type: "schedule",
            dibaca: true,
          },
        ],
      });
    }

    const formattedNotifs = dbNotif.map((n) => {
      const dt = new Date(n.dibuat_pada);
      const timeStr = dt.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
      return {
        id: n.id,
        title: n.judul,
        desc: n.pesan,
        time: `${timeStr} WIB`,
        type: n.tipe || "info",
        dibaca: n.dibaca,
      };
    });

    return NextResponse.json({ notifications: formattedNotifs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, judul, pesan, tipe } = body;

    // Action: Mark all notifications as read
    if (action === "mark_as_read") {
      await supabase
        .from("notifikasi")
        .update({ dibaca: true })
        .eq("user_id", user.id);

      return NextResponse.json({ success: true, message: "Semua notifikasi ditandai dibaca." });
    }

    // Action: Create new notification log
    if (judul && pesan) {
      const { data: newNotif, error } = await supabase
        .from("notifikasi")
        .insert({
          user_id: user.id,
          judul,
          pesan,
          tipe: tipe || "info",
          dibaca: false,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, notification: newNotif });
    }

    return NextResponse.json({ error: "Payload tidak valid." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
