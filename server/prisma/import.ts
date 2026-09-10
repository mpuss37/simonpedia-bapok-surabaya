import { PrismaClient } from "@prisma/client"
import * as fs from "fs"
import * as path from "path"

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
  return mapping[raw] || raw
}

// =====================================================
// NORMALISASI NAMA PASAR (strip "Pasar " prefix)
// =====================================================

function normalizePasarName(raw: string): string {
  return raw.replace(/^Pasar\s+/, "Pasar ")
}

// =====================================================
// KOORDINAT PASAR RIIL
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
// MAIN
// =====================================================

async function main() {
  const csvPath = path.resolve(__dirname, "../../data/archive/rekap_januari_2024_harian.csv")

  if (!fs.existsSync(csvPath)) {
    console.error("CSV file not found:", csvPath)
    process.exit(1)
  }

  console.log("Reading CSV:", csvPath)
  const content = fs.readFileSync(csvPath, "utf-8")
  const lines = content.trim().split("\n")
  const header = lines[0]

  console.log("Header:", header)
  console.log("Total lines:", lines.length - 1)

  // Parse CSV (handle quoted values with commas like "Sabun Colek Wing's Biru")
  const rows: Array<{
    tanggal: string
    kategori: string
    komoditas: string
    satuan: string
    pasar: string
    harga: string
    rata_harian: string
    rata_hitung: string
    selisih_rata: string
  }> = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    // Simple CSV parser: handles quoted fields with commas
    const fields: string[] = []
    let current = ""
    let inQuotes = false

    for (let j = 0; j < line.length; j++) {
      const ch = line[j]
      if (ch === '"') {
        inQuotes = !inQuotes
      } else if (ch === "," && !inQuotes) {
        fields.push(current.trim())
        current = ""
      } else {
        current += ch
      }
    }
    fields.push(current.trim())

    if (fields.length < 6) continue

    rows.push({
      tanggal: fields[0],
      kategori: fields[1],
      komoditas: fields[2],
      satuan: fields[3],
      pasar: fields[4],
      harga: fields[5],
      rata_harian: fields[6] || "",
      rata_hitung: fields[7] || "",
      selisih_rata: fields[8] || "",
    })
  }

  console.log(`Parsed ${rows.length} rows from CSV`)

  // =====================================================
  // STEP 1: Truncate existing data (dummy cleanup)
  // =====================================================

  console.log("\nStep 1: Truncating existing data...")
  await prisma.detailSurvei.deleteMany()
  await prisma.survei.deleteMany()
  await prisma.komoditas.deleteMany()
  await prisma.pasar.deleteMany()
  await prisma.wilayah.deleteMany()
  console.log("  Done.")

  // =====================================================
  // STEP 2: Create Wilayah
  // =====================================================

  console.log("\nStep 2: Creating Wilayah...")
  const surabaya = await prisma.wilayah.create({
    data: { nama: "Surabaya", kode: "SUB" },
  })
  console.log(`  Created: ${surabaya.nama} (id: ${surabaya.id})`)

  // =====================================================
  // STEP 3: Create Pasar (7 real markets)
  // =====================================================

  console.log("\nStep 3: Creating Pasar...")
  const pasarMap = new Map<string, number>()

  for (const [nama, coords] of Object.entries(pasarCoords)) {
    const pasar = await prisma.pasar.create({
      data: {
        nama,
        kecamatan: coords.kecamatan,
        kelas: "Utama",
        lat: coords.lat,
        lng: coords.lng,
        wilayahId: surabaya.id,
      },
    })
    pasarMap.set(nama, pasar.id)
    console.log(`  Created: ${pasar.nama} (${pasar.kecamatan}, id: ${pasar.id})`)
  }

  // =====================================================
  // STEP 4: Create Komoditas (from CSV unique values)
  // =====================================================

  console.log("\nStep 4: Creating Komoditas...")
  const uniqueKomoditas = new Map<string, { kategori: string; satuan: string }>()

  for (const row of rows) {
    const key = row.komoditas
    if (!uniqueKomoditas.has(key)) {
      uniqueKomoditas.set(key, {
        kategori: normalizeKategori(row.kategori),
        satuan: row.satuan,
      })
    }
  }

  const komoditasMap = new Map<string, number>()

  for (const [nama, info] of uniqueKomoditas) {
    const kom = await prisma.komoditas.create({
      data: {
        nama,
        kategori: info.kategori,
        satuan: info.satuan,
      },
    })
    komoditasMap.set(nama, kom.id)
  }

  console.log(`  Created ${uniqueKomoditas.size} komoditas`)

  // =====================================================
  // STEP 5: Import historical data
  // =====================================================

  console.log("\nStep 5: Importing historical data...")

  // Group rows by (tanggal, pasar)
  const surveiMap = new Map<string, number>()
  let surveiCount = 0
  let detailCount = 0
  let skippedCount = 0

  // Process in batches for performance
  const BATCH_SIZE = 500

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]

    // Skip rows with empty or zero harga
    const harga = parseFloat(row.harga)
    if (!row.harga || isNaN(harga) || harga <= 0) {
      skippedCount++
      continue
    }

    // Get or create Survei
    const surveiKey = `${row.tanggal}|${row.pasar}`
    let surveiId = surveiMap.get(surveiKey)

    if (!surveiId) {
      const tanggal = new Date(row.tanggal)
      const pasarId = pasarMap.get(row.pasar)

      if (!pasarId) {
        console.warn(`  WARNING: Pasar not found: ${row.pasar}`)
        skippedCount++
        continue
      }

      const survei = await prisma.survei.create({
        data: {
          tanggal,
          pasarId,
          sumber: "BAPENAS/SP2KP",
        },
      })

      surveiId = survei.id
      surveiMap.set(surveiKey, surveiId)
      surveiCount++
    }

    // Get Komoditas ID
    const komoditasId = komoditasMap.get(row.komoditas)
    if (!komoditasId) {
      console.warn(`  WARNING: Komoditas not found: ${row.komoditas}`)
      skippedCount++
      continue
    }

    // Insert DetailSurvei
    await prisma.detailSurvei.create({
      data: {
        surveiId,
        komoditasId,
        harga,
      },
    })
    detailCount++

    // Progress indicator
    if (detailCount % 1000 === 0) {
      process.stdout.write(`  Imported ${detailCount} detail records...\r`)
    }
  }

  console.log(`\n  Done.`)
  console.log(`  Survei created: ${surveiCount}`)
  console.log(`  DetailSurvei created: ${detailCount}`)
  console.log(`  Rows skipped (empty/zero/no-match): ${skippedCount}`)

  // =====================================================
  // SUMMARY
  // =====================================================

  console.log("\n=== IMPORT SUMMARY ===")
  const wilayahCount = await prisma.wilayah.count()
  const totalPasar = await prisma.pasar.count()
  const totalKomoditas = await prisma.komoditas.count()
  const totalSurvei = await prisma.survei.count()
  const totalDetail = await prisma.detailSurvei.count()

  console.log(`Wilayah: ${wilayahCount}`)
  console.log(`Pasar: ${totalPasar}`)
  console.log(`Komoditas: ${totalKomoditas}`)
  console.log(`Survei: ${totalSurvei}`)
  console.log(`DetailSurvei: ${totalDetail}`)
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
