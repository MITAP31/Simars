"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Archive,
  Building2,
  ChevronDown,
  ClipboardList,
  FileText,
  FolderOpen,
  Inbox,
  LayoutDashboard,
  Send,
  Settings,
  Tags,
  Trash2,
  Users,
  Warehouse,
} from "lucide-react";

const menuItems = [
  { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  {
    title: "Arsip",
    href: "/admin/arsip",
    icon: Archive,
    children: [
      { title: "Daftar Arsip", href: "/admin/arsip", icon: Archive },
      { title: "Tempat Sampah", href: "/admin/arsip/tempat-sampah", icon: Trash2 },
    ],
  },
  { title: "Kategori", href: "/admin/kategori", icon: FolderOpen },
  { title: "Pengguna", href: "/admin/pengguna", icon: Users },
  {
    title: "Pengaturan",
    href: "/admin/pengaturan",
    icon: Settings,
    children: [
      { title: "Divisi", href: "/admin/pengaturan/divisi", icon: Building2 },
      { title: "Kode Klasifikasi", href: "/admin/pengaturan/kode-klasifikasi", icon: Tags },
      { title: "Lokasi Penyimpanan", href: "/admin/pengaturan/lokasi-penyimpanan", icon: Warehouse },
    ],
  },
];

type SidebarCategory = {
  nama: string;
  slug: string;
};

function categoryIcon(name: string) {
  switch (name.toLowerCase()) {
    case "laporan": return ClipboardList;
    case "surat keluar": return Send;
    case "surat masuk": return Inbox;
    default: return FileText;
  }
}

export default function Sidebar({ categories }: { categories: SidebarCategory[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isArsipOpen, setIsArsipOpen] = useState(false);
  const [isKategoriOpen, setIsKategoriOpen] = useState(false);
  const [isPengaturanOpen, setIsPengaturanOpen] = useState(false);
  const isArsipSubmenu = pathname !== "/admin/arsip" && pathname.startsWith("/admin/arsip/");
  const isKategoriSubmenu = pathname !== "/admin/kategori" && pathname.startsWith("/admin/kategori/");
  const showArsipChildren = isArsipSubmenu || (pathname === "/admin/arsip" && isArsipOpen);
  const showKategoriChildren = isKategoriSubmenu || (pathname === "/admin/kategori" && isKategoriOpen);
  const isPengaturanSubmenu = pathname !== "/admin/pengaturan" && pathname.startsWith("/admin/pengaturan/");
  const showPengaturanChildren = isPengaturanSubmenu || (pathname === "/admin/pengaturan" && isPengaturanOpen);

  const handleArsipClick = () => {
    if (pathname === "/admin/arsip") {
      setIsArsipOpen((open) => !open);
      return;
    }

    setIsArsipOpen(false);
    router.push("/admin/arsip");
  };

  const handleKategoriClick = () => {
    if (pathname === "/admin/kategori") {
      setIsKategoriOpen((open) => !open);
      return;
    }

    setIsKategoriOpen(false);
    router.push("/admin/kategori");
  };

  const handlePengaturanClick = () => {
    if (pathname === "/admin/pengaturan") {
      setIsPengaturanOpen((open) => !open);
      return;
    }

    setIsPengaturanOpen(false);
    router.push("/admin/pengaturan");
  };

  return (
    <aside className="sticky top-0 flex h-screen w-72 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-xl shadow-sky-900/10">
      <div className="flex h-24 items-center border-b border-sidebar-border px-5">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 drop-shadow-[0_4px_8px_rgba(0,0,0,0.2)]">
            <Image src="/pln-batam-mark-dark.svg" alt="Logo PLN Batam" fill sizes="48px" className="object-contain" priority />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide">SIMARS</h1>
            <p className="text-xs text-muted-foreground">PLN Batam</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-6">
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Menu Utama</p>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          if (item.href === "/admin/kategori") {
            return (
              <div key={item.href}>
                <button
                  type="button"
                  onClick={handleKategoriClick}
                  className={`group flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                    isActive ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm" : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                  aria-expanded={showKategoriChildren}
                >
                  <span className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 transition-colors ${isActive ? "text-white" : "text-primary group-hover:text-sidebar-accent-foreground"}`} />
                    {item.title}
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showKategoriChildren ? "rotate-180" : ""}`} />
                </button>

                {showKategoriChildren && (
                  <div className="ml-8 mt-1 space-y-1">
                    {categories.length > 0 ? categories.map((category) => {
                      const CategoryIcon = categoryIcon(category.nama);
                      const categoryPath = `/admin/kategori/${category.slug}`;
                      const isCategoryActive = pathname === categoryPath || pathname.startsWith(`${categoryPath}/`);

                      return (
                        <Link
                          key={category.slug}
                          href={categoryPath}
                          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                            isCategoryActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          }`}
                        >
                          <CategoryIcon className="h-4 w-4 shrink-0" />
                          <span className="truncate">{category.nama}</span>
                        </Link>
                      );
                    }) : <p className="px-3 py-2 text-xs text-muted-foreground">Belum ada kategori aktif.</p>}
                  </div>
                )}
              </div>
            );
          }

          if (item.href === "/admin/pengaturan") {
            return (
              <div key={item.href}>
                <button
                  type="button"
                  onClick={handlePengaturanClick}
                  className={`group flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                    isActive ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm" : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                  aria-expanded={showPengaturanChildren}
                >
                  <span className="flex items-center gap-3"><Icon className={`h-5 w-5 transition-colors ${isActive ? "text-white" : "text-primary group-hover:text-sidebar-accent-foreground"}`} />{item.title}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showPengaturanChildren ? "rotate-180" : ""}`} />
                </button>
                {showPengaturanChildren && <div className="ml-8 mt-1 space-y-1">{item.children?.map((child) => {
                  const ChildIcon = child.icon;
                  const isChildActive = pathname === child.href || pathname.startsWith(`${child.href}/`);
                  return <Link key={child.href} href={child.href} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${isChildActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}><ChildIcon className="h-4 w-4 shrink-0" />{child.title}</Link>;
                })}</div>}
              </div>
            );
          }

          if (item.children) {
            return (
              <div key={item.href}>
                <button
                  type="button"
                  onClick={handleArsipClick}
                  className={`group flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                    isActive ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm" : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                  aria-expanded={showArsipChildren}
                >
                  <span className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 transition-colors ${isActive ? "text-white" : "text-primary group-hover:text-sidebar-accent-foreground"}`} />
                    {item.title}
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showArsipChildren ? "rotate-180" : ""}`} />
                </button>

                {showArsipChildren && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      return (
                        <Link key={child.href} href={child.href} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                          pathname === child.href ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        }`}>
                          <ChildIcon className="h-4 w-4" />
                          {child.title}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link key={item.href} href={item.href} className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${
              isActive ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm" : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}>
              <Icon className={`h-5 w-5 transition-colors ${isActive ? "text-white" : "text-primary group-hover:text-sidebar-accent-foreground"}`} />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="m-4 rounded-xl border border-sidebar-border bg-white/60 p-4">
        <p className="text-xs font-semibold text-sidebar-foreground">Sistem siap digunakan</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">Kelola arsip PLN Batam dengan lebih aman dan terstruktur.</p>
      </div>
    </aside>
  );
}
