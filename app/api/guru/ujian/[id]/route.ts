import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import fs from "fs";
import path from "path";

function getDeletedUjianIds(): string[] {
  try {
    const filePath = path.join(process.cwd(), "data", "deleted_ujian.json");
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content);
    }
  } catch {}
  return [];
}

function addDeletedUjianId(id: string) {
  try {
    const dirPath = path.join(process.cwd(), "data");
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    const filePath = path.join(dirPath, "deleted_ujian.json");
    const current = getDeletedUjianIds();
    if (!current.includes(id)) {
      current.push(id);
      fs.writeFileSync(filePath, JSON.stringify(current, null, 2), "utf-8");
    }
  } catch (err) {
    console.error("Gagal simpan deleted_ujian:", err);
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: ujianId } = await params;
    if (!ujianId) {
      return NextResponse.json({ error: "ID Ujian tidak ditemukan" }, { status: 400 });
    }

    // 1. Ambil data ujian
    const { data: ujian, error: ujianErr } = await adminSupabase
      .from("ujian")
      .select(`
        id,
        judul,
        deskripsi,
        mapel,
        tipe,
        bab_id,
        durasi_menit,
        passing_grade,
        waktu_mulai,
        waktu_berakhir,
        status,
        token,
        acak_soal,
        acak_opsi,
        dibuat_pada,
        kelas:kelas_id ( id, nama_kelas ),
        bab:bab_id ( id, judul )
      `)
      .eq("id", ujianId)
      .maybeSingle();

    if (ujianErr || !ujian) {
      return NextResponse.json({ error: "Ujian tidak ditemukan" }, { status: 404 });
    }

    // 2. Ambil butir-butir soal ujian
    const { data: ujianSoalRows } = await adminSupabase
      .from("ujian_soal")
      .select(`
        id,
        urutan,
        poin_bobot,
        soal:soal_id (
          id,
          pertanyaan,
          tipe_soal,
          kunci_jawaban,
          pembahasan,
          tingkat_soal,
          opsi_soal (
            id,
            teks_opsi,
            benar,
            urutan,
            label,
            alasan_salah
          )
        )
      `)
      .eq("ujian_id", ujianId)
      .order("urutan", { ascending: true });

    const formattedSoalList = (ujianSoalRows || []).map((row: any) => {
      const s = Array.isArray(row.soal) ? row.soal[0] : row.soal;
      const opsiList = Array.isArray(s?.opsi_soal)
        ? [...s.opsi_soal].sort((a, b) => (a.urutan || 0) - (b.urutan || 0)).map((o: any) => ({
            id: o.id,
            teks: o.teks_opsi || "",
            benar: Boolean(o.benar),
            alasanSalah: o.alasan_salah || "",
          }))
        : [];

      return {
        id: s?.id || row.id,
        pertanyaan: s?.pertanyaan || "",
        tipeSoal: (s?.tipe_soal || "pilihan_ganda") as "pilihan_ganda" | "isian_singkat" | "esai",
        kunciJawaban: s?.kunci_jawaban || "",
        pembahasan: s?.pembahasan || "",
        poin: row.poin_bobot || 10,
        opsi: opsiList,
      };
    });

    return NextResponse.json({
      success: true,
      ujian,
      soalList: formattedSoalList,
    });
  } catch (err: any) {
    console.error("Error GET ujian [id]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profil } = await adminSupabase
      .from("profil")
      .select("id, peran, sekolah_id")
      .eq("id", user.id)
      .single();

    if (!profil || profil.peran !== "guru") {
      return NextResponse.json({ error: "Forbidden: Hanya guru yang dapat mengubah ujian" }, { status: 403 });
    }

    const { id: ujianId } = await params;
    const body = await req.json();
    const {
      judul,
      deskripsi,
      mapel = "Matematika",
      tipe = "ulangan",
      token,
      babId,
      durasiMenit = 60,
      passingGrade = 75,
      status = "dipublikasi",
      acakSoal = false,
      acakOpsi = false,
      soalList = [],
    } = body;

    if (!judul || !ujianId) {
      return NextResponse.json({ error: "Judul dan ID Ujian wajib diisi" }, { status: 400 });
    }

    // 1. Update data metadata ujian
    const updatePayload: any = {
      judul,
      deskripsi: deskripsi || "",
      mapel,
      tipe,
      durasi_menit: Number(durasiMenit),
      passing_grade: Number(passingGrade),
      status,
      acak_soal: Boolean(acakSoal),
      acak_opsi: Boolean(acakOpsi),
    };

    if (token) updatePayload.token = String(token).trim().toUpperCase();
    if (babId) updatePayload.bab_id = babId;

    const { data: updatedUjian, error: updateErr } = await adminSupabase
      .from("ujian")
      .update(updatePayload)
      .eq("id", ujianId)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: "Gagal memperbarui ujian: " + updateErr.message }, { status: 500 });
    }

    // 2. Simpan atau perbarui daftar soal
    if (Array.isArray(soalList) && soalList.length > 0) {
      // Hapus relasi lama di ujian_soal
      await adminSupabase.from("ujian_soal").delete().eq("ujian_id", ujianId);

      for (let idx = 0; idx < soalList.length; idx++) {
        const item = soalList[idx];
        let targetSoalId = item.id;
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetSoalId || "");
        const tipeSoal = item.tipeSoal || "pilihan_ganda";
        const correctOpt = Array.isArray(item.opsi) ? item.opsi.find((o: any) => o.benar) : null;
        const kunci = item.kunciJawaban || (tipeSoal === "pilihan_ganda" ? (correctOpt?.teks || "") : "");

        if (isUuid) {
          // Update soal yang sudah ada
          await adminSupabase
            .from("soal")
            .update({
              pertanyaan: item.pertanyaan,
              tipe_soal: tipeSoal,
              kunci_jawaban: kunci,
              pembahasan: item.pembahasan || "",
            })
            .eq("id", targetSoalId);

          // Update opsi pilihan ganda
          if (tipeSoal === "pilihan_ganda" && Array.isArray(item.opsi)) {
            await adminSupabase.from("opsi_soal").delete().eq("soal_id", targetSoalId);
            const opsiRows = item.opsi.map((op: any, oi: number) => ({
              soal_id: targetSoalId,
              teks_opsi: op.teks || op.teksOpsi || "",
              benar: Boolean(op.benar),
              urutan: oi + 1,
              label: String.fromCharCode(65 + oi),
              alasan_salah: op.alasanSalah || null,
            }));
            await adminSupabase.from("opsi_soal").insert(opsiRows);
          }
        } else {
          // Buat soal baru jika belum memiliki UUID
          const { data: newSoal } = await adminSupabase
            .from("soal")
            .insert({
              bab_id: babId || null,
              pertanyaan: item.pertanyaan,
              tipe_soal: tipeSoal,
              tingkat_soal: "sedang",
              sumber_konten: "guru_dashboard",
              status_soal: "dipublikasi",
              kunci_jawaban: kunci,
              pembahasan: item.pembahasan || "",
              pembuat_id: user.id,
            })
            .select("id")
            .single();

          if (newSoal?.id) {
            targetSoalId = newSoal.id;
            if (tipeSoal === "pilihan_ganda" && Array.isArray(item.opsi)) {
              const opsiRows = item.opsi.map((op: any, oi: number) => ({
                soal_id: newSoal.id,
                teks_opsi: op.teks || op.teksOpsi || "",
                benar: Boolean(op.benar),
                urutan: oi + 1,
                label: String.fromCharCode(65 + oi),
                alasan_salah: op.alasanSalah || null,
              }));
              await adminSupabase.from("opsi_soal").insert(opsiRows);
            }
          }
        }

        // Tautkan kembali ke ujian_soal
        if (targetSoalId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetSoalId)) {
          await adminSupabase.from("ujian_soal").insert({
            ujian_id: ujianId,
            soal_id: targetSoalId,
            urutan: idx + 1,
            poin_bobot: item.poin || 10,
          });
        }
      }
    }

    // 3. Catat ke audit log
    await adminSupabase.from("audit_log").insert({
      actor_id: user.id,
      role: profil.peran,
      aksi: "EXAM_UPDATED",
      target_resource: `ujian:${ujianId}`,
      detail: { judul, soal_count: soalList.length },
    });

    return NextResponse.json({
      success: true,
      ujian: updatedUjian,
      message: "Soal dan lembar ujian berhasil diperbarui!",
    });
  } catch (err: any) {
    console.error("Error PUT ujian [id]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: ujianId } = await params;
    if (!ujianId) {
      return NextResponse.json({ error: "ID Ujian wajib diisi" }, { status: 400 });
    }

    // 1. Bersihkan seluruh jawaban_ujian & sesi_ujian terlebih dahulu
    const { data: sesiList } = await adminSupabase
      .from("sesi_ujian")
      .select("id")
      .eq("ujian_id", ujianId);

    const sesiIds = (sesiList || []).map((s) => s.id);
    if (sesiIds.length > 0) {
      await adminSupabase.from("jawaban_ujian").delete().in("sesi_id", sesiIds);
      await adminSupabase.from("sesi_ujian").delete().eq("ujian_id", ujianId);
    }

    // 2. Bersihkan ujian_soal
    await adminSupabase.from("ujian_soal").delete().eq("ujian_id", ujianId);

    // 3. Hapus ujian master
    const { error: delErr } = await adminSupabase
      .from("ujian")
      .delete()
      .eq("id", ujianId);

    // Catat ID ke daftar deleted_ujian agar kartu ujian (termasuk kanonikal) terhapus permanen
    addDeletedUjianId(ujianId);

    return NextResponse.json({
      success: true,
      message: "Ujian berhasil dihapus.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

