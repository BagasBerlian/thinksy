import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      webhookUrl,
      type = "absensi", // "absensi" | "penilaian" | "kelas_bab_sync"
      sekolah,
      kelas,
      mapel = "Matematika",
      tanggal,
      jamPresensi,
      records = [],
      nilaiRecords = [],
      newClassData,
      newBabData,
    } = body;

    if (!webhookUrl || typeof webhookUrl !== "string") {
      return NextResponse.json(
        { error: "URL Webhook Google Apps Script belum diatur. Silakan masukkan Web App URL di Pengaturan Spreadsheet." },
        { status: 400 }
      );
    }

    if (!webhookUrl.startsWith("https://script.google.com/macros/s/")) {
      return NextResponse.json(
        {
          error:
            "Format URL Webhook tidak valid. Pastikan URL dimulai dengan https://script.google.com/macros/s/...",
        },
        { status: 400 }
      );
    }

    const payload = {
      type,
      spreadsheetId: "1zsL9NyavgKzPqL1LGrNUhRObwJwAKAisNRYLEyKt9VY",
      sekolah: sekolah || "SMK Muhammadiyah 1",
      kelas: kelas || "Kelas 8-A",
      mapel: mapel || "Matematika",
      tanggal: tanggal || new Date().toLocaleDateString("id-ID"),
      waktuSync: new Date().toISOString(),
      jamPresensi: jamPresensi || { masuk: "07:15", terlambat: "07:30", tutup: "08:00" },
      records,
      nilaiRecords,
      newClassData,
      newBabData,
    };

    // Forward payload to Google Apps Script Web App (follow redirects)
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      redirect: "follow",
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        {
          error: `Gagal mengirim data ke Google Spreadsheet. Status: ${response.status} (${response.statusText}).`,
          details: errorText,
        },
        { status: 502 }
      );
    }

    let responseData;
    try {
      responseData = await response.json();
    } catch {
      responseData = {
        status: "success",
        message:
          type === "penilaian"
            ? "Data penilaian kelas matematika berhasil disinkronkan ke tab 'Penilaian' Spreadsheet!"
            : "Data presensi siswa berhasil disinkronkan ke tab 'Absensi siswa' Spreadsheet!",
      };
    }

    return NextResponse.json({
      success: true,
      message:
        responseData.message ||
        (type === "penilaian"
          ? "Data nilai matematika berhasil masuk ke tab 'Penilaian'!"
          : "Data absensi siswa berhasil masuk ke tab 'Absensi siswa'!"),
      timestamp: new Date().toISOString(),
      type,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan server saat sinkronisasi ke Spreadsheet." },
      { status: 500 }
    );
  }
}

