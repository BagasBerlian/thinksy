"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MoreVertical,
  Pin,
  ArrowUpToLine,
  Edit2,
  Trash2,
  Copy,
  Send,
  ExternalLink,
  Play,
  FileText,
  Triangle,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  StreamAnnouncement,
  AnnouncementComment,
  FormattedAnnouncementText,
} from "@/lib/announcement-format";

function MessageSquareIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

interface ClassAnnouncementCardProps {
  post: StreamAnnouncement;
  currentUserName: string;
  currentUserRole: "Guru" | "Siswa";
  isTeacher?: boolean;
  onMoveToTop?: (postId: string) => void;
  onPin?: (postId: string) => void;
  onEdit?: (post: StreamAnnouncement) => void;
  onDelete?: (postId: string) => void;
  onAddComment?: (postId: string, text: string) => void;
  onShowToast?: (message: string) => void;
}

export default function ClassAnnouncementCard({
  post,
  currentUserName,
  currentUserRole,
  isTeacher = false,
  onMoveToTop,
  onPin,
  onEdit,
  onDelete,
  onAddComment,
  onShowToast,
}: ClassAnnouncementCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close kebab menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const handleCopyLink = () => {
    setIsMenuOpen(false);
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}${window.location.pathname}#post-${post.id}`;
      navigator.clipboard?.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      if (onShowToast) {
        onShowToast("Tautan ke pengumuman berhasil disalin!");
      }
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    if (onAddComment) {
      onAddComment(post.id, commentInput.trim());
      setShowComments(true); // Automatically expand comments when a new one is added
    }
    setCommentInput("");
    setIsSubmittingComment(false);
  };

  return (
    <div
      id={`post-${post.id}`}
      className={`bg-white rounded-2xl sm:rounded-3xl border transition-all duration-200 p-5 sm:p-6 space-y-4 shadow-2xs hover:shadow-xs relative ${
        post.isPinned
          ? "border-blue-300 ring-1 ring-blue-100 bg-gradient-to-b from-blue-50/20 to-white"
          : "border-slate-200/90"
      }`}
    >
      {/* CARD HEADER (Matches Screenshot 1 & 3) */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Circular Avatar with Initial Letter */}
          <div
            className={`w-10 h-10 rounded-full ${
              post.authorAvatarColor || "bg-[#1a73e8]"
            } text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs select-none`}
          >
            {post.authorAvatarText || post.authorName?.charAt(0) || "S"}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-slate-900 truncate">
                {post.authorName}
              </span>
              {post.isPinned && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200 shrink-0">
                  <Pin className="w-2.5 h-2.5 fill-blue-700 text-blue-700" />
                  <span>Disematkan</span>
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              {post.timeAgo}
            </div>
          </div>
        </div>

        {/* THREE DOTS MENU (Matches Screenshot 1 & 3) */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Opsi pengumuman"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition active:scale-95 cursor-pointer"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {/* DROPDOWN MENU (Matches Screenshot 3) */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-1 w-44 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150 text-slate-800 select-none">
              {/* Move to top */}
              {onMoveToTop && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onMoveToTop(post.id);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-slate-100 flex items-center gap-2.5 transition text-slate-700 hover:text-slate-900 cursor-pointer"
                >
                  <ArrowUpToLine className="w-4 h-4 text-slate-400" />
                  <span>Move to top</span>
                </button>
              )}

              {/* Pin / Unpin */}
              {onPin && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onPin(post.id);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-slate-100 flex items-center gap-2.5 transition text-slate-700 hover:text-slate-900 cursor-pointer"
                >
                  <Pin
                    className={`w-4 h-4 ${
                      post.isPinned ? "fill-blue-600 text-blue-600" : "text-slate-400"
                    }`}
                  />
                  <span>{post.isPinned ? "Unpin post" : "Pin to top"}</span>
                </button>
              )}

              {/* Edit (for Teacher or Author) */}
              {onEdit && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onEdit(post);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-slate-100 flex items-center gap-2.5 transition text-slate-700 hover:text-slate-900 cursor-pointer"
                >
                  <Edit2 className="w-4 h-4 text-slate-400" />
                  <span>Edit</span>
                </button>
              )}

              {/* Delete (for Teacher or Author) */}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onDelete(post.id);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-rose-50 flex items-center gap-2.5 transition text-rose-600 hover:text-rose-700 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-rose-500" />
                  <span>Delete</span>
                </button>
              )}

              {/* Copy link (Available to everyone) */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-slate-100 flex items-center gap-2.5 transition text-slate-700 hover:text-slate-900 cursor-pointer"
              >
                {isCopied ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4 text-slate-400" />
                )}
                <span>{isCopied ? "Link copied!" : "Copy link"}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CARD BODY CONTENT (Formatted: Bold, Italic, Underline, Bullet Lists) */}
      <div className="text-slate-800 text-sm font-normal leading-relaxed">
        <FormattedAnnouncementText text={post.text} />
      </div>

      {/* ATTACHMENTS PREVIEW (Drive, YouTube, File, Link) */}
      {post.attachments && post.attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {post.attachments.map((att, idx) => (
            <a
              key={idx}
              href={att.url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-xs font-medium text-slate-700 hover:text-blue-700 transition"
            >
              {att.type === "youtube" ? (
                <Play className="w-3.5 h-3.5 text-red-600 fill-red-600" />
              ) : att.type === "drive" ? (
                <Triangle className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
              ) : att.type === "file" ? (
                <FileText className="w-3.5 h-3.5 text-blue-600" />
              ) : (
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span className="truncate max-w-[200px]">{att.title}</span>
            </a>
          ))}
        </div>
      )}

      {/* EXISTING CLASS COMMENTS LIST (Hidden by default, shown when clicked) */}
      {post.comments && post.comments.length > 0 && (
        <div className="pt-3 border-t border-slate-100 space-y-2.5">
          <button
            type="button"
            onClick={() => setShowComments((prev) => !prev)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 py-1.5 px-3 rounded-full hover:bg-slate-100 border border-slate-200/80 transition cursor-pointer select-none group"
          >
            <MessageSquareIcon className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition" />
            <span>
              {showComments
                ? `Sembunyikan komentar (${post.comments.length})`
                : `Lihat ${post.comments.length} komentar kelas`}
            </span>
            {showComments ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition" />
            )}
          </button>

          {showComments && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200 pt-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                {post.comments.length} Komentar Kelas
              </div>
              <div className="space-y-2">
                {post.comments.map((cm) => (
                  <div
                    key={cm.id}
                    className="flex items-start gap-2.5 bg-slate-50/80 p-2.5 sm:p-3 rounded-2xl border border-slate-100"
                  >
                    <div
                      className={`w-7 h-7 rounded-full ${
                        cm.avatarColor ||
                        (cm.authorRole === "Guru" ? "bg-[#1a73e8]" : "bg-purple-600")
                      } text-white flex items-center justify-center text-[10px] font-bold shrink-0 shadow-2xs select-none`}
                    >
                      {cm.avatarText || cm.authorName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-800">
                          {cm.authorName}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                            cm.authorRole === "Guru"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {cm.authorRole}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          • {cm.timeAgo}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed mt-0.5 whitespace-pre-wrap">
                        {cm.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ADD CLASS COMMENT INPUT PILL (Matches Screenshot 1) */}
      <div className="pt-2 border-t border-slate-100">
        <form
          onSubmit={handleCommentSubmit}
          className="relative flex items-center rounded-full bg-slate-50 border border-slate-200 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/15 px-4 py-2 transition"
        >
          <input
            type="text"
            placeholder="Add class comment..."
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            className="w-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none pr-8"
          />
          <button
            type="submit"
            disabled={!commentInput.trim() || isSubmittingComment}
            aria-label="Kirim komentar"
            className="absolute right-2.5 w-7 h-7 rounded-full flex items-center justify-center text-[#1967D2] hover:bg-blue-50 disabled:opacity-30 disabled:hover:bg-transparent transition active:scale-95 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
