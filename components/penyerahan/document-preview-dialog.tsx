"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export function DocumentPreviewDialog({
  open,
  title,
  url,
  downloadUrl,
  fileName,
  onClose,
}: {
  open: boolean;
  title: string;
  url: string;
  downloadUrl: string;
  fileName: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;
  const extension = fileName.split(".").pop()?.toLowerCase();
  const isPdf = extension === "pdf" || url.includes("/berita-acara");
  const isImage = ["jpg", "jpeg", "png"].includes(extension ?? "");

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-label={title} className="flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border bg-card shadow-2xl">
        <header className="flex items-center justify-between gap-3 border-b px-4 py-3">
          <h2 className="truncate font-semibold">{title}</h2>
          <div className="flex shrink-0 items-center gap-2">
            <a href={downloadUrl} className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted">
              <Download className="h-4 w-4" /> Unduh
            </a>
            <button type="button" onClick={onClose} aria-label="Tutup preview" className="rounded-md p-2 hover:bg-muted"><X className="h-4 w-4" /></button>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-auto bg-muted/30 p-3 sm:p-5">
          {isPdf ? (
            <iframe title={title} src={url} className="h-[70vh] min-h-[420px] w-full rounded-md border bg-white" />
          ) : isImage ? (
            <div className="flex min-h-[50vh] items-center justify-center"><img src={url} alt={fileName} className="max-h-[70vh] max-w-full object-contain" /></div>
          ) : (
            <div className="mx-auto flex min-h-[40vh] max-w-lg flex-col items-center justify-center text-center">
              <p className="font-medium">Preview tidak tersedia untuk format berkas ini.</p>
              <p className="mt-1 text-sm text-muted-foreground">Unduh berkas untuk membukanya di perangkat Anda.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export function DocumentPreviewButton({
  title,
  url,
  downloadUrl,
  fileName,
  label = "Lihat",
  className = "inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline",
}: {
  title: string;
  url: string;
  downloadUrl: string;
  fileName: string;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return <>
    <button type="button" onClick={() => setOpen(true)} className={className}>{label}</button>
    <DocumentPreviewDialog open={open} title={title} url={url} downloadUrl={downloadUrl} fileName={fileName} onClose={() => setOpen(false)} />
  </>;
}
