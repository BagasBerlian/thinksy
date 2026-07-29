import { logoutAction } from "../../(auth)/actions";
import { LogOut, ShieldCheck, Building, UserCog, DollarSign } from "lucide-react";

export default function SuperAdminDashboard() {
  return (
    <div className="flex min-h-screen bg-slate-900 text-white">
      <aside className="w-64 border-r border-slate-800 p-6 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="font-bold text-[#E9C77B] text-lg flex items-center gap-2">
            <ShieldCheck className="w-6 h-6" />
            Super Admin
          </div>
          <nav className="space-y-1.5 text-sm font-medium text-slate-300">
            <a href="/super" className="flex items-center gap-2.5 rounded-xl bg-slate-800 p-2.5 text-white font-semibold">
              <DollarSign className="w-4 h-4 text-[#E9C77B]" />
              Global Metrics & Cost
            </a>
            <a href="/super/sekolah" className="flex items-center gap-2.5 rounded-xl p-2.5 hover:bg-slate-800 transition">
              <Building className="w-4 h-4" />
              Tenant / Sekolah
            </a>
            <a href="/super/admin-sekolah" className="flex items-center gap-2.5 rounded-xl p-2.5 hover:bg-slate-800 transition">
              <UserCog className="w-4 h-4" />
              Admin Sekolah
            </a>
          </nav>
        </div>

        <form action={logoutAction} className="pt-6 border-t border-slate-800">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-red-400 hover:text-red-300 bg-red-950/50 hover:bg-red-950 py-2.5 px-4 rounded-xl transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Keluar Akun
          </button>
        </form>
      </aside>

      <main className="flex-1 p-8 space-y-6">
        <h1 className="text-2xl font-bold text-white">Global System & AI Usage Metrics</h1>
        <div className="rounded-2xl border border-slate-800 bg-slate-800/50 p-6 shadow-sm">
          Pantau total penggunaan token AI Claude, estimasi biaya lintas sekolah, dan manajemen tenant.
        </div>
      </main>
    </div>
  );
}
