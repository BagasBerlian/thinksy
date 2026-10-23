import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://thinksy.id"),
  title: "THINKSY - LMS Matematika SMP Kelas 8 Kurikulum Merdeka",
  description:
    "Platform pendamping belajar mandiri Matematika Fase D SMP Kelas 8 berbasis AI Sokratik, materi terstandar, dan ujian terpadu.",
  keywords: [
    "THINKSY",
    "Matematika SMP Kelas 8",
    "Kurikulum Merdeka",
    "Fase D Matematika",
    "LMS Sekolah",
    "AI Sokratik",
    "Ujian Online",
  ],
  authors: [{ name: "THINKSY Team" }],
  openGraph: {
    title: "THINKSY - Belajar Matematika SMP Kelas 8 Fase D",
    description:
      "Platform belajar mandiri Matematika SMP Kelas 8 dengan AI Sokratik, asesmen interaktif, dan pemantauan guru secara realtime.",
    siteName: "THINKSY",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "THINKSY Logo",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icon.png",
  },
};

import DemoRoleSwitcher from "@/components/demo/DemoRoleSwitcher";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <DemoRoleSwitcher />
      </body>
    </html>
  );
}
