import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { notFound } from "next/navigation";

import { updateDivisi } from "@/actions/divisi";
import { DivisiForm } from "@/components/pengaturan/divisi-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditDivisiPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const division = await prisma.divisi.findUnique({ where: { id: BigInt(id) } });
  if (!division) notFound();

  return <div className="mx-auto w-full max-w-3xl space-y-6 p-6"><div className="flex items-start gap-4"><Link href="/admin/master-data/divisi" className="flex h-10 w-10 items-center justify-center rounded-md border bg-card shadow-sm hover:bg-muted" aria-label="Kembali ke divisi"><ArrowLeft className="h-5 w-5" /></Link><div className="flex items-center gap-3"><div className="rounded-lg bg-primary/10 p-2 text-primary"><Pencil className="h-5 w-5" /></div><div><h1 className="text-2xl font-bold tracking-tight">Edit Divisi</h1><p className="text-muted-foreground">Perbarui informasi divisi.</p></div></div></div><DivisiForm action={updateDivisi} submitLabel="Simpan Perubahan" values={{ id: division.id.toString(), kode: division.kode, nama: division.nama, keterangan: division.keterangan, aktif: division.aktif }} /></div>;
}
