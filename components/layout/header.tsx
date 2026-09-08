"use client";

import { Bell, ChevronDown, UserCircle } from "lucide-react";
import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/arsip": "Arsip",
  "/admin/kategori": "Kategori",
  "/admin/pengguna": "Pengguna",
  "/admin/pengaturan": "Pengaturan",
};

export default function Header() {
  const pathname = usePathname();

  const pageTitle = pathname === "/admin/kategori/tambah"
    ? "Tambah Kategori"
    : pathname.startsWith("/admin/kategori/")
      ? "Edit Kategori"
    : pathname === "/admin/arsip/tambah"
      ? "Tambah Arsip"
      : pathname.startsWith("/admin/arsip/")
        ? "Detail Arsip"
        : pageTitles[pathname] ?? "SIMARS";

  return (
    <header className="flex h-20 items-center justify-between border-b border-border/80 bg-background/85 px-6 backdrop-blur-xl lg:px-8">
      {/* Judul halaman */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">SIMARS / ADMIN</p>
        <h2 className="mt-1 text-xl font-bold tracking-tight">{pageTitle}</h2>
      </div>

      {/* Bagian kanan */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="relative rounded-xl border border-border/80 bg-card p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
          aria-label="Notifikasi"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary ring-2 ring-card" />
        </button>

        <div className="flex items-center gap-2 rounded-xl border border-border/80 bg-card py-1.5 pl-2 pr-2.5 shadow-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><UserCircle className="h-5 w-5" /></div>

          <div className="hidden sm:block">
            <p className="text-sm font-medium">Admin</p>

            <p className="text-xs text-muted-foreground">
              Administrator
            </p>
          </div>
          <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
        </div>
      </div>
    </header>
  );
}
