-- CreateTable
CREATE TABLE "arsip" (
    "id" BIGSERIAL NOT NULL,
    "nomor_arsip" VARCHAR(100) NOT NULL,
    "kode_klasifikasi_id" BIGINT NOT NULL,
    "nama_arsip" VARCHAR(255) NOT NULL,
    "jenis_arsip_id" BIGINT,
    "jumlah" INTEGER NOT NULL DEFAULT 1,
    "satuan" VARCHAR(50),
    "kurun_waktu" VARCHAR(100),
    "tanggal_arsip" DATE,
    "tingkat_keaslian" VARCHAR(50),
    "lokasi_id" BIGINT,
    "file_arsip" TEXT,
    "status_arsip" VARCHAR(50) NOT NULL DEFAULT 'tersimpan',
    "keterangan" TEXT,
    "penulis_pengirim" VARCHAR(255),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "arsip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kode_klasifikasi" (
    "id" BIGSERIAL NOT NULL,
    "kode" VARCHAR(50) NOT NULL,
    "nama" VARCHAR(255) NOT NULL,
    "jenis_klasifikasi" VARCHAR(50),
    "parent_id" BIGINT,
    "keterangan" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "kode_klasifikasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jenis_arsip" (
    "id" BIGSERIAL NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "jenis_arsip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lokasi_penyimpanan" (
    "id" BIGSERIAL NOT NULL,
    "jenis_lokasi" VARCHAR(50) NOT NULL,
    "kode" VARCHAR(50) NOT NULL,
    "nama" VARCHAR(255) NOT NULL,
    "parent_id" BIGINT,
    "keterangan" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "lokasi_penyimpanan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" BIGSERIAL NOT NULL,
    "nama" VARCHAR(255) NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255),
    "password" TEXT NOT NULL,
    "role" VARCHAR(50) NOT NULL DEFAULT 'user',
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "jenis_arsip_nama_key" ON "jenis_arsip"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- AddForeignKey
ALTER TABLE "arsip" ADD CONSTRAINT "fk_arsip_kode_klasifikasi" FOREIGN KEY ("kode_klasifikasi_id") REFERENCES "kode_klasifikasi"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "arsip" ADD CONSTRAINT "fk_arsip_lokasi" FOREIGN KEY ("lokasi_id") REFERENCES "lokasi_penyimpanan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "arsip" ADD CONSTRAINT "arsip_jenis_arsip_id_fkey" FOREIGN KEY ("jenis_arsip_id") REFERENCES "jenis_arsip"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
