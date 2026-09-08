"use client";

import { CheckCircle2, CircleAlert, CircleX, Info, X } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type ToastCode = "created" | "updated" | "deleted" | "restored" | "permanently-deleted" | "error" | "warning" | "info" | "category-created" | "category-updated" | "category-deleted" | "category-deactivated" | "category-duplicate" | "category-invalid" | "category-error" | "classification-created" | "classification-updated" | "classification-deleted" | "classification-duplicate" | "classification-invalid" | "classification-in-use" | "classification-hierarchy-invalid" | "classification-error";
type ToastVariant = "success" | "error" | "warning" | "info";

type ToastMessage = {
  title: string;
  description: string;
  variant: ToastVariant;
};

type ActiveToast = ToastMessage & {
  id: string;
};

const messages: Record<ToastCode, ToastMessage> = {
  created: { title: "Arsip berhasil ditambahkan", description: "Data arsip baru telah disimpan.", variant: "success" },
  updated: { title: "Arsip berhasil diperbarui", description: "Perubahan data arsip telah disimpan.", variant: "success" },
  deleted: { title: "Arsip berhasil dipindahkan ke Tempat Sampah", description: "Arsip masih dapat dipulihkan dari Tempat Sampah.", variant: "success" },
  restored: { title: "Arsip berhasil dipulihkan", description: "Arsip kembali tersedia di daftar arsip.", variant: "success" },
  "permanently-deleted": { title: "Arsip berhasil dihapus permanen", description: "Data arsip tidak dapat dipulihkan kembali.", variant: "success" },
  error: { title: "Gagal menyimpan arsip", description: "Silakan coba lagi.", variant: "error" },
  warning: { title: "Perhatian", description: "Silakan periksa kembali data Anda.", variant: "warning" },
  info: { title: "Informasi", description: "Tindakan Anda sedang diproses.", variant: "info" },
  "category-created": { title: "Jenis arsip berhasil ditambahkan", description: "Jenis arsip baru sudah tersedia pada form arsip.", variant: "success" },
  "category-updated": { title: "Jenis arsip berhasil diperbarui", description: "Perubahan nama telah disimpan.", variant: "success" },
  "category-deleted": { title: "Jenis arsip berhasil dihapus", description: "Jenis arsip tidak lagi tersedia pada sistem.", variant: "success" },
  "category-deactivated": { title: "Jenis arsip dinonaktifkan", description: "Jenis arsip ini masih digunakan oleh arsip sehingga tidak dapat dihapus.", variant: "warning" },
  "category-duplicate": { title: "Nama jenis arsip sudah digunakan", description: "Gunakan nama jenis arsip yang berbeda.", variant: "error" },
  "category-invalid": { title: "Nama jenis arsip wajib diisi", description: "Masukkan nama jenis arsip sebelum menyimpan.", variant: "error" },
  "category-error": { title: "Gagal menyimpan jenis arsip", description: "Silakan coba lagi.", variant: "error" },
  "classification-created": { title: "Kode klasifikasi berhasil ditambahkan", description: "Kode klasifikasi baru telah disimpan.", variant: "success" },
  "classification-updated": { title: "Kode klasifikasi berhasil diperbarui", description: "Perubahan kode klasifikasi telah disimpan.", variant: "success" },
  "classification-deleted": { title: "Kode klasifikasi berhasil dihapus", description: "Data tidak lagi tersedia pada daftar klasifikasi.", variant: "success" },
  "classification-duplicate": { title: "Kode klasifikasi sudah digunakan", description: "Gunakan kode klasifikasi yang berbeda.", variant: "error" },
  "classification-invalid": { title: "Data kode klasifikasi tidak valid", description: "Periksa kembali data wajib dan panjang isian.", variant: "error" },
  "classification-in-use": { title: "Kode klasifikasi tidak dapat dihapus", description: "Kode masih digunakan oleh arsip atau menjadi induk kode lain.", variant: "warning" },
  "classification-hierarchy-invalid": { title: "Status induk tidak dapat diubah", description: "Kode yang masih memiliki anak tidak dapat diubah menjadi bukan induk.", variant: "warning" },
  "classification-error": { title: "Gagal menyimpan kode klasifikasi", description: "Silakan coba lagi.", variant: "error" },
};

const toastStyles: Record<ToastVariant, { icon: typeof CheckCircle2; tone: string; progress: string }> = {
  success: { icon: CheckCircle2, tone: "border-emerald-200 bg-emerald-50 text-emerald-950", progress: "bg-emerald-500" },
  error: { icon: CircleX, tone: "border-destructive/30 bg-destructive/10 text-destructive", progress: "bg-destructive" },
  warning: { icon: CircleAlert, tone: "border-amber-200 bg-amber-50 text-amber-950", progress: "bg-amber-500" },
  info: { icon: Info, tone: "border-primary/20 bg-primary/10 text-primary", progress: "bg-primary" },
};

function isToastCode(value: string | null): value is ToastCode {
  return value !== null && value in messages;
}

export function ToastNotifications() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [toast, setToast] = useState<ActiveToast | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);
  const toastCode = searchParams.get("toast");

  const dismissToast = useCallback(() => {
    setIsLeaving(true);
    window.setTimeout(() => {
      setToast(null);
      setIsLeaving(false);
    }, 180);
  }, []);

  useEffect(() => {
    if (!isToastCode(toastCode)) {
      return;
    }

    const id = searchParams.get("toastId") ?? `${toastCode}-${Date.now()}`;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- The URL query is the external source for the toast presentation.
    setToast({ ...messages[toastCode], id });
    setIsLeaving(false);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("toast");
    params.delete("toastId");
    const query = params.toString();
    window.history.replaceState(null, "", `${pathname}${query ? `?${query}` : ""}`);
  }, [pathname, searchParams, toastCode]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = window.setTimeout(dismissToast, 4000);
    return () => window.clearTimeout(timeout);
  }, [dismissToast, toast]);

  if (!toast) {
    return null;
  }

  const style = toastStyles[toast.variant];
  const Icon = style.icon;

  return (
    <div className="pointer-events-none fixed inset-x-4 top-4 z-[100] flex justify-center sm:inset-x-auto sm:right-4 sm:justify-end" role="status" aria-live="polite">
      <div key={toast.id} className={`pointer-events-auto relative w-full max-w-sm cursor-pointer overflow-hidden rounded-xl border shadow-lg transition-all duration-200 sm:w-96 ${style.tone} ${isLeaving ? "translate-x-2 opacity-0" : "translate-x-0 opacity-100"}`} onClick={dismissToast} title="Klik untuk menutup notifikasi">
        <div className="flex items-start gap-3 p-4 animate-in fade-in-0 slide-in-from-top-2 duration-200">
          <Icon className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{toast.title}</p>
            <p className="mt-1 text-sm opacity-80">{toast.description}</p>
          </div>
          <button type="button" className="rounded-md p-1 opacity-70 transition-opacity hover:bg-black/5 hover:opacity-100" onClick={(event) => { event.stopPropagation(); dismissToast(); }} aria-label="Tutup notifikasi">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div key={`${toast.id}-progress`} className={`h-1 origin-left ${style.progress} ${isLeaving ? "opacity-0" : "animate-[toast-progress_4s_linear_forwards]"}`} />
      </div>
    </div>
  );
}
