import { Router } from "express"
import { prisma } from "../lib/prisma"
import { ambilIdKomoditasTahunTerbaru } from "../lib/komoditasAktif"

const router = Router()

// GET /api/harga/ringkasan
// Ringkasan per komoditas: harga rata-rata (pasar terakhir), % perubahan vs
// periode sebelumnya, jumlah pasar pelapor, status naik/turun/stabil.
// Jauh lebih ringan dari /api/harga (yang mengirim 138rb baris mentah).
router.get("/ringkasan", async (_req, res) => {
  try {
    const idAktif = await ambilIdKomoditasTahunTerbaru()
    const komoditasList = await prisma.komoditas.findMany({
      where: { id: { in: idAktif } },
      orderBy: { nama: "asc" },
    })

    const result = []

    for (const kom of komoditasList) {
      // Ambil 2 tanggal survei terakhir utk komoditas ini
      const hargaData = await prisma.detailSurvei.findMany({
        where: { komoditasId: kom.id },
        select: { harga: true, survei: { select: { tanggal: true } } },
        orderBy: { survei: { tanggal: "desc" } },
        take: 200,
      })

      if (hargaData.length === 0) continue

      // Kelompokkan per tanggal
      const perTanggal = new Map<string, number[]>()
      for (const h of hargaData) {
        const t = h.survei.tanggal.toISOString().split("T")[0]
        const arr = perTanggal.get(t) || []
        arr.push(h.harga)
        perTanggal.set(t, arr)
      }

      const tanggalUrut = Array.from(perTanggal.keys()).sort()
      const tglTerakhir = tanggalUrut[tanggalUrut.length - 1]
      const arrTerakhir = perTanggal.get(tglTerakhir)!
      const hargaRataRata = Math.round(
        arrTerakhir.reduce((a, b) => a + b, 0) / arrTerakhir.length
      )

      // Perubahan vs tanggal survei sebelumnya
      let persenPerubahan = 0
      if (tanggalUrut.length >= 2) {
        const tglSebelumnya = tanggalUrut[tanggalUrut.length - 2]
        const arrSebelumnya = perTanggal.get(tglSebelumnya)!
        const rataSebelumnya =
          arrSebelumnya.reduce((a, b) => a + b, 0) / arrSebelumnya.length
        if (rataSebelumnya > 0) {
          persenPerubahan =
            Math.round(
              ((hargaRataRata - rataSebelumnya) / rataSebelumnya) * 100 * 100
            ) / 100
        }
      }

      const status =
        persenPerubahan > 0.05 ? "Naik" : persenPerubahan < -0.05 ? "Turun" : "Stabil"

      result.push({
        id: kom.id,
        nama: kom.nama,
        kategori: kom.kategori,
        satuan: kom.satuan,
        hargaRataRata,
        persenPerubahan,
        status,
        jumlahPasar: arrTerakhir.length,
        tanggal: tglTerakhir,
      })
    }

    res.json({
      lastUpdate: result.length > 0 ? result[0].tanggal : null,
      total: result.length,
      data: result,
    })
  } catch (error) {
    console.error("Gagal mengambil ringkasan harga:", error)
    res.status(500).json({ error: "Gagal mengambil ringkasan harga" })
  }
})

router.get("/", async (req, res) => {
  try {
    const { pasar_id, komoditas_id } = req.query

    const where: Record<string, unknown> = {}

    if (pasar_id) {
      where.survei = { pasarId: Number(pasar_id) }
    }

    if (komoditas_id) {
      where.komoditasId = Number(komoditas_id)
    }

    const data = await prisma.detailSurvei.findMany({
      where,
      include: {
        komoditas: true,
        survei: {
          include: { pasar: true },
        },
      },
      orderBy: { survei: { tanggal: "desc" } },
    })

    const result = data.map((d) => ({
      id: d.id,
      harga: d.harga,
      tanggal: d.survei.tanggal,
      sumber: d.survei.sumber,
      komoditas: {
        id: d.komoditas.id,
        nama: d.komoditas.nama,
        kategori: d.komoditas.kategori,
        satuan: d.komoditas.satuan,
      },
      pasar: {
        id: d.survei.pasar.id,
        nama: d.survei.pasar.nama,
        kecamatan: d.survei.pasar.kecamatan,
      },
    }))

    res.json(result)
  } catch (error) {
    console.error("Gagal mengambil data harga:", error)
    res.status(500).json({ error: "Gagal mengambil data harga" })
  }
})

export default router
