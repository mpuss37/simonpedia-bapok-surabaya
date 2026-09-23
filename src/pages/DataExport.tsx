import { useEffect, useMemo, useState } from "react"
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
} from "lucide-react"
import PageHeader from "../components/layout/PageHeader"
import {
  getKomoditas,
  getPasar,
  getRingkasanHarga,
  type Komoditas,
  type Pasar,
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
  {
    id: "csv",
    label: "CSV",
    ext: ".csv",
    desc: "Buka di mana saja, cocok untuk spreadsheet.",
    icon: FileText,
  },
  {
    id: "json",
    label: "JSON",
    ext: ".json",
    desc: "Untuk pengembang atau integrasi sistem.",
    icon: FileJson,
  },
  {
    id: "excel",
    label: "Excel",
    ext: ".xlsx",
    desc: "Siap diolah dengan Microsoft Excel.",
    icon: FileSpreadsheet,
  },
]

export default function DataExport() {
  const [komoditas, setKomoditas] = useState<Komoditas[]>([])
  const [pasar, setPasar] = useState<Pasar[]>([])
  const [ringkasan, setRingkasan] = useState<RingkasanHarga[]>([])
  const [loading, setLoading] = useState(true)

  const [komoditasId, setKomoditasId] = useState<string>("semua")
  const [pasarId, setPasarId] = useState<string>("semua")
  const [periode, setPeriode] = useState<string>("30")
  const [format, setFormat] = useState<Format>("csv")
  const [notified, setNotified] = useState(false)

  useEffect(() => {
    async function fetchData() {
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
        console.error("Gagal memuat data export:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Perkiraan jumlah baris yang akan diekspor (preview saja, belum difungsikan).
  const perkiraanBaris = useMemo(() => {
    const dasar = ringkasan.length || komoditas.length
    const faktorKomoditas = komoditasId === "semua" ? 1 : 1 / Math.max(1, komoditas.length)
    const faktorPasar = pasarId === "semua" ? (pasar.length || 1) : 1
    const faktorPeriode = Number(periode) || 30
    return Math.max(
      1,
      Math.round(dasar * faktorKomoditas * faktorPasar * faktorPeriode * 0.6),
    )
  }, [ringkasan, komoditas, pasar, komoditasId, pasarId, periode])

  const ringkasanTerpilih = useMemo(() => {
    if (komoditasId === "semua") return ringkasan.slice(0, 8)
    return ringkasan.filter((r) => String(r.id) === komoditasId)
  }, [ringkasan, komoditasId])

  function handleExport() {
    setNotified(true)
    window.setTimeout(() => setNotified(false), 3500)
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
                  disabled={loading}
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
                  disabled={loading}
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
                  Perkiraan jumlah baris
                </label>
                <div className="flex h-11 items-center gap-2 rounded-xl border border-[#171717]/[0.08] dark:border-white/10 bg-[#F7F4F4] dark:bg-white/[0.03] px-3">
                  <Database size={15} className="text-[#171717]/35 dark:text-white/35" />
                  <span className="text-sm font-bold text-[#171717] dark:text-white">
                    {loading ? "..." : perkiraanBaris.toLocaleString("id-ID")}
                  </span>
                  <span className="text-xs text-[#171717]/40 dark:text-white/40">
                    baris
                  </span>
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
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#C93742] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#B52F39]"
            >
              <Download size={16} />
              Unduh {pilihanFormat.label}
            </button>

            {notified && (
              <p className="mt-3 flex items-start gap-1.5 text-xs text-[#1C8C4A] dark:text-emerald-400">
                <Info size={13} className="mt-0.5 shrink-0" />
                Fitur unduh belum aktif. Tampilan ini masih tahap rancangan.
              </p>
            )}
          </div>
        </section>

        {/* PREVIEW DATA */}
        <section className="mt-8 rounded-2xl border border-[#171717]/[0.06] dark:border-white/10 bg-white dark:bg-[#1E1E1E] shadow-sm">
          <div className="flex items-center justify-between border-b border-[#171717]/[0.06] dark:border-white/10 px-6 py-4">
            <div className="flex items-center gap-2">
              <Database size={16} className="text-[#C93742]" />
              <h2 className="text-sm font-bold text-[#171717] dark:text-white">
                Pratinjau data
              </h2>
            </div>
            <span className="text-xs text-[#171717]/40 dark:text-white/40">
              {komoditasId === "semua"
                ? "Menampilkan sebagian komoditas"
                : "1 komoditas dipilih"}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
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
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-[#171717]/40 dark:text-white/40">
                      Memuat data...
                    </td>
                  </tr>
                ) : ringkasanTerpilih.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-[#171717]/40 dark:text-white/40">
                      Tidak ada data untuk ditampilkan.
                    </td>
                  </tr>
                ) : (
                  ringkasanTerpilih.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-[#171717]/[0.04] dark:border-white/[0.06] last:border-0"
                    >
                      <td className="px-6 py-3 text-sm font-semibold text-[#171717] dark:text-white">
                        {r.nama}
                      </td>
                      <td className="px-6 py-3 text-sm text-[#171717]/55 dark:text-white/55">
                        {r.kategori}
                      </td>
                      <td className="px-6 py-3 text-right text-sm font-semibold text-[#171717] dark:text-white">
                        Rp{Math.round(r.hargaRataRata).toLocaleString("id-ID")}
                      </td>
                      <td
                        className={`px-6 py-3 text-right text-sm font-semibold ${
                          r.persenPerubahan >= 0
                            ? "text-[#C93742]"
                            : "text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {r.persenPerubahan >= 0 ? "+" : ""}
                        {r.persenPerubahan.toFixed(1)}%
                      </td>
                      <td className="px-6 py-3 text-sm text-[#171717]/55 dark:text-white/55">
                        {r.satuan}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-[#171717]/[0.06] dark:border-white/10 px-6 py-3">
            <p className="text-xs text-[#171717]/40 dark:text-white/40">
              Pratinjau dibatasi agar halaman tetap ringan. Data lengkap akan
              tersedia saat fitur unduh aktif.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
