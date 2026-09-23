import { Router } from "express"
import { prisma } from "../lib/prisma"

const router = Router()

router.get("/", async (_req, res) => {
  try {
    const pasar = await prisma.pasar.findMany({
      include: { wilayah: true },
      orderBy: { nama: "asc" },
    })
    res.json(pasar)
  } catch (error) {
    console.error("Gagal mengambil data pasar:", error)
    res.status(500).json({ error: "Gagal mengambil data pasar" })
  }
})

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const pasar = await prisma.pasar.findUnique({
      where: { id: Number(id) },
      include: { wilayah: true },
    })

    if (!pasar) {
      return res.status(404).json({ error: "Pasar tidak ditemukan" })
    }

    res.json(pasar)
  } catch (error) {
    console.error("Gagal mengambil data pasar:", error)
    res.status(500).json({ error: "Gagal mengambil data pasar" })
  }
})

export default router
