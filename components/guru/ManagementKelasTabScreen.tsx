"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Award,
  User,
  Plus,
  Lock,
  Unlock,
  Calendar,
  Clock,
  Key,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sliders,
  Check,
  X,
  CreditCard,
  QrCode,
  Building2,
  Printer,
  ChevronRight,
  ChevronDown,
  Shield,
  Layers,
  Sparkles,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Search,
  Send,
  MoreVertical,
  ExternalLink,
  FolderKanban,
  Settings,
  Maximize2,
  Minimize2,
  Copy,
  Edit3,
  Trash2,
  Paperclip,
  MessageSquare,
  Menu,
  Users,
  GraduationCap,
  HelpCircle,
  Laptop,
  Flame,
  CheckSquare,
  UserPlus,
  LayoutDashboard,
} from "lucide-react";
import {
  StudentCardProfile,
  DEFAULT_PROFILE,
  DEFAULT_STUDENT_PHOTO,
  getStoredStudentProfile,
  saveStoredStudentProfile,
  isStoredProfileLocked,
  saveStoredProfileLocked,
} from "@/lib/student-settings";

// ════════════════════════════════════════════════════════════════════════════════
// DATA STRUKTUR MATA PELAJARAN (CLASSES) SESUAI INSTRUKSI PENGGUNA:
// Termasuk "Level SD - Technology" (sesuai contoh gambar) dan isi dari
// bab-bab Matematika, Bahasa Indonesia, serta Bahasa Inggris.
// ════════════════════════════════════════════════════════════════════════════════
export interface ClassroomSubject {
  id: string;
  name: string;
  section: string;
  room: string;
  subjectCode: string;
  themeColor: string;
  bgGradient: string;
  bannerIllustration: string;
  teacher: {
    name: string;
    avatarText: string;
    avatarColor: string;
    role: string;
  };
  babs: {
    id: string;
    nomor: number;
    judul: string;
    deskripsi: string;
    materiCount: number;
    kuisCount: number;
    tugasCount: number;
    isOpen: boolean;
    materials: {
      id: string;
      title: string;
      type: "material" | "assignment" | "quiz";
      postedDate: string;
      dueDate?: string;
      points?: number;
    }[];
  }[];
}

