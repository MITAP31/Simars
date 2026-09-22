"use client";

import Link from "next/link";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { deleteDivisi } from "@/actions/divisi";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

export function DivisiActions({ id, nama }: { id: string; nama: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const close = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!triggerRef.current?.contains(target) && !menuRef.current?.contains(target)) setIsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setIsOpen(false); triggerRef.current?.focus(); }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", closeOnEscape);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", closeOnEscape); };
  }, [isOpen]);

  return <><button ref={triggerRef} type="button" className="rounded-md p-2 hover:bg-muted" aria-label={`Aksi untuk ${nama}`} aria-expanded={isOpen} aria-haspopup="menu" onClick={() => { if (!isOpen && triggerRef.current) { const rect = triggerRef.current.getBoundingClientRect(); setPosition({ top: rect.bottom + 6, left: rect.right - 144 }); } setIsOpen((open) => !open); }}><MoreVertical className="h-4 w-4" /></button>
    {isOpen && position && createPortal(<div ref={menuRef} role="menu" className="fixed z-50 w-36 origin-top-left rounded-md border bg-popover p-1 text-popover-foreground shadow-md" style={position}><Link href={`/admin/master-data/divisi/${id}/edit`} role="menuitem" className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm hover:bg-muted" onClick={() => setIsOpen(false)}><Pencil className="h-4 w-4" />Edit</Link><button type="button" role="menuitem" className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm text-destructive hover:bg-destructive/10" onClick={() => { setIsOpen(false); setIsDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4" />Hapus</button></div>, document.body)}
    <ConfirmationDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} title="Hapus Divisi" description={`Apakah Anda yakin ingin menghapus divisi \"${nama}\"? Data divisi akan dihapus dari sistem.`} confirmLabel="Hapus" action={deleteDivisi} id={id} variant="destructive" />
  </>;
}
