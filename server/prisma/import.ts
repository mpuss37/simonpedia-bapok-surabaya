import { PrismaClient } from "@prisma/client"
import * as fs from "fs"
import * as path from "path"
import * as XLSX from "xlsx"

const prisma = new PrismaClient()

// =====================================================
// NORMALISASI KATEGORI
// =====================================================

function normalizeKategori(raw: string): string {
  const mapping: Record<string, string> = {
    "C A B E": "CABAI",
    "I K A N": "IKAN",
    "S U S U": "SUSU",
    "KACANG-KACANGAN": "KACANG-KACANGAN",
    "BAHAN BAKAR GAS LPG": "BAHAN BAKAR GAS LPG",
    "SAYUR-SAYURAN": "SAYUR-SAYURAN",
    "UBI-UBIAN": "UBI-UBIAN",
  }
  return mapping[raw]?.trim() || raw.trim()
}

// =====================================================
// KOORDINAT PASAR RIIL + DEFAULT kala nama pasar beda
// =====================================================

const pasarCoords: Record<string, { lat: number; lng: number; kecamatan: string }> = {
  "Pasar Balongsari": { lat: -7.273, lng: 112.676, kecamatan: "Tandes" },
  "Pasar Genteng Baru": { lat: -7.256, lng: 112.739, kecamatan: "Genteng" },
  "Pasar Kembang": { lat: -7.263, lng: 112.737, kecamatan: "Tegalsari" },
  "Pasar Pabean": { lat: -7.235, lng: 112.723, kecamatan: "Krembangan" },
  "Pasar Pucang Anom": { lat: -7.278, lng: 112.756, kecamatan: "Gubeng" },
  "Pasar Tambahrejo": { lat: -7.273, lng: 112.752, kecamatan: "Gubeng" },
  "Pasar Wonokromo": { lat: -7.302, lng: 112.729, kecamatan: "Wonokromo" },
}

// =====================================================
// PARSER SATU FILE XLSX → MASTER ROWS
// =====================================================
//
// Struktur tiap sheet harian (01..31 / 1..29):
//   baris 0-2: judul + baris "Hari / Tanggal : ..."
//   baris 3 : header kolom: "NAMA BAHAN POKOK", "SATUAN",
//              lalu 7 kolom "Pasar X", lalu "Rata-Rata"
//   baris berikutnya: baris kategori (contoh: [1,"BERAS",..]) atau
//              baris komoditas (contoh: [null,"- Beras Premium","Kg",
//              14000,14000,...])
//
// Bulan & tahun ditentukan dari NAMA FILE (bukan teks tanggal, karena
// teks tanggal bisa typo: sheet "01" Januari 2024 tertulis "2023").
// Tanggal = bulan/tahun file + nomor sheet (= hari).

interface MasterRow {
  tanggal: string // YYYY-MM-DD
  kategori: string
  komoditas: string
  satuan: string
  pasar: string
  harga: number
}

const BULAN: Record<string, number> = {
  JANUARI: 1, FEBRUARI: 2, MARET: 3, APRIL: 4, MEI: 5, JUNI: 6,
  JULI: 7, AGUSTUS: 8, SEPTEMBER: 9, OKTOBER: 10, NOVEMBER: 11, DESEMBER: 12,
}

function parseFileName(fileName: string): { bulan: number; tahun: number } | null {
  const m = fileName.match(/(\d{2})\.\s*REKAP\s+\w+\s+(\d{4})/i)
  if (!m) return null
  const bulan = BULAN[fileName.match(/(JANUARI|FEBRUARI|MARET|APRIL|MEI|JUNI|JULI|AGUSTUS|SEPTEMBER|OKTOBER|NOVEMBER|DESEMBER)/i)?.[1]?.toUpperCase() ?? ""]
  if (!bulan) return null
  return { bulan, tahun: parseInt(m[2]) }
}

function toSafeDate(tahun: number, bulan: number, hari: number): string | null {
  if (!tahun || !bulan || !hari) return null
  if (hari < 1 || hari > 31) return null
  const d = new Date(Date.UTC(tahun, bulan - 1, hari))
  if (d.getUTCFullYear() !== tahun || d.getUTCMonth() !== bulan - 1) return null
  return d.toISOString().split("T")[0]
}

function parseHarga(v: unknown): number | null {
  if (typeof v === "number" && isFinite(v) && v > 0) return v
  if (typeof v === "string") {
    const n = parseFloat(v.replace(/[^\d.]/g, ""))
    if (isFinite(n) && n > 0) return n
  }
  return null
}

