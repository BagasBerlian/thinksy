import React from "react";

export interface AnnouncementComment {
  id: string;
  authorName: string;
  authorRole: string; // "Guru" | "Siswa"
  text: string;
  timeAgo: string;
  avatarText?: string;
  avatarColor?: string;
}

export interface AnnouncementAttachment {
  type: "drive" | "youtube" | "file" | "link";
  title: string;
  url: string;
}

export interface StreamAnnouncement {
  id: string;
  authorName: string;
  authorAvatarText: string;
  authorAvatarColor: string;
  timeAgo: string;
  text: string;
  subjectTag?: string;
  className?: string;
  isPinned?: boolean;
  attachments?: AnnouncementAttachment[];
  comments: AnnouncementComment[];
  createdAt?: string;
}

export const DEFAULT_ANNOUNCEMENTS: StreamAnnouncement[] = [
  {
    id: "post-1",
    authorName: "Ibu Siti Rahmawati, M.Pd.",
    authorAvatarText: "S",
    authorAvatarColor: "bg-[#1a73e8]",
    timeAgo: "Kemarin, 09:15",
    text: "Selamat pagi anak-anak! Materi **Bab 1 Bilangan Berpangkat** dan **Bab 2 Teorema Pythagoras** sudah dibuka. Jangan lupa cek latihan mandiri dan diskusikan soal sulit dengan AI Tutor Sokratik.",
    subjectTag: "mat-8",
    className: "Kelas 8-A (Matematika)",
    isPinned: true,
    comments: [
      {
        id: "c-101",
        authorName: "Ahmad Raihan (8A)",
        authorRole: "Siswa",
        text: "Siap Bu! Soal latihan Bab 1 sudah saya kerjakan sampai tuntas.",
        timeAgo: "Kemarin, 10:05",
      },
      {
        id: "c-102",
        authorName: "Devida Amanda (8A)",
        authorRole: "Siswa",
        text: "Terima kasih Ibu Siti, materi Pythagoras sangat jelas penjelasannya.",
        timeAgo: "Kemarin, 11:20",
      },
    ],
  },
  {
    id: "post-2",
    authorName: "Ibu Siti Rahmawati, M.Pd.",
    authorAvatarText: "S",
    authorAvatarColor: "bg-[#1a73e8]",
    timeAgo: "2:22 PM",
    text: "halo guys kerjakan tugasnya",
    subjectTag: "mat-8",
    className: "Kelas 8-A (Matematika)",
    isPinned: false,
    comments: [
      {
        id: "c-201",
        authorName: "Ahmad Raihan (8A)",
        authorRole: "Siswa",
        text: "Siap Bu, sedang proses pengerjaan kuis dan latihan codingnya!",
        timeAgo: "2:25 PM",
      },
    ],
  },
  {
    id: "post-3",
    authorName: "Dra. Nurul Hidayah",
    authorAvatarText: "N",
    authorAvatarColor: "bg-emerald-600",
    timeAgo: "3 hari yang lalu",
    text: "Pengumpulan draf Laporan Hasil Observasi (LHO) lingkungan sekolah dibuka sampai hari Jumat. Pastikan menyertakan foto hasil pengamatan ya.",
    subjectTag: "indo-8",
    className: "Kelas 8-A (Bahasa Indonesia)",
    isPinned: false,
    comments: [],
  },
];

/**
 * Apply markdown formatting (bold, italic, underline, bullet, clear) to selected text in textarea
 */
