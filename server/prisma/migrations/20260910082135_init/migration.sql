-- CreateTable
CREATE TABLE "Wilayah" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "kode" TEXT NOT NULL,

    CONSTRAINT "Wilayah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pasar" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "kecamatan" TEXT NOT NULL,
    "kelas" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "wilayahId" INTEGER NOT NULL,

    CONSTRAINT "Pasar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Komoditas" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "satuan" TEXT NOT NULL,

    CONSTRAINT "Komoditas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Survei" (
    "id" SERIAL NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "pasarId" INTEGER NOT NULL,
    "sumber" TEXT,

    CONSTRAINT "Survei_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetailSurvei" (
    "id" SERIAL NOT NULL,
    "surveiId" INTEGER NOT NULL,
    "komoditasId" INTEGER NOT NULL,
    "harga" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "DetailSurvei_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Wilayah_kode_key" ON "Wilayah"("kode");

-- AddForeignKey
ALTER TABLE "Pasar" ADD CONSTRAINT "Pasar_wilayahId_fkey" FOREIGN KEY ("wilayahId") REFERENCES "Wilayah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Survei" ADD CONSTRAINT "Survei_pasarId_fkey" FOREIGN KEY ("pasarId") REFERENCES "Pasar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailSurvei" ADD CONSTRAINT "DetailSurvei_surveiId_fkey" FOREIGN KEY ("surveiId") REFERENCES "Survei"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailSurvei" ADD CONSTRAINT "DetailSurvei_komoditasId_fkey" FOREIGN KEY ("komoditasId") REFERENCES "Komoditas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
