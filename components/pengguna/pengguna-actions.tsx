"use client";

import Link from "next/link";
import { KeyRound, MoreVertical, Pencil, Trash2, UserCheck, UserX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { deleteUser, toggleUserStatus } from "@/actions/pengguna";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { ResetPasswordDialog } from "@/components/pengguna/reset-password-dialog";

export type PenggunaActionsUser = {
  id: string;
  nama: string;
  username: string;
  email: string | null;
  role: string;
  aktif: boolean;
};

export function PenggunaActions({
  user,
  currentUserId,
  activeAdminCount,
}: {
  user: PenggunaActionsUser;
  currentUserId: string;
  activeAdminCount: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const isSelf = user.id === currentUserId;
  const isLastActiveAdmin = user.role === "admin" && user.aktif && activeAdminCount <= 1;
  const canDeactivate = !isSelf && !isLastActiveAdmin;
  const canDelete = !isSelf && !isLastActiveAdmin;

  useEffect(() => {
    if (!isOpen) return;
    const close = (event: MouseEvent) => {
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
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  const handleToggleMenu = () => {
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 6,
        left: Math.max(16, rect.right - 180),
      });
    }
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="rounded-md p-2 hover:bg-muted cursor-pointer"
        aria-label={`Menu aksi untuk ${user.nama}`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={handleToggleMenu}
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {isOpen &&
        position &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            className="fixed z-50 w-48 origin-top-right rounded-xl border bg-popover p-1.5 text-popover-foreground shadow-xl animate-in fade-in-0 zoom-in-95"
            style={position}
          >
            {/* Edit Pengguna */}
            <Link
              href={`/admin/pengguna/${user.id}/edit`}
              role="menuitem"
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium hover:bg-muted transition-colors cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              <Pencil className="h-4 w-4 text-muted-foreground" />
              Edit Pengguna
            </Link>

            {/* Reset Password */}
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium hover:bg-muted transition-colors cursor-pointer"
              onClick={() => {
                setIsOpen(false);
                setIsResetOpen(true);
              }}
            >
              <KeyRound className="h-4 w-4 text-amber-500" />
              Reset Password
            </button>

            <div className="my-1 border-t border-border/60" />

            {/* Aktifkan / Nonaktifkan */}
            {user.aktif ? (
              canDeactivate ? (
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                  onClick={() => {
                    setIsOpen(false);
                    setIsStatusDialogOpen(true);
                  }}
                >
                  <UserX className="h-4 w-4" />
                  Nonaktifkan Akun
                </button>
              ) : (
                <div
                  className="px-2.5 py-2 text-[11px] text-muted-foreground italic cursor-not-allowed opacity-75"
                  title={isSelf ? "Tidak dapat menonaktifkan akun sendiri" : "Admin aktif terakhir tidak dapat dinonaktifkan"}
                >
                  {isSelf ? "Akun Anda sendiri" : "Admin aktif terakhir"}
                </div>
              )
            ) : (
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors cursor-pointer"
                onClick={() => {
                  setIsOpen(false);
                  setIsStatusDialogOpen(true);
                }}
              >
                <UserCheck className="h-4 w-4" />
                Aktifkan Akun
              </button>
            )}

            <div className="my-1 border-t border-border/60" />

            {/* Hapus Pengguna */}
            {canDelete ? (
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                onClick={() => {
                  setIsOpen(false);
                  setIsDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4" />
                Hapus Pengguna
              </button>
            ) : (
              <div
                className="px-2.5 py-2 text-[11px] text-muted-foreground italic cursor-not-allowed opacity-75"
                title={isSelf ? "Tidak dapat menghapus akun sendiri" : "Admin aktif terakhir tidak dapat dihapus"}
              >
                {isSelf ? "Akun Anda sendiri" : "Admin aktif terakhir"}
              </div>
            )}
          </div>,
          document.body
        )}

      {/* Dialog Konfirmasi Ubah Status */}
      <ConfirmationDialog
        open={isStatusDialogOpen}
        onOpenChange={setIsStatusDialogOpen}
        title={user.aktif ? "Nonaktifkan Pengguna" : "Aktifkan Pengguna"}
        description={
          user.aktif
            ? `Apakah Anda yakin ingin menonaktifkan akun "${user.nama}" (@${user.username})? Pengguna tidak akan dapat login ke SIMARS.`
            : `Apakah Anda yakin ingin mengaktifkan kembali akun "${user.nama}" (@${user.username})? Pengguna akan dapat login kembali.`
        }
        confirmLabel={user.aktif ? "Nonaktifkan" : "Aktifkan"}
        action={toggleUserStatus}
        id={user.id}
        variant={user.aktif ? "destructive" : "default"}
      />

      {/* Dialog Konfirmasi Hapus Pengguna */}
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Hapus Pengguna?"
        description={
          <div className="space-y-3">
            <p>
              Pengguna ini akan dihapus secara permanen dari sistem dan tidak dapat dipulihkan kembali.
            </p>
            <div className="rounded-lg border bg-muted/50 p-2.5 text-xs text-foreground font-medium space-y-0.5">
              <div>Nama: {user.nama}</div>
              <div>Username: @{user.username}</div>
            </div>
            <p className="text-xs font-medium text-destructive">
              Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
        }
        confirmLabel="Hapus Pengguna"
        action={deleteUser}
        id={user.id}
        variant="destructive"
      />

      {/* Dialog Reset Password */}
      <ResetPasswordDialog
        open={isResetOpen}
        onOpenChange={setIsResetOpen}
        userId={user.id}
        nama={user.nama}
        username={user.username}
      />
    </>
  );
}
