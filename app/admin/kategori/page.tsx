import { MoreHorizontal, Plus } from "lucide-react";
import Link from "next/link";

const categories = [
  {
    name: "Administrasi",
    description: "Dokumen administrasi instansi",
    total: 125,
  },
  {
    name: "Keuangan",
    description: "Dokumen dan laporan keuangan",
    total: 84,
  },
  {
    name: "Kepegawaian",
    description: "Dokumen terkait kepegawaian",
    total: 63,
  },
  {
    name: "Operasional",
    description: "Dokumen kegiatan operasional",
    total: 97,
  },
  {
    name: "Pengadaan",
    description: "Dokumen pengadaan barang dan jasa",
    total: 45,
  },
  {
    name: "Hukum",
    description: "Dokumen dan surat terkait hukum",
    total: 28,
  },
];

export default function KategoriPage() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Kategori
          </h1>

          <p className="text-muted-foreground">
            Kelola kategori untuk pengelompokan arsip.
          </p>
        </div>

        <Link
          href="/admin/kategori/tambah"
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Tambah Kategori
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-5 py-3 text-left font-medium">
                  Nama Kategori
                </th>

                <th className="px-5 py-3 text-left font-medium">
                  Deskripsi
                </th>

                <th className="px-5 py-3 text-left font-medium">
                  Jumlah Arsip
                </th>

                <th className="px-5 py-3 text-right font-medium">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody>
              {categories.map((category) => (
                <tr
                  key={category.name}
                  className="border-b last:border-0 hover:bg-muted/30"
                >
                  <td className="px-5 py-4 font-medium">
                    {category.name}
                  </td>

                  <td className="px-5 py-4 text-muted-foreground">
                    {category.description}
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                      {category.total} arsip
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      className="rounded-md p-2 hover:bg-muted"
                      aria-label={`Menu ${category.name}`}
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