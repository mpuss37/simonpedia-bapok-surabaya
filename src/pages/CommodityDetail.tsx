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

function formatRupiah(value: number) {
  return `Rp${value.toLocaleString("id-ID")}`
}

export default function CommodityDetail() {
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

  const chartData = Array.from(dailyPrices.entries())
    .sort()
    .map(([tanggal, prices]) => ({
      tanggal,
      harga: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
    }))

  const firstPrice = chartData.length > 0 ? chartData[0].harga : latestPrice
  const lastPrice = chartData.length > 0 ? chartData[chartData.length - 1].harga : latestPrice
  const changePercent = firstPrice > 0 ? Math.round(((lastPrice - firstPrice) / firstPrice) * 100 * 10) / 10 : 0

  const kategori = uniqueKomoditas?.kategori || "-"
  const satuan = uniqueKomoditas?.satuan || "-"

  if (!loading && filteredHarga.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF7F7] px-6 py-12 lg:px-8">
        <Link to="/monitoring" className="inline-flex items-center gap-2 text-sm font-semibold text-[#C93742]">
          <ArrowLeft size={16} /> Kembali ke Monitoring
        </Link>
        <div className="mt-8 rounded-2xl border border-[#171717]/5 bg-white p-10 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-[#171717]">Komoditas tidak ditemukan</h1>
          <p className="mt-2 text-sm text-[#171717]/45">Data untuk "{commodityName}" belum tersedia.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF7F7]">
      <section className="px-6 pb-8 pt-10 lg:px-8 lg:pt-12">
        <Link to="/monitoring" className="inline-flex items-center gap-2 text-xs font-semibold text-[#171717]/45 transition hover:text-[#C93742]">
          <ArrowLeft size={15} /> Kembali ke Monitoring
        </Link>
        <div className="mt-7 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold text-[#C93742]">Detail Komoditas</p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[#171717] lg:text-5xl">{commodityName}</h1>
            <p className="mt-3 text-sm text-[#171717]/45">Monitoring harga {commodityName.toLowerCase()} di pasar-pasar Kota Surabaya.</p>
          </div>
          <div className="flex w-fit items-center gap-2 rounded-full border border-[#171717]/5 bg-white px-4 py-2.5 text-xs text-[#171717]/45 shadow-sm">
            <CalendarDays size={14} />
            {loading ? "Memuat..." : `${filteredHarga.length} data`}
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-[#171717]/5 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-[#171717]/40">Harga Rata-rata</p>
            <p className="mt-3 text-2xl font-extrabold tracking-tight text-[#171717]">{formatRupiah(latestPrice)}</p>
            <p className="mt-1 text-[11px] text-[#171717]/35">Rata-rata seluruh pasar</p>
          </div>
          <div className="rounded-2xl border border-[#171717]/5 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-[#171717]/40">Perubahan</p>
                <p className={`mt-3 text-2xl font-extrabold ${changePercent >= 0 ? "text-[#C93742]" : "text-emerald-600"}`}>
                  {changePercent >= 0 ? "+" : ""}{changePercent}%
                </p>
              </div>
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${changePercent >= 0 ? "bg-[#FFF0F1] text-[#C93742]" : "bg-emerald-50 text-emerald-600"}`}>
                {changePercent >= 0 ? <ArrowUpRight size={17} /> : <ArrowDownRight size={17} />}
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-[#171717]/5 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-[#171717]/40">Kategori</p>
            <p className="mt-3 text-xl font-extrabold text-[#171717]">{kategori}</p>
            <p className="mt-1 text-[11px] text-[#171717]/35">Kelompok komoditas</p>
          </div>
          <div className="rounded-2xl border border-[#171717]/5 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-[#171717]/40">Satuan</p>
            <p className="mt-3 text-xl font-extrabold text-[#171717]">{satuan}</p>
            <p className="mt-1 text-[11px] text-[#171717]/35">Satuan ukur</p>
          </div>
        </div>
      </section>

      <section className="mx-6 mt-6 overflow-hidden rounded-2xl border border-[#171717]/5 bg-white shadow-sm lg:mx-8">
        <div className="border-b border-[#171717]/5 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#171717]/30">Price history</p>
          <h2 className="mt-1 text-xl font-bold text-[#171717]">Riwayat harga</h2>
          <p className="mt-1 text-sm text-[#171717]/40">Pergerakan harga {commodityName} dalam periode pemantauan.</p>
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
                <CartesianGrid strokeDasharray="3 3" stroke="#171717" strokeOpacity={0.06} vertical={false} />
                <XAxis dataKey="tanggal" tick={{ fontSize: 10, fill: "#171717", opacity: 0.4 }} axisLine={false} tickLine={false} tickFormatter={(v) => v.slice(5)} />
                <YAxis tickFormatter={(value) => `Rp${value / 1000}k`} tick={{ fontSize: 10, fill: "#171717", opacity: 0.4 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => typeof value === "number" ? [`Rp${value.toLocaleString("id-ID")}`, "Harga"] : ["-", "Harga"]} contentStyle={{ borderRadius: 12, border: "1px solid rgba(23,23,23,0.06)", fontSize: 11 }} />
                <Area type="monotone" dataKey="harga" stroke="#C93742" strokeWidth={2.5} fill="url(#detailGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          )}
        </div>
      </section>

      <section className="mx-6 mb-8 mt-6 overflow-hidden rounded-2xl border border-[#171717]/5 bg-white shadow-sm lg:mx-8">
        <div className="border-b border-[#171717]/5 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#171717]/30">Market monitoring</p>
          <h2 className="mt-1 text-xl font-bold text-[#171717]">Harga berdasarkan pasar</h2>
          <p className="mt-1 text-sm text-[#171717]/40">Perbandingan harga {commodityName} pada beberapa pasar yang dipantau.</p>
        </div>
        <div className="divide-y divide-[#171717]/5">
          {loading ? (
            <div className="p-8 text-center">
              <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[#C93742] border-t-transparent" />
            </div>
          ) : marketPrices.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#171717]/40">Tidak ada data harga per pasar</div>
          ) : (
            marketPrices.map((market) => (
              <div key={market.market} className="flex flex-col gap-4 px-6 py-5 transition hover:bg-[#FAF7F7] sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C93742]/10 text-[#C93742]"><Store size={17} /></div>
                  <div>
                    <p className="text-sm font-bold text-[#171717]">{market.market}</p>
                    <p className="mt-0.5 text-xs text-[#171717]/35">Pasar amatan Surabaya</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div>
                    <p className="text-xs text-[#171717]/35">Harga</p>
                    <p className="mt-1 text-sm font-bold text-[#171717]">{formatRupiah(market.price)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <div className="mx-6 mb-8 border-t border-[#171717]/5 pt-5 text-[11px] text-[#171717]/30 lg:mx-8">
        SIMONPEDIA Bapok Surabaya
      </div>
    </div>
  )
}
