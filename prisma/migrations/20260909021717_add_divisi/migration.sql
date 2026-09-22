-- CreateTable
CREATE TABLE "divisi" (
    "id" BIGSERIAL NOT NULL,
    "kode" VARCHAR(50) NOT NULL,
    "nama" VARCHAR(255) NOT NULL,
    "keterangan" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "divisi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "divisi_kode_key" ON "divisi"("kode");
