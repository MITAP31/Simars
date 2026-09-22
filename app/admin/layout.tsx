import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { calculateRetention, needsArchiveRetentionReview } from "@/lib/retensi";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireAdmin();

  // 1 query untuk kategori dan 1 query efisien untuk arsip yang berpotensi selesai masa retensi
  const [categories, archivesWithSchedule] = await Promise.all([
    prisma.jenis_arsip.findMany({
      where: { aktif: true },
      select: { nama: true, slug: true },
      orderBy: { nama: "asc" },
    }),
    prisma.arsip.findMany({
      where: {
        status_arsip: "tersimpan",
        kode_klasifikasi: {
          jadwal_retensi: {
            isNot: null,
          },
        },
      },
      select: {
        id: true,
        nomor_arsip: true,
        nama_arsip: true,
        tanggal_arsip: true,
        status_retensi: true,
        tanggal_dasar_retensi: true,
        tanggal_mulai_aktif: true,
        tanggal_selesai_aktif: true,
        tanggal_selesai_inaktif: true,
        kode_klasifikasi: {
          select: {
            kode: true,
            nama: true,
            jadwal_retensi: true,
          },
        },
      },
    }),
  ]);

  // Evaluasi retensi dinamis menggunakan engine retensi (konsisten untuk data lama dan baru)
  const currentDate = new Date();
  const retentionNotifications = archivesWithSchedule
    .map((archive) => {
      const schedule = archive.kode_klasifikasi.jadwal_retensi;
      if (!schedule || !schedule.aktif) return null;

      const calc = calculateRetention({
        tanggalArsip: archive.tanggal_arsip,
        tanggalDasarKhusus: archive.tanggal_dasar_retensi,
        jadwalRetensi: schedule,
        currentDate,
      });

      if (!calc || !needsArchiveRetentionReview(calc, archive.status_retensi)) {
        return null;
      }

      return {
        id: archive.id.toString(),
        nomor_arsip: archive.nomor_arsip,
        nama_arsip: archive.nama_arsip,
        kode_klasifikasi: archive.kode_klasifikasi.kode,
        keterangan_akhir: schedule.keterangan_akhir,
        tanggal_selesai_inaktif: calc.tanggal_selesai_inaktif
          ? dateFormatter.format(calc.tanggal_selesai_inaktif)
          : "—",
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <div className="flex min-h-screen">
      <Sidebar categories={categories} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          user={{ name: user.nama, role: "Administrator", username: user.username }}
          retentionNotifications={retentionNotifications}
        />

        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
