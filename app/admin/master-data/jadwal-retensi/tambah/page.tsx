import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";

import { createJadwalRetensi } from "@/actions/jadwal-retensi";
import { JadwalRetensiForm } from "@/components/jadwal-retensi/jadwal-retensi-form";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Tambah Jadwal Retensi | Master Data",
  description: "Tambahkan jadwal retensi baru untuk kode klasifikasi arsip",
};

export const dynamic = "force-dynamic";

export default async function TambahJadwalRetensiPage() {
  await requireAdmin();

  // Ambil hanya kode klasifikasi yang aktif dan belum memiliki jadwal retensi (relasi 1-to-1)
  const availableKodeKlasifikasi = await prisma.kode_klasifikasi.findMany({
    where: {
      aktif: true,
      jadwal_retensi: null,
    },
    select: {
      id: true,
      kode: true,
      nama: true,
    },
    orderBy: {
      kode: "asc",
    },
  });

  const serializedKodeKlasifikasi = availableKodeKlasifikasi.map((item) => ({
    id: item.id.toString(),
    kode: item.kode,
    nama: item.nama,
  }));

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-6">
      <div className="flex items-start gap-4">
        <Link
          href="/admin/master-data/jadwal-retensi"
          className="flex h-10 w-10 items-center justify-center rounded-md border bg-card shadow-sm hover:bg-muted"
          aria-label="Kembali ke jadwal retensi"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tambah Jadwal Retensi</h1>
            <p className="text-muted-foreground">
              Tentukan masa simpan aktif, inaktif, dan tindakan akhir arsip untuk kode klasifikasi.
            </p>
          </div>
        </div>
      </div>

      <JadwalRetensiForm
        action={createJadwalRetensi}
        classifications={serializedKodeKlasifikasi}
        submitLabel="Simpan Jadwal Retensi"
      />
    </div>
  );
}


