import Link from "next/link";
import { Plus } from "lucide-react";

import { KodeKlasifikasiList, type ClassificationListItem } from "@/components/pengaturan/kode-klasifikasi-list";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function KodeKlasifikasiPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const params = await searchParams;
  const initialSearch = typeof params.q === "string" ? params.q : "";
  const classifications = await prisma.kode_klasifikasi.findMany({ orderBy: { kode: "asc" } });
  const items: ClassificationListItem[] = classifications.map((classification) => ({
    id: classification.id.toString(),
    kode: classification.kode,
    nama: classification.nama,
    jenis_klasifikasi: classification.jenis_klasifikasi,
    parent_id: classification.parent_id?.toString() ?? null,
    is_induk: classification.is_induk,
    keterangan: classification.keterangan,
    aktif: classification.aktif,
    created_at: classification.created_at.toISOString(),
  }));

  return <div className="space-y-6 p-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div><h1 className="text-2xl font-bold tracking-tight">Kode Klasifikasi</h1><p className="text-muted-foreground">Kelola kode klasifikasi untuk pengelompokan arsip SIMARS.</p></div>
      <Link href="/admin/master-data/kode-klasifikasi/tambah" className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"><Plus className="h-4 w-4" />Tambah Kode Klasifikasi</Link>
    </div>

    <KodeKlasifikasiList classifications={items} initialSearch={initialSearch} />
  </div>;
}
