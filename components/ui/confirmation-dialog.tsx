"use client";

import { CircleHelp, TriangleAlert, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type ServerAction = (formData: FormData) => void | Promise<void>;

type ConfirmationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  action: ServerAction;
  id: string;
  variant?: "default" | "destructive";
};

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  action,
  id,
  variant = "default",
}: ConfirmationDialogProps) {
  const [isPresent, setIsPresent] = useState(open);
  const [isVisible, setIsVisible] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let frame: number | undefined;
    let timeout: number | undefined;

    if (open) {
      setIsPresent(true);
      frame = window.requestAnimationFrame(() => setIsVisible(true));
      timeout = window.setTimeout(() => cancelRef.current?.focus(), 0);
    } else {
      setIsVisible(false);
      timeout = window.setTimeout(() => setIsPresent(false), 180);
    }

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      if (timeout) {
        window.clearTimeout(timeout);
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onOpenChange, open]);

  if (!isPresent) {
    return null;
  }

  const Icon = variant === "destructive" ? TriangleAlert : CircleHelp;
  const iconTone = variant === "destructive"
    ? "bg-destructive/10 text-destructive"
    : "bg-primary/10 text-primary";
  const confirmTone = variant === "destructive"
    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
    : "bg-primary text-primary-foreground hover:bg-primary/90";

  return createPortal(
    <div
      className={`fixed inset-0 z-[110] flex items-center justify-center bg-black/35 p-4 backdrop-blur-[1px] transition-opacity duration-200 ${isVisible ? "opacity-100" : "opacity-0"}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onOpenChange(false);
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-dialog-title"
        aria-describedby="confirmation-dialog-description"
        className={`w-full max-w-md rounded-xl border bg-card p-6 shadow-xl transition-all duration-200 ${isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
      >
        <div className="flex items-start gap-4">
          <div className={`rounded-full p-2.5 ${iconTone}`}><Icon className="h-5 w-5" /></div>
          <div className="min-w-0 flex-1">
            <h2 id="confirmation-dialog-title" className="text-lg font-semibold">{title}</h2>
            <p id="confirmation-dialog-description" className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
          <button type="button" className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground" onClick={() => onOpenChange(false)} aria-label="Tutup dialog">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form action={action} onSubmit={() => onOpenChange(false)} className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <input type="hidden" name="id" value={id} />
          <button ref={cancelRef} type="button" className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted" onClick={() => onOpenChange(false)}>
            Batal
          </button>
          <button type="submit" className={`rounded-md px-4 py-2 text-sm font-medium ${confirmTone}`}>
            {confirmLabel}
          </button>
        </form>
      </div>
    </div>,
    document.body,
  );
}
