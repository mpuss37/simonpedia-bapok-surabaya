/**
 * Uji akurasi forecast (validasi out-of-sample).
 *
 * Skema:
 *   Latih  : data 2023 (dan sebelumnya dalam periode uji)
 *   Uji    : sepanjang 2024, secara ROLLING (walk-forward)
 *            untuk tiap hari uji t: latih model dengan data [0..t-1],
 *            prediksi harga hari t, bandingkan dengan AKTUAL hari t.
 *
 * Model yang diuji (SAMA dengan yang dipakai sistem di server/src/routes/prediction.ts):
 *   - Linear Regression (LR)
 *   - Moving Average window 7 (MA7)
 *   - Exponential Smoothing α=0.3 (ES)
 *   - Blend (dipakai sistem): pred_i = trendLR_i*(1-w) + lastPrice*w
 *
 * Output: ringkasan MAPE/MAE/RMSE per komoditas + rata-rata → console + CSV.
 *
 * Cara pakai:
 *   DATABASE_URL="postgresql://..." node scripts/uji-akurasi.mjs
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { PrismaClient } from "@prisma/client"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..")

let prisma = new PrismaClient()
async function reconnect() {
  try { await prisma.$disconnect() } catch { /* abaikan */ }
  prisma = new PrismaClient()
  await prisma.$connect()
}
async function denganRetry(fn, label, percobaan = 6) {
  for (let i = 1; i <= percobaan; i++) {
    try { return await fn() } catch (err) {
      if (i === percobaan) throw err
      console.log(`  [${label}] koneksi terputus, menyambung ulang (${i}/${percobaan})...`)
      await new Promise((r) => setTimeout(r, 1500 * i))
      await reconnect()
    }
  }
}

// =====================================================
// MODEL (disalin dari prediction.ts agar identik)
// =====================================================

function linearRegression(data) {
  const n = data.length
  if (n === 0) return { slope: 0, intercept: 0 }
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0
  for (let i = 0; i < n; i++) { sumX += i; sumY += data[i]; sumXY += i * data[i]; sumXX += i * i }
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n
  return { slope, intercept }
}

function movingAverageLast(data, window) {
  const slice = data.slice(-window)
  return slice.reduce((a, b) => a + b, 0) / slice.length
}

function exponentialSmoothingLast(data, alpha) {
  let s = data[0]
  for (let i = 1; i < data.length; i++) s = alpha * data[i] + (1 - alpha) * s
  return s
}

// Model produksi = Exponential Smoothing (alpha 0.3), sama seperti
// forecastRange di server/src/routes/prediction.ts setelah perbaikan.
function produksiPrediksi(history) {
  const ALPHA = 0.3
  let level = history[0]
  for (let i = 1; i < history.length; i++) level = ALPHA * history[i] + (1 - ALPHA) * level
  const nTail = Math.min(7, history.length)
  const rataTail = history.slice(-nTail).reduce((a, b) => a + b, 0) / nTail
  const trenMentah = rataTail !== 0 ? (level - rataTail) / rataTail : 0
  const tren = Math.max(-0.02, Math.min(0.02, trenMentah))
  // Prediksi 1 langkah (i=1).
  return Math.round(level * (1 + tren * 1))
}

// =====================================================
// METRIK
// =====================================================

function mape(pairs) {
  const xs = pairs.map(([a, p]) => Math.abs(p - a) / a)
  return (xs.reduce((s, x) => s + x, 0) / xs.length) * 100
}
function mae(pairs) {
  const xs = pairs.map(([a, p]) => Math.abs(p - a))
  return xs.reduce((s, x) => s + x, 0) / xs.length
}
function rmse(pairs) {
  const xs = pairs.map(([a, p]) => (p - a) ** 2)
  return Math.sqrt(xs.reduce((s, x) => s + x, 0) / xs.length)
}

// =====================================================
// MAIN
// =====================================================

