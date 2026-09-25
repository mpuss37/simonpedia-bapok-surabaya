import { useEffect, useMemo, useState } from "react"
import * as XLSX from "xlsx"
import {
  Download,
  FileText,
  FileJson,
  FileSpreadsheet,
  Calendar,
  Filter,
  Database,
  Check,
  Info,
  AlertTriangle,
} from "lucide-react"
import PageHeader from "../components/layout/PageHeader"
import {
  getKomoditas,
  getPasar,
  getHarga,
  getRingkasanHarga,
  type Komoditas,
  type Pasar,
  type Harga,
  type RingkasanHarga,
} from "../services/priceService"

type Format = "csv" | "json" | "excel"

const formatOptions: {
  id: Format
  label: string
  ext: string
  desc: string
  icon: typeof FileText
}[] = [
  { id: "csv", label: "CSV", ext: ".csv", desc: "Buka di mana saja, cocok untuk spreadsheet.", icon: FileText },
  { id: "json", label: "JSON", ext: ".json", desc: "Untuk pengembang atau integrasi sistem.", icon: FileJson },
  { id: "excel", label: "Excel", ext: ".xlsx", desc: "Siap diolah dengan Microsoft Excel.", icon: FileSpreadsheet },
]

// Batas jumlah baris per export agar browser & database tetap ringan.
const BATAS_EXPORT = 20000
// Batas baris yang ditampilkan di pratinjau.
const BATAS_PRATINJAU = 50

interface BarisData {
  tanggal: string
  komoditas: string
  kategori: string
  satuan: string
  pasar: string
  harga: number
  sumber: string
}

function keBaris(h: Harga): BarisData {
  return {
    tanggal: String(h.tanggal).slice(0, 10),
    komoditas: h.komoditas.nama,
    kategori: h.komoditas.kategori,
    satuan: h.komoditas.satuan,
    pasar: h.pasar.nama,
    harga: h.harga,
    sumber: h.sumber ?? "-",
  }
}

