import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";

import { createDivisi } from "@/actions/divisi";
import { DivisiForm } from "@/components/pengaturan/divisi-form";

export const dynamic = "force-dynamic";

export default function TambahDivisiPage() {
  return <div className="mx-auto w-full max-w-3xl space-y-6 p-6"><div className="flex items-start gap-4"><Link href="/admin/master-data/divisi" className="flex h-10 w-10 items-center justify-center rounded-md border bg-card shadow-sm hover:bg-muted" aria-label="Kembali ke divisi"><ArrowLeft className="h-5 w-5" /></Link><div className="flex items-center gap-3"><div className="rounded-lg bg-primary/10 p-2 text-primary"><Building2 className="h-5 w-5" /></div><div><h1 className="text-2xl font-bold tracking-tight">Tambah Divisi</h1><p className="text-muted-foreground">Tambahkan data divisi baru untuk perusahaan.</p></div></div></div><DivisiForm action={createDivisi} submitLabel="Simpan Divisi" /></div>;
}
