import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Info,
  ShieldAlert,
  TrendingUp
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

import { useState } from "react"


/* =========================================================
   DUMMY DATA
========================================================= */

const priceData = [
  { day: "04 Agu", price: 61000 },
  { day: "05 Agu", price: 62500 },
  { day: "06 Agu", price: 63200 },
  { day: "07 Agu", price: 64800 },
  { day: "08 Agu", price: 66000 },
  { day: "09 Agu", price: 67400 },
  { day: "10 Agu", price: 68000 },
]


const alerts = [
  {
    id: 1,
    commodity: "Cabai Merah",
    market: "Pasar Wonokromo",
    change: "+10,2%",
    status: "Waspada",
    time: "12 menit lalu",
  },
  {
    id: 2,
    commodity: "Bawang Merah",
    market: "Pasar Genteng",
    change: "+8,7%",
    status: "Siaga",
    time: "27 menit lalu",
  },
  {
    id: 3,
    commodity: "Beras Premium",
    market: "Pasar Pucang",
    change: "+6,1%",
    status: "Siaga",
    time: "43 menit lalu",
  },
]


const commodities = [
  {
    name: "Cabai Merah",
    price: "Rp68.000",
    change: "+10,2%",
    status: "Waspada",
  },
  {
    name: "Bawang Merah",
    price: "Rp42.000",
    change: "+8,7%",
    status: "Siaga",
  },
  {
    name: "Beras Premium",
    price: "Rp16.500",
    change: "+6,1%",
    status: "Siaga",
  },
  {
    name: "Minyak Goreng",
    price: "Rp19.000",
    change: "+2,4%",
    status: "Normal",
  },
]


/* =========================================================
   MAIN PAGE
========================================================= */

