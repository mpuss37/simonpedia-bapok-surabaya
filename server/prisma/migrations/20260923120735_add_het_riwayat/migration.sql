-- CreateTable
CREATE TABLE "Het" (
    "id" SERIAL NOT NULL,
    "kode" TEXT NOT NULL,
    "komoditas" TEXT NOT NULL,
    "harga" DOUBLE PRECISION,
    "satuan" TEXT NOT NULL,
    "sumber" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "catatan" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Het_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiwayatInput" (
    "id" SERIAL NOT NULL,
    "namaFile" TEXT NOT NULL,
    "jenis" TEXT NOT NULL,
    "jumlahBaris" INTEGER NOT NULL,
    "berhasil" INTEGER NOT NULL DEFAULT 0,
    "gagal" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiwayatInput_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Het_kode_key" ON "Het"("kode");
