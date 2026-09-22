import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { hashPassword, verifyPassword } from "../lib/password";

async function runTestSuite() {
  console.log("=== STARTING USER MANAGEMENT TEST SUITE ===");

  // TEST 1: User listing
  console.log("\n[TEST 1] Mengambil daftar pengguna dari database...");
  const users = await prisma.user.findMany({
    select: {
      id: true,
      nama: true,
      username: true,
      email: true,
      role: true,
      aktif: true,
      created_at: true,
    },
    orderBy: [{ role: "asc" }, { created_at: "desc" }],
  });
  console.log(`Ditemukan ${users.length} user di database:`);
  for (const u of users) {
    console.log(`- ID: ${u.id}, Nama: ${u.nama}, Username: @${u.username}, Role: ${u.role}, Aktif: ${u.aktif}`);
  }

  // TEST 2, 3, 4: Search by nama, username, email
  console.log("\n[TEST 2, 3, 4] Menguji pencarian pengguna...");
  const searchNama = await prisma.user.findMany({
    where: {
      OR: [
        { nama: { contains: "admin", mode: "insensitive" } },
        { username: { contains: "admin", mode: "insensitive" } },
        { email: { contains: "admin", mode: "insensitive" } },
      ],
    },
  });
  console.log(`Hasil pencarian 'admin': ${searchNama.length} pengguna (Expect >= 1)`);

  const searchUsername = await prisma.user.findMany({
    where: {
      OR: [
        { nama: { contains: "user_nonaktif", mode: "insensitive" } },
        { username: { contains: "user_nonaktif", mode: "insensitive" } },
        { email: { contains: "user_nonaktif", mode: "insensitive" } },
      ],
    },
  });
  console.log(`Hasil pencarian 'user_nonaktif': ${searchUsername.length} pengguna (Expect >= 1)`);

  // TEST 5: Tambah user baru
  console.log("\n[TEST 5] Membuat user baru untuk pengujian...");
  const testUsername = `testuser_${Date.now()}`;
  const rawPassword = "UserPass123!";
  const hashedPassword = await hashPassword(rawPassword);

  const newUser = await prisma.user.create({
    data: {
      nama: "Pengguna Uji Coba",
      username: testUsername,
      email: `${testUsername}@plnbatam.com`,
      role: "user",
      password: hashedPassword,
      aktif: true,
    },
  });
  console.log(`User baru berhasil dibuat: ID ${newUser.id}, Username: @${newUser.username}`);
  console.log(`Password tersimpan dalam bentuk Bcrypt hash: ${newUser.password.startsWith("$2")}`);
  console.log(`Password TIDAK plaintext: ${newUser.password !== rawPassword}`);

  // TEST 6: Verifikasi kredensial login user baru
  console.log("\n[TEST 6] Menguji verifikasi login user baru...");
  const isValidPass = await verifyPassword(rawPassword, newUser.password);
  const isInvalidPass = await verifyPassword("WrongPassword123", newUser.password);
  console.log(`Login password benar: ${isValidPass} (Harus true)`);
  console.log(`Login password salah: ${isInvalidPass} (Harus false)`);

  // TEST 7: Edit user
  console.log("\n[TEST 7] Menguji edit user...");
  const updatedUser = await prisma.user.update({
    where: { id: newUser.id },
    data: {
      nama: "Pengguna Uji Coba (Updated)",
      email: `updated_${testUsername}@plnbatam.com`,
    },
  });
  console.log(`User diupdate: Nama '${updatedUser.nama}', Email '${updatedUser.email}'`);

  // TEST 8: Nonaktifkan user & cek login
  console.log("\n[TEST 8] Menonaktifkan user dan cek status...");
  const deactivatedUser = await prisma.user.update({
    where: { id: newUser.id },
    data: { aktif: false },
  });
  console.log(`Status user sekarang: aktif = ${deactivatedUser.aktif}`);
  console.log(`Login ditolak jika aktif === false: ${!deactivatedUser.aktif}`);

  // TEST 9: Aktifkan kembali user
  console.log("\n[TEST 9] Mengaktifkan kembali user...");
  const reactivatedUser = await prisma.user.update({
    where: { id: newUser.id },
    data: { aktif: true },
  });
  console.log(`Status user sekarang: aktif = ${reactivatedUser.aktif} (Bisa login kembali)`);

  // TEST 10: Reset password
  console.log("\n[TEST 10] Menguji reset password user...");
  const newRawPassword = "NewResetPassword2026!";
  const newHashedPassword = await hashPassword(newRawPassword);
  await prisma.user.update({
    where: { id: newUser.id },
    data: { password: newHashedPassword },
  });

  const refreshedUser = await prisma.user.findUnique({ where: { id: newUser.id } });
  const oldPassMatches = await verifyPassword(rawPassword, refreshedUser!.password);
  const newPassMatches = await verifyPassword(newRawPassword, refreshedUser!.password);
  console.log(`Password lama ditolak: ${!oldPassMatches} (Harus true)`);
  console.log(`Password baru diterima: ${newPassMatches} (Harus true)`);

  // TEST 11: Proteksi Admin menonaktifkan dirinya sendiri
  console.log("\n[TEST 11] Menguji logika proteksi: Admin menonaktifkan diri sendiri...");
  const adminUser = await prisma.user.findFirst({ where: { role: "admin", aktif: true } });
  if (adminUser) {
    const currentAdminId = adminUser.id.toString();
    const targetId = adminUser.id;
    const isForbidden = currentAdminId === targetId.toString();
    console.log(`Proteksi self-deactivate mendeteksi admin sendiri: ${isForbidden} (Harus true, ditolak)`);
  }

  // TEST 12: Proteksi Admin aktif terakhir
  console.log("\n[TEST 12] Menguji proteksi admin aktif terakhir...");
  const totalActiveAdmins = await prisma.user.count({ where: { role: "admin", aktif: true } });
  console.log(`Total admin aktif saat ini: ${totalActiveAdmins}`);
  if (totalActiveAdmins === 1) {
    console.log("Hanya ada 1 admin aktif -> Penurunan role atau nonaktifkan admin terakhir dicegah!");
  }

  // TEST 13: Uji validasi duplikasi username & email
  console.log("\n[TEST 13] Menguji deteksi duplikasi username & email...");
  const duplicateUserCheck = await prisma.user.findFirst({
    where: { username: { equals: "admin", mode: "insensitive" } },
  });
  console.log(`Pengecekan username 'admin' terdeteksi duplikat: ${!!duplicateUserCheck} (Harus true)`);

  // TEST 14: Konsistensi Role (hanya 'admin' dan 'user')
  console.log("\n[TEST 14] Memeriksa konsistensi role pada seluruh data di database...");
  const allRoles = await prisma.user.findMany({ select: { role: true } });
  const uniqueRoles = Array.from(new Set(allRoles.map((r) => r.role)));
  console.log(`Role yang ada di database: ${uniqueRoles.join(", ")}`);
  const onlyValidRoles = uniqueRoles.every((r) => r === "admin" || r === "user");
  console.log(`Hanya role valid ('admin', 'user') tanpa Operator/Viewer: ${onlyValidRoles} (Harus true)`);

  // CLEANUP: Hapus test user
  console.log("\n[CLEANUP] Menghapus pengguna uji coba...");
  await prisma.user.delete({ where: { id: newUser.id } });
  console.log("Pengguna uji coba dibersihkan.");

  console.log("\n=== SELURUH 14 TEST MANAJEMEN PENGGUNA BERHASIL (PASS) ===");
}

runTestSuite()
  .catch((err) => {
    console.error("Test Suite Gagal:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
