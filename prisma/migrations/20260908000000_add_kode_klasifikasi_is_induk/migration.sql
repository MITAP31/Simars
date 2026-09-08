-- Keep the existing parent-child tree intact while storing which codes may be selected as a parent.
ALTER TABLE "kode_klasifikasi"
ADD COLUMN "is_induk" BOOLEAN NOT NULL DEFAULT false;

-- Existing nodes that already have children must remain selectable as their parent.
UPDATE "kode_klasifikasi"
SET "is_induk" = true
WHERE "id" IN (
  SELECT DISTINCT "parent_id"
  FROM "kode_klasifikasi"
  WHERE "parent_id" IS NOT NULL
);
