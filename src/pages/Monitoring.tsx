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
import { getHarga, type Harga } from "../services/priceService"
import PageHeader from "../components/layout/PageHeader"


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

  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("Semua Kategori")
  const [period, setPeriod] = useState("30 Hari")
  const [data, setData] = useState<Harga[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const harga = await getHarga()
        setData(harga)
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
    const grouped = new Map<string, { name: string; category: string; prices: number[] }>()

    for (const item of data) {
      const existing = grouped.get(item.komoditas.nama)
      if (existing) {
        existing.prices.push(item.harga)
      } else {
        grouped.set(item.komoditas.nama, {
          name: item.komoditas.nama,
          category: item.komoditas.kategori,
          prices: [item.harga],
        })
      }
    }

    return Array.from(grouped.values()).map((item) => ({
      name: item.name,
      category: item.category,
      price: Math.round(item.prices.reduce((a, b) => a + b, 0) / item.prices.length),
      change: Math.round((Math.random() * 20 - 10) * 10) / 10,
      status: "Stabil",
    }))
  }, [data])


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


  return (

    <div className="min-h-screen bg-[#FAF7F7]">

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

            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[#171717] lg:text-5xl">
              Monitoring Harga
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-[#171717]/50">
              Pantau harga bahan pokok di berbagai pasar
              Kota Surabaya dan lihat perubahan harga
              dari waktu ke waktu.
            </p>

          </div>


          {/* LAST UPDATE */}

          <div className="flex w-fit items-center gap-2 rounded-full border border-[#171717]/5 bg-white px-4 py-2.5 text-xs text-[#171717]/45 shadow-sm">

            <span className="h-2 w-2 rounded-full bg-emerald-500" />

            Update terakhir

            <span className="font-semibold text-[#171717]/65">
              {new Date().toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>

          </div>

        </div>

      </section>

      {/* LOADING / ERROR */}
      {loading && (
        <div className="px-6 lg:px-8">
          <div className="rounded-2xl border border-[#171717]/5 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#C93742] border-t-transparent" />
            <p className="mt-4 text-sm text-[#171717]/40">Memuat data dari server...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="px-6 lg:px-8">
          <div className="rounded-2xl border border-[#FFE5E7] bg-[#FFF0F1] p-6 text-center">
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
          />

        </div>

      </section>


      {/* =================================================
          PRICE TREND
      ================================================= */}

      <section className="mx-6 mt-6 rounded-2xl border border-[#171717]/5 bg-white shadow-sm lg:mx-8">

        <div className="border-b border-[#171717]/5 p-6">

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">

            <div>

              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#171717]/30">
                Price trend
              </p>

              <h2 className="mt-1 text-xl font-bold text-[#171717]">
                Tren harga bahan pokok
              </h2>

              <p className="mt-1 text-sm text-[#171717]/40">
                Pergerakan harga rata-rata dalam periode
                terakhir.
              </p>

            </div>


            {/* PERIOD */}

            <div className="flex rounded-xl bg-[#FAF7F7] p-1">

              {["7 Hari", "30 Hari", "3 Bulan", "6 Bulan"].map(
                (item) => (

                  <button
                    key={item}
                    onClick={() => setPeriod(item)}
                    className={`rounded-lg px-3 py-2 text-[11px] font-semibold transition ${
                      period === item
                        ? "bg-white text-[#C93742] shadow-sm"
                        : "text-[#171717]/35 hover:text-[#171717]/60"
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

          <div className="relative h-[280px]">

            {/* GRID */}

            <div className="absolute inset-0 flex flex-col justify-between">

              {[1, 2, 3, 4, 5].map((line) => (

                <div
                  key={line}
                  className="border-t border-dashed border-[#171717]/[0.06]"
                />

              ))}

            </div>


            {/* SVG */}

            <svg
              viewBox="0 0 900 250"
              className="absolute inset-0 h-full w-full"
              preserveAspectRatio="none"
            >

              <defs>

                <linearGradient
                  id="areaGradient"
                  x1="0"
                  x2="0"
                  y1="0"
                  y2="1"
                >

                  <stop
                    offset="0%"
                    stopColor="#C93742"
                    stopOpacity="0.15"
                  />

                  <stop
                    offset="100%"
                    stopColor="#C93742"
                    stopOpacity="0"
                  />

                </linearGradient>

              </defs>


              <path
                d="
                  M0 190
                  C70 180 80 145 145 155
                  S220 180 275 125
                  S360 110 410 140
                  S500 180 550 105
                  S630 125 690 75
                  S790 95 900 45
                  L900 250
                  L0 250
                  Z
                "
                fill="url(#areaGradient)"
              />


              <path
                d="
                  M0 190
                  C70 180 80 145 145 155
                  S220 180 275 125
                  S360 110 410 140
                  S500 180 550 105
                  S630 125 690 75
                  S790 95 900 45
                "
                fill="none"
                stroke="#C93742"
                strokeWidth="4"
                strokeLinecap="round"
              />

            </svg>

          </div>


          {/* DATE */}

          <div className="mt-4 flex justify-between text-[10px] font-medium text-[#171717]/25">

            <span>08 Jul</span>
            <span>15 Jul</span>
            <span>22 Jul</span>
            <span>29 Jul</span>
            <span>07 Aug</span>

          </div>

        </div>

      </section>


      {/* =================================================
          FILTER
      ================================================= */}

      <section className="mx-6 mt-6 rounded-2xl border border-[#171717]/5 bg-white p-4 shadow-sm lg:mx-8">

        <div className="flex flex-col gap-3 lg:flex-row">

          {/* SEARCH */}

          <div className="relative flex-1">

            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#171717]/30"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Cari nama komoditas..."
              className="h-11 w-full rounded-xl border border-[#171717]/10 bg-[#FAF7F7] pl-11 pr-4 text-sm text-[#171717] outline-none transition placeholder:text-[#171717]/30 focus:border-[#C93742]/40 focus:ring-2 focus:ring-[#C93742]/10"
            />

          </div>


          {/* CATEGORY */}

          <div className="relative">

            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
              className="h-11 w-full appearance-none rounded-xl border border-[#171717]/10 bg-[#FAF7F7] px-4 pr-10 text-sm text-[#171717]/60 outline-none transition focus:border-[#C93742]/40 lg:w-[200px]"
            >

              <option>
                Semua Kategori
              </option>

              <option>
                Pangan Pokok
              </option>

              <option>
                Bumbu Dapur
              </option>

            </select>


            <ChevronDown
              size={15}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#171717]/30"
            />

          </div>

        </div>

      </section>

      {/* =================================================
          TABLE
      ================================================= */}

      <section className="mx-6 mt-6 overflow-hidden rounded-2xl border border-[#171717]/5 bg-white shadow-sm lg:mx-8">

        {/* TABLE HEADER */}

        <div className="flex flex-col justify-between gap-3 border-b border-[#171717]/5 p-6 sm:flex-row sm:items-center">

          <div>

            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#171717]/30">
              Price monitoring
            </p>

            <h2 className="mt-1 text-xl font-bold text-[#171717]">
              Daftar harga komoditas
            </h2>

          </div>


          <p className="text-xs text-[#171717]/35">

            Menampilkan{" "}

            <span className="font-semibold text-[#171717]/60">
              {filteredCommodities.length}
            </span>

            {" "}komoditas

          </p>

        </div>


        {/* TABLE */}

        <div className="overflow-x-auto">

          <table className="w-full min-w-[850px]">

            <thead>

              <tr className="border-b border-[#171717]/5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-[#171717]/30">

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
                  className="group border-b border-[#171717]/[0.04] transition hover:bg-[#FAF7F7]"
                >

                  {/* COMMODITY */}

                  <td className="px-6 py-4">

                    <p className="text-sm font-bold text-[#171717]">
                      {item.name}
                    </p>

                    <p className="mt-0.5 text-[11px] text-[#171717]/35">
                      Harga rata-rata
                    </p>

                  </td>


                  {/* CATEGORY */}

                  <td className="px-4 py-4">

                    <span className="rounded-lg bg-[#FAF7F7] px-2.5 py-1 text-[11px] font-medium text-[#171717]/50">
                      {item.category}
                    </span>

                  </td>


                  {/* PRICE */}

                  <td className="px-4 py-4">

                    <span className="text-sm font-bold text-[#171717]">
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
                            ? "text-emerald-600"
                            : "text-[#171717]/40"
                      }`}
                    >

                      {item.change > 0 ? (
                        <ArrowUpRight size={14} />
                      ) : item.change < 0 ? (
                        <ArrowDownRight size={14} />
                      ) : null}

                      {Math.abs(item.change)}%

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

                    <button
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#171717]/25 transition hover:bg-[#FFF0F1] hover:text-[#C93742]"
                    >

                      <ChevronRight size={16} />

                    </button>

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

                    <p className="text-sm font-semibold text-[#171717]/50">
                      Komoditas tidak ditemukan
                    </p>

                    <p className="mt-1 text-xs text-[#171717]/30">
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

      <div className="mx-6 mb-8 mt-8 border-t border-[#171717]/5 pt-5 text-[11px] text-[#171717]/30 lg:mx-8">

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
  variant?: "danger" | "success"
}) {

  return (

    <div className="rounded-2xl border border-[#171717]/5 bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between gap-3">

        <div>

          <p className="text-xs font-medium text-[#171717]/40">
            {label}
          </p>

          <p className="mt-3 text-2xl font-extrabold tracking-tight text-[#171717]">
            {value}
          </p>

          <p className="mt-1 text-[11px] text-[#171717]/35">
            {description}
          </p>

        </div>


        {icon && (

          <span
            className={`flex h-9 w-9 items-center justify-center rounded-xl ${
              variant === "danger"
                ? "bg-[#FFF0F1] text-[#C93742]"
                : "bg-emerald-50 text-emerald-600"
            }`}
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
      "bg-emerald-50 text-emerald-600",

    Stabil:
      "bg-slate-100 text-slate-500",

    Naik:
      "bg-[#FFF0F1] text-[#C93742]",

    Turun:
      "bg-emerald-50 text-emerald-600",

    Siaga:
      "bg-amber-50 text-amber-600",

    Waspada:
      "bg-[#FFE5E7] text-[#C93742]",
  }


  return (

    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${
        styles[status] ??
        "bg-slate-100 text-slate-500"
      }`}
    >
      {status}
    </span>

  )
}
