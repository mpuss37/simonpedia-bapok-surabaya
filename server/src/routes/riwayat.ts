import { Router } from "express"
import { prisma } from "../lib/prisma"

const router = Router()

// Ambil semua riwayat input.
router.get("/", async (_req, res) => {
  try {
    const data = await prisma.riwayatInput.findMany({
      orderBy: { createdAt: "desc" },
    })
    res.json(data)
  } catch (error) {
    console.error("Gagal mengambil riwayat input:", error)
    res.status(500).json({ error: "Gagal mengambil riwayat input" })
  }
})

// Hapus satu riwayat.
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params
    await prisma.riwayatInput.delete({ where: { id: Number(id) } })
    res.json({ ok: true })
  } catch (error) {
    console.error("Gagal menghapus riwayat:", error)
    res.status(500).json({ error: "Gagal menghapus riwayat" })
  }
})

export default router
