"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { AlertCircle, Bell, ChevronDown, Clock, LogOut, Shield, UserCircle } from "lucide-react";
import { usePathname } from "next/navigation";

import { logoutAction } from "@/actions/auth";

const pageTitles: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/arsip": "Arsip",
  "/admin/arsip/akhir-retensi": "Arsip Akhir Retensi",
  "/admin/arsip/tempat-sampah": "Arsip Akhir Retensi",
  "/admin/kategori": "Kategori",
  "/admin/master-data": "Master Data",
  "/admin/master-data/kode-klasifikasi": "Kode Klasifikasi",
  "/admin/master-data/jadwal-retensi": "Jadwal Retensi",
  "/admin/master-data/divisi": "Divisi",
  "/admin/master-data/lokasi-penyimpanan": "Lokasi Penyimpanan",
  "/admin/pengguna": "Pengguna",
  "/admin/pengaturan": "Pengaturan",
};

export type HeaderUser = {
  name: string;
  role: string;
  username?: string;
};

export type HeaderNotificationItem = {
  id: string;
  nomor_arsip: string;
  nama_arsip: string;
  kode_klasifikasi: string;
  keterangan_akhir: string;
  tanggal_selesai_inaktif: string;
};

export default function Header({
  user,
  retentionNotifications = [],
}: {
  user?: HeaderUser;
  retentionNotifications?: HeaderNotificationItem[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setIsOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setIsNotifOpen(false);
      }
    };
    if (isOpen || isNotifOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, isNotifOpen]);

  const pageTitle = pathname === "/admin/kategori/tambah"
    ? "Tambah Kategori"
    : pathname.startsWith("/admin/kategori/")
      ? "Edit Kategori"
    : pathname === "/admin/arsip/tambah"
      ? "Tambah Arsip"
    : pathname.endsWith("/file")
      ? "Preview Dokumen"
    : pathname.endsWith("/edit")
      ? "Edit Arsip"
    : pathname.startsWith("/admin/arsip/")
      ? "Detail Arsip"
      : pageTitles[pathname] ?? "SIMARS";

  const displayName = user?.name || "Admin";
  const displayRole = user?.role || "Administrator";

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-border/80 bg-background/85 px-6 backdrop-blur-xl lg:px-8">
      {/* Judul halaman */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">SIMARS / ADMIN</p>
        <h2 className="mt-1 text-xl font-bold tracking-tight">{pageTitle}</h2>
      </div>

      {/* Bagian kanan */}
      <div className="flex items-center gap-3">
        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setIsNotifOpen((prev) => !prev)}
            className="relative rounded-xl border border-border/80 bg-card p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-primary cursor-pointer"
            aria-label="Notifikasi"
            aria-expanded={isNotifOpen}
          >
            <Bell className="h-4 w-4" />
            {retentionNotifications.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white ring-2 ring-background animate-pulse">
                {retentionNotifications.length}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-border/80 bg-card p-3 shadow-xl z-50 animate-in fade-in-0 zoom-in-95">
              <div className="flex items-center justify-between border-b border-border/60 pb-2.5 px-1">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <p className="font-semibold text-sm text-foreground">Notifikasi Retensi</p>
                </div>
                {retentionNotifications.length > 0 && (
                  <span className="rounded-full bg-rose-100 dark:bg-rose-950/50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 dark:text-rose-400">
                    {retentionNotifications.length} arsip
                  </span>
                )}
              </div>

              <div className="mt-2 max-h-72 overflow-y-auto space-y-2 py-1">
                {retentionNotifications.length > 0 ? (
                  retentionNotifications.map((notif) => (
                    <Link
                      key={notif.id}
                      href={`/admin/arsip/${notif.id}`}
                      onClick={() => setIsNotifOpen(false)}
                      className="block rounded-xl border border-border/60 bg-muted/30 p-2.5 transition-colors hover:bg-muted/70 hover:border-primary/40"
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <p className="font-bold text-xs text-primary truncate">{notif.nomor_arsip}</p>
                        <span className="rounded-sm border bg-background px-1.5 py-0.2 text-[10px] font-mono font-bold text-muted-foreground">
                          {notif.kode_klasifikasi}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-medium text-foreground line-clamp-1">{notif.nama_arsip}</p>
                      <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="text-amber-700 dark:text-amber-400 font-medium">
                          Perlu Peninjauan
                        </span>
                        <span>Berakhir {notif.tanggal_selesai_inaktif}</span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-muted-foreground">
                    <p className="font-medium text-foreground">Semua arsip aman</p>
                    <p className="mt-0.5">Tidak ada arsip yang melewati masa retensi saat ini.</p>
                  </div>
                )}
              </div>

              {retentionNotifications.length > 0 && (
                <div className="border-t border-border/60 pt-2 text-center">
                  <Link
                    href="/admin/arsip?retensi=perlu_tindakan"
                    onClick={() => setIsNotifOpen(false)}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Lihat Semua Arsip Perlu Tindakan →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Menu Dropdown */}
        <div className="relative z-50" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-xl border border-border/80 bg-card py-1.5 pl-2 pr-2.5 shadow-xs transition-colors hover:bg-muted/50 cursor-pointer"
            aria-expanded={isOpen}
            aria-haspopup="menu"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UserCircle className="h-5 w-5" />
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium leading-none truncate max-w-[120px]">{displayName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{displayRole}</p>
            </div>
            <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
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
