import { Router } from "express"
import { PrismaClient } from "@prisma/client"

const router = Router()
const prisma = new PrismaClient()

function linearRegression(data: number[]) {
  const n = data.length
  if (n === 0) return { slope: 0, intercept: 0 }

  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0
  for (let i = 0; i < n; i++) {
    sumX += i
    sumY += data[i]
    sumXY += i * data[i]
    sumXX += i * i
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  return { slope, intercept }
}

function movingAverage(data: number[], window: number): number[] {
  const result: number[] = []
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - window + 1)
    const slice = data.slice(start, i + 1)
    result.push(slice.reduce((a, b) => a + b, 0) / slice.length)
  }
  return result
}

function exponentialSmoothing(data: number[], alpha: number): number[] {
  const result: number[] = [data[0]]
  for (let i = 1; i < data.length; i++) {
    result.push(alpha * data[i] + (1 - alpha) * result[i - 1])
  }
  return result
}

function forecastRange(prices: number[], days: number): { tanggal: string; harga: number }[] {
  const { slope, intercept } = linearRegression(prices)
  const lastPrice = prices[prices.length - 1]
  const lastDate = new Date("2024-01-31")

  const result: { tanggal: string; harga: number }[] = []

  for (let i = 1; i <= days; i++) {
    const date = new Date(lastDate)
    date.setDate(date.getDate() + i)

    const trendValue = Math.round(intercept + slope * (prices.length + i - 1))

    const weight = i / days
    const predicted = Math.round(trendValue * (1 - weight) + lastPrice * weight)

    result.push({
      tanggal: date.toISOString().split("T")[0],
      harga: Math.max(0, predicted),
    })
  }

  return result
}

router.get("/komoditas/:komoditasId", async (req, res) => {
  try {
    const komoditasId = parseInt(req.params.komoditasId)
    if (isNaN(komoditasId)) {
      return res.status(400).json({ error: "komoditasId tidak valid" })
    }

    const komoditas = await prisma.komoditas.findUnique({
      where: { id: komoditasId },
    })
    if (!komoditas) {
      return res.status(404).json({ error: "Komoditas tidak ditemukan" })
    }

    const harga = await prisma.detailSurvei.findMany({
      where: { survei: { komoditasId } },
      orderBy: { survei: { tanggal: "asc" } },
      select: {
        harga: true,
        survei: { select: { tanggal: true } },
      },
    })

    const dailyPrices = new Map<string, number[]>()
    for (const h of harga) {
      const key = h.survei.tanggal.toISOString().split("T")[0]
      const existing = dailyPrices.get(key) || []
      existing.push(h.harga)
      dailyPrices.set(key, existing)
    }

    const dailyAvg: { tanggal: string; harga: number }[] = []
    for (const [tanggal, prices] of Array.from(dailyPrices.entries()).sort()) {
      dailyAvg.push({
        tanggal,
        harga: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      })
    }

    if (dailyAvg.length < 3) {
      return res.status(400).json({ error: "Data tidak cukup untuk prediksi (minimal 3 hari)" })
    }

    const prices = dailyAvg.map(d => d.harga)

    const last7 = prices.slice(-7)
    const ma = movingAverage(prices, 7)
    const lastMA = ma[ma.length - 1]

    const es = exponentialSmoothing(prices, 0.3)
    const lastES = es[es.length - 1]

    const { slope, intercept } = linearRegression(prices)
    const lastIdx = prices.length - 1
    const trendDirection = slope > 50 ? "naik" : slope < -50 ? "turun" : "stabil"
    const trendPersen = prices.length > 0
      ? Math.round((slope / prices[prices.length - 1]) * 100 * 100) / 100
      : 0

    const minHarga = Math.min(...prices)
    const maxHarga = Math.max(...prices)
    const avgHarga = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)

    const prediksi = forecastRange(prices, 7)

    const prediksiHarga = prediksi[0].harga
    const confidenceInterval = Math.round(maxHarga * 0.05)
    const prediksiRendah = Math.max(0, prediksiHarga - confidenceInterval)
    const prediksiTinggi = prediksiHarga + confidenceInterval

    return res.json({
      komoditas: {
        id: komoditas.id,
        nama: komoditas.nama,
        kategori: komoditas.kategori,
        satuan: komoditas.satuan,
      },
      dataHistoris: dailyAvg,
      analisis: {
        totalHari: prices.length,
        hargaRataRata: avgHarga,
        hargaTertinggi: maxHarga,
        hargaTerendah: minHarga,
        tren: trendDirection,
        trenPersen,
        movingAverage: lastMA,
        exponentialSmoothing: lastES,
        confidence: Math.min(95, Math.round(50 + (prices.length * 5))),
      },
      prediksi7Hari: prediksi,
      prediksiRingkasan: {
        prediksiHarga,
        confidenceInterval,
        prediksiRendah,
        prediksiTinggi,
        confidence: Math.min(95, Math.round(50 + (prices.length * 5))),
      },
      metode: {
        movingAverage: { window: 7, value: lastMA },
        exponentialSmoothing: { alpha: 0.3, value: lastES },
        linearRegression: { slope, intercept },
      },
    })
  } catch (error) {
    console.error("Error prediction:", error)
    return res.status(500).json({ error: "Gagal menghitung prediksi" })
  }
})

router.get("/all", async (_req, res) => {
  try {
    const komoditasList = await prisma.komoditas.findMany({
      orderBy: { nama: "asc" },
    })

    const results: any[] = []

    for (const k of komoditasList) {
      const harga = await prisma.detailSurvei.findMany({
        where: { survei: { komoditasId: k.id } },
        orderBy: { survei: { tanggal: "asc" } },
        select: {
          harga: true,
          survei: { select: { tanggal: true } },
        },
      })

      const dailyPrices = new Map<string, number[]>()
      for (const h of harga) {
        const key = h.survei.tanggal.toISOString().split("T")[0]
        const existing = dailyPrices.get(key) || []
        existing.push(h.harga)
        dailyPrices.set(key, existing)
      }

      const dailyAvg: { tanggal: string; harga: number }[] = []
      for (const [tanggal, prices] of Array.from(dailyPrices.entries()).sort()) {
        dailyAvg.push({
          tanggal,
          harga: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
        })
      }

      const prices = dailyAvg.map(d => d.harga)
      if (prices.length < 3) continue

      const { slope } = linearRegression(prices)
      const trendDirection = slope > 50 ? "naik" : slope < -50 ? "turun" : "stabil"
      const trendPersen = prices.length > 0
        ? Math.round((slope / prices[prices.length - 1]) * 100 * 100) / 100
        : 0

      const prediksi = forecastRange(prices, 7)
      const prediksiHarga = prediksi[0].harga
      const lastPrice = prices[prices.length - 1]
      const perubahanPrediksi = Math.round(((prediksiHarga - lastPrice) / lastPrice) * 100 * 100) / 100

      results.push({
        id: k.id,
        nama: k.nama,
        kategori: k.kategori,
        satuan: k.satuan,
        hargaTerakhir: lastPrice,
        tren: trendDirection,
        trenPersen,
        prediksiHarga,
        perubahanPrediksi,
      })
    }

    return res.json(results)
  } catch (error) {
    console.error("Error prediction all:", error)
    return res.status(500).json({ error: "Gagal menghitung prediksi" })
  }
})

export default router
