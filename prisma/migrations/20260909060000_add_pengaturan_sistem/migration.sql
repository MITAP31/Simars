CREATE TABLE "pengaturan_sistem" (
    "id" INTEGER NOT NULL,
    "nama_instansi" VARCHAR(255) NOT NULL DEFAULT 'PLN Batam',
    "nama_sistem" VARCHAR(100) NOT NULL DEFAULT 'SIMARS',
    "deskripsi" TEXT,
    "tema" VARCHAR(20) NOT NULL DEFAULT 'terang',
    "notifikasi_aktif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "pengaturan_sistem_pkey" PRIMARY KEY ("id")
);