export function applyFormatToText(
  currentText: string,
  start: number,
  end: number,
  formatType: "bold" | "italic" | "underline" | "bullet" | "clear"
): { newText: string; newStart: number; newEnd: number } {
  const selectedText = currentText.substring(start, end);
  const before = currentText.substring(0, start);
  const after = currentText.substring(end);

  if (formatType === "bold") {
    if (!selectedText) {
      const placeholder = "Teks Tebal";
      return {
        newText: before + `**${placeholder}**` + after,
        newStart: start + 2,
        newEnd: start + 2 + placeholder.length,
      };
    }
    // Toggle bold if already bold
    if (selectedText.startsWith("**") && selectedText.endsWith("**") && selectedText.length >= 4) {
      const unbolded = selectedText.slice(2, -2);
      return {
        newText: before + unbolded + after,
        newStart: start,
        newEnd: start + unbolded.length,
      };
    }
    const bolded = `**${selectedText}**`;
    return {
      newText: before + bolded + after,
      newStart: start,
      newEnd: start + bolded.length,
    };
  }

  if (formatType === "italic") {
    if (!selectedText) {
      const placeholder = "Teks Miring";
      return {
        newText: before + `*${placeholder}*` + after,
        newStart: start + 1,
        newEnd: start + 1 + placeholder.length,
      };
    }
    if (selectedText.startsWith("*") && selectedText.endsWith("*") && selectedText.length >= 2) {
      const unitalic = selectedText.slice(1, -1);
      return {
        newText: before + unitalic + after,
        newStart: start,
        newEnd: start + unitalic.length,
      };
    }
    const italicized = `*${selectedText}*`;
    return {
      newText: before + italicized + after,
      newStart: start,
      newEnd: start + italicized.length,
    };
  }

  if (formatType === "underline") {
    if (!selectedText) {
      const placeholder = "Teks Garis Bawah";
      return {
        newText: before + `<u>${placeholder}</u>` + after,
        newStart: start + 3,
        newEnd: start + 3 + placeholder.length,
      };
    }
    if (selectedText.startsWith("<u>") && selectedText.endsWith("</u>") && selectedText.length >= 7) {
      const unline = selectedText.slice(3, -4);
      return {
        newText: before + unline + after,
        newStart: start,
        newEnd: start + unline.length,
      };
    }
    const underlined = `<u>${selectedText}</u>`;
    return {
      newText: before + underlined + after,
      newStart: start,
      newEnd: start + underlined.length,
    };
  }

  if (formatType === "bullet") {
    if (!selectedText) {
      const bulletText = "\n• Item daftar";
      return {
        newText: before + bulletText + after,
        newStart: start + bulletText.length,
        newEnd: start + bulletText.length,
      };
    }
    const lines = selectedText.split("\n");
    const bulletedLines = lines.map((l) => (l.startsWith("• ") ? l.replace(/^•\s*/, "") : `• ${l}`));
    const joined = bulletedLines.join("\n");
    return {
      newText: before + joined + after,
      newStart: start,
      newEnd: start + joined.length,
    };
  }

  if (formatType === "clear") {
    const target = selectedText || currentText;
    const cleaned = target
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/<u>(.*?)<\/u>/gi, "$1")
      .replace(/^[•\-]\s*/gm, "");

    if (selectedText) {
      return {
        newText: before + cleaned + after,
        newStart: start,
        newEnd: start + cleaned.length,
      };
    }
    return {
      newText: cleaned,
      newStart: 0,
      newEnd: cleaned.length,
    };
  }

  return { newText: currentText, newStart: start, newEnd: end };
}

/**
 * Renders formatted announcement text supporting **bold**, *italic*, <u>underline</u>, and bullet lists
 */
export function FormattedAnnouncementText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  if (!text) return null;

  // Split lines to detect bullet list items
  const lines = text.split("\n");

  return (
    <div className={`space-y-1.5 leading-relaxed ${className}`}>
      {lines.map((line, lineIdx) => {
        const isBullet = line.trim().startsWith("•") || line.trim().startsWith("- ");
        const content = isBullet ? line.trim().replace(/^[•\-]\s*/, "") : line;

        // Parse inline formatting: **bold**, *italic*, <u>underline</u>
        const parsedElements = parseInlineFormatting(content);

        if (isBullet) {
          return (
            <div key={lineIdx} className="flex items-start gap-2 pl-2">
              <span className="text-[#1a73e8] font-bold text-sm select-none">•</span>
              <span className="flex-1">{parsedElements}</span>
            </div>
          );
        }

        return (
          <p key={lineIdx} className={line.trim() === "" ? "h-3" : "min-h-[1.25rem]"}>
            {parsedElements}
          </p>
        );
      })}
    </div>
  );
}

function parseInlineFormatting(str: string): React.ReactNode[] {
  if (!str) return [""];

  // Combined regex to catch **bold**, <u>underline</u>, *italic*
  const regex = /(\*\*.*?\*\*|<u>.*?<\/u>|\*.*?\*)/g;
  const parts = str.split(regex);

  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      return (
        <strong key={idx} className="font-bold text-slate-950">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (
      part.toLowerCase().startsWith("<u>") &&
      part.toLowerCase().endsWith("</u>") &&
      part.length >= 7
    ) {
      return (
        <u key={idx} className="underline decoration-slate-800 underline-offset-2">
          {part.slice(3, -4)}
        </u>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
      return (
        <em key={idx} className="italic text-slate-800">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}
