"use client";

import { useState, useRef, useId } from "react";
import Link from "next/link";
import { FileText, Upload, Eye, CheckCircle2, FileIcon, ImageIcon } from "lucide-react";

type ArsipFileFieldProps = {
  existingFile?: string | null;
  arsipId?: string;
};

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileExtension(filename: string) {
  const parts = filename.split(".");
  return parts.length > 1 ? `.${parts.pop()?.toLowerCase()}` : "";
}

function getFileTypeIcon(ext: string) {
  if (ext === ".pdf") {
    return <FileText className="h-5 w-5 text-red-600" />;
  }
  if (ext === ".doc" || ext === ".docx") {
    return <FileText className="h-5 w-5 text-blue-600" />;
  }
  if ([".jpg", ".jpeg", ".png"].includes(ext)) {
    return <ImageIcon className="h-5 w-5 text-emerald-600" />;
  }
  return <FileIcon className="h-5 w-5 text-muted-foreground" />;
}

export function ArsipFileField({ existingFile, arsipId }: ArsipFileFieldProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const existingFileName = existingFile ? existingFile.split("/").pop() ?? "Dokumen Arsip" : null;
  const existingExt = existingFileName ? getFileExtension(existingFileName) : "";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const handleClearSelected = () => {
    setSelectedFile(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="rounded-xl border border-dashed p-6 text-center">
      <input
        ref={inputRef}
        id={inputId}
        name="file_arsip"
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        onChange={handleFileChange}
      />

      {/* Tampilan jika sudah ada file lama yang tersimpan (mode Edit) */}
      {existingFile && !selectedFile && (
        <div className="mb-4 rounded-lg border bg-muted/30 p-4 text-left">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background border shadow-xs">
                {getFileTypeIcon(existingExt)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">File saat ini:</p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                    <CheckCircle2 className="h-3 w-3" />
                    File tersedia
                  </span>
                </div>
                <p className="font-medium text-sm text-foreground truncate max-w-sm mt-0.5">
                  {existingFileName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              {arsipId && (
                <Link
                  href={`/admin/arsip/${arsipId}/file`}
                  className="inline-flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Lihat File
                </Link>
              )}
              <label
                htmlFor={inputId}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
              >
                <Upload className="h-3.5 w-3.5" />
                Ganti File
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Tampilan jika pengguna baru saja memilih file baru dari komputernya */}
      {selectedFile ? (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-left">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background border border-primary/20">
                {getFileTypeIcon(getFileExtension(selectedFile.name))}
              </div>
              <div>
                <p className="text-xs font-semibold text-primary">
                  {existingFile ? "File baru dipilih (akan menggantikan file lama):" : "File siap diunggah:"}
                </p>
                <p className="font-medium text-sm text-foreground truncate max-w-sm">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Ukuran: {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <label
                htmlFor={inputId}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
              >
                Pilih Lainnya
              </label>
              <button
                type="button"
                onClick={handleClearSelected}
                className="inline-flex items-center gap-1 rounded-md border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                Batalkan
              </button>
            </div>
          </div>
        </div>
      ) : !existingFile ? (
        /* Empty state jika belum ada file sama sekali (mode Tambah) */
        <>
          <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">Pilih file dokumen</p>
          <p className="mt-1 text-xs text-muted-foreground">PDF, DOC, DOCX, JPG, atau PNG · Maksimal 10 MB</p>
          <label
            htmlFor={inputId}
            className="mt-4 inline-flex cursor-pointer rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            Pilih File
          </label>
        </>
      ) : (
        <p className="text-xs text-muted-foreground">
          Kosongkan bila tidak ingin mengganti file. PDF, DOC, DOCX, JPG, atau PNG · Maksimal 10 MB
        </p>
      )}
    </div>
  );
}
