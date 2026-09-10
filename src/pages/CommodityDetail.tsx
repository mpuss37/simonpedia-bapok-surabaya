import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Store
} from "lucide-react"

import { Link, useParams } from "react-router-dom"


const commodities = [
  {
    name: "Beras Premium",
    category: "Beras",
    price: 16000,
    change: 2.4,
    status: "Naik",
  },
  {
    name: "Beras Medium",
    category: "Beras",
    price: 14500,
    change: -1.2,
    status: "Turun",
  },
  {
    name: "Cabai Merah",
    category: "Bumbu",
    price: 68000,
    change: 8.4,
    status: "Waspada",
  },
  {
    name: "Cabai Rawit",
    category: "Bumbu",
    price: 62000,
    change: 6.8,
    status: "Siaga",
  },
  {
    name: "Bawang Merah",
    category: "Bumbu",
    price: 42000,
    change: 5.2,
    status: "Siaga",
  },
  {
    name: "Bawang Putih",
    category: "Bumbu",
    price: 39000,
    change: -2.1,
    status: "Turun",
  },
  {
    name: "Gula Pasir",
    category: "Sembako",
    price: 18500,
    change: 0.8,
    status: "Stabil",
  },
  {
    name: "Minyak Goreng",
    category: "Sembako",
    price: 19000,
    change: 1.2,
    status: "Naik",
  },
]


const marketPrices = [
  {
    market: "Pasar Genteng Baru",
    price: 67500,
    change: 5.2,
  },
  {
    market: "Pasar Keputran Selatan",
    price: 68000,
    change: 8.4,
  },
  {
    market: "Pasar Pabean",
    price: 66500,
    change: 4.8,
  },
  {
    market: "Pasar Asem Rowo",
    price: 69000,
    change: 9.1,
  },
]


function formatRupiah(value: number) {
  return `Rp${value.toLocaleString("id-ID")}`
}