export default function EWS() {

  const [selectedCommodity, setSelectedCommodity] =
    useState("Cabai Merah")


  return (

    <div className="min-h-screen">


      {/* =====================================================
          TOPBAR
      ===================================================== */}

      <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[#171717]/[0.06] bg-[#FFF8F9]/90 px-6 backdrop-blur-xl lg:px-10">

        <div>

          <p className="text-xs font-medium text-[#171717]/40">
            SIMONPEDIA / Sistem / EWS
          </p>

          <h1 className="mt-0.5 text-lg font-bold tracking-tight text-[#171717]">
            Early Warning System
          </h1>

        </div>


        <div className="flex items-center gap-2 text-xs text-[#171717]/40">

          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />

          Monitoring aktif

        </div>

      </header>


      {/* =====================================================
          CONTENT
      ===================================================== */}

      <main className="px-6 py-8 lg:px-10 lg:py-10">


        {/* ===================================================
            HEADER
        =================================================== */}

        <section className="mb-7">


          <p className="mb-2 text-sm font-semibold text-[#C93742]">
            Early Warning System
          </p>


          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">


            <div>

              <h2 className="text-3xl font-black tracking-[-0.04em] text-[#171717] lg:text-4xl">

                Deteksi risiko harga

                <br />

                <span className="text-[#C93742]">
                  sebelum menjadi krisis.
                </span>

              </h2>


              <p className="mt-3 max-w-xl text-sm leading-6 text-[#171717]/45">

                Sistem memantau perubahan harga bahan pokok
                dan memberikan peringatan ketika kondisi pasar
                menunjukkan potensi risiko.

              </p>

            </div>


            <div className="flex items-center gap-2 rounded-xl border border-emerald-200/50 bg-emerald-50 px-4 py-3">

              <CheckCircle2
                size={16}
                className="text-emerald-600"
              />

              <div>

                <p className="text-[10px] font-bold text-emerald-700">
                  SISTEM AKTIF
                </p>

                <p className="text-[10px] text-emerald-600/70">
                  Monitoring berjalan normal
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            STATUS OVERVIEW
        ===================================================== */}

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">


          <StatusCard
            status="Normal"
            count="17"
            description="komoditas"
            type="normal"
          />


          <StatusCard
            status="Siaga"
            count="5"
            description="komoditas"
            type="siaga"
          />


          <StatusCard
            status="Waspada"
            count="2"
            description="komoditas"
            type="waspada"
          />


          <StatusCard
            status="Kritis"
            count="0"
            description="komoditas"
            type="kritis"
          />

        </section>


        {/* =====================================================
            ALERT BANNER
        ===================================================== */}

        <section className="mt-6 overflow-hidden rounded-[24px] border border-[#C93742]/10 bg-[#FFF3F4]">

          <div className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between">


            <div className="flex items-start gap-4">


              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#C93742] text-white">

                <ShieldAlert size={20} />

              </div>


              <div>

                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#C93742]">
                  Alert aktif
                </p>


                <h3 className="mt-1 text-base font-bold text-[#171717]">
                  Terdapat 2 kondisi yang perlu diperhatikan
                </h3>


                <p className="mt-1 max-w-2xl text-xs leading-5 text-[#171717]/45">

                  Cabai merah mengalami kenaikan harga
                  signifikan pada beberapa pasar di Surabaya.

                </p>

              </div>

            </div>


            <button className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#C93742] px-4 py-3 text-xs font-bold text-white">

              Lihat semua alert

              <ChevronRight size={14} />

            </button>

          </div>

        </section>


        {/* =====================================================
            MAIN GRID
        ===================================================== */}

        <section className="mt-6 grid gap-5 xl:grid-cols-[1fr_340px]">


          {/* ===================================================
              CHART
          =================================================== */}

          <div className="rounded-[24px] border border-[#171717]/[0.06] bg-white p-5 lg:p-6">


            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">


              <div>

                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#171717]/30">
                  Price anomaly
                </p>


                <h3 className="mt-1 text-base font-bold text-[#171717]">
                  Perubahan harga
                </h3>

              </div>


              <select
                value={selectedCommodity}
                onChange={(event) =>
                  setSelectedCommodity(
                    event.target.value
                  )
                }
                className="h-10 rounded-xl border border-[#171717]/[0.07] bg-[#FFF8F9] px-3 text-xs font-semibold text-[#171717]/60 outline-none"
              >

                {commodities.map((commodity) => (

                  <option
                    key={commodity.name}
                  >
                    {commodity.name}
                  </option>

                ))}

              </select>

            </div>


            <div className="h-[320px]">


              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <AreaChart
                  data={priceData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: -15,
                    bottom: 0,
                  }}
                >

                  <defs>

                    <linearGradient
                      id="ewsGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="0%"
                        stopColor="#C93742"
                        stopOpacity={0.18}
                      />

                      <stop
                        offset="100%"
                        stopColor="#C93742"
                        stopOpacity={0}
                      />

                    </linearGradient>

                  </defs>


                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#171717"
                    strokeOpacity={0.06}
                    vertical={false}
                  />


                  <XAxis
                    dataKey="day"
                    tick={{
                      fontSize: 10,
                      fill: "#171717",
                      opacity: 0.4,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />


                  <YAxis
                    tickFormatter={(value) =>
                      `Rp${value / 1000}k`
                    }
                    tick={{
                      fontSize: 10,
                      fill: "#171717",
                      opacity: 0.4,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />


                  <Tooltip
                    formatter={(value) =>
                      typeof value === "number"
                        ? [
                            `Rp${value.toLocaleString(
                              "id-ID"
                            )}`,
                            "Harga",
                          ]
                        : ["-", "Harga"]
                    }
                    contentStyle={{
                      borderRadius: 12,
                      border:
                        "1px solid rgba(23,23,23,0.06)",
                      fontSize: 11,
                    }}
                  />


                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#C93742"
                    strokeWidth={2.5}
                    fill="url(#ewsGradient)"
                  />

                </AreaChart>

              </ResponsiveContainer>

            </div>


            {/* TREND */}

            <div className="mt-4 flex items-center justify-between rounded-xl bg-[#FFF8F9] p-4">


              <div className="flex items-center gap-3">

                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFF0F1] text-[#C93742]">

                  <TrendingUp size={16} />

                </span>


                <div>

                  <p className="text-[10px] text-[#171717]/35">
                    Perubahan 7 hari
                  </p>

                  <p className="text-sm font-bold text-[#C93742]">
                    +11,5%
                  </p>

                </div>

              </div>


              <p className="max-w-[220px] text-right text-[10px] leading-4 text-[#171717]/35">

                Melebihi threshold normal
                dan perlu dipantau.

              </p>

            </div>

          </div>


          {/* ===================================================
              ALERT LIST
          =================================================== */}

          <aside className="rounded-[24px] border border-[#171717]/[0.06] bg-white p-5">


            <div className="mb-5 flex items-center justify-between">

              <div>

                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#171717]/30">
                  Live alerts
                </p>

                <h3 className="mt-1 text-base font-bold text-[#171717]">
                  Alert terbaru
                </h3>

              </div>


              <Bell
                size={17}
                className="text-[#C93742]"
              />

            </div>


            <div className="space-y-2">


              {alerts.map((alert) => (

                <div
                  key={alert.id}
                  className="rounded-2xl border border-[#171717]/[0.05] p-4"
                >


                  <div className="flex items-start justify-between gap-3">


                    <div>

                      <p className="text-xs font-bold text-[#171717]">
                        {alert.commodity}
                      </p>

                      <p className="mt-1 text-[10px] text-[#171717]/35">
                        {alert.market}
                      </p>

                    </div>


                    <StatusBadge
                      status={alert.status}
                    />

                  </div>


                  <div className="mt-4 flex items-end justify-between">


                    <div>

                      <p className="text-[10px] text-[#171717]/30">
                        Perubahan harga
                      </p>

                      <p className="mt-1 text-sm font-black text-[#C93742]">
                        {alert.change}
                      </p>

                    </div>


                    <div className="flex items-center gap-1 text-[10px] text-[#171717]/30">

                      <Clock3 size={11} />

                      {alert.time}

                    </div>

                  </div>

                </div>

              ))}

            </div>

          </aside>

        </section>


        {/* =====================================================
            COMMODITY STATUS
        ===================================================== */}

        <section className="mt-6 rounded-[24px] border border-[#171717]/[0.06] bg-white p-5 lg:p-6">


          <div className="mb-5 flex items-center justify-between">

            <div>

              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#171717]/30">
                Commodity risk
              </p>

              <h3 className="mt-1 text-base font-bold text-[#171717]">
                Status komoditas
              </h3>

            </div>


            <button className="text-xs font-semibold text-[#C93742]">
              Lihat semua
            </button>

          </div>


          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">


            {commodities.map((commodity) => (

              <div
                key={commodity.name}
                className="rounded-2xl border border-[#171717]/[0.05] p-4"
              >


                <div className="flex items-start justify-between">


                  <div>

                    <p className="text-xs font-bold text-[#171717]">
                      {commodity.name}
                    </p>

                    <p className="mt-1 text-[10px] text-[#171717]/30">
                      Harga rata-rata
                    </p>

                  </div>


                  <StatusBadge
                    status={commodity.status}
                  />

                </div>


                <div className="mt-5 flex items-end justify-between">


                  <p className="text-lg font-black tracking-[-0.03em] text-[#171717]">
                    {commodity.price}
                  </p>


                  <p
                    className={`text-xs font-bold ${
                      commodity.change.startsWith("+")
                        ? "text-[#C93742]"
                        : "text-emerald-600"
                    }`}
                  >
                    {commodity.change}
                  </p>

                </div>

              </div>

            ))}

          </div>

        </section>


        {/* =====================================================
            RISK FACTORS
        ===================================================== */}

        <section className="mt-6 grid gap-5 lg:grid-cols-2">


          {/* FACTORS */}

          <div className="rounded-[24px] border border-[#171717]/[0.06] bg-white p-6">


            <div className="mb-5">

              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#171717]/30">
                Risk detection
              </p>

              <h3 className="mt-1 text-base font-bold text-[#171717]">
                Faktor pemicu
              </h3>

            </div>


            <div className="space-y-4">


              <RiskFactor
                title="Kenaikan harga"
                value="+10,2%"
                level="Tinggi"
                danger
                width="82%"
              />


              <RiskFactor
                title="Volatilitas"
                value="7,8%"
                level="Sedang"
                warning
                width="57%"
              />


              <RiskFactor
                title="Ketersediaan"
                value="-8,4%"
                level="Sedang"
                warning
                width="61%"
              />


              <RiskFactor
                title="Distribusi"
                value="Normal"
                level="Rendah"
                width="31%"
              />

            </div>

          </div>


          {/* RECOMMENDATION PREVIEW */}

          <div className="rounded-[24px] border border-[#171717]/[0.06] bg-white p-6">


            <div className="flex items-center gap-3">

              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF3F4] text-[#C93742]">

                <Info size={18} />

              </span>


              <div>

                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#171717]/30">
                  Recommended action
                </p>

                <h3 className="mt-1 text-base font-bold text-[#171717]">
                  Tindakan yang disarankan
                </h3>

              </div>

            </div>


            <div className="mt-5 space-y-3">


              <Recommendation
                number="01"
                text="Pantau harga cabai merah pada pasar dengan kenaikan tertinggi."
              />


              <Recommendation
                number="02"
                text="Periksa ketersediaan stok pada distributor utama."
              />


              <Recommendation
                number="03"
                text="Evaluasi potensi intervensi apabila tren terus meningkat."
              />

            </div>


            <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#C93742]/15 bg-[#FFF8F9] px-4 py-3 text-xs font-bold text-[#C93742]">

              Buka rekomendasi lengkap

              <ChevronRight size={14} />

            </button>

          </div>

        </section>


        {/* =====================================================
            FOOTER
        ===================================================== */}

        <div className="mt-8 border-t border-[#171717]/[0.06] pt-5 text-[11px] text-[#171717]/30">

          SIMONPEDIA Bapok Surabaya

        </div>

      </main>

    </div>
  )
}


/* =========================================================
   STATUS CARD
========================================================= */

function StatusCard({
  status,
  count,
  description,
  type,
}: {
  status: string
  count: string
  description: string
  type: "normal" | "siaga" | "waspada" | "kritis"
}) {

  const styles = {
    normal: "bg-emerald-50 border-emerald-200/40 text-emerald-600",
    siaga: "bg-amber-50 border-amber-200/40 text-amber-600",
    waspada: "bg-[#FFF0F1] border-[#C93742]/10 text-[#C93742]",
    kritis: "bg-[#171717] border-[#171717] text-white",
  }


  return (

    <div
      className={`rounded-[20px] border p-5 ${styles[type]}`}
    >

      <div className="flex items-center justify-between">

        <p className="text-xs font-semibold opacity-70">
          {status}
        </p>


        {type === "normal" && (
          <CheckCircle2 size={16} />
        )}

        {type === "siaga" && (
          <Info size={16} />
        )}

        {type === "waspada" && (
          <AlertTriangle size={16} />
        )}

        {type === "kritis" && (
          <ShieldAlert size={16} />
        )}

      </div>


      <p className="mt-3 text-2xl font-black">
        {count}
      </p>


      <p className="mt-1 text-[10px] opacity-50">
        {description}
      </p>

    </div>
  )
}


/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  status,
}: {
  status: string
}) {

  const style =
    status === "Waspada"
      ? "bg-[#FFF0F1] text-[#C93742]"
      : status === "Siaga"
        ? "bg-amber-50 text-amber-600"
        : status === "Kritis"
          ? "bg-[#171717] text-white"
          : "bg-emerald-50 text-emerald-600"


  return (

    <span
      className={`rounded-full px-2 py-1 text-[9px] font-bold ${style}`}
    >
      {status}
    </span>
  )
}


/* =========================================================
   RISK FACTOR
========================================================= */

function RiskFactor({
  title,
  value,
  level,
  width,
  danger = false,
  warning = false,
}: {
  title: string
  value: string
  level: string
  width: string
  danger?: boolean
  warning?: boolean
}) {

  return (

    <div>

      <div className="mb-2 flex items-center justify-between">

        <div>

          <p className="text-xs font-semibold text-[#171717]/65">
            {title}
          </p>

          <p className="mt-0.5 text-[10px] text-[#171717]/30">
            Level risiko: {level}
          </p>

        </div>


        <span
          className={`text-xs font-bold ${
            danger
              ? "text-[#C93742]"
              : warning
                ? "text-amber-600"
                : "text-emerald-600"
          }`}
        >
          {value}
        </span>

      </div>


      <div className="h-1.5 overflow-hidden rounded-full bg-[#171717]/[0.05]">

        <div
          className={`h-full rounded-full ${
            danger
              ? "bg-[#C93742]"
              : warning
                ? "bg-amber-500"
                : "bg-emerald-500"
          }`}
          style={{
            width,
          }}
        />

      </div>

    </div>
  )
}


/* =========================================================
   RECOMMENDATION
========================================================= */

function Recommendation({
  number,
  text,
}: {
  number: string
  text: string
}) {

  return (

    <div className="flex gap-3 rounded-xl bg-[#FFF8F9] p-3">


      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-[9px] font-black text-[#C93742]">

        {number}

      </span>


      <p className="text-xs leading-5 text-[#171717]/55">
        {text}
      </p>

    </div>
  )
}