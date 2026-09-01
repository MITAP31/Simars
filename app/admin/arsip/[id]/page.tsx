import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Eye,
  FileText,
  Pencil,
  Trash2,
} from "lucide-react";

export default async function DetailArsipPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/arsip"
          className="rounded-md border p-2 hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Detail Arsip
          </h1>

          <p className="text-muted-foreground">
            Informasi lengkap dokumen arsip.
          </p>
        </div>
      </div>

      {/* Informasi Arsip */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="border-b p-6">
          <h2 className="font-semibold">Informasi Arsip</h2>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">
              Nomor Arsip
            </p>

            <p className="mt-1 font-medium">
              001/PLN-BTM/2026
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Jenis Arsip
            </p>

            <p className="mt-1 font-medium">
              Surat Masuk
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Kategori
            </p>

            <p className="mt-1 font-medium">
              Administrasi
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Tanggal Arsip
            </p>

            <p className="mt-1 font-medium">
              31 Agustus 2026
            </p>
          </div>

          <div className="md:col-span-2">
            <p className="text-sm text-muted-foreground">
              Judul Arsip
            </p>

            <p className="mt-1 text-lg font-semibold">
              Surat Permohonan Data
            </p>
          </div>

          <div className="md:col-span-2">
            <p className="text-sm text-muted-foreground">
              Deskripsi
            </p>

            <p className="mt-1 leading-6">
              Surat permohonan data untuk kebutuhan administrasi
              dan dokumentasi instansi.
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Status
            </p>

            <span className="mt-2 inline-flex rounded-full bg-muted px-3 py-1 text-xs font-medium">
              Aktif
            </span>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              ID Arsip
            </p>

            <p className="mt-1 font-medium">
              {id}
            </p>
          </div>
        </div>
      </div>

      {/* File */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="border-b p-6">
          <h2 className="font-semibold">File Dokumen</h2>
        </div>

        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-muted p-3">
              <FileText className="h-5 w-5" />
            </div>

            <div>
              <p className="font-medium">
                surat-permohonan-data.pdf
              </p>

              <p className="text-sm text-muted-foreground">
                PDF • 2.4 MB
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              <Eye className="h-4 w-4" />
              Lihat
            </button>

            <button
              type="button"
              className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              <Download className="h-4 w-4" />
              Unduh
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          <Pencil className="h-4 w-4" />
          Edit Arsip
        </button>

        <button
          type="button"
          className="flex items-center gap-2 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
        >
          <Trash2 className="h-4 w-4" />
          Hapus
        </button>
      </div>
    </div>
  );
}