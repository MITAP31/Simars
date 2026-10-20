import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

class SeedConfigurationError extends Error {}

function requiredValue(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new SeedConfigurationError(`Konfigurasi seed wajib diisi: ${name}.`);
  }
  return value;
}

function seedPassword(name: string, username: string, email: string): string {
  const password = requiredValue(name);
  const uniqueCharacters = new Set(password).size;
  const hasRepeatedPattern = /^(.{1,16})\1+$/.test(password);
  const resemblesOldDefault = ["admin123", "user123", "nonaktif123"].includes(password.toLowerCase());
  const accountTerms = [username, email.split("@")[0]]
    .filter(Boolean)
    .map((term) => term.toLowerCase());
  const containsAccountTerm = accountTerms.some((term) => password.toLowerCase().includes(term));

  if (
    !/^[a-f0-9]{64}$/.test(password) ||
    uniqueCharacters < 12 ||
    hasRepeatedPattern ||
    resemblesOldDefault ||
    containsAccountTerm
  ) {
    throw new SeedConfigurationError(
      `Konfigurasi ${name} tidak valid. Gunakan password acak unik 64 karakter hex dari openssl rand -hex 32.`
    );
  }

  return password;
}

function loadSeedUsers() {
  const users = [
    {
      nama: requiredValue("INITIAL_ADMIN_NAME"),
      username: requiredValue("INITIAL_ADMIN_USERNAME"),
      email: requiredValue("INITIAL_ADMIN_EMAIL"),
      role: "admin",
      aktif: true,
      label: "Admin Account",
      passwordEnv: "INITIAL_ADMIN_PASSWORD",
    },
    {
      nama: requiredValue("INITIAL_USER_NAME"),
      username: requiredValue("INITIAL_USER_USERNAME"),
      email: requiredValue("INITIAL_USER_EMAIL"),
      role: "user",
      aktif: true,
      label: "Standard User Account",
      passwordEnv: "INITIAL_USER_PASSWORD",
    },
    {
      nama: requiredValue("INITIAL_INACTIVE_NAME"),
      username: requiredValue("INITIAL_INACTIVE_USERNAME"),
      email: requiredValue("INITIAL_INACTIVE_EMAIL"),
      role: "user",
      aktif: false,
      label: "Inactive User Account (For Access Testing)",
      passwordEnv: "INITIAL_INACTIVE_PASSWORD",
    },
  ];

  for (const item of users) {
    if (item.nama.length > 255 || !/^[A-Za-z0-9._-]{3,100}$/.test(item.username)) {
      throw new SeedConfigurationError(
        `Konfigurasi nama atau username tidak valid untuk ${item.passwordEnv.replace("_PASSWORD", "_NAME/USERNAME")}.`
      );
    }
    if (
      item.email.length > 255 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.email)
    ) {
      throw new SeedConfigurationError(
        `Konfigurasi email tidak valid untuk ${item.passwordEnv.replace("_PASSWORD", "_EMAIL")}.`
      );
    }
  }

  const usernames = users.map((user) => user.username.toLowerCase());
  const emails = users.map((user) => user.email.toLowerCase());
  if (new Set(usernames).size !== users.length || new Set(emails).size !== users.length) {
    throw new SeedConfigurationError("Username dan email untuk setiap akun seed harus unik.");
  }

  const passwords = users.map((user) => seedPassword(user.passwordEnv, user.username, user.email));
  if (new Set(passwords).size !== passwords.length) {
    throw new SeedConfigurationError("Password untuk setiap akun seed harus berbeda.");
  }

  return users.map((user, index) => ({ ...user, rawPassword: passwords[index] }));
}

async function main() {
  const usersToSeed = loadSeedUsers();
  const databaseUrl = requiredValue("DATABASE_URL");
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });

  try {
  console.log("=== SIMARS User Seeding Script ===");

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
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error: unknown) => {
    if (error instanceof SeedConfigurationError) {
      console.error(error.message);
    } else {
      // Prisma/database errors may contain connection details; never print them.
      console.error("Seeding gagal saat mengakses database. Detail internal disembunyikan.");
    }
    process.exitCode = 1;
  });
