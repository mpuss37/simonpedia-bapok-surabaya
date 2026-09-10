import { Router } from "express"
import { prisma } from "../lib/prisma"

const router = Router()

interface KomoditasAnalisis {
  id: number
  nama: string
  kategori: string
  satuan: string
  hargaRataRata: number
  hargaTertinggi: number
  hargaTerendah: number
  persenPerubahan: number
  levelRisiko: "Normal" | "Siaga" | "Waspada" | "Kritis"
  jumlahPasar: number
}

interface Alert {
  id: number
  komoditas: string
  pasar: string
  harga: number
  hargaRataRata: number
  persenPerubahan: number
  levelRisiko: string
  tanggal: string
}

interface EWSResponse {
  ringkasan: {
    totalKomoditas: number
    normal: number
    siaga: number
    waspada: number
    kritis: number
  }
  analisis: KomoditasAnalisis[]
  alerts: Alert[]
}

function hitungRisiko(persenPerubahan: number): "Normal" | "Siaga" | "Waspada" | "Kritis" {
  const abs = Math.abs(persenPerubahan)
  if (abs < 5) return "Normal"
  if (abs < 10) return "Siaga"
  if (abs < 20) return "Waspada"
  return "Kritis"
}

router.get("/analyze", async (_req, res) => {
  try {
    const komoditasList = await prisma.komoditas.findMany({
      orderBy: { nama: "asc" },
    })

    const analisis: KomoditasAnalisis[] = []
    const alerts: Alert[] = []

    for (const kom of komoditasList) {
      const hargaData = await prisma.detailSurvei.findMany({
        where: { komoditasId: kom.id },
        include: {
          survei: {
            include: { pasar: true },
          },
        },
        orderBy: { survei: { tanggal: "desc" } },
      })

      if (hargaData.length === 0) continue

      const hargaList = hargaData.map((h) => h.harga)
      const hargaRataRata = Math.round(hargaList.reduce((a, b) => a + b, 0) / hargaList.length)
      const hargaTertinggi = Math.max(...hargaList)
      const hargaTerendah = Math.min(...hargaList)

      const tanggalUnik = new Set(hargaData.map((h) => h.survei.tanggal.toISOString().slice(0, 10)))
      const sortedTanggal = Array.from(tanggalUnik).sort()

      let persenPerubahan = 0
      if (sortedTanggal.length >= 2) {
        const tanggalTerakhir = sortedTanggal[sortedTanggal.length - 1]
        const tanggalSebelumnya = sortedTanggal[sortedTanggal.length - 2]

        const hargaTerakhir = hargaData
          .filter((h) => h.survei.tanggal.toISOString().slice(0, 10) === tanggalTerakhir)
          .map((h) => h.harga)

        const hargaSebelumnya = hargaData
          .filter((h) => h.survei.tanggal.toISOString().slice(0, 10) === tanggalSebelumnya)
          .map((h) => h.harga)

        if (hargaTerakhir.length > 0 && hargaSebelumnya.length > 0) {
          const avgTerakhir = hargaTerakhir.reduce((a, b) => a + b, 0) / hargaTerakhir.length
          const avgSebelumnya = hargaSebelumnya.reduce((a, b) => a + b, 0) / hargaSebelumnya.length
          persenPerubahan = Math.round(((avgTerakhir - avgSebelumnya) / avgSebelumnya) * 10000) / 100
        }
      }

      const levelRisiko = hitungRisiko(persenPerubahan)
      const jumlahPasar = new Set(hargaData.map((h) => h.survei.pasarId)).size

      analisis.push({
        id: kom.id,
        nama: kom.nama,
        kategori: kom.kategori,
        satuan: kom.satuan,
        hargaRataRata,
        hargaTertinggi,
        hargaTerendah,
        persenPerubahan,
        levelRisiko,
        jumlahPasar,
      })

      if (levelRisiko !== "Normal") {
        const perPasar = new Map<number, { pasar: string; harga: number }[]>()
        for (const h of hargaData) {
          const pasarId = h.survei.pasarId
          if (!perPasar.has(pasarId)) perPasar.set(pasarId, [])
          perPasar.get(pasarId)!.push({ pasar: h.survei.pasar.nama, harga: h.harga })
        }

        for (const [_, entries] of perPasar) {
          const latest = entries[0]
          if (latest) {
            alerts.push({
              id: alerts.length + 1,
              komoditas: kom.nama,
              pasar: latest.pasar,
              harga: latest.harga,
              hargaRataRata,
              persenPerubahan,
              levelRisiko,
              tanggal: sortedTanggal[sortedTanggal.length - 1] || "",
            })
          }
        }
      }
    }

    const ringkasan = {
      totalKomoditas: analisis.length,
      normal: analisis.filter((a) => a.levelRisiko === "Normal").length,
      siaga: analisis.filter((a) => a.levelRisiko === "Siaga").length,
      waspada: analisis.filter((a) => a.levelRisiko === "Waspada").length,
      kritis: analisis.filter((a) => a.levelRisiko === "Kritis").length,
    }

    alerts.sort((a, b) => Math.abs(b.persenPerubahan) - Math.abs(a.persenPerubahan))

    const response: EWSResponse = {
      ringkasan,
      analisis: analisis.sort((a, b) => Math.abs(b.persenPerubahan) - Math.abs(a.persenPerubahan)),
      alerts: alerts.slice(0, 20),
    }

    res.json(response)
  } catch (error) {
    console.error("Gagal menganalisis EWS:", error)
    res.status(500).json({ error: "Gagal menganalisis data EWS" })
  }
})

router.get("/chart/:komoditasId", async (req, res) => {
  try {
    const { komoditasId } = req.params
    const data = await prisma.detailSurvei.findMany({
      where: { komoditasId: Number(komoditasId) },
      include: {
        survei: {
          include: { pasar: true },
        },
      },
      orderBy: { survei: { tanggal: "asc" } },
    })

    const grouped = new Map<string, number[]>()
    for (const d of data) {
      const tanggal = d.survei.tanggal.toISOString().slice(0, 10)
      if (!grouped.has(tanggal)) grouped.set(tanggal, [])
      grouped.get(tanggal)!.push(d.harga)
    }

    const chartData = Array.from(grouped.entries()).map(([tanggal, harga]) => ({
      tanggal,
      harga: Math.round(harga.reduce((a, b) => a + b, 0) / harga.length),
    }))

    res.json(chartData)
  } catch (error) {
    console.error("Gagal mengambil data chart:", error)
    res.status(500).json({ error: "Gagal mengambil data chart" })
  }
})

export default router
