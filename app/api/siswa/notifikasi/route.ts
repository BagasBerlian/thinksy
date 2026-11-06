import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDbPool } from "@/lib/db";

const DEFAULT_ACTIVE_NOTIFICATIONS = [
  {
    id: "notif-exam-resmi-1",
    title: "🔔 Ujian Resmi Matematika #1 Telah Dibuka",
    desc: "Asesmen sumatif resmi semester 1 (Part 1) telah dipublikasikan oleh Guru. Masuk ke ruang ujian dengan token MTK-PTS26.",
    time: "Baru saja",
    type: "urgent",
    dibaca: false,
    link_url: "/ujian",
  },
  {
    id: "notif-ulangan-sem-1",
    title: "📝 Ulangan Matematika Semester 1 Siap Dikerjakan",
    desc: "Evaluasi formatif komprehensif Matematika Semester 1 (Bab 1–4) telah siap dikerjakan di Ruang Ulangan.",
    time: "Baru saja",
    type: "info",
    dibaca: false,
    link_url: "/ujian",
  },
  {
    id: "notif-ulangan-sem-2",
    title: "🎯 Ulangan Matematika Semester 2 Tersedia",
    desc: "Evaluasi formatif komprehensif Matematika Semester 2 (Bab 5–8) telah tersedia untuk dipelajari.",
    time: "Baru saja",
    type: "success",
    dibaca: false,
    link_url: "/ujian",
  },
];

export async function GET(request: Request) {
  try {
    const pool = getDbPool();
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { searchParams } = new URL(request.url);
    const queryStudentId = searchParams.get("studentId");
    const queryStudentName = searchParams.get("studentName");

    const targetUserId = user?.id || (queryStudentId && queryStudentId.length > 20 ? queryStudentId : null);

    let rows: any[] = [];

    if (targetUserId) {
      try {
        const res = await pool.query(
          `SELECT id, judul, pesan, tipe, dibaca, dibuat_pada, link_url
           FROM notifikasi
           WHERE user_id = $1
           ORDER BY dibuat_pada DESC
           LIMIT 25`,
          [targetUserId]
        );
        rows = res.rows;
      } catch (dbErr) {
        console.warn("[NOTIFIKASI DB SELECT USER FAILED]", dbErr);
      }
    } else if (queryStudentName) {
      try {
        const res = await pool.query(
          `SELECT n.id, n.judul, n.pesan, n.tipe, n.dibaca, n.dibuat_pada, n.link_url
           FROM notifikasi n
           JOIN profil p ON n.user_id = p.id
           WHERE LOWER(TRIM(p.nama_lengkap)) = LOWER(TRIM($1))
           ORDER BY n.dibuat_pada DESC
           LIMIT 25`,
          [queryStudentName]
        );
        rows = res.rows;
      } catch (dbErr) {
        console.warn("[NOTIFIKASI DB SELECT NAME FAILED]", dbErr);
      }
    }

    // If still empty and no specific student or if demo mode, also check recent notifications
    if (rows.length === 0 && !targetUserId && !queryStudentName) {
      try {
        const res = await pool.query(
          `SELECT id, judul, pesan, tipe, dibaca, dibuat_pada, link_url
           FROM notifikasi
           ORDER BY dibuat_pada DESC
           LIMIT 15`
        );
        rows = res.rows;
      } catch (dbErr) {
        console.warn("[NOTIFIKASI DB SELECT RECENT FAILED]", dbErr);
      }
    }

    const formattedNotifs = rows.map((n) => {
      const dt = new Date(n.dibuat_pada);
      const timeStr = dt.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
      return {
        id: String(n.id),
        title: n.judul,
        desc: n.pesan,
        time: `${timeStr} WIB`,
        type: n.tipe || "info",
        dibaca: Boolean(n.dibaca),
        link_url: n.link_url || "/ujian",
      };
    });

    // Pastikan notifikasi aktif untuk Ujian Resmi Matematika #1 dan Ulangan Matematika Semester 1 selalu ada
    const hasUjianNotif = formattedNotifs.some((n) => /ujian resmi|pts/i.test(n.title));
    const hasUlanganNotif = formattedNotifs.some((n) => /ulangan matematika/i.test(n.title));

    const finalNotifs = [...formattedNotifs];
    if (!hasUjianNotif) {
      finalNotifs.unshift(DEFAULT_ACTIVE_NOTIFICATIONS[0]);
    }
    if (!hasUlanganNotif) {
      finalNotifs.unshift(DEFAULT_ACTIVE_NOTIFICATIONS[1]);
    }

    return NextResponse.json({ notifications: finalNotifs });
  } catch (err: any) {
    console.error("[NOTIFIKASI GET ERROR]", err);
    return NextResponse.json({ notifications: DEFAULT_ACTIVE_NOTIFICATIONS });
  }
}

export async function POST(request: Request) {
  return handleUpdateNotification(request);
}

export async function PATCH(request: Request) {
  return handleUpdateNotification(request);
}

async function handleUpdateNotification(request: Request) {
  try {
    const pool = getDbPool();
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await request.json();
    const { action, id, notifId, judul, pesan, tipe, studentId } = body;
    const targetId = id || notifId;

    // Action: Mark notification(s) as read in Database
    if (action === "mark_as_read" || targetId) {
      if (targetId) {
        await pool.query("UPDATE notifikasi SET dibaca = true WHERE id = $1", [targetId]);
      } else if (user?.id) {
        await pool.query("UPDATE notifikasi SET dibaca = true WHERE user_id = $1", [user.id]);
      } else if (studentId) {
        await pool.query("UPDATE notifikasi SET dibaca = true WHERE user_id = $1", [studentId]);
      } else {
        await pool.query("UPDATE notifikasi SET dibaca = true");
      }

      return NextResponse.json({
        success: true,
        message: "Notifikasi berhasil ditandai dibaca di database.",
      });
    }

    // Action: Create new notification log
    if (judul && pesan) {
      const recipientId = body.target_user_id || studentId || user?.id;
      if (recipientId) {
        const ins = await pool.query(
          `INSERT INTO notifikasi (user_id, judul, pesan, tipe, dibaca, link_url)
           VALUES ($1, $2, $3, $4, false, $5)
           RETURNING id, user_id, judul, pesan, tipe, dibaca, dibuat_pada, link_url`,
          [recipientId, judul, pesan, tipe || "info", body.link_url || null]
        );

        return NextResponse.json({ success: true, notification: ins.rows[0] });
      }
    }

    return NextResponse.json({ error: "Payload tidak valid." }, { status: 400 });
  } catch (err: any) {
    console.error("[NOTIFIKASI UPDATE ERROR]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

