import AdminLayout from "@/components/admin/AdminLayout";
import Link from "next/link";
import {
  Download,
  Plus,
  Users,
  UserCheck,
  Building,
  ChevronRight,
  MapPin,
  Phone,
  Globe,
  Edit,
  Lightbulb,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function AdminSekolahDashboardPage() {
  const teacherList = [
    {
      initials: "BW",
      name: "Budi Santoso, M.Pd.",
      nip: "198005122005011003",
      subject: "Matematika",
      status: "Aktif",
      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      initials: "SD",
      name: "Siti Aminah, S.Si.",
      nip: "198511232010122001",
      subject: "Biologi",
      status: "Aktif",
      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      initials: "AW",
      name: "Andi Wijaya, S.Pd.",
      nip: "199002152015031005",
      subject: "Fisika",
      status: "Cuti",
      statusColor: "bg-amber-50 text-amber-800 border-amber-200",
    },
    {
      initials: "RH",
      name: "Rina Haryanti, M.A.",
      nip: "198207082008012004",
      subject: "Bahasa Inggris",
      status: "Aktif",
      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* 1. HEADER TITLE & ACTIONS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 uppercase tracking-wider">
              ID SEKOLAH: 1010101
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight pt-1">
              SMA Negeri 1 Jakarta
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold">
              Dashboard Administrasi Akademik Utama
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-extrabold flex items-center gap-2 shadow-xs transition cursor-pointer">
              <Download className="w-4 h-4 text-slate-500" />
              <span>Laporan</span>
            </button>
            <button className="px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-extrabold flex items-center gap-2 shadow-xs transition cursor-pointer">
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Tambah Data</span>
            </button>
          </div>
        </div>

        {/* 2. STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Total Siswa */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                TOTAL SISWA
              </div>
              <div className="text-3xl font-extrabold text-[#0F172A]">1,240</div>
              <p className="text-[11px] text-emerald-700 font-extrabold pt-1">
                ↗ +12% dari semester lalu
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Total Guru */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                TOTAL GURU
              </div>
              <div className="text-3xl font-extrabold text-[#0F172A]">85</div>
              <p className="text-[11px] text-slate-500 font-semibold pt-1">
                — Tetap stabil
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Kelas Aktif */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                KELAS AKTIF
              </div>
              <div className="text-3xl font-extrabold text-[#0F172A]">32</div>
              <p className="text-[11px] text-slate-500 font-semibold pt-1">
                — Kapasitas 95%
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Building className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* 3. MAIN CONTENT GRID (8 cols left, 4 cols right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Daftar Guru Terbaru Card */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-base font-extrabold text-[#0F172A]">
                  Daftar Guru Terbaru
                </h2>
                <Link
                  href="/admin/guru"
                  className="text-xs font-extrabold text-slate-600 hover:text-[#0F172A] flex items-center gap-1 cursor-pointer"
                >
                  <span>Lihat Semua</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5">NAMA GURU</th>
                      <th className="px-6 py-3.5">NIP</th>
                      <th className="px-6 py-3.5">MATA PELAJARAN</th>
                      <th className="px-6 py-3.5">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {teacherList.map((t, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-extrabold text-xs shrink-0">
                            {t.initials}
                          </div>
                          <span className="font-extrabold text-[#0F172A]">
                            {t.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-400 font-semibold">
                          {t.nip}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-800">
                          {t.subject}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-extrabold border ${t.statusColor}`}
                          >
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Banner: Tahun Ajaran Baru 2024/2025 */}
            <div className="rounded-3xl bg-[#0F172A] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 max-w-md">
                <h3 className="text-xl font-extrabold tracking-tight">
                  Tahun Ajaran Baru 2024/2025
                </h3>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  Persiapkan data akademik sebelum periode pendaftaran siswa baru dimulai.
                </p>
              </div>

              <button className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 text-[#0F172A] text-xs font-extrabold shrink-0 transition shadow-xs cursor-pointer">
                Mulai Persiapan
              </button>
            </div>
          </div>

          {/* Right Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Profil Sekolah Card */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs space-y-4">
              {/* Header Image Box */}
              <div className="h-32 bg-slate-900 relative flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-80" />
                <span className="absolute top-3 right-3 text-[10px] font-extrabold px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-md border border-white/30">
                  ✓ Akreditasi A (Unggul)
                </span>
                <div className="w-12 h-12 rounded-2xl bg-white text-[#0F172A] flex items-center justify-center font-extrabold shadow-md z-10">
                  <Building className="w-6 h-6 text-[#0F172A]" />
                </div>
              </div>

              {/* Title & Info Details */}
              <div className="px-6 pb-6 space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-extrabold text-[#0F172A]">
                    Profil Sekolah
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Akreditasi A (Unggul)
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <div className="flex items-center gap-2 text-slate-700 font-extrabold">
                      <MapPin className="w-4 h-4 text-slate-500" />
                      <span>Alamat Utama</span>
                    </div>
                    <p className="text-slate-500 text-[11px] font-medium leading-snug pl-6">
                      Jl. Budi Utomo No.7, Pasar Baru, Kecamatan Sawah Besar, Kota Jakarta Pusat, 10710
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <div className="flex items-center gap-2 text-slate-700 font-extrabold">
                      <Phone className="w-4 h-4 text-slate-500" />
                      <span>Kontak Admin</span>
                    </div>
                    <p className="text-slate-500 text-[11px] font-medium pl-6">
                      +62 21 345678
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <div className="flex items-center gap-2 text-slate-700 font-extrabold">
                      <Globe className="w-4 h-4 text-slate-500" />
                      <span>Website</span>
                    </div>
                    <p className="text-slate-500 text-[11px] font-medium pl-6">
                      www.sman1jkt.sch.id
                    </p>
                  </div>
                </div>

                <button className="w-full py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs flex items-center justify-center gap-2 transition cursor-pointer">
                  <Edit className="w-4 h-4 text-slate-500" />
                  <span>Edit Profil</span>
                </button>
              </div>
            </div>

            {/* Tips Admin Card */}
            <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-extrabold text-xs text-amber-900">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <span>Tips Admin</span>
              </div>
              <p className="text-xs text-amber-800/90 font-medium leading-relaxed">
                Pastikan NIP guru terisi dengan benar untuk sinkronisasi dengan Dapodik pusat.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
