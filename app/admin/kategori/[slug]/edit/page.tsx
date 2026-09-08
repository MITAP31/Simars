import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";

import { updateJenisArsip } from "@/actions/jenis-arsip";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditJenisArsipPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const jenis = await prisma.jenis_arsip.findUnique({
    where: { slug },
    select: { id: true, nama: true, keterangan: true, aktif: true },
  });
  if (!jenis) notFound();

  return <div className="mx-auto w-full max-w-3xl space-y-6 p-6"><div className="flex items-start gap-4"><Link href="/admin/kategori" className="flex h-10 w-10 items-center justify-center rounded-md border bg-card shadow-sm hover:bg-muted" aria-label="Kembali ke jenis arsip"><ArrowLeft className="h-5 w-5" /></Link><div><p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">SIMARS / ADMIN</p><h1 className="mt-1 text-2xl font-bold tracking-tight">Edit Jenis Arsip</h1><p className="text-sm text-muted-foreground">Perbarui nama dan status jenis arsip.</p></div></div><form action={updateJenisArsip} className="overflow-hidden rounded-xl border bg-card shadow-sm"><input type="hidden" name="id" value={jenis.id.toString()} /><div className="border-b bg-muted/35 p-6"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Pencil className="h-5 w-5" /></div><div><h2 className="font-semibold">Informasi Jenis Arsip</h2><p className="text-sm text-muted-foreground">Ubah status untuk menyembunyikan atau menampilkan jenis arsip pada form Arsip.</p></div></div></div><div className="space-y-6 p-6"><label className="block space-y-2" htmlFor="nama"><span className="text-sm font-medium">Nama Jenis Arsip</span><input id="nama" name="nama" required maxLength={100} defaultValue={jenis.nama} className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" /></label><label className="block space-y-2" htmlFor="keterangan"><span className="text-sm font-medium">Keterangan</span><textarea id="keterangan" name="keterangan" rows={3} maxLength={500} defaultValue={jenis.keterangan ?? ""} placeholder="Contoh: Dokumen untuk komunikasi internal." className="w-full resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" /></label><label className="block max-w-xs space-y-2" htmlFor="aktif"><span className="text-sm font-medium">Status</span><select id="aktif" name="aktif" defaultValue={jenis.aktif ? "true" : "false"} className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"><option value="true">Aktif</option><option value="false">Nonaktif</option></select></label></div><div className="flex justify-end gap-3 border-t p-6"><Link href="/admin/kategori" className="rounded-md border px-5 py-2 text-sm font-medium hover:bg-muted">Batal</Link><button type="submit" className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Simpan Perubahan</button></div></form></div>;
}
