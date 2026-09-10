import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Info,
  MapPin,
  Package,
  ShieldAlert,
  ShoppingCart,
  Store,
  TrendingUp,
} from "lucide-react"

import { useState } from "react"


/* =========================================================
   DUMMY DATA
========================================================= */

const recommendations = [
  {
    id: 1,
    priority: "Tinggi",
    commodity: "Cabai Merah",
    status: "Waspada",
    price: "Rp68.000/kg",
    change: "+10,2%",
    action:
      "Pantau ketersediaan stok dan lakukan pengecekan harga pada pasar dengan kenaikan tertinggi.",
    reason:
      "Harga mengalami kenaikan signifikan selama 7 hari terakhir.",
    location: "Pasar Wonokromo",
    deadline: "Dalam 24 jam",
  },
  {
    id: 2,
    priority: "Sedang",
    commodity: "Bawang Merah",
    status: "Siaga",
    price: "Rp42.000/kg",
    change: "+8,7%",
    action:
      "Lakukan monitoring distribusi dan cek pasokan dari distributor utama.",
    reason:
      "Tren kenaikan mulai mendekati threshold waspada.",
    location: "Pasar Genteng",
    deadline: "1–2 hari",
  },
  {
    id: 3,
    priority: "Sedang",
    commodity: "Beras Premium",
    status: "Siaga",
    price: "Rp16.500/kg",
    change: "+6,1%",
    action:
      "Pantau harga harian dan bandingkan dengan pasar sekitar.",
    reason:
      "Harga mengalami kenaikan konsisten selama beberapa hari.",
    location: "Pasar Pucang",
    deadline: "1–2 hari",
  },
]


const quickActions = [
  {
    title: "Cek stok",
    description: "Periksa ketersediaan komoditas",
    icon: Package,
  },
  {
    title: "Monitoring pasar",
    description: "Lihat kondisi pasar terdekat",
    icon: Store,
  },
  {
    title: "Evaluasi harga",
    description: "Bandingkan perubahan harga",
    icon: TrendingUp,
  },
  {
    title: "Distribusi",
    description: "Pantau jalur distribusi",
    icon: ShoppingCart,
  },
]


/* =========================================================
   MAIN PAGE
========================================================= */

