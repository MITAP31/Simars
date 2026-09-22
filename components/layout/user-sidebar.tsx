"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FileUp, History, LayoutDashboard, UserCircle } from "lucide-react";

const menuItems = [
  { title: "Dashboard", href: "/user/dashboard", icon: LayoutDashboard },
  { title: "Pengajuan Arsip", href: "/user/pengajuan", icon: FileUp },
  { title: "Riwayat", href: "/user/riwayat", icon: History },
  { title: "Profil", href: "/user/profil", icon: UserCircle },
];

export default function UserSidebar() {
  const pathname = usePathname();
  return <aside className="sticky top-0 z-40 flex h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-xl shadow-sky-900/10">
    <div className="flex h-24 items-center border-b border-sidebar-border px-5"><div className="flex items-center gap-3"><div className="relative h-12 w-12 drop-shadow-[0_4px_8px_rgba(0,0,0,0.2)]"><Image src="/pln-batam-mark-dark.svg" alt="Logo PLN Batam" fill sizes="48px" className="object-contain" priority /></div><div><h1 className="text-lg font-bold tracking-wide">SIMARS</h1><p className="text-xs text-muted-foreground">PLN Batam</p></div></div></div>
    <nav className="flex-1 space-y-1.5 p-4"><p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Menu utama</p>{menuItems.map((item) => { const Icon = item.icon; const active = pathname === item.href; return <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${active ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sky-900/15" : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}><Icon className="h-5 w-5" />{item.title}</Link>; })}</nav>
    <div className="border-t border-sidebar-border p-4"><div className="flex items-center gap-2.5 rounded-2xl border border-sidebar-border bg-white/60 p-3 shadow-sm"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">BS</div><div><p className="text-sm font-semibold">Budi Santoso</p><p className="text-xs text-muted-foreground">Pengguna Divisi</p></div></div></div>
  </aside>;
}
