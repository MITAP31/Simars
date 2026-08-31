import { Plus, Search, MoreHorizontal } from "lucide-react";
import Link from "next/link";

const archives = [
  {
    number: "001/PLN-BTM/2026",
    title: "Surat Permohonan Data",
    category: "Surat Masuk",
    date: "31 Agustus 2026",
    status: "Aktif",
  },
  {
    number: "002/PLN-BTM/2026",
    title: "Laporan Kegiatan Bulanan",
    category: "Laporan",
    date: "30 Agustus 2026",
    status: "Aktif",
  },
  {
    number: "003/PLN-BTM/2026",
    title: "Surat Tugas Pegawai",
    category: "Surat Keluar",
    date: "29 Agustus 2026",
    status: "Aktif",
  },
  {
    number: "004/PLN-BTM/2026",
    title: "Dokumen Evaluasi Kinerja",
    category: "Dokumen",
    date: "28 Agustus 2026",
    status: "Aktif",
  },
  {
    number: "005/PLN-BTM/2026",
    title: "Berita Acara Rapat",
    category: "Berita Acara",
    date: "27 Agustus 2026",
    status: "Aktif",
  },
];

export default function ArsipPage() {
  return (
    <div className="space-y-6 p-6">
      {/* Header halaman */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Arsip
          </h1>

          <p className="text-muted-foreground">
            Kelola seluruh dokumen dan arsip.
          </p>
        </div>

        <Link
          href="/arsip/tambah"
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Tambah Arsip
        </Link>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <input
            type="text"
            placeholder="Cari nomor arsip, judul, atau kategori..."
            className="h-10 w-full rounded-md border bg-background pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto">
        <button
          type="button"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Semua
        </button>

        <button
          type="button"
          className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
        >
          Surat Masuk
        </button>

        <button
          type="button"
          className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
        >
          Surat Keluar
        </button>

        <button
          type="button"
          className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
        >
          Dokumen
        </button>

        <button
          type="button"
          className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
        >
          Laporan
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-5 py-3 text-left font-medium">
                  No. Arsip
                </th>

                <th className="px-5 py-3 text-left font-medium">
                  Judul
                </th>

                <th className="px-5 py-3 text-left font-medium">
                  Kategori
                </th>

                <th className="px-5 py-3 text-left font-medium">
                  Tanggal
                </th>

                <th className="px-5 py-3 text-left font-medium">
                  Status
                </th>

                <th className="px-5 py-3 text-right font-medium">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody>
              {archives.map((archive) => (
                <tr
                  key={archive.number}
                  className="border-b last:border-0 hover:bg-muted/30"
                >
                  <td className="px-5 py-4 font-medium">
                    {archive.number}
                  </td>

                  <td className="px-5 py-4">
                    <Link
                      href="/arsip/001"
                      className="font-medium hover:underline"
                    >
                      {archive.title}
                    </Link>
                  </td>

                  <td className="px-5 py-4">
                    {archive.category}
                  </td>

                  <td className="px-5 py-4 text-muted-foreground">
                    {archive.date}
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                      {archive.status}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      className="rounded-md p-2 hover:bg-muted"
                      aria-label="Menu arsip"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}