export default function Recommendations() {

  const [filter, setFilter] =
    useState("Semua")


  const filteredRecommendations =
    filter === "Semua"
      ? recommendations
      : recommendations.filter(
          (item) => item.priority === filter
        )


  return (

    <div className="min-h-screen">


      {/* =====================================================
          TOPBAR
      ===================================================== */}

      <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[#171717]/[0.06] bg-[#FFF8F9]/90 px-6 backdrop-blur-xl lg:px-10">

        <div>

          <p className="text-xs font-medium text-[#171717]/40">
            SIMONPEDIA / Analitik / Rekomendasi
          </p>

          <h1 className="mt-0.5 text-lg font-bold tracking-tight text-[#171717]">
            Rekomendasi Tindakan
          </h1>

        </div>


        <div className="flex items-center gap-2 text-xs text-[#171717]/40">

          <span className="h-2 w-2 rounded-full bg-emerald-500" />

          Berdasarkan data terbaru

        </div>

      </header>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="px-6 py-8 lg:px-10 lg:py-10">


        {/* ===================================================
            HEADER
        =================================================== */}

        <section className="mb-7">


          <p className="mb-2 text-sm font-semibold text-[#C93742]">
            Decision support
          </p>


          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">


            <div>

              <h2 className="text-3xl font-black tracking-[-0.04em] text-[#171717] lg:text-4xl">

                Dari data menjadi

                <br />

                <span className="text-[#C93742]">
                  tindakan nyata.
                </span>

              </h2>


              <p className="mt-3 max-w-xl text-sm leading-6 text-[#171717]/45">

                Sistem memberikan rekomendasi berdasarkan
                perubahan harga, prediksi, tingkat risiko,
                dan kondisi pasar.

              </p>

            </div>


            {/* SYSTEM STATUS */}

            <div className="flex items-center gap-3 rounded-xl border border-[#171717]/[0.06] bg-white px-4 py-3">


              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFF3F4] text-[#C93742]">

                <ShieldAlert size={17} />

              </div>


              <div>

                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#171717]/30">
                  Risiko aktif
                </p>

                <p className="text-sm font-bold text-[#171717]">
                  3 rekomendasi
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            SUMMARY
        ===================================================== */}

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">


          <SummaryCard
            label="Total rekomendasi"
            value="3"
            description="aktif"
            icon={<Info size={16} />}
          />


          <SummaryCard
            label="Prioritas tinggi"
            value="1"
            description="perlu segera"
            danger
            icon={<AlertTriangle size={16} />}
          />


          <SummaryCard
            label="Prioritas sedang"
            value="2"
            description="perlu dipantau"
            warning
            icon={<Clock3 size={16} />}
          />


          <SummaryCard
            label="Selesai"
            value="12"
            description="bulan ini"
            success
            icon={<CheckCircle2 size={16} />}
          />

        </section>


        {/* =====================================================
            FILTER
        ===================================================== */}

        <section className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">


          <div>

            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#171717]/30">
              Action center
            </p>

            <h3 className="mt-1 text-base font-bold text-[#171717]">
              Rekomendasi yang perlu ditindaklanjuti
            </h3>

          </div>


          <div className="flex gap-2">


            {["Semua", "Tinggi", "Sedang"].map(
              (item) => (

                <button
                  key={item}
                  onClick={() =>
                    setFilter(item)
                  }
                  className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                    filter === item
                      ? "bg-[#C93742] text-white"
                      : "border border-[#171717]/[0.06] bg-white text-[#171717]/45 hover:bg-[#FFF8F9]"
                  }`}
                >
                  {item}
                </button>

              )
            )}

          </div>

        </section>


        {/* =====================================================
            RECOMMENDATION CARDS
        ===================================================== */}

        <section className="mt-4 space-y-4">


          {filteredRecommendations.map(
            (recommendation) => (

              <RecommendationCard
                key={recommendation.id}
                recommendation={recommendation}
              />

            )
          )}


        </section>


        {/* =====================================================
            QUICK ACTIONS
        ===================================================== */}

        <section className="mt-6 rounded-[24px] border border-[#171717]/[0.06] bg-white p-5 lg:p-6">


          <div className="mb-5">

            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#171717]/30">
              Quick actions
            </p>

            <h3 className="mt-1 text-base font-bold text-[#171717]">
              Akses cepat
            </h3>

          </div>


          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">


            {quickActions.map(
              (action) => {

                const Icon = action.icon


                return (

                  <button
                    key={action.title}
                    className="group rounded-2xl border border-[#171717]/[0.05] p-4 text-left transition hover:border-[#C93742]/20 hover:bg-[#FFF8F9]"
                  >


                    <div className="flex items-center justify-between">


                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF3F4] text-[#C93742]">

                        <Icon size={18} />

                      </span>


                      <ArrowRight
                        size={15}
                        className="text-[#171717]/20 transition group-hover:translate-x-1 group-hover:text-[#C93742]"
                      />

                    </div>


                    <p className="mt-4 text-xs font-bold text-[#171717]">
                      {action.title}
                    </p>


                    <p className="mt-1 text-[10px] leading-4 text-[#171717]/35">
                      {action.description}
                    </p>

                  </button>

                )
              }
            )}

          </div>

        </section>


        {/* =====================================================
            HOW IT WORKS
        ===================================================== */}

        <section className="mt-6 rounded-[24px] border border-[#171717]/[0.06] bg-[#171717] p-6 text-white lg:p-8">


          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">


            <div>

              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">
                Decision engine
              </p>


              <h3 className="mt-2 text-2xl font-black tracking-[-0.04em]">

                Bagaimana rekomendasi
                <br />
                dibuat?

              </h3>


              <p className="mt-4 max-w-sm text-xs leading-5 text-white/45">

                Rekomendasi dihasilkan dengan menggabungkan
                data harga, tren, prediksi, dan status risiko
                komoditas.

              </p>

            </div>


            <div className="grid gap-3 sm:grid-cols-3">


              <ProcessStep
                number="01"
                title="Monitoring"
                description="Sistem membaca perubahan harga."
              />


              <ProcessStep
                number="02"
                title="Analisis"
                description="Risiko dan tren dianalisis."
              />


              <ProcessStep
                number="03"
                title="Tindakan"
                description="Sistem menghasilkan rekomendasi."
              />

            </div>

          </div>

        </section>


        {/* =====================================================
            INFO
        ===================================================== */}

        <div className="mt-6 flex gap-3 rounded-2xl border border-[#171717]/[0.06] bg-white px-5 py-4">


          <Info
            size={15}
            className="mt-0.5 shrink-0 text-[#171717]/30"
          />


          <p className="text-[10px] leading-5 text-[#171717]/35">

            Rekomendasi merupakan decision support dan
            bukan keputusan otomatis. Pengguna tetap perlu
            mempertimbangkan kondisi lapangan sebelum
            mengambil tindakan.

          </p>

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
   SUMMARY CARD
========================================================= */

function SummaryCard({
  label,
  value,
  description,
  icon,
  danger = false,
  warning = false,
  success = false,
}: {
  label: string
  value: string
  description: string
  icon: React.ReactNode
  danger?: boolean
  warning?: boolean
  success?: boolean
}) {

  const background = danger
    ? "bg-[#FFF3F4] border-[#C93742]/10 text-[#C93742]"
    : warning
      ? "bg-amber-50 border-amber-200/40 text-amber-600"
      : success
        ? "bg-emerald-50 border-emerald-200/40 text-emerald-600"
        : "bg-white border-[#171717]/[0.06] text-[#171717]"


  return (

    <div className={`rounded-[20px] border p-5 ${background}`}>

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
   RECOMMENDATION CARD
========================================================= */

function RecommendationCard({
  recommendation,
}: {
  recommendation: {
    id: number
    priority: string
    commodity: string
    status: string
    price: string
    change: string
    action: string
    reason: string
    location: string
    deadline: string
  }
}) {

  const highPriority =
    recommendation.priority === "Tinggi"


  return (

    <div
      className={`overflow-hidden rounded-[24px] border bg-white ${
        highPriority
          ? "border-[#C93742]/15"
          : "border-[#171717]/[0.06]"
      }`}
    >


      {/* TOP */}

      <div className="flex flex-col gap-4 border-b border-[#171717]/[0.05] p-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">


        <div className="flex items-center gap-4">


          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              highPriority
                ? "bg-[#FFF0F1] text-[#C93742]"
                : "bg-amber-50 text-amber-600"
            }`}
          >

            {highPriority ? (
              <AlertTriangle size={20} />
            ) : (
              <Info size={20} />
            )}

          </div>


          <div>

            <div className="flex flex-wrap items-center gap-2">

              <h3 className="text-sm font-bold text-[#171717]">
                {recommendation.commodity}
              </h3>


              <span
                className={`rounded-full px-2 py-1 text-[9px] font-bold ${
                  highPriority
                    ? "bg-[#FFF0F1] text-[#C93742]"
                    : "bg-amber-50 text-amber-600"
                }`}
              >
                Prioritas {recommendation.priority}
              </span>

            </div>


            <div className="mt-1 flex items-center gap-2 text-[10px] text-[#171717]/35">

              <MapPin size={11} />

              {recommendation.location}

            </div>

          </div>

        </div>


        <div className="flex items-center gap-5">


          <div className="text-right">

            <p className="text-[10px] text-[#171717]/30">
              Harga
            </p>

            <p className="mt-1 text-sm font-black text-[#171717]">
              {recommendation.price}
            </p>

          </div>


          <div className="text-right">

            <p className="text-[10px] text-[#171717]/30">
              Perubahan
            </p>

            <p className="mt-1 text-sm font-black text-[#C93742]">
              {recommendation.change}
            </p>

          </div>

        </div>

      </div>


      {/* BODY */}

      <div className="grid gap-5 p-5 lg:grid-cols-[1fr_300px] lg:p-6">


        <div>


          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#171717]/30">
            Tindakan yang disarankan
          </p>


          <p className="mt-2 text-sm font-semibold leading-6 text-[#171717]/75">
            {recommendation.action}
          </p>


          <div className="mt-4 rounded-xl bg-[#FFF8F9] p-4">

            <p className="text-[10px] font-bold text-[#171717]/40">
              Alasan
            </p>


            <p className="mt-1 text-[11px] leading-5 text-[#171717]/45">
              {recommendation.reason}
            </p>

          </div>

        </div>


        <div className="rounded-2xl border border-[#171717]/[0.05] p-4">


          <div className="flex items-center justify-between">

            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#171717]/30">
              Action status
            </p>


            <span className="flex items-center gap-1 text-[10px] font-semibold text-[#C93742]">

              <Clock3 size={11} />

              {recommendation.deadline}

            </span>

          </div>


          <div className="mt-5 flex items-center gap-2">


            <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#C93742] px-3 py-3 text-[10px] font-bold text-white transition hover:bg-[#B52F39]">

              Tandai ditangani

              <CheckCircle2 size={13} />

            </button>

          </div>


          <button className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-[#171717]/[0.06] px-3 py-3 text-[10px] font-semibold text-[#171717]/50">

            Detail analisis

            <ArrowRight size={12} />

          </button>

        </div>

      </div>

    </div>
  )
}


/* =========================================================
   PROCESS STEP
========================================================= */

function ProcessStep({
  number,
  title,
  description,
}: {
  number: string
  title: string
  description: string
}) {

  return (

    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">


      <span className="text-[10px] font-black text-[#C93742]">
        {number}
      </span>


      <p className="mt-3 text-xs font-bold">
        {title}
      </p>


      <p className="mt-2 text-[10px] leading-4 text-white/35">
        {description}
      </p>

    </div>
  )
}