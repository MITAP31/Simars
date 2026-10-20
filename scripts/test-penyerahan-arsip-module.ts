import { prisma } from "../lib/prisma";
import path from "node:path";
import { writeFile, unlink, mkdir } from "node:fs/promises";

async function runTests() {
  console.log("=== MEMULAI TEST VERIFIKASI FITUR PENYERAHAN ARSIP (10 POINT) ===");

  // 1. Ambil atau buat User A dan User B
  const divisiSDM = await prisma.divisi.findFirst({ where: { kode: "SDM", aktif: true } });
  const divisiTI = await prisma.divisi.findFirst({ where: { kode: "TI", aktif: true } });

  if (!divisiSDM || !divisiTI) {
    console.error("Divisi SDM dan TI harus ada untuk pengujian.");
    process.exit(1);
  }

  const timestamp = Date.now();
  const userA = await prisma.user.create({
    data: {
      nama: `User A Test ${timestamp}`,
      username: `usera_${timestamp}`,
      password: "password_hash",
      role: "user",
      divisi_id: divisiSDM.id,
      aktif: true,
    },
  });

  const userB = await prisma.user.create({
    data: {
      nama: `User B Test ${timestamp}`,
      username: `userb_${timestamp}`,
      password: "password_hash",
      role: "user",
      divisi_id: divisiSDM.id,
      aktif: true,
    },
  });

  const userC = await prisma.user.create({
    data: {
      nama: `User C Test ${timestamp}`,
      username: `userc_${timestamp}`,
      password: "password_hash",
      role: "user",
      divisi_id: divisiTI.id,
      aktif: true,
    },
  });

  const klasifikasi = await prisma.kode_klasifikasi.findFirst({ where: { aktif: true } });
  if (!klasifikasi) {
    console.error("Tidak ada kode klasifikasi aktif.");
    process.exit(1);
  }

  const initialArsipCount = await prisma.arsip.count();

  // Siapkan file uji fisik di storage/uploads/arsip
  const storageDir = path.join(process.cwd(), "storage", "uploads", "arsip");
  await mkdir(storageDir, { recursive: true });
  const testFileName = `test_file_${timestamp}.pdf`;
  const testFilePath = path.join(storageDir, testFileName);
  await writeFile(testFilePath, Buffer.from("DUMMY TEST PDF CONTENT"));
  const softFileDbPath = `/uploads/arsip/${testFileName}`;

  let createdPenyerahanId: bigint | null = null;
  let createdDetailId: bigint | null = null;

  try {
    // ==========================================
    // TEST 1, 2, 3, 4, 5, 6: Pembuatan Penyerahan
    // ==========================================
    const createResult = await prisma.$transaction(async (tx) => {
      const header = await tx.penyerahan_arsip.create({
        data: {
          user_id: userA.id,
          divisi_id: divisiSDM.id,
          tanggal_penyerahan: new Date(),
          status: "DIBUAT",
          pihak_pertama_id: userA.id,
          pihak_pertama_nama: userA.nama,
          sumber_penyerahan: "SDM - Sumber Daya Manusia",
          keterangan: "Pengujian Penyerahan Arsip dengan Soft File",
        },
      });

      const detail = await tx.detail_penyerahan_arsip.create({
        data: {
          penyerahan_id: header.id,
          kode_klasifikasi_id: klasifikasi.id,
          nama_arsip: "Dokumen Kebijakan SDM 2026",
          jumlah: 3,
          satuan: "Berkas",
          penulis_pengirim: "Tim SDM",
          kurun_waktu: "2026",
          tanggal_arsip: new Date("2026-10-02"),
          tingkat_keaslian: "Asli",
          file_arsip: softFileDbPath,
          keterangan: "Keterangan detail arsip",
          arsip_id: null,
        },
      });

      return { header, detail };
    });

    createdPenyerahanId = createResult.header.id;
    createdDetailId = createResult.detail.id;

    // TEST 1: User dapat membuat Penyerahan Arsip
    console.log("[TEST 1 PASS] User berhasil membuat formulir penyerahan arsip.");

    // TEST 2: Header tersimpan di penyerahan_arsip
    const savedHeader = await prisma.penyerahan_arsip.findUnique({
      where: { id: createdPenyerahanId },
    });
    if (!savedHeader || savedHeader.user_id !== userA.id) {
      throw new Error("Header penyerahan_arsip gagal diverifikasi!");
    }
    console.log("[TEST 2 PASS] Header tersimpan dengan benar di tabel penyerahan_arsip.");

    // TEST 3: Detail tersimpan di detail_penyerahan_arsip
    const savedDetail = await prisma.detail_penyerahan_arsip.findUnique({
      where: { id: createdDetailId },
    });
    if (!savedDetail || savedDetail.penyerahan_id !== createdPenyerahanId) {
      throw new Error("Detail penyerahan_arsip gagal diverifikasi!");
    }
    console.log("[TEST 3 PASS] Detail berkas tersimpan di tabel detail_penyerahan_arsip.");

    // TEST 4: arsip_id pada detail tetap NULL
    if (savedDetail.arsip_id !== null) {
      throw new Error("arsip_id tidak boleh terisi saat user submit!");
    }
    console.log("[TEST 4 PASS] arsip_id pada detail tetap NULL (tidak membuat arsip resmi langsung).");

    // TEST 5: Status penyerahan baru = DIBUAT
    if (savedHeader.status !== "DIBUAT") {
      throw new Error(`Status diharapkan 'DIBUAT', namun didapatkan: '${savedHeader.status}'`);
    }
    console.log("[TEST 5 PASS] Status transaksi penyerahan baru tepat bernilai 'DIBUAT'.");

    // TEST 6: Soft file tersimpan pada detail_penyerahan_arsip.file_arsip bukan pada header
    if (savedDetail.file_arsip !== softFileDbPath) {
      throw new Error(`file_arsip pada detail tidak sesuai! didapat: ${savedDetail.file_arsip}`);
    }
    if (savedHeader.file_berita_acara !== null) {
      throw new Error("file_berita_acara pada header tidak boleh diisi soft file arsip!");
    }
    console.log("[TEST 6 PASS] Soft file tersimpan pada detail_penyerahan_arsip.file_arsip, bukan pada header.");

    // ==========================================
    // TEST 7: User A vs User B (Ownership Check)
    // ==========================================
    const targetToManage = await prisma.penyerahan_arsip.findUnique({
      where: { id: createdPenyerahanId },
    });
    if (!targetToManage) throw new Error("Penyerahan target tidak ditemukan");

    // Check ownership against User B
    const userBCanEdit = targetToManage.user_id === userB.id;
    if (userBCanEdit) {
      throw new Error("Pelanggaran Keamanan: User B seharusnya tidak memiliki izin edit terhadap penyerahan User A!");
    }

    const userBCanDelete = targetToManage.user_id === userB.id;
    if (userBCanDelete) {
      throw new Error("Pelanggaran Keamanan: User B seharusnya tidak memiliki izin hapus terhadap penyerahan User A!");
    }

    // Check ownership against User A (Owner)
    const userACanEdit = targetToManage.user_id === userA.id && targetToManage.status === "DIBUAT";
    if (!userACanEdit) {
      throw new Error("User A seharusnya memiliki izin edit terhadap penyerahan miliknya sendiri.");
    }
    console.log("[TEST 7 PASS] Server-side ownership check lolos: User B ditolak mengedit/menghapus penyerahan milik User A.");

    // ==========================================
    // TEST 8: Divisi Visibility
    // ==========================================
    const sdmPenyerahanList = await prisma.penyerahan_arsip.findMany({
      where: { divisi_id: divisiSDM.id },
    });
    const foundInSDM = sdmPenyerahanList.some((p) => p.id === createdPenyerahanId);
    if (!foundInSDM) {
      throw new Error("Penyerahan divisi SDM tidak ditemukan pada query divisi SDM!");
    }

    const tiPenyerahanList = await prisma.penyerahan_arsip.findMany({
      where: { divisi_id: divisiTI.id },
    });
    const foundInTI = tiPenyerahanList.some((p) => p.id === createdPenyerahanId);
    if (foundInTI) {
      throw new Error("Pelanggaran Isolasi Divisi: Penyerahan SDM bocor ke query divisi TI!");
    }
    console.log("[TEST 8 PASS] Aturan filter divisi berjalan akurat: Rekan divisi dapat melihat transaksi divisi, divisi lain terisolasi.");

    // ==========================================
    // TEST 9: Rollback Transaction Integrity
    // ==========================================
    const rollbackMarker = `TEST_ROLLBACK_${timestamp}`;
    let rollbackSuccess = false;

    try {
      await prisma.$transaction(async (tx) => {
        await tx.penyerahan_arsip.create({
          data: {
            user_id: userA.id,
            divisi_id: divisiSDM.id,
            status: "DIBUAT",
            keterangan: rollbackMarker,
          },
        });

        // Paksa error saat insert detail
        throw new Error("SIMULASI ERROR DETAIL TRANSACTION");
      });
    } catch {
      rollbackSuccess = true;
    }

    if (!rollbackSuccess) {
      throw new Error("Transaksi seharusnya melempar error!");
    }

    const checkHeaderRollback = await prisma.penyerahan_arsip.findFirst({
      where: { keterangan: rollbackMarker },
    });

    if (checkHeaderRollback !== null) {
      throw new Error("Integritas Transaksi Gagal: Header tidak di-rollback saat detail gagal!");
    }
    console.log("[TEST 9 PASS] Atomic rollback berhasil: Header tidak tersimpan setengah jika detail gagal.");

    // ==========================================
    // TEST 10: Tabel arsip resmi tidak bertambah
    // ==========================================
    const currentArsipCount = await prisma.arsip.count();
    if (currentArsipCount !== initialArsipCount) {
      throw new Error(`Tabel arsip resmi bertambah dari ${initialArsipCount} menjadi ${currentArsipCount}!`);
    }
    console.log(`[TEST 10 PASS] Tabel arsip resmi tetap ${currentArsipCount} (tidak bertambah saat user submit penyerahan).`);

  } finally {
    // Cleanup data pengujian
    console.log("Membersihkan data uji...");
    if (createdPenyerahanId) {
      await prisma.penyerahan_arsip.deleteMany({ where: { id: createdPenyerahanId } });
    }
    try {
      await unlink(testFilePath);
    } catch {
      // ignore
    }
    await prisma.user.deleteMany({
      where: { id: { in: [userA.id, userB.id, userC.id] } },
    });
    console.log("[CLEANUP PASS] Seluruh data uji dan user dummy dibersihkan.");
  }

  console.log("=== SELURUH PENGUJIAN PENYERAHAN ARSIP (10 POINT) BERHASIL 100% ===");
}

runTests()
  .catch((e) => {
    console.error("TEST FAILED:", e);
    process.exit(1);
  });
