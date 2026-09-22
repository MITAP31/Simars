"use client";

import Link from "next/link";
import { Save } from "lucide-react";

type DivisiFormValues = {
  id?: string;
  kode?: string;
  nama?: string;
  keterangan?: string | null;
  aktif?: boolean;
};

type ServerAction = (formData: FormData) => void | Promise<void>;

export function DivisiForm({ action, values = {}, submitLabel }: { action: ServerAction; values?: DivisiFormValues; submitLabel: string }) {
  return <form action={action} className="overflow-hidden rounded-xl border bg-card shadow-sm">
    {values.id && <input type="hidden" name="id" value={values.id} />}
    <div className="space-y-6 p-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Kode Divisi *" htmlFor="kode"><input id="kode" name="kode" required maxLength={50} defaultValue={values.kode} placeholder="Contoh: ADM" className={inputClass} /><span className="block text-xs text-muted-foreground">Gunakan kode atau singkatan sesuai dokumen resmi perusahaan.</span></Field>
        <Field label="Nama Divisi *" htmlFor="nama"><input id="nama" name="nama" required maxLength={255} defaultValue={values.nama} placeholder="Contoh: Divisi Administrasi" className={inputClass} /></Field>
      </div>
      <Field label="Keterangan" htmlFor="keterangan"><textarea id="keterangan" name="keterangan" rows={4} maxLength={5000} defaultValue={values.keterangan ?? ""} placeholder="Tambahkan keterangan bila diperlukan." className="min-h-24 w-full resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" /></Field>
      <Field label="Status" htmlFor="aktif"><select id="aktif" name="aktif" defaultValue={values.aktif === false ? "false" : "true"} className={inputClass}><option value="true">Aktif</option><option value="false">Nonaktif</option></select></Field>
    </div>
    <div className="flex flex-col-reverse gap-3 border-t p-6 sm:flex-row sm:justify-end">
      <Link href="/admin/master-data/divisi" className="rounded-md border px-5 py-2 text-center text-sm font-medium hover:bg-muted">Batal</Link>
      <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"><Save className="h-4 w-4" />{submitLabel}</button>
    </div>
  </form>;
}

function Field({ children, htmlFor, label }: { children: React.ReactNode; htmlFor: string; label: string }) {
  return <label className="block space-y-2" htmlFor={htmlFor}><span className="text-sm font-medium">{label}</span>{children}</label>;
}

const inputClass = "h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";
