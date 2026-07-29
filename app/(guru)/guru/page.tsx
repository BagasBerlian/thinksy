import { logoutAction } from "../../(auth)/actions";
import { LogOut, LayoutDashboard, FileText, Bot, CheckSquare } from "lucide-react";

export default function GuruDashboard() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 border-r border-slate-200 bg-white p-6 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="font-bold text-[#193446] text-lg flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#193446] text-[#E9C77B] flex items-center justify-center font-extrabold text-sm">
              G
            </div>
            Panel Guru
          </div>
          <nav className="space-y-1.5 text-sm text-slate-700 font-medium">
            <a href="/guru" className="flex items-center gap-2.5 rounded-xl bg-[#193446]/10 p-2.5 text-[#193446] font-semibold">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </a>
            <a href="/guru/soal/latihan" className="flex items-center gap-2.5 rounded-xl p-2.5 hover:bg-slate-100 transition">
              <FileText className="w-4 h-4" />
              Bank Soal Manual
            </a>
            <a href="/guru/soal/eksplorasi" className="flex items-center gap-2.5 rounded-xl p-2.5 hover:bg-slate-100 transition">
              <Bot className="w-4 h-4" />
              Kurasi Soal AI
            </a>
            <a href="/guru/penilaian" className="flex items-center gap-2.5 rounded-xl p-2.5 hover:bg-slate-100 transition">
              <CheckSquare className="w-4 h-4" />
              Penilaian Esai
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
        <h1 className="text-2xl font-bold text-[#193446]">Dashboard Guru</h1>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          Pantau progress siswa, buat soal latihan manual, dan lakukan kurasi soal AI.
        </div>
      </main>
    </div>
  );
}
