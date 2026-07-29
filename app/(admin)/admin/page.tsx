import { logoutAction } from "../../(auth)/actions";
import { LogOut, Building2, Users, UserPlus, BookOpen } from "lucide-react";

export default function AdminSekolahDashboard() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 border-r border-slate-200 bg-white p-6 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="font-bold text-[#193446] text-lg flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#E9C77B]" />
            Admin Sekolah
          </div>
          <nav className="space-y-1.5 text-sm text-slate-700 font-medium">
            <a href="/admin" className="flex items-center gap-2.5 rounded-xl bg-[#193446]/10 p-2.5 text-[#193446] font-semibold">
              Dashboard
            </a>
            <a href="/admin/guru" className="flex items-center gap-2.5 rounded-xl p-2.5 hover:bg-slate-100 transition">
              <Users className="w-4 h-4" />
              Kelola Guru
            </a>
            <a href="/admin/siswa" className="flex items-center gap-2.5 rounded-xl p-2.5 hover:bg-slate-100 transition">
              <UserPlus className="w-4 h-4" />
              Kelola Siswa
            </a>
            <a href="/admin/kelas" className="flex items-center gap-2.5 rounded-xl p-2.5 hover:bg-slate-100 transition">
              <BookOpen className="w-4 h-4" />
              Kelola Kelas
            </a>
          </nav>
        </div>

        <form action={logoutAction} className="pt-6 border-t border-slate-100">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 py-2.5 px-4 rounded-xl transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Keluar Akun
          </button>
        </form>
      </aside>

      <main className="flex-1 p-8 space-y-6">
        <h1 className="text-2xl font-bold text-[#193446]">Dashboard Admin Sekolah</h1>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          Kelola pengguna guru, siswa, dan struktur kelas untuk sekolah Anda.
        </div>
      </main>
    </div>
  );
}
