"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  UserCog,
  Plus,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  Mail,
  Search,
  Send,
  UserCheck,
  Building,
} from "lucide-react";
import Link from "next/link";

interface Undangan {
  id: string;
  email: string;
  nama_yang_diundang: string;
  digunakan: boolean;
  dibuat_pada: string;
  kadaluarsa_pada: string;
  sekolah_id: string | null;
}

interface Sekolah {
  id: string;
  nama: string;
}

function ModalUndangAdmin({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [sekolahId, setSekolahId] = useState("");
  const [sekolahList, setSekolahList] = useState<Sekolah[]>([]);
  const [loadingSekolah, setLoadingSekolah] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSekolah() {
      setLoadingSekolah(true);
      try {
        const res = await fetch("/api/super/sekolah");
        if (res.ok) {
          const data = await res.json();
          setSekolahList(data.sekolah || []);
        }
      } catch {
        // silent
      } finally {
        setLoadingSekolah(false);
      }
    }
    fetchSekolah();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/super/admin-sekolah/buat-akun", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama_lengkap: nama,
          email,
          sekolah_id: sekolahId || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Terjadi kesalahan.");
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setError("Gagal menghubungi server. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0F172A] border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 flex items-center justify-center">
              <UserCog className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base">Undang Admin Sekolah</h2>
              <p className="text-xs text-slate-400">Admin dapat mendaftar dengan email ini</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info */}
        <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Orang yang diundang dapat mendaftar atau login menggunakan email ini dan akan otomatis mendapat peran <strong>Admin Sekolah</strong>. Undangan berlaku <strong>7 hari</strong>.
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Nama Lengkap <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
              minLength={3}
              disabled={isLoading}
              placeholder="contoh: Hendra Wijaya, S.Kom."
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-500 transition-all disabled:opacity-60"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Email <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                placeholder="admin@sekolah.sch.id"
                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-500 transition-all disabled:opacity-60"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Assign ke Sekolah (Opsional)
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              {loadingSekolah ? (
                <div className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-500 flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Memuat daftar sekolah...
                </div>
              ) : (
                <select
                  value={sekolahId}
                  onChange={(e) => setSekolahId(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-slate-500 transition-all disabled:opacity-60 appearance-none cursor-pointer"
                >
                  <option value="">— Pilih sekolah (opsional) —</option>
                  {sekolahList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama}
                    </option>
                  ))}
                </select>
              )}
            </div>
            {sekolahList.length === 0 && !loadingSekolah && (
              <p className="text-[10px] text-slate-500 mt-1">
                Belum ada sekolah terdaftar. <Link href="/super/sekolah" className="text-amber-400 hover:underline">Daftarkan dulu →</Link>
              </p>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 text-sm font-semibold hover:bg-slate-800 transition-all disabled:opacity-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl bg-amber-400 text-slate-950 text-sm font-extrabold flex items-center justify-center gap-2 hover:bg-amber-500 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {isLoading ? "Memproses..." : "Buat Undangan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SuperAdminSekolahPage() {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [undanganList, setUndanganList] = useState<Undangan[]>([]);
  const [loadingUndangan, setLoadingUndangan] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchUndangan = useCallback(async () => {
    setLoadingUndangan(true);
    try {
      const res = await fetch("/api/super/admin-sekolah/buat-akun");
      if (res.ok) {
        const data = await res.json();
        setUndanganList(data.undangan || []);
      }
    } catch {
      // silent fail
    } finally {
      setLoadingUndangan(false);
    }
  }, []);

  useEffect(() => {
    fetchUndangan();
  }, [fetchUndangan]);

  const handleSuccess = () => {
    setSuccessMsg("Undangan berhasil dibuat! Bagikan aplikasi ini kepada mereka.");
    fetchUndangan();
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  const undanganFiltered = undanganList.filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.nama_yang_diundang?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white font-sans p-6 sm:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/super"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Dashboard Super Admin</span>
        </Link>
        <button
          id="btn-undang-admin-sekolah"
          onClick={() => setShowModal(true)}
          className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Undang Admin Sekolah</span>
        </button>
      </div>

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <UserCog className="w-6 h-6 text-amber-400" />
          <span>Manajemen Admin Sekolah</span>
        </h1>
        <p className="text-xs text-slate-400 font-semibold">
          Undang orang untuk menjadi Admin Sekolah melalui sistem undangan berbasis email.
        </p>
      </div>

      {/* Success */}
      {successMsg && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Cara kerja */}
      <div className="bg-amber-400/10 border border-amber-400/30 rounded-2xl p-5 space-y-3">
        <h3 className="font-bold text-amber-300 text-sm flex items-center gap-2">
          <UserCheck className="w-4 h-4" />
          Cara Sistem Undangan Bekerja
        </h3>
        <ol className="list-decimal list-inside space-y-1.5 text-amber-200/80 text-xs">
          <li>Klik <strong>&quot;Undang Admin Sekolah&quot;</strong> dan masukkan nama serta email calon admin.</li>
          <li>Sistem menyimpan undangan yang berlaku selama <strong>7 hari</strong>.</li>
          <li>Beritahu mereka untuk daftar atau login di aplikasi ini menggunakan <strong>email yang Anda daftarkan</strong>.</li>
          <li>Sistem otomatis memberi mereka peran <strong>Admin Sekolah</strong>.</li>
        </ol>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nama atau email..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-700 transition-all"
        />
      </div>

      {/* List */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-bold text-white text-sm">Daftar Undangan Admin Sekolah</h2>
          <span className="text-xs text-slate-500">{undanganList.length} undangan</span>
        </div>

        {loadingUndangan ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
          </div>
        ) : undanganFiltered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <UserCog className="w-10 h-10 text-slate-700 mb-3" />
            <p className="text-sm font-bold text-slate-400">Belum ada undangan</p>
            <p className="text-xs text-slate-500 mt-1">
              Klik &quot;Undang Admin Sekolah&quot; untuk memulai
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/50">
            {undanganFiltered.map((u) => {
              const isExpired = new Date(u.kadaluarsa_pada) < new Date();
              return (
                <div key={u.id} className="px-5 py-4 flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-amber-400/20 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-amber-400">
                      {(u.nama_yang_diundang || u.email)[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {u.nama_yang_diundang || "-"}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{u.email}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    {u.digunakan ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 text-[10px] font-bold border border-green-500/30">
                        <CheckCircle className="w-3 h-3" />
                        Bergabung
                      </span>
                    ) : isExpired ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/30">
                        Kadaluarsa
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-400 text-[10px] font-bold border border-amber-400/30">
                        <Clock className="w-3 h-3" />
                        Menunggu
                      </span>
                    )}
                    <p className="text-[10px] text-slate-500 mt-1">
                      s.d. {new Date(u.kadaluarsa_pada).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <ModalUndangAdmin
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
