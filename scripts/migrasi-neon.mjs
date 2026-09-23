/**
 * Migrasi data dari PostgreSQL LOKAL ke database Neon (produksi).
 *
 * Cara pakai:
 *   1. Pastikan tabel sudah dibuat di Neon:
 *        DATABASE_URL="<neon-url>" npx prisma migrate deploy
 *   2. Jalankan script ini:
 *        SOURCE_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/simonpedia_bapok" \
 *        TARGET_DATABASE_URL="<neon-url>" \
 *        node scripts/migrasi-neon.mjs
 *
 * Membaca dari lokal via Prisma (SOURCE) lalu menulis ke Neon via Prisma (TARGET),
 * dengan urutan yang menghormati foreign key:
 *   Wilayah -> Pasar -> Komoditas -> Survei -> DetailSurvei
 *   lalu Het (tanpa relasi).
 *
 * AuditLog TIDAK dipindah (mulai bersih di produksi).
 */
import { PrismaClient } from "@prisma/client"

const SOURCE = process.env.SOURCE_DATABASE_URL
const TARGET = process.env.TARGET_DATABASE_URL

if (!SOURCE || !TARGET) {
  console.error("ERROR: SOURCE_DATABASE_URL dan TARGET_DATABASE_URL wajib diisi.")
  console.error("Contoh:")
  console.error('  SOURCE_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/simonpedia_bapok" \\')
  console.error('  TARGET_DATABASE_URL="postgresql://...neon.../neondb?sslmode=require" \\')
  console.error("  node scripts/migrasi-neon.mjs")
  process.exit(1)
}

const sumber = new PrismaClient({ datasources: { db: { url: SOURCE } } })
let tujuan = new PrismaClient({ datasources: { db: { url: TARGET } } })

/** Buat ulang koneksi ke Neon (pooler dapat memutus koneksi idle).
 *  Tahan gagal: mencoba beberapa kali karena Neon bisa sedang "bangun". */
async function hubungkanUlang(percobaan = 8) {
  try {
    await tujuan.$disconnect()
  } catch {
    /* abaikan */
  }
  for (let i = 1; i <= percobaan; i++) {
    tujuan = new PrismaClient({ datasources: { db: { url: TARGET } } })
    try {
      await tujuan.$connect()
      return
    } catch {
      await new Promise((r) => setTimeout(r, 2000))
    }
  }
  // Biarkan percobaan terakhir melempar error bila tetap gagal.
  await tujuan.$connect()
}

/** Jalankan fungsi dengan retry + reconnect, untuk koneksi Neon yang terputus. */
async function denganRetry(fn, label, percobaan = 6) {
  for (let i = 1; i <= percobaan; i++) {
    try {
      return await fn()
    } catch (err) {
      if (i === percobaan) throw err
      process.stdout.write(`\n  [${label}] koneksi terputus, menyambung ulang (${i}/${percobaan})...`)
      await new Promise((r) => setTimeout(r, 1500 * i))
      await hubungkanUlang()
    }
  }
}

// Map id lama (lokal) -> id baru (Neon) untuk mempertahankan relasi.
const mapWilayah = new Map()
const mapPasar = new Map()
const mapKomoditas = new Map()
const mapSurvei = new Map()

async function migrasiWilayah() {
  const rows = await sumber.wilayah.findMany()
  for (const r of rows) {
    const baru = await tujuan.wilayah.upsert({
      where: { kode: r.kode },
      update: { nama: r.nama },
      create: { nama: r.nama, kode: r.kode },
    })
    mapWilayah.set(r.id, baru.id)
  }
  console.log(`  Wilayah        : ${rows.length}`)
  return rows.length
}

