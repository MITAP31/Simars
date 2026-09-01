"use client";

import { Bell, ChevronDown, UserCircle } from "lucide-react";
import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/user/dashboard": "Dashboard",
  "/user/pengajuan": "Pengajuan Arsip",
  "/user/riwayat": "Riwayat Pengajuan",
  "/user/profil": "Profil",
};

export default function UserHeader() {
  const pathname = usePathname();
  const pageTitle = pageTitles[pathname] ?? "SIMARS";

  return (
    <header className="flex h-20 items-center justify-between border-b border-border/80 bg-background/85 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary">SIMARS / User</p>
        <h2 className="text-lg font-semibold">{pageTitle}</h2>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="relative rounded-xl border border-border/80 bg-card p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
          aria-label="Notifikasi"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary ring-2 ring-card" />
        </button>

        <div className="flex items-center gap-2 rounded-xl border border-border/80 bg-card px-2 py-1.5 shadow-sm">
          <UserCircle className="h-7 w-7 text-primary" />

          <div className="hidden sm:block">
            <p className="text-sm font-medium">User</p>
            <p className="text-xs text-muted-foreground">
              Pengguna
            </p>
          </div>
          <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
        </div>
      </div>
    </header>
  );
}