function parseFile(filePath: string, fileName: string): MasterRow[] {
  const meta = parseFileName(fileName)
  if (!meta) {
    console.warn(`  SKIP file (nama tidak dikenali): ${fileName}`)
    return []
  }

  const wb = XLSX.readFile(filePath)
  const rows: MasterRow[] = []
  let sheetHari = 0

  for (const sheetName of wb.SheetNames) {
    // Lewati sheet non-harian
    if (sheetName.toUpperCase() === "REKAPITULASI" || sheetName.toUpperCase() === "GRAFIK") continue
    const hari = parseInt(sheetName)
    if (isNaN(hari) || hari < 1 || hari > 31) {
      console.warn(`  SKIP sheet (bukan hari): file=${fileName} sheet=${sheetName}`)
      continue
    }

    const tanggal = toSafeDate(meta.tahun, meta.bulan, hari)
    if (!tanggal) {
      console.warn(`  SKIP sheet (tanggal tidak valid): file=${fileName} sheet=${sheetName} (${meta.tahun}-${meta.bulan}-${hari})`)
      continue
    }

    const ws = wb.Sheets[sheetName]
    const grid = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, raw: true, defval: null })

    // Cari baris header pasar: berisi kolom "Pasar Tambahrejo" / "Pasar ..."
    let headerIdx = -1
    let pasarCols = new Map<number, string>() // colIndex -> nama pasar
    for (let i = 0; i < grid.length && i < 15; i++) {
      const r = grid[i]
      if (!r) continue
      let found = false
      const cols = new Map<number, string>()
      for (let c = 0; c < r.length; c++) {
        const v = r[c]
        if (typeof v === "string" && v.trim().startsWith("Pasar")) {
          cols.set(c, v.trim())
          found = true
        }
      }
      if (found && cols.size >= 5) {
        headerIdx = i
        pasarCols = cols
        break
      }
    }

    if (headerIdx < 0) {
      console.warn(`  SKIP sheet (header pasar tidak ditemukan): ${fileName} sheet=${sheetName}`)
      continue
    }

    let kategori = ""
    sheetHari++

    // Baca baris data mulai header+1
    for (let i = headerIdx + 1; i < grid.length; i++) {
      const r = grid[i]
      if (!r) continue

      const colB = typeof r[1] === "string" ? r[1].trim() : ""
      const colA = r[0]

      // Baris kategori: kolom A angka + kolom B nama kategori (mis "BERAS")
      if (colB && !colB.startsWith("-") && typeof colA === "number") {
        kategori = normalizeKategori(colB)
        continue
      }

      // Baris komoditas: kolom B berawalan "-" dan ada SATUAN (col C)
      if (colB.startsWith("-")) {
        const komoditas = colB.replace(/^-\s*/, "").trim()
        const satuan = typeof r[2] === "string" ? r[2].trim() : String(r[2] ?? "")
        // kumpulkan harga dari kolom pasar
        for (const [colIdx, pasar] of pasarCols) {
          const harga = parseHarga(r[colIdx])
          if (harga !== null) {
            rows.push({ tanggal, kategori, komoditas, satuan, pasar, harga })
          }
        }
      }
    }
  }

  console.log(`  ${fileName}: ${sheetHari} sheet harian → ${rows.length} baris harga`)
  return rows
}

// =====================================================
// MAIN
// =====================================================

