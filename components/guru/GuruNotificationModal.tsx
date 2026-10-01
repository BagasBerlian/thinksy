"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Send,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Layers,
  History,
  Trash2,
  ArrowRight,
  Target,
  FileText,
  Users,
  Info,
  Check,
} from "lucide-react";

interface GuruNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function GuruNotificationModal({
  isOpen,
  onClose,
  onSuccess,
}: GuruNotificationModalProps) {
  const [activeTab, setActiveTab] = useState<"instant" | "schedule" | "history">("instant");

  // Form states
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [type, setType] = useState<"info" | "warning" | "success" | "urgent">("info");
  const [target, setTarget] = useState<string>("all");
  const [linkUrl, setLinkUrl] = useState("/dashboard");
  const [scheduledDateTime, setScheduledDateTime] = useState("");

  // Server data
  const [templates, setTemplates] = useState<any[]>([]);
  const [scheduledList, setScheduledList] = useState<any[]>([]);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  // Selected template indicator
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Set default schedule time to tomorrow 07:00
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(7, 0, 0, 0);
    const tzOffset = tomorrow.getTimezoneOffset() * 60000;
    const localISOTime = new Date(tomorrow.getTime() - tzOffset).toISOString().slice(0, 16);
    setScheduledDateTime(localISOTime);

    fetchData();
  }, [isOpen]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/guru/notifikasi");
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
        setScheduledList(data.scheduled || []);
        setHistoryList(data.history || []);
      }
    } catch {
      // silent fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTemplate = (tpl: any) => {
    setSelectedTemplateId(tpl.id);
    setTitle(tpl.title);
    setDesc(tpl.desc);
    setType(tpl.type);
    setTarget(tpl.target || "all");
    setLinkUrl(tpl.link_url || "/dashboard");
    setStatusMessage({ text: `Template "${tpl.title}" diterapkan!` });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleSendInstant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim()) {
      setStatusMessage({ text: "Judul dan pesan wajib diisi.", isError: true });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/guru/notifikasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "broadcast_instant",
          title,
          desc,
          type,
          target,
          link_url: linkUrl,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({ text: data.message });
        setTitle("");
        setDesc("");
        setSelectedTemplateId(null);
        fetchData();
        if (onSuccess) onSuccess();
        setTimeout(() => {
          setStatusMessage(null);
        }, 4000);
      } else {
        setStatusMessage({ text: data.error || "Gagal menyiarkan notifikasi.", isError: true });
      }
    } catch {
      setStatusMessage({ text: "Terjadi gangguan jaringan.", isError: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScheduleNotif = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim() || !scheduledDateTime) {
      setStatusMessage({ text: "Harap lengkapi judul, pesan, dan waktu jadwal.", isError: true });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/guru/notifikasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "schedule_notif",
          title,
          desc,
          type,
          target,
          scheduledTime: new Date(scheduledDateTime).toISOString(),
          link_url: linkUrl,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({ text: data.message });
        setTitle("");
        setDesc("");
        setSelectedTemplateId(null);
        fetchData();
        if (onSuccess) onSuccess();
        setTimeout(() => {
          setStatusMessage(null);
        }, 4000);
      } else {
        setStatusMessage({ text: data.error || "Gagal menjadwalkan notifikasi.", isError: true });
      }
    } catch {
      setStatusMessage({ text: "Terjadi gangguan jaringan.", isError: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteScheduled = async (id: string) => {
    if (!confirm("Batalkan jadwal penyiaran notifikasi ini?")) return;
    try {
      const res = await fetch("/api/guru/notifikasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_scheduled",
          id,
        }),
      });
      if (res.ok) {
        setScheduledList((prev) => prev.filter((s) => s.id !== id));
        setStatusMessage({ text: "Jadwal notifikasi berhasil dibatalkan." });
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch {
      alert("Gagal membatalkan jadwal.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#0F172A] text-amber-400 flex items-center justify-center font-black shadow-md">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                  SIARAN & PENJADWALAN
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  Manual & Otomatis Siswa
                </span>
              </div>
              <h2 className="text-lg font-black text-[#0F172A] mt-0.5">
                Pengaturan Notifikasi Siswa
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Siarkan pengumuman dadakan atau jadwalkan pengingat tugas & presensi dengan template terstandar.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-100 bg-white shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("instant")}
            className={`pb-3 px-3 text-xs font-black border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === "instant"
                ? "border-[#0F172A] text-[#0F172A]"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Send className="w-3.5 h-3.5 text-blue-600" />
            <span>Kirim Manual (Dadakan)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("schedule")}
            className={`pb-3 px-3 text-xs font-black border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === "schedule"
                ? "border-[#0F172A] text-[#0F172A]"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-amber-600" />
            <span>Penjadwalan Siaran ({scheduledList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`pb-3 px-3 text-xs font-black border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === "history"
                ? "border-[#0F172A] text-[#0F172A]"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <History className="w-3.5 h-3.5 text-emerald-600" />
            <span>Riwayat Siaran ({historyList.length})</span>
          </button>
        </div>

        {/* Status Message Alert */}
        {statusMessage && (
          <div
            className={`mx-6 mt-4 p-3.5 rounded-2xl text-xs font-extrabold flex items-center justify-between shadow-xs ${
              statusMessage.isError
                ? "bg-rose-50 border border-rose-200 text-rose-800"
                : "bg-emerald-50 border border-emerald-200 text-emerald-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.isError ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-slate-400 hover:text-slate-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
              <span className="text-xs font-bold">Memuat data notifikasi...</span>
            </div>
          ) : activeTab === "instant" || activeTab === "schedule" ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Form Builder (7 cols) */}
              <form
                onSubmit={activeTab === "instant" ? handleSendInstant : handleScheduleNotif}
                className="lg:col-span-7 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Konfigurasi Pesan Siaran</span>
                  </h3>
                  {selectedTemplateId && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTemplateId(null);
                        setTitle("");
                        setDesc("");
                      }}
                      className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      Reset Form
                    </button>
                  )}
                </div>

                {/* Target Audiens */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-800 flex items-center justify-between">
                    <span>1. Target Penerima Siswa</span>
                    <span className="text-[10px] text-slate-400">Wajib Dipilih</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: "all", label: "Semua Siswa" },
                      { id: "Kelas 8A", label: "Kelas 8A" },
                      { id: "Kelas 8B", label: "Kelas 8B" },
                      { id: "Kelas 8C", label: "Kelas 8C" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTarget(t.id)}
                        className={`py-2 px-2 rounded-xl text-xs font-extrabold transition cursor-pointer border text-center ${
                          target === t.id
                            ? "bg-[#0F172A] text-white border-[#0F172A] shadow-xs"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tipe / Urgensi Notifikasi */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-800">
                    2. Kategori / Tipe Notifikasi
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: "info", label: "Informasi", badge: "bg-blue-50 text-blue-800 border-blue-200" },
                      { id: "warning", label: "Peringatan", badge: "bg-amber-50 text-amber-800 border-amber-200" },
                      { id: "urgent", label: "Mendesak", badge: "bg-rose-50 text-rose-800 border-rose-200" },
                      { id: "success", label: "Apresiasi", badge: "bg-emerald-50 text-emerald-800 border-emerald-200" },
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setType(c.id as any)}
                        className={`py-2 px-2 rounded-xl text-xs font-extrabold transition cursor-pointer border text-center ${
                          type === c.id
                            ? "ring-2 ring-[#0F172A] font-black " + c.badge
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Judul Notifikasi */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-800">
                    3. Judul Notifikasi
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: ⏰ Pengingat Absensi Pagi Kelas 8"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>

                {/* Isi Pesan */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-800">
                    4. Isi Pesan Siaran
                  </label>
                  <textarea
                    rows={3}
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Tuliskan pesan lengkap atau instruksi guru untuk siswa..."
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>

                {/* If scheduled tab: Pick date & time */}
                {activeTab === "schedule" && (
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                    <label className="text-xs font-black text-amber-900 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-600" />
                        <span>Waktu Jadwal Siaran (WIB)</span>
                      </span>
                      <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-bold">
                        Server Timer Otomatis
                      </span>
                    </label>
                    <p className="text-[11px] text-amber-800 font-medium">
                      Notifikasi akan tersimpan di sistem antrean dan otomatis terdistribusi ke akun siswa saat jam tiba.
                    </p>
                    <input
                      type="datetime-local"
                      value={scheduledDateTime}
                      onChange={(e) => setScheduledDateTime(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                    />
                  </div>
                )}

                {/* Target Halaman / Aksi Link */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-800">
                    5. Tautan / Halaman yang Dibuka Siswa saat Notifikasi Diklik
                  </label>
                  <select
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="/dashboard">Dashboard Siswa (Tab Utama Presensi)</option>
                    <option value="/ujian">Ruang Asesmen Resmi (AKU LULUS)</option>
                    <option value="/belajar">Materi Pelajaran & Bab</option>
                  </select>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-2xl bg-[#0F172A] hover:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    ) : activeTab === "instant" ? (
                      <Send className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Calendar className="w-4 h-4 text-amber-400" />
                    )}
                    <span>
                      {isSubmitting
                        ? "Memproses Penyiaran..."
                        : activeTab === "instant"
                        ? `Siarkan Notifikasi Dadakan Sekarang (${target})`
                        : `Simpan & Jadwalkan Notifikasi (${target})`}
                    </span>
                  </button>
                </div>
              </form>

              {/* Right Column: Pre-made Notification Templates (5 cols) */}
              <div className="lg:col-span-5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Template Notifikasi Guru</span>
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400">
                    {templates.length} Template Siap Pakai
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Pilih salah satu template di bawah untuk mengisi formulir secara instan:
                </p>

                <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                  {templates.map((tpl) => (
                    <div
                      key={tpl.id}
                      onClick={() => handleSelectTemplate(tpl)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer group text-left ${
                        selectedTemplateId === tpl.id
                          ? "bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/50 shadow-xs"
                          : "bg-white hover:bg-slate-50/80 border-slate-200 hover:border-slate-300 shadow-2xs"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                            {tpl.category}
                          </span>
                          <h4 className="text-xs font-black text-[#0F172A] group-hover:text-amber-950 transition">
                            {tpl.title}
                          </h4>
                        </div>
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                            tpl.type === "urgent"
                              ? "bg-rose-100 text-rose-800"
                              : tpl.type === "warning"
                              ? "bg-amber-100 text-amber-800"
                              : tpl.type === "success"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {tpl.type.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1.5 font-medium leading-relaxed">
                        {tpl.desc}
                      </p>
                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400 group-hover:text-[#0F172A]">
                        <span>Terapkan Template</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Tab 3: History */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-[#0F172A]">
                    Riwayat Siaran Notifikasi Guru
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Daftar pengumuman dan siaran yang pernah dikirimkan ke seluruh siswa.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchData}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition cursor-pointer"
                >
                  Segarkan Data
                </button>
              </div>

              {historyList.length === 0 ? (
                <div className="py-16 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-slate-400 text-xs font-bold">
                  Belum ada riwayat siaran notifikasi.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {historyList.map((h, idx) => (
                    <div
                      key={h.id || idx}
                      className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            Target: {h.target || "Semua Siswa"}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">
                            {new Date(h.createdAt || Date.now()).toLocaleString("id-ID")} WIB
                          </span>
                        </div>
                        <h4 className="text-xs font-black text-[#0F172A]">{h.title}</h4>
                        <p className="text-xs text-slate-500 font-medium">{h.desc}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Terkirim ({h.recipientCount || "Semua"} Siswa)</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Active scheduled notifications preview list inside schedule tab */}
          {activeTab === "schedule" && scheduledList.length > 0 && (
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h4 className="text-xs font-black text-slate-600 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Antrean Notifikasi Terjadwal ({scheduledList.length})</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {scheduledList.map((sch) => (
                  <div
                    key={sch.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                        {sch.target}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteScheduled(sch.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-white transition cursor-pointer"
                        title="Batalkan Jadwal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div>
                      <h5 className="text-xs font-extrabold text-[#0F172A]">{sch.title}</h5>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{sch.desc}</p>
                    </div>
                    <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-bold text-amber-800">
                      <span>Jadwal Tayang:</span>
                      <span className="font-mono">
                        {new Date(sch.scheduledTime).toLocaleString("id-ID")} WIB
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
