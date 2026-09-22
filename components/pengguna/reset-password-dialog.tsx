"use client";

import { KeyRound, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { resetUserPassword } from "@/actions/pengguna";

type ResetPasswordDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  nama: string;
  username: string;
};

export function ResetPasswordDialog({
  open,
  onOpenChange,
  userId,
  nama,
  username,
}: ResetPasswordDialogProps) {
  const [isPresent, setIsPresent] = useState(open);
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let frame: number | undefined;
    let timeout: number | undefined;

    if (open) {
      setIsPresent(true);
      setError(null);
      frame = window.requestAnimationFrame(() => setIsVisible(true));
      timeout = window.setTimeout(() => passwordRef.current?.focus(), 50);
    } else {
      setIsVisible(false);
      timeout = window.setTimeout(() => setIsPresent(false), 180);
    }

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      if (timeout) window.clearTimeout(timeout);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onOpenChange, open]);

  if (!isPresent) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const konfirmasi = formData.get("konfirmasi_password") as string;

    if (!password || password.length < 8) {
      e.preventDefault();
      setError("Password baru harus minimal 8 karakter.");
      return;
    }

    if (password !== konfirmasi) {
      e.preventDefault();
      setError("Konfirmasi password tidak cocok dengan password baru.");
      return;
    }

    setError(null);
    onOpenChange(false);
  };

  return createPortal(
    <div
      className={`fixed inset-0 z-[110] flex items-center justify-center bg-black/35 p-4 backdrop-blur-[1px] transition-opacity duration-200 ${isVisible ? "opacity-100" : "opacity-0"}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onOpenChange(false);
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-dialog-title"
        className={`w-full max-w-md rounded-xl border bg-card p-6 shadow-xl transition-all duration-200 ${isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
      >
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-amber-500/10 p-2.5 text-amber-600 dark:text-amber-500">
            <KeyRound className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="reset-dialog-title" className="text-lg font-semibold">
              Reset Password Pengguna
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Atur ulang kata sandi untuk akun <span className="font-semibold text-foreground">{nama}</span> (<span className="text-primary">@{username}</span>).
            </p>
          </div>
          <button
            type="button"
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
            onClick={() => onOpenChange(false)}
            aria-label="Tutup dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            {error}
          </div>
        )}

        <form action={resetUserPassword} onSubmit={handleSubmit} className="mt-5 space-y-4">
          <input type="hidden" name="id" value={userId} />

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground" htmlFor="new-password">
              Password Baru *
            </label>
            <input
              id="new-password"
              ref={passwordRef}
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="Minimal 8 karakter"
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground" htmlFor="confirm-new-password">
              Konfirmasi Password Baru *
            </label>
            <input
              id="confirm-new-password"
              name="konfirmasi_password"
              type="password"
              required
              minLength={8}
              placeholder="Ketik ulang password baru"
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted cursor-pointer"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 cursor-pointer"
            >
              <KeyRound className="h-4 w-4" />
              Reset Password
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
