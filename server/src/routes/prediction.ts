import { Router } from "express"
import { PrismaClient } from "@prisma/client"

const router = Router()
const prisma = new PrismaClient()

// =====================================================
// METODE DASAR
// =====================================================

// Linear Regression (least squares):
//   harga ≈ intercept + slope * t
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

// Moving Average window N: rata-rata N nilai terakhir
function movingAverage(data: number[], window: number): number[] {
  const result: number[] = []
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - window + 1)
    const slice = data.slice(start, i + 1)
    result.push(slice.reduce((a, b) => a + b, 0) / slice.length)
  }
  return result
}

// Exponential Smoothing: S_t = alpha*P_t + (1-alpha)*S_(t-1)
function exponentialSmoothing(data: number[], alpha: number): number[] {
  const result: number[] = [data[0]]
  for (let i = 1; i < data.length; i++) {
    result.push(alpha * data[i] + (1 - alpha) * result[i - 1])
  }
  return result
}

// Prediksi produksi — berbasis Exponential Smoothing (alpha 0.3).
//
// Dipilih setelah uji out-of-sample rolling 2024 (scripts/uji-akurasi.mjs):
//   ES   → MAPE 0.95%  (terbaik)
//   MA7  → MAPE 1.15%
//   Blend (LR+last, metode lama) → MAPE 5.84%
//   LR   → MAPE 6.79%
// Jadi ES dipakai sebagai model produksi karena paling akurat.
//
// lastDate = tanggal data terakhir (default 2024-12-31 bila tidak diketahui).
function forecastRange(prices: number[], days: number, lastDate?: string): { tanggal: string; harga: number }[] {
  const baseDate = lastDate ? new Date(lastDate) : new Date("2024-12-31")
  const ALPHA = 0.3

  // Nilai ES terakhir = level terhalus dari seluruh seri.
  let level = prices[0]
  for (let i = 1; i < prices.length; i++) {
    level = ALPHA * prices[i] + (1 - ALPHA) * level
  }

  // Kecenderungan halus dari selisih ES vs rata-rata beberapa hari terakhir,
  // dibatasi supaya ramalan tidak melonjak liar.
  const nTail = Math.min(7, prices.length)
  const rataTail = prices.slice(-nTail).reduce((a, b) => a + b, 0) / nTail
  const trenMentah = rataTail !== 0 ? (level - rataTail) / rataTail : 0
  const tren = Math.max(-0.02, Math.min(0.02, trenMentah)) // batasi ±2% per hari

  const result: { tanggal: string; harga: number }[] = []
  for (let i = 1; i <= days; i++) {
    const date = new Date(baseDate)
    date.setDate(date.getDate() + i)
    // Proyeksi lembut dari level ES memakai tren terbatas.
    const predicted = Math.round(level * (1 + tren * i))
    result.push({
      tanggal: date.toISOString().split("T")[0],
      harga: Math.max(0, predicted),
    })
  }

  return result
}

// =====================================================
// BACKTEST (uji akurasi dengan data yang sudah terjadi)
// =====================================================
//
// Dua cara uji dipakai:
//
// 1. WALK-FORWARD 1-langkah (untuk 4 metode dasar):
//    untuk tiap hari uji t: latih model pada data [0..t-1],
//    prediksi harga hari t, bandingkan dengan harga AKTUAL hari t.
//    Cara ini meniru pemakaian nyata: model hanya boleh "melihat"
//    masa lalu, tidak boleh mengintip masa depan.
//
// 2. BLENDED 7-langkah (untuk metode produksi):
//    model dilatih pada data [0..N-8], lalu memprediksi 7 hari
//    sekaligus (persis seperti fitur Prediksi di web),
//    dibandingkan dengan 7 hari aktual terakhir.
//
// Metrik error:
//   MAPE = rata-rata( |pred - aktual| / aktual ) * 100  (% kesalahan)
//   RMSE = akar rata-rata( (pred - aktual)^2 )          (dalam rupiah)
//
// Akurasi = 100 - MAPE (pembulatan 1 desimal).

interface MetodeHasil {
  metode: string
  mape: number
  rmse: number
}

interface BacktestHasil {
  trainSize: number
  testSize: number
  hasil: MetodeHasil[]
  terbaik: string
  mapeTerbaik: number
  mapeBlend: number
  akurasiBlend: number
}

