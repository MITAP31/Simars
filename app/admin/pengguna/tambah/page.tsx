import { UserPlus } from "lucide-react";

import { createUser } from "@/actions/pengguna";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PenggunaForm } from "@/components/pengguna/pengguna-form";

export const dynamic = "force-dynamic";

export default async function TambahPenggunaPage() {
  await requireAdmin();

  const divisiList = await prisma.divisi.findMany({
    select: { id: true, kode: true, nama: true },
    orderBy: { kode: "asc" },
  });

  return (
    <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 md:p-8">
      <PenggunaForm
        action={createUser}
        submitLabel="Simpan Pengguna"
        title="Tambah Pengguna"
        subtitle="Tambahkan akun pengguna baru yang memiliki akses ke sistem SIMARS."
        headerIcon={<UserPlus className="h-5 w-5" />}
        divisiList={divisiList.map((d) => ({
          id: d.id.toString(),
          kode: d.kode,
          nama: d.nama,
        }))}
      />
    </div>
  );
}
