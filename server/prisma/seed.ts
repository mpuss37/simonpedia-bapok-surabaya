import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // 1. Wilayah
  const surabaya = await prisma.wilayah.upsert({
    where: { kode: "SUB" },
    update: {},
    create: { nama: "Surabaya", kode: "SUB" },
  })

  // 2. Pasar
  const pasarData = [
    { nama: "Pasar Asem Rowo", kecamatan: "Asem Rowo", kelas: "Utama", lat: -7.2891, lng: 112.6821 },
    { nama: "Pasar Balongsari", kecamatan: "Tandes", kelas: "Madya", lat: -7.2734, lng: 112.6756 },
    { nama: "Pasar Bendul Merisi", kecamatan: "Wonokromo", kelas: "Utama", lat: -7.3012, lng: 112.7324 },
    { nama: "Pasar Dukuh Kupang", kecamatan: "Dukuh Pakis", kelas: "Utama", lat: -7.2890, lng: 112.6945 },
    { nama: "Pasar Gayungsari", kecamatan: "Gayungan", kelas: "Madya", lat: -7.3156, lng: 112.7234 },
    { nama: "Pasar Genteng Baru", kecamatan: "Genteng", kelas: "Utama", lat: -7.2567, lng: 112.7389 },
    { nama: "Pasar Kembang Jepun", kecamatan: "Tegalsari", kelas: "Utama", lat: -7.2634, lng: 112.7367 },
    { nama: "Pasar Keputran Selatan", kecamatan: "Tegalsari", kelas: "Madya", lat: -7.2678, lng: 112.7312 },
    { nama: "Pasar Pabean", kecamatan: "Krembangan", kelas: "Utama", lat: -7.2345, lng: 112.7234 },
  ]

  for (const p of pasarData) {
    await prisma.pasar.upsert({
      where: { id: pasarData.indexOf(p) + 1 },
      update: p,
      create: { ...p, wilayahId: surabaya.id },
    })
  }

  // 3. Komoditas
  const komoditasData = [
    { nama: "Beras Premium", kategori: "Pangan Pokok", satuan: "kg" },
    { nama: "Beras Medium", kategori: "Pangan Pokok", satuan: "kg" },
    { nama: "Cabai Merah", kategori: "Bumbu Dapur", satuan: "kg" },
    { nama: "Cabai Rawit", kategori: "Bumbu Dapur", satuan: "kg" },
    { nama: "Bawang Merah", kategori: "Bumbu Dapur", satuan: "kg" },
    { nama: "Bawang Putih", kategori: "Bumbu Dapur", satuan: "kg" },
    { nama: "Gula Pasir", kategori: "Pangan Pokok", satuan: "kg" },
    { nama: "Minyak Goreng", kategori: "Pangan Pokok", satuan: "liter" },
  ]

  for (const k of komoditasData) {
    await prisma.komoditas.upsert({
      where: { id: komoditasData.indexOf(k) + 1 },
      update: k,
      create: k,
    })
  }

  // 4. Survei + Detail Survei (sample data)
  const today = new Date()
  const pasarIds = [1, 3, 5, 7] // Asem Rowo, Bendul Merisi, Gayungsari, Kembang Jepun

  for (const pasarId of pasarIds) {
    const survei = await prisma.survei.create({
      data: {
        tanggal: today,
        pasarId,
        sumber: "SIMONPEDIA",
      },
    })

    const hargaData = [
      { komoditasId: 1, harga: 16500 },
      { komoditasId: 2, harga: 14000 },
      { komoditasId: 3, harga: 68000 },
      { komoditasId: 4, harga: 82000 },
      { komoditasId: 5, harga: 42000 },
      { komoditasId: 6, harga: 35000 },
      { komoditasId: 7, harga: 18500 },
      { komoditasId: 8, harga: 19000 },
    ]

    for (const h of hargaData) {
      const variance = Math.floor(Math.random() * 5000) - 2500
      await prisma.detailSurvei.create({
        data: {
          surveiId: survei.id,
          komoditasId: h.komoditasId,
          harga: h.harga + variance,
        },
      })
    }
  }

  console.log("Seed data created successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
