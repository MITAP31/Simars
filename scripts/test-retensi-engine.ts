import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { calculateRetention, addRetentionDuration, normalizeDateToUTC, needsArchiveRetentionReview, isArchivedRetentionEnd } from "../lib/retensi";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function runTests() {
  console.log("==================================================");
  console.log("RUNNING COMPREHENSIVE RETENTION TESTS");
  console.log("==================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail?: any) {
    total++;
    if (condition) {
      console.log(`[PASS] Test ${total}: ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] Test ${total}: ${testName}`, detail || "");
    }
  }

  // TEST 1: Helper addRetentionDuration unit tests
  const d1 = new Date("2021-09-14T00:00:00.000Z");
  const add2Years = addRetentionDuration(d1, 2, "Tahun");
  assert(
    add2Years.toISOString().slice(0, 10) === "2023-09-14",
    "addRetentionDuration 2 Tahun dari 2021-09-14 menghasilkan 2023-09-14",
    add2Years.toISOString()
  );

  const add3Months = addRetentionDuration(d1, 3, "Bulan");
  assert(
    add3Months.toISOString().slice(0, 10) === "2021-12-14",
    "addRetentionDuration 3 Bulan dari 2021-09-14 menghasilkan 2021-12-14",
    add3Months.toISOString()
  );

  const add10Days = addRetentionDuration(d1, 10, "Hari");
  assert(
    add10Days.toISOString().slice(0, 10) === "2021-09-24",
    "addRetentionDuration 10 Hari dari 2021-09-14 menghasilkan 2021-09-24",
    add10Days.toISOString()
  );

  // Leap year safe test: 2024-02-29 + 1 year should be 2025-02-28
  const leapDate = new Date("2024-02-29T00:00:00.000Z");
  const leapPlus1Year = addRetentionDuration(leapDate, 1, "Tahun");
  assert(
    leapPlus1Year.toISOString().slice(0, 10) === "2025-02-28",
    "Leap year safe: 2024-02-29 + 1 Tahun menghasilkan 2025-02-28",
    leapPlus1Year.toISOString()
  );

  // TEST 2: Arsip dengan kode tanpa jadwal retensi
  const noSchedule = calculateRetention({
    tanggalArsip: new Date("2022-01-01T00:00:00.000Z"),
    jadwalRetensi: null,
  });
  assert(noSchedule === null, "calculateRetention returns null jika jadwalRetensi tidak ada");

  // TEST 3: Retensi Aktif
  // Misal arsip dibuat hari ini, retensi aktif 2 tahun, eval hari ini -> harus AKTIF
  const now = new Date();
  const testAktif = calculateRetention({
    tanggalArsip: now,
    jadwalRetensi: {
      retensi_aktif: 2,
      satuan_retensi_aktif: "Tahun",
      retensi_inaktif: 1,
      satuan_retensi_inaktif: "Tahun",
      keterangan_akhir: "PERMANEN",
    },
    currentDate: now,
  });
  assert(testAktif?.status_retensi === "AKTIF", "Fase Retensi Aktif dihitung dengan benar");

  // TEST 4: Retensi Inaktif
  // Tanggal arsip 3 tahun lalu, aktif 2 tahun, inaktif 2 tahun, eval sekarang -> harus INAKTIF
  const threeYearsAgo = new Date(now.getTime());
  threeYearsAgo.setUTCFullYear(threeYearsAgo.getUTCFullYear() - 3);
  const testInaktif = calculateRetention({
    tanggalArsip: threeYearsAgo,
    jadwalRetensi: {
      retensi_aktif: 2,
      satuan_retensi_aktif: "Tahun",
      retensi_inaktif: 2,
      satuan_retensi_inaktif: "Tahun",
      keterangan_akhir: "PERMANEN",
    },
    currentDate: now,
  });
  assert(testInaktif?.status_retensi === "INAKTIF", "Fase Retensi Inaktif dihitung dengan benar");

  // TEST 5: Tahap akhir Disimpan Permanen
  const sixYearsAgo = new Date(now.getTime());
  sixYearsAgo.setUTCFullYear(sixYearsAgo.getUTCFullYear() - 6);
  const testPermanen = calculateRetention({
    tanggalArsip: sixYearsAgo,
    jadwalRetensi: {
      retensi_aktif: 2,
      satuan_retensi_aktif: "Tahun",
      retensi_inaktif: 1,
      satuan_retensi_inaktif: "Tahun",
      keterangan_akhir: "PERMANEN",
    },
    currentDate: now,
  });
  assert(
    testPermanen?.status_retensi === "SELESAI" && testPermanen.keterangan_akhir === "PERMANEN",
    "Tahap akhir Disimpan Permanen terdeteksi",
    testPermanen
  );

  // TEST 6: Tahap akhir Dimusnahkan
  const testMusnah = calculateRetention({
    tanggalArsip: sixYearsAgo,
    jadwalRetensi: {
      retensi_aktif: 2,
      satuan_retensi_aktif: "Tahun",
      retensi_inaktif: 1,
      satuan_retensi_inaktif: "Tahun",
      keterangan_akhir: "MUSNAH",
    },
    currentDate: now,
  });
  assert(
    testMusnah?.status_retensi === "SELESAI" && testMusnah.keterangan_akhir === "MUSNAH",
    "Tahap akhir Dimusnahkan terdeteksi",
    testMusnah
  );

  // TEST 7: Tahap akhir Perlu Peninjauan
  const testTinjau = calculateRetention({
    tanggalArsip: sixYearsAgo,
    jadwalRetensi: {
      retensi_aktif: 2,
      satuan_retensi_aktif: "Tahun",
      retensi_inaktif: 1,
      satuan_retensi_inaktif: "Tahun",
      keterangan_akhir: "MUSNAH_DENGAN_KETERANGAN_KHUSUS",
    },
    currentDate: now,
  });
  assert(
    testTinjau?.status_retensi === "SELESAI" &&
      testTinjau.keterangan_akhir === "MUSNAH_DENGAN_KETERANGAN_KHUSUS",
    "Tahap akhir Perlu Peninjauan terdeteksi",
    testTinjau
  );

  // Verifikasi perilaku Nasib Akhir (needsArchiveRetentionReview & isArchivedRetentionEnd):
  // 1. Perlu Peninjauan: needsArchiveRetentionReview = true, isArchivedRetentionEnd = false
  assert(
    needsArchiveRetentionReview(testTinjau) === true && isArchivedRetentionEnd(testTinjau) === false,
    "Perlu Peninjauan: needsArchiveRetentionReview=true dan isArchivedRetentionEnd=false"
  );

  // 2. Dimusnahkan: needsArchiveRetentionReview = false, isArchivedRetentionEnd = true
  assert(
    needsArchiveRetentionReview(testMusnah) === false && isArchivedRetentionEnd(testMusnah) === true,
    "Dimusnahkan: needsArchiveRetentionReview=false dan isArchivedRetentionEnd=true (masuk Arsip Akhir Retensi)"
  );

  // 3. Disimpan Permanen: needsArchiveRetentionReview = false, isArchivedRetentionEnd = false
  assert(
    needsArchiveRetentionReview(testPermanen) === false && isArchivedRetentionEnd(testPermanen) === false,
    "Disimpan Permanen: needsArchiveRetentionReview=false dan isArchivedRetentionEnd=false (tetap di Arsip normal)"
  );

  // 4. Belum selesai retensi (Aktif/Inaktif): needsArchiveRetentionReview = false, isArchivedRetentionEnd = false
  assert(
    needsArchiveRetentionReview(testAktif) === false && isArchivedRetentionEnd(testAktif) === false,
    "Retensi belum selesai: needsArchiveRetentionReview=false dan isArchivedRetentionEnd=false"
  );

  // TEST 8 & 11: Data TEST-RETENSI (REN.01.02, 14 September 2021)
  console.log("\n--- TESTING ARSIP TEST-RETENSI (DATABASE) ---");
  const testArsip = await prisma.arsip.findFirst({
    where: {
      OR: [{ nomor_arsip: "TEST-RETENSI" }, { nama_arsip: "TEST-RETENSI" }],
    },
    include: {
      kode_klasifikasi: {
        include: { jadwal_retensi: true },
      },
    },
  });

  assert(Boolean(testArsip), "Data TEST-RETENSI ditemukan di database");

  if (testArsip && testArsip.kode_klasifikasi.jadwal_retensi) {
    const calcResult = calculateRetention({
      tanggalArsip: testArsip.tanggal_arsip,
      jadwalRetensi: testArsip.kode_klasifikasi.jadwal_retensi,
      currentDate: new Date(), // Menggunakan tanggal sistem aktual saat ini
    });

    console.log("Hasil calculateRetention untuk TEST-RETENSI:");
    console.log({
      nomor_arsip: testArsip.nomor_arsip,
      kode: testArsip.kode_klasifikasi.kode,
      tanggal_arsip: testArsip.tanggal_arsip?.toISOString().slice(0, 10),
      tanggal_mulai_aktif: calcResult?.tanggal_mulai_aktif?.toISOString().slice(0, 10),
      tanggal_selesai_aktif: calcResult?.tanggal_selesai_aktif?.toISOString().slice(0, 10),
      tanggal_selesai_inaktif: calcResult?.tanggal_selesai_inaktif?.toISOString().slice(0, 10),
      status_retensi: calcResult?.status_retensi,
      label_status: calcResult?.label_status,
      keterangan_akhir: calcResult?.keterangan_akhir,
    });

    assert(
      calcResult?.tanggal_mulai_aktif?.toISOString().slice(0, 10) === "2021-09-14",
      "Expected Tanggal Mulai Aktif: 14 September 2021"
    );
    assert(
      calcResult?.tanggal_selesai_aktif?.toISOString().slice(0, 10) === "2023-09-14",
      "Expected Tanggal Selesai Aktif: 14 September 2023"
    );
    assert(
      calcResult?.tanggal_selesai_inaktif?.toISOString().slice(0, 10) === "2026-09-14",
      "Expected Tanggal Selesai Inaktif: 14 September 2026"
    );

    // Sekarang sistem tanggal adalah September 2026.
    // Jika currentDate >= 2026-09-14, status adalah SELESAI_RETENSI (Perlu Peninjauan) atau INAKTIF jika sebelumnya.
    console.log(`Status saat ini berdasarkan tanggal sistem (${now.toISOString().slice(0, 10)}):`, calcResult?.status_retensi, `(${calcResult?.label_status})`);
  }

  // TEST 9: Boundary Tests (5 Tahun Aktif + 5 Tahun Inaktif dari 2026-01-01)
  console.log("\n--- TESTING BOUNDARY ENGINE (5 TAHUN AKTIF + 5 TAHUN INAKTIF) ---");
  const jra5Plus5 = {
    retensi_aktif: 5,
    satuan_retensi_aktif: "Tahun",
    retensi_inaktif: 5,
    satuan_retensi_inaktif: "Tahun",
    keterangan_akhir: "MUSNAH",
  };
  const tglArsip2026 = new Date("2026-01-01T00:00:00.000Z");

  // Batas 1: 1 hari sebelum selesai aktif (2030-12-31) -> AKTIF
  const b1 = calculateRetention({
    tanggalArsip: tglArsip2026,
    jadwalRetensi: jra5Plus5,
    currentDate: new Date("2030-12-31T00:00:00.000Z"),
  });
  assert(b1?.status_retensi === "AKTIF", "Boundary: 2030-12-31 (1 hari sebelum selesai aktif) -> AKTIF");

  // Batas 2: Tepat pada selesai aktif (2031-01-01) -> AKTIF (perilaku operator <=)
  const b2 = calculateRetention({
    tanggalArsip: tglArsip2026,
    jadwalRetensi: jra5Plus5,
    currentDate: new Date("2031-01-01T00:00:00.000Z"),
  });
  assert(b2?.status_retensi === "AKTIF", "Boundary: 2031-01-01 (tepat selesai aktif) -> AKTIF (hari terakhir masa aktif)");

  // Batas 3: 1 hari setelah selesai aktif (2031-01-02) -> INAKTIF
  const b3 = calculateRetention({
    tanggalArsip: tglArsip2026,
    jadwalRetensi: jra5Plus5,
    currentDate: new Date("2031-01-02T00:00:00.000Z"),
  });
  assert(b3?.status_retensi === "INAKTIF", "Boundary: 2031-01-02 (1 hari setelah selesai aktif) -> INAKTIF");

  // Batas 4: 1 hari sebelum selesai inaktif (2035-12-31) -> INAKTIF
  const b4 = calculateRetention({
    tanggalArsip: tglArsip2026,
    jadwalRetensi: jra5Plus5,
    currentDate: new Date("2035-12-31T00:00:00.000Z"),
  });
  assert(b4?.status_retensi === "INAKTIF", "Boundary: 2035-12-31 (1 hari sebelum selesai inaktif) -> INAKTIF");

  // Batas 5: Tepat pada selesai inaktif (2036-01-01) -> INAKTIF (perilaku operator <=)
  const b5 = calculateRetention({
    tanggalArsip: tglArsip2026,
    jadwalRetensi: jra5Plus5,
    currentDate: new Date("2036-01-01T00:00:00.000Z"),
  });
  assert(b5?.status_retensi === "INAKTIF", "Boundary: 2036-01-01 (tepat selesai inaktif) -> INAKTIF (hari terakhir masa inaktif)");

  // Batas 6: 1 hari setelah selesai inaktif (2036-01-02) -> SELESAI
  const b6 = calculateRetention({
    tanggalArsip: tglArsip2026,
    jadwalRetensi: jra5Plus5,
    currentDate: new Date("2036-01-02T00:00:00.000Z"),
  });
  assert(b6?.status_retensi === "SELESAI", "Boundary: 2036-01-02 (1 hari setelah selesai inaktif) -> SELESAI");

  // TEST 10: Verifikasi Master Data Jadwal Retensi tetap utuh
  const totalJadwal = await prisma.jadwal_retensi.count();
  assert(totalJadwal >= 10, `Master Data Jadwal Retensi tetap utuh (Jumlah: ${totalJadwal})`);

  console.log(`\n==================================================`);
  console.log(`TEST SUMMARY: ${passed} / ${total} tests passed.`);
  console.log(`==================================================\n`);
}

runTests()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
