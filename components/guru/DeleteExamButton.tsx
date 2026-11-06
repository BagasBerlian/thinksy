"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle, Loader2, X } from "lucide-react";

interface DeleteExamButtonProps {
  ujianId: string;
  judul: string;
  onDeleted?: () => void;
}

export default function DeleteExamButton({
  ujianId,
  judul,
  onDeleted,
}: DeleteExamButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setErrorMessage(null);

      const res = await fetch(`/api/guru/ujian/${ujianId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Gagal menghapus kartu ujian.");
        return;
      }

      setIsOpen(false);
      if (onDeleted) {
        onDeleted();
      }
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan jaringan.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="p-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition cursor-pointer shrink-0"
        title="Hapus kartu ujian ini"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-rose-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    Konfirmasi Hapus
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-0.5">
                    Hapus Kartu Ujian?
                  </h3>
                </div>
              </div>

              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Apakah Anda yakin ingin menghapus kartu ujian berikut?
              </p>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-black text-slate-900 line-clamp-2">
                  {judul}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">
                  ID: {ujianId}
                </div>
              </div>
              <p className="text-[11px] text-rose-600 font-bold leading-normal">
                ⚠️ Seluruh butir soal, sesi penilaian siswa, dan statistik terkait pada kartu ini akan dihapus secara permanen.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold">
                {errorMessage}
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Ya, Hapus Kartu</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

