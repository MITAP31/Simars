import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";

import { ToastNotifications } from "@/components/ui/toast-notifications";
import { ThemeApplier } from "@/components/ui/theme-applier";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SIMARS | PLN Batam",
  description: "Sistem Informasi Manajemen Arsip PLN Batam",
  icons: {
    icon: "/pln-batam-mark.svg",
    apple: "/pln-batam-mark.svg",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await prisma.pengaturan_sistem.findUnique({ where: { id: 1 }, select: { tema: true } });
  const theme = settings?.tema ?? "terang";
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased${theme === "gelap" ? " dark" : ""}`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeApplier theme={theme} />
        {children}
        <Suspense fallback={null}>
          <ToastNotifications />
        </Suspense>
      </body>
    </html>
  );
}