const CLASSROOM_SUBJECTS: ClassroomSubject[] = [
  {
    id: "tech-sd",
    name: "Level SD - Technology",
    section: "Fase A & B • Technology, AI & Coding",
    room: "Lab Komputer 1",
    subjectCode: "cblyvphc",
    themeColor: "#1967D2",
    bgGradient: "from-slate-800 via-slate-900 to-[#0F172A]",
    bannerIllustration: "tech",
    teacher: {
      name: "syaa px",
      avatarText: "S",
      avatarColor: "bg-purple-700",
      role: "Guru Utama Technology",
    },
    babs: [
      {
        id: "tech-bab-1",
        nomor: 1,
        judul: "Bab 1: Pengenalan Komputer & Perangkat Digital",
        deskripsi: "Mengenal perangkat keras, layar sentuh, dan sistem navigasi antarmuka digital.",
        materiCount: 3,
        kuisCount: 1,
        tugasCount: 1,
        isOpen: true,
        materials: [
          { id: "m-t1", title: "Modul Bacaan: Komponen Komputer & Fungsinya", type: "material", postedDate: "Hari ini, 08:30" },
          { id: "m-t2", title: "Tugas Pengamatan: Identifikasi Perangkat di Rumah", type: "assignment", postedDate: "Hari ini, 09:15", dueDate: "Besok, 23:59", points: 100 },
          { id: "m-t3", title: "Kuis Cepat: Bagian-Bagian Komputer & Gadget", type: "quiz", postedDate: "Hari ini, 10:00", points: 100 },
        ],
      },
      {
        id: "tech-bab-2",
        nomor: 2,
        judul: "Bab 2: Logika Komputasi & Coding Blok Scratch",
        deskripsi: "Belajar algoritma langkah demi langkah menggunakan visual programming Scratch.",
        materiCount: 4,
        kuisCount: 2,
        tugasCount: 1,
        isOpen: true,
        materials: [
          { id: "m-t4", title: "Video Tutorial: Membuat Sprite Kucing Bergerak", type: "material", postedDate: "Kemarin, 14:00" },
          { id: "m-t5", title: "Tugas Proyek: Game Animasi Sederhana", type: "assignment", postedDate: "Kemarin, 14:30", dueDate: "12 Okt, 17:00", points: 100 },
        ],
      },
      {
        id: "tech-bab-3",
        nomor: 3,
        judul: "Bab 3: Internet Sehat & Keamanan Digital Siswa",
        deskripsi: "Etika berinternet, menjaga kerahasiaan kata sandi, dan menghindari konten berbahaya.",
        materiCount: 2,
        kuisCount: 1,
        tugasCount: 1,
        isOpen: true,
        materials: [
          { id: "m-t6", title: "Panduan Interaktif: 5 Aturan Emas Internet Aman", type: "material", postedDate: "4 Okt" },
          { id: "m-t7", title: "Kuis: Membedakan Berita Fakta vs Palsu", type: "quiz", postedDate: "4 Okt", points: 100 },
        ],
      },
    ],
  },
  {
    id: "mat-8",
    name: "Matematika (Kelas 8)",
    section: "Fase D • Kurikulum Merdeka",
    room: "Ruang 8-A",
    subjectCode: "mtk8xpk",
    themeColor: "#1967D2",
    bgGradient: "from-blue-900 via-indigo-950 to-slate-900",
    bannerIllustration: "math",
    teacher: {
      name: "Ibu Siti Rahmawati, M.Pd.",
      avatarText: "S",
      avatarColor: "bg-blue-600",
      role: "Wali Kelas & Guru Matematika",
    },
    babs: [
      {
        id: "mat-bab-1",
        nomor: 1,
        judul: "Bab 1: Bilangan Berpangkat & Bentuk Akar",
        deskripsi: "Sifat-sifat eksponen, perkalian pembagian pangkat bulat, dan menyederhanakan bentuk akar.",
        materiCount: 4,
        kuisCount: 2,
        tugasCount: 2,
        isOpen: true,
        materials: [
          { id: "m-m1", title: "Rangkuman Konsep: Sifat Dasar Bilangan Berpangkat", type: "material", postedDate: "Kemarin" },
          { id: "m-m2", title: "Latihan Soal: Operasi Perkalian dan Pembagian Pangkat", type: "assignment", postedDate: "Kemarin", dueDate: "Besok, 12:00", points: 100 },
          { id: "m-m3", title: "Kuis Formatif Bab 1 Bilangan Berpangkat", type: "quiz", postedDate: "Kemarin", points: 100 },
        ],
      },
      {
        id: "mat-bab-2",
        nomor: 2,
        judul: "Bab 2: Teorema Pythagoras",
        deskripsi: "Pembuktian rumus Pythagoras pada segitiga siku-siku, tripel Pythagoras, dan aplikasinya.",
        materiCount: 3,
        kuisCount: 1,
        tugasCount: 1,
        isOpen: true,
        materials: [
          { id: "m-m4", title: "Modul Pembelajaran Teorema Pythagoras & Tripel", type: "material", postedDate: "6 Okt" },
          { id: "m-m5", title: "Latihan Soal Cerita Penerapan Pythagoras", type: "assignment", postedDate: "6 Okt", dueDate: "10 Okt", points: 100 },
        ],
      },
      {
        id: "mat-bab-3",
        nomor: 3,
        judul: "Bab 3: Persamaan & Pertidaksamaan Linear Satu Variabel",
        deskripsi: "Pemodelan matematika sistem linear satu variabel dan penyelesaian nilai x.",
        materiCount: 3,
        kuisCount: 1,
        tugasCount: 1,
        isOpen: true,
        materials: [
          { id: "m-m6", title: "Lembar Kerja Siswa: PLSV & Garis Bilangan", type: "assignment", postedDate: "2 Okt", points: 100 },
        ],
      },
      {
        id: "mat-bab-4",
        nomor: 4,
        judul: "Bab 4: Relasi dan Fungsi",
        deskripsi: "Memahami domain, kodomain, range, rumus fungsi f(x), dan grafik fungsi.",
        materiCount: 3,
        kuisCount: 1,
        tugasCount: 1,
        isOpen: true,
        materials: [
          { id: "m-m7", title: "Konsep Relasi & Diagram Panah", type: "material", postedDate: "28 Sep" },
        ],
      },
      {
        id: "mat-bab-5",
        nomor: 5,
        judul: "Bab 5: Persamaan Garis Lurus (Gradien)",
        deskripsi: "Kemiringan garis (gradien m), persamaan y = mx + c, dan garis sejajar/tegak lurus.",
        materiCount: 3,
        kuisCount: 1,
        tugasCount: 1,
        isOpen: true,
        materials: [
          { id: "m-m8", title: "Modul: Menentukan Gradien Garis Lurus Melalui Dua Titik", type: "material", postedDate: "20 Sep" },
          { id: "m-m9", title: "Latihan: Menggambar Grafik Persamaan Garis y = mx + c", type: "assignment", postedDate: "20 Sep", dueDate: "26 Sep", points: 100 },
          { id: "m-m10", title: "Kuis Formatif: Gradien Garis Sejajar & Tegak Lurus", type: "quiz", postedDate: "22 Sep", points: 100 },
        ],
      },
      {
        id: "mat-bab-6",
        nomor: 6,
        judul: "Bab 6: Statistika & Ukuran Pemusatan Data",
        deskripsi: "Mean, median, modus, jangkauan data tunggal serta penyajian diagram batang dan lingkaran.",
        materiCount: 3,
        kuisCount: 1,
        tugasCount: 1,
        isOpen: true,
        materials: [
          { id: "m-m11", title: "Rangkuman Konsep: Mean, Median, Modus Data Tunggal", type: "material", postedDate: "15 Sep" },
          { id: "m-m12", title: "Proyek Survei Mini: Pengolahan Data Nilai Harian", type: "assignment", postedDate: "15 Sep", dueDate: "22 Sep", points: 100 },
          { id: "m-m13", title: "Kuis Cepat: Ukuran Pemusatan & Penyebaran Data", type: "quiz", postedDate: "17 Sep", points: 100 },
        ],
      },
    ],
  },
  {
    id: "indo-8",
    name: "Bahasa Indonesia (Kelas 8)",
    section: "Fase D • Literasi & Teks Informasi",
    room: "Ruang 8-B",
    subjectCode: "ind8cls",
    themeColor: "#059669",
    bgGradient: "from-emerald-900 via-teal-950 to-slate-900",
    bannerIllustration: "literature",
    teacher: {
      name: "Dra. Nurul Hidayah",
      avatarText: "N",
      avatarColor: "bg-emerald-600",
      role: "Guru Bahasa Indonesia",
    },
    babs: [
      {
        id: "indo-bab-1",
        nomor: 1,
        judul: "Bab 1: Menulis Teks Laporan Hasil Observasi (LHO)",
        deskripsi: "Struktur teks LHO: definisi umum, deskripsi bagian, deskripsi manfaat, serta kebahasaan objektif.",
        materiCount: 3,
        kuisCount: 1,
        tugasCount: 1,
        isOpen: true,
        materials: [
          { id: "m-i1", title: "Contoh Teks LHO: Observasi Flora Taman Sekolah", type: "material", postedDate: "Hari ini, 07:45" },
          { id: "m-i2", title: "Tugas Proyek: Menulis Teks LHO Benda di Sekitarmu", type: "assignment", postedDate: "Hari ini, 08:00", dueDate: "14 Okt", points: 100 },
        ],
      },
      {
        id: "indo-bab-2",
        nomor: 2,
        judul: "Bab 2: Membuat Iklan, Slogan, dan Poster",
        deskripsi: "Memahami fungsi persuasif, unsur gambar kata gerak suara, serta kaidah bahasa imperatif.",
        materiCount: 4,
        kuisCount: 1,
        tugasCount: 1,
        isOpen: true,
        materials: [
          { id: "m-i3", title: "Koleksi Contoh Desain Poster Layanan Masyarakat", type: "material", postedDate: "5 Okt" },
          { id: "m-i4", title: "Kuis Cepat: Perbedaan Iklan, Slogan, dan Poster", type: "quiz", postedDate: "5 Okt", points: 100 },
        ],
      },
      {
        id: "indo-bab-3",
        nomor: 3,
        judul: "Bab 3: Menulis Artikel Ilmiah Populer",
        deskripsi: "Fakta vs opini, bukti pendukung, kalimat perbandingan, dan gaya penulisan santun.",
        materiCount: 3,
        kuisCount: 1,
        tugasCount: 1,
        isOpen: true,
        materials: [
          { id: "m-i5", title: "Modul: Membedakan Fakta Objektif vs Opini Subjektif", type: "material", postedDate: "1 Okt" },
          { id: "m-i6", title: "Tugas: Menulis Draf Artikel Ilmiah Populer Tema Lingkungan", type: "assignment", postedDate: "1 Okt", dueDate: "8 Okt", points: 100 },
          { id: "m-i7", title: "Kuis: Kosakata Serapan & Konjungsi Antarkalimat", type: "quiz", postedDate: "3 Okt", points: 100 },
        ],
      },
      {
        id: "indo-bab-4",
        nomor: 4,
        judul: "Bab 4: Mengulas Karya Fiksi & Cerita Inspiratif",
        deskripsi: "Unsur intrinsik novel/cerpen, tema, penokohan, alur, serta menulis resensi buku.",
        materiCount: 3,
        kuisCount: 1,
        tugasCount: 1,
        isOpen: true,
        materials: [
          { id: "m-i8", title: "Rangkuman: Unsur Intrinsik Cerpen & Sudut Pandang", type: "material", postedDate: "24 Sep" },
          { id: "m-i9", title: "Tugas: Membuat Resensi Buku Cerita Fiksi Pendek", type: "assignment", postedDate: "24 Sep", dueDate: "30 Sep", points: 100 },
          { id: "m-i10", title: "Kuis: Karakter Tokoh & Analisis Nilai Kehidupan", type: "quiz", postedDate: "26 Sep", points: 100 },
        ],
      },
      {
        id: "indo-bab-5",
        nomor: 5,
        judul: "Bab 5: Menciptakan Puisi & Apresiasi Sastra",
        deskripsi: "Diksi puitis, majas personifikasi dan metafora, rima, bait, serta pembacaan deklamasi.",
        materiCount: 3,
        kuisCount: 1,
        tugasCount: 1,
        isOpen: true,
        materials: [
          { id: "m-i11", title: "Modul Sastra: Majas Personifikasi, Metafora & Tipografi Puisi", type: "material", postedDate: "18 Sep" },
          { id: "m-i12", title: "Tugas Mandiri: Menciptakan 2 Bait Puisi Bertema Guru", type: "assignment", postedDate: "18 Sep", dueDate: "25 Sep", points: 100 },
          { id: "m-i13", title: "Kuis Formatif: Diksi & Gaya Bahasa Puisi", type: "quiz", postedDate: "20 Sep", points: 100 },
        ],
      },
      {
        id: "indo-bab-6",
        nomor: 6,
        judul: "Bab 6: Menulis Teks Pidato Persuasif",
        deskripsi: "Struktur pidato: salam, pembuka, argumen logis, ajakan, dan penutup berkesan.",
        materiCount: 3,
        kuisCount: 1,
        tugasCount: 1,
        isOpen: true,
        materials: [
          { id: "m-i14", title: "Panduan: Struktur Pidato & Etika Berbicara di Depan Publik", type: "material", postedDate: "10 Sep" },
          { id: "m-i15", title: "Tugas Proyek: Menyusun Naskah Pidato Stop Bullying", type: "assignment", postedDate: "10 Sep", dueDate: "18 Sep", points: 100 },
          { id: "m-i16", title: "Kuis: Kaidah Kalimat Persuasif & Imperatif Halus", type: "quiz", postedDate: "12 Sep", points: 100 },
        ],
      },
    ],
  },
  {
    id: "ingg-8",
    name: "Bahasa Inggris (Kelas 8)",
    section: "Fase D • English for Nusantara",
    room: "Lab Bahasa",
    subjectCode: "eng8abc",
    themeColor: "#D97706",
    bgGradient: "from-amber-900 via-stone-900 to-slate-900",
    bannerIllustration: "english",
    teacher: {
      name: "Ahmad Fauzi, S.Pd.",
      avatarText: "A",
      avatarColor: "bg-amber-600",
      role: "Guru Bahasa Inggris",
    },
    babs: [
      {
        id: "ingg-bab-1",
        nomor: 1,
        judul: "Bab 1: Celebrating Independence Day (Recount Text)",
        deskripsi: "Talking about past school festival, panjat pinang game, and using Simple Past Tense.",
        materiCount: 4,
        kuisCount: 2,
        tugasCount: 1,
        isOpen: true,
        materials: [
          { id: "m-e1", title: "Listening Audio: School Independence Day Parade", type: "material", postedDate: "Kemarin" },
          { id: "m-e2", title: "Grammar Quiz: Regular & Irregular Past Verbs", type: "quiz", postedDate: "Kemarin", points: 100 },
        ],
      },
      {
        id: "ingg-bab-2",
        nomor: 2,
        judul: "Bab 2: Kindness and Friendship (Narrative Text)",
        deskripsi: "Folklore stories, moral values, orientation-complication-resolution narrative structure.",
        materiCount: 3,
        kuisCount: 1,
        tugasCount: 1,
        isOpen: true,
        materials: [
          { id: "m-e3", title: "Reading Passage: The Legend of Malin Kundang", type: "material", postedDate: "3 Okt" },
        ],
      },
      {
        id: "ingg-bab-3",
        nomor: 3,
        judul: "Bab 3: Love Our World (Explanation Text)",
        deskripsi: "Plastic waste reduction, saving water, and expressing cause and effect (because, so).",
        materiCount: 3,
        kuisCount: 1,
        tugasCount: 1,
        isOpen: true,
        materials: [
          { id: "m-e4", title: "Modul: Cause and Effect Linking Words in Explanation Text", type: "material", postedDate: "30 Sep" },
          { id: "m-e5", title: "Reading Task: How Plastic Pollution Harms Marine Life", type: "assignment", postedDate: "30 Sep", dueDate: "7 Okt", points: 100 },
          { id: "m-e6", title: "Comprehension Quiz: Natural Processes & Environment", type: "quiz", postedDate: "2 Okt", points: 100 },
        ],
      },
      {
        id: "ingg-bab-4",
        nomor: 4,
        judul: "Bab 4: No Littering (Imperative Sentences)",
        deskripsi: "Commands, prohibitions, making school warning signs, and public notices.",
        materiCount: 3,
        kuisCount: 1,
        tugasCount: 1,
        isOpen: true,
        materials: [
          { id: "m-e7", title: "Vocabulary Guide: Imperative Verbs & Prohibition Signs", type: "material", postedDate: "22 Sep" },
          { id: "m-e8", title: "Project Assignment: Design a School Cleanliness Notice Board", type: "assignment", postedDate: "22 Sep", dueDate: "29 Sep", points: 100 },
          { id: "m-e9", title: "Quiz: Traffic & School Signs Meaning", type: "quiz", postedDate: "24 Sep", points: 100 },
        ],
      },
      {
        id: "ingg-bab-5",
        nomor: 5,
        judul: "Bab 5: Asking and Giving Opinion",
        deskripsi: "Expressions of what do you think, in my opinion, I agree, and polite disagreement.",
        materiCount: 3,
        kuisCount: 1,
        tugasCount: 1,
        isOpen: true,
        materials: [
          { id: "m-e10", title: "Audio Listening: Teenagers Discussing Social Media Use", type: "material", postedDate: "16 Sep" },
          { id: "m-e11", title: "Writing Assignment: Opinion Paragraph on School Gadget Rules", type: "assignment", postedDate: "16 Sep", dueDate: "23 Sep", points: 100 },
          { id: "m-e12", title: "Speaking & Grammar Quiz: Expressing Agreement & Disagreement", type: "quiz", postedDate: "18 Sep", points: 100 },
        ],
      },
      {
        id: "ingg-bab-6",
        nomor: 6,
        judul: "Bab 6: Report Text: Nature and Endangered Animals",
        deskripsi: "General classification, habitat, diet, and characteristics of Komodo & Orangutan.",
        materiCount: 3,
        kuisCount: 1,
        tugasCount: 1,
        isOpen: true,
        materials: [
          { id: "m-e13", title: "Fact Sheet: Anatomy of Report Text & Technical Terms", type: "material", postedDate: "9 Sep" },
          { id: "m-e14", title: "Research Task: Indonesian Endangered Animals Profile", type: "assignment", postedDate: "9 Sep", dueDate: "16 Sep", points: 100 },
          { id: "m-e15", title: "Reading Quiz: Komodo Dragon & Tropical Rainforest", type: "quiz", postedDate: "11 Sep", points: 100 },
        ],
      },
    ],
  },
];

