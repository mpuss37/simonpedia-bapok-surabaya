import { Router } from "express"
import { prisma } from "../lib/prisma"

const router = Router()

// Daftar audit log. Mendukung pencarian admin/aksi dan batas jumlah baris.
// Tabel audit bersifat append-only — tidak ada endpoint ubah/hapus.
router.get("/", async (req, res) => {
  try {
    const cari = String(req.query.cari ?? "").trim()
    const aksi = String(req.query.aksi ?? "").trim()
    const batas = Math.min(Number(req.query.batas) || 300, 1000)

    const where: Record<string, unknown> = {}
    if (aksi) where.aksi = aksi
    if (cari) {
      where.OR = [
        { admin: { contains: cari, mode: "insensitive" } },
        { deskripsi: { contains: cari, mode: "insensitive" } },
        { entitas: { contains: cari, mode: "insensitive" } },
      ]
    }

    const data = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: batas,
    })

    res.json(data)
  } catch (error) {
    console.error("Gagal mengambil audit log:", error)
    res.status(500).json({ error: "Gagal mengambil audit log" })
  }
})

export default router