function unduhBlob(isi: BlobPart, mime: string, namaFile: string) {
  const blob = new Blob([isi], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = namaFile
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function keCsv(rows: BarisData[]): string {
  if (rows.length === 0) return ""
  const kolom: (keyof BarisData)[] = ["tanggal", "komoditas", "kategori", "satuan", "pasar", "harga", "sumber"]
  const escape = (v: string | number) => {
    const s = String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const header = kolom.join(",")
  const isi = rows.map((r) => kolom.map((k) => escape(r[k])).join(",")).join("\n")
  return `${header}\n${isi}`
}

export default function DataExport() {
  const [komoditas, setKomoditas] = useState<Komoditas[]>([])
  const [pasar, setPasar] = useState<Pasar[]>([])
  const [ringkasan, setRingkasan] = useState<RingkasanHarga[]>([])
  const [loadingRef, setLoadingRef] = useState(true)

  const [komoditasId, setKomoditasId] = useState<string>("semua")
  const [pasarId, setPasarId] = useState<string>("semua")
  const [periode, setPeriode] = useState<string>("30")
  const [format, setFormat] = useState<Format>("csv")

  const [loadingUnduh, setLoadingUnduh] = useState(false)
  const [pesan, setPesan] = useState<{ tipe: "sukses" | "peringatan" | "error"; teks: string } | null>(null)

  // Muat daftar komoditas, pasar, dan ringkasan harga (ringan) untuk pratinjau.
  useEffect(() => {
    async function fetchRef() {
      try {
        const [k, p, r] = await Promise.all([
          getKomoditas(),
          getPasar(),
          getRingkasanHarga(),
        ])
        setKomoditas(k)
        setPasar(p)
        setRingkasan(r.data)
      } catch (err) {
        console.error("Gagal memuat referensi data:", err)
      } finally {
        setLoadingRef(false)
      }
    }
    fetchRef()
  }, [])

  // Perkiraan jumlah baris untuk ditampilkan (berdasarkan filter terpilih).
  // Data mentah lengkap baru ditarik saat tombol unduh diklik.
  const perkiraanBaris = useMemo(() => {
    const dasar = komoditasId === "semua" ? ringkasan.length : 1
    const faktorPasar = pasarId === "semua" ? pasar.length || 1 : 1
    const hari = periode === "all" ? 365 : Number(periode) || 30
    return Math.max(1, Math.round(dasar * faktorPasar * hari))
  }, [ringkasan, pasar, komoditasId, pasarId, periode])

  const ringkasanTerpilih = useMemo(() => {
    if (komoditasId === "semua") return ringkasan
    return ringkasan.filter((r) => String(r.id) === komoditasId)
  }, [ringkasan, komoditasId])

  // Ambil data mentah sesuai filter, terapkan periode, lalu unduh.
  async function handleExport() {
    setPesan(null)
    setLoadingUnduh(true)
    try {
      const harga = await getHarga({
        komoditasId: komoditasId === "semua" ? undefined : Number(komoditasId),
        pasarId: pasarId === "semua" ? undefined : Number(pasarId),
      })

      let baris = harga.map(keBaris)

      // Filter periode berdasarkan tanggal terbaru pada data.
      if (periode !== "all" && baris.length > 0) {
        const hari = Number(periode) || 30
        const terbaru = baris.reduce((max, r) => (r.tanggal > max ? r.tanggal : max), "")
        const batas = new Date(terbaru)
        batas.setDate(batas.getDate() - hari)
        const batasStr = batas.toISOString().slice(0, 10)
        baris = baris.filter((r) => r.tanggal >= batasStr)
      }

      if (baris.length === 0) {
        setPesan({ tipe: "peringatan", teks: "Tidak ada data untuk filter ini." })
        return
      }
      if (baris.length > BATAS_EXPORT) {
        setPesan({
          tipe: "peringatan",
          teks: `Data terlalu banyak (${baris.length.toLocaleString("id-ID")} baris). Persempit komoditas/pasar/periode hingga di bawah ${BATAS_EXPORT.toLocaleString("id-ID")} baris.`,
        })
        return
      }

      const tanggalFile = new Date().toISOString().slice(0, 10)
      const namaDasar = `harga-bapok-${tanggalFile}`

      if (format === "csv") {
        unduhBlob(keCsv(baris), "text/csv;charset=utf-8;", `${namaDasar}.csv`)
      } else if (format === "json") {
        unduhBlob(JSON.stringify(baris, null, 2), "application/json", `${namaDasar}.json`)
      } else {
        const ws = XLSX.utils.json_to_sheet(baris)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Harga")
        XLSX.writeFile(wb, `${namaDasar}.xlsx`)
      }

      setPesan({
        tipe: "sukses",
        teks: `Berhasil mengunduh ${baris.length.toLocaleString("id-ID")} baris (${formatOptions.find((f) => f.id === format)!.label}).`,
      })
    } catch (err) {
      console.error("Gagal export:", err)
      setPesan({ tipe: "error", teks: "Gagal membuat berkas. Coba lagi." })
    } finally {
      setLoadingUnduh(false)
    }
  }

  const pilihanFormat = formatOptions.find((f) => f.id === format)!

  return (
    <div className="min-h-screen bg-[#FAF7F7] dark:bg-[#121212]">
      <PageHeader breadcrumb="Data & Export" title="Data & Export" />

      <div className="px-6 py-10 lg:px-8 lg:py-12">
        {/* INTRO */}
        <section>
          <p className="text-sm font-semibold text-[#C93742]">Unduh data</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[#171717] dark:text-white lg:text-5xl">
            Data & Export
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#171717]/50 dark:text-white/50">
            Pilih data yang ingin kamu unduh, lalu tentukan formatnya. Cocok buat
            kamu yang mau mengolah ulang data harga bahan pokok sendiri.
          </p>
        </section>

        {/* FILTER + FORMAT */}
        <section className="mt-10 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          {/* PANEL FILTER */}
          <div className="rounded-2xl border border-[#171717]/[0.06] dark:border-white/10 bg-white dark:bg-[#1E1E1E] p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <Filter size={16} className="text-[#C93742]" />
              <h2 className="text-sm font-bold text-[#171717] dark:text-white">
                Atur data yang mau diunduh
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#171717]/55 dark:text-white/55">
                  Komoditas
                </label>
                <select
                  value={komoditasId}
                  onChange={(e) => setKomoditasId(e.target.value)}
                  disabled={loadingRef}
                  className="h-11 w-full rounded-xl border border-[#171717]/[0.08] dark:border-white/10 bg-[#FFF8F9] dark:bg-[#121212] px-3 text-sm font-medium text-[#171717]/70 dark:text-white/70 outline-none focus:border-[#C93742]/40"
                >
                  <option value="semua">Semua komoditas</option>
                  {komoditas.map((k) => (
                    <option key={k.id} value={String(k.id)}>
                      {k.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#171717]/55 dark:text-white/55">
                  Pasar
                </label>
                <select
                  value={pasarId}
                  onChange={(e) => setPasarId(e.target.value)}
                  disabled={loadingRef}
                  className="h-11 w-full rounded-xl border border-[#171717]/[0.08] dark:border-white/10 bg-[#FFF8F9] dark:bg-[#121212] px-3 text-sm font-medium text-[#171717]/70 dark:text-white/70 outline-none focus:border-[#C93742]/40"
                >
                  <option value="semua">Semua pasar</option>
                  {pasar.map((p) => (
                    <option key={p.id} value={String(p.id)}>
                      {p.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#171717]/55 dark:text-white/55">
                  Periode
                </label>
                <div className="relative">
                  <Calendar
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#171717]/35 dark:text-white/35"
                  />
                  <select
                    value={periode}
                    onChange={(e) => setPeriode(e.target.value)}
                    className="h-11 w-full rounded-xl border border-[#171717]/[0.08] dark:border-white/10 bg-[#FFF8F9] dark:bg-[#121212] pl-9 pr-3 text-sm font-medium text-[#171717]/70 dark:text-white/70 outline-none focus:border-[#C93742]/40"
                  >
                    <option value="7">7 hari terakhir</option>
                    <option value="30">30 hari terakhir</option>
                    <option value="90">3 bulan terakhir</option>
                    <option value="180">6 bulan terakhir</option>
                    <option value="365">1 tahun terakhir</option>
                    <option value="all">Seluruh data</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#171717]/55 dark:text-white/55">
                  Jumlah baris
                </label>
                <div className="flex h-11 items-center gap-2 rounded-xl border border-[#171717]/[0.08] dark:border-white/10 bg-[#F7F4F4] dark:bg-white/[0.03] px-3">
                  <Database size={15} className="text-[#171717]/35 dark:text-white/35" />
                  <span className="text-sm font-bold text-[#171717] dark:text-white">
                    {loadingRef ? "..." : perkiraanBaris.toLocaleString("id-ID")}
                  </span>
                  <span className="text-xs text-[#171717]/40 dark:text-white/40">baris</span>
                </div>
              </div>
            </div>
          </div>

          {/* PANEL FORMAT */}
          <div className="rounded-2xl border border-[#171717]/[0.06] dark:border-white/10 bg-white dark:bg-[#1E1E1E] p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <Download size={16} className="text-[#C93742]" />
              <h2 className="text-sm font-bold text-[#171717] dark:text-white">
                Format file
              </h2>
            </div>

            <div className="space-y-3">
              {formatOptions.map((opt) => {
                const Icon = opt.icon
                const aktif = format === opt.id
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFormat(opt.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                      aktif
                        ? "border-[#C93742] bg-[#FFF3F4] dark:bg-white/[0.04]"
                        : "border-[#171717]/[0.08] dark:border-white/10 hover:border-[#C93742]/40"
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                        aktif
                          ? "bg-[#C93742] text-white"
                          : "bg-[#171717]/[0.04] dark:bg-white/[0.06] text-[#171717]/55 dark:text-white/55"
                      }`}
                    >
                      <Icon size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-[#171717] dark:text-white">
                        {opt.label}
                        <span className="ml-1 font-normal text-[#171717]/40 dark:text-white/40">
                          ({opt.ext})
                        </span>
                      </span>
                      <span className="mt-0.5 block text-xs text-[#171717]/45 dark:text-white/45">
                        {opt.desc}
                      </span>
                    </span>
                    {aktif && (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#C93742] text-white">
                        <Check size={12} />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              onClick={handleExport}
              disabled={loadingUnduh}
              className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white transition ${
                loadingUnduh
                  ? "cursor-not-allowed bg-[#C93742]/60"
                  : "bg-[#C93742] hover:bg-[#B52F39]"
              }`}
            >
              <Download size={16} />
              {loadingUnduh ? "Menyiapkan..." : `Unduh ${pilihanFormat.label}`}
            </button>

            {pesan && (
              <p
                className={`mt-3 flex items-start gap-1.5 text-xs ${
                  pesan.tipe === "sukses"
                    ? "text-[#1C8C4A] dark:text-emerald-400"
                    : pesan.tipe === "peringatan"
                      ? "text-[#B45309]"
                      : "text-[#C93742]"
                }`}
              >
                {pesan.tipe === "sukses" ? (
                  <Info size={13} className="mt-0.5 shrink-0" />
                ) : (
                  <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                )}
                {pesan.teks}
              </p>
            )}
          </div>
        </section>

        {/* PRATINJAU */}
        <section className="mt-8 rounded-2xl border border-[#171717]/[0.06] dark:border-white/10 bg-white dark:bg-[#1E1E1E] shadow-sm">
          <div className="flex items-center justify-between border-b border-[#171717]/[0.06] dark:border-white/10 px-6 py-4">
            <div className="flex items-center gap-2">
              <Database size={16} className="text-[#C93742]" />
              <h2 className="text-sm font-bold text-[#171717] dark:text-white">
                Pratinjau data
              </h2>
            </div>
            <span className="text-xs text-[#171717]/40 dark:text-white/40">
              {loadingRef
                ? "memuat..."
                : ringkasanTerpilih.length === 0
                  ? "tidak ada data"
                  : `${ringkasanTerpilih.length.toLocaleString("id-ID")} komoditas`}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left">
              <thead>
                <tr className="border-b border-[#171717]/[0.06] dark:border-white/10 text-[11px] uppercase tracking-wide text-[#171717]/40 dark:text-white/40">
                  <th className="px-6 py-3 font-semibold">Komoditas</th>
                  <th className="px-6 py-3 font-semibold">Kategori</th>
                  <th className="px-6 py-3 text-right font-semibold">Harga rata-rata</th>
                  <th className="px-6 py-3 text-right font-semibold">Perubahan</th>
                  <th className="px-6 py-3 font-semibold">Satuan</th>
                </tr>
              </thead>
              <tbody>
                {loadingRef ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-[#171717]/40 dark:text-white/40">
                      Memuat data...
                    </td>
                  </tr>
                ) : ringkasanTerpilih.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-[#171717]/40 dark:text-white/40">
                      Tidak ada data untuk filter ini.
                    </td>
                  </tr>
                ) : (
                  ringkasanTerpilih.slice(0, BATAS_PRATINJAU).map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-[#171717]/[0.04] dark:border-white/[0.06] last:border-0"
                    >
                      <td className="px-6 py-3 text-sm font-semibold text-[#171717] dark:text-white">{r.nama}</td>
                      <td className="px-6 py-3 text-sm text-[#171717]/55 dark:text-white/55">{r.kategori}</td>
                      <td className="px-6 py-3 text-right text-sm font-semibold text-[#171717] dark:text-white">
                        Rp{Math.round(r.hargaRataRata).toLocaleString("id-ID")}
                      </td>
                      <td
                        className={`px-6 py-3 text-right text-sm font-semibold ${
                          r.persenPerubahan >= 0 ? "text-[#C93742]" : "text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {r.persenPerubahan >= 0 ? "+" : ""}
                        {r.persenPerubahan.toFixed(1)}%
                      </td>
                      <td className="px-6 py-3 text-sm text-[#171717]/55 dark:text-white/55">{r.satuan}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-[#171717]/[0.06] dark:border-white/10 px-6 py-3">
            <p className="text-xs text-[#171717]/40 dark:text-white/40">
              Di atas adalah ringkasan harga terkini per komoditas. Saat mengunduh, data harga
              mentah (per pasar per tanggal) sesuai filter akan disertakan — maks{" "}
              {BATAS_EXPORT.toLocaleString("id-ID")} baris.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
