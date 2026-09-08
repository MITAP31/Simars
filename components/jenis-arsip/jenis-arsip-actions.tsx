"use client";

import Link from "next/link";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { deleteJenisArsip } from "@/actions/jenis-arsip";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

type MenuPosition = {
  top: number;
  left: number;
};

export function JenisArsipActions({ id, nama, slug }: { id: string; nama: string; slug: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

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
      setPosition({ top: rect.bottom + 6, left: rect.right - 144 });
    }
    setIsOpen((open) => !open);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="rounded-md p-2 hover:bg-muted"
        aria-label={`Aksi untuk ${nama}`}
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
          className="fixed z-50 w-36 origin-top-left rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-150"
          style={{ top: position.top, left: position.left }}
        >
          <Link href={`/admin/kategori/${slug}/edit`} role="menuitem" className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none transition-colors hover:bg-muted" onClick={() => setIsOpen(false)}>
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
          <button type="button" role="menuitem" className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm text-destructive outline-none transition-colors hover:bg-destructive/10" onClick={() => { setIsOpen(false); setIsDeleteDialogOpen(true); }}>
            <Trash2 className="h-4 w-4" />
            Hapus
          </button>
        </div>,
        document.body,
      )}

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Hapus Jenis Arsip"
        description={`Apakah Anda yakin ingin menghapus jenis arsip \"${nama}\"? Jika masih digunakan arsip, jenis ini akan dinonaktifkan agar data arsip tetap aman.`}
        confirmLabel="Hapus"
        action={deleteJenisArsip}
        id={id}
        variant="destructive"
      />
    </>
  );
}
