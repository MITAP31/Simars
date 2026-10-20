import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { JadwalRetensiList, type JadwalRetensiItem } from "@/components/jadwal-retensi/jadwal-retensi-list";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Jadwal Retensi Arsip | Master Data",
  description: "Kelola master jadwal retensi arsip dan masa simpan dokumen",
};

export const dynamic = "force-dynamic";

export default async function JadwalRetensiPage() {
  await requireAdmin();

  const jadwalRetensiList = await prisma.jadwal_retensi.findMany({
    include: {
      kode_klasifikasi: {
        select: {
          id: true,
          kode: true,
          nama: true,
        },
      },
    },
    orderBy: {
      kode_klasifikasi: {
        kode: "asc",
      },
    },
  });

  const serializedList: JadwalRetensiItem[] = jadwalRetensiList.map((item) => ({
    id: item.id.toString(),
    kode_klasifikasi_id: item.kode_klasifikasi_id.toString(),
    retensi_aktif: item.retensi_aktif,
    satuan_retensi_aktif: item.satuan_retensi_aktif,
    retensi_inaktif: item.retensi_inaktif,
    satuan_retensi_inaktif: item.satuan_retensi_inaktif,
    keterangan_akhir: item.keterangan_akhir,
    dasar_perhitungan: item.dasar_perhitungan,
    keterangan_dasar: item.keterangan_dasar,
    keterangan_khusus: item.keterangan_khusus,
    aktif: item.aktif,
    created_at: item.created_at.toISOString(),
    kode_klasifikasi: {
      id: item.kode_klasifikasi.id.toString(),
      kode: item.kode_klasifikasi.kode,
      nama: item.kode_klasifikasi.nama,
    },
  }));

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Jadwal Retensi</h1>
          <p className="text-muted-foreground">
            Pedoman masa simpan (retensi aktif dan inaktif) serta nasib akhir arsip berdasarkan kode klasifikasi.
          </p>
        </div>
        <Link
          href="/admin/master-data/jadwal-retensi/tambah"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          Tambah Jadwal Retensi
        </Link>
      </div>

      <JadwalRetensiList initialItems={serializedList} />
    </div>
  );
}
