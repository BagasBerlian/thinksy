/**
 * Google Spreadsheet Integration Client & Utilities for Thinksy LMS
 * Target Spreadsheet:
 * https://docs.google.com/spreadsheets/d/1zsL9NyavgKzPqL1LGrNUhRObwJwAKAisNRYLEyKt9VY/edit
 *
 * Tabs:
 * 1. "Absensi siswa"
 * 2. "Penilaian"
 */

export const SPREADSHEET_ID = "1zsL9NyavgKzPqL1LGrNUhRObwJwAKAisNRYLEyKt9VY";
export const SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`;

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * THINKSY LMS - GOOGLE SPREADSHEET SINKRONISASI OTOMATIS
 * Spreadsheet: DATA THINKSY (ID: 1zsL9NyavgKzPqL1LGrNUhRObwJwAKAisNRYLEyKt9VY)
 * Tab 1: Absensi siswa
 * Tab 2: Penilaian
 */

var SPREADSHEET_ID = "1zsL9NyavgKzPqL1LGrNUhRObwJwAKAisNRYLEyKt9VY";

function getSS() {
  try {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (err) {
    return SpreadsheetApp.getActiveSpreadsheet();
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    message: "Webhook Thinksy LMS aktif dan siap menerima data!"
  })).setMimeType(ContentService.MimeType.JSON);
}

function testKoneksi() {
  var ss = getSS();
  var sheet1 = ss.getSheetByName("Absensi siswa") || ss.insertSheet("Absensi siswa");
  var sheet2 = ss.getSheetByName("Penilaian") || ss.insertSheet("Penilaian");
  Logger.log("Koneksi Google Spreadsheet Thinksy Berhasil!");
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Payload kosong. Webhook aktif."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var data = JSON.parse(e.postData.contents);
    var ss = getSS();
    var type = data.type || "absensi";

    // ─────────────────────────────────────────────────────────
    // PERINTAH 1: SINKRONISASI KE TAB "Absensi siswa"
    // ─────────────────────────────────────────────────────────
    if (type === "absensi") {
      var sheetName = "Absensi siswa";
      var sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        sheet = ss.insertSheet(sheetName);
      }

      // Pastikan Header Ada
      if (sheet.getLastRow() === 0) {
        sheet.appendRow([
          "No",
          "Tanggal",
          "Jam Masuk",
          "NISN",
          "Nama Siswa",
          "Kelas",
          "Status Kehadiran",
          "Poin XP",
          "Evaluasi Kedisiplinan",
          "Waktu Sinkronisasi"
        ]);
        sheet.getRange("A1:J1").setBackground("#059669").setFontColor("#ffffff").setFontWeight("bold");
        sheet.setFrozenRows(1);
      }

      var records = data.records || [];
      var nowStr = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");
      var tglStr = data.tanggal || Utilities.formatDate(new Date(), "Asia/Jakarta", "dd/MM/yyyy");
      var jamBawaan = (data.jamPresensi && data.jamPresensi.masuk) ? data.jamPresensi.masuk : "07:15";

      for (var i = 0; i < records.length; i++) {
        var r = records[i];
        var stat = (r.status || "HADIR").toUpperCase();
        var evaluasi = stat === "HADIR" ? "Tepat Waktu & Disiplin" : stat === "IZIN" ? "Izin Resmi" : stat === "SAKIT" ? "Surat Dokter" : "Perlu Pendampingan";

        sheet.appendRow([
          r.no || (i + 1),
          tglStr,
          r.jamMasuk || jamBawaan,
          r.nisn || "-",
          r.nama || "-",
          r.kelas || data.kelas || "Kelas 8-A",
          stat,
          r.points || 0,
          evaluasi,
          nowStr
        ]);
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Data absensi (" + records.length + " siswa) berhasil masuk ke tab 'Absensi siswa'!"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ─────────────────────────────────────────────────────────
    // PERINTAH 2: SINKRONISASI KE TAB "Penilaian"
    // ─────────────────────────────────────────────────────────
    if (type === "penilaian" || type === "kelas_bab_sync") {
      var sheetName2 = "Penilaian";
      var sheet2 = ss.getSheetByName(sheetName2);
      if (!sheet2) {
        sheet2 = ss.insertSheet(sheetName2);
      }

      // Pastikan Header Tab Penilaian Ada
      if (sheet2.getLastRow() === 0) {
        sheet2.appendRow([
          "No",
          "NISN",
          "Nama Siswa",
          "Kelas",
          "Mata Pelajaran",
          "Bab 1 (Pangkat)",
          "Bab 2 (Pythagoras)",
          "Bab 3 (SPLDV)",
          "Bab 4 (Statistika)",
          "Bab 5 (Peluang)",
          "Bab 6 (Bangun Ruang)",
          "Nilai Rata-rata",
          "Predikat",
          "Terakhir Diperbarui"
        ]);
        sheet2.getRange("A1:N1").setBackground("#1E40AF").setFontColor("#ffffff").setFontWeight("bold");
        sheet2.setFrozenRows(1);
      }

      // Jika ada bab baru, tambahkan kolom header jika belum ada
      if (data.newBabData && data.newBabData.title) {
        var headerValues = sheet2.getRange(1, 1, 1, sheet2.getLastColumn()).getValues()[0];
        var babTitle = "Bab: " + data.newBabData.title;
        var exists = headerValues.indexOf(babTitle) > -1;
        if (!exists) {
          var nextCol = sheet2.getLastColumn() + 1;
          sheet2.getRange(1, nextCol).setValue(babTitle).setBackground("#1E40AF").setFontColor("#ffffff").setFontWeight("bold");
        }
      }

      var nilaiList = data.nilaiRecords || [];
      var existingData = sheet2.getDataRange().getValues();
      var nowTime = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");

      for (var j = 0; j < nilaiList.length; j++) {
        var n = nilaiList[j];
        var foundRow = -1;
        for (var row = 1; row < existingData.length; row++) {
          if (existingData[row][1] == n.nisn || existingData[row][2] == n.nama) {
            foundRow = row + 1;
            break;
          }
        }

        var b1 = n.b1 !== undefined ? n.b1 : (n.bab1 || 85);
        var b2 = n.b2 !== undefined ? n.b2 : (n.bab2 || 90);
        var b3 = n.b3 !== undefined ? n.b3 : (n.bab3 || 88);
        var b4 = n.b4 !== undefined ? n.b4 : (n.bab4 || 80);
        var b5 = n.b5 !== undefined ? n.b5 : (n.bab5 || 85);
        var b6 = n.b6 !== undefined ? n.b6 : (n.bab6 || 92);
        var avg = Math.round((b1 + b2 + b3 + b4 + b5 + b6) / 6);
        var predikat = avg >= 90 ? "A (Sangat Baik)" : avg >= 80 ? "B (Baik)" : avg >= 70 ? "C (Cukup)" : "D (Perlu Bimbingan)";

        if (foundRow > 0) {
          // Update Baris yang Sudah Ada
          sheet2.getRange(foundRow, 6).setValue(b1);
          sheet2.getRange(foundRow, 7).setValue(b2);
          sheet2.getRange(foundRow, 8).setValue(b3);
          sheet2.getRange(foundRow, 9).setValue(b4);
          sheet2.getRange(foundRow, 10).setValue(b5);
          sheet2.getRange(foundRow, 11).setValue(b6);
          sheet2.getRange(foundRow, 12).setValue(avg);
          sheet2.getRange(foundRow, 13).setValue(predikat);
          sheet2.getRange(foundRow, 14).setValue(nowTime);
        } else {
          // Tambah Baris Baru
          sheet2.appendRow([
            n.no || (j + 1),
            n.nisn || "008" + (j + 1000),
            n.nama || "Siswa " + (j + 1),
            n.kelas || data.kelas || "Kelas 8-A",
            n.mapel || data.mapel || "Matematika",
            b1, b2, b3, b4, b5, b6,
            avg, predikat, nowTime
          ]);
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Data nilai matematika berhasil disinkronkan ke tab 'Penilaian'!"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Data diterima."
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
`;

