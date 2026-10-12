"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Send,
  Calendar,
  Clock,
  Bookmark,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 animate-in fade-in duration-100 font-mono text-zinc-900">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white border border-zinc-950 shadow-none overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-zinc-950 text-white flex items-center justify-center font-bold">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 bg-zinc-200 text-zinc-800 border border-zinc-300">
                  Siaran & Penjadwalan
                </span>
                <span className="text-[10px] text-zinc-500">
                  Manual & Otomatis
                </span>
              </div>
              <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-tight mt-0.5">
                Pengaturan Notifikasi Siswa
              </h2>
              <p className="text-[11px] text-zinc-500">
                Siarkan pengumuman dadakan atau jadwalkan pengingat tugas & presensi.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-900 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 pt-2 border-b border-zinc-200 bg-zinc-100 shrink-0 overflow-x-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("instant")}
            className={`py-1.5 px-3 border transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "instant"
                ? "bg-zinc-950 text-white border-zinc-950"
                : "bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-200"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Kirim Manual (Dadakan)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("schedule")}
            className={`py-1.5 px-3 border transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "schedule"
                ? "bg-zinc-950 text-white border-zinc-950"
                : "bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-200"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Penjadwalan Siaran ({scheduledList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`py-1.5 px-3 border transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "history"
                ? "bg-zinc-950 text-white border-zinc-950"
                : "bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-200"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Riwayat Siaran ({historyList.length})</span>
          </button>
        </div>

        {/* Status Message Alert */}
        {statusMessage && (
          <div
            className={`mx-4 mt-3 p-2.5 text-xs font-bold flex items-center justify-between border ${
              statusMessage.isError
                ? "bg-red-50 border-red-300 text-red-800"
                : "bg-zinc-100 border-zinc-950 text-zinc-950"
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.isError ? (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-zinc-900 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-zinc-400 hover:text-zinc-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2 text-zinc-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-xs font-bold">Memuat data notifikasi...</span>
            </div>
          ) : activeTab === "instant" || activeTab === "schedule" ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left Column: Form Builder (7 cols) */}
              <form
                onSubmit={activeTab === "instant" ? handleSendInstant : handleScheduleNotif}
                className="lg:col-span-7 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-zinc-600 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-zinc-700" />
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
                      className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
                    >
                      Reset Form
                    </button>
                  )}
                </div>

                {/* Target Audiens */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-900 flex items-center justify-between">
                    <span>1. Target Penerima Siswa</span>
                    <span className="text-[10px] text-zinc-400">Wajib Dipilih</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "all", label: "Semua Siswa" },
                      { id: "Kelas 8", label: "Kelas 8 (Rombel)" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTarget(t.id)}
                        className={`py-1.5 px-2 text-xs font-bold transition cursor-pointer border text-center ${
                          target === t.id
                            ? "bg-zinc-950 text-white border-zinc-950"
                            : "bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-300"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tipe / Urgensi Notifikasi */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-900">
                    2. Kategori / Tipe Notifikasi
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: "info", label: "Informasi", badge: "bg-zinc-100 text-zinc-800 border-zinc-300" },
                      { id: "warning", label: "Peringatan", badge: "bg-amber-100 text-amber-900 border-amber-300" },
                      { id: "urgent", label: "Mendesak", badge: "bg-red-100 text-red-900 border-red-300" },
                      { id: "success", label: "Apresiasi", badge: "bg-emerald-100 text-emerald-900 border-emerald-300" },
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setType(c.id as any)}
                        className={`py-1.5 px-1.5 text-xs font-bold transition cursor-pointer border text-center ${
                          type === c.id
                            ? "border-zinc-950 font-bold " + c.badge
                            : "bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-100"
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Judul Notifikasi */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-900">
                    3. Judul Notifikasi
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Pengingat Absensi Pagi Kelas 8"
                    required
                    className="w-full px-3 py-1.5 bg-white border border-zinc-300 text-xs font-bold text-zinc-900 focus:outline-none focus:border-zinc-950 transition"
                  />
                </div>

                {/* Isi Pesan */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-900">
                    4. Isi Pesan Siaran
                  </label>
                  <textarea
                    rows={3}
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Tuliskan pesan lengkap atau instruksi untuk siswa..."
                    required
                    className="w-full px-3 py-1.5 bg-white border border-zinc-300 text-xs font-bold text-zinc-900 focus:outline-none focus:border-zinc-950 transition"
                  />
                </div>

                {/* If scheduled tab: Pick date & time */}
                {activeTab === "schedule" && (
                  <div className="p-3 bg-zinc-50 border border-zinc-300 space-y-1.5">
                    <label className="text-xs font-bold text-zinc-900 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-zinc-700" />
                        <span>Waktu Jadwal Siaran (WIB)</span>
                      </span>
                      <span className="text-[10px] text-zinc-800 bg-zinc-200 px-1.5 py-0.2 border border-zinc-300 font-bold">
                        Server Timer
                      </span>
                    </label>
                    <p className="text-[10px] text-zinc-500">
                      Notifikasi tersimpan di sistem antrean dan otomatis dikirim ke siswa saat waktu tiba.
                    </p>
                    <input
                      type="datetime-local"
                      value={scheduledDateTime}
                      onChange={(e) => setScheduledDateTime(e.target.value)}
                      required
                      className="w-full px-2.5 py-1.5 bg-white border border-zinc-300 text-xs font-bold text-zinc-900 focus:outline-none focus:border-zinc-950 font-mono"
                    />
                  </div>
                )}

                {/* Target Halaman / Aksi Link */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-900">
                    5. Tautan / Halaman yang Dibuka Siswa saat Notifikasi Diklik
                  </label>
                  <select
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-zinc-300 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
                  >
                    <option value="/dashboard">Dashboard Siswa (Tab Utama Presensi)</option>
                    <option value="/ujian">Ruang Asesmen Resmi (AKU LULUS)</option>
                    <option value="/belajar">Materi Pelajaran & Bab</option>
                  </select>
                </div>

                {/* Submit Action */}
                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : activeTab === "instant" ? (
                      <Send className="w-3.5 h-3.5" />
                    ) : (
                      <Calendar className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {isSubmitting
                        ? "Memproses Penyiaran..."
                        : activeTab === "instant"
                        ? `Siarkan Notifikasi Sekarang (${target})`
                        : `Simpan & Jadwalkan Notifikasi (${target})`}
                    </span>
                  </button>
                </div>
              </form>

              {/* Right Column: Pre-made Notification Templates (5 cols) */}
              <div className="lg:col-span-5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-zinc-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5 text-zinc-700" />
                    <span>Template Notifikasi Guru</span>
                  </h3>
                  <span className="text-[10px] font-bold text-zinc-500">
                    {templates.length} Siap Pakai
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Pilih template untuk mengisi formulir secara instan:
                </p>

                <div className="space-y-2 max-h-[460px] overflow-y-auto pr-0.5">
                  {templates.map((tpl) => (
                    <div
                      key={tpl.id}
                      onClick={() => handleSelectTemplate(tpl)}
                      className={`p-2.5 border transition cursor-pointer text-left ${
                        selectedTemplateId === tpl.id
                          ? "bg-zinc-100 border-zinc-950"
                          : "bg-white hover:bg-zinc-50 border-zinc-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 bg-zinc-100 text-zinc-700 border border-zinc-300">
                            {tpl.category}
                          </span>
                          <h4 className="text-xs font-bold text-zinc-950">
                            {tpl.title}
                          </h4>
                        </div>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 border shrink-0 ${
                            tpl.type === "urgent"
                              ? "bg-red-50 text-red-800 border-red-200"
                              : tpl.type === "warning"
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : tpl.type === "success"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-zinc-100 text-zinc-800 border-zinc-300"
                          }`}
                        >
                          {tpl.type.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-600 line-clamp-2 mt-1 leading-normal">
                        {tpl.desc}
                      </p>
                      <div className="mt-1.5 pt-1.5 border-t border-zinc-200 flex items-center justify-between text-[10px] font-bold text-zinc-500">
                        <span>Terapkan Template</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Tab 3: History */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-zinc-950 uppercase">
                    Riwayat Siaran Notifikasi Guru
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Daftar pengumuman dan siaran yang pernah dikirimkan ke siswa.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchData}
                  className="px-2.5 py-1 border border-zinc-300 bg-white hover:bg-zinc-100 text-xs font-bold text-zinc-700 transition cursor-pointer"
                >
                  Segarkan Data
                </button>
              </div>

              {historyList.length === 0 ? (
                <div className="py-12 text-center bg-zinc-50 border border-zinc-200 text-zinc-400 text-xs font-bold">
                  Belum ada riwayat siaran notifikasi.
                </div>
              ) : (
                <div className="space-y-2">
                  {historyList.map((h, idx) => (
                    <div
                      key={h.id || idx}
                      className="p-3 bg-white border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold px-1.5 py-0.2 bg-zinc-100 text-zinc-800 border border-zinc-300">
                            Target: {h.target || "Semua Siswa"}
                          </span>
                          <span className="text-[10px] text-zinc-500">
                            {new Date(h.createdAt || Date.now()).toLocaleString("id-ID")} WIB
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-zinc-950">{h.title}</h4>
                        <p className="text-xs text-zinc-600">{h.desc}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-900 bg-zinc-100 border border-zinc-300 px-2 py-0.5">
                          <Check className="w-3 h-3" />
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
            <div className="pt-3 border-t border-zinc-200 space-y-2">
              <h4 className="text-xs font-bold text-zinc-600 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-700" />
                <span>Antrean Notifikasi Terjadwal ({scheduledList.length})</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {scheduledList.map((sch) => (
                  <div
                    key={sch.id}
                    className="p-3 bg-zinc-50 border border-zinc-200 space-y-1.5 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-1.5 py-0.2 bg-zinc-200 text-zinc-800 border border-zinc-300">
                        {sch.target}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteScheduled(sch.id)}
                        className="text-zinc-400 hover:text-red-600 p-0.5 transition cursor-pointer"
                        title="Batalkan Jadwal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-zinc-950">{sch.title}</h5>
                      <p className="text-[11px] text-zinc-600 line-clamp-2 mt-0.5">{sch.desc}</p>
                    </div>
                    <div className="pt-1 border-t border-zinc-200 flex items-center justify-between text-[10px] text-zinc-600">
                      <span>Jadwal Tayang:</span>
                      <span className="font-mono font-bold">
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