async function migrasiPasar() {
  const rows = await sumber.pasar.findMany()
  for (const r of rows) {
    const data = {
      nama: r.nama,
      kecamatan: r.kecamatan,
      kelas: r.kelas,
      lat: r.lat,
      lng: r.lng,
      wilayahId: mapWilayah.get(r.wilayahId) ?? r.wilayahId,
    }
    // Pasar tidak punya kolom unik, jadi cari dulu berdasarkan nama+kecamatan.
    const ada = await tujuan.pasar.findFirst({ where: { nama: r.nama, kecamatan: r.kecamatan } })
    const baru = ada
      ? await tujuan.pasar.update({ where: { id: ada.id }, data })
      : await tujuan.pasar.create({ data })
    mapPasar.set(r.id, baru.id)
  }
  console.log(`  Pasar          : ${rows.length}`)
  return rows.length
}

async function migrasiKomoditas() {
  const rows = await sumber.komoditas.findMany()
  for (const r of rows) {
    const ada = await tujuan.komoditas.findFirst({ where: { nama: r.nama } })
    const data = { nama: r.nama, kategori: r.kategori, satuan: r.satuan }
    const baru = ada
      ? await tujuan.komoditas.update({ where: { id: ada.id }, data })
      : await tujuan.komoditas.create({ data })
    mapKomoditas.set(r.id, baru.id)
  }
  console.log(`  Komoditas      : ${rows.length}`)
  return rows.length
}

async function migrasiSurvei() {
  const rows = await sumber.survei.findMany()
  console.log(`  Survei         : ${rows.length} baris — mengunggah dalam batch...`)

  // Bangun data baru (tanpa id) memakai pasarId yang sudah dipetakan.
  const dataBaru = []
  for (const r of rows) {
    const pasarId = mapPasar.get(r.pasarId)
    if (pasarId == null) continue
    dataBaru.push({ tanggal: r.tanggal, pasarId, sumber: r.sumber })
  }

  const BATCH = 1000
  for (let i = 0; i < dataBaru.length; i += BATCH) {
    const chunk = dataBaru.slice(i, i + BATCH)
    await denganRetry(() => tujuan.survei.createMany({ data: chunk }), `survei batch ${i}`)
    process.stdout.write(`\r  Survei         : ${Math.min(i + BATCH, dataBaru.length)} terkirim`)
  }
  process.stdout.write("\n")

  // Ambil id survei dari Neon, lalu petakan dari id lokal.
  const surveiNeon = await denganRetry(
    () => tujuan.survei.findMany({ select: { id: true, tanggal: true, pasarId: true } }),
    "ambil survei neon",
  )
  const kunciNeon = new Map()
  for (const s of surveiNeon) {
    kunciNeon.set(`${s.tanggal.toISOString()}|${s.pasarId}`, s.id)
  }
  for (const r of rows) {
    const pasarId = mapPasar.get(r.pasarId)
    if (pasarId == null) continue
    const id = kunciNeon.get(`${r.tanggal.toISOString()}|${pasarId}`)
    if (id != null) mapSurvei.set(r.id, id)
  }

  console.log(`  Survei         : ${mapSurvei.size} terpetakan`)
  return mapSurvei.size
}

async function migrasiDetail() {
  const rows = await sumber.detailSurvei.findMany()
  console.log(`  DetailSurvei   : ${rows.length} baris — mengunggah dalam batch...`)

  // Bangun data baru dengan id relasi yang sudah dipetakan.
  const dataBaru = []
  for (const r of rows) {
    const surveiId = mapSurvei.get(r.surveiId)
    const komoditasId = mapKomoditas.get(r.komoditasId)
    if (surveiId == null || komoditasId == null) continue
    dataBaru.push({ surveiId, komoditasId, harga: r.harga })
  }

  const BATCH = 3000
  let terkirim = 0

  for (let i = 0; i < dataBaru.length; i += BATCH) {
    const chunk = dataBaru.slice(i, i + BATCH)
    await denganRetry(
      () => tujuan.detailSurvei.createMany({ data: chunk, skipDuplicates: true }),
      `detail batch ${i}`,
    )
    terkirim += chunk.length
    process.stdout.write(`\r  DetailSurvei   : ${terkirim.toLocaleString("id-ID")} terkirim`)
  }
  process.stdout.write("\n")
  return terkirim
}

