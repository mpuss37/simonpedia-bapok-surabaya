/**
 * Impor data harga 2023 dari raw_data/2023-keseluruhan KE DALAM database
 * yang sudah berisi data 2024 — TANPA menghapus data lama.
 *
 * Data 2023 ditandai lewat kolom `sumber` = "IMPORT-2023" agar bisa
 * dibedakan dari data 2024 ("IMPORT-2024") maupun BAPENAS/SP2KP.
 *
 * Cara pakai:
 *   DATABASE_URL="postgresql://..." node scripts/import-2023.mjs
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import XLSX from "xlsx"
import { PrismaClient } from "@prisma/client"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..")
const DATA_DIR = path.join(ROOT, "raw_data/2023-keseluruhan")
const SUMBER = "IMPORT-2023"

const BULAN = {
  JANUARI: 1, FEBRUARI: 2, MARET: 3, APRIL: 4, MEI: 5, JUNI: 6,
  JULI: 7, AGUSTUS: 8, SEPTEMBER: 9, OKTOBER: 10, NOVEMBER: 11, DESEMBER: 12,
}

const pasarCoords = {
  "Pasar Balongsari": { lat: -7.273, lng: 112.676, kecamatan: "Tandes" },
  "Pasar Genteng Baru": { lat: -7.256, lng: 112.739, kecamatan: "Genteng" },
  "Pasar Kembang": { lat: -7.263, lng: 112.737, kecamatan: "Tegalsari" },
  "Pasar Pabean": { lat: -7.235, lng: 112.723, kecamatan: "Krembangan" },
  "Pasar Pucang Anom": { lat: -7.278, lng: 112.756, kecamatan: "Gubeng" },
  "Pasar Tambahrejo": { lat: -7.273, lng: 112.752, kecamatan: "Gubeng" },
  "Pasar Wonokromo": { lat: -7.302, lng: 112.729, kecamatan: "Wonokromo" },
}

function normalizeKategori(raw) {
  const mapping = {
    "C A B E": "CABAI", "I K A N": "IKAN", "S U S U": "SUSU",
    "KACANG-KACANGAN": "KACANG-KACANGAN", "BAHAN BAKAR GAS LPG": "BAHAN BAKAR GAS LPG",
    "SAYUR-SAYURAN": "SAYUR-SAYURAN", "UBI-UBIAN": "UBI-UBIAN",
  }
  return mapping[raw]?.trim() || raw.trim()
}

function parseFileName(fileName) {
  const m = fileName.match(/(\d{2})\.\s*REKAP\s+\w+\s+(\d{4})/i)
  const namaBulan = fileName.match(/(JANUARI|FEBRUARI|MARET|APRIL|MEI|JUNI|JULI|AGUSTUS|SEPTEMBER|OKTOBER|NOVEMBER|DESEMBER)/i)?.[1]?.toUpperCase()
  const bulan = namaBulan ? BULAN[namaBulan] : null
  if (!m || !bulan) return null
  return { bulan, tahun: parseInt(m[2]) }
}

function toSafeDate(tahun, bulan, hari) {
  if (!tahun || !bulan || !hari) return null
  const d = new Date(Date.UTC(tahun, bulan - 1, hari))
  if (d.getUTCFullYear() !== tahun || d.getUTCMonth() !== bulan - 1) return null
  return d.toISOString().split("T")[0]
}

function parseHarga(v) {
  if (typeof v === "number" && isFinite(v) && v > 0) return Math.round(v)
  if (typeof v === "string") {
    const n = parseFloat(v.replace(/[^\d.]/g, ""))
    if (isFinite(n) && n > 0) return Math.round(n)
  }
  return null
}

function parseFile(filePath, fileName, tahun) {
  const meta = parseFileName(fileName)
  if (!meta || meta.tahun !== tahun) return []
  const wb = XLSX.readFile(filePath)
  const rows = []
  for (const sheetName of wb.SheetNames) {
    if (["REKAPITULASI", "GRAFIK"].includes(sheetName.toUpperCase())) continue
    const hari = parseInt(sheetName)
    if (isNaN(hari) || hari < 1 || hari > 31) continue
    const tanggal = toSafeDate(meta.tahun, meta.bulan, hari)
    if (!tanggal) continue

    const grid = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, raw: true, defval: null })
    let headerIdx = -1
    let pasarCols = new Map()
    for (let i = 0; i < grid.length && i < 15; i++) {
      const r = grid[i]
      if (!r) continue
      const cols = new Map()
      let found = false
      for (let c = 0; c < r.length; c++) {
        const v = r[c]
        if (typeof v === "string" && v.trim().startsWith("Pasar")) { cols.set(c, v.trim()); found = true }
      }
      if (found && cols.size >= 5) { headerIdx = i; pasarCols = cols; break }
    }
    if (headerIdx < 0) continue

    let kategori = ""
    for (let i = headerIdx + 1; i < grid.length; i++) {
      const r = grid[i]
      if (!r) continue
      const colB = typeof r[1] === "string" ? r[1].trim() : ""
      const colA = r[0]
      if (colB && !colB.startsWith("-") && typeof colA === "number") {
        kategori = normalizeKategori(colB)
        continue
      }
      if (colB.startsWith("-")) {
        const komoditas = colB.replace(/^-\s*/, "").trim()
        const satuan = typeof r[2] === "string" ? r[2].trim() : String(r[2] ?? "")
        for (const [colIdx, pasar] of pasarCols) {
          const harga = parseHarga(r[colIdx])
          if (harga !== null) rows.push({ tanggal, kategori, komoditas, satuan, pasar, harga })
        }
      }
    }
  }
  return rows
}

