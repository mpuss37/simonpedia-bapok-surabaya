import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  MapPin,
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


const priceTrend = [
  { day: "04 Agu", price: 64000 },
  { day: "05 Agu", price: 64800 },
  { day: "06 Agu", price: 65500 },
  { day: "07 Agu", price: 66200 },
  { day: "08 Agu", price: 67100 },
  { day: "09 Agu", price: 67500 },
  { day: "10 Agu", price: 68000 },
]


const commodities = [
  {
    name: "Cabai Merah",
    category: "Bumbu",
    price: "Rp68.000",
    change: "+10,2%",
    type: "up",
  },
  {
    name: "Bawang Merah",
    category: "Bumbu",
    price: "Rp42.000",
    change: "+8,7%",
    type: "up",
  },
  {
    name: "Beras Premium",
    category: "Pangan",
    price: "Rp16.500",
    change: "+6,1%",
    type: "up",
  },
  {
    name: "Minyak Goreng",
    category: "Pangan",
    price: "Rp19.000",
    change: "-2,4%",
    type: "down",
  },
]


export default function Home() {

  return (

    <div className="min-h-screen">


      {/* =====================================================
          TOPBAR
      ===================================================== */}

      <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[#171717]/[0.06] bg-[#FFF8F9]/90 px-6 backdrop-blur-xl lg:px-10">

        <div>

          <p className="text-xs font-medium text-[#171717]/40">
            SIMONPEDIA / Dashboard
          </p>

          <h1 className="mt-0.5 text-lg font-bold text-[#171717]">
            Dashboard
          </h1>

        </div>


        <div className="flex items-center gap-3">


          <div className="hidden items-center gap-2 text-xs text-[#171717]/40 sm:flex">

            <span className="h-2 w-2 rounded-full bg-emerald-500" />

            Data diperbarui 5 menit lalu

          </div>


          <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#171717]/[0.06] bg-white text-[#171717]/60">

            <Bell size={17} />

            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#C93742]" />

          </button>

        </div>

      </header>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="px-6 py-8 lg:px-10 lg:py-10">


        {/* ===================================================
            HERO
        =================================================== */}

        <section className="relative overflow-hidden rounded-[28px] bg-[#171717] px-6 py-8 text-white lg:px-9 lg:py-10">


          <div className="relative z-10 max-w-2xl">


            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
              Kondisi pasar hari ini
            </p>


            <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] lg:text-5xl">

              Pantau harga bapok
              <br />

              <span className="text-[#C93742]">
                Surabaya.
              </span>

            </h2>


            <p className="mt-4 max-w-xl text-sm leading-6 text-white/45">

              SIMONPEDIA membantu memantau pergerakan harga,
              membaca tren, mendeteksi risiko, dan memberikan
              rekomendasi tindakan berdasarkan kondisi pasar.

            </p>


            <div className="mt-7 flex flex-wrap gap-3">


              <button className="flex items-center gap-2 rounded-xl bg-[#C93742] px-5 py-3 text-xs font-bold text-white transition hover:bg-[#B52F39]">

                Lihat monitoring

                <ArrowRight size={14} />

              </button>


              <button className="rounded-xl border border-white/10 bg-white/[0.05] px-5 py-3 text-xs font-semibold text-white/70">

                Buka EWS

              </button>

            </div>

          </div>


          {/* DECORATION */}

          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/[0.05]" />

          <div className="absolute -right-10 -bottom-32 h-72 w-72 rounded-full border border-[#C93742]/20" />

        </section>


        {/* =====================================================
            SUMMARY
        ===================================================== */}

        <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">


          <Metric
            label="Komoditas dipantau"
            value="24"
            description="komoditas"
            icon={<Wallet size={16} />}
          />


          <Metric
            label="Harga naik"
            value="8"
            description="komoditas"
            danger
            icon={<ArrowUpRight size={16} />}
          />


          <Metric
            label="Harga turun"
            value="5"
            description="komoditas"
            success
            icon={<ArrowDownRight size={16} />}
          />


          <Metric
            label="Alert aktif"
            value="2"
            description="perlu perhatian"
            warning
            icon={<AlertTriangle size={16} />}
          />

        </section>


        {/* =====================================================
            CHART + EWS
        ===================================================== */}

        <section className="mt-6 grid gap-5 xl:grid-cols-[1fr_340px]">


          {/* CHART */}

          <div className="rounded-[24px] border border-[#171717]/[0.06] bg-white p-5 lg:p-6">


            <div className="mb-6 flex items-start justify-between">


              <div>

                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#171717]/30">
                  Market trend
                </p>

                <h3 className="mt-1 text-base font-bold text-[#171717]">
                  Tren harga rata-rata
                </h3>

              </div>


              <span className="flex items-center gap-1 rounded-full bg-[#FFF3F4] px-3 py-1.5 text-[10px] font-bold text-[#C93742]">

                <TrendingUp size={12} />

                +6,8%

              </span>

            </div>


            <div className="h-[310px]">


              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <AreaChart
                  data={priceTrend}
                  margin={{
                    top: 10,
                    right: 10,
                    left: -15,
                    bottom: 0,
                  }}
                >

                  <defs>

                    <linearGradient
                      id="homeGradient"
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
                    fill="url(#homeGradient)"
                  />

                </AreaChart>

              </ResponsiveContainer>

            </div>


            <div className="mt-4 flex items-center justify-between border-t border-[#171717]/[0.05] pt-4">

              <p className="text-[10px] text-[#171717]/30">
                Rata-rata seluruh pasar
              </p>

              <button className="text-[10px] font-bold text-[#C93742]">
                Detail monitoring →
              </button>

            </div>

          </div>


          {/* EWS */}

          <div className="rounded-[24px] border border-[#171717]/[0.06] bg-white p-5">


            <div className="flex items-start justify-between">


              <div>

                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#171717]/30">
                  Early warning
                </p>

                <h3 className="mt-1 text-base font-bold text-[#171717]">
                  Kondisi risiko
                </h3>

              </div>


              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF0F1] text-[#C93742]">

                <AlertTriangle size={17} />

              </span>

            </div>


            <div className="mt-5 rounded-2xl bg-[#FFF3F4] p-5">


              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C93742] text-white">

                  <AlertTriangle size={18} />

                </div>


                <div>

                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#C93742]">
                    Waspada
                  </p>

                  <p className="mt-1 text-sm font-bold text-[#171717]">
                    2 komoditas
                  </p>

                </div>

              </div>


              <p className="mt-4 text-[11px] leading-5 text-[#171717]/45">

                Terdapat komoditas dengan kenaikan
                harga yang melebihi batas normal.

              </p>

            </div>


            <div className="mt-4 space-y-2">


              <AlertRow
                commodity="Cabai Merah"
                change="+10,2%"
              />


              <AlertRow
                commodity="Bawang Merah"
                change="+8,7%"
              />

            </div>


            <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#171717]/[0.06] py-3 text-xs font-bold text-[#171717]/55">

              Buka EWS

              <ArrowRight size={13} />

            </button>

          </div>

        </section>


        {/* =====================================================
            COMMODITY TABLE
        ===================================================== */}

        <section className="mt-6 rounded-[24px] border border-[#171717]/[0.06] bg-white p-5 lg:p-6">


          <div className="mb-5 flex items-center justify-between">


            <div>

              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#171717]/30">
                Market overview
              </p>

              <h3 className="mt-1 text-base font-bold text-[#171717]">
                Pergerakan komoditas
              </h3>

            </div>


            <button className="text-xs font-bold text-[#C93742]">
              Lihat semua →
            </button>

          </div>


          <div className="overflow-x-auto">


            <table className="w-full min-w-[650px]">


              <thead>

                <tr className="border-b border-[#171717]/[0.05]">

                  <th className="pb-3 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-[#171717]/30">
                    Komoditas
                  </th>

                  <th className="pb-3 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-[#171717]/30">
                    Kategori
                  </th>

                  <th className="pb-3 text-right text-[10px] font-bold uppercase tracking-[0.1em] text-[#171717]/30">
                    Harga
                  </th>

                  <th className="pb-3 text-right text-[10px] font-bold uppercase tracking-[0.1em] text-[#171717]/30">
                    Perubahan
                  </th>

                  <th className="pb-3 text-right text-[10px] font-bold uppercase tracking-[0.1em] text-[#171717]/30">
                    Status
                  </th>

                </tr>

              </thead>


              <tbody>

                {commodities.map(
                  (commodity) => (

                    <tr
                      key={commodity.name}
                      className="border-b border-[#171717]/[0.04] last:border-0"
                    >


                      <td className="py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFF8F9] text-[#C93742]">

                            <Wallet size={14} />

                          </div>


                          <span className="text-xs font-bold text-[#171717]">
                            {commodity.name}
                          </span>

                        </div>

                      </td>


                      <td className="py-4 text-xs text-[#171717]/40">
                        {commodity.category}
                      </td>


                      <td className="py-4 text-right text-xs font-bold text-[#171717]">
                        {commodity.price}
                      </td>


                      <td className="py-4 text-right">


                        <span
                          className={`inline-flex items-center gap-1 text-xs font-bold ${
                            commodity.type === "up"
                              ? "text-[#C93742]"
                              : "text-emerald-600"
                          }`}
                        >

                          {commodity.type === "up" ? (
                            <ArrowUpRight size={13} />
                          ) : (
                            <ArrowDownRight size={13} />
                          )}

                          {commodity.change}

                        </span>

                      </td>


                      <td className="py-4 text-right">


                        <span
                          className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${
                            commodity.type === "up"
                              ? "bg-[#FFF0F1] text-[#C93742]"
                              : "bg-emerald-50 text-emerald-600"
                          }`}
                        >

                          {commodity.type === "up"
                            ? "Naik"
                            : "Turun"}

                        </span>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </section>


        {/* =====================================================
            MARKET MAP + RECOMMENDATION
        ===================================================== */}

        <section className="mt-6 grid gap-5 lg:grid-cols-2">


          {/* MAP PREVIEW */}

          <div className="overflow-hidden rounded-[24px] border border-[#171717]/[0.06] bg-white">


            <div className="p-5 lg:p-6">


              <div className="flex items-start justify-between">


                <div>

                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#171717]/30">
                    Market map
                  </p>

                  <h3 className="mt-1 text-base font-bold text-[#171717]">
                    Kondisi pasar Surabaya
                  </h3>

                </div>


                <MapPin
                  size={17}
                  className="text-[#C93742]"
                />

              </div>


              <div className="relative mt-5 h-[220px] overflow-hidden rounded-2xl bg-[#F4EDEF]">


                {/* SIMPLE MAP PREVIEW */}

                <div className="absolute left-[25%] top-[25%] h-2 w-2 rounded-full bg-[#C93742] ring-4 ring-[#C93742]/20" />

                <div className="absolute left-[60%] top-[38%] h-2 w-2 rounded-full bg-amber-500 ring-4 ring-amber-500/20" />

                <div className="absolute left-[44%] top-[68%] h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />

                <div className="absolute left-[75%] top-[70%] h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />


                <div className="absolute inset-0 flex items-center justify-center">

                  <p className="rounded-xl bg-white/80 px-4 py-2 text-[10px] font-semibold text-[#171717]/40 backdrop-blur-md">

                    Peta interaktif

                  </p>

                </div>

              </div>


              <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#171717]/[0.06] py-3 text-xs font-bold text-[#171717]/55">

                Buka peta pasar

                <ArrowRight size={13} />

              </button>

            </div>

          </div>


          {/* RECOMMENDATION */}

          <div className="rounded-[24px] border border-[#171717]/[0.06] bg-white p-5 lg:p-6">


            <div className="flex items-start justify-between">


              <div>

                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#171717]/30">
                  Decision support
                </p>

                <h3 className="mt-1 text-base font-bold text-[#171717]">
                  Rekomendasi tindakan
                </h3>

              </div>


              <CheckCircle2
                size={17}
                className="text-[#C93742]"
              />

            </div>


            <div className="mt-5 space-y-3">


              <Recommendation
                number="01"
                title="Pantau Cabai Merah"
                description="Kenaikan harga melebihi threshold normal."
              />


              <Recommendation
                number="02"
                title="Cek distribusi"
                description="Periksa pasokan pada pasar dengan risiko tinggi."
              />


              <Recommendation
                number="03"
                title="Evaluasi stok"
                description="Pantau ketersediaan komoditas dalam 24 jam."
              />

            </div>


            <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#C93742] py-3 text-xs font-bold text-white">

              Lihat semua rekomendasi

              <ArrowRight size={13} />

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
   METRIC
========================================================= */

function Metric({
  label,
  value,
  description,
  icon,
  danger = false,
  success = false,
  warning = false,
}: {
  label: string
  value: string
  description: string
  icon: React.ReactNode
  danger?: boolean
  success?: boolean
  warning?: boolean
}) {

  const style = danger
    ? "bg-[#FFF3F4] border-[#C93742]/10 text-[#C93742]"
    : success
      ? "bg-emerald-50 border-emerald-200/40 text-emerald-600"
      : warning
        ? "bg-amber-50 border-amber-200/40 text-amber-600"
        : "bg-white border-[#171717]/[0.06] text-[#171717]"


  return (

    <div className={`rounded-[20px] border p-5 ${style}`}>

      <div className="flex items-center justify-between">

        <p className="text-xs font-medium opacity-60">
          {label}
        </p>

        {icon}

      </div>


      <p className="mt-3 text-2xl font-black tracking-[-0.04em]">
        {value}
      </p>


      <p className="mt-1 text-[10px] opacity-45">
        {description}
      </p>

    </div>
  )
}


/* =========================================================
   ALERT ROW
========================================================= */

function AlertRow({
  commodity,
  change,
}: {
  commodity: string
  change: string
}) {

  return (

    <div className="flex items-center justify-between rounded-xl bg-[#FFF8F9] px-3 py-3">


      <div className="flex items-center gap-2">

        <span className="h-2 w-2 rounded-full bg-[#C93742]" />

        <span className="text-xs font-semibold text-[#171717]">
          {commodity}
        </span>

      </div>


      <span className="text-xs font-bold text-[#C93742]">
        {change}
      </span>

    </div>
  )
}


/* =========================================================
   RECOMMENDATION
========================================================= */

function Recommendation({
  number,
  title,
  description,
}: {
  number: string
  title: string
  description: string
}) {

  return (

    <div className="flex gap-3 rounded-xl bg-[#FFF8F9] p-3">


      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[9px] font-black text-[#C93742]">
        {number}
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