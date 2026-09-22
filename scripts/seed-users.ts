import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("=== SIMARS User Seeding Script ===");

  const adminName = process.env.INITIAL_ADMIN_NAME || "Administrator SIMARS";
  const adminUsername = process.env.INITIAL_ADMIN_USERNAME || "admin";
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL || "admin@plnbatam.com";
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || "admin123";

  const userName = process.env.INITIAL_USER_NAME || "Pengguna SIMARS";
  const userUsername = process.env.INITIAL_USER_USERNAME || "user";
  const userEmail = process.env.INITIAL_USER_EMAIL || "user@plnbatam.com";
  const userPassword = process.env.INITIAL_USER_PASSWORD || "user123";

  const inactiveName = process.env.INITIAL_INACTIVE_NAME || "User Nonaktif";
  const inactiveUsername = process.env.INITIAL_INACTIVE_USERNAME || "user_nonaktif";
  const inactiveEmail = process.env.INITIAL_INACTIVE_EMAIL || "nonaktif@plnbatam.com";
  const inactivePassword = process.env.INITIAL_INACTIVE_PASSWORD || "nonaktif123";

  const usersToSeed = [
    {
      nama: adminName,
      username: adminUsername,
      email: adminEmail,
      rawPassword: adminPassword,
      role: "admin",
      aktif: true,
      label: "Admin Account",
    },
    {
      nama: userName,
      username: userUsername,
      email: userEmail,
      rawPassword: userPassword,
      role: "user",
      aktif: true,
      label: "Standard User Account",
    },
    {
      nama: inactiveName,
      username: inactiveUsername,
      email: inactiveEmail,
      rawPassword: inactivePassword,
      role: "user",
      aktif: false,
      label: "Inactive User Account (For Access Testing)",
    },
  ];

  for (const item of usersToSeed) {
    const existing = await prisma.user.findFirst({
      where: {
        username: {
          equals: item.username,
          mode: "insensitive",
        },
      },
    });

    if (existing) {
      console.log(`[SKIP] ${item.label} (@${item.username}) sudah ada (ID: ${existing.id}). Tidak di-overwrite.`);
      continue;
    }

    const hashedPassword = await bcrypt.hash(item.rawPassword, 10);

    const created = await prisma.user.create({
      data: {
        nama: item.nama,
        username: item.username,
        email: item.email,
        password: hashedPassword,
        role: item.role,
        aktif: item.aktif,
      },
    });

    console.log(`[CREATED] ${item.label}: @${created.username} (Role: ${created.role}, Aktif: ${created.aktif}, ID: ${created.id})`);
  }

  console.log("=== Seeding Selesai ===");
}

main()
  .catch((err) => {
    console.error("Seeding gagal:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
