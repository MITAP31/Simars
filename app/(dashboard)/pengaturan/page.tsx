import { Bell, Building2, Save, Settings } from "lucide-react";

export default function PengaturanPage() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-muted p-2">
            <Settings className="h-5 w-5" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Pengaturan
            </h1>

            <p className="text-muted-foreground">
              Kelola konfigurasi dan preferensi SIMARS.
            </p>
          </div>
        </div>
      </div>

      {/* Profil Sistem */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="flex items-center gap-3 border-b p-6">
          <Building2 className="h-5 w-5" />

          <div>
            <h2 className="font-semibold">
              Profil Sistem
            </h2>

            <p className="text-sm text-muted-foreground">
              Informasi instansi dan sistem.
            </p>
          </div>
        </div>

        <div className="space-y-5 p-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Nama Instansi
            </label>

            <input
              type="text"
              defaultValue="PLN Batam"
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Nama Sistem
            </label>

            <input
              type="text"
              defaultValue="SIMARS"
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Deskripsi
            </label>

            <textarea
              rows={3}
              defaultValue="Sistem Informasi Manajemen Arsip"
              className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="flex justify-end border-t p-6">
          <button
            type="button"
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Save className="h-4 w-4" />
            Simpan Perubahan
          </button>
        </div>
      </div>

      {/* Preferensi */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="flex items-center gap-3 border-b p-6">
          <Bell className="h-5 w-5" />

          <div>
            <h2 className="font-semibold">
              Preferensi
            </h2>

            <p className="text-sm text-muted-foreground">
              Atur preferensi penggunaan sistem.
            </p>
          </div>
        </div>

        <div className="divide-y">
          {/* Tema */}
          <div className="flex items-center justify-between p-6">
            <div>
              <p className="font-medium">
                Tema
              </p>

              <p className="text-sm text-muted-foreground">
                Pilih tampilan sistem.
              </p>
            </div>

            <select className="h-10 rounded-md border bg-background px-3 text-sm">
              <option>Terang</option>
              <option>Gelap</option>
              <option>Sistem</option>
            </select>
          </div>

          {/* Notifikasi */}
          <div className="flex items-center justify-between p-6">
            <div>
              <p className="font-medium">
                Notifikasi
              </p>

              <p className="text-sm text-muted-foreground">
                Aktifkan notifikasi sistem.
              </p>
            </div>

            <button
              type="button"
              className="relative h-6 w-11 rounded-full bg-primary"
              aria-label="Aktifkan notifikasi"
            >
              <span className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}