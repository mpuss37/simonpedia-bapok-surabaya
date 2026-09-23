import { Router } from "express"
import * as XLSX from "xlsx"
import { prisma } from "../lib/prisma"

const router = Router()

// =====================================================
// KOMODITAS — CRUD
// =====================================================

router.post("/komoditas", async (req, res) => {
  try {
    const { nama, kategori, satuan } = req.body ?? {}
    if (!nama || !kategori || !satuan) {
      return res.status(400).json({ error: "nama, kategori, dan satuan wajib diisi" })
    }
    const data = await prisma.komoditas.create({ data: { nama, kategori, satuan } })
    res.json(data)
  } catch (error) {
    console.error("Gagal menambah komoditas:", error)
    res.status(500).json({ error: "Gagal menambah komoditas" })
  }
})

router.put("/komoditas/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { nama, kategori, satuan } = req.body ?? {}
    const data = await prisma.komoditas.update({
      where: { id: Number(id) },
      data: {
        ...(nama !== undefined ? { nama } : {}),
        ...(kategori !== undefined ? { kategori } : {}),
        ...(satuan !== undefined ? { satuan } : {}),
      },
    })
    res.json(data)
  } catch (error) {
    console.error("Gagal memperbarui komoditas:", error)
    res.status(500).json({ error: "Gagal memperbarui komoditas" })
  }
})

router.delete("/komoditas/:id", async (req, res) => {
  try {
    const { id } = req.params
    const dipakai = await prisma.detailSurvei.count({ where: { komoditasId: Number(id) } })
    if (dipakai > 0) {
      return res.status(400).json({
        error: `Komoditas ini masih dipakai di ${dipakai} data survei, tidak bisa dihapus.`,
      })
    }
    await prisma.komoditas.delete({ where: { id: Number(id) } })
    res.json({ ok: true })
  } catch (error) {
    console.error("Gagal menghapus komoditas:", error)
    res.status(500).json({ error: "Gagal menghapus komoditas" })
  }
})

// =====================================================
// PASAR — CRUD
// =====================================================

router.post("/pasar", async (req, res) => {
  try {
    const { nama, kecamatan, kelas, lat, lng, wilayahId } = req.body ?? {}
    if (!nama || !kecamatan || !kelas) {
      return res.status(400).json({ error: "nama, kecamatan, dan kelas wajib diisi" })
    }

    // Gunakan wilayahId yang ada, atau wilayah pertama sebagai default.
    let wid = Number(wilayahId)
    if (!wid) {
      const w = await prisma.wilayah.findFirst()
      if (!w) return res.status(400).json({ error: "Belum ada data wilayah" })
      wid = w.id
    }

    const data = await prisma.pasar.create({
      data: {
        nama,
        kecamatan,
        kelas,
        lat: lat !== undefined && lat !== null ? Number(lat) : null,
        lng: lng !== undefined && lng !== null ? Number(lng) : null,
        wilayahId: wid,
      },
    })
    res.json(data)
  } catch (error) {
    console.error("Gagal menambah pasar:", error)
    res.status(500).json({ error: "Gagal menambah pasar" })
  }
})

router.delete("/pasar/:id", async (req, res) => {
  try {
    const { id } = req.params
    const dipakai = await prisma.survei.count({ where: { pasarId: Number(id) } })
    if (dipakai > 0) {
      return res.status(400).json({
        error: `Pasar ini masih punya ${dipakai} data survei, tidak bisa dihapus.`,
      })
    }
    await prisma.pasar.delete({ where: { id: Number(id) } })
    res.json({ ok: true })
  } catch (error) {
    console.error("Gagal menghapus pasar:", error)
    res.status(500).json({ error: "Gagal menghapus pasar" })
  }
})

// =====================================================
// IMPORT DATA HARGA — dari Excel / CSV / JSON
// =====================================================
//
// Menerima array baris (telah di-parse di frontend atau dikirim mentah):
// [
//   { tanggal, kategori, komoditas, satuan, pasar, harga },
//   ...
// ]
//
// Setiap baris: cari/buat komoditas & pasar, lalu simpan Survei + DetailSurvei.
// Karena keterbatasan Tahap 1, endpoint menerima JSON hasil parse dari frontend
// agar tidak perlu mengunggah file biner. (Parser XLSX disiapkan di bawah.)