export default function CommodityDetail() {

  const { commodity } = useParams()

  const commodityName = decodeURIComponent(
    commodity ?? ""
  )


  const item = commodities.find(
    (data) =>
      data.name.toLowerCase() ===
      commodityName.toLowerCase()
  )


  // Kalau komoditas tidak ditemukan
  if (!item) {

    return (

      <div className="min-h-screen bg-[#FAF7F7] px-6 py-12 lg:px-8">

        <Link
          to="/monitoring"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#C93742]"
        >
          <ArrowLeft size={16} />
          Kembali ke Monitoring
        </Link>


        <div className="mt-8 rounded-2xl border border-[#171717]/5 bg-white p-10 text-center shadow-sm">

          <h1 className="text-2xl font-bold text-[#171717]">
            Komoditas tidak ditemukan
          </h1>

          <p className="mt-2 text-sm text-[#171717]/45">
            Data untuk "{commodityName}" belum tersedia.
          </p>

        </div>

      </div>

    )
  }


  return (

    <div className="min-h-screen bg-[#FAF7F7]">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="px-6 pb-8 pt-10 lg:px-8 lg:pt-12">

        <Link
          to="/monitoring"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#171717]/45 transition hover:text-[#C93742]"
        >
          <ArrowLeft size={15} />
          Kembali ke Monitoring
        </Link>


        <div className="mt-7 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">

          <div>

            <p className="text-sm font-semibold text-[#C93742]">
              Detail Komoditas
            </p>

            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[#171717] lg:text-5xl">
              {item.name}
            </h1>

            <p className="mt-3 text-sm text-[#171717]/45">
              Monitoring harga {item.name.toLowerCase()}
              {" "}di pasar-pasar Kota Surabaya.
            </p>

          </div>


          <div className="flex w-fit items-center gap-2 rounded-full border border-[#171717]/5 bg-white px-4 py-2.5 text-xs text-[#171717]/45 shadow-sm">

            <CalendarDays size={14} />

            Update terakhir

            <span className="font-semibold text-[#171717]/65">
              07 Agustus 2026
            </span>

          </div>

        </div>

      </section>


      {/* =================================================
          SUMMARY
      ================================================= */}

      <section className="px-6 lg:px-8">

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">


          {/* HARGA */}

          <div className="rounded-2xl border border-[#171717]/5 bg-white p-5 shadow-sm">

            <p className="text-xs font-medium text-[#171717]/40">
              Harga Hari Ini
            </p>

            <p className="mt-3 text-2xl font-extrabold tracking-tight text-[#171717]">
              {formatRupiah(item.price)}
            </p>

            <p className="mt-1 text-[11px] text-[#171717]/35">
              Harga rata-rata
            </p>

          </div>


          {/* PERUBAHAN */}

          <div className="rounded-2xl border border-[#171717]/5 bg-white p-5 shadow-sm">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-xs font-medium text-[#171717]/40">
                  Perubahan
                </p>

                <p
                  className={`mt-3 text-2xl font-extrabold ${
                    item.change >= 0
                      ? "text-[#C93742]"
                      : "text-emerald-600"
                  }`}
                >
                  {item.change >= 0 ? "+" : ""}
                  {item.change}%
                </p>

              </div>

              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  item.change >= 0
                    ? "bg-[#FFF0F1] text-[#C93742]"
                    : "bg-emerald-50 text-emerald-600"
                }`}
              >

                {item.change >= 0 ? (
                  <ArrowUpRight size={17} />
                ) : (
                  <ArrowDownRight size={17} />
                )}

              </div>

            </div>

          </div>


          {/* KATEGORI */}

          <div className="rounded-2xl border border-[#171717]/5 bg-white p-5 shadow-sm">

            <p className="text-xs font-medium text-[#171717]/40">
              Kategori
            </p>

            <p className="mt-3 text-xl font-extrabold text-[#171717]">
              {item.category}
            </p>

            <p className="mt-1 text-[11px] text-[#171717]/35">
              Kelompok komoditas
            </p>

          </div>


          {/* STATUS */}

          <div className="rounded-2xl border border-[#171717]/5 bg-white p-5 shadow-sm">

            <p className="text-xs font-medium text-[#171717]/40">
              Status
            </p>

            <span
              className={`mt-3 inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${
                item.status === "Waspada"
                  ? "bg-[#FFE5E7] text-[#C93742]"
                  : item.status === "Siaga"
                    ? "bg-amber-50 text-amber-600"
                    : item.status === "Turun"
                      ? "bg-emerald-50 text-emerald-600"
                      : item.status === "Naik"
                        ? "bg-[#FFF0F1] text-[#C93742]"
                        : "bg-slate-100 text-slate-500"
              }`}
            >
              {item.status}
            </span>

            <p className="mt-2 text-[11px] text-[#171717]/35">
              Kondisi harga saat ini
            </p>

          </div>

        </div>

      </section>


      {/* =================================================
          CHART
      ================================================= */}

      <section className="mx-6 mt-6 rounded-2xl border border-[#171717]/5 bg-white shadow-sm lg:mx-8">

        <div className="border-b border-[#171717]/5 p-6">

          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#171717]/30">
            Price history
          </p>

          <h2 className="mt-1 text-xl font-bold text-[#171717]">
            Riwayat harga
          </h2>

          <p className="mt-1 text-sm text-[#171717]/40">
            Pergerakan harga {item.name} dalam 30 hari terakhir.
          </p>

        </div>


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


            {/* CHART */}

            <svg
              viewBox="0 0 900 250"
              className="absolute inset-0 h-full w-full"
              preserveAspectRatio="none"
            >

              <defs>

                <linearGradient
                  id="detailGradient"
                  x1="0"
                  x2="0"
                  y1="0"
                  y2="1"
                >

                  <stop
                    offset="0%"
                    stopColor="#C93742"
                    stopOpacity="0.16"
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
                  M0 185
                  C80 175 120 160 180 170
                  S280 145 340 155
                  S440 125 500 140
                  S600 105 660 115
                  S780 80 900 50
                  L900 250
                  L0 250
                  Z
                "
                fill="url(#detailGradient)"
              />


              <path
                d="
                  M0 185
                  C80 175 120 160 180 170
                  S280 145 340 155
                  S440 125 500 140
                  S600 105 660 115
                  S780 80 900 50
                "
                fill="none"
                stroke="#C93742"
                strokeWidth="4"
                strokeLinecap="round"
              />

            </svg>

          </div>


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
          MARKET PRICES
      ================================================= */}

      <section className="mx-6 mb-8 mt-6 overflow-hidden rounded-2xl border border-[#171717]/5 bg-white shadow-sm lg:mx-8">

        <div className="border-b border-[#171717]/5 p-6">

          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#171717]/30">
            Market monitoring
          </p>

          <h2 className="mt-1 text-xl font-bold text-[#171717]">
            Harga berdasarkan pasar
          </h2>

          <p className="mt-1 text-sm text-[#171717]/40">
            Perbandingan harga {item.name} pada beberapa
            pasar yang dipantau.
          </p>

        </div>


        <div className="divide-y divide-[#171717]/5">

          {marketPrices.map((market) => (

            <div
              key={market.market}
              className="flex flex-col gap-4 px-6 py-5 transition hover:bg-[#FAF7F7] sm:flex-row sm:items-center sm:justify-between"
            >

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C93742]/10 text-[#C93742]">
                  <Store size={17} />
                </div>

                <div>

                  <p className="text-sm font-bold text-[#171717]">
                    {market.market}
                  </p>

                  <p className="mt-0.5 text-xs text-[#171717]/35">
                    Pasar amatan Surabaya
                  </p>

                </div>

              </div>


              <div className="flex items-center gap-8">

                <div>

                  <p className="text-xs text-[#171717]/35">
                    Harga
                  </p>

                  <p className="mt-1 text-sm font-bold text-[#171717]">
                    {formatRupiah(market.price)}
                  </p>

                </div>


                <div>

                  <p className="text-xs text-[#171717]/35">
                    Perubahan
                  </p>

                  <p className="mt-1 flex items-center gap-1 text-xs font-bold text-[#C93742]">

                    <ArrowUpRight size={14} />

                    +{market.change}%

                  </p>

                </div>

              </div>

            </div>

          ))}

        </div>

      </section>


      {/* =================================================
          FOOTER
      ================================================= */}

      <div className="mx-6 mb-8 border-t border-[#171717]/5 pt-5 text-[11px] text-[#171717]/30 lg:mx-8">

        SIMONPEDIA Bapok Surabaya

      </div>

    </div>
  )
}