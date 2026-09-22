"use client";

import Link from "next/link";
import { Save } from "lucide-react";
import { useState } from "react";

type LocationFormValues = { id?: string; jenis_lokasi?: string; kode?: string; nama?: string; parent_id?: string | null; keterangan?: string | null; aktif?: boolean; is_induk?: boolean };
type ParentOption = { id: string; kode: string; nama: string; parent_id: string | null };
type ServerAction = (formData: FormData) => void | Promise<void>;

export function LokasiPenyimpananForm({ action, parents, values = {}, submitLabel }: { action: ServerAction; parents: ParentOption[]; values?: LocationFormValues; submitLabel: string }) {
  const parentOptions = flattenParents(parents);
  const [isInduk, setIsInduk] = useState(values.is_induk ?? false);
  return <form action={action} className="overflow-hidden rounded-xl border bg-card shadow-sm">
    {values.id && <input type="hidden" name="id" value={values.id} />}
    <div className="space-y-6 p-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Jenis Lokasi *" htmlFor="jenis_lokasi"><input id="jenis_lokasi" name="jenis_lokasi" required maxLength={50} defaultValue={values.jenis_lokasi} placeholder="Contoh: Gedung" className={inputClass} /></Field>
        <Field label="Kode Lokasi *" htmlFor="kode"><input id="kode" name="kode" required maxLength={50} defaultValue={values.kode} placeholder="Contoh: GDG-A" className={inputClass} /></Field>
      </div>
      <Field label="Nama Lokasi *" htmlFor="nama"><input id="nama" name="nama" required maxLength={255} defaultValue={values.nama} placeholder="Contoh: Gedung Administrasi" className={inputClass} /></Field>
      <div className="space-y-2 rounded-lg border bg-muted/30 px-4 py-3"><label className="flex items-center gap-3 text-sm font-medium"><input type="checkbox" name="is_induk" value="true" checked={isInduk} onChange={(event) => setIsInduk(event.target.checked)} className="h-4 w-4 rounded border-input accent-primary" />Ini merupakan induk lokasi penyimpanan</label><p className="text-xs text-muted-foreground">Centang jika lokasi ini memiliki atau akan memiliki lokasi turunan. Lokasi yang berada di bawah lokasi lain juga bisa menjadi induk.</p></div>
      <Field label="Lokasi Induk" htmlFor="parent_id"><select id="parent_id" name="parent_id" defaultValue={values.parent_id ?? ""} className={inputClass}><option value="">Tidak memiliki induk</option>{parentOptions.map(({ location, level }) => <option key={location.id} value={location.id}>{`${"  ".repeat(level)}${level > 0 ? "└─ " : ""}${location.kode} — ${location.nama}`}</option>)}</select></Field>
      <Field label="Keterangan" htmlFor="keterangan"><textarea id="keterangan" name="keterangan" rows={4} maxLength={5000} defaultValue={values.keterangan ?? ""} placeholder="Tambahkan keterangan bila diperlukan." className="min-h-24 w-full resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" /></Field>
      <Field label="Status" htmlFor="aktif"><select id="aktif" name="aktif" defaultValue={values.aktif === false ? "false" : "true"} className={inputClass}><option value="true">Aktif</option><option value="false">Nonaktif</option></select></Field>
    </div>
    <div className="flex flex-col-reverse gap-3 border-t p-6 sm:flex-row sm:justify-end"><Link href="/admin/master-data/lokasi-penyimpanan" className="rounded-md border px-5 py-2 text-center text-sm font-medium hover:bg-muted">Batal</Link><button type="submit" className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"><Save className="h-4 w-4" />{submitLabel}</button></div>
  </form>;
}

function Field({ children, htmlFor, label }: { children: React.ReactNode; htmlFor: string; label: string }) { return <label className="block space-y-2" htmlFor={htmlFor}><span className="text-sm font-medium">{label}</span>{children}</label>; }
const inputClass = "h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

function flattenParents(locations: ParentOption[]) {
  const nodes = new Map(locations.map((location) => [location.id, { ...location, children: [] as ParentOption[] }]));
  const roots: (ParentOption & { children: ParentOption[] })[] = [];
  for (const node of nodes.values()) {
    const parent = node.parent_id ? nodes.get(node.parent_id) : undefined;
    if (parent && parent.id !== node.id) parent.children.push(node); else roots.push(node);
  }
  const rows: { location: ParentOption; level: number }[] = [];
  const visit = (node: ParentOption & { children?: ParentOption[] }, level: number) => {
    rows.push({ location: node, level });
    (node.children ?? []).sort((left, right) => left.kode.localeCompare(right.kode, "id")).forEach((child) => visit(child, level + 1));
  };
  roots.sort((left, right) => left.kode.localeCompare(right.kode, "id")).forEach((root) => visit(root, 0));
  return rows;
}