async function main() {
  console.log("=== UJI AKURASI FORECAST (rolling 2024) ===\n")

  // Ambil seluruh detail (komoditasId, harga, tanggal).
  const semua = await denganRetry(
    () => prisma.detailSurvei.findMany({
      select: { komoditasId: true, harga: true, survei: { select: { tanggal: true } } },
    }),
    "ambil data",
  )
  console.log(`Total baris: ${semua.length.toLocaleString("id-ID")}`)

  // Kelompokkan jadi rata-rata harian per komoditas.
  const perKom = new Map() // komoditasId -> Map<tanggal, number[]>
  for (const h of semua) {
    const t = h.survei.tanggal.toISOString().split("T")[0]
    if (!perKom.has(h.komoditasId)) perKom.set(h.komoditasId, new Map())
    const m = perKom.get(h.komoditasId)
    if (!m.has(t)) m.set(t, [])
    m.get(t).push(h.harga)
  }

  const komRows = await denganRetry(() => prisma.komoditas.findMany(), "komoditas")
  const namaKom = new Map(komRows.map((k) => [k.id, k.nama]))

  // Hari uji: 2024.
  const AWAL_UJI = "2024-01-01"
  const AKHIR_UJI = "2024-12-31"

  const hasilKomoditas = []

  for (const [komoditasId, perTgl] of perKom) {
    const seri = Array.from(perTgl.entries())
      .map(([tanggal, arr]) => ({ tanggal, harga: Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) }))
      .sort((a, b) => (a.tanggal < b.tanggal ? -1 : 1))

    if (seri.length < 10) continue

    const accLR = [], accMA = [], accES = [], accBlend = []

    for (let t = 0; t < seri.length; t++) {
      const hariIni = seri[t]
      if (hariIni.tanggal < AWAL_UJI || hariIni.tanggal > AKHIR_UJI) continue
      const history = seri.slice(0, t).map((d) => d.harga)
      if (history.length < 7) continue

      const aktual = hariIni.harga
      if (aktual <= 0) continue

      const { slope, intercept } = linearRegression(history)
      const lr = intercept + slope * history.length
      const ma = movingAverageLast(history, 7)
      const es = exponentialSmoothingLast(history, 0.3)
      const produksi = produksiPrediksi(history)

      accLR.push([aktual, Math.round(lr)])
      accMA.push([aktual, Math.round(ma)])
      accES.push([aktual, Math.round(es)])
      accBlend.push([aktual, Math.round(produksi)])
    }

    if (accBlend.length === 0) continue

    hasilKomoditas.push({
      komoditas: namaKom.get(komoditasId) ?? String(komoditasId),
      n: accBlend.length,
      mapeLR: mape(accLR), mapeMA: mape(accMA), mapeES: mape(accES), mapeBlend: mape(accBlend),
      maeBlend: mae(accBlend), rmseBlend: rmse(accBlend),
    })
  }

  // Urutkan: paling akurat (MAPE kecil) di atas.
  hasilKomoditas.sort((a, b) => a.mapeBlend - b.mapeBlend)

  // Ringkasan rata-rata.
  const rerata = (key) => hasilKomoditas.reduce((s, r) => s + r[key], 0) / hasilKomoditas.length
  console.log(`\nKomoditas diuji: ${hasilKomoditas.length}`)
  console.log("\n=== RATA-RATA MAPE PER MODEL ===")
  console.log(`  Linear Regression : ${rerata("mapeLR").toFixed(2)}%`)
  console.log(`  Moving Average 7  : ${rerata("mapeMA").toFixed(2)}%`)
  console.log(`  Exponential Smooth: ${rerata("mapeES").toFixed(2)}%`)
  console.log(`  Produksi (Exp. Smoothing)   : ${rerata("mapeBlend").toFixed(2)}%`)
  console.log(`\nProduksi → MAPE ${rerata("mapeBlend").toFixed(2)}% | MAE ${rerata("maeBlend").toFixed(0)} | RMSE ${rerata("rmseBlend").toFixed(0)}`)
  console.log(`Akurasi (100-MAPE): ${(100 - rerata("mapeBlend")).toFixed(2)}%`)

  console.log("\n=== 10 KOMODITAS PALING AKURAT ===")
  hasilKomoditas.slice(0, 10).forEach((r, i) =>
    console.log(`  ${i + 1}. ${r.komoditas} — MAPE ${r.mapeBlend.toFixed(2)}% (n=${r.n})`))

  console.log("\n=== 10 KOMODITAS PALING TIDAK AKURAT ===")
  hasilKomoditas.slice(-10).forEach((r, i) =>
    console.log(`  ${i + 1}. ${r.komoditas} — MAPE ${r.mapeBlend.toFixed(2)}% (n=${r.n})`))

  // Tulis CSV.
  const outPath = path.join(ROOT, "docs/uji-akurasi-bapok.csv")
  const header = "komoditas,n_hari,mape_lr,mape_ma7,mape_es,mape_blend,mae_blend,rmse_blend"
  const barisCsv = hasilKomoditas.map((r) =>
    [r.komoditas, r.n, r.mapeLR.toFixed(2), r.mapeMA.toFixed(2), r.mapeES.toFixed(2), r.mapeBlend.toFixed(2), r.maeBlend.toFixed(0), r.rmseBlend.toFixed(0)]
      .map((v) => {
        const s = String(v)
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
      }).join(",")).join("\n")
  fs.writeFileSync(outPath, `${header}\n${barisCsv}\n`, "utf8")
  console.log(`\nLaporan CSV: ${outPath}`)
}

main()
  .catch((e) => { console.error("\nGagal:", e); process.exit(1) })
  .finally(() => prisma.$disconnect())