let prisma = new PrismaClient()

/** Sambungkan ulang Prisma (pooler Neon bisa memutus koneksi idle). */
async function reconnect() {
  try { await prisma.$disconnect() } catch { /* abaikan */ }
  prisma = new PrismaClient()
  await prisma.$connect()
}

// Retry + reconnect untuk koneksi Neon yang bisa terputus (cold start/pooler).
async function denganRetry(fn, label, percobaan = 6) {
  for (let i = 1; i <= percobaan; i++) {
    try {
      return await fn()
    } catch (err) {
      if (i === percobaan) throw err
      console.log(`  [${label}] koneksi terputus, menyambung ulang (${i}/${percobaan})...`)
      await new Promise((r) => setTimeout(r, 1500 * i))
      await reconnect()
    }
  }
}

async function main() {
  const TAHUN = 2023
  if (!fs.existsSync(DATA_DIR)) {
    console.error("Folder tidak ada:", DATA_DIR)
    process.exit(1)
  }
  const files = fs.readdirSync(DATA_DIR).filter((f) => f.toLowerCase().endsWith(".xlsx")).sort()
  console.log(`Ditemukan ${files.length} file 2023\n`)

  const allRows = []
  for (const f of files) {
    const rows = parseFile(path.join(DATA_DIR, f), f, TAHUN)
    allRows.push(...rows)
    console.log(`  ${f}: ${rows.length.toLocaleString("id-ID")} baris`)
  }
  console.log(`\nTotal baris 2023: ${allRows.length.toLocaleString("id-ID")}`)
  if (allRows.length === 0) {
    console.log("Tidak ada data. Keluar.")
    return
  }

  const LANJUT = process.argv.includes("--lanjut")

  // Mode "--lanjut": jangan hapus apa pun, hanya tambah yang belum ada.
  // Mode default: bersihkan data 2023 dulu (idempotent, aman diulang).
  if (!LANJUT) {
    console.log("Membersihkan data 2023 lama (bila ada)...")
    const survei2023 = await denganRetry(
      () => prisma.survei.findMany({
        where: { tanggal: { gte: new Date("2023-01-01"), lt: new Date("2024-01-01") } },
        select: { id: true },
      }),
      "cari survei 2023 lama",
    )
    if (survei2023.length > 0) {
      const ids = survei2023.map((s) => s.id)
      for (let i = 0; i < ids.length; i += 2000) {
        const chunk = ids.slice(i, i + 2000)
        await denganRetry(() => prisma.detailSurvei.deleteMany({ where: { surveiId: { in: chunk } } }), "hapus detail 2023")
        await denganRetry(() => prisma.survei.deleteMany({ where: { id: { in: chunk } } }), "hapus survei 2023")
      }
      console.log(`  ${survei2023.length} survei 2023 lama dibersihkan`)
    }
  } else {
    console.log("Mode --lanjut: tidak menghapus data lama.")
  }

  // Wilayah & Pasar — pakai yang sudah ada bila ada.
  let wilayah = await denganRetry(() => prisma.wilayah.findFirst(), "wilayah")
  if (!wilayah) wilayah = await prisma.wilayah.create({ data: { nama: "Surabaya", kode: "SUB" } })

  const namaPasar = Array.from(new Set(allRows.map((r) => r.pasar))).sort()
  for (const nama of namaPasar) {
    const ada = await denganRetry(() => prisma.pasar.findFirst({ where: { nama } }), "pasar")
    if (!ada) {
      const c = pasarCoords[nama] ?? { lat: null, lng: null, kecamatan: "Surabaya" }
      await prisma.pasar.create({
        data: { nama, kecamatan: c.kecamatan, kelas: "Utama", lat: c.lat, lng: c.lng, wilayahId: wilayah.id },
      })
    }
  }
  const pasarRows = await denganRetry(() => prisma.pasar.findMany(), "pasar list")
  const pasarMap = new Map(pasarRows.map((p) => [p.nama, p.id]))

  // Komoditas — pakai yang ada, buat baru bila belum.
  const namaKom = Array.from(new Set(allRows.map((r) => r.komoditas)))
  const infoKom = new Map()
  for (const r of allRows) if (!infoKom.has(r.komoditas)) infoKom.set(r.komoditas, { kategori: r.kategori, satuan: r.satuan })
  let nKomBaru = 0
  for (const nama of namaKom) {
    const ada = await denganRetry(() => prisma.komoditas.findFirst({ where: { nama } }), "komoditas")
    if (!ada) { await prisma.komoditas.create({ data: { nama, ...infoKom.get(nama) } }); nKomBaru++ }
  }
  console.log(`\n  Komoditas baru dibuat: ${nKomBaru}`)
  const komRows = await denganRetry(() => prisma.komoditas.findMany(), "komoditas list")
  const komMap = new Map(komRows.map((k) => [k.nama, k.id]))

  // Survei — buat secara BATCH (cepat), lalu ambil peta id sekaligus.
  const daftarSurvei = Array.from(new Map(
    allRows.map((r) => [`${r.tanggal}|${r.pasar}`, { tanggal: r.tanggal, pasar: r.pasar }]),
  ).values())
  console.log(`\nMembuat ${daftarSurvei.length.toLocaleString("id-ID")} survei 2023 (batch)...`)

  const surveiRows = daftarSurvei
    .map((s) => ({ tanggal: new Date(s.tanggal), pasarId: pasarMap.get(s.pasar), kunci: `${s.tanggal}|${s.pasar}` }))
    .filter((s) => s.pasarId != null)

  const BATCH_SURVEI = 2000
  for (let i = 0; i < surveiRows.length; i += BATCH_SURVEI) {
    const chunk = surveiRows.slice(i, i + BATCH_SURVEI).map((s) => ({ tanggal: s.tanggal, pasarId: s.pasarId, sumber: SUMBER }))
    await denganRetry(() => prisma.survei.createMany({ data: chunk, skipDuplicates: true }), `survei batch ${i}`)
    process.stdout.write(`\r  ${Math.min(i + BATCH_SURVEI, surveiRows.length).toLocaleString("id-ID")} survei terkirim`)
  }
  process.stdout.write("\n")

  // Ambil id survei 2023 dari DB, petakan kembali.
  const surveiTersimpan = await denganRetry(
    () => prisma.survei.findMany({
      where: { tanggal: { gte: new Date("2023-01-01"), lt: new Date("2024-01-01") } },
      select: { id: true, tanggal: true, pasarId: true },
    }),
    "ambil survei 2023",
  )
  const surveiMap = new Map()
  const idPasar = new Map(pasarRows.map((p) => [p.id, p.nama]))
  for (const s of surveiTersimpan) {
    const namaPasar = idPasar.get(s.pasarId)
    if (namaPasar) surveiMap.set(`${s.tanggal.toISOString().split("T")[0]}|${namaPasar}`, s.id)
  }
  console.log(`  ${surveiMap.size.toLocaleString("id-ID")} survei terpetakan`)

  // DetailSurvei — batch.
  const details = []
  for (const r of allRows) {
    const surveiId = surveiMap.get(`${r.tanggal}|${r.pasar}`)
    const komoditasId = komMap.get(r.komoditas)
    if (surveiId == null || komoditasId == null) continue
    details.push({ surveiId, komoditasId, harga: r.harga })
  }

  // Mode --lanjut: lewati detail yang survei-nya sudah punya data.
  let finalDetails = details
  if (LANJUT) {
    const surveiSudah = new Set(
      (await denganRetry(
        () => prisma.detailSurvei.findMany({
          where: { survei: { tanggal: { gte: new Date("2023-01-01"), lt: new Date("2024-01-01") } } },
          select: { surveiId: true },
          distinct: ["surveiId"],
        }),
        "cek survei terisi",
      )).map((d) => d.surveiId),
    )
    finalDetails = details.filter((d) => !surveiSudah.has(d.surveiId))
    console.log(`Mode --lanjut: ${surveiSudah.size} survei sudah terisi, melewati ${(details.length - finalDetails.length).toLocaleString("id-ID")} detail.`)
  }

  console.log(`Menyimpan ${finalDetails.length.toLocaleString("id-ID")} detail...`)

  const BATCH = 2000
  let terkirim = 0
  for (let i = 0; i < finalDetails.length; i += BATCH) {
    const chunk = finalDetails.slice(i, i + BATCH)
    await denganRetry(() => prisma.detailSurvei.createMany({ data: chunk, skipDuplicates: true }), `detail ${i}`)
    terkirim += chunk.length
    console.log(`  ${terkirim.toLocaleString("id-ID")} / ${finalDetails.length.toLocaleString("id-ID")} tersimpan`)
    await new Promise((r) => setTimeout(r, 200))
  }

  const minT = await prisma.survei.aggregate({ _min: { tanggal: true } })
  const maxT = await prisma.survei.aggregate({ _max: { tanggal: true } })

  // Catat ke tabel RiwayatInput agar tampil di halaman admin.
  await denganRetry(
    () => prisma.riwayatInput.create({
      data: {
        namaFile: "rekap_2023-keseluruhan.xlsx",
        jenis: "xlsx",
        jumlahBaris: finalDetails.length,
        berhasil: terkirim,
        gagal: finalDetails.length - terkirim,
        status: "berhasil",
        catatan: `Impor data harga 2023 (sumber: script import-2023)`,
      },
    }),
    "catat riwayat",
  )
  console.log("Riwayat input dicatat.")

  console.log("\n=== SELESAI ===")
  console.log("Total survei :", await prisma.survei.count())
  console.log("Total detail :", (await prisma.detailSurvei.count()).toLocaleString("id-ID"))
  console.log("Rentang      :", minT._min.tanggal?.toISOString().split("T")[0], "s/d", maxT._max.tanggal?.toISOString().split("T")[0])
}

main()
  .catch((e) => { console.error("\nGagal:", e); process.exit(1) })
  .finally(() => prisma.$disconnect())