function mapeOf(xs: number[]) {
  return Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 100 * 100) / 100
}

function rmseOf(xs: number[]) {
  return Math.round(Math.sqrt(xs.reduce((a, b) => a + b, 0) / xs.length))
}

function backtest(prices: number[], testSize = 7): BacktestHasil | null {
  const n = prices.length
  if (n < testSize + 3) return null
  const trainSize = n - testSize

  const acc = {
    naive: { pct: [] as number[], sq: [] as number[] },
    lr: { pct: [] as number[], sq: [] as number[] },
    ma7: { pct: [] as number[], sq: [] as number[] },
    es: { pct: [] as number[], sq: [] as number[] },
  }

  for (let t = trainSize; t < n; t++) {
    const history = prices.slice(0, t)
    const actual = prices[t]

    const { slope, intercept } = linearRegression(history)

    const preds: Record<keyof typeof acc, number> = {
      naive: history[history.length - 1],
      lr: intercept + slope * history.length,
      ma7: history.slice(-7).reduce((a, b) => a + b, 0) / Math.min(7, history.length),
      es: exponentialSmoothing(history, 0.3)[history.length - 1],
    }

    for (const key of Object.keys(preds) as (keyof typeof acc)[]) {
      const e = preds[key] - actual
      acc[key].pct.push(Math.abs(e) / actual)
      acc[key].sq.push(e * e)
    }
  }

  // Model produksi (Exponential Smoothing): latih di train, forecast 7 hari, bandingkan.
  const prodPreds = forecastRange(prices.slice(0, trainSize), testSize)
  const prodPct: number[] = []
  const prodSq: number[] = []
  for (let i = 0; i < testSize; i++) {
    const actual = prices[trainSize + i]
    const e = prodPreds[i].harga - actual
    prodPct.push(Math.abs(e) / actual)
    prodSq.push(e * e)
  }

  const hasil: MetodeHasil[] = [
    { metode: "Naive (besok = hari ini)", mape: mapeOf(acc.naive.pct), rmse: rmseOf(acc.naive.sq) },
    { metode: "Linear Regression", mape: mapeOf(acc.lr.pct), rmse: rmseOf(acc.lr.sq) },
    { metode: "Moving Average (7 hari)", mape: mapeOf(acc.ma7.pct), rmse: rmseOf(acc.ma7.sq) },
    { metode: "Exponential Smoothing (α=0.3)", mape: mapeOf(acc.es.pct), rmse: rmseOf(acc.es.sq) },
    { metode: "Dipakai sistem (Exponential Smoothing)", mape: mapeOf(prodPct), rmse: rmseOf(prodSq) },
  ]

  const terbaik = hasil.reduce((a, b) => (b.mape < a.mape ? b : a))
  const mapeBlend = hasil.find(h => h.metode.startsWith("Dipakai sistem"))!.mape

  return {
    trainSize,
    testSize,
    hasil,
    terbaik: terbaik.metode,
    mapeTerbaik: terbaik.mape,
    mapeBlend,
    akurasiBlend: Math.max(0, Math.round((100 - mapeBlend) * 10) / 10),
  }
}

// =====================================================
// HELPER: harga rata-rata harian per komoditas
// =====================================================

