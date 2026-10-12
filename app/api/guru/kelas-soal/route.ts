import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET: Fetch questions and exams integrated with a specific active class
export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const adminDb = createAdminClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const kelasId = searchParams.get("kelasId");
    const mapel = searchParams.get("mapel") || "Matematika";

    // 1. Fetch class details if kelasId is provided
    let kelasDetail: any = null;
    if (kelasId && !kelasId.startsWith("cls-") && kelasId !== "8a" && kelasId !== "8b" && kelasId !== "8c") {
      const { data } = await adminDb
        .from("kelas")
        .select("id, nama_kelas, sekolah_id")
        .eq("id", kelasId)
        .maybeSingle();
      kelasDetail = data;
    }

    // 2. Fetch exams for this class / mapel
    let examQuery = adminDb
      .from("ujian")
      .select(`
        id,
        judul,
        deskripsi,
        mapel,
        tipe,
        durasi_menit,
        passing_grade,
        waktu_mulai,
        waktu_berakhir,
        status,
        token,
        acak_soal,
        acak_opsi,
        dibuat_pada,
        kelas_id
      `)
      .order("waktu_mulai", { ascending: false });

    if (kelasId && kelasDetail?.id) {
      examQuery = examQuery.or(`kelas_id.eq.${kelasDetail.id},mapel.ilike.%${mapel}%`);
    } else {
      examQuery = examQuery.ilike("mapel", `%${mapel}%`);
    }

    const { data: exams, error: examError } = await examQuery;

    if (examError) {
      console.error("Error fetching exams:", examError.message);
    }

    const activeExam = exams && exams.length > 0 ? exams[0] : null;

    // 3. Fetch questions attached to the active exam (or all exams)
    let attachedQuestions: any[] = [];
    if (activeExam) {
      const { data: relData } = await adminDb
        .from("ujian_soal")
        .select(`
          id,
          urutan,
          poin_bobot,
          soal:soal_id (
            id,
            pertanyaan,
            tipe_soal,
            tingkat_soal,
            status_soal,
            sumber_konten,
            kunci_jawaban,
            pembahasan,
            opsi_soal (
              id,
              teks_opsi,
              benar,
              urutan
            )
          )
        `)
        .eq("ujian_id", activeExam.id)
        .order("urutan", { ascending: true });

      if (relData) {
        attachedQuestions = relData
          .filter((item: any) => item.soal)
          .map((item: any) => ({
            relId: item.id,
            urutan: item.urutan,
            poinBobot: item.poin_bobot,
            ...item.soal,
          }));
      }
    }

    // 4. Fetch available questions in Bank Soal that can be attached
    const { data: bankSoal } = await adminDb
      .from("soal")
      .select(`
        id,
        pertanyaan,
        tipe_soal,
        tingkat_soal,
        status_soal,
        sumber_konten,
        kunci_jawaban,
        pembahasan,
        bab (
          id,
          judul
        ),
        opsi_soal (
          id,
          teks_opsi,
          benar,
          urutan
        )
      `)
      .order("dibuat_pada", { ascending: false })
      .limit(30);

    // 5. Fetch student completion stats for active exam
    let studentStats = { totalSubmissions: 0, completedCount: 0, avgScore: 0 };
    if (activeExam) {
      const { data: sesiList } = await adminDb
        .from("sesi_ujian")
        .select("id, status, nilai_akhir")
        .eq("ujian_id", activeExam.id);

      if (sesiList && sesiList.length > 0) {
        const completed = sesiList.filter((s: any) => s.status === "selesai");
        const totalScore = completed.reduce((acc: number, curr: any) => acc + (Number(curr.nilai_akhir) || 0), 0);
        studentStats = {
          totalSubmissions: sesiList.length,
          completedCount: completed.length,
          avgScore: completed.length > 0 ? Math.round(totalScore / completed.length) : 0,
        };
      }
    }

    return NextResponse.json({
      success: true,
      kelas: kelasDetail || { id: kelasId || "8a", nama_kelas: "Kelas 8A" },
      activeExam,
      allExams: exams || [],
      attachedQuestions,
      bankSoal: bankSoal || [],
      studentStats,
    });
  } catch (err: any) {
    console.error("Error in GET /api/guru/kelas-soal:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Manage question setting, attaching, creating, & exam config for active class
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const adminDb = createAdminClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }

    const { data: profil } = await adminDb
      .from("profil")
      .select("id, peran, sekolah_id")
      .eq("id", user.id)
      .single();

    if (!profil || !["guru", "admin_sekolah", "super_admin", "superadmin"].includes(profil.peran)) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const body = await req.json();
    const { action, kelasId, examId, mapel = "Matematika" } = body;

    const sekolahId = profil.sekolah_id || "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

    // -------------------------------------------------------------
    // ACTION 1: SAVE / CREATE EXAM CONFIG FOR KELAS AKTIF
    // -------------------------------------------------------------
    if (action === "save_exam_config") {
      const {
        judul,
        deskripsi,
        durasiMenit = 60,
        passingGrade = 75,
        token,
        status = "dipublikasi",
        acakSoal = false,
        acakOpsi = false,
      } = body;

      if (!judul || !judul.trim()) {
        return NextResponse.json({ error: "Judul ujian wajib diisi" }, { status: 400 });
      }

      const generatedToken = (token || `${mapel.substring(0, 3).toUpperCase()}-K8${Math.floor(10 + Math.random() * 90)}`).trim().toUpperCase();

      if (examId) {
        // Update existing exam
        const { data: updated, error } = await adminDb
          .from("ujian")
          .update({
            judul: judul.trim(),
            deskripsi: deskripsi?.trim() || "",
            durasi_menit: Number(durasiMenit),
            passing_grade: Number(passingGrade),
            token: generatedToken,
            status,
            acak_soal: Boolean(acakSoal),
            acak_opsi: Boolean(acakOpsi),
          })
          .eq("id", examId)
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          message: `Pengaturan ujian "${judul}" berhasil diperbarui!`,
          exam: updated,
        });
      } else {
        // Insert new exam for class
        const { data: inserted, error } = await adminDb
          .from("ujian")
          .insert({
            sekolah_id: sekolahId,
            guru_id: user.id,
            kelas_id: kelasId && !kelasId.startsWith("cls-") ? kelasId : null,
            mapel,
            judul: judul.trim(),
            deskripsi: deskripsi?.trim() || "Paket Ujian Kelas Aktif Thinksy AI",
            durasi_menit: Number(durasiMenit),
            passing_grade: Number(passingGrade),
            token: generatedToken,
            status,
            acak_soal: Boolean(acakSoal),
            acak_opsi: Boolean(acakOpsi),
          })
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          message: `Ujian baru "${judul}" berhasil dibuat untuk kelas ini!`,
          exam: inserted,
        });
      }
    }

    // -------------------------------------------------------------
    // ACTION 2: ATTACH SELECTED QUESTIONS FROM BANK SOAL
    // -------------------------------------------------------------
    if (action === "attach_soal_bank") {
      const { targetExamId, selectedSoalIds = [] } = body;

      if (!targetExamId) {
        return NextResponse.json({ error: "ID Ujian tidak ditemukan" }, { status: 400 });
      }

      if (!selectedSoalIds || selectedSoalIds.length === 0) {
        return NextResponse.json({ error: "Pilih minimal 1 soal dari bank" }, { status: 400 });
      }

      // Check current max order
      const { data: currentRows } = await adminDb
        .from("ujian_soal")
        .select("urutan, soal_id")
        .eq("ujian_id", targetExamId);

      const existingSoalIds = new Set((currentRows || []).map((r: any) => r.soal_id));
      let nextUrutan = (currentRows || []).length + 1;

      const newPayload: any[] = [];
      selectedSoalIds.forEach((sId: string) => {
        if (!existingSoalIds.has(sId)) {
          newPayload.push({
            ujian_id: targetExamId,
            soal_id: sId,
            urutan: nextUrutan++,
            poin_bobot: 10,
          });
        }
      });

      if (newPayload.length > 0) {
        const { error } = await adminDb.from("ujian_soal").insert(newPayload);
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
      }

      return NextResponse.json({
        success: true,
        message: `${newPayload.length} soal berhasil diintegrasikan ke kelas ini!`,
      });
    }

    // -------------------------------------------------------------
    // ACTION 3: CREATE NEW QUESTION & ATTACH TO CLASS EXAM
    // -------------------------------------------------------------
    if (action === "create_and_attach") {
      const {
        targetExamId,
        pertanyaan,
        tipeSoal = "pilihan_ganda",
        tingkatSoal = "sedang",
        kunciJawaban = "",
        pembahasan = "",
        opsiSoal = [],
      } = body;

      if (!pertanyaan || !pertanyaan.trim()) {
        return NextResponse.json({ error: "Pertanyaan tidak boleh kosong" }, { status: 400 });
      }

      // Get default Bab ID
      const { data: defaultBab } = await adminDb
        .from("bab")
        .select("id")
        .limit(1)
        .single();

      const babId = defaultBab?.id || "ae1ac5d7-b55e-4ffd-9f39-f742ecee1a71";

      // Insert question
      const { data: newSoal, error: soalErr } = await adminDb
        .from("soal")
        .insert({
          bab_id: babId,
          pembuat_id: user.id,
          pertanyaan: pertanyaan.trim(),
          tipe_soal: tipeSoal,
          tingkat_soal: tingkatSoal,
          sumber_konten: "manual",
          status_soal: "dipublikasi",
          kunci_jawaban: kunciJawaban.trim(),
          pembahasan: pembahasan.trim(),
        })
        .select()
        .single();

      if (soalErr || !newSoal) {
        return NextResponse.json({ error: "Gagal membuat soal: " + soalErr?.message }, { status: 500 });
      }

      // Insert options if PG
      if (tipeSoal === "pilihan_ganda" && opsiSoal.length > 0) {
        const opsiPayload = opsiSoal.map((o: any, idx: number) => ({
          soal_id: newSoal.id,
          teks_opsi: o.teksOpsi || o.teks || `Opsi ${idx + 1}`,
          benar: Boolean(o.benar),
          urutan: idx + 1,
        }));
        await adminDb.from("opsi_soal").insert(opsiPayload);
      }

      // Attach to Exam if targetExamId provided
      if (targetExamId) {
        const { data: countData } = await adminDb
          .from("ujian_soal")
          .select("id", { count: "exact" })
          .eq("ujian_id", targetExamId);

        const currentCount = countData?.length || 0;

        await adminDb.from("ujian_soal").insert({
          ujian_id: targetExamId,
          soal_id: newSoal.id,
          urutan: currentCount + 1,
          poin_bobot: 10,
        });
      }

      return NextResponse.json({
        success: true,
        message: "Soal baru berhasil dibuat dan diintegrasikan ke kelas!",
        soal: newSoal,
      });
    }

    // -------------------------------------------------------------
    // ACTION 4: TOGGLE EXAM / QUESTION STATUS (ACTIVE / DRAFT / CLOSED)
    // -------------------------------------------------------------
    if (action === "toggle_exam_status") {
      const { targetExamId, status } = body;

      if (!targetExamId || !status) {
        return NextResponse.json({ error: "Parameter tidak lengkap" }, { status: 400 });
      }

      const { data: updated, error } = await adminDb
        .from("ujian")
        .update({ status })
        .eq("id", targetExamId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `Status ujian diubah menjadi ${status === "dipublikasi" ? "Aktif (Terbit di Siswa)" : status === "draft" ? "Draft Guru" : "Ditutup"}.`,
        exam: updated,
      });
    }

    // -------------------------------------------------------------
    // ACTION 5: DETACH QUESTION FROM EXAM
    // -------------------------------------------------------------
    if (action === "detach_soal") {
      const { targetExamId, soalId } = body;

      if (!targetExamId || !soalId) {
        return NextResponse.json({ error: "Parameter tidak lengkap" }, { status: 400 });
      }

      const { error } = await adminDb
        .from("ujian_soal")
        .delete()
        .eq("ujian_id", targetExamId)
        .eq("soal_id", soalId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: "Soal berhasil dilepas dari kelas ini.",
      });
    }

    return NextResponse.json({ error: "Aksi tidak dikenal" }, { status: 400 });
  } catch (err: any) {
    console.error("Error in POST /api/guru/kelas-soal:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
