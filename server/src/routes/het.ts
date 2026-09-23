import { Router } from "express"
import { prisma } from "../lib/prisma"

const router = Router()

// Ambil semua HET.
router.get("/", async (_req, res) => {
  try {
    const data = await prisma.het.findMany({ orderBy: { kode: "asc" } })
    res.json(data)
  } catch (error) {
    console.error("Gagal mengambil data HET:", error)
    res.status(500).json({ error: "Gagal mengambil data HET" })
  }
})

// Perbarui HET berdasarkan id.
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { harga, catatan, status } = req.body ?? {}

    const data = await prisma.het.update({
      where: { id: Number(id) },
      data: {
        ...(harga !== undefined ? { harga: harga === null ? null : Number(harga) } : {}),
        ...(catatan !== undefined ? { catatan } : {}),
        ...(status !== undefined ? { status } : {}),
      },
    })

    res.json(data)
  } catch (error) {
    console.error("Gagal memperbarui HET:", error)
    res.status(500).json({ error: "Gagal memperbarui HET" })
  }
})

// Isi data HET awal (seed) bila tabel kosong.
router.post("/seed", async (_req, res) => {
  try {
    const jumlah = await prisma.het.count()
    if (jumlah > 0) {
      return res.json({ ok: true, message: "Data HET sudah ada", jumlah })
    }
    res.json({ ok: false, message: "Tabel kosong. Jalankan seed dari script." })
  } catch (error) {
    console.error("Gagal cek data HET:", error)
    res.status(500).json({ error: "Gagal cek data HET" })
  }
})

export default router
