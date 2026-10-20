-- DropIndex
DROP INDEX IF EXISTS "penyerahan_arsip_nomor_penyerahan_key";

-- AlterTable
ALTER TABLE "penyerahan_arsip" DROP COLUMN IF EXISTS "nomor_penyerahan";

-- AlterTable
ALTER TABLE "penyerahan_arsip" ALTER COLUMN "status" SET DEFAULT 'DIBUAT';
