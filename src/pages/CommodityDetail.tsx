import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Store,
} from "lucide-react"

import { Link, useParams } from "react-router-dom"
import { useEffect, useState } from "react"

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { getHarga, type Harga } from "../services/priceService"
import PageHeader from "../components/layout/PageHeader"
import ChartTooltip from "../components/charts/ChartTooltip"
import HetReferenceLine from "../components/charts/HetReferenceLine"
import { withPrevious } from "../lib/chartData"
import { getHet } from "../lib/het"
import { useChartTheme } from "../hooks/useChartTheme"

function formatRupiah(value: number) {
  return `Rp${value.toLocaleString("id-ID")}`
}

export default function CommodityDetail() {
  const chartTheme = useChartTheme()
  const { commodity } = useParams()
  const commodityName = decodeURIComponent(commodity ?? "")

  const [allHarga, setAllHarga] = useState<Harga[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getHarga()
      .then(setAllHarga)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filteredHarga = allHarga.filter(
    (h) => h.komoditas.nama.toLowerCase() === commodityName.toLowerCase()
  )

  const uniqueKomoditas = filteredHarga.length > 0 ? filteredHarga[0].komoditas : null

  const latestPrice = filteredHarga.length > 0
    ? Math.round(filteredHarga.reduce((a, b) => a + b.harga, 0) / filteredHarga.length)
    : 0

  const byPasar = new Map<string, { prices: number[]; nama: string }>()
  for (const h of filteredHarga) {
    const existing = byPasar.get(h.pasar.nama)
    if (existing) {
      existing.prices.push(h.harga)
    } else {
      byPasar.set(h.pasar.nama, { prices: [h.harga], nama: h.pasar.nama })
    }
  }

  const marketPrices = Array.from(byPasar.values()).map((p) => ({
    market: p.nama,
    price: Math.round(p.prices.reduce((a, b) => a + b, 0) / p.prices.length),
  }))

  const dailyPrices = new Map<string, number[]>()
  for (const h of filteredHarga) {
    const key = h.tanggal.split("T")[0]
    const existing = dailyPrices.get(key) || []
    existing.push(h.harga)
    dailyPrices.set(key, existing)
  }

  const chartData = withPrevious(
    Array.from(dailyPrices.entries())
      .sort()
      .map(([tanggal, prices]) => ({
        tanggal,
        harga: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      })),
    "harga",
  )

  const firstPrice = chartData.length > 0 ? chartData[0].harga : latestPrice
  const lastPrice = chartData.length > 0 ? chartData[chartData.length - 1].harga : latestPrice
  const changePercent = firstPrice > 0 ? Math.round(((lastPrice - firstPrice) / firstPrice) * 100 * 10) / 10 : 0

  const kategori = uniqueKomoditas?.kategori || "-"
  const satuan = uniqueKomoditas?.satuan || "-"

  const hetInfo = getHet(commodityName)

  if (!loading && filteredHarga.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF7F7] dark:bg-[#121212]">
        <PageHeader breadcrumb="Monitoring" title="Detail Komoditas" />
        <div className="px-6 py-12 lg:px-8">
        <Link to="/monitoring" className="inline-flex items-center gap-2 text-sm font-semibold text-[#C93742]">
          <ArrowLeft size={16} /> Kembali ke Monitoring
        </Link>
        <div className="mt-8 rounded-2xl border border-[#171717]/5 dark:border-white/10 bg-white dark:bg-[#1E1E1E] p-10 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-[#171717] dark:text-white">Komoditas tidak ditemukan</h1>
          <p className="mt-2 text-sm text-[#171717]/45 dark:text-white/45">Data untuk "{commodityName}" belum tersedia.</p>
        </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF7F7] dark:bg-[#121212]">
      <PageHeader breadcrumb="Monitoring" title="Detail Komoditas" />
      <section className="px-6 pb-8 pt-10 lg:px-8 lg:pt-12">
        <Link to="/monitoring" className="inline-flex items-center gap-2 text-xs font-semibold text-[#171717]/45 dark:text-white/45 transition hover:text-[#C93742]">
          <ArrowLeft size={15} /> Kembali ke Monitoring
        </Link>
        <div className="mt-7 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold text-[#C93742]">Detail Komoditas</p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[#171717] dark:text-white lg:text-5xl">{commodityName}</h1>
            <p className="mt-3 text-sm text-[#171717]/45 dark:text-white/45">Monitoring harga {commodityName.toLowerCase()} di pasar-pasar Kota Surabaya.</p>
          </div>
          <div className="flex w-fit items-center gap-2 rounded-full border border-[#171717]/5 dark:border-white/10 bg-white dark:bg-[#1E1E1E] px-4 py-2.5 text-xs text-[#171717]/45 dark:text-white/45 shadow-sm">
            <CalendarDays size={14} />
            {loading ? "Memuat..." : `${filteredHarga.length} data`}
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-[#C93742]/20 bg-white dark:bg-[#1E1E1E] p-5 shadow-sm">
            <p className="text-xs font-semibold text-[#171717]/55 dark:text-white/55">Harga Rata-rata</p>
            <p className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#C93742]">{formatRupiah(latestPrice)}</p>
            <p className="mt-1 text-[11px] font-semibold text-[#171717]/45 dark:text-white/45">Rata-rata seluruh pasar</p>
          </div>
          <div className={`rounded-2xl border bg-white dark:bg-[#1E1E1E] p-5 shadow-sm ${changePercent >= 0 ? "border-[#C93742]/20" : "border-emerald-500/20"}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-[#171717]/55 dark:text-white/55">Perubahan</p>
                <p className={`mt-3 text-3xl font-black tracking-[-0.04em] ${changePercent >= 0 ? "text-[#C93742]" : "text-emerald-600 dark:text-emerald-400"}`}>
                  {changePercent >= 0 ? "+" : ""}{changePercent}%
                </p>
              </div>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${changePercent >= 0 ? "bg-[#C93742]/10 text-[#C93742]" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"}`}>
                {changePercent >= 0 ? <ArrowUpRight size={17} /> : <ArrowDownRight size={17} />}
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-[#171717]/[0.06] dark:border-white/10 bg-white dark:bg-[#1E1E1E] p-5 shadow-sm">
            <p className="text-xs font-semibold text-[#171717]/55 dark:text-white/55">Kategori</p>
            <p className="mt-3 text-2xl font-black tracking-[-0.04em] text-[#171717] dark:text-white">{kategori}</p>
            <p className="mt-1 text-[11px] font-semibold text-[#171717]/45 dark:text-white/45">Kelompok komoditas</p>
          </div>
          <div className="rounded-2xl border border-[#171717]/[0.06] dark:border-white/10 bg-white dark:bg-[#1E1E1E] p-5 shadow-sm">
            <p className="text-xs font-semibold text-[#171717]/55 dark:text-white/55">Satuan</p>
            <p className="mt-3 text-2xl font-black tracking-[-0.04em] text-[#171717] dark:text-white">{satuan}</p>
            <p className="mt-1 text-[11px] font-semibold text-[#171717]/45 dark:text-white/45">Satuan ukur</p>
          </div>
        </div>
      </section>

      <section className="mx-6 mt-6 overflow-hidden rounded-2xl border border-[#171717]/5 dark:border-white/10 bg-white dark:bg-[#1E1E1E] shadow-sm lg:mx-8">
        <div className="border-b border-[#171717]/5 dark:border-white/10 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#171717]/30 dark:text-white/30">Price history</p>
          <h2 className="mt-1 text-xl font-bold text-[#171717] dark:text-white">Riwayat harga</h2>
          <p className="mt-1 text-sm text-[#171717]/40 dark:text-white/40">Pergerakan harga {commodityName} dalam periode pemantauan.</p>
        </div>
        <div className="p-6 lg:p-8">
          {loading ? (
            <div className="flex h-[280px] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C93742] border-t-transparent" />
            </div>
          ) : (
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="detailGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C93742" stopOpacity={0.16} />
                    <stop offset="100%" stopColor="#C93742" stopOpacity={0} />
                  </linearGradient>
                </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} vertical={false} />
                  <XAxis dataKey="tanggal" tick={{ fontSize: 10, fill: chartTheme.tickColor }} axisLine={false} tickLine={false} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tickFormatter={(value) => `Rp${value / 1000}k`} tick={{ fontSize: 10, fill: chartTheme.tickColor }} axisLine={false} tickLine={false} />
                  <Tooltip content={(props) => <ChartTooltip {...props} valueLabel="Harga" labelFormatter={(v) => `Tanggal ${v}`} het={hetInfo?.harga} hetSatuan={hetInfo?.satuan} />} cursor={{ stroke: chartTheme.axisColor }} />
                  <HetReferenceLine value={hetInfo?.harga} satuan={hetInfo?.satuan} />
                <Area type="monotone" dataKey="harga" stroke="#C93742" strokeWidth={2.5} fill="url(#detailGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          )}
        </div>
      </section>

      <section className="mx-6 mb-8 mt-6 overflow-hidden rounded-2xl border border-[#171717]/5 dark:border-white/10 bg-white dark:bg-[#1E1E1E] shadow-sm lg:mx-8">
        <div className="border-b border-[#171717]/5 dark:border-white/10 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#171717]/30 dark:text-white/30">Market monitoring</p>
          <h2 className="mt-1 text-xl font-bold text-[#171717] dark:text-white">Harga berdasarkan pasar</h2>
          <p className="mt-1 text-sm text-[#171717]/40 dark:text-white/40">Perbandingan harga {commodityName} pada beberapa pasar yang dipantau.</p>
        </div>
        <div className="divide-y divide-[#171717]/5 dark:divide-white/10">
          {loading ? (
            <div className="p-8 text-center">
              <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[#C93742] border-t-transparent" />
            </div>
          ) : marketPrices.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#171717]/40 dark:text-white/40">Tidak ada data harga per pasar</div>
          ) : (
            marketPrices.map((market) => (
              <div key={market.market} className="flex flex-col gap-4 px-6 py-5 transition hover:bg-[#FAF7F7] dark:hover:bg-white/5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C93742]/10 text-[#C93742]"><Store size={17} /></div>
                  <div>
                    <p className="text-sm font-bold text-[#171717] dark:text-white">{market.market}</p>
                    <p className="mt-0.5 text-xs text-[#171717]/35 dark:text-white/35">Pasar amatan Surabaya</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div>
                    <p className="text-xs text-[#171717]/35 dark:text-white/35">Harga</p>
                    <p className="mt-1 text-sm font-bold text-[#171717] dark:text-white">{formatRupiah(market.price)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <div className="mx-6 mb-8 border-t border-[#171717]/5 dark:border-white/10 pt-5 text-[11px] text-[#171717]/30 dark:text-white/30 lg:mx-8">
        SIMONPEDIA Bapok Surabaya
      </div>
    </div>
  )
}
