import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDbPool } from "@/lib/db";

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

    let targetUserId = user?.id || (queryStudentId && queryStudentId.length > 20 ? queryStudentId : null);

    let rows: any[] = [];

    if (targetUserId) {
      const res = await pool.query(
        `SELECT id, judul, pesan, tipe, dibaca, dibuat_pada, link_url
         FROM notifikasi
         WHERE user_id = $1
         ORDER BY dibuat_pada DESC
         LIMIT 25`,
        [targetUserId]
      );
      rows = res.rows;
    } else if (queryStudentName) {
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
    }

    // If still empty and no specific student or if demo mode, also check recent notifications
    if (rows.length === 0 && !targetUserId && !queryStudentName) {
      const res = await pool.query(
        `SELECT id, judul, pesan, tipe, dibaca, dibuat_pada, link_url
         FROM notifikasi
         ORDER BY dibuat_pada DESC
         LIMIT 15`
      );
      rows = res.rows;
    }

    const formattedNotifs = rows.map((n) => {
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
        link_url: n.link_url || null,
      };
    });

    return NextResponse.json({ notifications: formattedNotifs });
  } catch (err: any) {
    console.error("[NOTIFIKASI GET ERROR]", err);
    return NextResponse.json({ error: err.message, notifications: [] }, { status: 500 });
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

