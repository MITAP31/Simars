"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, ChevronDown, LogOut, Shield, UserCircle } from "lucide-react";
import { usePathname } from "next/navigation";

import { logoutAction } from "@/actions/auth";

const pageTitles: Record<string, string> = {
  "/user/dashboard": "Dashboard",
  "/user/pengajuan": "Pengajuan Arsip",
  "/user/riwayat": "Riwayat Pengajuan",
  "/user/profil": "Profil",
};

export type UserHeaderProps = {
  name: string;
  role: string;
  username?: string;
};

export default function UserHeader({ user }: { user?: UserHeaderProps }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  const pageTitle = pageTitles[pathname] ?? "SIMARS";
  const displayName = user?.name || "User";
  const displayRole = user?.role || "Pengguna";

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-border/80 bg-background/85 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
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

        {/* User Menu Dropdown */}
        <div className="relative z-50" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-xl border border-border/80 bg-card px-2 py-1.5 shadow-xs hover:bg-muted/50 transition-colors cursor-pointer"
            aria-expanded={isOpen}
            aria-haspopup="menu"
          >
            <UserCircle className="h-7 w-7 text-primary" />

            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium leading-none truncate max-w-[120px]">{displayName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {displayRole}
              </p>
            </div>
            <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-border/80 bg-card p-2 shadow-xl z-50 animate-in fade-in-0 zoom-in-95">
              <div className="border-b border-border/60 px-3 py-2.5">
                <p className="font-semibold text-sm text-foreground truncate">{displayName}</p>
                {user?.username && (
                  <p className="text-xs text-muted-foreground">@{user.username}</p>
                )}
                <span className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                  <Shield className="h-3 w-3" />
                  {displayRole}
                </span>
              </div>

              <div className="p-1">
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Keluar dari Sistem
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
