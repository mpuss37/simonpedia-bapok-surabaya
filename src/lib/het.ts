/**
 * HET (Harga Eceran Tertinggi) bahan pokok.
 *
 * HET adalah batas harga jual paling tinggi di tingkat konsumen/eceran yang
 * ditetapkan pemerintah. Dipakai sebagai informasi tambahan pada grafik untuk
 * melihat apakah harga pasar masih di bawah atau sudah melampaui HET.
 *
 * Catatan: hanya sebagian komoditas yang diatur HET-nya. Komoditas seperti
 * cabai dan bawang tidak memiliki HET resmi (harga bebas/fluktuatif), sehingga
 * bernilai `null`.
 *
 * Nilai mengacu pada kebijakan Bapanas/Permendag (per kg / per liter).
 */
export interface HetInfo {
  /** HET dalam Rupiah per satuan. */
  harga: number
  /** Satuan HET (mis. "kg", "liter"). */
  satuan: string
  /** Dasar acuan singkat (opsional). */
  acuan?: string
}

/**
 * Peta HET berdasarkan nama komoditas (di-lowercase, dicocokkan sebagian).
 * Kunci ditulis tanpa spasi berlebih agar pencocokan toleran.
 */
export const HET_KOMODITAS: Record<string, HetInfo> = {
  "beras medium": { harga: 12500, satuan: "kg", acuan: "Bapanas" },
  "beras premium": { harga: 14900, satuan: "kg", acuan: "Bapanas" },
  "gula pasir": { harga: 17500, satuan: "kg", acuan: "Permendag" },
  "gula konsumsi": { harga: 17500, satuan: "kg", acuan: "Permendag" },
  "minyak goreng": { harga: 15700, satuan: "liter", acuan: "Minyakita" },
  "minyak goreng kemasan": { harga: 15700, satuan: "liter", acuan: "Minyakita" },
  "telur ayam": { harga: 27000, satuan: "kg", acuan: "Bapanas" },
  "daging ayam": { harga: 38000, satuan: "kg", acuan: "Bapanas" },
  "daging sapi": { harga: 135000, satuan: "kg", acuan: "Bapanas" },
  "beras": { harga: 12500, satuan: "kg", acuan: "Bapanas" },
}

/**
 * Cari HET untuk sebuah nama komoditas. Pencocokan dilakukan dengan
 * memeriksa apakah nama mengandung salah satu kunci HET.
 */
export function getHet(namaKomoditas: string | null | undefined): HetInfo | null {
  if (!namaKomoditas) return null

  const nama = namaKomoditas.trim().toLowerCase()

  if (HET_KOMODITAS[nama]) return HET_KOMODITAS[nama]

  // Pencocokan sebagian: pilih kunci terpanjang yang cocok agar lebih spesifik.
  const match = Object.keys(HET_KOMODITAS)
    .filter((key) => nama.includes(key))
    .sort((a, b) => b.length - a.length)[0]

  return match ? HET_KOMODITAS[match] : null
}
