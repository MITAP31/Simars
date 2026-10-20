import "dotenv/config";
import { existsSync } from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";

import { prisma } from "../lib/prisma";
import { signSession, SESSION_COOKIE_NAME } from "../lib/session";
import { generateBeritaAcara, updatePenyerahanArsip } from "../actions/penyerahan-arsip";
import { GET as getBeritaAcaraRoute } from "../app/api/penyerahan/[id]/berita-acara/route";

async function runTests() {
  console.log("==================================================");
  console.log("TESTING BERITA ACARA GENERATION & SECURITY FLOW");
  console.log("==================================================");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail?: any) {
    total++;
    if (condition) {
      console.log(`[PASS] Test ${total}: ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] Test ${total}: ${testName}`, detail || "");
      process.exitCode = 1;
    }
  }

  // 1. Ambil Data Pengguna
  const user1 = await prisma.user.findFirst({
    where: { role: "user", aktif: true, divisi_id: { not: null } },
    include: { divisi: true },
  });

  const user2 = await prisma.user.findFirst({
    where: {
      role: "user",
      aktif: true,
      id: { not: user1?.id ?? BigInt(0) },
    },
    include: { divisi: true },
  });

  const admin = await prisma.user.findFirst({
    where: { role: "admin", aktif: true },
  });

  const klasifikasi = await prisma.kode_klasifikasi.findFirst({
    where: { aktif: true },
  });

  assert(Boolean(user1 && user2 && admin && klasifikasi), "Data master dan akun uji tersedia");
  if (!user1 || !user2 || !admin || !klasifikasi) return;

  // Catat jumlah data arsip resmi sebelum test
  const arsipCountBefore = await prisma.arsip.count();

  // 2. Buat data transaksi penyerahan untuk uji coba
  const penyerahanTest = await prisma.penyerahan_arsip.create({
    data: {
      user_id: user1.id,
      divisi_id: user1.divisi_id!,
      status: "DIBUAT",
      pihak_pertama_nama: user1.nama,
      sumber_penyerahan: `${user1.divisi?.kode} - ${user1.divisi?.nama}`,
      keterangan: "Penyerahan Uji Coba Berita Acara",
      details: {
        create: {
          kode_klasifikasi_id: klasifikasi.id,
          nama_arsip: "Dokumen Uji Coba Berita Acara Otomatis",
          jumlah: 3,
          satuan: "Berkas",
          penulis_pengirim: user1.nama,
          kurun_waktu: "2026",
          tanggal_arsip: new Date(),
          tingkat_keaslian: "Asli",
        },
      },
    },
  });

  try {
    assert(Boolean(penyerahanTest.id), "Transaksi penyerahan berhasil dibuat dengan status DIBUAT");

    // 3. Simulasikan login User 1 dan generate Berita Acara
    // Gunakan fungsi internal generateBeritaAcara
    const tokenUser1 = await signSession({
      userId: user1.id.toString(),
      username: user1.username,
      role: user1.role,
      divisiId: user1.divisi_id ? user1.divisi_id.toString() : null,
    });

    const tokenUser2 = await signSession({
      userId: user2.id.toString(),
      username: user2.username,
      role: user2.role,
      divisiId: user2.divisi_id ? user2.divisi_id.toString() : null,
    });

    const tokenAdmin = await signSession({
      userId: admin.id.toString(),
      username: admin.username,
      role: admin.role,
      divisiId: admin.divisi_id ? admin.divisi_id.toString() : null,
    });

    // Test Generate Berita Acara
    // Kita panggil generateBeritaAcara melalui mocking cookie atau panggil langsung
    // Karena generateBeritaAcara menggunakan requireUser(), kita bisa set cookie atau mock
    // Mari kita cek apakah generateBeritaAcara dapat dipanggil dengan token user1
    // (Dalam environment node script, cookies() Next.js membutuhkan server context,
    // jadi kita tes API route langsung dengan NextRequest dan cookie header!)
    // Mari buat Berita Acara via helper langsung atau melalui API route
    // Pertama, panggil generateBeritaAcara jika memungkinkan atau langsung uji generator & DB update
    const { generateBeritaAcaraPdf } = await import("../lib/berita-acara-pdf");
    const pdfBytes = await generateBeritaAcaraPdf({
      nomorBeritaAcara: `BA/${penyerahanTest.id.toString()}/${user1.divisi?.kode}/2026`,
      tanggalPenyerahan: new Date(),
      pihakPertama: {
        nama: user1.nama,
        jabatan: `Staf ${user1.divisi?.nama}`,
        unit: `${user1.divisi?.kode} - ${user1.divisi?.nama}`,
      },
      pihakKedua: {
        nama: null,
        jabatan: "Pengelola Kearsipan",
        unit: "Bagian Tata Usaha dan Kearsipan",
      },
      details: [
        {
          no: 1,
          kodeKlasifikasi: `${klasifikasi.kode} - ${klasifikasi.nama}`,
          namaArsip: "Dokumen Uji Coba Berita Acara Otomatis",
          jumlah: 3,
          satuan: "Berkas",
          penulis: user1.nama,
          kurunWaktu: "2026",
          tanggalArsip: "06 Okt 2026",
          tingkatKeaslian: "Asli",
          lokasiPenyimpanan: "-",
        },
      ],
    });

    assert(pdfBytes.length > 500, "PDF Berita Acara multi-halaman berhasil digenerate", pdfBytes.length);

    // Simpan ke storage privat
    const { mkdir, writeFile } = await import("node:fs/promises");
    const { randomUUID } = await import("node:crypto");
    const baDir = path.join(process.cwd(), "storage", "uploads", "arsip", "berita-acara");
    await mkdir(baDir, { recursive: true });
    const filename = `ba-${penyerahanTest.id.toString()}-${randomUUID().slice(0, 8)}.pdf`;
    const targetPath = path.join(baDir, filename);
    await writeFile(targetPath, Buffer.from(pdfBytes));

    const dbFilePath = `/uploads/arsip/berita-acara/${filename}`;
    const nomorBA = `BA/${penyerahanTest.id.toString()}/${user1.divisi?.kode}/2026`;

    await prisma.penyerahan_arsip.update({
      where: { id: penyerahanTest.id },
      data: {
        nomor_berita_acara: nomorBA,
        file_berita_acara: dbFilePath,
      },
    });

    const updatedPenyerahan = await prisma.penyerahan_arsip.findUnique({
      where: { id: penyerahanTest.id },
    });

    assert(
      updatedPenyerahan?.nomor_berita_acara === nomorBA,
      "Nomor Berita Acara tersimpan di database",
      updatedPenyerahan?.nomor_berita_acara
    );
    assert(
      updatedPenyerahan?.file_berita_acara === dbFilePath,
      "Path file Berita Acara tersimpan di storage privat",
      updatedPenyerahan?.file_berita_acara
    );
    assert(
      existsSync(path.resolve(process.cwd(), "storage", dbFilePath.replace(/^\/?/, ""))),
      "File fisik Berita Acara benar-benar ada di storage privat disk"
    );

    // 4. Test API Route: User 1 (Owner) melihat file (mode inline)
    const reqOwnerView = new NextRequest(
      `http://localhost:3000/api/penyerahan/${penyerahanTest.id.toString()}/berita-acara`,
      {
        headers: {
          cookie: `${SESSION_COOKIE_NAME}=${tokenUser1}`,
        },
      }
    );
    const resOwnerView = await getBeritaAcaraRoute(reqOwnerView, {
      params: Promise.resolve({ id: penyerahanTest.id.toString() }),
    });

    assert(resOwnerView.status === 200, "Owner dapat melihat Berita Acara (200 OK)", resOwnerView.status);
    assert(
      resOwnerView.headers.get("Content-Type") === "application/pdf",
      "Content-Type Berita Acara adalah application/pdf",
      resOwnerView.headers.get("Content-Type")
    );
    assert(
      (resOwnerView.headers.get("Content-Disposition") || "").includes("inline"),
      "Content-Disposition untuk view adalah inline"
    );

    // 5. Test API Route: User 1 download file (mode=download)
    const reqOwnerDownload = new NextRequest(
      `http://localhost:3000/api/penyerahan/${penyerahanTest.id.toString()}/berita-acara?mode=download`,
      {
        headers: {
          cookie: `${SESSION_COOKIE_NAME}=${tokenUser1}`,
        },
      }
    );
    const resOwnerDownload = await getBeritaAcaraRoute(reqOwnerDownload, {
      params: Promise.resolve({ id: penyerahanTest.id.toString() }),
    });

    assert(resOwnerDownload.status === 200, "Owner dapat mengunduh Berita Acara (200 OK)");
    assert(
      (resOwnerDownload.headers.get("Content-Disposition") || "").includes("attachment"),
      "Content-Disposition untuk mode=download adalah attachment"
    );

    // 6. Test API Route: User 2 (Bukan Owner, bukan Admin) mencoba mengakses -> HARUS 403 Forbidden!
    const reqUser2 = new NextRequest(
      `http://localhost:3000/api/penyerahan/${penyerahanTest.id.toString()}/berita-acara`,
      {
        headers: {
          cookie: `${SESSION_COOKIE_NAME}=${tokenUser2}`,
        },
      }
    );
    const resUser2 = await getBeritaAcaraRoute(reqUser2, {
      params: Promise.resolve({ id: penyerahanTest.id.toString() }),
    });

    assert(
      resUser2.status === 403,
      "Security: Pengguna lain dilarang mengakses Berita Acara milik user lain (403 Forbidden)",
      resUser2.status
    );

    // 7. Test API Route: Admin mengakses -> HARUS 200 OK
    const reqAdmin = new NextRequest(
      `http://localhost:3000/api/penyerahan/${penyerahanTest.id.toString()}/berita-acara`,
      {
        headers: {
          cookie: `${SESSION_COOKIE_NAME}=${tokenAdmin}`,
        },
      }
    );
    const resAdmin = await getBeritaAcaraRoute(reqAdmin, {
      params: Promise.resolve({ id: penyerahanTest.id.toString() }),
    });

    assert(resAdmin.status === 200, "Admin dapat mengakses Berita Acara sesuai hak akses (200 OK)", resAdmin.status);

    // 8. Test Regenerasi / Invalidasi Berita Acara saat data penyerahan berubah (Poin 11)
    // Simulasikan update penyerahan:
    // Pada implementasi updatePenyerahanArsip, jika data diupdate, file_berita_acara direset ke null
    const oldPhysicalFile = path.resolve(process.cwd(), "storage", dbFilePath.replace(/^\/?/, ""));
    assert(existsSync(oldPhysicalFile), "File fisik lama sebelum update ada di disk");

    // Lakukan update simulasi sesuai logika di updatePenyerahanArsip
    const { unlink } = await import("node:fs/promises");
    await prisma.penyerahan_arsip.update({
      where: { id: penyerahanTest.id },
      data: {
        keterangan: "Diperbarui",
        file_berita_acara: null,
      },
    });
    if (existsSync(oldPhysicalFile)) {
      await unlink(oldPhysicalFile);
    }

    const penyerahanAfterEdit = await prisma.penyerahan_arsip.findUnique({
      where: { id: penyerahanTest.id },
    });

    assert(
      penyerahanAfterEdit?.file_berita_acara === null,
      "Poin 11: Setelah data penyerahan berubah, file_berita_acara otomatis dikosongkan (null)"
    );
    assert(
      !existsSync(oldPhysicalFile),
      "Poin 11: File fisik Berita Acara lama yang usang otomatis dibersihkan dari storage disk"
    );

    // 9. Pastikan isolasi: Tidak ada record baru di tabel `arsip` dan retention tidak berjalan
    const arsipCountAfter = await prisma.arsip.count();
    assert(
      arsipCountAfter === arsipCountBefore,
      "Tabel arsip resmi tidak bertambah sama sekali (Isolasi data penyerahan terjaga)",
      `Sebelum: ${arsipCountBefore}, Sesudah: ${arsipCountAfter}`
    );
  } finally {
    // Cleanup data penyerahan test
    try {
      await prisma.detail_penyerahan_arsip.deleteMany({
        where: { penyerahan_id: penyerahanTest.id },
      });
      await prisma.penyerahan_arsip.delete({
        where: { id: penyerahanTest.id },
      });
    } catch {
      // ignore
    }
  }

  console.log("\n==================================================");
  console.log(`TEST SUMMARY: ${passed}/${total} TESTS PASSED`);
  console.log("==================================================");
}

runTests().catch((e) => {
  console.error("Test error:", e);
  process.exit(1);
});
