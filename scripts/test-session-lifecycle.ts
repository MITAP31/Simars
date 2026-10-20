import { NextRequest } from "next/server";
import { prisma } from "../lib/prisma";
import {
  signSession,
  verifySessionToken,
  refreshSessionToken,
  revokeSessionToken,
  getCookieConfig,
  SESSION_COOKIE_NAME,
  SESSION_IDLE_TIMEOUT,
  SESSION_ABSOLUTE_TIMEOUT,
} from "../lib/session";
import { getUserFromToken } from "../lib/auth";
import { GET as getFileRoute } from "../app/api/arsip/[id]/file/route";

async function runSessionTests() {
  console.log("==================================================");
  console.log("RUNNING SIMARS SESSION & AUTHENTICATION TESTS");
  console.log("==================================================");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, extraInfo = "") {
    total++;
    if (condition) {
      console.log(`[PASS] Test ${total}: ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] Test ${total}: ${testName} ${extraInfo ? `(${extraInfo})` : ""}`);
      process.exitCode = 1;
    }
  }

  // 1. Persiapan Data User & Arsip dari Database
  const adminUser = await prisma.user.findFirst({
    where: { role: "admin", aktif: true },
  });

  const regularUser = await prisma.user.findFirst({
    where: { role: "user", aktif: true },
  });

  const arsipWithFile = await prisma.arsip.findFirst({
    where: { file_arsip: { not: null } },
    select: { id: true, nama_arsip: true, file_arsip: true },
  });

  assert(Boolean(adminUser), "User admin aktif ditemukan di database");
  if (!adminUser) {
    console.error("Test dihentikan: tidak ditemukan user admin di database.");
    return;
  }

  const now = Math.floor(Date.now() / 1000);

  // ---------------------------------------------------------------
  // Test 1: Request tanpa cookie session -> 401 Unauthorized
  // ---------------------------------------------------------------
  if (arsipWithFile) {
    const reqNoCookie = new NextRequest(
      `http://localhost:3000/api/arsip/${arsipWithFile.id}/file?mode=preview`
    );
    const resNoCookie = await getFileRoute(reqNoCookie, {
      params: Promise.resolve({ id: arsipWithFile.id.toString() }),
    });
    assert(
      resNoCookie.status === 401,
      "Test 1 — Request tanpa cookie session ditolak dengan 401 Unauthorized"
    );
  } else {
    const userNoToken = await getUserFromToken(null);
    assert(userNoToken === null, "Test 1 — Request tanpa cookie session mengembalikan null / unauthenticated");
  }

  // ---------------------------------------------------------------
  // Test 2: Request dengan fake token -> 401 Unauthorized
  // ---------------------------------------------------------------
  const fakeToken = "not.a.valid.jwt.token.string";
  const verifiedFake = await verifySessionToken(fakeToken);
  assert(verifiedFake === null, "Test 2 — Fake token format ditolak (verifySessionToken = null)");

  if (arsipWithFile) {
    const reqFake = new NextRequest(
      `http://localhost:3000/api/arsip/${arsipWithFile.id}/file`,
      { headers: { cookie: `${SESSION_COOKIE_NAME}=${fakeToken}` } }
    );
    const resFake = await getFileRoute(reqFake, {
      params: Promise.resolve({ id: arsipWithFile.id.toString() }),
    });
    assert(
      resFake.status === 401,
      "Test 2 — Akses API dengan fake token ditolak dengan 401 Unauthorized"
    );
  }

  // ---------------------------------------------------------------
  // Test 3: Request dengan token signature rusak -> 401 Unauthorized
  // ---------------------------------------------------------------
  const validAdminToken = await signSession({
    userId: adminUser.id.toString(),
    username: adminUser.username,
    role: adminUser.role,
  });

  const parts = validAdminToken.split(".");
  // Manipulasi payload agar signature tidak cocok lagi
  const tamperedToken = `${parts[0]}.${parts[1]}TAMPERED.${parts[2]}`;
  const verifiedTampered = await verifySessionToken(tamperedToken);
  assert(
    verifiedTampered === null,
    "Test 3 — Token dengan signature/payload dimanipulasi ditolak (verifySessionToken = null)"
  );

  if (arsipWithFile) {
    const reqTampered = new NextRequest(
      `http://localhost:3000/api/arsip/${arsipWithFile.id}/file`,
      { headers: { cookie: `${SESSION_COOKIE_NAME}=${tamperedToken}` } }
    );
    const resTampered = await getFileRoute(reqTampered, {
      params: Promise.resolve({ id: arsipWithFile.id.toString() }),
    });
    assert(
      resTampered.status === 401,
      "Test 3 — Akses API dengan tampered signature ditolak dengan 401 Unauthorized"
    );
  }

  // ---------------------------------------------------------------
  // Test 4: Expired idle session (> 30 menit) -> ditolak (401)
  // ---------------------------------------------------------------
  // Simulasikan session dengan aktivitas terakhir 31 menit yang lalu
  const idleExpiredToken = await signSession({
    userId: adminUser.id.toString(),
    username: adminUser.username,
    role: adminUser.role,
    iat: now - 40 * 60,
    lastActive: now - 31 * 60, // 31 menit idle > 30 menit
    exp: now + 7 * 3600, // Absolute timeout belum habis
  });

  const verifiedIdle = await verifySessionToken(idleExpiredToken);
  assert(
    verifiedIdle === null,
    "Test 4 — Session idle > 30 menit ditolak di server (verifySessionToken = null)"
  );

  const userIdle = await getUserFromToken(idleExpiredToken);
  assert(
    userIdle === null,
    "Test 4 — getUserFromToken untuk session idle expired mengembalikan null"
  );

  if (arsipWithFile) {
    const reqIdle = new NextRequest(
      `http://localhost:3000/api/arsip/${arsipWithFile.id}/file`,
      { headers: { cookie: `${SESSION_COOKIE_NAME}=${idleExpiredToken}` } }
    );
    const resIdle = await getFileRoute(reqIdle, {
      params: Promise.resolve({ id: arsipWithFile.id.toString() }),
    });
    assert(
      resIdle.status === 401,
      "Test 4 — Akses API dengan session idle expired ditolak dengan 401 Unauthorized"
    );
  }

  // ---------------------------------------------------------------
  // Test 5: Absolute session timeout (> 8 jam dari login) -> ditolak (401)
  // ---------------------------------------------------------------
  // Simulasikan login 8 jam 1 menit lalu, walaupun baru aktif 1 menit lalu
  const absoluteExpiredToken = await signSession({
    userId: adminUser.id.toString(),
    username: adminUser.username,
    role: adminUser.role,
    iat: now - (8 * 3600 + 60), // Login 8 jam 1 menit lalu
    lastActive: now - 60, // Baru aktif 1 menit lalu (tidak idle)
    exp: now - 60, // Expired absolut
  });

  const verifiedAbsolute = await verifySessionToken(absoluteExpiredToken);
  assert(
    verifiedAbsolute === null,
    "Test 5 — Session melampaui batas absolut 8 jam ditolak meskipun user terus aktif"
  );

  const userAbsolute = await getUserFromToken(absoluteExpiredToken);
  assert(
    userAbsolute === null,
    "Test 5 — getUserFromToken untuk session absolute expired mengembalikan null"
  );

  if (arsipWithFile) {
    const reqAbs = new NextRequest(
      `http://localhost:3000/api/arsip/${arsipWithFile.id}/file`,
      { headers: { cookie: `${SESSION_COOKIE_NAME}=${absoluteExpiredToken}` } }
    );
    const resAbs = await getFileRoute(reqAbs, {
      params: Promise.resolve({ id: arsipWithFile.id.toString() }),
    });
    assert(
      resAbs.status === 401,
      "Test 5 — Akses API dengan session absolute expired ditolak dengan 401 Unauthorized"
    );
  }

  // ---------------------------------------------------------------
  // Test 6: Valid session (idle < 30 menit & umur < 8 jam) -> Authenticated
  // ---------------------------------------------------------------
  const validToken = await signSession({
    userId: adminUser.id.toString(),
    username: adminUser.username,
    role: adminUser.role,
  });

  const verifiedValid = await verifySessionToken(validToken);
  assert(
    verifiedValid !== null && verifiedValid.userId === adminUser.id.toString(),
    "Test 6 — Session valid berhasil diverifikasi (Authenticated)"
  );

  const userValid = await getUserFromToken(validToken);
  assert(
    userValid !== null && userValid.username === adminUser.username,
    `Test 6 — User terautentikasi sesuai database (${userValid?.nama})`
  );

  // ---------------------------------------------------------------
  // Test 7: Logout Invalidation -> Session lama tidak boleh digunakan
  // ---------------------------------------------------------------
  // Buat session baru khusus untuk pengujian logout
  const sessionToLogout = await signSession({
    userId: adminUser.id.toString(),
    username: adminUser.username,
    role: adminUser.role,
  });

  // Sebelum logout: valid
  const preLogoutCheck = await verifySessionToken(sessionToLogout);
  assert(preLogoutCheck !== null, "Test 7 (Pre-logout) — Session aktif valid sebelum logout");

  // Eksekusi logout / revocation
  const revokeResult = await revokeSessionToken(sessionToLogout);
  assert(revokeResult === true, "Test 7 — Token berhasil dibatalkan (revoked)");

  // Setelah logout: session ditolak
  const postLogoutCheck = await verifySessionToken(sessionToLogout);
  assert(
    postLogoutCheck === null,
    "Test 7 — Token yang telah logout ditolak oleh server (verifySessionToken = null)"
  );

  const postLogoutUser = await getUserFromToken(sessionToLogout);
  assert(
    postLogoutUser === null,
    "Test 7 — getUserFromToken untuk token logout mengembalikan null"
  );

  if (arsipWithFile) {
    const reqPostLogout = new NextRequest(
      `http://localhost:3000/api/arsip/${arsipWithFile.id}/file`,
      { headers: { cookie: `${SESSION_COOKIE_NAME}=${sessionToLogout}` } }
    );
    const resPostLogout = await getFileRoute(reqPostLogout, {
      params: Promise.resolve({ id: arsipWithFile.id.toString() }),
    });
    assert(
      resPostLogout.status === 401,
      "Test 7 — Akses API file dengan token yang telah logout ditolak dengan 401 Unauthorized"
    );
  }

  // ---------------------------------------------------------------
  // Test 8: File API Protection (Valid 200 OK vs Expired 401)
  // ---------------------------------------------------------------
  if (arsipWithFile) {
    // A. Valid admin session -> 200 OK
    const reqValidFile = new NextRequest(
      `http://localhost:3000/api/arsip/${arsipWithFile.id}/file?mode=preview`,
      { headers: { cookie: `${SESSION_COOKIE_NAME}=${validToken}` } }
    );
    const resValidFile = await getFileRoute(reqValidFile, {
      params: Promise.resolve({ id: arsipWithFile.id.toString() }),
    });
    assert(
      resValidFile.status === 200,
      "Test 8A — API File dengan session admin valid mengembalikan status 200 OK"
    );

    // B. Expired session -> 401 Unauthorized
    const reqExpiredFile = new NextRequest(
      `http://localhost:3000/api/arsip/${arsipWithFile.id}/file?mode=preview`,
      { headers: { cookie: `${SESSION_COOKIE_NAME}=${idleExpiredToken}` } }
    );
    const resExpiredFile = await getFileRoute(reqExpiredFile, {
      params: Promise.resolve({ id: arsipWithFile.id.toString() }),
    });
    assert(
      resExpiredFile.status === 401,
      "Test 8B — API File dengan session expired ditolak dengan 401 Unauthorized"
    );
  }

  // ---------------------------------------------------------------
  // Test 9: Inactive User (aktif = false) -> ditolak (401)
  // ---------------------------------------------------------------
  // Cari user nonaktif di database jika ada, atau uji dengan simulasi status
  const inactiveUser = await prisma.user.findFirst({
    where: { aktif: false },
  });

  if (inactiveUser) {
    const inactiveToken = await signSession({
      userId: inactiveUser.id.toString(),
      username: inactiveUser.username,
      role: inactiveUser.role,
    });
    const inactiveUserResult = await getUserFromToken(inactiveToken);
    assert(
      inactiveUserResult === null,
      "Test 9 — User yang dinonaktifkan (aktif = false) di database ditolak oleh server"
    );
  } else {
    // Verifikasi logic getUserFromToken menolak user nonaktif secara eksplisit
    console.log("[INFO] Tidak ada user nonaktif permanen di DB, membuat verifikasi nonaktif terkontrol");
    // Buat dummy user nonaktif sementara
    const tempInactive = await prisma.user.create({
      data: {
        nama: "User Test Nonaktif",
        username: `inactive_test_${Date.now()}`,
        password: "hashed_dummy_password",
        role: "user",
        aktif: false,
      },
    });

    const inactiveToken = await signSession({
      userId: tempInactive.id.toString(),
      username: tempInactive.username,
      role: tempInactive.role,
    });

    const inactiveUserResult = await getUserFromToken(inactiveToken);
    assert(
      inactiveUserResult === null,
      "Test 9 — User dinonaktifkan (aktif = false) langsung ditolak oleh getUserFromToken"
    );

    // Bersihkan dummy user
    await prisma.user.delete({ where: { id: tempInactive.id } });
  }

  // ---------------------------------------------------------------
  // Test 10: Sliding Session Refresh (lastActive diperbarui, exp awal tetap)
  // ---------------------------------------------------------------
  const initialLoginTime = now - 600; // Login 10 menit lalu
  const initialExp = initialLoginTime + SESSION_ABSOLUTE_TIMEOUT;
  const slidingToken = await signSession({
    userId: adminUser.id.toString(),
    username: adminUser.username,
    role: adminUser.role,
    iat: initialLoginTime,
    lastActive: initialLoginTime,
    exp: initialExp,
  });

  const parsedBefore = await verifySessionToken(slidingToken);
  assert(parsedBefore !== null, "Test 10 — Initial sliding session token valid");

  const refreshedToken = await refreshSessionToken(parsedBefore!, now);
  const parsedAfter = await verifySessionToken(refreshedToken);

  assert(parsedAfter !== null, "Test 10 — Refreshed session token valid");
  assert(
    parsedAfter?.lastActive === now,
    `Test 10 — lastActive berhasil diperbarui ke waktu sekarang (${parsedAfter?.lastActive})`
  );
  assert(
    parsedAfter?.iat === initialLoginTime,
    `Test 10 — iat login awal dipertahankan (${parsedAfter?.iat})`
  );
  assert(
    parsedAfter?.exp === initialExp,
    `Test 10 — exp batas absolut 8 jam TIDAK BERUBAH dan tidak memanjang (${parsedAfter?.exp})`
  );

  // ---------------------------------------------------------------
  // Test 11: Session Cookie Configuration
  // ---------------------------------------------------------------
  const loginCookieConfig = getCookieConfig();
  assert(loginCookieConfig.httpOnly === true, "Test 11 — Cookie dikonfigurasi HttpOnly: true");
  assert(loginCookieConfig.sameSite === "lax", "Test 11 — Cookie dikonfigurasi SameSite: lax");
  assert(
    loginCookieConfig.maxAge === undefined,
    "Test 11 — Cookie sesi login TIDAK memiliki persistent maxAge (Browser Session Cookie)"
  );

  const logoutCookieConfig = getCookieConfig(0);
  assert(
    logoutCookieConfig.maxAge === 0,
    "Test 11 — Cookie logout dikonfigurasi maxAge: 0 untuk penghapusan segera"
  );

  console.log("==================================================");
  console.log(`TEST SUMMARY: ${passed} / ${total} tests passed.`);
  console.log("==================================================");
}

runSessionTests()
  .catch((err) => {
    console.error("Fatal error saat menjalankan test:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