async function main() {
  const dataDir = path.resolve(__dirname, "../../data/archive/2024-keseluruhan/2024")
  if (!fs.existsSync(dataDir)) {
    console.error("Folder tidak ada:", dataDir)
    process.exit(1)
  }

  const xlsxFiles = fs
    .readdirSync(dataDir)
    .filter((f) => f.toLowerCase().endsWith(".xlsx"))
    .sort()

  if (xlsxFiles.length === 0) {
    console.error("Tidak ada file xlsx di:", dataDir)
    process.exit(1)
  }

  console.log(`Ditemukan ${xlsxFiles.length} file xlsx\n`)
  const allRows: MasterRow[] = []
  for (const f of xlsxFiles) {
    const fileRows = parseFile(path.join(dataDir, f), f)
    allRows.push(...fileRows)
  }

  console.log(`\nTotal baris harga ter-parse: ${allRows.length.toLocaleString("id-ID")}`)

  // =====================================================
  // STEP 1: Hapus semua data lama (reset total)
  // =====================================================
  console.log("\nStep 1: Reset database...")
  await prisma.detailSurvei.deleteMany()
  await prisma.survei.deleteMany()
  await prisma.komoditas.deleteMany()
  await prisma.pasar.deleteMany()
  await prisma.wilayah.deleteMany()
  console.log("  Done.")

  // =====================================================
  // STEP 2: Wilayah
  // =====================================================
  console.log("\nStep 2: Membuat Wilayah...")
  const surabaya = await prisma.wilayah.create({ data: { nama: "Surabaya", kode: "SUB" } })
  console.log(`  ${surabaya.nama} (id ${surabaya.id})`)

  // =====================================================
  // STEP 3: Pasar — dari semua nama pasar yang muncul di data
  // =====================================================
  console.log("\nStep 3: Membuat Pasar...")
  const ditemukanPasar = Array.from(new Set(allRows.map((r) => r.pasar))).sort()

  // normalisasi: cari nama pasar yang cocok dgn koordinat, lainnya default
  const sql = []
  for (const nama of ditemukanPasar) {
    const coords = pasarCoords[nama] ?? { lat: null, lng: null, kecamatan: "Surabaya" }
    sql.push({ nama, kecamatan: coords.kecamatan, kelas: "Utama", lat: coords.lat as number | null, lng: coords.lng as number | null, wilayahId: surabaya.id })
  }

  await prisma.pasar.createMany({ data: sql })
  const pasarRows = await prisma.pasar.findMany()
  const pasarMap = new Map<string, number>()
  for (const p of pasarRows) pasarMap.set(p.nama, p.id)
  console.log(`  ${pasarRows.length} pasar:`)
  for (const p of pasarRows) console.log(`    - ${p.nama} (${p.kecamatan})`)

  // =====================================================
  // STEP 4: Komoditas — unik, dengan kategori & satuan dari data
  // =====================================================
  console.log("\nStep 4: Membuat Komoditas...")
  const komMap = new Map<string, { kategori: string; satuan: string }>()
  for (const r of allRows) {
    const cur = komMap.get(r.komoditas)
    if (!cur) komMap.set(r.komoditas, { kategori: r.kategori, satuan: r.satuan })
  }
  const listKom = Array.from(komMap.entries())
  await prisma.komoditas.createMany({
    data: listKom.map(([nama, info]) => ({ nama, kategori: info.kategori, satuan: info.satuan })),
  })
  const komRows = await prisma.komoditas.findMany()
  const komoditasMap = new Map<string, number>()
  for (const k of komRows) komoditasMap.set(k.nama, k.id)
  console.log(`  ${komRows.length} komoditas`)

  // =====================================================
  // STEP 5: Survei + DetailSurvei (batch)
  // =====================================================
  console.log("\nStep 5: Import data survei...")

  // Data unik: (tanggal, pasar)
  const daftarSurvei = Array.from(new Map(
    allRows.map((r) => [`${r.tanggal}|${r.pasar}`, { tanggal: r.tanggal, pasar: r.pasar }])
  ).values())
  console.log(`  ${daftarSurvei.length} survei (tanggal×pasar)`)

  // buat survei dalam batch
  const BATCH = 2000
  const surveiMap = new Map<string, number>()
  for (let i = 0; i < daftarSurvei.length; i += BATCH) {
    const chunk = daftarSurvei.slice(i, i + BATCH)
    await prisma.survei.createMany({
      data: chunk.map((s) => ({ tanggal: new Date(s.tanggal), pasarId: pasarMap.get(s.pasar)!, sumber: "BAPENAS/SP2KP" })),
    })
  }
  const surveiRows = await prisma.survei.findMany()
  const pasarIdToNama = new Map(pasarRows.map((p) => [p.id, p.nama]))
  for (const s of surveiRows) {
    const key = `${s.tanggal.toISOString().split("T")[0]}|${pasarIdToNama.get(s.pasarId)}`
    surveiMap.set(key, s.id)
  }

  // bangun daftar DetailSurvei
  const details = allRows
    .map((r) => {
      const surveiId = surveiMap.get(`${r.tanggal}|${r.pasar}`)
      const komoditasId = komoditasMap.get(r.komoditas)
      if (surveiId == null || komoditasId == null) return null
      return { surveiId, komoditasId, harga: r.harga }
    })
    .filter((x): x is { surveiId: number; komoditasId: number; harga: number } => x !== null)

  let created = 0
  for (let i = 0; i < details.length; i += BATCH) {
    const chunk = details.slice(i, i + BATCH)
    await prisma.detailSurvei.createMany({ data: chunk })
    created += chunk.length
    process.stdout.write(`  Imported ${created.toLocaleString("id-ID")} detail records...\r`)
  }

  // =====================================================
  // SUMMARY
  // =====================================================
  console.log("\n\n=== IMPORT SUMMARY ===")
  console.log(`Wilayah      : ${await prisma.wilayah.count()}`)
  console.log(`Pasar        : ${await prisma.pasar.count()}`)
  console.log(`Komoditas    : ${await prisma.komoditas.count()}`)
  console.log(`Survei       : ${await prisma.survei.count()}`)
  console.log(`DetailSurvei : ${await prisma.detailSurvei.count().then((n) => n.toLocaleString("id-ID"))}`)

  const minDate = await prisma.survei.aggregate({ _min: { tanggal: true } })
  const maxDate = await prisma.survei.aggregate({ _max: { tanggal: true } })
  console.log(`Rentang tanggal: ${minDate._min.tanggal?.toISOString().split("T")[0]} s/d ${maxDate._max.tanggal?.toISOString().split("T")[0]}`)
  console.log("======================")
}

main()
  .catch((e) => {
    console.error("Import failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })