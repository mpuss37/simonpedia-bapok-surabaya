import { prisma } from "./prisma"

/**
 * Ambil daftar id komoditas yang punya data pada TAHUN TERBARU.
 *
 * DB berisi data dari beberapa tahun (mis. 2023 & 2024). Komoditas yang
 * hanya muncul di tahun lama (nama beda antar tahun) disembunyikan agar
 * daftar & analisis produksi konsisten memakai periode terbaru.
 */
export async function ambilIdKomoditasTahunTerbaru(): Promise<number[]> {
  const maks = await prisma.survei.aggregate({ _max: { tanggal: true } })
  const batas = maks._max.tanggal ?? new Date()
  const awalTahun = new Date(Date.UTC(batas.getUTCFullYear(), 0, 1))

  const rows = await prisma.detailSurvei.findMany({
    where: { survei: { tanggal: { gte: awalTahun } } },
    select: { komoditasId: true },
    distinct: ["komoditasId"],
  })
  return rows.map((r) => r.komoditasId)
}
