import {
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Info,
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
   DUMMY FORECAST DATA
========================================================= */

const forecastData = [
  {
    day: "Hari ini",
    actual: 68000,
    prediction: 68000,
  },
  {
    day: "10 Agu",
    actual: 68500,
    prediction: 69200,
  },
  {
    day: "11 Agu",
    actual: 69100,
    prediction: 70100,
  },
  {
    day: "12 Agu",
    actual: 70400,
    prediction: 71200,
  },
  {
    day: "13 Agu",
    actual: 71600,
    prediction: 72400,
  },
  {
    day: "14 Agu",
    actual: 72100,
    prediction: 73500,
  },
  {
    day: "15 Agu",
    actual: 72900,
    prediction: 74800,
  },
  {
    day: "16 Agu",
    actual: null,
    prediction: 75900,
  },
  {
    day: "17 Agu",
    actual: null,
    prediction: 76800,
  },
  {
    day: "18 Agu",
    actual: null,
    prediction: 77400,
  },
]


/* =========================================================
   COMMODITIES
========================================================= */

const commodities = [
  "Cabai Merah",
  "Beras Premium",
  "Bawang Merah",
  "Gula Pasir",
  "Minyak Goreng",
]


/* =========================================================
   MAIN PAGE
========================================================= */

export default function Prediction() {

  const [commodity, setCommodity] =
    useState("Cabai Merah")

  const [period, setPeriod] =
    useState("7 Hari")


  return (

    <div className="min-h-screen">


      {/* =====================================================
          TOPBAR
      ===================================================== */}

      <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[#171717]/[0.06] bg-[#FFF8F9]/90 px-6 backdrop-blur-xl lg:px-10">

        <div>

          <p className="text-xs font-medium text-[#171717]/40">
            SIMONPEDIA / Analitik / Prediksi
          </p>

          <h1 className="mt-0.5 text-lg font-bold tracking-tight text-[#171717]">
            Prediksi Harga
          </h1>

        </div>


        <div className="flex items-center gap-2 text-xs text-[#171717]/40">

          <span className="h-2 w-2 rounded-full bg-emerald-500" />

          Model diperbarui hari ini

        </div>

      </header>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="px-6 py-8 lg:px-10 lg:py-10">


        {/* ===================================================
            PAGE HEADER
        =================================================== */}

        <section className="mb-7">


          <p className="mb-2 text-sm font-semibold text-[#C93742]">
            Forecasting & analytics
          </p>


          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">


            <div>

              <h2 className="text-3xl font-black tracking-[-0.04em] text-[#171717] lg:text-4xl">

                Prediksi harga

                <br />

                <span className="text-[#C93742]">
                  komoditas pangan.
                </span>

              </h2>


              <p className="mt-3 max-w-xl text-sm leading-6 text-[#171717]/45">

                Gunakan hasil prediksi untuk mengantisipasi
                perubahan harga bahan pokok di Kota Surabaya.

              </p>

            </div>


            {/* FILTER */}

            <div className="flex flex-wrap gap-2">


              <select
                value={commodity}
                onChange={(event) =>
                  setCommodity(event.target.value)
                }
                className="h-11 rounded-xl border border-[#171717]/[0.07] bg-white px-4 text-xs font-semibold text-[#171717]/60 outline-none"
              >

                {commodities.map((item) => (

                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>

                ))}

              </select>


              <select
                value={period}
                onChange={(event) =>
                  setPeriod(event.target.value)
                }
                className="h-11 rounded-xl border border-[#171717]/[0.07] bg-white px-4 text-xs font-semibold text-[#171717]/60 outline-none"
              >

                <option>7 Hari</option>
                <option>14 Hari</option>
                <option>30 Hari</option>

              </select>

            </div>

          </div>

        </section>


        {/* =====================================================
            KPI CARDS
        ===================================================== */}

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">


          <PredictionMetric
            label="Harga Saat Ini"
            value="Rp68.000"
            description="/ kg"
          />


          <PredictionMetric
            label="Prediksi H+7"
            value="Rp74.800"
            description="/ kg"
            danger
          />


          <PredictionMetric
            label="Perubahan"
            value="+10,0%"
            description="7 hari"
            danger
          />


          <PredictionMetric
            label="Confidence"
            value="91,4%"
            description="tingkat keyakinan"
            success
          />

        </section>


        {/* =====================================================
            MAIN GRID
        ===================================================== */}

        <section className="mt-6 grid gap-5 xl:grid-cols-[1fr_340px]">


          {/* ===================================================
              CHART
          =================================================== */}

          <div className="rounded-[24px] border border-[#171717]/[0.06] bg-white p-5 lg:p-6">


            <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">


              <div>

                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#171717]/30">
                  Forecast chart
                </p>

                <h3 className="mt-1 text-base font-bold text-[#171717]">
                  Pergerakan harga {commodity}
                </h3>

              </div>


              <div className="flex items-center gap-4">


                <ChartLegend
                  label="Aktual"
                  type="actual"
                />

                <ChartLegend
                  label="Prediksi"
                  type="prediction"
                />

              </div>

            </div>


            {/* CHART */}

            <div className="h-[360px] w-full">


              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <AreaChart
                  data={forecastData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: -15,
                    bottom: 0,
                  }}
                >


                  <defs>

                    <linearGradient
                      id="predictionGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="0%"
                        stopColor="#C93742"
                        stopOpacity={0.20}
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
                    formatter={(value) => {

                      if (
                        typeof value !== "number"
                      ) {
                        return ["-", ""]
                      }

                      return [
                        `Rp${value.toLocaleString(
                          "id-ID"
                        )}`,
                        "",
                      ]

                    }}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid rgba(23,23,23,0.06)",
                      boxShadow:
                        "0 10px 30px rgba(0,0,0,0.08)",
                      fontSize: 11,
                    }}
                  />


                  {/* ACTUAL */}

                  <Area
                    type="monotone"
                    dataKey="actual"
                    stroke="#171717"
                    strokeWidth={2}
                    fill="none"
                    connectNulls={false}
                  />


                  {/* PREDICTION */}

                  <Area
                    type="monotone"
                    dataKey="prediction"
                    stroke="#C93742"
                    strokeWidth={2.5}
                    fill="url(#predictionGradient)"
                    strokeDasharray="6 4"
                  />


                </AreaChart>

              </ResponsiveContainer>

            </div>


            {/* CHART FOOTER */}

            <div className="mt-4 flex items-center justify-between border-t border-[#171717]/[0.06] pt-4">

              <p className="text-[10px] text-[#171717]/35">

                Data historis 30 hari terakhir

              </p>

              <p className="text-[10px] font-medium text-[#171717]/40">

                Model: Time Series Forecasting

              </p>

            </div>

          </div>


          {/* ===================================================
              FORECAST SUMMARY
          =================================================== */}

          <aside className="rounded-[24px] border border-[#171717]/[0.06] bg-white p-5">


            <div className="mb-5">

              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#171717]/30">
                Forecast
              </p>

              <h3 className="mt-1 text-base font-bold text-[#171717]">
                Ringkasan prediksi
              </h3>

            </div>


            {/* STATUS */}

            <div className="rounded-2xl bg-[#FFF3F4] p-5">


              <div className="flex items-start gap-3">

                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#C93742]">

                  <TrendingUp size={17} />

                </span>


                <div>

                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#C93742]">
                    Tren meningkat
                  </p>

                  <p className="mt-1 text-sm font-bold text-[#171717]">
                    Harga berpotensi naik
                  </p>

                </div>

              </div>


              <p className="mt-4 text-xs leading-5 text-[#171717]/50">

                Model memperkirakan harga {commodity.toLowerCase()}
                akan mengalami kenaikan dalam 7 hari ke depan.

              </p>

            </div>


            {/* FORECAST LIST */}

            <div className="mt-6">


              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#171717]/30">
                Prediksi harian
              </p>


              <div className="space-y-1">


                {forecastData
                  .filter((item) => item.actual === null)
                  .slice(0, 5)
                  .map((item, index) => (

                    <div
                      key={item.day}
                      className="flex items-center justify-between rounded-xl p-3 hover:bg-[#FFF8F9]"
                    >


                      <div className="flex items-center gap-3">

                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFF8F9]">

                          <CalendarDays
                            size={14}
                            className="text-[#C93742]"
                          />

                        </div>


                        <div>

                          <p className="text-xs font-semibold text-[#171717]">
                            {item.day}
                          </p>

                          <p className="text-[10px] text-[#171717]/30">
                            H+{index + 7}
                          </p>

                        </div>

                      </div>


                      <div className="text-right">

                        <p className="text-xs font-bold text-[#171717]">

                          Rp
                          {item.prediction.toLocaleString(
                            "id-ID"
                          )}

                        </p>


                        <p className="text-[10px] font-semibold text-[#C93742]">

                          ↑

                        </p>

                      </div>

                    </div>

                  ))}

              </div>

            </div>


          </aside>

        </section>


        {/* =====================================================
            ANALYSIS SECTION
        ===================================================== */}

        <section className="mt-6 grid gap-5 lg:grid-cols-2">


          {/* FACTORS */}

          <div className="rounded-[24px] border border-[#171717]/[0.06] bg-white p-6">


            <div className="mb-5">

              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#171717]/30">
                Model analysis
              </p>

              <h3 className="mt-1 text-base font-bold text-[#171717]">
                Faktor yang memengaruhi prediksi
              </h3>

            </div>


            <div className="space-y-4">


              <Factor
                label="Tren harga 7 hari"
                value="+8,4%"
                positive
                width="78%"
              />


              <Factor
                label="Volume transaksi"
                value="+5,2%"
                positive
                width="61%"
              />


              <Factor
                label="Volatilitas"
                value="Sedang"
                width="47%"
              />


              <Factor
                label="Ketersediaan komoditas"
                value="Menurun"
                negative
                width="68%"
              />

            </div>

          </div>


          {/* INSIGHT */}

          <div className="rounded-[24px] border border-[#171717]/[0.06] bg-white p-6">


            <div className="mb-5 flex items-center gap-3">

              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF3F4] text-[#C93742]">

                <Info size={18} />

              </span>


              <div>

                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#171717]/30">
                  Prediction insight
                </p>

                <h3 className="mt-1 text-base font-bold text-[#171717]">
                  Apa yang perlu diperhatikan?
                </h3>

              </div>

            </div>


            <div className="space-y-3">


              <InsightItem
                icon={
                  <ArrowUpRight size={15} />
                }
                title="Harga berpotensi meningkat"
                description="Kenaikan diperkirakan mencapai 10% dalam 7 hari."
                danger
              />


              <InsightItem
                icon={
                  <AlertTriangle size={15} />
                }
                title="Perlu pemantauan"
                description="Volatilitas harga berada pada tingkat sedang."
              />


              <InsightItem
                icon={
                  <CheckCircle2 size={15} />
                }
                title="Confidence cukup tinggi"
                description="Model memiliki tingkat keyakinan sebesar 91,4%."
                success
              />

            </div>


            <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#C93742] px-4 py-3 text-xs font-bold text-white transition hover:bg-[#B52F39]">

              Lihat analisis lengkap

              <ArrowUpRight size={14} />

            </button>

          </div>

        </section>


        {/* =====================================================
            DISCLAIMER
        ===================================================== */}

        <div className="mt-6 rounded-2xl border border-[#171717]/[0.06] bg-white px-5 py-4">

          <div className="flex items-start gap-3">

            <Info
              size={15}
              className="mt-0.5 shrink-0 text-[#171717]/30"
            />

            <p className="text-[10px] leading-5 text-[#171717]/35">

              Prediksi merupakan estimasi berdasarkan data historis
              dan faktor yang tersedia pada sistem. Hasil prediksi
              dapat berubah apabila terdapat perubahan kondisi pasar
              yang signifikan.

            </p>

          </div>

        </div>


        {/* FOOTER */}

        <div className="mt-8 border-t border-[#171717]/[0.06] pt-5 text-[11px] text-[#171717]/30">

          SIMONPEDIA Bapok Surabaya

        </div>

      </main>

    </div>
  )
}


