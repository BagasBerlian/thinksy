import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function parseRosterMetadata(deskripsi: string | null | undefined): { cleanDesc: string; excluded: string[] } {
  if (!deskripsi) return { cleanDesc: "", excluded: [] };
  const match = deskripsi.match(/<!-- EXAM_ROSTER:(.*?) -->/);
  if (match) {
    try {
      const parsed = JSON.parse(match[1]);
      const cleanDesc = deskripsi.replace(/<!-- EXAM_ROSTER:.*? -->/, "").trim();
      return { cleanDesc, excluded: Array.isArray(parsed.excluded) ? parsed.excluded : [] };
    } catch {
      return { cleanDesc: deskripsi, excluded: [] };
    }
  }
  return { cleanDesc: deskripsi, excluded: [] };
}

function serializeRosterMetadata(cleanDesc: string, excluded: string[]): string {
  const meta = `<!-- EXAM_ROSTER:${JSON.stringify({ excluded })} -->`;
  return cleanDesc ? `${cleanDesc.trim()}\n${meta}`.trim() : meta;
}

export async function GET(
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

    const { data: ujian, error: uErr } = await adminSupabase
      .from("ujian")
      .select("id, judul, deskripsi, sekolah_id")
      .eq("id", ujianId)
      .maybeSingle();

    if (uErr || !ujian) {
      return NextResponse.json({ error: "Ujian tidak ditemukan" }, { status: 404 });
    }

    const { cleanDesc, excluded } = parseRosterMetadata(ujian.deskripsi);

    // Ambil seluruh siswa terdaftar di Supabase
    let sQuery = adminSupabase
      .from("profil")
      .select("id, nama_lengkap, email, nisn, foto_url")
      .eq("peran", "siswa")
      .order("nama_lengkap", { ascending: true });

    if (ujian.sekolah_id) {
      sQuery = sQuery.eq("sekolah_id", ujian.sekolah_id);
    }

    const { data: rawStudents } = await sQuery;

    // Fallback jika tidak ada siswa dengan sekolah_id spesifik
    let allStudents = rawStudents || [];
    if (allStudents.length === 0) {
      const { data: sAll } = await adminSupabase
        .from("profil")
        .select("id, nama_lengkap, email, nisn, foto_url")
        .eq("peran", "siswa")
        .order("nama_lengkap", { ascending: true });
      allStudents = sAll || [];
    }

    return NextResponse.json({
      cleanDesc,
      excludedStudentIds: excluded,
      allStudents,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

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

    const body = await req.json();
    const { action, studentId } = body;

    const { data: ujian, error: uErr } = await adminSupabase
      .from("ujian")
      .select("id, deskripsi")
      .eq("id", ujianId)
      .maybeSingle();

    if (uErr || !ujian) {
      return NextResponse.json({ error: "Ujian tidak ditemukan" }, { status: 404 });
    }

    const { cleanDesc, excluded } = parseRosterMetadata(ujian.deskripsi);
    let updatedExcluded = [...excluded];

    if (action === "exclude") {
      if (studentId && !updatedExcluded.includes(studentId)) {
        updatedExcluded.push(studentId);
      }
    } else if (action === "invite") {
      if (studentId) {
        updatedExcluded = updatedExcluded.filter((id) => id !== studentId);
        // Buka kunci sesi jika siswa sebelumnya terkunci karena keluar layar ujian resmi
        await adminSupabase
          .from("sesi_ujian")
          .update({ status: "sedang_mengerjakan" })
          .eq("ujian_id", ujianId)
          .eq("siswa_id", studentId)
          .eq("status", "terkunci");
      }
    } else if (action === "reset") {
      updatedExcluded = [];
      // Buka kunci seluruh sesi ujian yang terkunci
      await adminSupabase
        .from("sesi_ujian")
        .update({ status: "sedang_mengerjakan" })
        .eq("ujian_id", ujianId)
        .eq("status", "terkunci");
    } else {
      return NextResponse.json({ error: "Aksi tidak valid" }, { status: 400 });
    }

    const newDeskripsi = serializeRosterMetadata(cleanDesc, updatedExcluded);

    const { error: updErr } = await adminSupabase
      .from("ujian")
      .update({ deskripsi: newDeskripsi })
      .eq("id", ujianId);

    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      excludedStudentIds: updatedExcluded,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

