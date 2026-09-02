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
  Users,
  Edit,
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

interface AdminItem {
  id: string;
  initials: string;
  nama_lengkap: string;
  sekolah_id: string | null;
  nama_sekolah: string;
  npsn_sekolah: string;
  dibuat_pada: string;
  status: string;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0F172A] border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
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
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Nama Lengkap *
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
              minLength={3}
              placeholder="contoh: Hendra Wijaya, S.Kom."
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@sekolah.sch.id"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Assign ke Tenant Sekolah
            </label>
            <select
              value={sekolahId}
              onChange={(e) => setSekolahId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none"
            >
              <option value="">— Tanpa Sekolah (Dapat Ditetapkan Nanti) —</option>
              {sekolahList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nama}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 text-red-400 text-xs">{error}</div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 text-sm font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl bg-amber-400 text-slate-950 text-sm font-extrabold flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Buat Undangan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SuperAdminSekolahPage() {
  const [activeTab, setActiveTab] = useState<"terdaftar" | "undangan">("terdaftar");
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [adminList, setAdminList] = useState<AdminItem[]>([]);
  const [loadingAdmin, setLoadingAdmin] = useState(true);

  const [undanganList, setUndanganList] = useState<Undangan[]>([]);
  const [loadingUndangan, setLoadingUndangan] = useState(true);

  const [sekolahOptions, setSekolahOptions] = useState<Sekolah[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchAdminTerdaftar = useCallback(async () => {
    setLoadingAdmin(true);
    try {
      const res = await fetch("/api/super/admin-sekolah");
      if (res.ok) {
        const data = await res.json();
        setAdminList(data.adminSekolah || []);
      }
    } catch {
      // silent fail
    } finally {
      setLoadingAdmin(false);
    }
  }, []);

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

  const fetchSekolahOptions = useCallback(async () => {
    try {
      const res = await fetch("/api/super/sekolah");
      if (res.ok) {
        const data = await res.json();
        setSekolahOptions(data.sekolah || []);
      }
    } catch {
      // silent fail
    }
  }, []);

  useEffect(() => {
    fetchAdminTerdaftar();
    fetchUndangan();
    fetchSekolahOptions();
  }, [fetchAdminTerdaftar, fetchUndangan, fetchSekolahOptions]);

  const handleSuccess = () => {
    setSuccessMsg("Operasi berhasil diproses!");
    fetchUndangan();
    fetchAdminTerdaftar();
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  const handleReassignSchool = async (adminId: string, newSekolahId: string) => {
    setUpdatingId(adminId);
    try {
      const res = await fetch("/api/super/admin-sekolah", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admin_id: adminId,
          sekolah_id: newSekolahId || null,
        }),
      });

      if (res.ok) {
        setSuccessMsg("Alokasi sekolah untuk Admin berhasil diperbarui.");
        fetchAdminTerdaftar();
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        const data = await res.json();
        alert(data.error || "Gagal memperbarui alokasi.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setUpdatingId(null);
    }
  };

  const adminFiltered = adminList.filter((a) =>
    a.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.nama_sekolah.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const undanganFiltered = undanganList.filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.nama_yang_diundang?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white font-sans p-6 sm:p-8 space-y-6 max-w-6xl mx-auto">
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
          <span>Manajemen Akun Admin Sekolah</span>
        </h1>
        <p className="text-xs text-slate-400 font-semibold">
          Kelola alokasi akun Admin Sekolah terdaftar ke tenant institusi masing-masing.
        </p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("terdaftar")}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl transition flex items-center gap-2 ${
              activeTab === "terdaftar"
                ? "bg-amber-400 text-slate-950 shadow-xs"
                : "bg-slate-900 text-slate-400 hover:bg-slate-800"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Admin Terdaftar ({adminList.length})
          </button>
          <button
            onClick={() => setActiveTab("undangan")}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl transition flex items-center gap-2 ${
              activeTab === "undangan"
                ? "bg-amber-400 text-slate-950 shadow-xs"
                : "bg-slate-900 text-slate-400 hover:bg-slate-800"
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            Undangan Admin ({undanganList.length})
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari admin atau sekolah..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium text-white focus:outline-none"
          />
        </div>
      </div>

      {/* TAB 1: ADMIN TERDAFTAR */}
      {activeTab === "terdaftar" && (
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="font-bold text-white text-sm">Daftar Admin Sekolah Aktif</h2>
            <span className="text-xs text-slate-500">{adminFiltered.length} akun</span>
          </div>

          {loadingAdmin ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
            </div>
          ) : adminFiltered.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Belum ada Admin Sekolah yang terdaftar.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/50">
              {adminFiltered.map((a) => (
                <div key={a.id} className="px-5 py-4 flex items-center gap-4 hover:bg-slate-800/30 transition">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center font-extrabold text-xs shrink-0">
                    {a.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-extrabold text-white">{a.nama_lengkap}</p>
                    <p className="text-xs text-amber-400 font-bold mt-0.5 flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      {a.nama_sekolah}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {updatingId === a.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    ) : (
                      <select
                        defaultValue={a.sekolah_id || ""}
                        onChange={(e) => handleReassignSchool(a.id, e.target.value)}
                        className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none cursor-pointer"
                      >
                        <option value="">— Ubah Alokasi Sekolah —</option>
                        {sekolahOptions.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.nama}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: UNDANGAN ADMIN */}
      {activeTab === "undangan" && (
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="font-bold text-white text-sm">Daftar Undangan Admin Sekolah</h2>
            <span className="text-xs text-slate-500">{undanganFiltered.length} undangan</span>
          </div>

          {loadingUndangan ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
            </div>
          ) : undanganFiltered.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Belum ada undangan admin dikirim.
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
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {showModal && (
        <ModalUndangAdmin
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
