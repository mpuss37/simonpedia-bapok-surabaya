import { Router } from "express"
import { prisma } from "../lib/prisma"

const router = Router()

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
