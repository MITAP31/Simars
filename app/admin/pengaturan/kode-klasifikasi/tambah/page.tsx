import Link from "next/link";
import { ArrowLeft, Tags } from "lucide-react";

import { createKodeKlasifikasi } from "@/actions/kode-klasifikasi";
import { KodeKlasifikasiForm } from "@/components/pengaturan/kode-klasifikasi-form";
import { prisma } from "@/lib/prisma";

export default async function TambahKodeKlasifikasiPage() {
  const parents = await prisma.kode_klasifikasi.findMany({ where: { is_induk: true }, select: { id: true, kode: true, nama: true }, orderBy: { kode: "asc" } });
  return <div className="mx-auto w-full max-w-3xl space-y-6 p-6"><div className="flex items-start gap-4"><Link href="/admin/pengaturan/kode-klasifikasi" className="flex h-10 w-10 items-center justify-center rounded-md border bg-card shadow-sm hover:bg-muted" aria-label="Kembali ke kode klasifikasi"><ArrowLeft className="h-5 w-5" /></Link><div className="flex items-center gap-3"><div className="rounded-lg bg-primary/10 p-2 text-primary"><Tags className="h-5 w-5" /></div><div><h1 className="text-2xl font-bold tracking-tight">Tambah Kode Klasifikasi</h1><p className="text-muted-foreground">Tambahkan kode klasifikasi baru untuk arsip.</p></div></div></div><KodeKlasifikasiForm action={createKodeKlasifikasi} parents={parents.map((parent) => ({ ...parent, id: parent.id.toString() }))} submitLabel="Simpan Kode Klasifikasi" /></div>;
}
