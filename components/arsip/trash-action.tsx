"use client";

import Link from "next/link";
import { Eye, MoreVertical, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { restoreArsip } from "@/actions/arsip";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

type MenuPosition = {
  top: number;
  left: number;
};

export function TrashActions({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [dialog, setDialog] = useState<"restore" | null>(null);
  const [position, setPosition] = useState<MenuPosition | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const closeOnOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        !triggerRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
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

      setPosition({
        top: rect.bottom + 6,
        left: rect.right - 144,
      });
    }

    setIsOpen((open) => !open);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="rounded-md p-2 hover:bg-muted"
        aria-label={`Aksi untuk ${name}`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={toggleMenu}
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {isOpen &&
        position &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            className="fixed z-50 w-44 origin-top-left rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-150"
            style={{
              top: position.top,
              left: position.left,
            }}
          >
            <Link
              href={`/admin/arsip/${id}`}
              role="menuitem"
              className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none transition-colors hover:bg-muted"
              onClick={() => setIsOpen(false)}
            >
              <Eye className="h-4 w-4" />
              Detail
            </Link>

            <button type="button" role="menuitem" className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm text-green-600 outline-none transition-colors hover:bg-green-50" onClick={() => { setIsOpen(false); setDialog("restore"); }}>
              <RotateCcw className="h-4 w-4" />
              Pulihkan
            </button>

          </div>,
          document.body
        )}
      <ConfirmationDialog
        open={dialog === "restore"}
        onOpenChange={(open) => setDialog(open ? "restore" : null)}
        title="Pulihkan Arsip"
        description="Apakah Anda yakin ingin memulihkan arsip ini?"
        confirmLabel="Pulihkan"
        action={restoreArsip}
        id={id}
      />
    </>
  );
}