export function getStoredWebhookUrl(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("thinksy_spreadsheet_webhook_url") || "";
}

export function saveStoredWebhookUrl(url: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("thinksy_spreadsheet_webhook_url", url.trim());
}

export interface StudentPresensiRecord {
  no?: number;
  nisn: string;
  nama: string;
  kelas?: string;
  status: "hadir" | "izin" | "sakit" | "alpa";
  jamMasuk?: string;
  points?: number;
  catatan?: string;
}

export interface StudentNilaiRecord {
  no?: number;
  nisn: string;
  nama: string;
  kelas?: string;
  mapel?: string;
  b1?: number;
  b2?: number;
  b3?: number;
  b4?: number;
  b5?: number;
  b6?: number;
}

/**
 * Trigger sync of Absensi Siswa to Tab "Absensi siswa"
 */
export async function syncAbsensiToSpreadsheet(params: {
  webhookUrl?: string;
  kelas?: string;
  tanggal?: string;
  records: StudentPresensiRecord[];
}) {
  const url = params.webhookUrl || getStoredWebhookUrl();
  const res = await fetch("/api/guru/presensi/spreadsheet-sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      webhookUrl: url,
      type: "absensi",
      kelas: params.kelas || "Kelas 8-A",
      tanggal: params.tanggal,
      records: params.records,
    }),
  });
  return await res.json();
}

/**
 * Trigger sync of Penilaian Kelas Matematika to Tab "Penilaian"
 */
export async function syncPenilaianToSpreadsheet(params: {
  webhookUrl?: string;
  kelas?: string;
  mapel?: string;
  nilaiRecords: StudentNilaiRecord[];
}) {
  const url = params.webhookUrl || getStoredWebhookUrl();
  const res = await fetch("/api/guru/presensi/spreadsheet-sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      webhookUrl: url,
      type: "penilaian",
      kelas: params.kelas || "Kelas 8-A",
      mapel: params.mapel || "Matematika",
      nilaiRecords: params.nilaiRecords,
    }),
  });
  return await res.json();
}

/**
 * Trigger auto-sync when a new class or new bab is created
 */
export async function syncNewClassOrBabToSpreadsheet(params: {
  webhookUrl?: string;
  newClassData?: { id: string; name: string; section?: string };
  newBabData?: { id: string; title: string; subjectId?: string };
}) {
  const url = params.webhookUrl || getStoredWebhookUrl();
  if (!url) return { skipped: true, reason: "No webhook URL" };

  try {
    const res = await fetch("/api/guru/presensi/spreadsheet-sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        webhookUrl: url,
        type: "kelas_bab_sync",
        newClassData: params.newClassData,
        newBabData: params.newBabData,
      }),
    });
    return await res.json();
  } catch (err: any) {
    return { error: err.message };
  }
}
