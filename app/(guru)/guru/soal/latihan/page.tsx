"use client";

import { useState } from "react";
import GuruLayout from "@/components/guru/GuruLayout";
import EditorSoalModal from "@/components/guru/EditorSoalModal";
import MarkdownRenderer from "@/components/materi/MarkdownRenderer";
import {
  Plus,
  Search,
  FileText,
  Filter,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash,
  HelpCircle,
  X,
  CheckCircle2,
} from "lucide-react";

interface QuestionItem {
  id: string;
  pertanyaan: string;
  bab: string;
  tipe: string;
  kesulitan: string;
  kesulitanColor: string;
}

export default function BankSoalManualPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBab, setFilterBab] = useState("Semua Bab");
  const [filterTipe, setFilterTipe] = useState("Semua Tipe");
  const [filterKesulitan, setFilterKesulitan] = useState("Semua Level");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const [questions, setQuestions] = useState<QuestionItem[]>([
    {
      id: "#Q-8021",
      pertanyaan: "Diketahui persamaan kuadrat $x^2 - 5x + 6 = 0$. Akar-akar persamaan tersebut adalah...",
      bab: "ALJEBAR",
      tipe: "Pilihan Ganda",
      kesulitan: "Mudah",
      kesulitanColor: "bg-emerald-500",
    },
    {
      id: "#Q-8022",
      pertanyaan: "Buktikan dengan induksi matematika bahwa $1 + 2 + 3 + ... + n = \\frac{n(n+1)}{2}$",
      bab: "KALKULUS",
      tipe: "Esai",
      kesulitan: "Sulit",
      kesulitanColor: "bg-red-500",
    },
    {
      id: "#Q-8023",
      pertanyaan: "Tentukan nilai $x$ yang memenuhi persamaan $\\log_2(x) + \\log_2(x-3) = 2$",
      bab: "ALJEBAR",
      tipe: "Isian",
      kesulitan: "Sedang",
      kesulitanColor: "bg-amber-500",
    },
  ]);

  const handleSaveQuestion = (newQ: any) => {
    if (editingQuestion) {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === editingQuestion.id
            ? {
                ...q,
                pertanyaan: newQ.pertanyaan,
                bab: newQ.bab?.includes("Persamaan") ? "ALJEBAR" : "GEOMETRI",
                tipe: newQ.tipeSoal === "pilihan_ganda" ? "Pilihan Ganda" : newQ.tipeSoal === "esai" ? "Esai" : "Isian",
                kesulitan: newQ.kesulitan === "mudah" ? "Mudah" : newQ.kesulitan === "sulit" ? "Sulit" : "Sedang",
                kesulitanColor: newQ.kesulitan === "mudah" ? "bg-emerald-500" : newQ.kesulitan === "sulit" ? "bg-red-500" : "bg-amber-500",
              }
            : q
        )
      );
      setNotification(`Soal ${editingQuestion.id} berhasil diperbarui!`);
      setEditingQuestion(null);
    } else {
      const newItem: QuestionItem = {
        id: newQ.id || `#Q-${Math.floor(1000 + Math.random() * 9000)}`,
        pertanyaan: newQ.pertanyaan,
        bab: newQ.bab?.includes("Persamaan") ? "ALJEBAR" : "GEOMETRI",
        tipe: newQ.tipeSoal === "pilihan_ganda" ? "Pilihan Ganda" : newQ.tipeSoal === "esai" ? "Esai" : "Isian",
        kesulitan: newQ.kesulitan === "mudah" ? "Mudah" : newQ.kesulitan === "sulit" ? "Sulit" : "Sedang",
        kesulitanColor: newQ.kesulitan === "mudah" ? "bg-emerald-500" : newQ.kesulitan === "sulit" ? "bg-red-500" : "bg-amber-500",
      };
      setQuestions((prev) => [newItem, ...prev]);
      setNotification(`Soal baru ${newItem.id} berhasil ditambahkan!`);
    }
    setTimeout(() => setNotification(null), 4000);
  };

  const handleDeleteQuestion = (id: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus soal ${id}?`)) return;
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    setNotification(`Soal ${id} berhasil dihapus.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleEditClick = (q: QuestionItem) => {
    setEditingQuestion(q);
    setIsModalOpen(true);
  };

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.pertanyaan.toLowerCase().includes(searchQuery.toLowerCase()) || q.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBab = filterBab === "Semua Bab" || q.bab.toLowerCase() === filterBab.toLowerCase();
    const matchesTipe = filterTipe === "Semua Tipe" || q.tipe.toLowerCase() === filterTipe.toLowerCase();
    const matchesKesulitan = filterKesulitan === "Semua Level" || q.kesulitan.toLowerCase() === filterKesulitan.toLowerCase();
    return matchesSearch && matchesBab && matchesTipe && matchesKesulitan;
  });

  return (
    <GuruLayout>
      <div className="space-y-6">
        {/* Notification Toast */}
        {notification && (
          <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-[#0F172A] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-amber-500/40 animate-in fade-in slide-in-from-top duration-200">
            <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="text-xs font-bold">{notification}</span>
            <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white ml-2">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 1. PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
              <FileText className="w-6 h-6 text-amber-500" />
              <span>Bank Soal Latihan (Manual)</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Kelola repositori pertanyaan manual untuk quiz dan ujian. Format matematika didukung secara native.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingQuestion(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white font-extrabold text-xs shadow-xs transition flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Tambah Soal Baru</span>
          </button>
        </div>

        {/* 2. FILTERS CONTAINER */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                CARI PERTANYAAN
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Masukkan kata kunci soal atau ID..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
                />
              </div>
            </div>

            {/* Select Bab */}
            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                BAB / MATERI
              </label>
              <select
                value={filterBab}
                onChange={(e) => setFilterBab(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="Semua Bab">Semua Bab</option>
                <option value="Aljabar">Aljabar</option>
                <option value="Kalkulus">Kalkulus</option>
                <option value="Geometri">Geometri</option>
              </select>
            </div>

            {/* Select Tipe */}
            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                TIPE
              </label>
              <select
                value={filterTipe}
                onChange={(e) => setFilterTipe(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="Semua Tipe">Semua Tipe</option>
                <option value="Pilihan Ganda">Pilihan Ganda</option>
                <option value="Isian">Isian</option>
                <option value="Esai">Esai</option>
              </select>
            </div>

            {/* Select Kesulitan */}
            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                KESULITAN
              </label>
              <select
                value={filterKesulitan}
                onChange={(e) => setFilterKesulitan(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="Semua Level">Semua Level</option>
                <option value="Mudah">Mudah</option>
                <option value="Sedang">Sedang</option>
                <option value="Sulit">Sulit</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. QUESTIONS TABLE (CLICKABLE EDIT & TRASH BUTTONS) */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">ID SOAL</th>
                  <th className="px-6 py-4">PERTANYAAN (PREVIEW)</th>
                  <th className="px-6 py-4">BAB</th>
                  <th className="px-6 py-4">TIPE</th>
                  <th className="px-6 py-4">KESULITAN</th>
                  <th className="px-6 py-4 text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredQuestions.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-mono text-slate-400 font-semibold">
                      {q.id}
                    </td>
                    <td className="px-6 py-4 max-w-md">
                      <div className="line-clamp-2 text-slate-900 font-semibold">
                        <MarkdownRenderer content={q.pertanyaan} />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-extrabold uppercase">
                        {q.bab}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-700">
                        {q.tipe}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <span className={`w-2 h-2 rounded-full ${q.kesulitanColor}`} />
                        <span>{q.kesulitan}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* EDIT BUTTON (SEKARANG BISA DIKLIK) */}
                        <button
                          onClick={() => handleEditClick(q)}
                          title="Edit Soal Ini"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {/* TRASH BUTTON (SEKARANG BISA DIKLIK) */}
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          title="Hapus Soal Ini"
                          className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer Pagination */}
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Menampilkan 1–{filteredQuestions.length} dari {questions.length} soal</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {[1, 2, 3].map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`px-3 py-1 rounded-lg text-xs font-extrabold cursor-pointer ${
                    currentPage === p ? "bg-[#0F172A] text-white" : "hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(3, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Soal Drawer */}
      <EditorSoalModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingQuestion(null);
        }}
        onSave={handleSaveQuestion}
      />
    </GuruLayout>
  );
}
