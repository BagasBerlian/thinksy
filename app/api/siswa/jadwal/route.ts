import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ schedules: [] });
    }

    const { data: dbSchedules, error } = await supabase
      .from("jadwal_kelas")
      .select("*")
      .order("urutan", { ascending: true });

    if (error || !dbSchedules || dbSchedules.length === 0) {
      return NextResponse.json({ schedules: [] });
    }

    const formattedSchedules = dbSchedules.map((s) => ({
      id: s.id,
      subject: s.mata_pelajaran,
      teacher: s.nama_guru,
      day: s.hari,
      startTime: s.jam_mulai.substring(0, 5),
      endTime: s.jam_selesai.substring(0, 5),
      time: `${s.jam_mulai.substring(0, 5)} - ${s.jam_selesai.substring(0, 5)} WIB`,
      room: s.ruangan,
    }));

    return NextResponse.json({ schedules: formattedSchedules });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
