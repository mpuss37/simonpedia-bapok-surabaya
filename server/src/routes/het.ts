import { Router } from "express"
import { prisma } from "../lib/prisma"
import { catatAudit, ambilIp, ambilAdmin } from "../lib/audit"

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

    const lama = await prisma.het.findUnique({ where: { id: Number(id) } })
    if (!lama) {
      return res.status(404).json({ error: "Data HET tidak ditemukan" })
    }

    const data = await prisma.het.update({
      where: { id: Number(id) },
      data: {
        ...(harga !== undefined ? { harga: harga === null ? null : Number(harga) } : {}),
        ...(catatan !== undefined ? { catatan } : {}),
        ...(status !== undefined ? { status } : {}),
      },
    })

    await catatAudit({
      admin: ambilAdmin(req),
      aksi: "ubah_het",
      entitas: "Het",
      entitasId: data.id,
      deskripsi: `Ubah HET ${data.komoditas} (${data.kode})`,
      dataLama: { harga: lama.harga, catatan: lama.catatan, status: lama.status },
      dataBaru: { harga: data.harga, catatan: data.catatan, status: data.status },
      ip: ambilIp(req),
      req,
    })

    res.json(data)
  } catch (error) {
    console.error("Gagal memperbarui HET:", error)
    res.status(500).json({ error: "Gagal memperbarui HET" })
  }
})

// Cek apakah data HET sudah terisi.
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
