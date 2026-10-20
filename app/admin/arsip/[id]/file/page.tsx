import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, FileText, FileX, ImageIcon, FileIcon } from "lucide-react";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function getFileExtension(filename: string) {
  const parts = filename.split(".");
  return parts.length > 1 ? `.${parts.pop()?.toLowerCase()}` : "";
}

function getFileTypeDetails(ext: string) {
  if (ext === ".pdf") {
    return {
      type: "pdf" as const,
      label: "Dokumen PDF",
      color: "text-red-600",
      bgColor: "bg-red-100",
    };
  }
  if (ext === ".doc" || ext === ".docx") {
    return {
      type: "word" as const,
      label: ext === ".doc" ? "Microsoft Word 97-2003 (.doc)" : "Microsoft Word (.docx)",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    };
  }
  if ([".jpg", ".jpeg", ".png"].includes(ext)) {
    return {
      type: "image" as const,
      label: ext === ".png" ? "Gambar PNG" : "Gambar JPEG/JPG",
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    };
  }
  return {
    type: "other" as const,
    label: "Dokumen Digital",
    color: "text-muted-foreground",
    bgColor: "bg-muted",
  };
}

export default async function PreviewFileArsipPage({
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
      divisi: true,
      jenis_arsip: true,
    },
  });

  if (!arsip) {
    notFound();
  }

  const detailPath = `/admin/arsip/${arsip.id.toString()}`;

  if (!arsip.file_arsip) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Link
            href={detailPath}
            className="inline-flex items-center gap-2 rounded-md border p-2 hover:bg-muted"
            aria-label="Kembali ke detail arsip"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Preview Dokumen</h1>
            <p className="text-muted-foreground">{arsip.nama_arsip}</p>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <FileX className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-lg font-semibold">Belum Ada File Dokumen</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Arsip ini belum memiliki berkas dokumen yang diunggah ke dalam sistem.
          </p>
          <div className="mt-6">
            <Link
              href={detailPath}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Detail Arsip
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const fileName = arsip.file_arsip.split("/").pop() ?? "dokumen";
  const fileExt = getFileExtension(fileName);
  const fileInfo = getFileTypeDetails(fileExt);
  const filePreviewUrl = `/api/arsip/${arsip.id.toString()}/file?mode=preview`;
  const fileDownloadUrl = `/api/arsip/${arsip.id.toString()}/file?mode=download`;

  return (
    <div className="space-y-6 p-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={detailPath}
            className="inline-flex items-center justify-center rounded-md border p-2 hover:bg-muted transition-colors"
            title="Kembali ke Detail Arsip"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                SIMARS / PREVIEW DOKUMEN
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Preview Dokumen</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={detailPath}
            className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Detail Arsip
          </Link>
          <a
            href={fileDownloadUrl}
            download
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 shadow-sm transition-colors"
          >
            <Download className="h-4 w-4" />
            Unduh File
          </a>
        </div>
      </div>

      {/* Metadata Card */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Judul Arsip</p>
            <p className="mt-1 text-sm font-semibold text-foreground truncate" title={arsip.nama_arsip}>
              {arsip.nama_arsip}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Nomor Arsip</p>
            <p className="mt-1 text-sm font-medium text-foreground">{arsip.nomor_arsip}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Nama File</p>
            <p className="mt-1 text-sm font-medium text-foreground truncate" title={fileName}>
              {fileName}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Tipe File</p>
            <span className="mt-1 inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium bg-muted">
              {fileInfo.label}
            </span>
          </div>
        </div>
      </div>

      {/* Preview Container */}
      {fileInfo.type === "pdf" && (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="border-b bg-muted/40 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-red-600" />
              <span className="text-xs font-medium">Pratinjau PDF Interaktif</span>
            </div>
            <a
              href={fileDownloadUrl}
              download
              className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1"
            >
              <Download className="h-3.5 w-3.5" />
              Unduh PDF
            </a>
          </div>
          <div className="p-3 bg-muted/10">
            <iframe
              src={filePreviewUrl}
              title={`Pratinjau ${arsip.nama_arsip}`}
              className="h-[750px] w-full rounded-lg border bg-white shadow-xs"
            />
          </div>
        </div>
      )}

      {fileInfo.type === "image" && (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="border-b bg-muted/40 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-medium">Pratinjau Berkas Gambar</span>
            </div>
            <a
              href={fileDownloadUrl}
              download
              className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1"
            >
              <Download className="h-3.5 w-3.5" />
              Unduh Gambar
            </a>
          </div>
          <div className="flex min-h-[480px] items-center justify-center p-6 bg-muted/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={filePreviewUrl}
              alt={arsip.nama_arsip}
              className="max-h-[75vh] max-w-full rounded-lg border bg-white object-contain shadow-sm"
            />
          </div>
        </div>
      )}

      {fileInfo.type === "word" && (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="border-b bg-muted/40 px-6 py-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-medium">Informasi Dokumen Microsoft Word</span>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 shadow-xs">
              <FileText className="h-10 w-10" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">{fileName}</h3>
            <p className="mt-1 text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              {fileInfo.label}
            </p>
            <p className="mt-3 text-sm text-muted-foreground max-w-lg">
              Pratinjau dokumen tidak tersedia secara langsung di peramban web untuk format file Microsoft Word. Silakan unduh dokumen untuk membuka dan melihat isinya.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <a
                href={fileDownloadUrl}
                download
                className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 shadow-sm transition-colors"
              >
                <Download className="h-4 w-4" />
                Unduh Dokumen Word
              </a>
              <Link
                href={detailPath}
                className="inline-flex items-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
              >
                Kembali ke Detail Arsip
              </Link>
            </div>
          </div>
        </div>
      )}

      {fileInfo.type === "other" && (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted text-muted-foreground shadow-xs">
              <FileIcon className="h-10 w-10" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">{fileName}</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md">
              Pratinjau langsung untuk tipe file ini tidak didukung oleh peramban. Anda dapat mengunduh berkas ini langsung ke komputer Anda.
            </p>
            <div className="mt-6">
              <a
                href={fileDownloadUrl}
                download
                className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 shadow-sm transition-colors"
              >
                <Download className="h-4 w-4" />
                Unduh Berkas
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
