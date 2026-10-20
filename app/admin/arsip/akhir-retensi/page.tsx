import Link from "next/link";
import { ArchiveRestore, ArrowLeft, FileText } from "lucide-react";

import { AkhirRetensiActions } from "@/components/arsip/akhir-retensi-actions";
import { prisma } from "@/lib/prisma";
import { calculateRetention, isArchivedRetentionEnd } from "@/lib/retensi";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function formatArchiveDate(date: Date | null) {
  return date ? dateFormatter.format(date) : "—";
}

export default async function AkhirRetensiPage() {
  const rawArchives = await prisma.arsip.findMany({
    where: {
      OR: [
        { status_arsip: "akhir_retensi" },
        {
          status_arsip: "tersimpan",
          kode_klasifikasi: {
            jadwal_retensi: {
              isNot: null,
            },
          },
        },
      ],
    },
    include: {
      kode_klasifikasi: {
        include: {
          jadwal_retensi: true,
        },
      },
      lokasi_penyimpanan: true,
      jenis_arsip: true,
    },
    orderBy: {
      updated_at: "desc",
    },
  });

  const currentDate = new Date();
  const arsip = rawArchives
    .filter((item) => {
      // Pastikan status_arsip = "dihapus" TIDAK PERNAH masuk ke Arsip Akhir Retensi
      if (item.status_arsip === "dihapus") {
        return false;
      }
      if (item.status_arsip === "akhir_retensi") {
        return true;
      }
      const schedule = item.kode_klasifikasi.jadwal_retensi;
      if (!schedule || !schedule.aktif) return false;
      const calc = calculateRetention({
        tanggalArsip: item.tanggal_arsip,
        tanggalDasarKhusus: item.tanggal_dasar_retensi,
        jadwalRetensi: schedule,
        currentDate,
      });
      return isArchivedRetentionEnd(calc, item.keputusan_retensi, item.status_arsip);
    })
    .map((item) => {
      const schedule = item.kode_klasifikasi.jadwal_retensi;
      const calc = schedule && schedule.aktif
        ? calculateRetention({
            tanggalArsip: item.tanggal_arsip,
            tanggalDasarKhusus: item.tanggal_dasar_retensi,
            jadwalRetensi: schedule,
            currentDate,
          })
        : null;

      const tanggalSelesai = calc?.tanggal_selesai_inaktif ?? item.tanggal_selesai_inaktif;
      return {
        ...item,
        retentionCalc: calc,
        tanggalSelesaiFormatted: formatArchiveDate(tanggalSelesai),
      };
    });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/arsip"
          className="rounded-md border p-2 hover:bg-muted"
          aria-label="Kembali ke daftar arsip"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Arsip Akhir Retensi</h1>
          <p className="text-sm text-muted-foreground">
            Berisi arsip yang telah selesai masa retensinya dan ditetapkan untuk dimusnahkan. Arsip tetap tersimpan dalam sistem sampai proses pemusnahan fisik dilakukan.
          </p>
        </div>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
          <ArchiveRestore className="h-3.5 w-3.5" />
          {arsip.length} arsip
        </span>
      </div>

      {arsip.length === 0 ? (
        <div className="rounded-xl border bg-card p-10 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <ArchiveRestore className="h-6 w-6" />
          </div>
          <p className="mt-4 font-semibold text-foreground">Tidak Ada Arsip di Akhir Retensi</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Belum ada arsip yang masa retensinya telah selesai dan menunggu pemusnahan fisik.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[1200px] w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left">
                  <Head>No</Head>
                  <Head>No. Arsip</Head>
                  <Head>Nama Arsip</Head>
                  <Head>Kode Klasifikasi</Head>
                  <Head>Status Retensi</Head>
                  <Head>Tanggal Selesai Retensi</Head>
                  <Head>Keterangan Akhir</Head>
                  <Head>Lokasi Simpan</Head>
                  <th className="px-5 py-3 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {arsip.map((item, index) => {
                  const location = item.lokasi_penyimpanan
                    ? `${item.lokasi_penyimpanan.kode} / ${item.lokasi_penyimpanan.nama}`
                    : "—";

                  return (
                    <tr
                      key={item.id.toString()}
                      className="border-b last:border-0 hover:bg-muted/30"
                    >
                      <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                        {index + 1}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 font-medium">
                        {item.nomor_arsip}
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/arsip/${item.id.toString()}`}
                          className="font-medium hover:underline"
                        >
                          {item.nama_arsip}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 font-medium">
                        {item.kode_klasifikasi.kode}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                          SELESAI
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                        {item.tanggalSelesaiFormatted}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                          {item.kode_klasifikasi.jadwal_retensi?.keterangan_akhir === "PERMANEN"
                            ? "Permanen"
                            : "Dimusnahkan"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                        {location}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        <AkhirRetensiActions
                          id={item.id.toString()}
                          name={item.nama_arsip}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Head({ children }: { children: React.ReactNode }) {
  return <th className="whitespace-nowrap px-5 py-3 font-medium">{children}</th>;
}
