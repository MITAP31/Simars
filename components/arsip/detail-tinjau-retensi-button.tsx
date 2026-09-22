"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { TinjauRetensiDialog, type RetentionDialogData } from "@/components/arsip/tinjau-retensi-dialog";

export function DetailTinjauRetensiButton({ data }: { data: RetentionDialogData }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 shadow-xs cursor-pointer transition-colors"
      >
        <Clock className="h-3.5 w-3.5" />
        Tinjau Retensi
      </button>

      <TinjauRetensiDialog open={isOpen} onOpenChange={setIsOpen} data={data} />
    </>
  );
}
