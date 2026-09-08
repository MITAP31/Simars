import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, Pencil } from "lucide-react";

import { prisma } from "@/lib/prisma";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

function formatDate(date: Date | null) {
  return date ? dateFormatter.format(date) : "—";
}

function formatDateTime(date: Date) {
  return dateTimeFormatter.format(date);
}

export default async function DetailArsipPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!/^\d+$/.test(id)) {
    notFound();
  }

  const arsip = await prisma.arsip.findUnique({
    where: { id: BigInt(id) },
    include: {
      kode_klasifikasi: true,
      lokasi_penyimpanan: true,
      jenis_arsip: true,
    },
  });

  if (!arsip) {
    notFound();
  }

  const location = arsip.lokasi_penyimpanan
    ? `${arsip.lokasi_penyimpanan.kode} — ${arsip.lokasi_penyimpanan.nama}`
    : "—";

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/arsip" className="rounded-md border p-2 hover:bg-muted" aria-label="Kembali ke daftar arsip">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Detail Arsip</h1>
          <p className="text-muted-foreground">Informasi lengkap dokumen arsip.</p>
        </div>
        <Link href={`/admin/arsip/${arsip.id.toString()}/edit`} className="ml-auto flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">
          <Pencil className="h-4 w-4" />
          Edit Arsip
        </Link>
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="border-b p-6"><h2 className="font-semibold">Informasi Arsip</h2></div>
        <div className="grid gap-6 p-6 md:grid-cols-2">
          <InformationField label="Nomor Arsip" value={arsip.nomor_arsip} />
          <InformationField label="Jenis Arsip" value={arsip.jenis_arsip?.nama ?? "—"} />
          <InformationField label="Kode Klasifikasi" value={`${arsip.kode_klasifikasi.kode} — ${arsip.kode_klasifikasi.nama}`} />
          <InformationField label="Tanggal Arsip" value={formatDate(arsip.tanggal_arsip)} />
          <InformationField label="Judul Arsip" value={arsip.nama_arsip} prominent />
          <InformationField label="Penulis / Pengirim" value={arsip.penulis_pengirim ?? "—"} />
          <InformationField label="Jumlah Arsip" value={arsip.satuan ? `${arsip.jumlah} ${arsip.satuan}` : arsip.jumlah.toString()} />
          <InformationField label="Kurun Waktu" value={arsip.kurun_waktu ?? "—"} />
          <InformationField label="Tingkat Keaslian" value={arsip.tingkat_keaslian ?? "—"} />
          <InformationField label="Lokasi Simpan" value={location} />
          <InformationField label="Keterangan" value={arsip.keterangan ?? "—"} fullWidth />
          <div>
            <p className="text-sm text-muted-foreground">Status Arsip</p>
            <span className="mt-2 inline-flex rounded-full bg-muted px-3 py-1 text-xs font-medium">{arsip.status_arsip}</span>
          </div>
          <InformationField label="ID Arsip" value={arsip.id.toString()} />
          <InformationField label="Dibuat pada" value={formatDateTime(arsip.created_at)} />
          <InformationField label="Diperbarui pada" value={formatDateTime(arsip.updated_at)} />
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="border-b p-6"><h2 className="font-semibold">File Dokumen</h2></div>
        <div className="flex items-center gap-3 p-6">
          <div className="rounded-lg bg-muted p-3"><FileText className="h-5 w-5" /></div>
          <div>
            <p className="font-medium">{arsip.file_arsip ?? "Belum ada file dokumen"}</p>
            <p className="text-sm text-muted-foreground">{arsip.file_arsip ? "File tersimpan pada arsip." : "Tidak ada file yang terlampir."}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InformationField({ label, value, prominent = false, fullWidth = false }: { label: string; value: string; prominent?: boolean; fullWidth?: boolean }) {
  return (
    <div className={fullWidth ? "md:col-span-2" : undefined}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={prominent ? "mt-1 text-lg font-semibold" : "mt-1 font-medium"}>{value}</p>
    </div>
  );
}
