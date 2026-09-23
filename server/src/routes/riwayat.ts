import { Router } from "express"
import { prisma } from "../lib/prisma"
import { catatAudit, ambilIp, ambilAdmin } from "../lib/audit"

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
    const lama = await prisma.riwayatInput.findUnique({ where: { id: Number(id) } })
    if (!lama) {
      return res.status(404).json({ error: "Riwayat tidak ditemukan" })
    }

    await prisma.riwayatInput.delete({ where: { id: Number(id) } })

    await catatAudit({
      admin: ambilAdmin(req),
      aksi: "hapus_riwayat",
      entitas: "RiwayatInput",
      entitasId: lama.id,
      deskripsi: `Hapus riwayat input "${lama.namaFile}" (${lama.jumlahBaris} baris)`,
      dataLama: lama,
      ip: ambilIp(req),
    })

    res.json({ ok: true })
  } catch (error) {
    console.error("Gagal menghapus riwayat:", error)
    res.status(500).json({ error: "Gagal menghapus riwayat" })
  }
})

export default router
