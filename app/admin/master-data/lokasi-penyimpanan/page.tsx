import Link from "next/link";
import { Plus } from "lucide-react";

import { LokasiPenyimpananList, type LocationListItem } from "@/components/pengaturan/lokasi-penyimpanan-list";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function LokasiPenyimpananPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const initialSearch = typeof params.q === "string" ? params.q : "";
  const locations = await prisma.lokasi_penyimpanan.findMany({ orderBy: { kode: "asc" } });
  const items: LocationListItem[] = locations.map((location) => ({
    id: location.id.toString(),
    jenis_lokasi: location.jenis_lokasi,
    kode: location.kode,
    nama: location.nama,
    parent_id: location.parent_id?.toString() ?? null,
    keterangan: location.keterangan,
    aktif: location.aktif,
    created_at: location.created_at.toISOString(),
  }));

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lokasi Penyimpanan</h1>
          <p className="text-muted-foreground">Kelola lokasi penyimpanan arsip secara bertingkat.</p>
        </div>
        <Link
          href="/admin/master-data/lokasi-penyimpanan/tambah"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          Tambah Lokasi
        </Link>
      </div>
      <LokasiPenyimpananList locations={items} initialSearch={initialSearch} />
    </div>
  );
}
