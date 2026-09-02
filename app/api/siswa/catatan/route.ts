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
      return NextResponse.json({ notes: [] });
    }

    const { data: notes, error } = await supabase
      .from("catatan")
      .select("*")
      .eq("siswa_id", user.id)
      .order("diperbarui_pada", { ascending: false });

    if (error) {
      return NextResponse.json({ notes: [] });
    }

    return NextResponse.json({ notes: notes || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { judul, konten, mata_pelajaran } = body;

    if (!judul) {
      return NextResponse.json(
        { error: "Judul catatan wajib diisi." },
        { status: 400 }
      );
    }

    const { data: newNote, error } = await adminDb
      .from("catatan")
      .insert({
        siswa_id: user.id,
        judul,
        konten: konten || "",
        mata_pelajaran: mata_pelajaran || "Umum",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, note: newNote });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const adminDb = createAdminClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, judul, konten, mata_pelajaran } = body;

    if (!id) {
      return NextResponse.json({ error: "ID catatan wajib" }, { status: 400 });
    }

    const { data: updatedNote, error } = await adminDb
      .from("catatan")
      .update({
        judul,
        konten,
        mata_pelajaran: mata_pelajaran || "Umum",
        diperbarui_pada: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("siswa_id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, note: updatedNote });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const adminDb = createAdminClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID catatan wajib" }, { status: 400 });
    }

    const { error } = await adminDb
      .from("catatan")
      .delete()
      .eq("id", id)
      .eq("siswa_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
