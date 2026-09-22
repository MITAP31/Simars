import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";

import { updateLokasiPenyimpanan } from "@/actions/lokasi-penyimpanan";
import { LokasiPenyimpananForm } from "@/components/pengaturan/lokasi-penyimpanan-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditLokasiPenyimpananPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const locationId = BigInt(id);
  const [location, parents] = await Promise.all([prisma.lokasi_penyimpanan.findUnique({ where: { id: locationId } }), prisma.lokasi_penyimpanan.findMany({ where: { is_induk: true, id: { not: locationId } }, select: { id: true, kode: true, nama: true, parent_id: true }, orderBy: { kode: "asc" } })]);
  if (!location) notFound();
  return <div className="mx-auto w-full max-w-3xl space-y-6 p-6"><div className="flex items-start gap-4"><Link href="/admin/master-data/lokasi-penyimpanan" className="flex h-10 w-10 items-center justify-center rounded-md border bg-card shadow-sm hover:bg-muted" aria-label="Kembali ke lokasi penyimpanan"><ArrowLeft className="h-5 w-5" /></Link><div className="flex items-center gap-3"><div className="rounded-lg bg-primary/10 p-2 text-primary"><Pencil className="h-5 w-5" /></div><div><h1 className="text-2xl font-bold tracking-tight">Edit Lokasi Penyimpanan</h1><p className="text-muted-foreground">Perbarui informasi lokasi penyimpanan.</p></div></div></div><LokasiPenyimpananForm action={updateLokasiPenyimpanan} parents={parents.map((parent) => ({ ...parent, id: parent.id.toString(), parent_id: parent.parent_id?.toString() ?? null }))} submitLabel="Simpan Perubahan" values={{ id: location.id.toString(), jenis_lokasi: location.jenis_lokasi, kode: location.kode, nama: location.nama, parent_id: location.parent_id?.toString() ?? null, keterangan: location.keterangan, aktif: location.aktif, is_induk: location.is_induk }} /></div>;
}
