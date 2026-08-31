"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Archive,
  LayoutDashboard,
  FolderOpen,
  Users,
  Settings,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Arsip",
    href: "/arsip",
    icon: Archive,
  },
  {
    title: "Kategori",
    href: "/kategori",
    icon: FolderOpen,
  },
  {
    title: "Pengguna",
    href: "/pengguna",
    icon: Users,
  },
  {
    title: "Pengaturan",
    href: "/pengaturan",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-72 shrink-0 flex-col border-r border-white/10 bg-sidebar text-sidebar-foreground shadow-2xl shadow-blue-950/10">
      {/* Logo */}
      <div className="flex h-24 items-center border-b border-white/10 px-5">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 drop-shadow-[0_4px_8px_rgba(0,0,0,0.2)]">
            <Image src="/pln-batam-mark-dark.svg" alt="Logo PLN Batam" fill sizes="48px" className="object-contain" priority />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide">SIMARS</h1>
            <p className="text-xs text-blue-100/70">PLN Batam</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 space-y-1 px-4 py-6">
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-100/50">Menu Utama</p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${isActive ? "bg-white/15 text-white shadow-sm" : "text-blue-50/80 hover:bg-white/10 hover:text-white"}`}
            >
              <Icon className={`h-5 w-5 transition-colors ${isActive ? "text-white" : "text-blue-200 group-hover:text-white"}`} />
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="m-4 rounded-xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs font-semibold text-white">Sistem siap digunakan</p>
        <p className="mt-1 text-xs leading-5 text-blue-100/65">Kelola arsip PLN Batam dengan lebih aman dan terstruktur.</p>
      </div>
    </aside>
  );
}
