import Link from "next/link";
import { ArrowLeft, UserPen } from "lucide-react";
import { notFound } from "next/navigation";

import { updateUser } from "@/actions/pengguna";
import { requireAdmin } from "@/lib/auth";
import { PenggunaForm } from "@/components/pengguna/pengguna-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditPenggunaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  if (!/^\d+$/.test(id)) {
    notFound();
  }

  const [user, activeAdminCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: BigInt(id) },
      select: {
        id: true,
        nama: true,
        username: true,
        email: true,
        role: true,
        aktif: true,
      },
    }),
    prisma.user.count({
      where: { role: "admin", aktif: true },
    }),
  ]);

  if (!user) {
    notFound();
  }

  const isLastActiveAdmin = user.role === "admin" && user.aktif && activeAdminCount <= 1;

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
            <UserPen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Pengguna</h1>
            <p className="text-sm text-muted-foreground">
              Perbarui profil dan hak akses pengguna <span className="font-semibold text-foreground">{user.nama}</span>.
            </p>
          </div>
        </div>
      </div>

      <PenggunaForm
        action={updateUser}
        isEdit={true}
        isLastActiveAdmin={isLastActiveAdmin}
        submitLabel="Simpan Perubahan"
        values={{
          id: user.id.toString(),
          nama: user.nama,
          username: user.username,
          email: user.email,
          role: user.role,
          aktif: user.aktif,
        }}
      />
    </div>
  );
}