async function migrasiHet() {
  const rows = await sumber.het.findMany()
  for (const r of rows) {
    await tujuan.het.upsert({
      where: { kode: r.kode },
      update: {
        komoditas: r.komoditas,
        harga: r.harga,
        satuan: r.satuan,
        sumber: r.sumber,
        status: r.status,
        catatan: r.catatan,
      },
      create: {
        kode: r.kode,
        komoditas: r.komoditas,
        harga: r.harga,
        satuan: r.satuan,
        sumber: r.sumber,
        status: r.status,
        catatan: r.catatan,
      },
    })
  }
  console.log(`  Het            : ${rows.length}`)
  return rows.length
}

async function verifikasi() {
  console.log("\n=== VERIFIKASI (Sumber vs Tujuan) ===")
  const tabel = [
    ["Wilayah", () => sumber.wilayah.count(), () => tujuan.wilayah.count()],
    ["Pasar", () => sumber.pasar.count(), () => tujuan.pasar.count()],
    ["Komoditas", () => sumber.komoditas.count(), () => tujuan.komoditas.count()],
    ["Survei", () => sumber.survei.count(), () => tujuan.survei.count()],
    ["DetailSurvei", () => sumber.detailSurvei.count(), () => tujuan.detailSurvei.count()],
    ["Het", () => sumber.het.count(), () => tujuan.het.count()],
  ]
  let cocok = true
  for (const [nama, cSumber, cTujuan] of tabel) {
    const a = await cSumber()
    const b = await cTujuan()
    const ok = a === b ? "OK" : "BEDA"
    if (a !== b) cocok = false
    console.log(`  ${nama.padEnd(14)} : sumber=${a}  tujuan=${b}  [${ok}]`)
  }
  return cocok
}

async function bersihkanTujuan() {
  // Hapus mengikuti urutan foreign key (anak dulu, induk belakangan).
  await denganRetry(() => tujuan.detailSurvei.deleteMany({}), "bersih detail")
  await denganRetry(() => tujuan.survei.deleteMany({}), "bersih survei")
  await denganRetry(() => tujuan.komoditas.deleteMany({}), "bersih komoditas")
  await denganRetry(() => tujuan.pasar.deleteMany({}), "bersih pasar")
  await denganRetry(() => tujuan.het.deleteMany({}), "bersih het")
  console.log("  (data lama di Neon dibersihkan)")
}

async function tungguNeonBangun(percobaan = 12) {
  process.stdout.write("Menghubungkan ke Neon")
  for (let i = 1; i <= percobaan; i++) {
    try {
      await tujuan.$queryRaw`SELECT 1`
      process.stdout.write(" — tersambung.\n\n")
      return
    } catch {
      process.stdout.write(".")
      await new Promise((r) => setTimeout(r, 3000))
      await hubungkanUlang()
    }
  }
  throw new Error("Tidak bisa menyambung ke Neon setelah beberapa percobaan.")
}

async function main() {
  console.log("=== MIGRASI DATA LOKAL -> NEON ===\n")
  await tungguNeonBangun()
  await bersihkanTujuan()
  await migrasiWilayah()
  await migrasiPasar()
  await migrasiKomoditas()
  await migrasiSurvei()
  await migrasiDetail()
  await migrasiHet()

  const cocok = await verifikasi()
  console.log(cocok ? "\n✅ Migrasi selesai — jumlah data cocok." : "\n⚠️  Ada perbedaan jumlah data, periksa di atas.")
}

main()
  .catch((e) => {
    console.error("\nMigrasi gagal:", e)
    process.exit(1)
  })
  .finally(async () => {
    await sumber.$disconnect()
    await tujuan.$disconnect()
  })
