import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react"

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { getRingkasanHarga } from "../services/priceService"
import ThemeToggle from "../components/ThemeToggle"
import MobileMenuButton from "../components/layout/MobileMenuButton"
import NotificationBell from "../components/layout/NotificationBell"
import DashboardAlertBanner from "../components/DashboardAlertBanner"
import ChartTooltip from "../components/charts/ChartTooltip"
import HetReferenceLine from "../components/charts/HetReferenceLine"
import HetNote from "../components/charts/HetNote"
import { withPrevious } from "../lib/chartData"
import { getHet } from "../lib/het"
import { useChartTheme } from "../hooks/useChartTheme"
import { API_URL } from "../services/api"

interface EWSRingkasan {
  totalKomoditas: number
  normal: number
  siaga: number
  waspada: number
  kritis: number
}

interface EWSAnalisis {
  id: number
  nama: string
  kategori: string
  hargaRataRata: number
  persenPerubahan: number
  levelRisiko?: "Normal" | "Siaga" | "Waspada" | "Kritis"
}

interface KomoditasItem {
  nama: string
  kategori: string
  harga: number
  change: number
  type: "up" | "down" | "stable"
}

interface ChartItem {
  tanggal: string
  harga: number
  previous?: number | null
}

export default function Home() {

  const chartTheme = useChartTheme()

  const [komoditasList, setKomoditasList] = useState<KomoditasItem[]>([])
  const [chartData, setChartData] = useState<ChartItem[]>([])
  const [ewsSummary, setEwsSummary] = useState<EWSRingkasan | null>(null)
  const [ewsAnalisis, setEwsAnalisis] = useState<EWSAnalisis[]>([])
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)
  const [chartKomoditas, setChartKomoditas] = useState<{ nama: string; change: number } | null>(null)
  const [selectedChartId, setSelectedChartId] = useState<number | null>(null)
  const [chartLoading, setChartLoading] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const [ringkasanRes, ewsRes] = await Promise.all([
          getRingkasanHarga(),
          fetch(`${API_URL}/ews/analyze`).then(r => r.json()),
        ])

        const analisis = (ewsRes.analisis || []) as EWSAnalisis[]

        // PersenPerubahan real dari analisis EWS
        const changeMap = new Map<string, number>()
        for (const a of analisis) {
          changeMap.set(a.nama, a.persenPerubahan)
        }

        const komoditasItems: KomoditasItem[] = ringkasanRes.data
          .map((r) => {
            const change = changeMap.get(r.nama) ?? r.persenPerubahan
            return {
              nama: r.nama,
              kategori: r.kategori,
              harga: r.hargaRataRata,
              change,
              type: (change > 0 ? "up" : change < 0 ? "down" : "stable") as "up" | "down" | "stable",
            }
          })
          .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
          .slice(0, 5)

        // Chart: pakai komoditas dengan PERUBAHAN TERBESAR (dinamis, bukan ID tetap)
        const topKomoditas = analisis
          .slice()
          .sort((a, b) => Math.abs(b.persenPerubahan) - Math.abs(a.persenPerubahan))[0]

        setKomoditasList(komoditasItems)
        setEwsSummary(ewsRes.ringkasan)
        setEwsAnalisis(ewsRes.analisis || [])
        setLastUpdate(ewsRes.lastUpdate)
        setSelectedChartId(topKomoditas?.id ?? null)
      } catch (err) {
        console.error("Gagal memuat dashboard:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  // Muat ulang data chart tiap kali komoditas yang dipilih berubah
  useEffect(() => {
    if (selectedChartId == null) return

    let active = true

    async function fetchChart() {
      setChartLoading(true)
      try {
        const res = await fetch(`${API_URL}/ews/chart/${selectedChartId}`)
        const chartRaw: ChartItem[] = res.ok ? await res.json() : []
        if (!active) return

        const meta = ewsAnalisis.find((a) => a.id === selectedChartId)
        setChartData(withPrevious(chartRaw, "harga"))
        setChartKomoditas(
          meta ? { nama: meta.nama, change: meta.persenPerubahan } : null
        )
      } catch (err) {
        console.error("Gagal memuat data chart:", err)
        if (active) setChartData([])
      } finally {
        if (active) setChartLoading(false)
      }
    }

    fetchChart()
    return () => {
      active = false
    }
  }, [selectedChartId, ewsAnalisis])

  const totalKomoditas = ewsSummary?.totalKomoditas || 0
  const naikCount = ewsAnalisis.filter(a => a.persenPerubahan > 0).length
  const waspadaCount = (ewsSummary?.waspada || 0) + (ewsSummary?.kritis || 0)
  const normalCount = ewsSummary?.normal || 0
  const alertCount = (ewsSummary?.siaga || 0) + waspadaCount

  // Komoditas yang perlu perhatian (risiko Kritis / Waspada) untuk banner.
  const peringatanList = ewsAnalisis
    .filter((a) => a.levelRisiko === "Kritis" || a.levelRisiko === "Waspada")
    .sort((a, b) => Math.abs(b.persenPerubahan) - Math.abs(a.persenPerubahan))
    .map((a) => ({
      id: a.id,
      nama: a.nama,
      persenPerubahan: a.persenPerubahan,
      levelRisiko: a.levelRisiko as string,
    }))

  const lastUpdateText = lastUpdate
    ? new Date(lastUpdate).toLocaleString("id-ID", {
        dateStyle: "full",
        timeStyle: "short",
      })
    : "Tidak ada data"

  const hetInfo = getHet(chartKomoditas?.nama)

  return (
    <div className="min-h-screen">
      {/* TOPBAR */}
      <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[#171717]/[0.06] dark:border-white/10 bg-[#FFF8F9] dark:bg-[#121212]/90 px-6 backdrop-blur-xl lg:px-10 dark:border-white/10 dark:bg-[#121212]/90">
        <div className="flex min-w-0 items-center gap-1">
          <MobileMenuButton />
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-[#171717]/40 dark:text-white/40 dark:text-white/40">SIMONPEDIA / Dashboard</p>
            <h1 className="mt-0.5 truncate text-lg font-bold text-[#171717] dark:text-white dark:text-white">Dashboard</h1>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden items-center gap-2 text-xs text-[#171717]/40 dark:text-white/40 sm:flex dark:text-white/40">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Data survei terakhir: {lastUpdateText}
          </div>
          <ThemeToggle />
          <NotificationBell />
        </div>
      </header>

      <main className="px-6 py-8 lg:px-10 lg:py-10">
        {/* BANNER PERINGATAN HARGA */}
        <DashboardAlertBanner items={peringatanList} />

        {/* HERO */}
        <section className="relative overflow-hidden rounded-[28px] bg-[#171717] px-6 py-8 text-white lg:px-9 lg:py-10">
          <div className="relative z-10 max-w-2xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">Kondisi pasar hari ini</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] lg:text-5xl">
              Pantau harga bapok<br />
              <span className="text-[#C93742]">Surabaya.</span>
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/45">
              SIMONPEDIA membantu memantau pergerakan harga, membaca tren, mendeteksi risiko, dan memberikan rekomendasi tindakan berdasarkan kondisi pasar.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/monitoring" className="flex items-center gap-2 rounded-xl bg-[#C93742] px-5 py-3 text-xs font-bold text-white transition hover:bg-[#B52F39]">
                Lihat monitoring
                <ArrowRight size={14} />
              </Link>
              <Link to="/ews" className="rounded-xl border border-white/10 bg-white/[0.05] px-5 py-3 text-xs font-semibold text-white/70 transition hover:bg-white/10">
                Buka EWS
              </Link>
            </div>
          </div>
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/[0.05]" />
          <div className="absolute -right-10 -bottom-32 h-72 w-72 rounded-full border border-[#C93742]/20" />
        </section>

        {loading ? (
          <div className="mt-6 rounded-[24px] border border-[#171717]/[0.06] dark:border-white/10 bg-white dark:bg-[#1E1E1E] p-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#C93742] border-t-transparent" />
            <p className="mt-4 text-sm text-[#171717]/40 dark:text-white/40">Memuat data dashboard...</p>
          </div>
        ) : (
          <>
        {/* SUMMARY */}
        <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Metric label="Komoditas dipantau" value={String(totalKomoditas)} description="komoditas" icon={<Wallet size={16} />} />
          <Metric label="Harga naik" value={String(naikCount)} description="dari data terakhir" danger icon={<ArrowUpRight size={16} />} />
          <Metric label="Harga stabil/turun" value={String(normalCount)} description="kondisi normal" success icon={<ArrowDownRight size={16} />} />
          <Metric label="Alert aktif" value={String(alertCount)} description="Siaga + Waspada + Kritis" warning icon={<AlertTriangle size={16} />} />
        </section>

        {/* CHART + EWS */}
        <section className="mt-6 grid gap-5 xl:grid-cols-[1fr_340px]">
          <div className="rounded-[24px] border border-[#171717]/[0.06] dark:border-white/10 bg-white dark:bg-[#1E1E1E] p-5 lg:p-6">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#171717]/30 dark:text-white/30">Market trend</p>
                <h3 className="mt-1 text-base font-bold text-[#171717] dark:text-white">
                  {chartKomoditas ? `Tren harga ${chartKomoditas.nama}` : "Tren harga rata-rata"}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {chartKomoditas && (
                  <span className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-[10px] font-bold ${chartKomoditas.change >= 0 ? "bg-[#FFF3F4] dark:bg-white/[0.04] text-[#C93742]" : "bg-[#EFFAF3] dark:bg-emerald-500/15 text-[#1C8C4A] dark:text-emerald-400"}`}>
                    {chartKomoditas.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {" "}{chartKomoditas.change >= 0 ? "+" : ""}{chartKomoditas.change.toFixed(2)}%
                  </span>
                )}
                <select
                  value={selectedChartId ?? ""}
                  onChange={(e) => setSelectedChartId(e.target.value ? Number(e.target.value) : null)}
                  className="max-w-[180px] rounded-xl border border-[#171717]/[0.08] dark:border-white/10 bg-white dark:bg-[#121212] px-3 py-2 text-xs font-semibold text-[#171717]/70 dark:text-white/70 outline-none transition focus:border-[#C93742]/40 focus:ring-2 focus:ring-[#C93742]/10"
                  aria-label="Pilih komoditas untuk tren harga"
                >
                  {ewsAnalisis.length === 0 && <option value="">Tidak ada data</option>}
                  {ewsAnalisis.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nama}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="relative h-[310px]">
              <HetNote hasHet={!!hetInfo} />
              {chartLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-[#1E1E1E]/60 backdrop-blur-[1px]">
                  <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#C93742] border-t-transparent" />
                </div>
              )}
              {chartData.length === 0 && !chartLoading ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-[#171717]/40 dark:text-white/40">Belum ada data tren untuk komoditas ini.</p>
                </div>
              ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="homeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C93742" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="#C93742" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} vertical={false} />
                  <XAxis dataKey="tanggal" tick={{ fontSize: 10, fill: chartTheme.tickColor }} axisLine={false} tickLine={false} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tickFormatter={(value) => `Rp${value / 1000}k`} tick={{ fontSize: 10, fill: chartTheme.tickColor }} axisLine={false} tickLine={false} />
                  <Tooltip content={(props) => <ChartTooltip {...props} valueLabel="Harga" labelFormatter={(v) => `Tanggal ${v}`} het={hetInfo?.harga} hetSatuan={hetInfo?.satuan} />} cursor={{ stroke: chartTheme.axisColor }} />
                  <HetReferenceLine value={hetInfo?.harga} satuan={hetInfo?.satuan} />
                  <Area type="monotone" dataKey="harga" stroke="#C93742" strokeWidth={2.5} fill="url(#homeGradient)" />
                </AreaChart>
              </ResponsiveContainer>
              )}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-[#171717]/[0.05] dark:border-white/10 pt-4">
              <p className="text-[10px] text-[#171717]/30 dark:text-white/30">
                {chartKomoditas ? `${chartKomoditas.nama} - Rata-rata seluruh pasar` : "Rata-rata seluruh pasar"}
              </p>
              <Link to="/monitoring" className="text-[10px] font-bold text-[#C93742]">Detail monitoring →</Link>
            </div>
          </div>

          <div className="rounded-[24px] border border-[#171717]/[0.06] dark:border-white/10 bg-white dark:bg-[#1E1E1E] p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#171717]/30 dark:text-white/30">Early warning</p>
                <h3 className="mt-1 text-base font-bold text-[#171717] dark:text-white">Kondisi risiko</h3>
              </div>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF0F1] dark:bg-white/[0.04] text-[#C93742]">
                <AlertTriangle size={17} />
              </span>
            </div>
            <div className="mt-5 rounded-2xl bg-[#FFF3F4] dark:bg-white/[0.04] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C93742] text-white">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#C93742]">
                    {waspadaCount > 0 ? "Waspada" : "Normal"}
                  </p>
                  <p className="mt-1 text-sm font-bold text-[#171717] dark:text-white">
                    {waspadaCount} komoditas
                  </p>
                </div>
              </div>
              <p className="mt-4 text-[11px] leading-5 text-[#171717]/45 dark:text-white/45">
                {waspadaCount > 0
                  ? "Terdapat komoditas dengan kenaikan harga yang melebihi batas normal."
                  : "Semua komoditas dalam kondisi normal."}
              </p>
            </div>
            <Link to="/ews" className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#171717]/[0.06] dark:border-white/10 py-3 text-xs font-bold text-[#171717]/55 dark:text-white/55 transition hover:border-[#C93742]/30 hover:text-[#C93742]">
              Buka EWS
              <ArrowRight size={13} />
            </Link>
          </div>
        </section>

        {/* COMMODITY TABLE */}
        <section className="mt-6 rounded-[24px] border border-[#171717]/[0.06] dark:border-white/10 bg-white dark:bg-[#1E1E1E] p-5 lg:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#171717]/30 dark:text-white/30">Market overview</p>
              <h3 className="mt-1 text-base font-bold text-[#171717] dark:text-white">Pergerakan komoditas</h3>
            </div>
            <button className="text-xs font-bold text-[#C93742]">Lihat semua →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px]">
              <thead>
                <tr className="border-b border-[#171717]/[0.05] dark:border-white/10">
                  <th className="pb-3 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-[#171717]/30 dark:text-white/30">Komoditas</th>
                  <th className="pb-3 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-[#171717]/30 dark:text-white/30">Kategori</th>
                  <th className="pb-3 text-right text-[10px] font-bold uppercase tracking-[0.1em] text-[#171717]/30 dark:text-white/30">Harga</th>
                  <th className="pb-3 text-right text-[10px] font-bold uppercase tracking-[0.1em] text-[#171717]/30 dark:text-white/30">Perubahan</th>
                </tr>
              </thead>
              <tbody>
                {komoditasList.map((item) => (
                  <tr key={item.nama} className="border-b border-[#171717]/[0.04] dark:border-white/10 last:border-0">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFF8F9] dark:bg-[#121212] text-[#C93742]">
                          <Wallet size={14} />
                        </div>
                        <span className="text-xs font-bold text-[#171717] dark:text-white">{item.nama}</span>
                      </div>
                    </td>
                    <td className="py-4 text-xs text-[#171717]/40 dark:text-white/40">{item.kategori}</td>
                    <td className="py-4 text-right text-xs font-bold text-[#171717] dark:text-white">
                      Rp{item.harga.toLocaleString("id-ID")}
                    </td>
                    <td className="py-4 text-right">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold ${item.type === "up" ? "text-[#C93742]" : "text-emerald-600 dark:text-emerald-400"}`}>
                        {item.type === "up" ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                        {Math.abs(item.change)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FOOTER */}
        <div className="mt-8 border-t border-[#171717]/[0.06] dark:border-white/10 pt-5 text-[11px] text-[#171717]/30 dark:text-white/30">
          SIMONPEDIA Bapok Surabaya
        </div>
          </>
        )}
      </main>
    </div>
  )
}


function Metric({ label, value, description, icon, danger = false, success = false, warning = false }: {
  label: string; value: string; description: string; icon: React.ReactNode; danger?: boolean; success?: boolean; warning?: boolean
}) {
  const accent = danger ? "text-[#C93742]"
    : success ? "text-emerald-600 dark:text-emerald-400"
    : warning ? "text-amber-600 dark:text-amber-300"
    : "text-[#171717] dark:text-white"

  const badge = danger ? "bg-[#C93742]/10 text-[#C93742]"
    : success ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
    : warning ? "bg-amber-500/10 text-amber-600 dark:text-amber-300"
    : "bg-[#171717]/[0.05] text-[#171717]/60 dark:bg-white/10 dark:text-white/70"

  const ring = danger ? "border-[#C93742]/20"
    : success ? "border-emerald-500/20"
    : warning ? "border-amber-500/20"
    : "border-[#171717]/[0.06] dark:border-white/10"

  return (
    <div className={`rounded-[20px] border bg-white p-5 dark:bg-[#1E1E1E] ${ring}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-[#171717]/55 dark:text-white/55">{label}</p>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${badge}`}>
          {icon}
        </span>
      </div>
      <p className={`mt-3 text-3xl font-black tracking-[-0.04em] ${accent}`}>{value}</p>
      <p className="mt-1 text-[11px] font-semibold text-[#171717]/45 dark:text-white/45">{description}</p>
    </div>
  )
}
