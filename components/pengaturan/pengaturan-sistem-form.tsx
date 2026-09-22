"use client";

import { Save } from "lucide-react";
import { useFormStatus } from "react-dom";

type ServerAction = (formData: FormData) => void | Promise<void>;
type Settings = { nama_instansi: string; nama_sistem: string; deskripsi: string | null; tema: string; notifikasi_aktif: boolean };

export function PengaturanSistemForm({ action, settings }: { action: ServerAction; settings: Settings }) {
  return <form action={action} className="space-y-6">
    <div className="rounded-xl border bg-card shadow-sm"><div className="border-b p-6"><h2 className="font-semibold">Profil Sistem</h2><p className="text-sm text-muted-foreground">Informasi instansi dan sistem.</p></div><div className="space-y-5 p-6"><Field label="Nama Instansi"><input name="nama_instansi" required maxLength={255} defaultValue={settings.nama_instansi} className={inputClass} /></Field><Field label="Nama Sistem"><input name="nama_sistem" required maxLength={100} defaultValue={settings.nama_sistem} className={inputClass} /></Field><Field label="Deskripsi"><textarea name="deskripsi" rows={3} maxLength={2000} defaultValue={settings.deskripsi ?? ""} className="min-h-24 w-full resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" /></Field></div></div>
    <div className="rounded-xl border bg-card shadow-sm"><div className="border-b p-6"><h2 className="font-semibold">Preferensi</h2><p className="text-sm text-muted-foreground">Atur preferensi penggunaan sistem.</p></div><div className="divide-y"><div className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">Tema</p><p className="text-sm text-muted-foreground">Pilih tampilan sistem.</p></div><select name="tema" defaultValue={settings.tema} className="h-10 rounded-md border bg-background px-3 text-sm"><option value="terang">Terang</option><option value="gelap">Gelap</option><option value="sistem">Sistem</option></select></div><div className="flex items-center justify-between gap-4 p-6"><div><p className="font-medium">Notifikasi</p><p className="text-sm text-muted-foreground">Aktifkan notifikasi sistem.</p></div><input type="hidden" name="notifikasi_aktif" value="false" /><label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium"><input name="notifikasi_aktif" type="checkbox" value="true" defaultChecked={settings.notifikasi_aktif} className="h-4 w-4 rounded accent-primary" />Aktif</label></div></div></div>
    <div className="flex justify-end"><SubmitButton /></div>
  </form>;
}

function SubmitButton() { const { pending } = useFormStatus(); return <button type="submit" disabled={pending} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"><Save className="h-4 w-4" />{pending ? "Menyimpan..." : "Simpan Perubahan"}</button>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block space-y-2"><span className="text-sm font-medium">{label}</span>{children}</label>; }
const inputClass = "h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";
