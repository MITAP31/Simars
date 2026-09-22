"use client";

import Link from "next/link";
import { Eye, FileText, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { deleteArsip } from "@/actions/arsip";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { TinjauRetensiDialog, type RetentionDialogData } from "./tinjau-retensi-dialog";
import { Clock } from "lucide-react";

type MenuPosition = {
  top: number;
  left: number;
};

export function ArsipActions({
  id,
  name,
  hasFile,
  retentionReviewData,
}: {
  id: string;
  name: string;
  hasFile?: boolean;
  retentionReviewData?: RetentionDialogData | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const closeOnOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;

      if (!triggerRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  const toggleMenu = () => {
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom + 6, left: rect.right - 160 });
    }

    setIsOpen((open) => !open);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="rounded-md p-2 hover:bg-muted cursor-pointer"
        aria-label={`Aksi untuk ${name}`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={toggleMenu}
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {isOpen && position && createPortal(
        <div
          ref={menuRef}
          role="menu"
          className="fixed z-50 w-44 origin-top-left rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-150"
          style={{ top: position.top, left: position.left }}
        >
          <Link href={`/admin/arsip/${id}`} role="menuitem" className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none transition-colors hover:bg-muted" onClick={() => setIsOpen(false)}>
            <Eye className="h-4 w-4" />
            Detail
          </Link>
          {hasFile && (
            <Link href={`/admin/arsip/${id}/file`} role="menuitem" className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none transition-colors hover:bg-muted" onClick={() => setIsOpen(false)}>
              <FileText className="h-4 w-4" />
              Lihat File
            </Link>
          )}
          <Link href={`/admin/arsip/${id}/edit`} role="menuitem" className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none transition-colors hover:bg-muted" onClick={() => setIsOpen(false)}>
            <Pencil className="h-4 w-4" />
            Edit
          </Link>

          {/* Menu Tinjau Retensi: HANYA muncul jika nasib akhir = Perlu Peninjauan dan status retensi = SELESAI_RETENSI */}
          {retentionReviewData && retentionReviewData.nasib_akhir === "MUSNAH_DENGAN_KETERANGAN_KHUSUS" && (
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm font-medium text-amber-700 dark:text-amber-400 outline-none transition-colors hover:bg-amber-50 dark:hover:bg-amber-950/40 cursor-pointer"
              onClick={() => {
                setIsOpen(false);
                setIsReviewDialogOpen(true);
              }}
            >
              <Clock className="h-4 w-4" />
              Tinjau Retensi
            </button>
          )}

          <button type="button" role="menuitem" className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm text-destructive outline-none transition-colors hover:bg-destructive/10 cursor-pointer" onClick={() => { setIsOpen(false); setIsDeleteDialogOpen(true); }}>
            <Trash2 className="h-4 w-4" />
            Hapus
          </button>
        </div>,
        document.body,
      )}

      {retentionReviewData && (
        <TinjauRetensiDialog
          open={isReviewDialogOpen}
          onOpenChange={setIsReviewDialogOpen}
          data={retentionReviewData}
        />
      )}

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Hapus Arsip"
        description="Apakah Anda yakin ingin memindahkan arsip ini ke Arsip Akhir Retensi?"
        confirmLabel="Pindahkan"
        action={deleteArsip}
        id={id}
        variant="destructive"
      />
    </>
  );
}
