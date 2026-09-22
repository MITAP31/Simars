import Link from "next/link";
import { ArrowLeft, Warehouse } from "lucide-react";

import { createLokasiPenyimpanan } from "@/actions/lokasi-penyimpanan";
import { LokasiPenyimpananForm } from "@/components/pengaturan/lokasi-penyimpanan-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TambahLokasiPenyimpananPage() {
  const parents = await prisma.lokasi_penyimpanan.findMany({ where: { is_induk: true }, select: { id: true, kode: true, nama: true, parent_id: true }, orderBy: { kode: "asc" } });
  return <div className="mx-auto w-full max-w-3xl space-y-6 p-6"><div className="flex items-start gap-4"><Link href="/admin/master-data/lokasi-penyimpanan" className="flex h-10 w-10 items-center justify-center rounded-md border bg-card shadow-sm hover:bg-muted" aria-label="Kembali ke lokasi penyimpanan"><ArrowLeft className="h-5 w-5" /></Link><div className="flex items-center gap-3"><div className="rounded-lg bg-primary/10 p-2 text-primary"><Warehouse className="h-5 w-5" /></div><div><h1 className="text-2xl font-bold tracking-tight">Tambah Lokasi Penyimpanan</h1><p className="text-muted-foreground">Tambahkan lokasi penyimpanan baru untuk arsip.</p></div></div></div><LokasiPenyimpananForm action={createLokasiPenyimpanan} parents={parents.map((parent) => ({ ...parent, id: parent.id.toString(), parent_id: parent.parent_id?.toString() ?? null }))} submitLabel="Simpan Lokasi" /></div>;
}
