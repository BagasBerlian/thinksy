"use client";

import React from "react";

interface FormattedNotesViewProps {
  content?: string | null;
  className?: string;
  emptyPlaceholder?: string;
}

/**
 * Tokenizes and renders notes text safely without dangerouslySetInnerHTML.
 * Supports:
 * - **bold** -> <strong>
 * - *italic* -> <em>
 * - <u>underline</u> -> <span className="underline">
 * - • or - at line start -> bulleted list item
 * - [Tag] at line start -> pill badge
 */
export function FormattedNotesView({
  content,
  className = "",
  emptyPlaceholder = "Belum ada catatan materi tambahan.",
}: FormattedNotesViewProps) {
  if (!content || !content.trim()) {
    return (
      <span className="text-slate-400 italic text-xs">
        {emptyPlaceholder}
      </span>
    );
  }

  const lines = content.split("\n");

  return (
    <div className={`space-y-1.5 leading-relaxed text-xs sm:text-[13px] ${className}`}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Empty line spacer
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // Bullet line
        const isBullet = trimmed.startsWith("• ") || trimmed.startsWith("- ");
        if (isBullet) {
          const textAfterBullet = trimmed.replace(/^[•\-]\s*/, "");
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 my-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
              <div className="flex-1 text-slate-700">
                {renderInlineTokens(textAfterBullet)}
              </div>
            </div>
          );
        }

        // Tag line e.g. [Materi]: ...
        const tagMatch = trimmed.match(/^\[(.*?)\]\s*(.*)$/);
        if (tagMatch) {
          const tagLabel = tagMatch[1];
          const rest = tagMatch[2];
          return (
            <div key={idx} className="flex flex-wrap items-center gap-1.5 my-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 uppercase tracking-wide">
                {tagLabel}
              </span>
              <div className="flex-1 text-slate-800">
                {renderInlineTokens(rest)}
              </div>
            </div>
          );
        }

        // Regular line
        return (
          <div key={idx} className="text-slate-700">
            {renderInlineTokens(line)}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Parses inline formatting:
 * **bold**, *italic*, <u>underline</u>
 */
function renderInlineTokens(text: string): React.ReactNode[] {
  // Regex captures **...**, *...*, <u>...</u>
  const regex = /(\*\*.*?\*\*|\*.*?\*|<u>.*?<\/u>)/g;
  const parts = text.split(regex);

  return parts.map((part, i) => {
    if (!part) return null;

    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      return (
        <strong key={i} className="font-bold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
      return (
        <em key={i} className="italic text-slate-800">
          {part.slice(1, -1)}
        </em>
      );
    }

    if (part.startsWith("<u>") && part.endsWith("</u>") && part.length >= 7) {
      return (
        <span
          key={i}
          className="underline underline-offset-2 decoration-blue-500 decoration-1.5 font-medium text-slate-900"
        >
          {part.slice(3, -4)}
        </span>
      );
    }

    return part;
  });
}