/* =========================================================
   PREDICTION METRIC
========================================================= */

function PredictionMetric({
  label,
  value,
  description,
  danger = false,
  success = false,
}: {
  label: string
  value: string
  description: string
  danger?: boolean
  success?: boolean
}) {

  return (

    <div
      className={`rounded-[20px] border p-5 ${
        danger
          ? "border-[#C93742]/10 bg-[#FFF3F4]"
          : success
            ? "border-emerald-200/40 bg-emerald-50/40"
            : "border-[#171717]/[0.06] bg-white"
      }`}
    >

      <p className="text-xs font-medium text-[#171717]/40">
        {label}
      </p>


      <p className="mt-2 text-2xl font-black tracking-[-0.04em] text-[#171717]">
        {value}
      </p>


      <p className="mt-1 text-[11px] text-[#171717]/35">
        {description}
      </p>

    </div>
  )
}


/* =========================================================
   CHART LEGEND
========================================================= */

function ChartLegend({
  label,
  type,
}: {
  label: string
  type: "actual" | "prediction"
}) {

  return (

    <div className="flex items-center gap-2">

      <span
        className={`h-2 w-5 rounded-full ${
          type === "actual"
            ? "bg-[#171717]"
            : "bg-[#C93742]"
        }`}
      />

      <span className="text-[10px] font-medium text-[#171717]/40">
        {label}
      </span>

    </div>
  )
}


