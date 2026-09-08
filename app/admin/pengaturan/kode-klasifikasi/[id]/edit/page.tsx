import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { notFound } from "next/navigation";

import { updateKodeKlasifikasi } from "@/actions/kode-klasifikasi";
import { KodeKlasifikasiForm } from "@/components/pengaturan/kode-klasifikasi-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditKodeKlasifikasiPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const classificationId = BigInt(id);
  const [classification, allClassifications] = await Promise.all([
    prisma.kode_klasifikasi.findUnique({ where: { id: classificationId } }),
    prisma.kode_klasifikasi.findMany({ select: { id: true, kode: true, nama: true, parent_id: true, is_induk: true }, orderBy: { kode: "asc" } }),
  ]);
  if (!classification) notFound();

  const childrenByParent = new Map<string, string[]>();
  for (const item of allClassifications) {
    if (!item.parent_id) continue;
    const parentId = item.parent_id.toString();
    childrenByParent.set(parentId, [...(childrenByParent.get(parentId) ?? []), item.id.toString()]);
  }
  const excludedParentIds = new Set<string>([classificationId.toString()]);
  const collectDescendants = (id: string) => {
    for (const childId of childrenByParent.get(id) ?? []) {
      if (excludedParentIds.has(childId)) continue;
      excludedParentIds.add(childId);
      collectDescendants(childId);
    }
  };
  collectDescendants(classificationId.toString());
  const parents = allClassifications.filter((item) => item.is_induk && !excludedParentIds.has(item.id.toString())).map((item) => ({ id: item.id.toString(), kode: item.kode, nama: item.nama }));

  return <div className="mx-auto w-full max-w-3xl space-y-6 p-6"><div className="flex items-start gap-4"><Link href="/admin/pengaturan/kode-klasifikasi" className="flex h-10 w-10 items-center justify-center rounded-md border bg-card shadow-sm hover:bg-muted" aria-label="Kembali ke kode klasifikasi"><ArrowLeft className="h-5 w-5" /></Link><div className="flex items-center gap-3"><div className="rounded-lg bg-primary/10 p-2 text-primary"><Pencil className="h-5 w-5" /></div><div><h1 className="text-2xl font-bold tracking-tight">Edit Kode Klasifikasi</h1><p className="text-muted-foreground">Perbarui informasi kode klasifikasi.</p></div></div></div><KodeKlasifikasiForm action={updateKodeKlasifikasi} parents={parents} submitLabel="Simpan Perubahan" values={{ id: classification.id.toString(), kode: classification.kode, nama: classification.nama, jenis_klasifikasi: classification.jenis_klasifikasi, is_induk: classification.is_induk, parent_id: classification.parent_id?.toString() ?? null, keterangan: classification.keterangan, aktif: classification.aktif }} /></div>;
}
