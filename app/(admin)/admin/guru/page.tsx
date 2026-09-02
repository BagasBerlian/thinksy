"use client";

import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Plus,
  Search,
  Mail,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  UserCheck,
  UserPlus,
  Send,
  Users,
} from "lucide-react";

interface Undangan {
  id: string;
  email: string;
  nama_yang_diundang: string;
  digunakan: boolean;
  dibuat_pada: string;
  kadaluarsa_pada: string;
}

interface GuruItem {
  id: string;
  initials: string;
  nama_lengkap: string;
  dibuat_pada: string;
  status: string;
}

function ModalUndangGuru({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/guru/buat-akun", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama_lengkap: nama, email }),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 border border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">Undang Guru Baru</h2>
              <p className="text-xs text-slate-500">Guru dapat mendaftar dengan email ini</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
          <span>
            Guru yang diundang dapat mendaftar atau login menggunakan email di bawah ini. Undangan berlaku selama <strong>7 hari</strong>.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Nama Lengkap Guru
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
              minLength={3}
              disabled={isLoading}
              placeholder="contoh: Budi Santoso, S.Pd."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white transition-all disabled:opacity-60"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Email Guru
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                placeholder="guru@sekolah.sch.id"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white transition-all disabled:opacity-60"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl bg-[#0B1A2E] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#12253F] transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {isLoading ? "Memproses..." : "Kirim Undangan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminGuruPage() {
  const [activeTab, setActiveTab] = useState<"terdaftar" | "undangan">("terdaftar");
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [guruList, setGuruList] = useState<GuruItem[]>([]);
  const [loadingGuru, setLoadingGuru] = useState(true);

  const [undanganList, setUndanganList] = useState<Undangan[]>([]);
  const [loadingUndangan, setLoadingUndangan] = useState(true);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchGuru = useCallback(async () => {
    setLoadingGuru(true);
    try {
      const res = await fetch("/api/admin/guru");
      if (res.ok) {
        const data = await res.json();
        setGuruList(data.guru || []);
      }
    } catch {
      // silent fail
    } finally {
      setLoadingGuru(false);
    }
  }, []);

  const fetchUndangan = useCallback(async () => {
    setLoadingUndangan(true);
    try {
      const res = await fetch("/api/admin/guru/buat-akun");
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
    fetchGuru();
    fetchUndangan();
  }, [fetchGuru, fetchUndangan]);

  const handleSuccess = () => {
    setSuccessMsg("Undangan berhasil dikirim! Guru dapat mendaftar menggunakan email tersebut.");
    fetchUndangan();
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  const guruFiltered = guruList.filter((g) =>
    g.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const undanganFiltered = undanganList.filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.nama_yang_diundang?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
              Manajemen Guru & Tenaga Pendidik
            </h1>
            <p className="text-sm text-slate-500">
              Kelola guru terdaftar dan undang guru baru untuk bergabung ke sistem sekolah
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            id="btn-undang-guru"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0B1A2E] text-white text-sm font-semibold rounded-xl hover:bg-[#12253F] transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Undang Guru Baru
          </button>
        </div>

        {/* Success message */}
        {successMsg && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
            <CheckCircle className="w-5 h-5 shrink-0 text-green-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tabs & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("terdaftar")}
              className={`px-4 py-2 text-xs font-extrabold rounded-xl transition flex items-center gap-2 ${
                activeTab === "terdaftar"
                  ? "bg-[#0F172A] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Guru Terdaftar ({guruList.length})
            </button>
            <button
              onClick={() => setActiveTab("undangan")}
              className={`px-4 py-2 text-xs font-extrabold rounded-xl transition flex items-center gap-2 ${
                activeTab === "undangan"
                  ? "bg-[#0F172A] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              Undangan Guru ({undanganList.length})
            </button>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari guru..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none"
            />
          </div>
        </div>

        {/* Tab 1: Guru Terdaftar */}
        {activeTab === "terdaftar" && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-800 text-sm">Daftar Guru Aktif</h2>
              <span className="text-xs text-slate-400">{guruFiltered.length} guru</span>
            </div>

            {loadingGuru ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : guruFiltered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="w-10 h-10 text-slate-200 mb-3" />
                <p className="text-sm font-medium text-slate-400">Belum ada guru yang terdaftar</p>
                <p className="text-xs text-slate-400 mt-1">
                  Klik "Undang Guru Baru" untuk mengundang guru
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {guruFiltered.map((g) => (
                  <div key={g.id} className="px-5 py-4 flex items-center gap-4 hover:bg-slate-50/50 transition">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-extrabold text-xs shrink-0 shadow-xs">
                      {g.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-extrabold text-[#0F172A]">
                        {g.nama_lengkap}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Bergabung: {new Date(g.dibuat_pada).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold">
                      {g.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Undangan Guru */}
        {activeTab === "undangan" && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-800 text-sm">Daftar Undangan Guru</h2>
              <span className="text-xs text-slate-400">{undanganFiltered.length} undangan</span>
            </div>

            {loadingUndangan ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : undanganFiltered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <UserPlus className="w-10 h-10 text-slate-200 mb-3" />
                <p className="text-sm font-medium text-slate-400">Belum ada undangan guru</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {undanganFiltered.map((u) => {
                  const isExpired = new Date(u.kadaluarsa_pada) < new Date();
                  return (
                    <div key={u.id} className="px-5 py-4 flex items-center gap-4">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-emerald-700">
                          {(u.nama_yang_diundang || u.email)[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {u.nama_yang_diundang || "-"}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{u.email}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        {u.digunakan ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-semibold border border-green-200">
                            <CheckCircle className="w-3 h-3" />
                            Bergabung
                          </span>
                        ) : isExpired ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-semibold border border-red-200">
                            Kadaluarsa
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-semibold border border-amber-200">
                            <Clock className="w-3 h-3" />
                            Menunggu
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <ModalUndangGuru
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
        />
      )}
    </AdminLayout>
  );
}
