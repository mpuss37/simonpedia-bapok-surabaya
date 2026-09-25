import { Router } from "express"
import { prisma } from "../lib/prisma"
import { ambilIdKomoditasTahunTerbaru } from "../lib/komoditasAktif"

const router = Router()

router.get("/", async (_req, res) => {
  try {
    // Hanya tampilkan komoditas yang punya data pada TAHUN TERBARU.
    const idAktif = await ambilIdKomoditasTahunTerbaru()
    const komoditas = await prisma.komoditas.findMany({
      where: { id: { in: idAktif } },
      orderBy: { nama: "asc" },
    })
    res.json(komoditas)
  } catch (error) {
    console.error("Gagal mengambil data komoditas:", error)
    res.status(500).json({ error: "Gagal mengambil data komoditas" })
  }
})

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const komoditas = await prisma.komoditas.findUnique({
      where: { id: Number(id) },
    })

    if (!komoditas) {
      return res.status(404).json({ error: "Komoditas tidak ditemukan" })
    }

    res.json(komoditas)
  } catch (error) {
    console.error("Gagal mengambil data komoditas:", error)
    res.status(500).json({ error: "Gagal mengambil data komoditas" })
  }
})

export default router
