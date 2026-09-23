// Seed khusus untuk tabel HET — aman dijalankan berulang (upsert).
// Jalankan: npx ts-node --transpile-only prisma/seed-het.ts
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

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

async function main() {
  for (const h of hetData) {
    await prisma.het.upsert({ where: { kode: h.kode }, update: h, create: h })
  }
  const jumlah = await prisma.het.count()
  console.log(`Seed HET selesai. Total: ${jumlah} komoditas.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