async function getDailyAvg(komoditasId: number) {
  const harga = await prisma.detailSurvei.findMany({
    where: { komoditasId },
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
  return dailyAvg
}

// =====================================================
// ENDPOINTS
// =====================================================

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

    const dailyAvg = await getDailyAvg(komoditasId)

    if (dailyAvg.length < 3) {
      return res.status(400).json({ error: "Data tidak cukup untuk prediksi (minimal 3 hari)" })
    }

    const prices = dailyAvg.map(d => d.harga)

    const ma = movingAverage(prices, 7)
    const lastMA = ma[ma.length - 1]

    const es = exponentialSmoothing(prices, 0.3)
    const lastES = es[es.length - 1]

    const { slope, intercept } = linearRegression(prices)
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

    // Akurasi TERUKUR dari backtest (menggantikan confidence buatan)
    const bt = backtest(prices)
    const akurasi = bt ? bt.akurasiBlend : null

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
        trenPersen: trendPersen,
        movingAverage: lastMA,
        exponentialSmoothing: lastES,
        confidence: akurasi,
      },
      prediksi7Hari: prediksi,
      prediksiRingkasan: {
        prediksiHarga,
        confidenceInterval,
        prediksiRendah,
        prediksiTinggi,
        confidence: akurasi,
      },
      backtest: bt,
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

// Backtest detail: perbandingan prediksi vs aktual hari per hari
router.get("/backtest/:komoditasId", async (req, res) => {
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

    const dailyAvg = await getDailyAvg(komoditasId)
    const prices = dailyAvg.map(d => d.harga)

    const bt = backtest(prices)
    if (!bt) {
      return res.status(400).json({ error: "Data tidak cukup untuk backtest (minimal 10 hari)" })
    }

    const testSize = bt.testSize
    const trainSize = bt.trainSize

    // Rekonstruksi prediksi walk-forward per hari uji.
    // Model produksi (ES) dihitung sekali untuk horizon testSize, lalu
    // diambil nilai pada indeks hari uji.
    const produksiPreds = forecastRange(prices.slice(0, trainSize), testSize)
    const perbandinganHarian = dailyAvg.slice(trainSize).map((d, i) => {
      const t = trainSize + i
      const history = prices.slice(0, t)
      const actual = prices[t]
      const { slope, intercept } = linearRegression(history)

      return {
        tanggal: d.tanggal,
        aktual: actual,
        naive: history[history.length - 1],
        lr: Math.round(intercept + slope * history.length),
        ma7: Math.round(history.slice(-7).reduce((a, b) => a + b, 0) / Math.min(7, history.length)),
        es: Math.round(exponentialSmoothing(history, 0.3)[history.length - 1]),
        produksi: produksiPreds[i]?.harga ?? null,
      }
    })

    return res.json({
      komoditas: { id: komoditas.id, nama: komoditas.nama },
      trainSize,
      testSize,
      hasil: bt.hasil,
      terbaik: bt.terbaik,
      akurasiBlend: bt.akurasiBlend,
      perbandinganHarian,
    })
  } catch (error) {
    console.error("Error backtest:", error)
    return res.status(500).json({ error: "Gagal menjalankan backtest" })
  }
})

router.get("/all", async (_req, res) => {
  try {
    const komoditasList = await prisma.komoditas.findMany({
      orderBy: { nama: "asc" },
    })

    // OPTIMASI: satu query untuk semua komoditas (bukan 67 query berurutan).
    const semua = await prisma.detailSurvei.findMany({
      select: {
        komoditasId: true,
        harga: true,
        survei: { select: { tanggal: true } },
      },
    })

    // dailyAvg per komoditas: rata-rata harga tiap tanggal, lalu diurutkan
    const perKom = new Map<number, Map<string, number[]>>()
    for (const h of semua) {
      const t = h.survei.tanggal.toISOString().split("T")[0]
      if (!perKom.has(h.komoditasId)) perKom.set(h.komoditasId, new Map())
      const perTgl = perKom.get(h.komoditasId)!
      if (!perTgl.has(t)) perTgl.set(t, [])
      perTgl.get(t)!.push(h.harga)
    }

    interface PredictionResult {
      id: number
      nama: string
      kategori: string
      satuan: string
      hargaTerakhir: number
      tren: string
      trenPersen: number
      prediksiHarga: number
      perubahanPrediksi: number
    }

    const results: PredictionResult[] = []

    for (const k of komoditasList) {
      const perTgl = perKom.get(k.id)
      if (!perTgl) continue

      const dailyAvg = Array.from(perTgl.entries())
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .map(([tanggal, arr]) => ({
          tanggal,
          harga: Math.round(arr.reduce((a, b) => a + b, 0) / arr.length),
        }))

      const prices = dailyAvg.map(d => d.harga)
      if (prices.length < 3) continue

      const { slope } = linearRegression(prices)
      const trendDirection = slope > 50 ? "naik" : slope < -50 ? "turun" : "stabil"
      const trendPersen = prices.length > 0
        ? Math.round((slope / prices[prices.length - 1]) * 100 * 100) / 100
        : 0

      const prediksi = forecastRange(prices, 7, dailyAvg[dailyAvg.length - 1]?.tanggal)
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
        trenPersen: trendPersen,
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
