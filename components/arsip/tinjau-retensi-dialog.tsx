"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Archive, Clock, Info, ShieldAlert, X } from "lucide-react";
import { usePathname } from "next/navigation";

import { reviewRetentionArsip } from "@/actions/arsip";

export type RetentionDialogData = {
  id: string;
  nomor_arsip: string;
  nama_arsip: string;
  kode_klasifikasi: string;
  nama_klasifikasi: string;
  jadwal_retensi_ringkas: string;
  dasar_perhitungan?: string | null;
  tanggal_mulai_aktif: string;
  tanggal_selesai_aktif: string;
  tanggal_selesai_inaktif: string;
  nasib_akhir: string;
  status_retensi: string;
};

export function TinjauRetensiDialog({
  open,
  onOpenChange,
  data,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: RetentionDialogData | null;
}) {
  const [isPresent, setIsPresent] = useState(open);
  const [isVisible, setIsVisible] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    let frame: number | undefined;
    let timeout: number | undefined;

    if (open) {
      setIsPresent(true);
      frame = window.requestAnimationFrame(() => setIsVisible(true));
      timeout = window.setTimeout(() => closeBtnRef.current?.focus(), 0);
    } else {
      setIsVisible(false);
      timeout = window.setTimeout(() => {
        setIsPresent(false);
      }, 180);
    }

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      if (timeout) window.clearTimeout(timeout);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  if (!isPresent || !data) return null;

  const handleClose = () => {
    onOpenChange(false);
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tinjau-retensi-title"
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        className={`relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-2xl transition-all duration-200 ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <div className="flex items-start justify-between border-b pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-amber-100 p-2 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 id="tinjau-retensi-title" className="text-lg font-bold text-foreground">
                Tinjau Retensi Arsip
              </h3>
              <p className="text-xs text-muted-foreground">Evaluasi masa simpan dan rekomendasi tindak lanjut arsip</p>
            </div>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
            aria-label="Tutup dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

          <div className="mt-4 space-y-4">
            {/* Info Dokumen */}
            <div className="rounded-xl border bg-muted/30 p-4 space-y-2.5 text-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nomor Arsip</span>
                  <p className="font-bold text-foreground">{data.nomor_arsip}</p>
                </div>
                <span className="rounded-md border bg-card px-2.5 py-0.5 text-xs font-mono font-bold text-primary">
                  {data.kode_klasifikasi}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Judul / Perihal Arsip</span>
                <p className="font-medium text-foreground">{data.nama_arsip}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Klasifikasi</span>
                <p className="text-xs text-muted-foreground">{data.nama_klasifikasi}</p>
              </div>
            </div>

            {/* Grid Jadwal & Tanggal */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border p-3 bg-card">
                <span className="text-muted-foreground">Jadwal Retensi</span>
                <p className="mt-0.5 font-semibold text-foreground">{data.jadwal_retensi_ringkas}</p>
              </div>
              <div className="rounded-lg border p-3 bg-card">
                <span className="text-muted-foreground">Masa Mulai Retensi</span>
                <p className="mt-0.5 font-semibold text-foreground">{data.tanggal_mulai_aktif}</p>
              </div>
              <div className="rounded-lg border p-3 bg-card">
                <span className="text-muted-foreground">Selesai Masa Aktif</span>
                <p className="mt-0.5 font-semibold text-foreground">{data.tanggal_selesai_aktif}</p>
              </div>
              <div className="rounded-lg border p-3 bg-card">
                <span className="text-muted-foreground">Selesai Masa Inaktif</span>
                <p className="mt-0.5 font-semibold text-foreground">{data.tanggal_selesai_inaktif}</p>
              </div>
            </div>

            {/* Status & Nasib Akhir */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 dark:border-amber-900/40 dark:bg-amber-950/20 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-amber-800 dark:text-amber-300 font-medium">Status Retensi:</span>
                  <p className="font-bold text-amber-900 dark:text-amber-200 text-sm mt-0.5">
                    {data.status_retensi}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-amber-800 dark:text-amber-300 font-medium">Nasib Akhir Master:</span>
                  <p className="font-bold text-amber-900 dark:text-amber-200 text-sm mt-0.5">
                    Perlu Peninjauan
                  </p>
                </div>
              </div>
              {data.dasar_perhitungan && (
                <p className="mt-2 text-[11px] text-amber-700/80 dark:text-amber-400 border-t border-amber-200/60 dark:border-amber-900/40 pt-1.5">
                  Dasar Perhitungan: {data.dasar_perhitungan}
                </p>
              )}
            </div>

            <div className="rounded-xl border border-border p-3.5 bg-muted/20 text-xs text-muted-foreground flex items-start gap-2">
              <Info className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
              <p>Keputusan akan disimpan pada arsip. Pemusnahan hanya memindahkan arsip ke area akhir retensi; data dan file tidak dihapus.</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 border-t pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="w-full sm:w-auto rounded-lg border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted cursor-pointer"
            >
              Batal
            </button>

            <form action={reviewRetentionArsip}>
              <input type="hidden" name="id" value={data.id} />
              <input type="hidden" name="keputusan" value="permanen" />
              <input type="hidden" name="return_to" value={pathname} />
              <button type="submit" className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-xs cursor-pointer transition-colors"><Archive className="h-3.5 w-3.5" />Pertahankan Permanen</button>
            </form>
            <form action={reviewRetentionArsip}>
              <input type="hidden" name="id" value={data.id} />
              <input type="hidden" name="keputusan" value="pemusnahan" />
              <input type="hidden" name="return_to" value={pathname} />
              <button type="submit" className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 shadow-xs cursor-pointer transition-colors"><ShieldAlert className="h-3.5 w-3.5" />Ajukan / Proses Pemusnahan</button>
            </form>
          </div>
        </div>
      </div>,
    document.body
  );
}
