import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  Search,
  TrendingDown,
  TrendingUp
} from "lucide-react"

import React, { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { API_URL } from "../services/api"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { getRingkasanHarga, type RingkasanHarga } from "../services/priceService"
import PageHeader from "../components/layout/PageHeader"
import ChartTooltip from "../components/charts/ChartTooltip"
import { withPrevious } from "../lib/chartData"
import { useChartTheme } from "../hooks/useChartTheme"


// =====================================================
// HELPERS
// =====================================================

function formatRupiah(value: number) {
  return `Rp${value.toLocaleString("id-ID")}`
}


// =====================================================
// PAGE
// =====================================================

export default function Monitoring() {

  const chartTheme = useChartTheme()

  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("Semua Kategori")
  const [period, setPeriod] = useState("30 Hari")
  const [ringkasan, setRingkasan] = useState<RingkasanHarga[]>([])
  const [trenData, setTrenData] = useState<{ tanggal: string; harga: number }[]>([])
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getRingkasanHarga()
        setRingkasan(res.data)
        setLastUpdate(res.lastUpdate)

        // Ambil tren agregat: rata-rata harian seluruh komoditas (untuk grafik).
        // Pakai komoditas dengan perubahan terbesar sebagai contoh tren nasional.
        const top = res.data
          .slice()
          .sort((a, b) => Math.abs(b.persenPerubahan) - Math.abs(a.persenPerubahan))[0]
        if (top) {
          const chartRes = await fetch(
            `${API_URL}/ews/chart/${top.id}`
          )
          if (chartRes.ok) {
            const chartJson = await chartRes.json()
            setTrenData(chartJson)
          }
        }
      } catch (err) {
        setError("Gagal memuat data dari server")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const commodities = useMemo(() => {
    return ringkasan.map((item) => ({
      name: item.nama,
      category: item.kategori,
      price: item.hargaRataRata,
      change: item.persenPerubahan,
      status: item.status,
    }))
  }, [ringkasan])


  const filteredCommodities = useMemo(() => {

    return commodities.filter((item) => {

      const matchSearch =
        item.name
          .toLowerCase()
          .includes(search.toLowerCase())

      const matchCategory =
        category === "Semua Kategori" ||
        item.category === category

      return matchSearch && matchCategory
    })

  }, [search, category, commodities])


  const averagePrice =
    commodities.length > 0
      ? commodities.reduce(
          (total, item) => total + item.price,
          0
        ) / commodities.length
      : 0


  const risingCount =
    commodities.filter(
      (item) => item.change > 0
    ).length


  const fallingCount =
    commodities.filter(
      (item) => item.change < 0
    ).length


  const stableCount =
    commodities.filter(
      (item) => item.change === 0
    ).length

  // Filter tren sesuai periode yang dipilih (7 Hari / 30 Hari / 3 Bulan / 6 Bulan)
  const chartTren = useMemo(() => {
    const hariMap: Record<string, number> = {
      "7 Hari": 7,
      "30 Hari": 30,
      "3 Bulan": 90,
      "6 Bulan": 180,
    }
    const n = hariMap[period] ?? 30
    return withPrevious(trenData.slice(-n), "harga")
  }, [trenData, period])


  return (

    <div className="min-h-screen bg-[#FAF7F7] dark:bg-[#121212]">

      <PageHeader breadcrumb="Monitoring" title="Monitoring Harga" />

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <section className="px-6 pb-8 pt-10 lg:px-8 lg:pt-12">

        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">

          <div>

            <p className="text-sm font-semibold text-[#C93742]">
              Monitoring bahan pokok
            </p>

            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[#171717] dark:text-white lg:text-5xl">
              Monitoring Harga
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-[#171717]/50 dark:text-white/50">
              Pantau harga bahan pokok di berbagai pasar
              Kota Surabaya dan lihat perubahan harga
              dari waktu ke waktu.
            </p>

          </div>


          {/* LAST UPDATE */}

          <div className="flex w-fit items-center gap-2 rounded-full border border-[#171717]/5 dark:border-white/10 bg-white dark:bg-[#1E1E1E] px-4 py-2.5 text-xs text-[#171717]/45 dark:text-white/45 shadow-sm">

            <span className="h-2 w-2 rounded-full bg-emerald-500" />

            Update terakhir

            <span className="font-semibold text-[#171717]/65 dark:text-white/65">
              {lastUpdate
                ? new Date(lastUpdate).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "—"}
            </span>

          </div>

        </div>

      </section>

      {/* LOADING / ERROR */}
      {loading && (
        <div className="px-6 lg:px-8">
          <div className="rounded-2xl border border-[#171717]/5 dark:border-white/10 bg-white dark:bg-[#1E1E1E] p-12 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#C93742] border-t-transparent" />
            <p className="mt-4 text-sm text-[#171717]/40 dark:text-white/40">Memuat data dari server...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="px-6 lg:px-8">
          <div className="rounded-2xl border border-[#FFE5E7] bg-[#FFF0F1] dark:bg-white/[0.04] p-6 text-center">
            <p className="text-sm font-semibold text-[#C93742]">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && (


      <>
      {/* =================================================
          KPI
      ================================================= */}

      <section className="px-6 lg:px-8">

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <MetricCard
            label="Rata-rata Harga"
            value={formatRupiah(
              Math.round(averagePrice)
            )}
            description="seluruh komoditas"
          />

          <MetricCard
            label="Harga Naik"
            value={String(risingCount)}
            description="komoditas"
            icon={<TrendingUp size={17} />}
            variant="danger"
          />

          <MetricCard
            label="Harga Turun"
            value={String(fallingCount)}
            description="komoditas"
            icon={<TrendingDown size={17} />}
            variant="success"
          />

          <MetricCard
            label="Harga Stabil"
            value={String(stableCount)}
            description="komoditas"
            variant="warning"
          />

        </div>

      </section>


      {/* =================================================
          PRICE TREND
      ================================================= */}

      <section className="mx-6 mt-6 rounded-2xl border border-[#171717]/5 dark:border-white/10 bg-white dark:bg-[#1E1E1E] shadow-sm lg:mx-8">

        <div className="border-b border-[#171717]/5 dark:border-white/10 p-6">

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">

            <div>

              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#171717]/30 dark:text-white/30">
                Price trend
              </p>

              <h2 className="mt-1 text-xl font-bold text-[#171717] dark:text-white">
                Tren harga bahan pokok
              </h2>

              <p className="mt-1 text-sm text-[#171717]/40 dark:text-white/40">
                Pergerakan harga rata-rata dalam periode
                terakhir.
              </p>

            </div>


            {/* PERIOD */}

            <div className="flex rounded-xl bg-[#FAF7F7] dark:bg-[#121212] p-1">

              {["7 Hari", "30 Hari", "3 Bulan", "6 Bulan"].map(
                (item) => (

                  <button
                    key={item}
                    onClick={() => setPeriod(item)}
                    className={`rounded-lg px-3 py-2 text-[11px] font-semibold transition ${
                      period === item
                        ? "bg-white dark:bg-[#1E1E1E] text-[#C93742] shadow-sm"
                        : "text-[#171717]/35 dark:text-white/35 hover:text-[#171717]/60 dark:hover:text-white/60"
                    }`}
                  >
                    {item}
                  </button>

                )
              )}

            </div>

          </div>

        </div>


        {/* CHART */}

        <div className="p-6 lg:p-8">

          {chartTren.length === 0 ? (

            <div className="flex h-[280px] items-center justify-center text-sm text-[#171717]/40 dark:text-white/40">
              Memuat grafik tren...
            </div>

          ) : (

            <div className="h-[280px]">

              <ResponsiveContainer width="100%" height="100%">

                <AreaChart data={chartTren} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>

                  <defs>

                    <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">

                      <stop offset="0%" stopColor="#C93742" stopOpacity={0.2} />

                      <stop offset="100%" stopColor="#C93742" stopOpacity={0} />

                    </linearGradient>

                  </defs>

                  <XAxis
                    dataKey="tanggal"
                    tickFormatter={(v: string) => v.slice(5)}
                    tick={{ fontSize: 10, fill: chartTheme.tickColor }}
                    axisLine={false}
                    tickLine={false}
                    minTickGap={40}
                  />

                  <YAxis
                    tickFormatter={(v: number) => `Rp${Math.round(v / 1000)}k`}
                    tick={{ fontSize: 10, fill: chartTheme.tickColor }}
                    axisLine={false}
                    tickLine={false}
                    width={60}
                  />

                  <Tooltip
                    content={
                      <ChartTooltip
                        valueLabel="Harga"
                        labelFormatter={(v) => `Tanggal ${v}`}
                      />
                    }
                    cursor={{ stroke: chartTheme.axisColor }}
                  />

                  <Area
                    type="monotone"
                    dataKey="harga"
                    stroke="#C93742"
                    strokeWidth={2.5}
                    fill="url(#areaGradient)"
                  />

                </AreaChart>

              </ResponsiveContainer>

            </div>

          )}

        </div>

      </section>


      {/* =================================================
          FILTER
      ================================================= */}

      <section className="mx-6 mt-6 rounded-2xl border border-[#171717]/5 dark:border-white/10 bg-white dark:bg-[#1E1E1E] p-4 shadow-sm lg:mx-8">

        <div className="flex flex-col gap-3 lg:flex-row">

          {/* SEARCH */}

          <div className="relative flex-1">

            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#171717]/30 dark:text-white/30"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Cari nama komoditas..."
              className="h-11 w-full rounded-xl border border-[#171717]/10 dark:border-white/10 bg-[#FAF7F7] dark:bg-[#121212] pl-11 pr-4 text-sm text-[#171717] dark:text-white outline-none transition placeholder:text-[#171717]/30 dark:placeholder:text-white/30 focus:border-[#C93742]/40 focus:ring-2 focus:ring-[#C93742]/10"
            />

          </div>


          {/* CATEGORY */}

          <div className="relative">

            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
              className="h-11 w-full appearance-none rounded-xl border border-[#171717]/10 dark:border-white/10 bg-[#FAF7F7] dark:bg-[#121212] px-4 pr-10 text-sm text-[#171717]/60 dark:text-white/60 outline-none transition focus:border-[#C93742]/40 lg:w-[200px]"
            >

              <option value="Semua Kategori">
                Semua Kategori
              </option>

              {Array.from(new Set(commodities.map((c) => c.category))).sort().map((kat) => (
                <option key={kat} value={kat}>
                  {kat}
                </option>
              ))}

            </select>


            <ChevronDown
              size={15}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#171717]/30 dark:text-white/30"
            />

          </div>

        </div>

      </section>

      {/* =================================================
          TABLE
      ================================================= */}

      <section className="mx-6 mt-6 overflow-hidden rounded-2xl border border-[#171717]/5 dark:border-white/10 bg-white dark:bg-[#1E1E1E] shadow-sm lg:mx-8">

        {/* TABLE HEADER */}

        <div className="flex flex-col justify-between gap-3 border-b border-[#171717]/5 dark:border-white/10 p-6 sm:flex-row sm:items-center">

          <div>

            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#171717]/30 dark:text-white/30">
              Price monitoring
            </p>

            <h2 className="mt-1 text-xl font-bold text-[#171717] dark:text-white">
              Daftar harga komoditas
            </h2>

          </div>


          <p className="text-xs text-[#171717]/35 dark:text-white/35">

            Menampilkan{" "}

            <span className="font-semibold text-[#171717]/60 dark:text-white/60">
              {filteredCommodities.length}
            </span>

            {" "}komoditas

          </p>

        </div>


        {/* TABLE */}

        <div className="overflow-x-auto">

          <table className="w-full min-w-[850px]">

            <thead>

              <tr className="border-b border-[#171717]/5 dark:border-white/10 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-[#171717]/30 dark:text-white/30">

                <th className="px-6 py-4">
                  Komoditas
                </th>

                <th className="px-4 py-4">
                  Kategori
                </th>

                <th className="px-4 py-4">
                  Harga Hari Ini
                </th>

                <th className="px-4 py-4">
                  Perubahan
                </th>

                <th className="px-4 py-4">
                  Status
                </th>

                <th className="px-6 py-4 text-right">
                  Detail
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredCommodities.map((item) => (

                <tr
                  key={item.name}
                  className="group border-b border-[#171717]/[0.04] dark:border-white/10 transition hover:bg-[#FAF7F7] dark:hover:bg-white/5"
                >

                  {/* COMMODITY */}

                  <td className="px-6 py-4">

                    <p className="text-sm font-bold text-[#171717] dark:text-white">
                      {item.name}
                    </p>

                    <p className="mt-0.5 text-[11px] text-[#171717]/35 dark:text-white/35">
                      Harga rata-rata
                    </p>

                  </td>


                  {/* CATEGORY */}

                  <td className="px-4 py-4">

                    <span className="rounded-lg bg-[#FAF7F7] dark:bg-[#121212] px-2.5 py-1 text-[11px] font-medium text-[#171717]/50 dark:text-white/50">
                      {item.category}
                    </span>

                  </td>


                  {/* PRICE */}

                  <td className="px-4 py-4">

                    <span className="text-sm font-bold text-[#171717] dark:text-white">
                      {formatRupiah(item.price)}
                    </span>

                  </td>


                  {/* CHANGE */}

                  <td className="px-4 py-4">

                    <span
                      className={`inline-flex items-center gap-1 text-xs font-bold ${
                        item.change > 0
                          ? "text-[#C93742]"
                          : item.change < 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-[#171717]/40 dark:text-white/40"
                      }`}
                    >

                      {item.change > 0 ? (
                        <ArrowUpRight size={14} />
                      ) : item.change < 0 ? (
                        <ArrowDownRight size={14} />
                      ) : null}

                      {item.change > 0 ? "+" : ""}{item.change}%

                    </span>

                  </td>


                  {/* STATUS */}

                  <td className="px-4 py-4">

                    <StatusBadge
                      status={item.status}
                    />

                  </td>


                  {/* DETAIL */}

                  <td className="px-6 py-4 text-right">

                    <Link
                      to={`/monitoring/${encodeURIComponent(item.name)}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#171717]/25 dark:text-white/25 transition hover:bg-[#FFF0F1] dark:hover:bg-white/10 hover:text-[#C93742]"
                    >

                      <ChevronRight size={16} />

                    </Link>

                  </td>

                </tr>

              ))}


              {/* EMPTY */}

              {filteredCommodities.length === 0 && (

                <tr>

                  <td
                    colSpan={6}
                    className="px-6 py-16 text-center"
                  >

                    <p className="text-sm font-semibold text-[#171717]/50 dark:text-white/50">
                      Komoditas tidak ditemukan
                    </p>

                    <p className="mt-1 text-xs text-[#171717]/30 dark:text-white/30">
                      Coba gunakan kata pencarian lain.
                    </p>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </section>


      {/* =================================================
          FOOTER
      ================================================= */}

      <div className="mx-6 mb-8 mt-8 border-t border-[#171717]/5 dark:border-white/10 pt-5 text-[11px] text-[#171717]/30 dark:text-white/30 lg:mx-8">

        SIMONPEDIA Bapok Surabaya

      </div>
      </>
      )}

    </div>
  )
}


// =====================================================
// METRIC CARD
// =====================================================

function MetricCard({
  label,
  value,
  description,
  icon,
  variant,
}: {
  label: string
  value: string
  description: string
  icon?: React.ReactNode
  variant?: "danger" | "success" | "warning"
}) {

  const isDanger = variant === "danger"
  const isSuccess = variant === "success"
  const isWarning = variant === "warning"

  const accent = isDanger
    ? "text-[#C93742]"
    : isSuccess
      ? "text-emerald-600 dark:text-emerald-400"
      : isWarning
        ? "text-amber-600 dark:text-amber-300"
        : "text-[#171717] dark:text-white"

  const badge = isDanger
    ? "bg-[#C93742]/10 text-[#C93742]"
    : isSuccess
      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      : isWarning
        ? "bg-amber-500/10 text-amber-600 dark:text-amber-300"
        : "bg-[#171717]/[0.05] text-[#171717]/60 dark:bg-white/10 dark:text-white/70"

  const ring = isDanger
    ? "border-[#C93742]/20"
    : isSuccess
      ? "border-emerald-500/20"
      : isWarning
        ? "border-amber-500/30"
        : "border-[#171717]/[0.06] dark:border-white/10"

  return (

    <div className={`rounded-2xl border bg-white dark:bg-[#1E1E1E] p-5 shadow-sm ${ring}`}>

      <div className="flex items-start justify-between gap-3">

        <div>

          <p className="text-xs font-semibold text-[#171717]/55 dark:text-white/55">
            {label}
          </p>

          <p className={`mt-3 text-3xl font-black tracking-[-0.04em] ${accent}`}>
            {value}
          </p>

          <p className="mt-1 text-[11px] font-semibold text-[#171717]/45 dark:text-white/45">
            {description}
          </p>

        </div>


        {icon && (

          <span
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${badge}`}
          >
            {icon}
          </span>

        )}

      </div>

    </div>

  )
}


// =====================================================
// STATUS BADGE
// =====================================================

function StatusBadge({
  status,
}: {
  status: string
}) {

  const styles: Record<string, string> = {

    Normal:
      "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",

    Stabil:
      "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/50",

    Naik:
      "bg-[#FFF0F1] dark:bg-white/[0.04] text-[#C93742]",

    Turun:
      "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",

    Siaga:
      "bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-300",

    Waspada:
      "bg-[#FFE5E7] text-[#C93742]",
  }


  return (

    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${
        styles[status] ??
        "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/50"
      }`}
    >
      {status}
    </span>

  )
}
