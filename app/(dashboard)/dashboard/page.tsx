import { Archive, ArrowUpRight, FileText, FolderOpen, Mail, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const statistics = [
  {
    title: "Total Arsip",
    value: "1.245",
    description: "Seluruh arsip",
    icon: Archive,
  },
  {
    title: "Surat Masuk",
    value: "523",
    description: "Arsip surat masuk",
    icon: Mail,
  },
  {
    title: "Surat Keluar",
    value: "412",
    description: "Arsip surat keluar",
    icon: FileText,
  },
  {
    title: "Dokumen Lainnya",
    value: "310",
    description: "Dokumen lainnya",
    icon: FolderOpen,
  },
];

const recentArchives = [
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

export default function DashboardPage() {
  return (
    <div className="space-y-7 p-6 lg:p-8">
      {/* Welcome */}
      <div className="relative overflow-hidden rounded-2xl bg-primary px-6 py-7 text-primary-foreground shadow-xl shadow-blue-500/20 sm:px-8">
        <div className="relative z-10">
          <p className="text-sm font-medium text-blue-100">Senin, 31 Agustus 2026</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Selamat datang di SIMARS</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">Pantau arsip dan dokumen PLN Batam dari satu tempat yang terorganisir.</p>
          <Link href="/arsip/tambah" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-primary shadow-lg transition-transform hover:-translate-y-0.5"><Plus className="h-4 w-4" /> Tambah Arsip</Link>
        </div>
        <div className="absolute -right-6 -top-12 h-64 w-64 opacity-90 drop-shadow-[0_18px_30px_rgba(0,0,0,0.12)]">
          <Image src="/pln-batam-mark-dark.svg" alt="Logo PLN Batam" fill sizes="256px" className="object-contain" priority />
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statistics.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="group rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
              <div className="flex items-start justify-between"><div className="rounded-xl bg-primary/10 p-2.5 text-primary"><Icon className="h-5 w-5" /></div><ArrowUpRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" /></div>
              <p className="mt-5 text-sm font-medium text-muted-foreground">{item.title}</p>
              <p className="mt-1 text-3xl font-bold tracking-tight">{item.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Archives */}
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
        <div className="flex items-center justify-between border-b p-5">
          <div><h2 className="font-semibold">Arsip Terbaru</h2>

          <p className="text-sm text-muted-foreground">
            Daftar arsip yang baru ditambahkan.
          </p></div>
          <Link href="/arsip" className="text-sm font-semibold text-primary hover:underline">Lihat semua</Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/70 text-xs uppercase tracking-wide text-muted-foreground">
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
              </tr>
            </thead>

            <tbody>
              {recentArchives.map((archive) => (
                <tr
                  key={archive.number}
                  className="border-b last:border-0 transition-colors hover:bg-primary/[0.03]"
                >
                  <td className="px-5 py-4 font-medium text-primary">
                    {archive.number}
                  </td>

                  <td className="px-5 py-4">
                    {archive.title}
                  </td>

                  <td className="px-5 py-4">
                    {archive.category}
                  </td>

                  <td className="px-5 py-4 text-muted-foreground">
                    {archive.date}
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/15">
                      {archive.status}
                    </span>
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
