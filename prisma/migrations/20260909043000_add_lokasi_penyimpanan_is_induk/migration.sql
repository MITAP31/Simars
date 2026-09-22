-- AlterTable
ALTER TABLE "lokasi_penyimpanan" ADD COLUMN "is_induk" BOOLEAN NOT NULL DEFAULT false;

-- Keep existing hierarchies consistent with the new induk flag.
UPDATE "lokasi_penyimpanan" AS parent
SET "is_induk" = true
WHERE EXISTS (
  SELECT 1
  FROM "lokasi_penyimpanan" AS child
  WHERE child."parent_id" = parent."id"
);
