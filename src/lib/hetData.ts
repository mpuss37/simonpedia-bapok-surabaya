/**
 * Data HET (Harga Eceran Tertinggi) / HAP (Harga Acuan Penjualan) bahan pokok.
 *
 * Sumber: hasil analisis data di raw_data/data_analysis (het_final.csv),
 * mengacu pada regulasi Bapanas/Perbadan & CAKBAPOK periode Januari 2024.
 *
 * `het` = nilai HET dalam Rupiah per satuan. Bila `null`, komoditas
 * tidak memiliki HET resmi (harga berbasis fluktuasi pasar).
 */
export interface HetItem {
  kode: string
  komoditas: string
  /** HET dalam Rupiah per satuan, atau null bila tidak ada HET resmi. */
  het: number | null
  satuan: string
  /** Sumber acuan: cakbapok, regulasi, data, atau tidak_ada. */
  sumber: string
  status: string
  catatan: string
}

export const HET_DATA: HetItem[] = [
  { kode: "K2", komoditas: "Bawang Merah (Kualitas Lokal)", het: 41500, satuan: "kg", sumber: "cakbapok", status: "terverifikasi", catatan: "HET CAKBAPOK Jan 2024 (Bawang Merah Grade A); regulasi HAP 32.000" },
  { kode: "K3", komoditas: "Bawang Putih (Jenis Kating)", het: null, satuan: "kg", sumber: "tidak_ada", status: "tanpa_het", catatan: "Perbadan 11/2022 & 17/2023 tidak mencakup Bawang Putih periode Jan 2024; basis fluktuasi" },
  { kode: "K4", komoditas: "Bawang Putih (Jenis Sinco)", het: null, satuan: "kg", sumber: "tidak_ada", status: "tanpa_het", catatan: "Tidak ada HET Bawang Putih periode Jan 2024; basis fluktuasi" },
  { kode: "K5", komoditas: "Beras Premium", het: 14900, satuan: "kg", sumber: "cakbapok", status: "terverifikasi", catatan: "HET CAKBAPOK Jan 2024; regulasi 13.900; data asli 12.800" },
  { kode: "K6", komoditas: "Beras IR.64 Medium", het: 12500, satuan: "kg", sumber: "cakbapok", status: "terverifikasi", catatan: "HET CAKBAPOK Beras Medium Non Bulog 12.500" },
  { kode: "K7", komoditas: "Beras IR.64 Medium Bulog", het: 12500, satuan: "kg", sumber: "cakbapok", status: "terverifikasi", catatan: "CAKBAPOK Beras Medium Bulog 12.500" },
  { kode: "K8", komoditas: "BERAS SPHP", het: 12500, satuan: "kg", sumber: "cakbapok", status: "terverifikasi", catatan: "SPHP = varian beras medium Bulog; HET 12.500 (samakan K7)" },
  { kode: "K9", komoditas: "Cabe Merah Besar", het: null, satuan: "kg", sumber: "tidak_ada", status: "tanpa_het", catatan: "Regulasi hanya mengatur Keriting & Rawit; basis fluktuasi" },
  { kode: "K10", komoditas: "Cabe Merah Kriting", het: 55000, satuan: "kg", sumber: "regulasi", status: "batas_atas", catatan: "Cakbapok kosong; HAP 37.000-55.000, dipakai batas atas 55.000" },
  { kode: "K11", komoditas: "Cabe Merah Kecil-Rawit", het: 57000, satuan: "kg", sumber: "cakbapok", status: "terverifikasi", catatan: "CAKBAPOK Cabai Rawit Grade A 57.000 (= batas atas regulasi 40.000-57.000)" },
  { kode: "K14", komoditas: "Daging Ayam Broiler", het: 36750, satuan: "kg", sumber: "data", status: "terverifikasi", catatan: "Cakbapok & regulasi kosong; pakai HET data asli 36.750" },
  { kode: "K16", komoditas: "Daging Sapi Grade Atas", het: 140000, satuan: "kg", sumber: "cakbapok", status: "terverifikasi", catatan: "CAKBAPOK Daging Sapi Grade A 140.000; regulasi 105.000" },
  { kode: "K17", komoditas: "Daging Sapi Grade Bawah", het: 130000, satuan: "kg", sumber: "cakbapok", status: "terverifikasi", catatan: "CAKBAPOK Daging Sapi Grade B 130.000; regulasi 80.000" },
  { kode: "K24", komoditas: "Gula Pasir Lokal Curah", het: 17500, satuan: "kg", sumber: "cakbapok", status: "terverifikasi", catatan: "CAKBAPOK Gula Curah 17.500; regulasi 14.500; data asli 13.500" },
  { kode: "K26", komoditas: "Ikan Bandeng Segar (Uk. Sedang)", het: null, satuan: "kg", sumber: "tidak_ada", status: "tanpa_het", catatan: "Ikan segar tidak ada HET; basis fluktuasi" },
  { kode: "K28", komoditas: "Ikan Lele Segar (Ukuran Sedang)", het: null, satuan: "kg", sumber: "tidak_ada", status: "tanpa_het", catatan: "Ikan segar tidak ada HET; basis fluktuasi" },
  { kode: "K29", komoditas: "Ikan Mujair Segar (Uk. Sedang)", het: null, satuan: "kg", sumber: "tidak_ada", status: "tanpa_het", catatan: "Ikan segar tidak ada HET; basis fluktuasi" },
  { kode: "K30", komoditas: "Ikan Tongkol Segar (Uk. Sedang)", het: null, satuan: "kg", sumber: "tidak_ada", status: "tanpa_het", catatan: "Ikan segar tidak ada HET; basis fluktuasi" },
  { kode: "K34", komoditas: "Minyak Goreng Curah (Bening)", het: 15500, satuan: "kg", sumber: "cakbapok", status: "terverifikasi", catatan: "CAKBAPOK & regulasi & data asli semua 15.500 (cocok)" },
  { kode: "K36", komoditas: "Minyak KITA", het: 14000, satuan: "kg", sumber: "cakbapok", status: "terverifikasi", catatan: "CAKBAPOK Minyakita 14.000 (= data asli)" },
  { kode: "K42", komoditas: "Telur Ayam Horn", het: 27000, satuan: "kg", sumber: "data", status: "terverifikasi", catatan: "Cakbapok & regulasi kosong; pakai HET data asli 27.000" },
  { kode: "K43", komoditas: 'Tepung Terigu "Segitiga Biru" Curah', het: null, satuan: "kg", sumber: "tidak_ada", status: "tanpa_het", catatan: "Tidak ada HET resmi; basis fluktuasi" },
]
