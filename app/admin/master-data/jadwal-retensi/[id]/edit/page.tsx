import { ArrowLeft, Pencil } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { updateJadwalRetensi } from "@/actions/jadwal-retensi";
import { JadwalRetensiForm } from "@/components/jadwal-retensi/jadwal-retensi-form";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface EditJadwalRetensiPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Edit Jadwal Retensi | Master Data",
  description: "Ubah aturan jadwal retensi arsip",
};

export const dynamic = "force-dynamic";

export default async function EditJadwalRetensiPage({ params }: EditJadwalRetensiPageProps) {
  await requireAdmin();

  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const parsedId = BigInt(id);

  const jadwal = await prisma.jadwal_retensi.findUnique({
    where: { id: parsedId },
    include: {
      kode_klasifikasi: {
        select: {
          id: true,
          kode: true,
          nama: true,
        },
      },
    },
  });

  if (!jadwal) {
    notFound();
  }

  const values = {
    id: jadwal.id.toString(),
    kode_klasifikasi_id: jadwal.kode_klasifikasi_id.toString(),
    kode_klasifikasi_kode: jadwal.kode_klasifikasi.kode,
    kode_klasifikasi_nama: jadwal.kode_klasifikasi.nama,
    retensi_aktif: jadwal.retensi_aktif,
    satuan_retensi_aktif: jadwal.satuan_retensi_aktif,
    dasar_perhitungan: jadwal.dasar_perhitungan,
    keterangan_dasar: jadwal.keterangan_dasar,
    retensi_inaktif: jadwal.retensi_inaktif,
    satuan_retensi_inaktif: jadwal.satuan_retensi_inaktif,
    keterangan_akhir: jadwal.keterangan_akhir,
    keterangan_khusus: jadwal.keterangan_khusus,
    aktif: jadwal.aktif,
  };

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
            <Pencil className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Jadwal Retensi</h1>
            <p className="text-muted-foreground">
              Perbarui aturan masa retensi atau nasib akhir arsip.
            </p>
          </div>
        </div>
      </div>

      <JadwalRetensiForm
        action={updateJadwalRetensi}
        values={values}
        isEdit={true}
        submitLabel="Simpan Perubahan"
      />
    </div>
  );
}


