import { CheckCircle2, FileText, FolderOpen, Plus, XCircle } from "lucide-react";
import Link from "next/link";

import { JenisArsipList } from "@/components/jenis-arsip/jenis-arsip-list";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function KategoriPage() {
  const categories = await prisma.jenis_arsip.findMany({
    include: { _count: { select: { arsip: true } } },
    orderBy: { nama: "asc" },
  });

  const totalKategori = categories.length;
  const kategoriAktif = categories.filter((c) => c.aktif).length;
  const kategoriNonaktif = totalKategori - kategoriAktif;
  const totalArsipTerkategori = categories.reduce((acc, c) => acc + c._count.arsip, 0);

  const categoryStats = [
    {
      title: "Total Kategori",
      value: totalKategori,
      description: "Seluruh jenis arsip",
      icon: FolderOpen,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-400",
    },
    {
      title: "Kategori Aktif",
      value: kategoriAktif,
      description: "Siap digunakan untuk pengarsipan",
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400",
    },
    {
      title: "Kategori Nonaktif",
      value: kategoriNonaktif,
      description: "Diarsipkan / tidak aktif",
      icon: XCircle,
      color: "text-muted-foreground bg-muted",
    },
    {
      title: "Arsip Terkategori",
      value: totalArsipTerkategori,
      description: "Total arsip dengan kategori",
      icon: FileText,
      color: "text-sky-600 bg-sky-50 dark:bg-sky-950/50 dark:text-sky-400",
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kategori & Jenis Arsip</h1>
          <p className="text-muted-foreground">Kelola klasifikasi jenis arsip yang tersedia pada sistem kearsipan PLN Batam.</p>
        </div>
        <Link
          href="/admin/kategori/tambah"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Tambah Kategori
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categoryStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="rounded-xl border border-border/70 bg-card p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className={`rounded-lg p-2 ${stat.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{stat.title}</p>
              <p className="mt-0.5 text-2xl font-bold tracking-tight text-foreground">{stat.value.toLocaleString("id-ID")}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{stat.description}</p>
            </div>
          );
        })}
      </div>

      <JenisArsipList
        categories={categories.map((category) => ({
          id: category.id.toString(),
          nama: category.nama,
          slug: category.slug,
          keterangan: category.keterangan,
          aktif: category.aktif,
          jumlahArsip: category._count.arsip,
        }))}
      />
    </div>
  );
}
