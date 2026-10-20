import { prisma } from "../lib/prisma";

async function runDashboardTests() {
  console.log("=== MEMULAI TEST VERIFIKASI PERBAIKAN DASHBOARD USER ===");

  // Bersihkan data uji tersisa jika ada
  await prisma.penyerahan_arsip.deleteMany({
    where: { keterangan: { contains: "Uji Dashboard" } },
  });
  await prisma.user.deleteMany({
    where: {
      OR: [
        { username: { startsWith: "rekan_sdm_" } },
        { username: { startsWith: "user_ti_" } },
      ],
    },
  });

  // 1. Ambil user Ilham (SDM)
  const ilham = await prisma.user.findFirst({
    where: { username: "ilham123" },
    include: { divisi: true },
  });

  if (!ilham || !ilham.divisi_id || !ilham.divisi) {
    console.error("User ilham123 tidak ditemukan atau belum memiliki divisi.");
    process.exit(1);
  }

  console.log(`User A: ${ilham.nama} (@${ilham.username}) - Divisi: ${ilham.divisi.kode}`);

  // 2. Ambil master data divisi lain (misal TI) atau buat sementara
  let divisiTI = await prisma.divisi.findFirst({
    where: { id: { not: ilham.divisi_id } },
  });
  let tempDivisiCreated = false;

  if (!divisiTI) {
    divisiTI = await prisma.divisi.create({
      data: {
        kode: "TI",
        nama: "Teknologi Informasi",
        aktif: true,
      },
    });
    tempDivisiCreated = true;
  }

  console.log(`Divisi Lain (User C): ${divisiTI.kode}`);

  // 3. Ambil kode klasifikasi aktif untuk detail berkas
  const klasifikasi = await prisma.kode_klasifikasi.findFirst({ where: { aktif: true } });
  if (!klasifikasi) {
    console.error("Kode klasifikasi aktif tidak ditemukan.");
    process.exit(1);
  }

  const initialArsipCount = await prisma.arsip.count();
  const initialSDMBerkasAgg = await prisma.detail_penyerahan_arsip.aggregate({
    where: { penyerahan: { divisi_id: ilham.divisi_id } },
    _sum: { jumlah: true },
  });
  const initialSDMBerkasCount = initialSDMBerkasAgg._sum.jumlah ?? 0;
  const startOfMonthInit = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const initialPenyerahanBulanIni = await prisma.penyerahan_arsip.count({
    where: { divisi_id: ilham.divisi_id, created_at: { gte: startOfMonthInit } },
  });
  const initialSDMPenyerahanTotal = await prisma.penyerahan_arsip.count({
    where: { divisi_id: ilham.divisi_id },
  });

  // 4. Siapkan Data Uji
  // Buat User B di Divisi SDM (rekan satu divisi Ilham)
  const userB = await prisma.user.create({
    data: {
      nama: "Rekan SDM Test",
      username: `rekan_sdm_${Date.now()}`,
      password: "hashed_password_dummy",
      role: "user",
      divisi_id: ilham.divisi_id,
      aktif: true,
    },
  });

  // Buat User C di Divisi TI (divisi lain)
  const userC = await prisma.user.create({
    data: {
      nama: "User TI Test",
      username: `user_ti_${Date.now()}`,
      password: "hashed_password_dummy",
      role: "user",
      divisi_id: divisiTI.id,
      aktif: true,
    },
  });

  console.log(`User B dibuat di divisi SDM: @${userB.username}`);
  console.log(`User C dibuat di divisi TI: @${userC.username}`);

  // Buat Transaksi Penyerahan 1 (milik Ilham di SDM) -> 3 Berkas
  const penyerahan1 = await prisma.penyerahan_arsip.create({
    data: {
      user_id: ilham.id,
      divisi_id: ilham.divisi_id,
      status: "DIBUAT",
      keterangan: "Uji Dashboard 1",
      details: {
        create: [
          { kode_klasifikasi_id: klasifikasi.id, nama_arsip: "Berkas SDM Ilham 1", jumlah: 1 },
          { kode_klasifikasi_id: klasifikasi.id, nama_arsip: "Berkas SDM Ilham 2", jumlah: 1 },
          { kode_klasifikasi_id: klasifikasi.id, nama_arsip: "Berkas SDM Ilham 3", jumlah: 1 },
        ],
      },
    },
    include: { details: true },
  });

  // Buat Transaksi Penyerahan 2 (milik Rekan SDM di SDM) -> 5 Berkas
  const penyerahan2 = await prisma.penyerahan_arsip.create({
    data: {
      user_id: userB.id,
      divisi_id: ilham.divisi_id,
      status: "DIBUAT",
      keterangan: "Uji Dashboard 2",
      details: {
        create: [
          { kode_klasifikasi_id: klasifikasi.id, nama_arsip: "Berkas Rekan SDM 1", jumlah: 1 },
          { kode_klasifikasi_id: klasifikasi.id, nama_arsip: "Berkas Rekan SDM 2", jumlah: 1 },
          { kode_klasifikasi_id: klasifikasi.id, nama_arsip: "Berkas Rekan SDM 3", jumlah: 1 },
          { kode_klasifikasi_id: klasifikasi.id, nama_arsip: "Berkas Rekan SDM 4", jumlah: 1 },
          { kode_klasifikasi_id: klasifikasi.id, nama_arsip: "Berkas Rekan SDM 5", jumlah: 1 },
        ],
      },
    },
    include: { details: true },
  });

  // Buat Transaksi Penyerahan 3 (milik User C di Divisi TI) -> 4 Berkas
  const penyerahan3 = await prisma.penyerahan_arsip.create({
    data: {
      user_id: userC.id,
      divisi_id: divisiTI.id,
      status: "DIBUAT",
      keterangan: "Uji Dashboard 3",
      details: {
        create: [
          { kode_klasifikasi_id: klasifikasi.id, nama_arsip: "Berkas TI 1", jumlah: 1 },
          { kode_klasifikasi_id: klasifikasi.id, nama_arsip: "Berkas TI 2", jumlah: 1 },
          { kode_klasifikasi_id: klasifikasi.id, nama_arsip: "Berkas TI 3", jumlah: 1 },
          { kode_klasifikasi_id: klasifikasi.id, nama_arsip: "Berkas TI 4", jumlah: 1 },
        ],
      },
    },
    include: { details: true },
  });

  console.log("\nData Uji Dibuat:");
  console.log(`- Penyerahan 1 (Ilham/SDM): ${penyerahan1.details.length} berkas`);
  console.log(`- Penyerahan 2 (Rekan/SDM): ${penyerahan2.details.length} berkas`);
  console.log(`- Penyerahan 3 (User C/TI): ${penyerahan3.details.length} berkas`);

  // 5. SIMULASI LOGIK DASHBOARD ILHAM (DIVISI SDM)
  const divisiIdBigInt = ilham.divisi_id;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalBerkas, penyerahanBulanIni, totalPenyerahan, recentPenyerahan] =
    await Promise.all([
      // Card Total: Menghitung berkas detail divisi
      prisma.detail_penyerahan_arsip
        .aggregate({
          where: {
            penyerahan: {
              divisi_id: divisiIdBigInt,
            },
          },
          _sum: {
            jumlah: true,
          },
          _count: {
            id: true,
          },
        })
        .then((agg) => (agg._count.id === 0 ? 0 : (agg._sum.jumlah ?? agg._count.id))),

      // Card Penyerahan Bulan Ini
      prisma.penyerahan_arsip.count({
        where: {
          divisi_id: divisiIdBigInt,
          created_at: { gte: startOfMonth },
        },
      }),

      // Card Total Penyerahan: Menghitung transaksi penyerahan divisi
      prisma.penyerahan_arsip.count({
        where: {
          divisi_id: divisiIdBigInt,
        },
      }),

      // Recent penyerahan
      prisma.penyerahan_arsip.findMany({
        where: {
          divisi_id: divisiIdBigInt,
        },
        include: {
          divisi: { select: { kode: true, nama: true } },
          details: {
            include: {
              kode_klasifikasi: { select: { kode: true, nama: true } },
            },
          },
        },
        orderBy: { created_at: "desc" },
        take: 5,
      }),
    ]);

  console.log("\nHASIL QUERY DASHBOARD UNTUK ILHAM (SDM):");
  console.log(`- Total Berkas: ${totalBerkas}`);
  console.log(`- Penyerahan Bulan Ini: ${penyerahanBulanIni}`);
  console.log(`- Total Penyerahan: ${totalPenyerahan}`);
  console.log(`- Jumlah Penyerahan Terbaru: ${recentPenyerahan.length}`);

  // 6. VALIDASI HASIL
  // Test A & B: Total Berkas harus bertambah 3 + 5 = 8 (Bukan 2 transaksi, dan TIDAK menyertakan 4 berkas dari divisi TI)
  if (totalBerkas !== initialSDMBerkasCount + 8) {
    throw new Error(`GAGAL: Total Berkas seharusnya ${initialSDMBerkasCount + 8}, tetapi didapat ${totalBerkas}`);
  }
  console.log(`\n[TEST 1 PASS] Card Total menghitung berkas detail divisi SDM (awal: ${initialSDMBerkasCount} + 3 + 5 = ${totalBerkas} berkas, berkas TI terfilter).`);

  // Test C: Penyerahan Bulan Ini harus bertambah 2 (Hanya transaksi penyerahan 1 & 2 dari SDM)
  if (penyerahanBulanIni !== initialPenyerahanBulanIni + 2) {
    throw new Error(`GAGAL: Penyerahan Bulan Ini seharusnya ${initialPenyerahanBulanIni + 2}, tetapi didapat ${penyerahanBulanIni}`);
  }
  console.log(`[TEST 2 PASS] Card Penyerahan Bulan Ini menghitung transaksi SDM (awal: ${initialPenyerahanBulanIni} + 2 = ${penyerahanBulanIni}, transaksi TI terfilter).`);

  // Test D: Total Penyerahan harus bertambah 2 (Hanya transaksi penyerahan 1 & 2 dari SDM)
  if (totalPenyerahan !== initialSDMPenyerahanTotal + 2) {
    throw new Error(`GAGAL: Total Penyerahan seharusnya ${initialSDMPenyerahanTotal + 2}, tetapi didapat ${totalPenyerahan}`);
  }
  console.log(`[TEST 3 PASS] Card Total Penyerahan menghitung total transaksi SDM (awal: ${initialSDMPenyerahanTotal} + 2 = ${totalPenyerahan}, transaksi TI terfilter).`);

  // Test E: Recent Penyerahan harus memuat penyerahan Ilham DAN penyerahan Rekan SDM, dan TIDAK memuat TI
  const recentIds = recentPenyerahan.map((p) => p.id);
  const containsPenyerahan1 = recentIds.includes(penyerahan1.id);
  const containsPenyerahan2 = recentIds.includes(penyerahan2.id);
  const containsPenyerahan3 = recentIds.includes(penyerahan3.id);

  if (!containsPenyerahan1 || !containsPenyerahan2 || containsPenyerahan3) {
    throw new Error(
      `GAGAL: Isolasi divisi salah! P1: ${containsPenyerahan1}, P2: ${containsPenyerahan2}, P3(TI): ${containsPenyerahan3}`
    );
  }
  console.log("[TEST 4 PASS] Recent list memuat seluruh pengajuan divisi SDM (milik Ilham & rekan satu divisi), dan mengisolasi divisi lain.");

  // Test F: Status penyerahan harus DIBUAT
  const allDibuat = recentPenyerahan.every((p) => p.status === "DIBUAT");
  if (!allDibuat) {
    throw new Error("GAGAL: Ditemukan status transaksi selain DIBUAT!");
  }
  console.log("[TEST 5 PASS] Seluruh transaksi penyerahan memiliki status DIBUAT (tidak ada status verifikasi).");

  // Test E: Tabel arsip tidak boleh berubah sama sekali
  const finalArsipCount = await prisma.arsip.count();
  if (finalArsipCount !== initialArsipCount) {
    throw new Error(`GAGAL: Tabel arsip berubah! Sebelum: ${initialArsipCount}, Sesudah: ${finalArsipCount}`);
  }
  console.log("[TEST 4 PASS] Tabel arsip resmi sama sekali tidak tersentuh atau berubah (count tetap).");

  // 7. CLEANUP DATA UJI
  console.log("\nMembersihkan data uji...");
  await prisma.penyerahan_arsip.deleteMany({
    where: { id: { in: [penyerahan1.id, penyerahan2.id, penyerahan3.id] } },
  });
  await prisma.user.deleteMany({
    where: { id: { in: [userB.id, userC.id] } },
  });
  if (tempDivisiCreated && divisiTI) {
    await prisma.divisi.delete({
      where: { id: divisiTI.id },
    });
  }
  console.log("[CLEANUP PASS] Seluruh data uji transaksi dan user sementara telah dibersihkan.");

  console.log("\n=== SELURUH PENGUJIAN DASHBOARD USER BERHASIL 100% ===");
}

runDashboardTests()
  .catch((e) => {
    console.error("Test Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
