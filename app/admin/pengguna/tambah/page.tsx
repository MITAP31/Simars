import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";

import { createUser } from "@/actions/pengguna";
import { requireAdmin } from "@/lib/auth";
import { PenggunaForm } from "@/components/pengguna/pengguna-form";

export const dynamic = "force-dynamic";

export default async function TambahPenggunaPage() {
  await requireAdmin();

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-6">
      <div className="flex items-start gap-4">
        <Link
          href="/admin/pengguna"
          className="flex h-10 w-10 items-center justify-center rounded-md border bg-card shadow-sm hover:bg-muted transition-colors"
          aria-label="Kembali ke daftar pengguna"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <UserPlus className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tambah Pengguna</h1>
            <p className="text-sm text-muted-foreground">
              Tambahkan akun pengguna baru yang memiliki akses ke sistem SIMARS.
            </p>
          </div>
        </div>
      </div>

      <PenggunaForm action={createUser} submitLabel="Simpan Pengguna" />
    </div>
  );
}
