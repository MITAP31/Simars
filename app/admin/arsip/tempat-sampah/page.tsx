import { TrashActions } from "@/components/arsip/trash-action";
import { prisma } from "@/lib/prisma";

export default async function TempatSampahPage() {
  const arsip = await prisma.arsip.findMany({
    where: {
      status_arsip: "dihapus",
    },
    include: {
      kode_klasifikasi: true,
      lokasi_penyimpanan: true,
      jenis_arsip: true,
    },
    orderBy: {
      updated_at: "desc",
    },
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Arsip Akhir Retensi</h1>
          <p className="text-muted-foreground">Daftar arsip yang telah mencapai akhir masa simpan atau dipindahkan. Arsip tetap tersimpan dan dapat dipulihkan bila diperlukan.</p>
        </div>
        <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
          {arsip.length} arsip
        </span>
      </div>

      {arsip.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center shadow-sm">
          <p className="font-medium">Tidak ada arsip di akhir retensi</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Belum ada arsip pada daftar penampungan akhir retensi.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[1200px] w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left">
                  <Head>Nomor Arsip</Head>
                  <Head>Klasifikasi</Head>
                  <Head>Nama Arsip</Head>
                  <Head>Jenis Arsip</Head>
                  <Head>Jumlah</Head>
                  <Head>Kurun Waktu</Head>
                  <Head>Lokasi</Head>
                  <th className="px-5 py-3 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
              {arsip.map((item) => (
                <tr key={item.id.toString()} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="whitespace-nowrap px-5 py-4 font-medium">
                    {item.nomor_arsip}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    {item.kode_klasifikasi.kode}
                  </td>

                  <td className="px-5 py-4 font-medium">
                    {item.nama_arsip}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    {item.jenis_arsip?.nama ?? "—"}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    {item.jumlah} {item.satuan || ""}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    {item.kurun_waktu || "—"}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                    {item.lokasi_penyimpanan
                      ? `${item.lokasi_penyimpanan.kode} / ${item.lokasi_penyimpanan.nama}`
                      : "—"}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <TrashActions id={item.id.toString()} name={item.nama_arsip} />
                  </td>
                </tr>
              ))}
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
