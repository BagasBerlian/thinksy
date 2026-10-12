import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const adminDb = createAdminClient();

    const { data: dbKelas, error } = await adminDb
      .from("kelas")
      .select("id, nama_kelas, dibuat_pada")
      .order("dibuat_pada", { ascending: true });

    if (error) {
      console.error("[GET /api/siswa/kelas Error]", error);
      return NextResponse.json({ classes: [] }, { status: 500 });
    }

    const colorPalette = [
      { bg: "bg-slate-700", text: "text-white" },
      { bg: "bg-blue-600", text: "text-white" },
      { bg: "bg-teal-600", text: "text-white" },
      { bg: "bg-indigo-600", text: "text-white" },
      { bg: "bg-emerald-600", text: "text-white" },
      { bg: "bg-purple-600", text: "text-white" },
      { bg: "bg-amber-600", text: "text-white" },
      { bg: "bg-rose-600", text: "text-white" },
    ];

    const formattedClasses = (dbKelas || []).map((k, index) => {
      const initial = (k.nama_kelas || "K").trim().charAt(0).toUpperCase();
      const color = colorPalette[index % colorPalette.length];
      return {
        id: k.id,
        nama: k.nama_kelas,
        initial,
        colorBg: color.bg,
        colorText: color.text,
      };
    });

    return NextResponse.json({ classes: formattedClasses });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nama_kelas } = body;

    if (!nama_kelas || typeof nama_kelas !== "string") {
      return NextResponse.json({ error: "nama_kelas is required" }, { status: 400 });
    }

    const adminDb = createAdminClient();
    const sekolahId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

    const { data: newClass, error } = await adminDb
      .from("kelas")
      .insert({
        sekolah_id: sekolahId,
        nama_kelas: nama_kelas.trim(),
      })
      .select("id, nama_kelas, dibuat_pada")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      class: {
        id: newClass.id,
        nama: newClass.nama_kelas,
        initial: newClass.nama_kelas.trim().charAt(0).toUpperCase(),
        colorBg: "bg-blue-600",
        colorText: "text-white",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
