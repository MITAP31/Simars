"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";

import { deleteArsip } from "@/actions/arsip";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

export function DeleteArsipButton({ id, name }: { id: string; name: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" className="inline-flex items-center gap-2 rounded-md border border-destructive px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10" aria-label={`Hapus ${name}`} onClick={() => setIsOpen(true)}>
        <Trash2 className="h-4 w-4" />
        Hapus
      </button>
      <ConfirmationDialog
        open={isOpen}
        onOpenChange={setIsOpen}
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
