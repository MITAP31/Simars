import { ArrowLeft, Clock, FileText, Info, Pencil, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface DetailJadwalRetensiPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Detail Jadwal Retensi | Master Data",
  description: "Informasi lengkap jadwal retensi arsip dan dokumen terkait",
};

export const dynamic = "force-dynamic";

export default async function DetailJadwalRetensiPage({ params }: DetailJadwalRetensiPageProps) {
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
          keterangan: true,
        },
      },
    },
  });

  if (!jadwal) {
    notFound();
  }

  // Hitung jumlah arsip aktif (tersimpan) yang menggunakan kode klasifikasi ini
  const jumlahArsipTersimpan = await prisma.arsip.count({
    where: {
      kode_klasifikasi_id: jadwal.kode_klasifikasi_id,
      status_arsip: "tersimpan",
    },
  });

  const totalArsip = await prisma.arsip.count({
    where: {
      kode_klasifikasi_id: jadwal.kode_klasifikasi_id,
    },
  });

  const formatNasibAkhir = (nasib: string) => {
    switch (nasib) {
      case "PERMANEN":
        return { label: "Disimpan Permanen", color: "bg-blue-100 text-blue-800 border-blue-200" };
      case "MUSNAH":
        return { label: "Dimusnahkan", color: "bg-rose-100 text-rose-800 border-rose-200" };
      case "MUSNAH_DENGAN_KETERANGAN_KHUSUS":
        return { label: "Perlu Peninjauan / Ada Pengecualian", color: "bg-amber-100 text-amber-800 border-amber-200" };
      default:
        return { label: nasib, color: "bg-slate-100 text-slate-700 border-slate-200" };
    }
  };

  const formatDasarPerhitungan = (dasar: string) => {
    if (!dasar || !dasar.trim()) return "—";

    switch (dasar) {
      case "LANGSUNG":
        return "Langsung dihitung dari tanggal arsip";
      case "SETELAH_TIDAK_BERLAKU":
        return "Setelah tidak berlaku";
      case "SETELAH_TAHUN_ANGGARAN_BERAKHIR":
        return "Setelah tahun anggaran berakhir";
      case "SETELAH_DIPERBAHARUI":
        return "Setelah diperbaharui";
      case "LAINNYA":
        return "Lainnya";
      default:
        return dasar;
    }
  };

  const nasib = formatNasibAkhir(jadwal.keterangan_akhir);

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <Link
            href="/admin/master-data/jadwal-retensi"
            className="flex h-10 w-10 items-center justify-center rounded-md border bg-card shadow-sm hover:bg-muted"
            aria-label="Kembali ke jadwal retensi"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight">Detail Jadwal Retensi</h1>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Parameter masa simpan dan aturan akhir dokumen berkas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/admin/master-data/jadwal-retensi/${id}/edit`}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Pencil className="h-4 w-4" />
            Edit Aturan
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Kolom Kiri / Utama: Info Retensi & Kode Klasifikasi */}
        <div className="space-y-6 md:col-span-2">
          <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="border-b bg-muted/30 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Kode Klasifikasi
                  </span>
                  <div className="mt-1 text-xl font-bold text-primary">
                    {jadwal.kode_klasifikasi.kode}
                  </div>
                </div>
                {jadwal.aktif ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Aturan Aktif
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500">
                    Nonaktif
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm font-medium text-foreground">
                {jadwal.kode_klasifikasi.nama}
              </p>
              {jadwal.kode_klasifikasi.keterangan && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {jadwal.kode_klasifikasi.keterangan}
                </p>
              )}
            </div>

            <div className="p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-blue-900">
                    Masa Retensi Aktif
                  </div>
                  <div className="mt-2 text-2xl font-bold text-blue-700">
                    {jadwal.retensi_aktif} {jadwal.satuan_retensi_aktif}
                  </div>
                  <p className="mt-1 text-xs text-blue-800">
                    Disimpan di unit pengolah / divisi pemilik berkas selama masa aktif.
                  </p>
                </div>

                <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-amber-900">
                    Masa Retensi Inaktif
                  </div>
                  <div className="mt-2 text-2xl font-bold text-amber-700">
                    {jadwal.retensi_inaktif} {jadwal.satuan_retensi_inaktif}
                  </div>
                  <p className="mt-1 text-xs text-amber-800">
                    Disimpan di Records Center / Pusat Arsip setelah masa aktif berkas selesai.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4 divide-y">
                <div className="flex flex-col gap-1 pt-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Tindakan Akhir Arsip</span>
                  <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${nasib.color}`}>
                    {nasib.label}
                  </span>
                </div>

                {jadwal.keterangan_khusus && (
                  <div className="pt-4">
                    <span className="text-xs font-medium text-muted-foreground">Ketentuan / Pengecualian</span>
                    <p className="mt-1 rounded-md bg-muted/40 p-3 text-sm text-foreground">
                      {jadwal.keterangan_khusus}
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-1 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Dasar Perhitungan</span>
                  <span className="text-sm font-semibold text-foreground">
                    {formatDasarPerhitungan(jadwal.dasar_perhitungan)}
                  </span>
                </div>

                {jadwal.keterangan_dasar && (
                  <div className="pt-4">
                    <span className="text-xs font-medium text-muted-foreground">Keterangan Tambahan Dasar Perhitungan</span>
                    <p className="mt-1 rounded-md bg-muted/40 p-3 text-sm text-foreground">
                      {jadwal.keterangan_dasar}
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-1 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Terakhir Diperbarui</span>
                  <span className="text-sm text-foreground">
                    {new Intl.DateTimeFormat("id-ID", {
                      dateStyle: "long",
                      timeStyle: "short",
                    }).format(new Date(jadwal.updated_at))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Penggunaan Arsip & Catatan Operasional */}
        <div className="space-y-6">
          <div className="overflow-hidden rounded-xl border bg-card p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <FileText className="h-4 w-4 text-primary" />
              Statistik Dokumen Arsip
            </div>

            <div className="rounded-md border bg-muted/20 p-3">
              <div className="text-xs text-muted-foreground">Arsip Tersimpan (Aktif Digunakan)</div>
              <div className="mt-1 text-2xl font-bold text-primary">
                {jumlahArsipTersimpan} <span className="text-xs font-normal text-muted-foreground">dokumen</span>
              </div>
            </div>

            <div className="rounded-md border bg-muted/20 p-3">
              <div className="text-xs text-muted-foreground">Total Rekam Arsip (Semua Status)</div>
              <div className="mt-1 text-xl font-bold text-foreground">
                {totalArsip} <span className="text-xs font-normal text-muted-foreground">dokumen</span>
              </div>
            </div>

            {jumlahArsipTersimpan > 0 && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                <div className="flex items-center gap-1 font-semibold">
                  <Info className="h-3.5 w-3.5" /> Proteksi Data Relasi
                </div>
                <p className="mt-1">
                  Aturan retensi ini terkunci dari penghapusan karena terdapat <strong>{jumlahArsipTersimpan} dokumen arsip tersimpan</strong> yang menggunakannya.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