interface StreamAnnouncement {
  id: string;
  authorName: string;
  authorAvatarText: string;
  authorAvatarColor: string;
  timeAgo: string;
  text: string;
  subjectTag?: string;
  comments: {
    id: string;
    authorName: string;
    authorRole: string;
    text: string;
    timeAgo: string;
  }[];
}

interface ManagementKelasTabScreenProps {
  onNavigateView?: (view: string) => void;
}

export default function ManagementKelasTabScreen({
  onNavigateView,
}: ManagementKelasTabScreenProps) {
  // ════════════════════════════════════════════════════════════════════════════
  // 1. STATE MANAGEMENT KELAS & GOOGLE CLASSROOM INTERFACE
  // ════════════════════════════════════════════════════════════════════════════
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("tech-sd");
  const [activeTab, setActiveTab] = useState<"stream" | "classwork" | "people" | "grades">("stream");
  const [isClassCodeModalOpen, setIsClassCodeModalOpen] = useState(false);
  const [isCustomizeBannerModalOpen, setIsCustomizeBannerModalOpen] = useState(false);
  const [isCreateDropdownOpen, setIsCreateDropdownOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalType, setCreateModalType] = useState<"assignment" | "quiz" | "material" | "topic">("material");
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>("all");
  const [streamFilterMapel, setStreamFilterMapel] = useState<string>("all");
  const [classworkViewMode, setClassworkViewMode] = useState<"topics" | "empty_sample">("topics");
  const [peopleViewMode, setPeopleViewMode] = useState<"students_list" | "empty_sample">("students_list");
  const [gradesViewMode, setGradesViewMode] = useState<"matrix" | "empty_sample">("matrix");

  // Announcement Form State
  const [isWritingAnnouncement, setIsWritingAnnouncement] = useState(false);
  const [announcementText, setAnnouncementText] = useState("");
  const [newCommentInput, setNewCommentInput] = useState<{ [postId: string]: string }>({});

  // Active Subject Object
  const currentSubject =
    CLASSROOM_SUBJECTS.find((s) => s.id === selectedSubjectId) || CLASSROOM_SUBJECTS[0];

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Close create dropdown on click outside
  const createDropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (createDropdownRef.current && !createDropdownRef.current.contains(e.target as Node)) {
        setIsCreateDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Announcement Posts State (Default includes exact screenshot text: "halo guys kerjakan tugasnya")
  const [announcements, setAnnouncements] = useState<StreamAnnouncement[]>([
    {
      id: "post-1",
      authorName: "syaa px",
      authorAvatarText: "S",
      authorAvatarColor: "bg-purple-700",
      timeAgo: "2:22 PM",
      text: "halo guys kerjakan tugasnya",
      subjectTag: "tech-sd",
      comments: [
        {
          id: "c-1",
          authorName: "Ahmad Raihan (8A)",
          authorRole: "Siswa",
          text: "Siap Bu, sedang proses pengerjaan kuis dan latihan codingnya!",
          timeAgo: "2:25 PM",
        },
      ],
    },
    {
      id: "post-2",
      authorName: "Ibu Siti Rahmawati, M.Pd.",
      authorAvatarText: "S",
      authorAvatarColor: "bg-blue-600",
      timeAgo: "Kemarin, 09:15",
      text: "Selamat pagi anak-anak! Materi Bab 1 Bilangan Berpangkat dan Bab 2 Teorema Pythagoras sudah dibuka. Jangan lupa cek latihan mandiri dan diskusikan soal sulit dengan AI Tutor Sokratik.",
      subjectTag: "mat-8",
      comments: [],
    },
    {
      id: "post-3",
      authorName: "Dra. Nurul Hidayah",
      authorAvatarText: "N",
      authorAvatarColor: "bg-emerald-600",
      timeAgo: "3 hari yang lalu",
      text: "Pengumpulan draf Laporan Hasil Observasi (LHO) lingkungan sekolah dibuka sampai hari Jumat. Pastikan menyertakan foto hasil pengamatan ya.",
      subjectTag: "indo-8",
      comments: [],
    },
  ]);

  // Real students state from Supabase / Mock database
  const [studentsList, setStudentsList] = useState<any[]>([
    { id: "st-1", name: "Ahmad Raihan", nisn: "0081234567", kelas: "8A", points: 620, hadir: true, online: true, foto: "/images/pasfoto-siswa-1.jpg" },
    { id: "st-2", name: "Aisyah Putri Azzahra", nisn: "0081234568", kelas: "8A", points: 580, hadir: true, online: true, foto: "/images/pasfoto-siswa-2.jpg" },
    { id: "st-3", name: "Budi Santoso", nisn: "0081234569", kelas: "8B", points: 540, hadir: true, online: false, foto: "/images/pasfoto-siswa-1.jpg" },
    { id: "st-4", name: "Citra Dewi Lestari", nisn: "0081234570", kelas: "8A", points: 510, hadir: true, online: true, foto: "/images/pasfoto-siswa-2.jpg" },
    { id: "st-5", name: "Dika Pratama", nisn: "0081234571", kelas: "8C", points: 490, hadir: true, online: false, foto: "/images/pasfoto-siswa-1.jpg" },
    { id: "st-6", name: "Fathir Muhammad", nisn: "0081234572", kelas: "8B", points: 475, hadir: true, online: true, foto: "/images/pasfoto-siswa-1.jpg" },
    { id: "st-7", name: "Khadijah Nurul", nisn: "0081234573", kelas: "8A", points: 460, hadir: true, online: false, foto: "/images/pasfoto-siswa-2.jpg" },
    { id: "st-8", name: "Rizky Ramadhan", nisn: "0081234574", kelas: "8C", points: 430, hadir: false, online: false, foto: "/images/pasfoto-siswa-1.jpg" },
  ]);

  // Fetch real students from Supabase on mount
  useEffect(() => {
    async function loadRealData() {
      try {
        const res = await fetch("/api/guru/manajemen-kelas");
        if (res.ok) {
          const json = await res.json();
          if (json.siswa && Array.isArray(json.siswa) && json.siswa.length > 0) {
            setStudentsList(
              json.siswa.map((st: any, idx: number) => ({
                id: st.id || `st-db-${idx}`,
                name: st.nama_lengkap || "Siswa",
                nisn: st.nisn || `00812345${idx}`,
                kelas: st.kelas || "8A",
                points: st.total_poin || 450,
                hadir: true,
                online: idx % 2 === 0,
                foto: st.foto || (idx % 2 === 0 ? "/images/pasfoto-siswa-1.jpg" : "/images/pasfoto-siswa-2.jpg"),
              }))
            );
          }
        }
      } catch (err) {
        console.warn("Using default classroom student data:", err);
      }
    }
    loadRealData();
  }, []);

  // Handle Post Announcement
  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;

    const newPost: StreamAnnouncement = {
      id: `post-${Date.now()}`,
      authorName: currentSubject.teacher.name,
      authorAvatarText: currentSubject.teacher.avatarText,
      authorAvatarColor: currentSubject.teacher.avatarColor,
      timeAgo: "Baru saja",
      text: announcementText.trim(),
      subjectTag: currentSubject.id,
      comments: [],
    };

    setAnnouncements([newPost, ...announcements]);
    setAnnouncementText("");
    setIsWritingAnnouncement(false);
    showToast("Pengumuman berhasil disiarkan ke siswa di Stream!");
  };

  // Handle Add Comment
  const handleAddComment = (postId: string) => {
    const text = newCommentInput[postId]?.trim();
    if (!text) return;

    setAnnouncements((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [
              ...post.comments,
              {
                id: `c-${Date.now()}`,
                authorName: currentSubject.teacher.name,
                authorRole: "Guru",
                text,
                timeAgo: "Baru saja",
              },
            ],
          };
        }
        return post;
      })
    );

    setNewCommentInput({ ...newCommentInput, [postId]: "" });
    showToast("Komentar ditambahkan ke kiriman stream.");
  };

  // Copy Class Code
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast(`Kode kelas "${code}" disalin ke clipboard!`);
  };

  // Dynamic Banner Artwork by Illustration
  const renderBannerGraphic = (type: string) => {
    if (type === "tech") {
      return (
        <div className="absolute right-0 top-0 bottom-0 w-2/3 pointer-events-none opacity-90 overflow-hidden flex items-center justify-end pr-6">
          <svg viewBox="0 0 600 240" className="h-full max-h-[220px] w-auto">
            {/* Tablet Mockup */}
            <rect x="180" y="20" width="170" height="130" rx="12" fill="#1E293B" stroke="#60A5FA" strokeWidth="4" />
            <rect x="195" y="35" width="140" height="100" rx="6" fill="#38BDF8" opacity="0.85" />
            <line x1="210" y1="55" x2="280" y2="55" stroke="#F97316" strokeWidth="4" strokeLinecap="round" />
            <line x1="210" y1="70" x2="310" y2="70" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
            <line x1="210" y1="85" x2="260" y2="85" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />

            {/* Laptop Mockup */}
            <rect x="330" y="40" width="230" height="150" rx="10" fill="#0F172A" stroke="#93C5FD" strokeWidth="5" />
            <rect x="345" y="55" width="200" height="110" rx="6" fill="#3B82F6" opacity="0.9" />
            {/* Keyboard base */}
            <path d="M300 195 L590 195 L570 215 L320 215 Z" fill="#CBD5E1" />
            {/* Laptop screen code bars */}
            <rect x="360" y="70" width="170" height="14" rx="3" fill="#1D4ED8" />
            <rect x="360" y="92" width="130" height="10" rx="2" fill="#93C5FD" />
            <rect x="360" y="108" width="150" height="10" rx="2" fill="#93C5FD" />
            <rect x="360" y="124" width="100" height="10" rx="2" fill="#93C5FD" />

            {/* Smartphone Mockup */}
            <rect x="250" y="110" width="85" height="120" rx="10" fill="#0F172A" stroke="#38BDF8" strokeWidth="3" />
            <rect x="260" y="122" width="65" height="95" rx="4" fill="#0284C7" />
          </svg>
        </div>
      );
    }

    if (type === "math") {
      return (
        <div className="absolute right-0 top-0 bottom-0 w-2/3 pointer-events-none opacity-85 overflow-hidden flex items-center justify-end pr-8">
          <svg viewBox="0 0 500 240" className="h-full max-h-[220px] w-auto">
            <circle cx="380" cy="110" r="85" fill="#2563EB" opacity="0.3" />
            <polygon points="260,180 430,180 430,50" fill="none" stroke="#60A5FA" strokeWidth="5" />
            <text x="320" y="210" fill="#93C5FD" fontSize="24" fontWeight="bold">a² + b² = c²</text>
            <text x="445" y="120" fill="#FBBF24" fontSize="26" fontWeight="bold">f(x)</text>
            <text x="230" y="80" fill="#34D399" fontSize="28" fontWeight="bold">√x</text>
            {/* Compass / Ruler */}
            <line x1="280" y1="30" x2="350" y2="180" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round" />
            <line x1="420" y1="30" x2="350" y2="180" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round" />
          </svg>
        </div>
      );
    }

    if (type === "literature") {
      return (
        <div className="absolute right-0 top-0 bottom-0 w-2/3 pointer-events-none opacity-85 overflow-hidden flex items-center justify-end pr-8">
          <svg viewBox="0 0 500 240" className="h-full max-h-[220px] w-auto">
            {/* Open Book */}
            <path d="M220 180 Q290 160 360 180 L360 80 Q290 60 220 80 Z" fill="#047857" stroke="#34D399" strokeWidth="4" />
            <path d="M360 180 Q430 160 500 180 L500 80 Q430 60 360 80 Z" fill="#065F46" stroke="#34D399" strokeWidth="4" />
            {/* Quill / Pen */}
            <path d="M240 60 Q270 20 310 10 Q300 40 270 80 Z" fill="#FBBF24" />
            <line x1="270" y1="80" x2="250" y2="110" stroke="#F59E0B" strokeWidth="3" />
            <text x="250" y="220" fill="#A7F3D0" fontSize="20" fontWeight="bold">Teks LHO & Puisi</text>
          </svg>
        </div>
      );
    }

    // Default English
    return (
      <div className="absolute right-0 top-0 bottom-0 w-2/3 pointer-events-none opacity-85 overflow-hidden flex items-center justify-end pr-8">
        <svg viewBox="0 0 500 240" className="h-full max-h-[220px] w-auto">
          {/* Globe & Speech Bubbles */}
          <circle cx="390" cy="120" r="75" fill="#B45309" opacity="0.35" stroke="#FBBF24" strokeWidth="4" />
          <path d="M260 60 Q290 40 330 60 Q370 80 340 100 L320 120 L315 100 Q260 100 260 60 Z" fill="#F59E0B" />
          <text x="280" y="80" fill="#1E293B" fontSize="16" fontWeight="bold">Hello!</text>
          <path d="M370 140 Q400 120 440 140 Q470 160 440 180 L430 200 L420 180 Q370 180 370 140 Z" fill="#60A5FA" />
          <text x="390" y="160" fill="#FFFFFF" fontSize="16" fontWeight="bold">Great!</text>
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-150">
      {/* ════════════════════════════════════════════════════════════════════════════
          1. MANAGEMENT KELAS NORMAL SCREEN HEADER
          - Kiri: Identitas Kelas, Pilihan Mapel & Pengalihan Pengaturan Akun Guru
          - Kanan: Tab Navigasi Kelas (Stream, Classwork, People, Grades) di Sebelah Kanan
         ════════════════════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Kiri: Identitas Mata Pelajaran & Pilihan Dropdown */}
        <div className="flex flex-wrap items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-base shadow-xs shrink-0">
            {currentSubject.name.charAt(0)}
          </div>

          <div className="flex flex-col">
            {/* Subject Dropdown Selector & Title */}
            <div className="flex items-center gap-2">
              <div className="relative inline-block">
                <select
                  value={selectedSubjectId}
                  onChange={(e) => {
                    setSelectedSubjectId(e.target.value);
                    const chosen = CLASSROOM_SUBJECTS.find((s) => s.id === e.target.value);
                    if (chosen) showToast(`Beralih ke kelas ${chosen.name}`);
                  }}
                  className="text-base sm:text-lg font-extrabold text-slate-900 bg-transparent pr-7 pl-1 py-0.5 rounded-lg border-b-2 border-transparent hover:border-blue-400 focus:outline-none focus:border-[#1967D2] cursor-pointer appearance-none transition"
                  title="Pilih Mata Pelajaran"
                >
                  {CLASSROOM_SUBJECTS.map((sub) => (
                    <option key={sub.id} value={sub.id} className="text-sm font-semibold">
                      {sub.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none absolute right-1 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Subtitle / Section, Room, Teacher & Switch Account / Settings Redirect */}
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium flex-wrap mt-0.5">
              <span>{currentSubject.section}</span>
              <span className="text-slate-300">•</span>
              <span>{currentSubject.room}</span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                Pengajar: {currentSubject.teacher.name}
              </span>
              {onNavigateView && (
                <button
                  type="button"
                  onClick={() => onNavigateView("pengaturan")}
                  className="text-[11px] font-bold text-[#1967D2] hover:text-blue-700 hover:underline transition cursor-pointer flex items-center gap-1 ml-1"
                  title="Ke Pengaturan Guru untuk ganti akun atau profil"
                >
                  <User className="w-3 h-3" />
                  <span>Pengaturan Guru / Switch Akun</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Kanan: Tab-tab Management Kelas (Stream, Classwork, People, Grades) */}
        <nav className="flex items-center gap-1 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 shrink-0 self-start lg:self-auto overflow-x-auto max-w-full">
          {[
            { id: "stream", label: "Stream", icon: Layers },
            { id: "classwork", label: "Classwork", icon: BookOpen },
            { id: "people", label: "People", icon: Users },
            { id: "grades", label: "Grades", icon: Award },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                  isActive
                    ? "bg-white text-[#1967D2] shadow-xs border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#1967D2]" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-[#0F172A] text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════════
          2. TAB 1: STREAM (SESUAI DENGAN SCREENSHOT 1 DARI PENGGUNA)
          Hero Banner + Class Code & Upcoming + Announcement Stream Feed + Bab-bab
         ════════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "stream" && (
        <div className="space-y-6 w-full">
          {/* A. HERO BANNER PERSIS DENGAN GAMBAR 1 */}
          <div
            className={`relative rounded-3xl bg-gradient-to-r ${currentSubject.bgGradient} text-white p-6 sm:p-8 overflow-hidden shadow-sm min-h-[170px] sm:min-h-[210px] flex flex-col justify-between`}
          >
            {/* Banner Background Illustration */}
            {renderBannerGraphic(currentSubject.bannerIllustration)}

            {/* Top row: Subject Title & Customize Button */}
            <div className="flex items-start justify-between gap-4 relative z-10">
              <div className="space-y-1 max-w-md sm:max-w-xl">
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  {currentSubject.name}
                </h1>
                <p className="text-xs sm:text-sm text-slate-200 font-medium opacity-90">
                  {currentSubject.section} • {currentSubject.room}
                </p>
              </div>

              {/* Customize Button (Matches Screenshot 1) */}
              <button
                type="button"
                onClick={() => setIsCustomizeBannerModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 shadow-sm transition cursor-pointer shrink-0"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                <span>Customize</span>
              </button>
            </div>

            {/* Bottom info icon */}
            <div className="flex items-center justify-between pt-4 relative z-10">
              <div className="flex items-center gap-2 text-[11px] text-slate-200">
                <span className="bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-xs font-semibold">
                  Pengajar: {currentSubject.teacher.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => showToast(`Info Kelas: ${currentSubject.name} - ${currentSubject.section}`)}
                className="w-7 h-7 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition cursor-pointer"
                title="Informasi Kelas"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* B. DUA KOLOM: KIRI (Class code & Upcoming) + KANAN (Stream Feed & Bab) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* KOLOM KIRI (3/12): Class Code & Upcoming */}
            <div className="lg:col-span-4 space-y-4">
              {/* Card 1: Class code (Matches Screenshot 1) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Class code</span>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(currentSubject.subjectCode)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                    title="Menu opsi"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xl font-black text-[#1967D2] tracking-wider select-all font-mono">
                    {currentSubject.subjectCode}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopyCode(currentSubject.subjectCode)}
                      className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
                      title="Salin kode kelas"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsClassCodeModalOpen(true)}
                      className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition cursor-pointer"
                      title="Perbesar kode kelas ke layar penuh"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 2: Upcoming (Matches Screenshot 1) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
                <div className="text-xs font-bold text-slate-700">Upcoming</div>
                <p className="text-xs text-slate-500 font-medium">
                  No work due soon
                </p>
                <div className="pt-1 text-right">
                  <button
                    type="button"
                    onClick={() => setActiveTab("classwork")}
                    className="text-xs font-bold text-[#1967D2] hover:underline cursor-pointer"
                  >
                    View all
                  </button>
                </div>
              </div>

              {/* Card 3: Quick Switcher Mapel Dashboard Guru */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-2.5">
                <div className="text-[11px] font-black text-slate-600 uppercase tracking-wider">
                  Mata Pelajaran Aktif Guru
                </div>
                <div className="space-y-1.5">
                  {CLASSROOM_SUBJECTS.map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setSelectedSubjectId(sub.id)}
                      className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition flex items-center justify-between cursor-pointer border ${
                        selectedSubjectId === sub.id
                          ? "bg-white text-[#1967D2] border-blue-300 shadow-2xs"
                          : "bg-transparent hover:bg-white text-slate-700 border-transparent"
                      }`}
                    >
                      <span className="truncate">{sub.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-600 font-semibold">
                        {sub.babs.length} Bab
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* KOLOM KANAN (8/12): Announcement Buttons + Post Stream Feed + Bab Bab */}
            <div className="lg:col-span-8 space-y-5">
              {/* Quick Announcement Row (Matches Screenshot 1) */}
              {!isWritingAnnouncement ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-2xs flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setIsWritingAnnouncement(true)}
                    className="flex-1 inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-blue-50/80 hover:bg-blue-100 text-[#1967D2] text-xs font-bold transition cursor-pointer text-left border border-blue-200/60"
                  >
                    <Edit3 className="w-4 h-4 text-[#1967D2]" />
                    <span>New announcement</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => showToast("Pilih kiriman sebelumnya untuk digunakan kembali.")}
                    className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-full hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
                  >
                    <RepeatIcon className="w-4 h-4 text-slate-500" />
                    <span>Repost</span>
                  </button>
                </div>
              ) : (
                /* Expandable Create Announcement Form */
                <form
                  onSubmit={handlePostAnnouncement}
                  className="bg-white rounded-3xl border border-blue-300 p-5 shadow-md space-y-4 animate-in fade-in duration-150"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <span className="text-xs font-bold text-slate-700">
                      Umumkan sesuatu ke kelas {currentSubject.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsWritingAnnouncement(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <textarea
                    rows={3}
                    required
                    placeholder="Tulis pengumuman atau instruksi belajar untuk seluruh siswa..."
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    className="w-full text-xs sm:text-sm p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-[#1967D2] font-medium resize-none"
                  />

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2 text-slate-400">
                      <button type="button" className="p-1.5 hover:text-slate-700 rounded-lg hover:bg-slate-100" title="Lampirkan File">
                        <Paperclip className="w-4 h-4" />
                      </button>
                      <button type="button" className="p-1.5 hover:text-slate-700 rounded-lg hover:bg-slate-100" title="Drive">
                        <FolderKanban className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsWritingAnnouncement(false)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-[#1967D2] hover:bg-blue-600 text-white text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Posting
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* STREAM POSTS FEED */}
              <div className="space-y-4">
                {/* 1. Pengumuman Teks dari Guru (Termasuk "halo guys kerjakan tugasnya" dari Screenshot 1) */}
                {announcements
                  .filter((a) => a.subjectTag === currentSubject.id || !a.subjectTag)
                  .map((post) => (
                    <div
                      key={post.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4"
                    >
                      {/* Post Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full ${post.authorAvatarColor} text-white flex items-center justify-center font-bold text-sm shrink-0`}
                          >
                            {post.authorAvatarText}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 leading-tight">
                              {post.authorName}
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium">
                              {post.timeAgo}
                            </div>
                          </div>
                        </div>

                        <button className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Post Content */}
                      <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed whitespace-pre-line">
                        {post.text}
                      </p>

                      {/* Comments List */}
                      {post.comments.length > 0 && (
                        <div className="pt-2 border-t border-slate-100 space-y-2">
                          {post.comments.map((cm) => (
                            <div key={cm.id} className="text-xs flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl">
                              <div className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                                {cm.authorName.charAt(0)}
                              </div>
                              <div className="space-y-0.5">
                                <div className="text-[11px] font-bold text-slate-800">
                                  {cm.authorName}{" "}
                                  <span className="text-[10px] text-slate-400 font-normal">
                                    • {cm.timeAgo}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600">{cm.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add comment field (Matches Screenshot 1) */}
                      <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Add class comment..."
                          value={newCommentInput[post.id] || ""}
                          onChange={(e) =>
                            setNewCommentInput({
                              ...newCommentInput,
                              [post.id]: e.target.value,
                            })
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddComment(post.id);
                          }}
                          className="flex-1 text-xs bg-slate-50 px-3.5 py-2 rounded-full border border-slate-200 focus:bg-white focus:outline-none focus:border-[#1967D2] font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddComment(post.id)}
                          className="p-2 rounded-full hover:bg-slate-100 text-[#1967D2] transition cursor-pointer"
                          title="Kirim komentar"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                {/* 2. DAFTAR ISI BAB-BAB MATEMATIKA, BAHASA INDONESIA, BAHASA INGGRIS DI STREAM */}
                {/* Sesuai instruksi: "dan isinya pada tab stream itu ada heronya dan isi dari bab bab matematika, bahasa indonesia dan juga bahasa inggris yang ada di dashboard guru." */}
                <div className="pt-4 space-y-4">
                  {/* Subject Filter Bar in Stream */}
                  <div className="bg-slate-50 border border-slate-200 p-3 sm:p-4 rounded-2xl space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-[#1967D2]" />
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                          Bab Pembelajaran di Stream
                        </h3>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Pilih mapel atau tampilkan seluruh kurikulum guru
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setStreamFilterMapel("all")}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                          streamFilterMapel === "all"
                            ? "bg-[#1967D2] text-white shadow-xs"
                            : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                        }`}
                      >
                        Semua Mapel (Matematika, B. Indo, B. Inggris)
                      </button>

                      {CLASSROOM_SUBJECTS.map((sub) => {
                        const isSelected = streamFilterMapel === sub.id;
                        return (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => setStreamFilterMapel(sub.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                              isSelected
                                ? "bg-[#1967D2] text-white shadow-xs"
                                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                            }`}
                          >
                            <span>{sub.name}</span>
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                                isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {sub.babs.length}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Subject Sections */}
                  <div className="space-y-6">
                    {(streamFilterMapel === "all"
                      ? CLASSROOM_SUBJECTS
                      : CLASSROOM_SUBJECTS.filter((s) => s.id === streamFilterMapel)
                    ).map((subjectItem) => {
                      const isHeroActive = selectedSubjectId === subjectItem.id;
                      return (
                        <div
                          key={subjectItem.id}
                          className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-2xs space-y-4"
                        >
                          {/* Subject Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-2xs ${
                                  subjectItem.id === "mat-8"
                                    ? "bg-blue-600"
                                    : subjectItem.id === "indo-8"
                                    ? "bg-emerald-600"
                                    : subjectItem.id === "ingg-8"
                                    ? "bg-amber-600"
                                    : "bg-slate-800"
                                }`}
                              >
                                {subjectItem.name.charAt(0)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                                    {subjectItem.name}
                                  </h4>
                                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600">
                                    {subjectItem.babs.length} Bab
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 font-medium">
                                  {subjectItem.section} • Pengajar: {subjectItem.teacher.name}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {isHeroActive ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#1967D2] text-xs font-bold border border-blue-200">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Hero Banner Aktif</span>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedSubjectId(subjectItem.id);
                                    showToast(`Banner hero diubah ke ${subjectItem.name}`);
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-[#1967D2] text-slate-700 text-xs font-bold transition cursor-pointer border border-slate-200"
                                  title="Ganti Hero Banner ke mata pelajaran ini"
                                >
                                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Terapkan ke Banner Hero</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedSubjectId(subjectItem.id);
                                  setActiveTab("classwork");
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer shadow-2xs"
                              >
                                <span>Buka Classwork</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Bab Cards Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            {subjectItem.babs.map((bab) => (
                              <div
                                key={bab.id}
                                className="bg-slate-50/70 hover:bg-white rounded-2xl border border-slate-200 p-4 transition hover:shadow-xs hover:border-blue-300 space-y-3 flex flex-col justify-between"
                              >
                                <div className="space-y-2">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                                          subjectItem.id === "mat-8"
                                            ? "bg-blue-100 text-blue-700"
                                            : subjectItem.id === "indo-8"
                                            ? "bg-emerald-100 text-emerald-700"
                                            : subjectItem.id === "ingg-8"
                                            ? "bg-amber-100 text-amber-700"
                                            : "bg-slate-200 text-slate-800"
                                        }`}
                                      >
                                        {bab.nomor}
                                      </span>
                                      <span
                                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                          bab.isOpen
                                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                            : "bg-slate-200 text-slate-600 border-slate-300"
                                        }`}
                                      >
                                        {bab.isOpen ? "Akses Terbuka" : "Terkunci"}
                                      </span>
                                    </div>
                                    <span className="text-[10px] font-semibold text-slate-400">
                                      {bab.materials.length} Item
                                    </span>
                                  </div>

                                  <h5 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                                    {bab.judul}
                                  </h5>

                                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-2">
                                    {bab.deskripsi}
                                  </p>
                                </div>

                                {/* Materials Preview */}
                                {bab.materials.length > 0 && (
                                  <div className="pt-2 border-t border-slate-200/80 space-y-1">
                                    {bab.materials.slice(0, 2).map((mat) => (
                                      <div
                                        key={mat.id}
                                        onClick={() => {
                                          setSelectedSubjectId(subjectItem.id);
                                          setActiveTab("classwork");
                                        }}
                                        className="flex items-center justify-between p-1.5 rounded-lg hover:bg-blue-50 transition cursor-pointer text-[11px]"
                                      >
                                        <div className="flex items-center gap-2 truncate pr-2">
                                          {mat.type === "quiz" ? (
                                            <CheckSquare className="w-3 h-3 text-amber-600 shrink-0" />
                                          ) : mat.type === "assignment" ? (
                                            <FileText className="w-3 h-3 text-blue-600 shrink-0" />
                                          ) : (
                                            <BookOpen className="w-3 h-3 text-emerald-600 shrink-0" />
                                          )}
                                          <span className="font-semibold text-slate-700 truncate">
                                            {mat.title}
                                          </span>
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-medium shrink-0">
                                          {mat.dueDate ? `Due: ${mat.dueDate}` : mat.postedDate}
                                        </span>
                                      </div>
                                    ))}
                                    {bab.materials.length > 2 && (
                                      <div className="text-right pt-0.5">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setSelectedSubjectId(subjectItem.id);
                                            setActiveTab("classwork");
                                          }}
                                          className="text-[10px] font-bold text-[#1967D2] hover:underline cursor-pointer"
                                        >
                                          +{bab.materials.length - 2} materi lainnya di Classwork
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════════
          3. TAB 2: CLASSWORK (SESUAI DENGAN SCREENSHOT 2 DARI PENGGUNA)
          Tombol "+ Create" + Dropdown (Assignment, Quiz, Question, Material, Topic)
         ════════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "classwork" && (
        <div className="space-y-6 w-full">
          {/* Top Classwork Bar: + Create Button (Matches Screenshot 2) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            {/* + Create Button with Dropdown */}
            <div className="relative" ref={createDropdownRef}>
              <button
                type="button"
                onClick={() => setIsCreateDropdownOpen(!isCreateDropdownOpen)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1967D2] hover:bg-blue-600 text-white text-xs sm:text-sm font-bold shadow-sm transition cursor-pointer"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>Create</span>
                <ChevronDown className="w-3.5 h-3.5 text-blue-100 ml-1" />
              </button>

              {/* Dropdown Menu (Matches Screenshot 2 exact 6 options) */}
              {isCreateDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-40 animate-in fade-in zoom-in-95 duration-100">
                  {[
                    { type: "assignment", label: "Assignment", icon: FileText, desc: "Tugas pekerjaan rumah/proyek" },
                    { type: "quiz", label: "Quiz assignment", icon: CheckSquare, desc: "Kuis evaluasi pilihan ganda" },
                    { type: "question", label: "Question", icon: HelpCircle, desc: "Pertanyaan diskusi kelas" },
                    { type: "material", label: "Material", icon: BookOpen, desc: "Modul bacaan & rangkuman materi" },
                    { type: "reuse", label: "Reuse post", icon: RepeatIcon, desc: "Gunakan kembali postingan tugas" },
                    { type: "topic", label: "Topic", icon: Layers, desc: "Buat Bab / Topik baru" },
                  ].map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.type}
                        type="button"
                        onClick={() => {
                          if (opt.type === "reuse") {
                            showToast("Pilih tugas sebelumnya untuk digunakan kembali.");
                          } else {
                            setCreateModalType((opt.type === "question" ? "assignment" : opt.type) as any);
                            setIsCreateModalOpen(true);
                          }
                          setIsCreateDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-800 hover:bg-slate-50 flex items-center gap-3 transition cursor-pointer"
                      >
                        <Icon className="w-4 h-4 text-[#1967D2]" />
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* View Mode Toggle: Topics vs Screenshot 2 Empty Mode */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setClassworkViewMode("topics")}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    classworkViewMode === "topics"
                      ? "bg-white text-[#1967D2] shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Daftar Topik & Bab
                </button>
                <button
                  type="button"
                  onClick={() => setClassworkViewMode("empty_sample")}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    classworkViewMode === "empty_sample"
                      ? "bg-white text-[#1967D2] shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Tampilan Gambar 2
                </button>
              </div>

              <span className="text-xs text-slate-500 font-medium hidden md:inline">
                Mata Pelajaran: <strong className="text-slate-800">{currentSubject.name}</strong>
              </span>
            </div>
          </div>

          {classworkViewMode === "empty_sample" ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-2xs">
              <ClassworkEmptyGraphic />
            </div>
          ) : (
            /* Bab-bab & Material List organized by Topic */
            <div className="space-y-6">
            {currentSubject.babs.map((bab) => (
              <div key={bab.id} className="space-y-3">
                {/* Topic Header Bar */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <span>{bab.judul}</span>
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => showToast(`Status bab "${bab.judul}" diperbarui.`)}
                      className={`px-3 py-1 rounded-full text-xs font-bold border transition cursor-pointer ${
                        bab.isOpen
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}
                    >
                      {bab.isOpen ? "Terbuka" : "Terkunci"}
                    </button>
                    <button className="p-1 text-slate-400 hover:text-slate-700">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Items in this Topic */}
                {bab.materials.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    Belum ada materi atau tugas yang ditambahkan ke topik ini. Klik <strong>+ Create</strong> untuk menambahkan.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {bab.materials.map((mat) => (
                      <div
                        key={mat.id}
                        className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-xs transition flex items-center justify-between gap-4 cursor-pointer group"
                      >
                        <div className="flex items-center gap-3.5">
                          <div
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                              mat.type === "quiz"
                                ? "bg-amber-50 text-amber-600 border border-amber-200"
                                : mat.type === "assignment"
                                ? "bg-blue-50 text-blue-600 border border-blue-200"
                                : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                            }`}
                          >
                            {mat.type === "quiz" ? (
                              <CheckSquare className="w-5 h-5" />
                            ) : mat.type === "assignment" ? (
                              <FileText className="w-5 h-5" />
                            ) : (
                              <BookOpen className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#1967D2] transition">
                              {mat.title}
                            </h4>
                            <span className="text-[11px] text-slate-400 font-medium">
                              {mat.dueDate ? `Batas waktu: ${mat.dueDate}` : `Diposting: ${mat.postedDate}`}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {mat.points && (
                            <span className="text-xs font-bold text-slate-600 px-2.5 py-1 bg-slate-100 rounded-lg">
                              {mat.points} Poin
                            </span>
                          )}
                          <button className="p-1 text-slate-400 hover:text-slate-700">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )}

      {/* ════════════════════════════════════════════════════════════════════════════
          4. TAB 3: PEOPLE (SESUAI DENGAN SCREENSHOT 3 DARI PENGGUNA)
          Teachers section + Students section (data Supabase)
         ════════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "people" && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-8 shadow-2xs w-full">
          {/* TEACHERS SECTION (Matches Screenshot 3) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#1967D2]">
              <h2 className="text-2xl font-normal text-[#1967D2] font-sans">
                Teachers
              </h2>
              <button
                type="button"
                onClick={() => showToast("Buka dialog undang guru kolaborator.")}
                className="p-2 text-[#1967D2] hover:bg-blue-50 rounded-full transition cursor-pointer"
                title="Invite teacher"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {/* Teacher 1: syaa px (from screenshot 3) */}
              <div className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-purple-700 text-white flex items-center justify-center font-bold text-sm">
                    S
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-800">
                    syaa px
                  </span>
                </div>
                <button className="p-1 text-slate-400 hover:text-slate-600">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              {/* Teacher 2: Guru Utama */}
              <div className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    S
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-sm font-semibold text-slate-800">
                      Ibu Siti Rahmawati, M.Pd.
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Wali Kelas & Guru Pengampu
                    </span>
                  </div>
                </div>
                <button className="p-1 text-slate-400 hover:text-slate-600">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* STUDENTS SECTION (Matches Screenshot 3 + Real Data Supabase) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#1967D2]">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-normal text-[#1967D2] font-sans">
                  Students
                </h2>
                <span className="text-xs text-slate-400 font-bold">
                  {studentsList.length} students
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setPeopleViewMode("students_list")}
                    className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                      peopleViewMode === "students_list"
                        ? "bg-white text-[#1967D2] shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Daftar Siswa
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeopleViewMode("empty_sample")}
                    className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                      peopleViewMode === "empty_sample"
                        ? "bg-white text-[#1967D2] shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Tampilan Gambar 3
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => showToast("Dialog undang siswa via email/kode kelas.")}
                  className="p-2 text-[#1967D2] hover:bg-blue-50 rounded-full transition cursor-pointer"
                  title="Invite students"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {peopleViewMode === "empty_sample" ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-2xs">
                <PeopleEmptyGraphic onInvite={() => showToast("Dialog undang siswa via email atau kode kelas dibuka.")} />
              </div>
            ) : (
              /* Student List */
              <div className="divide-y divide-slate-100">
                {studentsList.map((st) => (
                  <div key={st.id} className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl transition">
                    <div className="flex items-center gap-3.5">
                      <div className="relative w-9 h-9 rounded-full overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
                        <Image
                          src={st.foto || "/images/pasfoto-siswa-1.jpg"}
                          alt={st.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div>
                        <span className="text-xs sm:text-sm font-semibold text-slate-900 block">
                          {st.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          NISN {st.nisn} • Rombel {st.kelas}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        {st.points} Poin
                      </span>
                      <button className="p-1 text-slate-400 hover:text-slate-600">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════════
          5. TAB 4: GRADES (SESUAI DENGAN SCREENSHOT 4 DARI PENGGUNA)
          Buku Nilai Gradebook Siswa
         ════════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "grades" && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-2xs w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Buku Nilai & Rekap Hasil Belajar</h2>
              <p className="text-xs text-slate-500 font-medium">
                Rekap perolehan nilai siswa untuk {currentSubject.name}.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* View Switcher: Matrix vs Screenshot 4 Empty Mode */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setGradesViewMode("matrix")}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                    gradesViewMode === "matrix"
                      ? "bg-white text-[#1967D2] shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Buku Nilai
                </button>
                <button
                  type="button"
                  onClick={() => setGradesViewMode("empty_sample")}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                    gradesViewMode === "empty_sample"
                      ? "bg-white text-[#1967D2] shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Tampilan Gambar 4
                </button>
              </div>

              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-[#1967D2] border border-blue-200">
                Passing Grade (KKM): 75
              </span>
            </div>
          </div>

          {gradesViewMode === "empty_sample" ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-2xs">
              <GradesEmptyGraphic onInvite={() => showToast("Dialog undang siswa via email atau kode kelas dibuka.")} />
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Nama Siswa</th>
                    <th className="py-3 px-3 text-center">Bab 1 Quiz</th>
                    <th className="py-3 px-3 text-center">Bab 2 Tugas</th>
                    <th className="py-3 px-3 text-center">Kuis Sokratik</th>
                    <th className="py-3 px-3 text-center">PTS Asesmen</th>
                    <th className="py-3 px-4 text-center">Rata-rata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {studentsList.map((st, sIdx) => {
                    const score1 = 80 + ((sIdx * 3) % 20);
                    const score2 = 75 + ((sIdx * 4) % 22);
                    const score3 = 85 + ((sIdx * 2) % 15);
                    const score4 = 78 + ((sIdx * 5) % 20);
                    const avg = Math.round((score1 + score2 + score3 + score4) / 4);
                    return (
                      <tr key={st.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{st.name}</div>
                          <div className="text-[10px] text-slate-400">NISN {st.nisn}</div>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-slate-800">{score1}</td>
                        <td className="py-3 px-3 text-center font-bold text-slate-800">{score2}</td>
                        <td className="py-3 px-3 text-center font-bold text-slate-800">{score3}</td>
                        <td className="py-3 px-3 text-center font-bold text-slate-800">{score4}</td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`font-black text-xs px-2.5 py-1 rounded-full ${
                              avg >= 75 ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {avg}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════════
          MODAL 1: FULLSCREEN CLASS CODE DISPLAY (Ketika icon [ ] diklik di banner)
         ════════════════════════════════════════════════════════════════════════════ */}
      {isClassCodeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full text-center space-y-6 shadow-2xl relative">
            <button
              onClick={() => setIsClassCodeModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Kode Gabung Kelas Siswa
              </span>
              <h3 className="text-lg font-black text-slate-900">{currentSubject.name}</h3>
            </div>

            <div className="p-8 bg-blue-50/70 rounded-3xl border-2 border-blue-200">
              <span className="text-5xl sm:text-6xl font-black text-[#1967D2] tracking-widest font-mono select-all">
                {currentSubject.subjectCode}
              </span>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  handleCopyCode(currentSubject.subjectCode);
                  setIsClassCodeModalOpen(false);
                }}
                className="px-6 py-2.5 rounded-full bg-[#1967D2] hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Copy className="w-4 h-4" />
                <span>Salin Kode Kelas</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════════
          MODAL 2: CUSTOMIZE BANNER TEMA KELAS
         ════════════════════════════════════════════════════════════════════════════ */}
      {isCustomizeBannerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">Customize Class Theme</h3>
              <button onClick={() => setIsCustomizeBannerModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700">Pilih Ilustrasi Tema Banner</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "tech", label: "Technology & Code", color: "bg-slate-800" },
                  { id: "math", label: "Mathematics & Geometri", color: "bg-blue-800" },
                  { id: "literature", label: "Bahasa & Sastra", color: "bg-emerald-800" },
                  { id: "english", label: "English & World", color: "bg-amber-800" },
                ].map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => {
                      showToast(`Tema banner ${th.label} diterapkan.`);
                      setIsCustomizeBannerModalOpen(false);
                    }}
                    className={`p-3 rounded-2xl text-left border transition cursor-pointer ${
                      currentSubject.bannerIllustration === th.id
                        ? "border-[#1967D2] ring-2 ring-blue-500/20"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className={`w-full h-12 rounded-xl ${th.color} mb-2`} />
                    <span className="text-xs font-bold text-slate-800 block">{th.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════════
          MODAL 3: CREATE ASSIGNMENT / MATERIAL MODAL
         ════════════════════════════════════════════════════════════════════════════ */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">
                {createModalType === "assignment"
                  ? "Buat Tugas Baru"
                  : createModalType === "quiz"
                  ? "Buat Kuis Evaluasi"
                  : createModalType === "topic"
                  ? "Tambah Topik / Bab Baru"
                  : "Tambah Modul Materi"}
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                showToast("Berhasil diterbitkan ke daftar tugas kelas!");
                setIsCreateModalOpen(false);
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Judul *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bab 4: Latihan Mandiri SPLDV"
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1967D2]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Deskripsi / Petunjuk</label>
                <textarea
                  rows={3}
                  placeholder="Petunjuk pengerjaan tugas atau rangkuman materi..."
                  className="w-full text-xs font-medium p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1967D2]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1967D2] text-white text-xs font-bold hover:bg-blue-600 cursor-pointer"
                >
                  Terbitkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
}

// Simple Repeat/Repost icon helper
function RepeatIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m17 2 4 4-4 4" />
      <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
      <path d="m7 22-4-4 4-4" />
      <path d="M21 13v1a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

// Authentic Google Classroom empty state graphics matching Screenshots 2, 3, 4
function ClassworkEmptyGraphic() {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center select-none animate-in fade-in duration-150">
      <svg width="220" height="150" viewBox="0 0 220 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="max-w-full">
        {/* Books stack */}
        <rect x="50" y="115" width="100" height="14" rx="2" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />
        <rect x="42" y="129" width="120" height="15" rx="2" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="2" />
        {/* Laptop */}
        <rect x="52" y="65" width="85" height="52" rx="4" fill="#FFFFFF" stroke="#64748B" strokeWidth="2.5" />
        <line x1="50" y1="117" x2="139" y2="117" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
        {/* Cute dog/animal character looking at screen */}
        <path d="M142 80 C140 68 152 58 162 64 C167 56 179 60 178 70 C186 72 189 82 184 89 C190 95 186 108 175 110 C165 112 142 110 142 98 Z" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2.5" />
        {/* Ears */}
        <polygon points="144,65 150,50 156,62" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="2" />
        <polygon points="168,62 176,52 179,66" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="2" />
        {/* Eyes & nose */}
        <circle cx="156" cy="74" r="2" fill="#475569" />
        <circle cx="168" cy="74" r="2" fill="#475569" />
        <ellipse cx="162" cy="80" rx="3" ry="2" fill="#475569" />
        {/* Coffee mug */}
        <rect x="130" y="96" width="12" height="16" rx="2" fill="#93C5FD" stroke="#3B82F6" strokeWidth="1.5" />
        {/* Tail */}
        <path d="M182 98 Q196 95 198 106 Q194 112 184 108" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="2" />
      </svg>
      <h3 className="mt-4 text-base font-bold text-slate-800">This is where you&apos;ll assign work</h3>
      <p className="mt-1 text-xs text-slate-500 max-w-sm">
        You can add assignments and other work for the class, then organize it into topics
      </p>
    </div>
  );
}

function PeopleEmptyGraphic({ onInvite }: { onInvite?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center select-none animate-in fade-in duration-150">
      <svg width="220" height="150" viewBox="0 0 220 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="max-w-full">
        {/* Notebook pages */}
        <path d="M50 110 L140 85 L160 115 L70 140 Z" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />
        <path d="M52 118 L142 93 L162 123 L72 148 Z" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="2" />
        {/* Sleeping Cat / mouse */}
        <path d="M78 95 C68 85 75 68 90 68 C100 68 105 74 110 74 C116 74 122 68 132 72 C140 76 142 88 138 98 C132 108 100 110 88 106 Z" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2.5" />
        {/* Ears */}
        <polygon points="80,72 85,60 92,70" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />
        <polygon points="122,70 128,58 134,70" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />
        {/* Closed Eyes */}
        <path d="M88 80 Q92 84 96 80" stroke="#64748B" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M118 80 Q122 84 126 80" stroke="#64748B" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Whiskers */}
        <line x1="80" y1="83" x2="72" y2="82" stroke="#94A3B8" strokeWidth="1.5" />
        <line x1="80" y1="86" x2="73" y2="88" stroke="#94A3B8" strokeWidth="1.5" />
        {/* Tail */}
        <path d="M136 94 Q152 92 150 104 Q142 108 134 102" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2" />
        {/* Pencil in front */}
        <rect x="75" y="125" width="55" height="7" rx="2" transform="rotate(-15 75 125)" fill="#CBD5E1" stroke="#64748B" strokeWidth="1.5" />
        <polygon points="68,131 75,127 75,133" fill="#64748B" />
        {/* Leaf sprig */}
        <path d="M45 110 Q40 85 45 70" stroke="#CBD5E1" strokeWidth="2" fill="none" />
        <ellipse cx="40" cy="78" rx="6" ry="3" transform="rotate(-30 40 78)" fill="#E2E8F0" stroke="#CBD5E1" />
        <ellipse cx="46" cy="90" rx="6" ry="3" transform="rotate(30 46 90)" fill="#E2E8F0" stroke="#CBD5E1" />
      </svg>
      <h3 className="mt-4 text-base font-bold text-slate-800">Add students to this class</h3>
      <button
        type="button"
        onClick={onInvite}
        className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-[#1967D2] hover:bg-blue-50 transition border border-transparent hover:border-blue-200 cursor-pointer"
      >
        <UserPlus className="w-4 h-4" />
        <span>Invite students</span>
      </button>
    </div>
  );
}

function GradesEmptyGraphic({ onInvite }: { onInvite?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center select-none animate-in fade-in duration-150">
      <svg width="220" height="170" viewBox="0 0 220 170" fill="none" xmlns="http://www.w3.org/2000/svg" className="max-w-full">
        {/* Fishbowl Glass */}
        <path d="M70 45 C50 70 50 115 80 135 C95 145 125 145 140 135 C170 115 170 70 150 45 Z" fill="#F8FAFC" stroke="#64748B" strokeWidth="2.5" />
        <ellipse cx="110" cy="45" rx="40" ry="10" fill="#FFFFFF" stroke="#64748B" strokeWidth="2.5" />
        {/* Water Level */}
        <path d="M60 90 Q85 85 110 90 Q135 95 160 90 C165 105 160 125 140 135 C125 145 95 145 80 135 C65 125 58 105 60 90 Z" fill="#E2E8F0" opacity="0.6" />
        {/* Calculator inside bowl */}
        <rect x="78" y="70" width="34" height="48" rx="4" fill="#FFFFFF" stroke="#475569" strokeWidth="2" />
        <rect x="83" y="75" width="24" height="10" rx="1.5" fill="#CBD5E1" stroke="#475569" strokeWidth="1" />
        {/* Calculator keypad dots */}
        <circle cx="87" cy="92" r="2" fill="#64748B" />
        <circle cx="95" cy="92" r="2" fill="#64748B" />
        <circle cx="103" cy="92" r="2" fill="#64748B" />
        <circle cx="87" cy="100" r="2" fill="#64748B" />
        <circle cx="95" cy="100" r="2" fill="#64748B" />
        <circle cx="103" cy="100" r="2" fill="#64748B" />
        <circle cx="87" cy="108" r="2" fill="#64748B" />
        <circle cx="95" cy="108" r="2" fill="#64748B" />
        <circle cx="103" cy="108" r="2" fill="#64748B" />
        {/* Cute Fish */}
        <path d="M125 96 C135 92 142 96 145 99 L152 94 L150 102 L152 110 L145 105 C142 108 135 112 125 108 C120 104 120 100 125 96 Z" fill="#CBD5E1" stroke="#64748B" strokeWidth="1.5" />
        <circle cx="130" cy="100" r="1" fill="#1E293B" />
        {/* Seaweed / Plant */}
        <path d="M148 135 Q145 115 150 100 Q155 85 152 75" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M150 100 Q158 95 162 98" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M148 115 Q140 110 138 114" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        {/* Bubbles */}
        <circle cx="118" cy="80" r="2.5" fill="none" stroke="#94A3B8" strokeWidth="1.2" />
        <circle cx="123" cy="70" r="3.5" fill="none" stroke="#94A3B8" strokeWidth="1.2" />
        <circle cx="120" cy="60" r="2" fill="none" stroke="#94A3B8" strokeWidth="1.2" />
      </svg>
      <h3 className="mt-4 text-base font-bold text-slate-800">This is where you&apos;ll view and manage grades</h3>
      <button
        type="button"
        onClick={onInvite}
        className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-[#1967D2] hover:bg-blue-50 transition border border-transparent hover:border-blue-200 cursor-pointer"
      >
        <UserPlus className="w-4 h-4" />
        <span>Invite students</span>
      </button>
    </div>
  );
}
