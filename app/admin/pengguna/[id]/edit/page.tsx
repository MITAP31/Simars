import { UserPen } from "lucide-react";
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

  const [user, activeAdminCount, divisiList] = await Promise.all([
    prisma.user.findUnique({
      where: { id: BigInt(id) },
      select: {
        id: true,
        nama: true,
        username: true,
        email: true,
        role: true,
        divisi_id: true,
        aktif: true,
      },
    }),
    prisma.user.count({
      where: { role: "admin", aktif: true },
    }),
    prisma.divisi.findMany({
      select: { id: true, kode: true, nama: true },
      orderBy: { kode: "asc" },
    }),
  ]);

  if (!user) {
    notFound();
  }

  const isLastActiveAdmin = user.role === "admin" && user.aktif && activeAdminCount <= 1;

  return (
    <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 md:p-8">
      <PenggunaForm
        action={updateUser}
        isEdit={true}
        isLastActiveAdmin={isLastActiveAdmin}
        submitLabel="Simpan Perubahan"
        title="Edit Pengguna"
        subtitle={
          <>
            Perbarui profil dan hak akses pengguna <strong className="font-semibold text-slate-800 dark:text-slate-200">{user.nama}</strong>.
          </>
        }
        headerIcon={<UserPen className="h-5 w-5" />}
        divisiList={divisiList.map((d) => ({
          id: d.id.toString(),
          kode: d.kode,
          nama: d.nama,
        }))}
        values={{
          id: user.id.toString(),
          nama: user.nama,
          username: user.username,
          email: user.email,
          role: user.role,
          divisi_id: user.divisi_id ? user.divisi_id.toString() : null,
          aktif: user.aktif,
        }}
      />
    </div>
  );
}
