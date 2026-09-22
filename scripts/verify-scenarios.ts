import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { calculateRetention } from "../lib/retensi";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function verifySpecificScenarios() {
  console.log("==================================================");
  console.log("VERIFIKASI SCENARIO SPESIFIK USER");
  console.log("==================================================\n");

  // 1. Ambil Jadwal Retensi REN.00.01, REN.01.01, REN.01.02
  const schedules = await prisma.jadwal_retensi.findMany({
    where: {
      kode_klasifikasi: {
        kode: { in: ["REN.00.01", "REN.01.01", "REN.01.02"] },
      },
    },
    include: { kode_klasifikasi: true },
  });

  const ren0001 = schedules.find((s) => s.kode_klasifikasi.kode === "REN.00.01");
  const ren0101 = schedules.find((s) => s.kode_klasifikasi.kode === "REN.01.01");
  const ren0102 = schedules.find((s) => s.kode_klasifikasi.kode === "REN.01.02");

  console.log("--- 1. REN.00.01 ---");
  console.log("Nama:", ren0001?.kode_klasifikasi.nama);
  console.log("Aturan: Aktif", ren0001?.retensi_aktif, ren0001?.satuan_retensi_aktif, "+ Inaktif", ren0001?.retensi_inaktif, ren0001?.satuan_retensi_inaktif);
  console.log("Dasar:", ren0001?.dasar_perhitungan, "| Nasib Akhir:", ren0001?.keterangan_akhir);
  const sim0001 = calculateRetention({
    tanggalArsip: new Date("2024-01-01T00:00:00.000Z"),
    jadwalRetensi: ren0001,
    currentDate: new Date("2026-09-15T00:00:00.000Z"),
  });
  console.log("Hasil Simulasi (Tgl Arsip 2024-01-01, Eval 2026-09-15):", {
    mulai_aktif: sim0001?.tanggal_mulai_aktif?.toISOString().slice(0, 10),
    selesai_aktif: sim0001?.tanggal_selesai_aktif?.toISOString().slice(0, 10),
    selesai_inaktif: sim0001?.tanggal_selesai_inaktif?.toISOString().slice(0, 10),
    status_retensi: sim0001?.status_retensi,
    nasib_akhir: sim0001?.keterangan_akhir,
  });

  console.log("\n--- 2. REN.01.01 ---");
  console.log("Nama:", ren0101?.kode_klasifikasi.nama);
  console.log("Aturan: Aktif", ren0101?.retensi_aktif, ren0101?.satuan_retensi_aktif, "+ Inaktif", ren0101?.retensi_inaktif, ren0101?.satuan_retensi_inaktif);
  console.log("Dasar:", ren0101?.dasar_perhitungan, "| Nasib Akhir:", ren0101?.keterangan_akhir);
  const sim0101 = calculateRetention({
    tanggalArsip: new Date("2024-01-01T00:00:00.000Z"),
    jadwalRetensi: ren0101,
    currentDate: new Date("2026-09-15T00:00:00.000Z"),
  });
  console.log("Hasil Simulasi (Tgl Arsip 2024-01-01, Eval 2026-09-15):", {
    mulai_aktif: sim0101?.tanggal_mulai_aktif?.toISOString().slice(0, 10),
    selesai_aktif: sim0101?.tanggal_selesai_aktif?.toISOString().slice(0, 10),
    selesai_inaktif: sim0101?.tanggal_selesai_inaktif?.toISOString().slice(0, 10),
    status_retensi: sim0101?.status_retensi,
    nasib_akhir: sim0101?.keterangan_akhir,
  });

  console.log("\n--- 3. REN.01.02 ---");
  console.log("Nama:", ren0102?.kode_klasifikasi.nama);
  console.log("Aturan: Aktif", ren0102?.retensi_aktif, ren0102?.satuan_retensi_aktif, "+ Inaktif", ren0102?.retensi_inaktif, ren0102?.satuan_retensi_inaktif);
  console.log("Dasar:", ren0102?.dasar_perhitungan || "(kosong / teks bebas)", "| Nasib Akhir:", ren0102?.keterangan_akhir);
  const sim0102 = calculateRetention({
    tanggalArsip: new Date("2021-09-14T00:00:00.000Z"),
    jadwalRetensi: ren0102,
    currentDate: new Date("2026-09-15T00:00:00.000Z"),
  });
  console.log("Hasil Simulasi (Tgl Arsip 2021-09-14, Eval 2026-09-15):", {
    mulai_aktif: sim0102?.tanggal_mulai_aktif?.toISOString().slice(0, 10),
    selesai_aktif: sim0102?.tanggal_selesai_aktif?.toISOString().slice(0, 10),
    selesai_inaktif: sim0102?.tanggal_selesai_inaktif?.toISOString().slice(0, 10),
    status_retensi: sim0102?.status_retensi,
    nasib_akhir: sim0102?.keterangan_akhir,
  });

  console.log("\n--- 4. DATA LAMA TEST-RETENSI DI DATABASE ---");
  const testData = await prisma.arsip.findFirst({
    where: {
      OR: [{ nomor_arsip: "TEST-RETENSI" }, { nama_arsip: "TEST-RETENSI" }],
    },
    include: {
      kode_klasifikasi: {
        include: { jadwal_retensi: true },
      },
    },
  });
  console.log("Data fisik di DB:", {
    id: testData?.id.toString(),
    nomor_arsip: testData?.nomor_arsip,
    nama_arsip: testData?.nama_arsip,
    tanggal_arsip: testData?.tanggal_arsip?.toISOString().slice(0, 10),
    status_retensi: testData?.status_retensi,
    tanggal_dasar_retensi: testData?.tanggal_dasar_retensi,
    tanggal_mulai_aktif: testData?.tanggal_mulai_aktif,
  });
  const dynamicCalc = testData && testData.kode_klasifikasi.jadwal_retensi
    ? calculateRetention({
        tanggalArsip: testData.tanggal_arsip,
        jadwalRetensi: testData.kode_klasifikasi.jadwal_retensi,
      })
    : null;
  console.log("Perhitungan Dinamis untuk Data Lama (tanpa ubah DB):", {
    mulai_aktif: dynamicCalc?.tanggal_mulai_aktif?.toISOString().slice(0, 10),
    selesai_aktif: dynamicCalc?.tanggal_selesai_aktif?.toISOString().slice(0, 10),
    selesai_inaktif: dynamicCalc?.tanggal_selesai_inaktif?.toISOString().slice(0, 10),
    status_retensi: dynamicCalc?.status_retensi,
    nasib_akhir: dynamicCalc?.keterangan_akhir,
  });
}

verifySpecificScenarios()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
