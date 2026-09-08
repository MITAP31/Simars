ALTER TABLE "jenis_arsip" ADD COLUMN "slug" VARCHAR(120);

WITH base AS (
  SELECT
    "id",
    COALESCE(
      NULLIF(TRIM(BOTH '-' FROM REGEXP_REPLACE(LOWER("nama"), '[^a-z0-9]+', '-', 'g')), ''),
      CONCAT('kategori-', "id")
    ) AS base_slug
  FROM "jenis_arsip"
), numbered AS (
  SELECT
    "id",
    base_slug,
    ROW_NUMBER() OVER (PARTITION BY base_slug ORDER BY "id") AS suffix
  FROM base
)
UPDATE "jenis_arsip" AS jenis
SET "slug" = CASE
  WHEN numbered.suffix = 1 THEN numbered.base_slug
  ELSE numbered.base_slug || '-' || numbered.suffix
END
FROM numbered
WHERE jenis."id" = numbered."id";

ALTER TABLE "jenis_arsip" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "jenis_arsip_slug_key" ON "jenis_arsip"("slug");
