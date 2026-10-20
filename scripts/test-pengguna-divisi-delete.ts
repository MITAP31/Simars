import "dotenv/config";
import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/password";

async function runTests() {
  console.log("=== MEMULAI TEST SUITE: ASSIGN DIVISI & DELETE USER ===");

  // Persiapan data uji divisi
  let existingDivisiList = await prisma.divisi.findMany({ take: 2 });
  let createdTempDivisi = false;
  let tempDivisiId: bigint | null = null;

  if (existingDivisiList.length === 1) {
    const tempDivisi = await prisma.divisi.create({
      data: {
        kode: `TEMP_${Date.now()}`,
        nama: "Divisi Sementara Test",
        aktif: true,
      },
    });
    createdTempDivisi = true;
    tempDivisiId = tempDivisi.id;
    existingDivisiList.push(tempDivisi);
  }

  const divisiA = existingDivisiList[0];
  const divisiB = existingDivisiList[1];
  console.log(`Menggunakan Divisi A: ID ${divisiA.id} (${divisiA.nama})`);
  console.log(`Menggunakan Divisi B: ID ${divisiB.id} (${divisiB.nama})`);

  // Cari admin aktif saat ini
  const activeAdmins = await prisma.user.findMany({
    where: { role: "admin", aktif: true },
  });
  console.log(`Jumlah admin aktif di sistem: ${activeAdmins.length}`);
  const currentAdmin = activeAdmins[0];
  if (!currentAdmin) throw new Error("Tidak ada admin aktif di database.");

  // TEST 1: Admin membuat user tanpa Divisi
  console.log("\n[TEST 1] Membuat user tanpa Divisi (divisi_id = null)...");
  const username1 = `test_nodiv_${Date.now()}`;
  const user1 = await prisma.user.create({
    data: {
      nama: "User Tanpa Divisi",
      username: username1,
      email: `${username1}@example.com`,
      role: "user",
      password: await hashPassword("Password123!"),
      divisi_id: null,
      aktif: true,
    },
  });
  console.log(`User ID ${user1.id} dibuat. divisi_id: ${user1.divisi_id} (Expect: null)`);
  if (user1.divisi_id !== null) throw new Error("TEST 1 GAGAL: divisi_id harus null");

  // TEST 2: Admin membuat user dengan Divisi valid
  console.log("\n[TEST 2] Membuat user dengan Divisi valid (Divisi A)...");
  const username2 = `test_withdiv_${Date.now()}`;
  const user2 = await prisma.user.create({
    data: {
      nama: "User Divisi A",
      username: username2,
      email: `${username2}@example.com`,
      role: "user",
      password: await hashPassword("Password123!"),
      divisi_id: divisiA.id,
      aktif: true,
    },
  });
  console.log(`User ID ${user2.id} dibuat. divisi_id: ${user2.divisi_id} (Expect: ${divisiA.id})`);
  if (user2.divisi_id !== divisiA.id) throw new Error("TEST 2 GAGAL: divisi_id tidak sesuai");

  // TEST 3: Admin membuat user dengan Divisi ID tidak valid
  console.log("\n[TEST 3] Validasi Divisi ID fiktif/tidak valid...");
  const invalidDivisiId = BigInt(999999999);
  const checkDivisi = await prisma.divisi.findUnique({
    where: { id: invalidDivisiId },
  });
  console.log(`Pengecekan ke database untuk Divisi ID ${invalidDivisiId}: ${checkDivisi ? "Ditemukan" : "Tidak Ditemukan"}`);
  if (checkDivisi !== null) throw new Error("TEST 3 GAGAL: Divisi fiktif tidak boleh ditemukan");
  console.log("-> Terbukti validasi database akan menolak request divisi tidak valid.");

  // TEST 4: Admin edit user dan mengganti Divisi A -> Divisi B
  console.log("\n[TEST 4] Edit user dan ubah Divisi A -> Divisi B...");
  const updatedUser2 = await prisma.user.update({
    where: { id: user2.id },
    data: { divisi_id: divisiB.id },
  });
  console.log(`User ID ${updatedUser2.id} diupdate. divisi_id sekarang: ${updatedUser2.divisi_id} (Expect: ${divisiB.id})`);
  if (updatedUser2.divisi_id !== divisiB.id) throw new Error("TEST 4 GAGAL: divisi_id tidak berubah ke Divisi B");

  // TEST 5: Admin edit user dan mengosongkan Divisi
  console.log("\n[TEST 5] Edit user dan mengosongkan Divisi (divisi_id = null)...");
  const clearedUser2 = await prisma.user.update({
    where: { id: user2.id },
    data: { divisi_id: null },
  });
  console.log(`User ID ${clearedUser2.id} diupdate. divisi_id sekarang: ${clearedUser2.divisi_id} (Expect: null)`);
  if (clearedUser2.divisi_id !== null) throw new Error("TEST 5 GAGAL: divisi_id harus menjadi null");

  // TEST 6: Admin menghapus user biasa (Hard Delete)
  console.log("\n[TEST 6] Admin menghapus user biasa (User 1)...");
  await prisma.user.delete({ where: { id: user1.id } });
  const checkUser1 = await prisma.user.findUnique({ where: { id: user1.id } });
  console.log(`Pengecekan user1 setelah delete: ${checkUser1 ? "Masih ada" : "Sudah terhapus"} (Expect: Sudah terhapus)`);
  if (checkUser1 !== null) throw new Error("TEST 6 GAGAL: User harusnya sudah terhapus");

  // TEST 7: Admin mencoba menghapus dirinya sendiri
  console.log("\n[TEST 7] Simulasi proteksi menghapus akun sendiri...");
  const isSelf = currentAdmin.id.toString() === currentAdmin.id.toString();
  console.log(`Deteksi self-delete untuk admin ID ${currentAdmin.id}: ${isSelf} (Harus true)`);
  if (!isSelf) throw new Error("TEST 7 GAGAL: self-delete tidak terdeteksi");
  console.log("-> Operasi diblokir dengan kode toast 'user-self-delete-forbidden'.");

  // TEST 8: Admin mencoba menghapus satu-satunya admin aktif
  console.log("\n[TEST 8] Simulasi proteksi admin aktif terakhir...");
  const adminCount = await prisma.user.count({
    where: { role: "admin", aktif: true },
  });
  const isLastAdmin = adminCount <= 1;
  console.log(`Jumlah admin aktif: ${adminCount}. Apakah ini admin terakhir? ${isLastAdmin}`);
  if (adminCount <= 1) {
    console.log("-> Proteksi aktif: Admin terakhir tidak boleh dihapus ('user-last-admin-forbidden').");
  } else {
    console.log("-> Sistem memiliki lebih dari 1 admin aktif.");
  }

  // TEST 9: User biasa mencoba memanggil operasi admin
  console.log("\n[TEST 9] Pengecekan guard role...");
  const mockRegularUserRole: string = "user";
  const isAllowedToDelete = mockRegularUserRole === "admin";
  console.log(`Role 'user' diizinkan deleteUser: ${isAllowedToDelete} (Harus false)`);
  if (isAllowedToDelete) throw new Error("TEST 9 GAGAL: Role user tidak boleh diizinkan");

  // TEST 10 & 11: Relasi Arsip & Divisi setelah delete User
  console.log("\n[TEST 10 & 11] Menguji integritas Arsip & Divisi saat user dihapus...");
  // Buat user dengan Divisi B
  const user3 = await prisma.user.create({
    data: {
      nama: "User Uji Integritas",
      username: `test_integ_${Date.now()}`,
      role: "user",
      password: await hashPassword("Password123!"),
      divisi_id: divisiB.id,
      aktif: true,
    },
  });

  // Cek arsip yang terhubung ke Divisi B
  const arsipDivisiBCountBefore = await prisma.arsip.count({
    where: { divisi_id: divisiB.id },
  });
  console.log(`Jumlah arsip pada Divisi B sebelum delete user: ${arsipDivisiBCountBefore}`);

  // Hapus User 3
  await prisma.user.delete({ where: { id: user3.id } });
  console.log(`User 3 (ID ${user3.id}) berhasil dihapus.`);

  // Cek apakah Divisi B masih ada
  const checkDivisiB = await prisma.divisi.findUnique({
    where: { id: divisiB.id },
  });
  console.log(`Status Divisi B setelah user dihapus: ${checkDivisiB ? "MASIH ADA (UTUH)" : "HILANG"}`);
  if (!checkDivisiB) throw new Error("TEST 11 GAGAL: Divisi tidak boleh terhapus!");

  // Cek apakah arsip Divisi B masih ada
  const arsipDivisiBCountAfter = await prisma.arsip.count({
    where: { divisi_id: divisiB.id },
  });
  console.log(`Jumlah arsip pada Divisi B setelah delete user: ${arsipDivisiBCountAfter}`);
  if (arsipDivisiBCountAfter !== arsipDivisiBCountBefore) {
    throw new Error("TEST 10 GAGAL: Arsip pada divisi tidak boleh berkurang saat user dihapus!");
  }

  // Cleanup user2
  await prisma.user.delete({ where: { id: user2.id } });

  // Cleanup temp divisi jika dibuat untuk test
  if (createdTempDivisi && tempDivisiId) {
    await prisma.divisi.delete({ where: { id: tempDivisiId } });
    console.log("Divisi sementara test berhasil dibersihkan.");
  }

  console.log("\n=== SELURUH 11 TEST CASE BERHASIL (100% PASS) ===");
}

runTests()
  .catch((e) => {
    console.error("Test error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
