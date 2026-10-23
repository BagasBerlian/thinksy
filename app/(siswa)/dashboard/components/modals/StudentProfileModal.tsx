"use client";

import { useEffect, useState } from "react";
import { X, Mail, GraduationCap, User, LogOut } from "lucide-react";
import { logoutAction } from "@/app/(auth)/actions";
import { SekolahData } from "../../types";
import {
  getStoredStudentProfile,
  getStoredStudentPhoto,
  DEFAULT_STUDENT_PHOTO,
  StudentCardProfile,
} from "@/lib/student-settings";

export interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  studentEmail?: string;
  ketuntasanBab?: string;
  totalKehadiran?: string;
  nisn?: string | null;
  nis?: string | null;
  namaKelas?: string | null;
  jurusan?: string | null;
  tahunAjaran?: string | null;
  fotoUrl?: string | null;
  sekolahData?: SekolahData | null;
  onOpenSettings?: () => void;
  waliKelas?: string | null;
}

export default function StudentProfileModal({
  isOpen,
  onClose,
  studentName = "Siswa",
  studentEmail = "siswa@sekolah.sch.id",
  namaKelas = "Kelas 8",
  nis,
  nisn,
  jurusan,
  tahunAjaran,
  fotoUrl,
  sekolahData,
  onOpenSettings,
  waliKelas = "Ibu Siti Rahmawati, M.Pd.",
}: StudentProfileModalProps) {
  const [profileState, setProfileState] = useState<StudentCardProfile>(() => {
    return getStoredStudentProfile({
      nama_lengkap: studentName,
      nama_kelas: namaKelas || undefined,
      nis: nis || undefined,
      nisn: nisn || undefined,
      jurusan: jurusan || undefined,
      tahun_ajaran: tahunAjaran || undefined,
      foto_url: fotoUrl || undefined,
    });
  });

  useEffect(() => {
    if (isOpen) {
      const current = getStoredStudentProfile({
        nama_lengkap: studentName,
        nama_kelas: namaKelas || undefined,
        nis: nis || undefined,
        nisn: nisn || undefined,
        jurusan: jurusan || undefined,
        tahun_ajaran: tahunAjaran || undefined,
        foto_url: fotoUrl || undefined,
      });
      setProfileState(current);
    }
  }, [isOpen, studentName, namaKelas, nis, nisn, jurusan, tahunAjaran, fotoUrl]);

  if (!isOpen) return null;

  const rawDisplayName =
    studentName && studentName.trim() !== "" && studentName !== "Siswa Thinksy"
      ? studentName
      : profileState.nama_lengkap || studentName || "Siswa Thinksy";

  const displayName = rawDisplayName
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

  const activeClass = profileState.nama_kelas || namaKelas || "Kelas 8";
  const displayPhoto = getStoredStudentPhoto(profileState.foto_url || fotoUrl);
  const schoolName = sekolahData?.nama || "SMK Muhammadiyah 1";

  const firstLetter = (displayName || "S").trim().charAt(0).toUpperCase();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200/90 p-5 sm:p-6 text-slate-900 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tombol Tutup X */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
          title="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header: Profil Pengguna */}
        <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-4 font-sans tracking-tight">
          Profil Pengguna
        </h3>

        {/* Baris Identitas: Avatar, Nama, Asal Sekolah, Email */}
        <div className="flex items-start gap-3.5 pt-1">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-blue-50 border-2 border-slate-100 shadow-xs shrink-0 flex items-center justify-center">
            {displayPhoto ? (
              <img
                src={displayPhoto}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#7C3AED] text-white flex items-center justify-center font-bold text-xl">
                {firstLetter}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-sm sm:text-base font-bold text-slate-900 truncate">
              {displayName}
            </div>
            <div className="text-xs text-slate-500 leading-tight mt-0.5 truncate">
              {schoolName}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-2 truncate">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">
                {studentEmail || "siswa@sekolah.sch.id"}
              </span>
            </div>
          </div>
        </div>

        {/* Garis Pemisah */}
        <div className="my-4 border-t border-slate-100" />

        {/* Informasi Akademik: Kelas & Wali Kelas saja */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-800">
            Informasi Akademik
          </div>
          <div className="space-y-1.5 pt-0.5">
            <div className="flex items-center gap-2.5 text-xs text-slate-700">
              <GraduationCap className="w-4 h-4 text-slate-500 shrink-0" />
              <span>{activeClass}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-700">
              <User className="w-4 h-4 text-slate-500 shrink-0" />
              <span>Wali Kelas: {waliKelas || "Ibu Siti Rahmawati, M.Pd."}</span>
            </div>
          </div>
        </div>

        {/* Garis Pemisah */}
        <div className="my-4 border-t border-slate-100" />

        {/* Button Keluar */}
        <button
          type="button"
          onClick={async () => {
            onClose();
            await logoutAction();
          }}
          className="w-full py-2.5 px-4 rounded-xl border border-rose-300 text-rose-500 hover:bg-rose-50 flex items-center justify-center gap-2 text-sm font-semibold transition active:scale-95 cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-rose-500" />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );
}
