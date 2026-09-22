import Link from "next/link";
import { ArrowRight, Building2, Clock, Database, Tags, Warehouse } from "lucide-react";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MasterDataPage() {
  const [totalKlasifikasi, totalJadwalRetensi, totalDivisi, totalLokasi] = await Promise.all([
    prisma.kode_klasifikasi.count({ where: { aktif: true } }),
    prisma.jadwal_retensi.count({ where: { aktif: true } }),
    prisma.divisi.count({ where: { aktif: true } }),
    prisma.lokasi_penyimpanan.count({ where: { aktif: true } }),
  ]);

  const masterMenus = [
    {
      title: "Kode Klasifikasi",
      description: "Kelola kode dan struktur klasifikasi pengelompokan arsip.",
      href: "/admin/master-data/kode-klasifikasi",
      icon: Tags,
      stat: `${totalKlasifikasi} Aktif`,
    },
    {
      title: "Jadwal Retensi",
      description: "Kelola masa simpan aktif, inaktif, dan nasib akhir arsip.",
      href: "/admin/master-data/jadwal-retensi",
      icon: Clock,
      stat: `${totalJadwalRetensi} Aktif`,
    },
    {
      title: "Divisi",
      description: "Kelola data divisi atau unit organisasi pemilik arsip.",
      href: "/admin/master-data/divisi",
      icon: Building2,
      stat: `${totalDivisi} Aktif`,
    },
    {
      title: "Lokasi Penyimpanan",
      description: "Kelola lokasi fisik penyimpanan arsip secara hierarkis.",
      href: "/admin/master-data/lokasi-penyimpanan",
      icon: Warehouse,
      stat: `${totalLokasi} Aktif`,
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
          <Database className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Master Data</h1>
          <p className="text-muted-foreground">
            Kelola data referensi utama yang digunakan dalam sistem arsip SIMARS.
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {masterMenus.map((menu) => {
          const Icon = menu.icon;
          return (
            <Link
              key={menu.href}
              href={menu.href}
              className="group relative flex flex-col justify-between rounded-xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="rounded-lg bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    {menu.stat}
                  </span>
                </div>
                <h2 className="mt-4 text-lg font-semibold tracking-tight group-hover:text-primary transition-colors">
                  {menu.title}
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  {menu.description}
                </p>
              </div>

              <div className="mt-6 flex items-center gap-1.5 text-sm font-medium text-primary">
                <span>Buka Data</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
