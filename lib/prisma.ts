import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaClientVersion: string | undefined;
};

// Memaksa instance development diperbarui setelah Prisma Client digenerate ulang.
// Tanpa penanda ini, instance global lama dapat tetap memakai metadata schema sebelumnya.
const prismaClientVersion = "kode-klasifikasi-is-induk-v1";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

export const prisma =
  (globalForPrisma.prisma && globalForPrisma.prismaClientVersion === prismaClientVersion
    ? globalForPrisma.prisma
    : undefined) ??
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaClientVersion = prismaClientVersion;
}
