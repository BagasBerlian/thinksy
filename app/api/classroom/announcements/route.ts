import { NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";
import { DEFAULT_ANNOUNCEMENTS, StreamAnnouncement } from "@/lib/announcement-format";

// In-memory cache synced across server requests
let serverAnnouncements: StreamAnnouncement[] = [...DEFAULT_ANNOUNCEMENTS];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subjectTag = searchParams.get("subjectTag");

    let list = [...serverAnnouncements];
    if (subjectTag && subjectTag !== "all") {
      list = list.filter((a) => !a.subjectTag || a.subjectTag === subjectTag);
    }

    // Sort: pinned first, then by timestamp/id
    list.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

    return NextResponse.json({ announcements: list });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, announcements: serverAnnouncements }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      action = "create",
      id,
      text,
      authorName = "Ibu Siti Rahmawati, M.Pd.",
      authorAvatarText = "S",
      authorAvatarColor = "bg-[#1a73e8]",
      subjectTag = "mat-8",
      className = "Kelas 8-A (Matematika)",
      attachments = [],
      comment,
    } = body;

    // 1. ACTION: CREATE NEW ANNOUNCEMENT
    if (action === "create") {
      if (!text || !text.trim()) {
        return NextResponse.json({ error: "Isi pengumuman tidak boleh kosong." }, { status: 400 });
      }

      const newPost: StreamAnnouncement = {
        id: id || `post-${Date.now()}`,
        authorName,
        authorAvatarText,
        authorAvatarColor,
        timeAgo: "Baru saja",
        text: text.trim(),
        subjectTag,
        className,
        isPinned: false,
        attachments: Array.isArray(attachments) ? attachments : [],
        comments: [],
        createdAt: new Date().toISOString(),
      };

      serverAnnouncements = [newPost, ...serverAnnouncements];

      // Insert notification into Supabase for all registered students
      let notifiedCount = 0;
      try {
        const pool = getDbPool();
        const studentsRes = await pool.query(
          "SELECT id, nama_lengkap FROM profil WHERE peran = 'siswa'"
        );
        const students = studentsRes.rows;

        // Clean text preview (remove markdown tokens)
        const cleanPreview = text
          .replace(/\*\*(.*?)\*\*/g, "$1")
          .replace(/\*(.*?)\*/g, "$1")
          .replace(/<u>(.*?)<\/u>/gi, "$1")
          .substring(0, 120);

        const judul = `📢 Pengumuman Baru: ${authorName}`;
        const pesan = `${authorName} membagikan pengumuman di kelas: "${cleanPreview}${text.length > 120 ? "..." : ""}"`;
        const linkUrl = "/dashboard?tab=stream";

        for (const st of students) {
          try {
            await pool.query(
              `INSERT INTO notifikasi (user_id, judul, pesan, tipe, dibaca, link_url)
               VALUES ($1, $2, $3, 'info', false, $4)`,
              [st.id, judul, pesan, linkUrl]
            );
            notifiedCount++;
          } catch (notifErr) {
            console.warn("[ANNOUNCEMENT NOTIF WARNING]", notifErr);
          }
        }
      } catch (dbErr) {
        console.warn("[ANNOUNCEMENT DB NOTIF ERROR]", dbErr);
      }

      return NextResponse.json({
        success: true,
        announcement: newPost,
        notifiedStudents: notifiedCount,
        message: `Pengumuman berhasil disiarkan ke seluruh kelas dan dikirimkan ke ${notifiedCount} akun siswa!`,
      });
    }

    // 2. ACTION: ADD CLASS COMMENT
    if (action === "comment") {
      const targetPostId = id;
      if (!targetPostId || !comment || !comment.text?.trim()) {
        return NextResponse.json({ error: "Komentar tidak valid." }, { status: 400 });
      }

      const newComment = {
        id: comment.id || `c-${Date.now()}`,
        authorName: comment.authorName || "Siswa",
        authorRole: comment.authorRole || "Siswa",
        text: comment.text.trim(),
        timeAgo: "Baru saja",
        avatarText: (comment.authorName || "S").charAt(0).toUpperCase(),
        avatarColor: comment.authorRole === "Guru" ? "bg-[#1a73e8]" : "bg-purple-600",
      };

      serverAnnouncements = serverAnnouncements.map((post) => {
        if (post.id === targetPostId) {
          return {
            ...post,
            comments: [...post.comments, newComment],
          };
        }
        return post;
      });

      return NextResponse.json({
        success: true,
        postId: targetPostId,
        comment: newComment,
        message: "Komentar kelas berhasil ditambahkan!",
      });
    }

    // 3. ACTION: EDIT ANNOUNCEMENT
    if (action === "edit") {
      if (!id || !text?.trim()) {
        return NextResponse.json({ error: "Data edit tidak valid." }, { status: 400 });
      }

      serverAnnouncements = serverAnnouncements.map((post) => {
        if (post.id === id) {
          return {
            ...post,
            text: text.trim(),
            attachments: Array.isArray(attachments) ? attachments : post.attachments,
          };
        }
        return post;
      });

      return NextResponse.json({
        success: true,
        message: "Pengumuman berhasil diperbarui!",
      });
    }

    // 4. ACTION: DELETE ANNOUNCEMENT
    if (action === "delete") {
      if (!id) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
      serverAnnouncements = serverAnnouncements.filter((p) => p.id !== id);
      return NextResponse.json({ success: true, message: "Pengumuman berhasil dihapus." });
    }

    // 5. ACTION: PIN / UNPIN ANNOUNCEMENT
    if (action === "pin") {
      if (!id) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
      serverAnnouncements = serverAnnouncements.map((p) => {
        if (p.id === id) {
          return { ...p, isPinned: !p.isPinned };
        }
        return p;
      });
      return NextResponse.json({ success: true, message: "Status pin berhasil diperbarui." });
    }

    // 6. ACTION: MOVE TO TOP
    if (action === "move_to_top") {
      if (!id) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
      const target = serverAnnouncements.find((p) => p.id === id);
      if (target) {
        serverAnnouncements = [target, ...serverAnnouncements.filter((p) => p.id !== id)];
      }
      return NextResponse.json({ success: true, message: "Pengumuman dipindahkan ke paling atas." });
    }

    return NextResponse.json({ error: "Action tidak dikenal." }, { status: 400 });
  } catch (error: any) {
    console.error("[ANNOUNCEMENT API ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
