"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FileUp, History, LayoutDashboard, UserCircle } from "lucide-react";

export type UserSidebarProps = {
  user?: {
    name: string;
    role: string;
    username?: string;
    divisi?: string;
  };
};

const menuItems = [
  { title: "Dashboard", href: "/user/dashboard", icon: LayoutDashboard },
  { title: "Penyerahan Arsip", href: "/user/pengajuan", icon: FileUp },
  { title: "Riwayat Penyerahan", href: "/user/riwayat", icon: History },
  { title: "Profil", href: "/user/profil", icon: UserCircle },
];

export default function UserSidebar({ user }: UserSidebarProps) {
  const pathname = usePathname();
  const displayName = user?.name || "Pengguna SIMARS";
  const displayDivisi = user?.divisi || "Pengguna Divisi";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "PS";

  return (
    <aside className="sticky top-0 z-40 flex h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-xl shadow-sky-900/10">
      <div className="flex h-20 items-center border-b border-sidebar-border px-5">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 drop-shadow-[0_4px_8px_rgba(0,0,0,0.2)]">
            <Image src="/pln-batam-mark-dark.svg" alt="Logo PLN Batam" fill sizes="40px" className="object-contain" priority />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-wide">SIMARS</h1>
            <p className="text-[11px] text-muted-foreground">PLN Batam</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-1.5 p-4">
        <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Menu utama</p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-sky-900/15"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.title}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-2.5 rounded-xl border border-sidebar-border bg-card/60 p-3 shadow-xs">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-foreground">{displayName}</p>
            <p className="truncate text-[11px] text-muted-foreground">{displayDivisi}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
