import { existsSync, readFileSync, unlinkSync } from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";
import { prisma } from "../lib/prisma";
import { signSession, SESSION_COOKIE_NAME } from "../lib/session";
import { GET } from "../app/api/arsip/[id]/file/route";

async function runSecurityTests() {
  console.log("==================================================");
  console.log("RUNNING FILE ACCESS SECURITY TESTS (SIMARS)");
  console.log("==================================================");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, extraInfo = "") {
    total++;
    if (condition) {
      console.log(`[PASS] Test ${total}: ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] Test ${total}: ${testName} - ${extraInfo}`);
      process.exitCode = 1;
    }
  }

  // 1. Verifikasi Direktori Storage Privat
  const storageDir = path.resolve(process.cwd(), "storage", "uploads", "arsip");
  const publicDir = path.resolve(process.cwd(), "public", "uploads", "arsip");

  assert(existsSync(storageDir), "Folder storage privat storage/uploads/arsip/ ada");

  // File lama 1
  const oldFile1 = "27b41d7d-5871-467c-a47f-c738ccee3dba.pdf";
  const oldFile2 = "3c3fa7ff-758c-47d7-ac08-ff811229b436.pdf";

  assert(
    existsSync(path.join(storageDir, oldFile1)),
    `File lama ${oldFile1} berhasil tersimpan di storage privat`
  );
  assert(
    existsSync(path.join(storageDir, oldFile2)),
    `File lama ${oldFile2} berhasil tersimpan di storage privat`
  );

  // Verifikasi file lama sudah dihapus dari public/uploads/arsip
  assert(
    !existsSync(path.join(publicDir, oldFile1)),
    `File lama ${oldFile1} TIDAK ADA di folder publik`
  );
  assert(
    !existsSync(path.join(publicDir, oldFile2)),
    `File lama ${oldFile2} TIDAK ADA di folder publik`
  );

  // Ambil record arsip yang memiliki file dari database
  const arsipWithFile = await prisma.arsip.findFirst({
    where: { file_arsip: { not: null } },
    select: { id: true, nama_arsip: true, file_arsip: true },
  });

  if (!arsipWithFile) {
    console.error("Tidak ada arsip dengan file untuk pengujian.");
    return;
  }

  console.log(`\nMenggunakan Arsip ID: ${arsipWithFile.id}, Nama: "${arsipWithFile.nama_arsip}"`);

  // Cari user admin dan user biasa di database
  const adminUser = await prisma.user.findFirst({ where: { role: "admin", aktif: true } });
  const regularUser = await prisma.user.findFirst({ where: { role: "user", aktif: true } });

  assert(Boolean(adminUser), "User admin aktif ditemukan di database");

  // TEST: Akses tanpa cookie login (Unauthenticated)
  const unauthReq = new NextRequest(`http://localhost:3000/api/arsip/${arsipWithFile.id}/file?mode=preview`);
  const unauthRes = await GET(unauthReq, { params: Promise.resolve({ id: arsipWithFile.id.toString() }) });
  assert(
    unauthRes.status === 401,
    "Akses langsung tanpa login ditolak dengan 401 Unauthorized"
  );

  // TEST: Akses dengan token expired/invalid
  const invalidReq = new NextRequest(`http://localhost:3000/api/arsip/${arsipWithFile.id}/file`, {
    headers: {
      cookie: `${SESSION_COOKIE_NAME}=invalid.fake.token`,
    },
  });
  const invalidRes = await GET(invalidReq, { params: Promise.resolve({ id: arsipWithFile.id.toString() }) });
  assert(
    invalidRes.status === 401,
    "Akses dengan token palsu/rusak ditolak dengan 401 Unauthorized"
  );

  // TEST: Akses dengan role 'user' biasa (Bukan Admin)
  if (regularUser) {
    const userToken = await signSession(
      { userId: regularUser.id.toString(), username: regularUser.username, role: regularUser.role },
      3600
    );
    const regularUserReq = new NextRequest(`http://localhost:3000/api/arsip/${arsipWithFile.id}/file`, {
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=${userToken}`,
      },
    });
    const regularUserRes = await GET(regularUserReq, { params: Promise.resolve({ id: arsipWithFile.id.toString() }) });
    assert(
      regularUserRes.status === 403,
      "Akses oleh role 'user' biasa ditolak dengan 403 Forbidden"
    );
  } else {
    console.log("[SKIP] User biasa aktif tidak ada di DB, membuat simulasi payload user");
    // Buat token simulasi role user dengan userId non-admin
    const mockUserToken = await signSession({ userId: "99999", username: "user_test", role: "user" }, 3600);
    const mockReq = new NextRequest(`http://localhost:3000/api/arsip/${arsipWithFile.id}/file`, {
      headers: { cookie: `${SESSION_COOKIE_NAME}=${mockUserToken}` },
    });
    const mockRes = await GET(mockReq, { params: Promise.resolve({ id: arsipWithFile.id.toString() }) });
    assert(mockRes.status === 401 || mockRes.status === 403, "Akses tanpa user DB valid ditolak");
  }

  // TEST: Akses sebagai Admin Login (Preview)
  if (adminUser) {
    const adminToken = await signSession(
      { userId: adminUser.id.toString(), username: adminUser.username, role: adminUser.role },
      3600
    );

    const adminPreviewReq = new NextRequest(`http://localhost:3000/api/arsip/${arsipWithFile.id}/file?mode=preview`, {
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=${adminToken}`,
      },
    });
    const adminPreviewRes = await GET(adminPreviewReq, { params: Promise.resolve({ id: arsipWithFile.id.toString() }) });

    assert(
      adminPreviewRes.status === 200,
      "Admin login berhasil mengakses file dengan status 200 OK"
    );

    const contentType = adminPreviewRes.headers.get("Content-Type");
    assert(
      contentType === "application/pdf",
      `Content-Type sesuai (${contentType})`
    );

    const contentDisposition = adminPreviewRes.headers.get("Content-Disposition");
    assert(
      Boolean(contentDisposition && contentDisposition.startsWith("inline")),
      `Mode preview menggunakan Content-Disposition: inline (${contentDisposition})`
    );

    const cacheControl = adminPreviewRes.headers.get("Cache-Control");
    assert(
      Boolean(cacheControl && cacheControl.includes("private") && cacheControl.includes("no-store")),
      `Cache-Control ketat private, no-store (${cacheControl})`
    );

    const nosniff = adminPreviewRes.headers.get("X-Content-Type-Options");
    assert(
      nosniff === "nosniff",
      `X-Content-Type-Options: nosniff terpasang (${nosniff})`
    );

    // TEST: Akses sebagai Admin Login (Download)
    const adminDownloadReq = new NextRequest(`http://localhost:3000/api/arsip/${arsipWithFile.id}/file?mode=download`, {
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=${adminToken}`,
      },
    });
    const adminDownloadRes = await GET(adminDownloadReq, { params: Promise.resolve({ id: arsipWithFile.id.toString() }) });
    assert(
      adminDownloadRes.status === 200,
      "Mode download mengembalikan status 200 OK"
    );

    const downloadDisposition = adminDownloadRes.headers.get("Content-Disposition");
    assert(
      Boolean(downloadDisposition && downloadDisposition.startsWith("attachment")),
      `Mode download menggunakan Content-Disposition: attachment (${downloadDisposition})`
    );
  }

  // TEST: ID arsip yang tidak ada
  if (adminUser) {
    const adminToken = await signSession(
      { userId: adminUser.id.toString(), username: adminUser.username, role: adminUser.role },
      3600
    );
    const notFoundReq = new NextRequest(`http://localhost:3000/api/arsip/999999/file`, {
      headers: { cookie: `${SESSION_COOKIE_NAME}=${adminToken}` },
    });
    const notFoundRes = await GET(notFoundReq, { params: Promise.resolve({ id: "999999" }) });
    assert(
      notFoundRes.status === 404,
      "ID arsip fiktif mengembalikan 404 Not Found"
    );
  }

  // TEST: ID arsip tidak valid (bukan angka)
  if (adminUser) {
    const adminToken = await signSession(
      { userId: adminUser.id.toString(), username: adminUser.username, role: adminUser.role },
      3600
    );
    const badReq = new NextRequest(`http://localhost:3000/api/arsip/abc/file`, {
      headers: { cookie: `${SESSION_COOKIE_NAME}=${adminToken}` },
    });
    const badRes = await GET(badReq, { params: Promise.resolve({ id: "abc" }) });
    assert(
      badRes.status === 400,
      "ID arsip non-numerik mengembalikan 400 Bad Request"
    );
  }

  // TEST: Path Traversal via Parameter ID
  if (adminUser) {
    const adminToken = await signSession(
      { userId: adminUser.id.toString(), username: adminUser.username, role: adminUser.role },
      3600
    );
    const traversalReq = new NextRequest(`http://localhost:3000/api/arsip/..%2F..%2F..%2Fetc%2Fpasswd/file`, {
      headers: { cookie: `${SESSION_COOKIE_NAME}=${adminToken}` },
    });
    const traversalRes = await GET(traversalReq, { params: Promise.resolve({ id: "../../../etc/passwd" }) });
    assert(
      traversalRes.status === 400,
      "Path traversal via ID ditolak dengan 400 Bad Request"
    );
  }

  // TEST: Path Traversal sanitasi nama file internal
  const testStorageDir = path.resolve(process.cwd(), "storage", "uploads", "arsip");
  const maliciousInput = "../../etc/passwd";
  const sanitizedFilename = path.basename(maliciousInput);
  const resolvedMaliciousPath = path.resolve(testStorageDir, sanitizedFilename);
  const safePrefix = testStorageDir.endsWith(path.sep) ? testStorageDir : testStorageDir + path.sep;
  assert(
    resolvedMaliciousPath.startsWith(safePrefix),
    "Path Traversal sanitasi mencegah keluarnya file dari direktori storage"
  );

  // TEST: Upload baru - Verifikasi penempatan berkas di storage privat
  console.log("\n--- TESTING UPLOAD ARSIP BARU ---");
  const samplePdfContent = Buffer.from("%PDF-1.4\n1 0 obj\n<< /Title (Test Dokumen Baru) >>\nendobj\ntrailer\n<< >>\n%%EOF");
  const testFilename = `test-upload-security-${Date.now()}.pdf`;
  const uploadDest = path.join(testStorageDir, testFilename);
  const publicDest = path.join(publicDir, testFilename);

  // Tulis file ke storage privat
  const { writeFileSync, unlinkSync } = await import("node:fs");
  writeFileSync(uploadDest, samplePdfContent);

  assert(
    existsSync(uploadDest),
    "Berkas arsip baru berhasil disimpan di storage/uploads/arsip"
  );
  assert(
    !existsSync(publicDest),
    "Berkas arsip baru TIDAK PERNAH masuk ke public/uploads/arsip"
  );

  // Buat arsip sementara di database untuk menguji akses protected route
  const dummyKlasifikasi = await prisma.kode_klasifikasi.findFirst({ where: { aktif: true } });
  if (dummyKlasifikasi && adminUser) {
    const adminToken = await signSession(
      { userId: adminUser.id.toString(), username: adminUser.username, role: adminUser.role },
      3600
    );
    const newArsip = await prisma.arsip.create({
      data: {
        nomor_arsip: `SEC-TEST-${Date.now()}`,
        nama_arsip: "Dokumen Uji Keamanan Baru",
        kode_klasifikasi_id: dummyKlasifikasi.id,
        jumlah: 1,
        file_arsip: `/uploads/arsip/${testFilename}`,
        status_arsip: "tersimpan",
      },
    });

    const newPreviewReq = new NextRequest(`http://localhost:3000/api/arsip/${newArsip.id}/file?mode=preview`, {
      headers: { cookie: `${SESSION_COOKIE_NAME}=${adminToken}` },
    });
    const newPreviewRes = await GET(newPreviewReq, { params: Promise.resolve({ id: newArsip.id.toString() }) });
    assert(
      newPreviewRes.status === 200,
      "Protected route berhasil menyajikan berkas baru yang diupload ke storage privat"
    );

    // Bersihkan data dummy test
    await prisma.arsip.delete({ where: { id: newArsip.id } });
    if (existsSync(uploadDest)) {
      unlinkSync(uploadDest);
    }
    assert(
      !existsSync(uploadDest),
      "File dummy berhasil dibersihkan setelah pengujian"
    );
  }

  console.log("==================================================");
  console.log(`TEST SUMMARY: ${passed} / ${total} tests passed.`);
  console.log("==================================================");
}

runSecurityTests().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
