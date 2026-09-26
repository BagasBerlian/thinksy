"use client";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

interface MarkdownRendererProps {
  content: string;
  className?: string;
  isCompact?: boolean;
}

export default function MarkdownRenderer({
  content,
  className,
  isCompact = false,
}: MarkdownRendererProps) {
  return (
    <div
      className={`prose prose-slate max-w-none text-inherit font-sans ${
        isCompact
          ? "space-y-2 text-xs sm:text-sm leading-relaxed"
          : "space-y-4 text-sm sm:text-base leading-relaxed"
      } ${className || ""}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ node, ...props }) => (
            <h1
              className={
                isCompact
                  ? "text-base font-extrabold text-inherit mt-3 mb-1.5 border-b border-black/10 dark:border-white/10 pb-1"
                  : "text-xl sm:text-2xl font-black text-inherit tracking-tight mt-6 mb-3 pb-2 border-b border-black/10 dark:border-white/10"
              }
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className={
                isCompact
                  ? "text-sm font-bold text-inherit mt-2.5 mb-1 flex items-center gap-1.5"
                  : "text-lg sm:text-xl font-extrabold text-inherit tracking-tight mt-6 mb-3 flex items-center gap-2"
              }
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              className={
                isCompact
                  ? "text-xs sm:text-sm font-bold text-inherit mt-2 mb-1"
                  : "text-base sm:text-lg font-bold text-inherit mt-4 mb-2"
              }
              {...props}
            />
          ),
          h4: ({ node, ...props }) => (
            <h4
              className={
                isCompact
                  ? "text-xs font-bold text-inherit mt-1.5 mb-0.5"
                  : "text-sm sm:text-base font-bold text-inherit mt-3 mb-1"
              }
              {...props}
            />
          ),
          p: ({ node, ...props }) => (
            <p
              className={
                isCompact
                  ? "leading-relaxed text-inherit/90 mb-2 last:mb-0"
                  : "leading-relaxed sm:leading-loose text-inherit/90 mb-3"
              }
              {...props}
            />
          ),
          ul: ({ node, ...props }) => (
            <ul
              className={
                isCompact
                  ? "list-disc list-inside space-y-1 my-2 pl-2 text-inherit/90"
                  : "list-disc list-inside space-y-1.5 my-3 pl-2 text-inherit/90"
              }
              {...props}
            />
          ),
          ol: ({ node, ...props }) => (
            <ol
              className={
                isCompact
                  ? "list-decimal list-inside space-y-1 my-2 pl-2 text-inherit/90"
                  : "list-decimal list-inside space-y-1.5 my-3 pl-2 text-inherit/90"
              }
              {...props}
            />
          ),
          li: ({ node, ...props }) => (
            <li className={isCompact ? "leading-relaxed" : "leading-relaxed"} {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className={
                isCompact
                  ? "p-3 my-2.5 rounded-xl bg-amber-500/10 border-l-3 border-amber-500 text-inherit italic text-xs sm:text-sm"
                  : "p-4 my-4 rounded-2xl bg-amber-500/10 border-l-4 border-amber-500 text-inherit italic"
              }
              {...props}
            />
          ),
          table: ({ node, ...props }) => (
            <div
              className={`overflow-x-auto rounded-2xl border border-black/10 dark:border-white/10 ${
                isCompact ? "my-3" : "my-4"
              }`}
            >
              <table
                className={`w-full text-left border-collapse ${
                  isCompact ? "text-xs" : "text-xs sm:text-sm"
                }`}
                {...props}
              />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead
              className="bg-black/5 dark:bg-white/5 font-extrabold text-inherit border-b border-black/10 dark:border-white/10"
              {...props}
            />
          ),
          th: ({ node, ...props }) => (
            <th className={isCompact ? "p-2 font-extrabold text-inherit" : "p-3 font-extrabold text-inherit"} {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className={isCompact ? "p-2 border-t border-black/5 dark:border-white/5" : "p-3 border-t border-black/5 dark:border-white/5"} {...props} />
          ),
          code: ({ node, className, children, ...props }) => {
            const isBlock = Boolean(className);
            return isBlock ? (
              <pre
                className={
                  isCompact
                    ? "p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto my-2 border border-slate-800"
                    : "p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto my-3 border border-slate-800"
                }
              >
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            ) : (
              <code
                className={
                  isCompact
                    ? "px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400"
                    : "px-1.5 py-0.5 rounded-md bg-black/5 dark:bg-white/10 font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400"
                }
                {...props}
              >
                {children}
              </code>
            );
          },
          hr: () => (
            <hr
              className={`border-black/10 dark:border-white/10 ${
                isCompact ? "my-3" : "my-6"
              }`}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