interface BarisImport {
  tanggal?: string
  kategori?: string
  komoditas?: string
  satuan?: string
  pasar?: string
  harga?: number | string
}

// Simpan satu baris harga: buat komoditas/pasar/survei jika belum ada.
async function simpanBaris(b: BarisImport): Promise<boolean> {
  const namaKomoditas = String(b.komoditas ?? "").trim()
  const namaPasar = String(b.pasar ?? "").trim()
  const tanggal = String(b.tanggal ?? "").trim()
  const harga = Number(String(b.harga ?? "").replace(/[^\d.]/g, ""))

  if (!namaKomoditas || !namaPasar || !tanggal || !Number.isFinite(harga) || harga <= 0) {
    return false
  }

  const tgl = new Date(tanggal)
  if (Number.isNaN(tgl.getTime())) return false

  // Komoditas
  let komoditas = await prisma.komoditas.findFirst({ where: { nama: namaKomoditas } })
  if (!komoditas) {
    komoditas = await prisma.komoditas.create({
      data: {
        nama: namaKomoditas,
        kategori: String(b.kategori ?? "LAINNYA").trim() || "LAINNYA",
        satuan: String(b.satuan ?? "kg").trim() || "kg",
      },
    })
  }

  // Pasar
  let pasar = await prisma.pasar.findFirst({ where: { nama: namaPasar } })
  if (!pasar) {
    let wilayah = await prisma.wilayah.findFirst()
    if (!wilayah) {
      wilayah = await prisma.wilayah.create({
        data: { nama: "Kota Surabaya", kode: "SBY" },
      })
    }
    pasar = await prisma.pasar.create({
      data: {
        nama: namaPasar,
        kecamatan: "-",
        kelas: "-",
        wilayahId: wilayah.id,
      },
    })
  }

  // Survei (tanggal + pasar). Buat bila belum ada.
  let survei = await prisma.survei.findFirst({
    where: { tanggal: tgl, pasarId: pasar.id },
  })
  if (!survei) {
    survei = await prisma.survei.create({
      data: { tanggal: tgl, pasarId: pasar.id, sumber: "IMPORT" },
    })
  }

  // DetailSurvei — perbarui bila sudah ada, kalau belum buat baru.
  const detail = await prisma.detailSurvei.findFirst({
    where: { surveiId: survei.id, komoditasId: komoditas.id },
  })
  if (detail) {
    await prisma.detailSurvei.update({ where: { id: detail.id }, data: { harga } })
  } else {
    await prisma.detailSurvei.create({
      data: { surveiId: survei.id, komoditasId: komoditas.id, harga },
    })
  }

  return true
}

router.post("/import", async (req, res) => {
  try {
    const { namaFile = "tanpa-nama", jenis = "json", baris = [] } = req.body ?? {}

    if (!Array.isArray(baris) || baris.length === 0) {
      return res.status(400).json({ error: "Tidak ada baris data untuk diimpor" })
    }

    let berhasil = 0
    let gagal = 0

    for (const b of baris as BarisImport[]) {
      const ok = await simpanBaris(b)
      if (ok) berhasil++
      else gagal++
    }

    const status = gagal === 0 ? "berhasil" : berhasil === 0 ? "gagal" : "sebagian"

    const riwayat = await prisma.riwayatInput.create({
      data: {
        namaFile,
        jenis,
        jumlahBaris: baris.length,
        berhasil,
        gagal,
        status,
        catatan: gagal > 0 ? `${gagal} baris dilewati (data tidak lengkap)` : null,
      },
    })

    res.json({ ok: true, berhasil, gagal, status, riwayat })
  } catch (error) {
    console.error("Gagal mengimpor data:", error)
    res.status(500).json({ error: "Gagal mengimpor data" })
  }
})

// Parser file Excel/CSV menjadi array baris (dipakai bila frontend kirim base64).
export function parseWorkbook(base64: string): BarisImport[] {
  const wb = XLSX.read(base64, { type: "base64" })
  const sheet = wb.Sheets[wb.SheetNames[0]]
  return XLSX.utils.sheet_to_json<BarisImport>(sheet, { defval: "" })
}

export default router
