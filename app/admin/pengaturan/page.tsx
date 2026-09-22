import { Settings } from "lucide-react";

import { updatePengaturanSistem } from "@/actions/pengaturan";
import { PengaturanSistemForm } from "@/components/pengaturan/pengaturan-sistem-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const defaultSettings = {
  nama_instansi: "PLN Batam",
  nama_sistem: "SIMARS",
  deskripsi: "Sistem Informasi Manajemen Arsip",
  tema: "terang",
  notifikasi_aktif: true,
};

export default async function PengaturanPage() {
  const settings = (await prisma.pengaturan_sistem.findUnique({ where: { id: 1 } })) ?? defaultSettings;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-muted p-2">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pengaturan</h1>
          <p className="text-muted-foreground">Kelola konfigurasi dan preferensi SIMARS.</p>
        </div>
      </div>

      <PengaturanSistemForm action={updatePengaturanSistem} settings={settings} />
    </div>
  );
}