/* =========================================================
   FACTOR
========================================================= */

function Factor({
  label,
  value,
  width,
  positive = false,
  negative = false,
}: {
  label: string
  value: string
  width: string
  positive?: boolean
  negative?: boolean
}) {

  return (

    <div>


      <div className="mb-2 flex items-center justify-between">

        <p className="text-xs font-medium text-[#171717]/60">
          {label}
        </p>


        <span
          className={`text-xs font-bold ${
            negative
              ? "text-[#C93742]"
              : positive
                ? "text-emerald-600"
                : "text-[#171717]/50"
          }`}
        >
          {value}
        </span>

      </div>


      <div className="h-1.5 overflow-hidden rounded-full bg-[#171717]/[0.05]">

        <div
          className={`h-full rounded-full ${
            negative
              ? "bg-[#C93742]"
              : positive
                ? "bg-emerald-500"
                : "bg-[#171717]/30"
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
   INSIGHT ITEM
========================================================= */

function InsightItem({
  icon,
  title,
  description,
  danger = false,
  success = false,
}: {
  icon: React.ReactNode
  title: string
  description: string
  danger?: boolean
  success?: boolean
}) {

  return (

    <div className="flex gap-3 rounded-xl bg-[#FFF8F9] p-3">


      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          danger
            ? "bg-[#FFF0F1] text-[#C93742]"
            : success
              ? "bg-emerald-50 text-emerald-600"
              : "bg-white text-amber-500"
        }`}
      >

        {icon}

      </span>


      <div>

        <p className="text-xs font-bold text-[#171717]">
          {title}
        </p>


        <p className="mt-1 text-[10px] leading-4 text-[#171717]/40">
          {description}
        </p>

      </div>

    </div>
  )
}