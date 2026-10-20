import { prisma } from "../lib/prisma";

async function runTests() {
  console.log("=== MEMULAI TEST INTEGRASI PENYERAHAN ARSIP ===");

  // 1. Cek User dan Divisi
  const testUser = await prisma.user.findFirst({
    where: { role: "user", aktif: true, divisi_id: { not: null } },
    include: { divisi: true },
  });

  if (!testUser || !testUser.divisi) {
    console.error("Tidak ada user aktif dengan divisi untuk testing.");
    process.exit(1);
  }

  console.log(`Menggunakan user test: ${testUser.nama} (${testUser.username}), Divisi: ${testUser.divisi.kode}`);

  // 2. Ambil master data aktif
  const klasifikasi = await prisma.kode_klasifikasi.findFirst({ where: { aktif: true } });
  if (!klasifikasi) {
    console.error("Tidak ada kode klasifikasi aktif.");
    process.exit(1);
  }

  const jenisArsip = await prisma.jenis_arsip.findFirst({ where: { aktif: true } });
  const lokasi = await prisma.lokasi_penyimpanan.findFirst({ where: { aktif: true } });

  const initialArsipCount = await prisma.arsip.count();
  const initialHeaderCount = await prisma.penyerahan_arsip.count();
  const initialDetailCount = await prisma.detail_penyerahan_arsip.count();

  console.log(`Initial DB State:`);
  console.log(`- tabel arsip count: ${initialArsipCount}`);
  console.log(`- tabel penyerahan_arsip count: ${initialHeaderCount}`);
  console.log(`- tabel detail_penyerahan_arsip count: ${initialDetailCount}`);

  // 3. Test Eksekusi Atomic Transaction (Simulasi Server Action Logic)
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const dateStr = `${yyyy}${mm}${dd}`;
  const cleanKode = testUser.divisi.kode.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

  let createdHeaderId: bigint | null = null;

  try {
    const res = await prisma.$transaction(async (tx) => {
      const startOfDay = new Date(Date.UTC(yyyy, now.getMonth(), now.getDate(), 0, 0, 0));
      const endOfDay = new Date(Date.UTC(yyyy, now.getMonth(), now.getDate() + 1, 0, 0, 0));

      const countToday = await tx.penyerahan_arsip.count({
        where: {
          created_at: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
      });

      const header = await tx.penyerahan_arsip.create({
        data: {
          user_id: testUser.id,
          divisi_id: testUser.divisi_id!,
          tanggal_penyerahan: new Date(),
          status: "DIBUAT",
          pihak_pertama_id: testUser.id,
          pihak_pertama_nama: testUser.nama,
          sumber_penyerahan: `${testUser.divisi?.kode} - ${testUser.divisi?.nama}`,
          keterangan: "Pengajuan berkas uji otomatis",
        },
      });

      const detail = await tx.detail_penyerahan_arsip.create({
        data: {
          penyerahan_id: header.id,
          kode_klasifikasi_id: klasifikasi.id,
          nama_arsip: "Laporan Uji Otomatis Sistem SIMARS",
          jenis_arsip_id: jenisArsip?.id ?? null,
          jumlah: 2,
          satuan: "Berkas",
          penulis_pengirim: "Divisi TI",
          kurun_waktu: "2026",
          tanggal_arsip: new Date("2026-10-01"),
          tingkat_keaslian: "Asli",
          lokasi_penyimpanan_id: lokasi?.id ?? null,
          keterangan: "Keterangan detail berkas uji",
          file_arsip: null,
          arsip_id: null,
        },
      });

      return { header, detail };
    });

    createdHeaderId = res.header.id;
    console.log("\n[TEST 1 PASS] Transaksi penyerahan berhasil disimpan:");
    console.log(`- ID Header: ${res.header.id}`);
    console.log(`- Status: ${res.header.status}`);
    console.log(`- ID Detail: ${res.detail.id}`);
    console.log(`- Judul: ${res.detail.nama_arsip}`);
    console.log(`- arsip_id: ${res.detail.arsip_id} (harus null)`);

    if (res.detail.arsip_id !== null) {
      throw new Error("arsip_id HARUS null pada saat pengajuan user!");
    }
  } catch (err) {
    console.error("Gagal saat menyimpan transaksi:", err);
    process.exit(1);
  }

  // 4. Verifikasi Isolasi: tabel arsip TIDAK boleh bertambah
  const postArsipCount = await prisma.arsip.count();
  console.log(`\n[TEST 2 PASS] Isolasi tabel arsip:`);
  console.log(`- Count arsip sebelum: ${initialArsipCount}`);
  console.log(`- Count arsip sesudah: ${postArsipCount}`);
  if (postArsipCount !== initialArsipCount) {
    throw new Error("Tabel arsip bertambah! Seharusnya data penyerahan tidak masuk ke tabel arsip.");
  }

  // 5. Test Rollback Atomik
  console.log("\n[TEST 3] Menguji atomisitas dan rollback saat detail gagal...");
  const countBeforeRollback = await prisma.penyerahan_arsip.count();
  let rollbackSuccess = false;

  try {
    await prisma.$transaction(async (tx) => {
      // Step A: Header dibuat
      const header = await tx.penyerahan_arsip.create({
        data: {
          user_id: testUser.id,
          divisi_id: testUser.divisi_id!,
          tanggal_penyerahan: new Date(),
          status: "DIBUAT",
          keterangan: "TEST-ROLLBACK",
        },
      });

      // Step B: Detail sengaja digagalkan dengan kode_klasifikasi non-existent
      await tx.detail_penyerahan_arsip.create({
        data: {
          penyerahan_id: header.id,
          kode_klasifikasi_id: BigInt(999999999), // Tidak ada, memicu FK violation
          nama_arsip: "Dokumen yang harus rollback",
        },
      });
    });
  } catch (err) {
    rollbackSuccess = true;
    console.log("- Expected error caught during transaction execution (FK violation as intended).");
  }

  const countAfterRollback = await prisma.penyerahan_arsip.count();
  if (rollbackSuccess && countAfterRollback === countBeforeRollback) {
    console.log("[TEST 3 PASS] Rollback bekerja sempurna! Header dibatalkan dan tidak tersisa di database.");
  } else {
    throw new Error(`Rollback gagal! Header bocor ke database. Count before: ${countBeforeRollback}, after: ${countAfterRollback}`);
  }

  // 6. Cleanup data uji dari TEST 1
  if (createdHeaderId) {
    await prisma.penyerahan_arsip.delete({
      where: { id: createdHeaderId },
    });
    console.log("\n[CLEANUP] Data penyerahan uji berhasil dibersihkan.");
  }

  console.log("\n=== SEMUA TEST INTEGRASI TAHAP 2 BERHASIL 100% ===");
}

runTests()
  .catch((e) => {
    console.error("Test failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
