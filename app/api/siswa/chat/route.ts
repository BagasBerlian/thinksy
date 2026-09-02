import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const adminDb = createAdminClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get("q") || "";
    const chatId = searchParams.get("chat_id");

    if (!user) {
      return NextResponse.json({ chats: [], students: [], communities: [], comments: [] });
    }

    // If requesting comments for a specific chat post
    if (chatId) {
      const { data: comments, error } = await adminDb
        .from("komentar_chat")
        .select("id, chat_id, penulis_id, nama_penulis, kelas_penulis, konten, dibuat_pada")
        .eq("chat_id", chatId)
        .order("dibuat_pada", { ascending: true });

      if (error) {
        // Handle if table does not exist gracefully
        return NextResponse.json({ success: true, comments: [] });
      }

      return NextResponse.json({
        success: true,
        comments: comments || [],
      });
    }

    // Get current student's school_id
    const { data: profil } = await supabase
      .from("profil")
      .select("sekolah_id, nama_lengkap")
      .eq("id", user.id)
      .single();

    const sekolahId = profil?.sekolah_id;

    // 1. Fetch Global Chats (School-scoped)
    let chatsQuery = adminDb
      .from("chat_komunitas")
      .select("id, sekolah_id, penulis_id, nama_penulis, kelas_penulis, konten, minat_kategori, jumlah_suka, jumlah_komentar, dibuat_pada")
      .order("dibuat_pada", { ascending: false })
      .limit(50);

    if (sekolahId) {
      chatsQuery = chatsQuery.eq("sekolah_id", sekolahId);
    }

    const { data: chats } = await chatsQuery;

    // 2. Fetch Students / Communities search if query exists
    let studentResults: any[] = [];
    let communityResults: any[] = [];

    if (searchQuery.trim()) {
      let studentDbQuery = adminDb
        .from("profil")
        .select("id, nama_lengkap, peran, poin, streak")
        .eq("peran", "siswa")
        .ilike("nama_lengkap", `%${searchQuery}%`)
        .limit(10);

      if (sekolahId) {
        studentDbQuery = studentDbQuery.eq("sekolah_id", sekolahId);
      }

      const { data: matchedStudents } = await studentDbQuery;
      if (matchedStudents) {
        studentResults = matchedStudents.map((s) => ({
          id: s.id,
          name: s.nama_lengkap,
          class: "Kelas 8",
          interest: "Matematika & Sains",
        }));
      }

      const sampleCommunities = [
        { id: "c1", name: "Komunitas Robotik Sekolah", category: "Robotik & AI", membersCount: 18 },
        { id: "c2", name: "Klub Olimpiade Matematika", category: "Matematika", membersCount: 24 },
        { id: "c3", name: "Kelompok Belajar Sokratik", category: "Diskusi", membersCount: 35 },
      ];
      communityResults = sampleCommunities.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return NextResponse.json({
      chats: chats || [],
      students: studentResults,
      communities: communityResults,
    });
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
    const { action, konten, minat_kategori, chatId, alasan } = body;

    // Get current student profile
    const { data: profil } = await supabase
      .from("profil")
      .select("sekolah_id, nama_lengkap")
      .eq("id", user.id)
      .single();

    const namaPenulis = profil?.nama_lengkap || user.email?.split("@")[0] || "Siswa";

    // Action 1: Add Comment / Reply
    if (action === "comment") {
      if (!chatId || !konten?.trim()) {
        return NextResponse.json({ error: "Komentar tidak boleh kosong" }, { status: 400 });
      }

      // Insert new comment
      const { data: commentData, error: commentError } = await adminDb
        .from("komentar_chat")
        .insert({
          chat_id: chatId,
          penulis_id: user.id,
          nama_penulis: namaPenulis,
          kelas_penulis: "Kelas 8A",
          konten: konten.trim(),
        })
        .select()
        .single();

      if (commentError) {
        console.error("[komentar_chat insert error]", commentError.message);
      }

      // Update count in chat_komunitas
      const { data: chatPost } = await adminDb
        .from("chat_komunitas")
        .select("jumlah_komentar")
        .eq("id", chatId)
        .single();

      const newCount = (chatPost?.jumlah_komentar || 0) + 1;

      await adminDb
        .from("chat_komunitas")
        .update({ jumlah_komentar: newCount })
        .eq("id", chatId);

      return NextResponse.json({
        success: true,
        comment: commentData || {
          id: Date.now().toString(),
          chat_id: chatId,
          penulis_id: user.id,
          nama_penulis: namaPenulis,
          kelas_penulis: "Kelas 8A",
          konten: konten.trim(),
          dibuat_pada: new Date().toISOString(),
        },
        newCommentCount: newCount,
      });
    }

    // Action 2: Like Chat Post
    if (action === "like") {
      if (!chatId) {
        return NextResponse.json({ error: "Chat ID required" }, { status: 400 });
      }

      const { data: chatPost } = await adminDb
        .from("chat_komunitas")
        .select("jumlah_suka")
        .eq("id", chatId)
        .single();

      const newLikes = (chatPost?.jumlah_suka || 0) + 1;

      await adminDb
        .from("chat_komunitas")
        .update({ jumlah_suka: newLikes })
        .eq("id", chatId);

      return NextResponse.json({
        success: true,
        newLikes,
      });
    }

    // Action 3: Report Post
    if (action === "report") {
      if (!chatId || !alasan) {
        return NextResponse.json({ error: "Data laporan tidak lengkap" }, { status: 400 });
      }

      const { data: report, error } = await adminDb
        .from("laporan_konten")
        .insert({
          chat_id: chatId,
          pelapor_id: user.id,
          alasan,
          status: "menunggu",
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: "Laporan konten berhasil dikirim ke moderator.",
        report,
      });
    }

    // Default Action: Create new main chat post
    if (!konten?.trim()) {
      return NextResponse.json({ error: "Pesan tidak boleh kosong" }, { status: 400 });
    }

    const sekolahId = profil?.sekolah_id || "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

    const { data: newChat, error } = await adminDb
      .from("chat_komunitas")
      .insert({
        sekolah_id: sekolahId,
        penulis_id: user.id,
        nama_penulis: namaPenulis,
        kelas_penulis: "Kelas 8A",
        konten: konten.trim(),
        minat_kategori: minat_kategori || "Umum",
        jumlah_suka: 0,
        jumlah_komentar: 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, chat: newChat });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
