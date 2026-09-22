"use client";

import Link from "next/link";
import { Save } from "lucide-react";
import { useState } from "react";

type ClassificationFormValues = {
  id?: string;
  kode?: string;
  nama?: string;
  jenis_klasifikasi?: string | null;
  keterangan?: string | null;
  aktif?: boolean;
  is_induk?: boolean;
  parent_id?: string | null;
};

type ParentOption = { id: string; kode: string; nama: string };

type ServerAction = (formData: FormData) => void | Promise<void>;

export function KodeKlasifikasiForm({ action, parents, values = {}, submitLabel }: { action: ServerAction; parents: ParentOption[]; values?: ClassificationFormValues; submitLabel: string }) {
  const [isInduk, setIsInduk] = useState(values.is_induk ?? false);

  return (
    <form action={action} className="overflow-hidden rounded-xl border bg-card shadow-sm">
      {values.id && <input type="hidden" name="id" value={values.id} />}
      <div className="space-y-6 p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Field label="Kode" htmlFor="kode"><input id="kode" name="kode" required maxLength={50} defaultValue={values.kode} placeholder="Contoh: ADM-01" className={inputClass} /></Field>
          <Field label="Nama" htmlFor="nama"><input id="nama" name="nama" required maxLength={255} defaultValue={values.nama} placeholder="Contoh: Administrasi Umum" className={inputClass} /></Field>
        </div>
        <Field label="Jenis Klasifikasi" htmlFor="jenis_klasifikasi"><input id="jenis_klasifikasi" name="jenis_klasifikasi" maxLength={50} defaultValue={values.jenis_klasifikasi ?? ""} placeholder="Contoh: Substantif" className={inputClass} /></Field>
        <div className="space-y-2 rounded-lg border bg-muted/30 px-4 py-3"><label className="flex items-center gap-3 text-sm font-medium"><input type="checkbox" name="is_induk" value="true" checked={isInduk} onChange={(event) => setIsInduk(event.target.checked)} className="h-4 w-4 rounded border-input accent-primary" />Ini merupakan Induk Klasifikasi</label><p className="text-xs text-muted-foreground">Centang jika kode ini memiliki atau akan memiliki kode klasifikasi turunan. Kode yang berada di bawah kode lain juga bisa menjadi induk.</p></div>
        <Field label="Induk Klasifikasi" htmlFor="parent_id"><select id="parent_id" name="parent_id" defaultValue={values.parent_id ?? ""} className={inputClass}><option value="">Tidak memiliki induk</option>{parents.map((parent) => <option key={parent.id} value={parent.id}>{parent.kode} - {parent.nama}</option>)}</select></Field>
        <Field label="Keterangan" htmlFor="keterangan"><textarea id="keterangan" name="keterangan" rows={4} maxLength={5000} defaultValue={values.keterangan ?? ""} placeholder="Tambahkan keterangan bila diperlukan." className="min-h-24 w-full resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" /></Field>
        <Field label="Status" htmlFor="aktif"><select id="aktif" name="aktif" defaultValue={values.aktif === false ? "false" : "true"} className={inputClass}><option value="true">Aktif</option><option value="false">Nonaktif</option></select></Field>
      </div>
      <div className="flex flex-col-reverse gap-3 border-t p-6 sm:flex-row sm:justify-end">
        <Link href="/admin/master-data/kode-klasifikasi" className="rounded-md border px-5 py-2 text-center text-sm font-medium hover:bg-muted">Batal</Link>
        <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"><Save className="h-4 w-4" />{submitLabel}</button>
      </div>
    </form>
  );
}

function Field({ children, htmlFor, label }: { children: React.ReactNode; htmlFor: string; label: string }) {
  return <label className="block space-y-2" htmlFor={htmlFor}><span className="text-sm font-medium">{label}</span>{children}</label>;
}

const inputClass = "h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";
