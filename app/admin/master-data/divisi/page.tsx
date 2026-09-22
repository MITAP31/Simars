import Link from "next/link";
import { Plus } from "lucide-react";

import { DivisiList, type DivisiListItem } from "@/components/pengaturan/divisi-list";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DivisiPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const params = await searchParams;
  const initialSearch = typeof params.q === "string" ? params.q : "";
  const divisions = await prisma.divisi.findMany({ orderBy: { kode: "asc" } });
  const items: DivisiListItem[] = divisions.map((division) => ({ id: division.id.toString(), kode: division.kode, nama: division.nama, keterangan: division.keterangan, aktif: division.aktif }));

  return <div className="space-y-6 p-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div><h1 className="text-2xl font-bold tracking-tight">Divisi</h1><p className="text-muted-foreground">Kelola data divisi di lingkungan perusahaan.</p></div>
      <Link href="/admin/master-data/divisi/tambah" className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"><Plus className="h-4 w-4" />Tambah Divisi</Link>
    </div>
    <DivisiList divisions={items} initialSearch={initialSearch} />
  </div>;
}
