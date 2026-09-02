"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  Building,
  Plus,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Search,
  Trash2,
  MapPin,
  Hash,
  FolderOpen,
  Edit,
  Save,
  Users,
} from "lucide-react";
import Link from "next/link";

interface Sekolah {
  id: string;
  nama: string;
  npsn: string | null;
  alamat: string | null;
  motto: string | null;
  deskripsi: string | null;
  dibuat_pada: string;
  teacherCount?: number;
  studentCount?: number;
  adminCount?: number;
}

function ModalRegistrasiSekolah({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [nama, setNama] = useState("");
  const [npsn, setNpsn] = useState("");
  const [alamat, setAlamat] = useState("");
  const [motto, setMotto] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/super/sekolah", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama,
          npsn: npsn || undefined,
          alamat: alamat || undefined,
          motto: motto || undefined,
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
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Building className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base">Registrasi Tenant Sekolah</h2>
              <p className="text-xs text-slate-400">Daftarkan institusi baru ke platform</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Nama Sekolah *
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
              minLength={3}
              placeholder="SMP Negeri 1 Nusantara"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              NPSN
            </label>
            <input
              type="text"
              value={npsn}
              onChange={(e) => setNpsn(e.target.value)}
              placeholder="20101010"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Alamat
            </label>
            <textarea
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              rows={2}
              placeholder="Jl. Pendidikan No. 1"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {error}
            </div>
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
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-extrabold flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Daftarkan Sekolah"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ModalEditSekolah({
  sekolah,
  onClose,
  onSuccess,
}: {
  sekolah: Sekolah;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [nama, setNama] = useState(sekolah.nama || "");
  const [npsn, setNpsn] = useState(sekolah.npsn || "");
  const [alamat, setAlamat] = useState(sekolah.alamat || "");
  const [motto, setMotto] = useState(sekolah.motto || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/super/sekolah", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: sekolah.id,
          nama,
          npsn,
          alamat,
          motto,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal memperbarui.");
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0F172A] border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="font-bold text-white text-base flex items-center gap-2">
            <Edit className="w-4 h-4 text-amber-400" />
            Edit Detail Tenant Sekolah
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Nama Sekolah
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              NPSN
            </label>
            <input
              type="text"
              value={npsn}
              onChange={(e) => setNpsn(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Alamat
            </label>
            <textarea
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Motto
            </label>
            <input
              type="text"
              value={motto}
              onChange={(e) => setMotto(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 text-red-400 text-xs">{error}</div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 text-xs font-bold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SuperSekolahPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingSekolah, setEditingSekolah] = useState<Sekolah | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sekolahList, setSekolahList] = useState<Sekolah[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchSekolah = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/super/sekolah");
      if (res.ok) {
        const data = await res.json();
        setSekolahList(data.sekolah || []);
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSekolah();
  }, [fetchSekolah]);

  const handleSuccess = () => {
    setSuccessMsg("Operasi tenant sekolah berhasil diproses!");
    fetchSekolah();
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  const handleDelete = async (id: string, nama: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus tenant "${nama}"?`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/super/sekolah?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setSuccessMsg(`Tenant "${nama}" berhasil dihapus.`);
        fetchSekolah();
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menghapus.");
      }
    } catch {
      alert("Gagal koneksi.");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = sekolahList.filter(
    (s) =>
      s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.npsn && s.npsn.includes(searchQuery)) ||
      (s.alamat && s.alamat.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white font-sans p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/super"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl transition shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dashboard Super Admin</span>
        </Link>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Registrasi Tenant Sekolah</span>
        </button>
      </div>

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Building className="w-6 h-6 text-amber-400" />
          <span>Manajemen Tenant / Sekolah Multi-Tenant</span>
        </h1>
        <p className="text-xs text-slate-400 font-semibold">
          Daftar seluruh institusi sekolah terisolasi dalam ekosistem THINKSY.
        </p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nama sekolah, NPSN, atau alamat..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-700 transition-all"
        />
      </div>

      {/* List */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-bold text-white text-sm">Daftar Tenant Sekolah</h2>
          <span className="text-xs text-slate-500">{sekolahList.length} sekolah</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <FolderOpen className="w-10 h-10 text-slate-700" />
            <p className="text-sm font-bold text-slate-400">Belum ada sekolah terdaftar</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/50">
            {filtered.map((s) => (
              <div key={s.id} className="px-5 py-4 flex items-center gap-4 hover:bg-slate-800/30 transition">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0">
                  <Building className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{s.nama}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                    {s.npsn && (
                      <span className="flex items-center gap-1">
                        <Hash className="w-3 h-3" /> {s.npsn}
                      </span>
                    )}
                    {s.alamat && (
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 shrink-0" /> {s.alamat}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[11px] font-bold text-slate-500">
                    <span>👨‍💼 {s.adminCount || 0} Admin</span>
                    <span>•</span>
                    <span>👨‍🏫 {s.teacherCount || 0} Guru</span>
                    <span>•</span>
                    <span>🎓 {s.studentCount || 0} Siswa</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setEditingSekolah(s)}
                    className="p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 transition cursor-pointer"
                    title="Edit sekolah"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(s.id, s.nama)}
                    disabled={deletingId === s.id}
                    className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                    title="Hapus tenant"
                  >
                    {deletingId === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <ModalRegistrasiSekolah
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
        />
      )}

      {editingSekolah && (
        <ModalEditSekolah
          sekolah={editingSekolah}
          onClose={() => setEditingSekolah(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
