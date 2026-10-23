import { NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";

// Helper to check valid UUID
function isValidUUID(str?: string | null): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

export async function POST(req: Request) {
  try {
    const pool = getDbPool();
    const body = await req.json();
    const {
      mode = "single",
      studentId,
      studentName,
      nisn,
      assignmentId,
      assignmentTitle = "Tugas Sekolah",
      dueDate = "Segera",
      subject = "Matematika",
      missingItems = [],
    } = body;

    // Fetch all real student profiles to match by ID, NISN, or Name
    const studentsRes = await pool.query(
      "SELECT id, nama_lengkap, nisn FROM profil WHERE peran = 'siswa' ORDER BY nama_lengkap ASC"
    );
    const dbStudents = studentsRes.rows;

    const insertedNotifications: any[] = [];

    if (mode === "single") {
      // 1. Resolve student UUID
      let targetUserId: string | null = null;
      if (isValidUUID(studentId)) {
        targetUserId = studentId;
      } else {
        const found = dbStudents.find(
          (s) =>
            (nisn && s.nisn === nisn) ||
            (studentName && s.nama_lengkap.toLowerCase().trim() === studentName.toLowerCase().trim())
        );
        targetUserId = found?.id || dbStudents[0]?.id || null;
      }

      const judul = `🔔 Pengingat Tugas: ${assignmentTitle}`;
      const pesan = `Halo ${studentName || "Siswa"}, guru mengingatkan Anda untuk segera menyelesaikan "${assignmentTitle}" (${subject}) sebelum batas waktu ${dueDate}.`;
      const linkUrl = "/dashboard?tab=todo";

      if (targetUserId) {
        const ins = await pool.query(
          `INSERT INTO notifikasi (user_id, judul, pesan, tipe, dibaca, link_url)
           VALUES ($1, $2, $3, 'warning', false, $4)
           RETURNING id, user_id, judul, pesan, tipe, dibaca, dibuat_pada, link_url`,
          [targetUserId, judul, pesan, linkUrl]
        );
        insertedNotifications.push(ins.rows[0]);
      }

      return NextResponse.json({
        success: true,
        mode: "single",
        count: insertedNotifications.length,
        studentName: studentName || "Siswa",
        assignmentTitle,
        notification: insertedNotifications[0] || null,
        message: `Pengingat tugas berhasil dikirimkan ke akun ${studentName}!`,
      });
    }

    if (mode === "all") {
      // 2. Broadcast / Bulk Remind All Missing Students
      const itemsToProcess = Array.isArray(missingItems) && missingItems.length > 0 ? missingItems : [];

      // Map unique targets: key -> target data
      const targetMap = new Map<
        string,
        {
          studentUserId: string;
          studentName: string;
          assignmentTitle: string;
          dueDate: string;
          subject: string;
        }
      >();

      if (itemsToProcess.length > 0) {
        for (const item of itemsToProcess) {
          let resolvedId: string | null = null;
          if (isValidUUID(item.studentId)) {
            resolvedId = item.studentId;
          } else {
            const found = dbStudents.find(
              (s) =>
                (item.nisn && s.nisn === item.nisn) ||
                (item.studentName &&
                  s.nama_lengkap.toLowerCase().trim() === item.studentName.toLowerCase().trim())
            );
            resolvedId = found?.id || null;
          }

          if (resolvedId) {
            targetMap.set(`${resolvedId}:::${item.assignmentId || item.assignmentTitle}`, {
              studentUserId: resolvedId,
              studentName: item.studentName || "Siswa",
              assignmentTitle: item.assignmentTitle || "Tugas Sekolah",
              dueDate: item.dueDate || "Segera",
              subject: item.subject || "Matematika",
            });
          }
        }
      }

      // If targetMap is empty, broadcast to all registered students in profil
      if (targetMap.size === 0 && dbStudents.length > 0) {
        for (const st of dbStudents) {
          targetMap.set(`${st.id}:::${assignmentTitle}`, {
            studentUserId: st.id,
            studentName: st.nama_lengkap,
            assignmentTitle: assignmentTitle || "Tugas Pembelajaran",
            dueDate: dueDate || "Segera",
            subject: subject || "Matematika",
          });
        }
      }

      // Insert all notifications in loop
      for (const [, data] of targetMap.entries()) {
        const studentUserId = data.studentUserId;
        const judul = `🔔 Pengingat Tugas: ${data.assignmentTitle}`;
        const pesan = `Halo ${data.studentName}, Anda memiliki tugas "${data.assignmentTitle}" (${data.subject}) yang belum dikumpulkan. Mohon segera selesaikan sebelum tenggat ${data.dueDate}.`;
        const linkUrl = "/dashboard?tab=todo";

        try {
          const ins = await pool.query(
            `INSERT INTO notifikasi (user_id, judul, pesan, tipe, dibaca, link_url)
             VALUES ($1, $2, $3, 'warning', false, $4)
             RETURNING id, user_id, judul, pesan, tipe, dibaca, dibuat_pada, link_url`,
            [studentUserId, judul, pesan, linkUrl]
          );
          if (ins.rows[0]) {
            insertedNotifications.push(ins.rows[0]);
          }
        } catch (itemErr) {
          console.warn("[REMIND ALL INSERT WARNING]", itemErr);
        }
      }

      return NextResponse.json({
        success: true,
        mode: "all",
        totalSent: insertedNotifications.length,
        message: `Pengingat tugas serentak berhasil dikirimkan ke ${insertedNotifications.length} akun siswa yang dituju!`,
        notifications: insertedNotifications,
      });
    }

    return NextResponse.json({ error: "Mode tidak valid" }, { status: 400 });
  } catch (error: any) {
    console.error("[REMIND API ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Gagal mengirimkan pengingat ke database." },
      { status: 500 }
    );
  }
}
