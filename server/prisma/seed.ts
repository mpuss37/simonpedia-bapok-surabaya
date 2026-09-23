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

  // 5. HET (Harga Eceran Tertinggi)
  const hetData = [
    { kode: "K2", komoditas: "Bawang Merah (Kualitas Lokal)", harga: 41500, satuan: "kg", sumber: "cakbapok", status: "terverifikasi", catatan: "HET CAKBAPOK Jan 2024 (Bawang Merah Grade A); regulasi HAP 32.000" },
    { kode: "K3", komoditas: "Bawang Putih (Jenis Kating)", harga: null, satuan: "kg", sumber: "tidak_ada", status: "tanpa_het", catatan: "Bawang Putih belum diatur HET periode Jan 2024; basis fluktuasi" },
    { kode: "K4", komoditas: "Bawang Putih (Jenis Sinco)", harga: null, satuan: "kg", sumber: "tidak_ada", status: "tanpa_het", catatan: "Tidak ada HET Bawang Putih periode Jan 2024; basis fluktuasi" },
    { kode: "K5", komoditas: "Beras Premium", harga: 14900, satuan: "kg", sumber: "cakbapok", status: "terverifikasi", catatan: "HET CAKBAPOK Jan 2024; regulasi 13.900; data asli 12.800" },
    { kode: "K6", komoditas: "Beras IR.64 Medium", harga: 12500, satuan: "kg", sumber: "cakbapok", status: "terverifikasi", catatan: "HET CAKBAPOK Beras Medium Non Bulog 12.500" },
    { kode: "K7", komoditas: "Beras IR.64 Medium Bulog", harga: 12500, satuan: "kg", sumber: "cakbapok", status: "terverifikasi", catatan: "CAKBAPOK Beras Medium Bulog 12.500" },
    { kode: "K8", komoditas: "BERAS SPHP", harga: 12500, satuan: "kg", sumber: "cakbapok", status: "terverifikasi", catatan: "SPHP = varian beras medium Bulog; HET 12.500" },
    { kode: "K9", komoditas: "Cabe Merah Besar", harga: null, satuan: "kg", sumber: "tidak_ada", status: "tanpa_het", catatan: "Regulasi hanya mengatur Keriting & Rawit; basis fluktuasi" },
    { kode: "K10", komoditas: "Cabe Merah Kriting", harga: 55000, satuan: "kg", sumber: "regulasi", status: "batas_atas", catatan: "Cakbapok kosong; HAP 37.000-55.000, dipakai batas atas 55.000" },
    { kode: "K11", komoditas: "Cabe Merah Kecil-Rawit", harga: 57000, satuan: "kg", sumber: "cakbapok", status: "terverifikasi", catatan: "CAKBAPOK Cabai Rawit Grade A 57.000" },
    { kode: "K14", komoditas: "Daging Ayam Broiler", harga: 36750, satuan: "kg", sumber: "data", status: "terverifikasi", catatan: "Pakai HET data asli 36.750" },
    { kode: "K16", komoditas: "Daging Sapi Grade Atas", harga: 140000, satuan: "kg", sumber: "cakbapok", status: "terverifikasi", catatan: "CAKBAPOK Daging Sapi Grade A 140.000" },
    { kode: "K17", komoditas: "Daging Sapi Grade Bawah", harga: 130000, satuan: "kg", sumber: "cakbapok", status: "terverifikasi", catatan: "CAKBAPOK Daging Sapi Grade B 130.000" },
    { kode: "K24", komoditas: "Gula Pasir Lokal Curah", harga: 17500, satuan: "kg", sumber: "cakbapok", status: "terverifikasi", catatan: "CAKBAPOK Gula Curah 17.500" },
    { kode: "K26", komoditas: "Ikan Bandeng Segar (Uk. Sedang)", harga: null, satuan: "kg", sumber: "tidak_ada", status: "tanpa_het", catatan: "Ikan segar tidak ada HET; basis fluktuasi" },
    { kode: "K28", komoditas: "Ikan Lele Segar (Ukuran Sedang)", harga: null, satuan: "kg", sumber: "tidak_ada", status: "tanpa_het", catatan: "Ikan segar tidak ada HET; basis fluktuasi" },
    { kode: "K29", komoditas: "Ikan Mujair Segar (Uk. Sedang)", harga: null, satuan: "kg", sumber: "tidak_ada", status: "tanpa_het", catatan: "Ikan segar tidak ada HET; basis fluktuasi" },
    { kode: "K30", komoditas: "Ikan Tongkol Segar (Uk. Sedang)", harga: null, satuan: "kg", sumber: "tidak_ada", status: "tanpa_het", catatan: "Ikan segar tidak ada HET; basis fluktuasi" },
    { kode: "K34", komoditas: "Minyak Goreng Curah (Bening)", harga: 15500, satuan: "kg", sumber: "cakbapok", status: "terverifikasi", catatan: "CAKBAPOK, regulasi, data asli semua 15.500" },
    { kode: "K36", komoditas: "Minyak KITA", harga: 14000, satuan: "kg", sumber: "cakbapok", status: "terverifikasi", catatan: "CAKBAPOK Minyakita 14.000" },
    { kode: "K42", komoditas: "Telur Ayam Horn", harga: 27000, satuan: "kg", sumber: "data", status: "terverifikasi", catatan: "Pakai HET data asli 27.000" },
    { kode: "K43", komoditas: 'Tepung Terigu "Segitiga Biru" Curah', harga: null, satuan: "kg", sumber: "tidak_ada", status: "tanpa_het", catatan: "Tidak ada HET resmi; basis fluktuasi" },
  ]

  for (const h of hetData) {
    await prisma.het.upsert({
      where: { kode: h.kode },
      update: h,
      create: h,
    })
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
