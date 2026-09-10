import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Info,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
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


interface KomoditasAnalisis {
  id: number
  nama: string
  kategori: string
  satuan: string
  hargaRataRata: number
  hargaTertinggi: number
  hargaTerendah: number
  persenPerubahan: number
  levelRisiko: "Normal" | "Siaga" | "Waspada" | "Kritis"
  jumlahPasar: number
}

interface Alert {
  id: number
  komoditas: string
  pasar: string
  harga: number
  hargaRataRata: number
  persenPerubahan: number
  levelRisiko: string
  tanggal: string
}

interface EWSResponse {
  ringkasan: {
    totalKomoditas: number
    normal: number
    siaga: number
    waspada: number
    kritis: number
  }
  analisis: KomoditasAnalisis[]
  alerts: Alert[]
}

interface ChartData {
  tanggal: string
  harga: number
}

const API_URL = "http://localhost:3001/api"


function formatRupiah(value: number) {
  return `Rp${value.toLocaleString("id-ID")}`
}


export default function EWS() {

  const [selectedCommodity, setSelectedCommodity] = useState("9")
  const [ewsData, setEwsData] = useState<EWSResponse | null>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [chartLoading, setChartLoading] = useState(false)

  useEffect(() => {
    async function fetchEWS() {
      try {
        const res = await fetch(`${API_URL}/ews/analyze`)
        const data = await res.json()
        setEwsData(data)
      } catch (err) {
        console.error("Gagal memuat data EWS:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchEWS()
  }, [])

  useEffect(() => {
    async function fetchChart() {
      if (!selectedCommodity) return
      setChartLoading(true)
      try {
        const res = await fetch(`${API_URL}/ews/chart/${selectedCommodity}`)
        const data = await res.json()
        setChartData(data)
      } catch (err) {
        console.error("Gagal memuat data chart:", err)
      } finally {
        setChartLoading(false)
      }
    }
    fetchChart()
  }, [selectedCommodity])

  const alertsToShow = ewsData?.alerts.slice(0, 5) || []
  const topKomoditas = ewsData?.analisis.slice(0, 8) || []
  const komoditasUntukChart = ewsData?.analisis || []


  return (

    <div className="min-h-screen">

      <main className="px-6 py-8 lg:px-10 lg:py-10">

        {/* HEADER */}
        <section className="mb-7">
          <p className="mb-2 text-sm font-semibold text-[#C93742]">
            Early Warning System
          </p>
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <h2 className="text-3xl font-black tracking-[-0.04em] text-[#171717] lg:text-4xl">
                Deteksi risiko harga
                <br />
                <span className="text-[#C93742]">sebelum menjadi krisis.</span>
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#171717]/45">
                Sistem memantau perubahan harga bahan pokok
                dan memberikan peringatan ketika kondisi pasar
                menunjukkan potensi risiko.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200/50 bg-emerald-50 px-4 py-3">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <div>
                <p className="text-[10px] font-bold text-emerald-700">SISTEM AKTIF</p>
                <p className="text-[10px] text-emerald-600/70">Monitoring berjalan normal</p>
              </div>
            </div>
          </div>
        </section>

        {/* LOADING */}
        {loading && (
          <div className="rounded-[24px] border border-[#171717]/[0.06] bg-white p-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#C93742] border-t-transparent" />
            <p className="mt-4 text-sm text-[#171717]/40">Menganalisis data komoditas...</p>
          </div>
        )}

        {!loading && ewsData && (
          <>
        {/* STATUS OVERVIEW */}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatusCard status="Normal" count={String(ewsData.ringkasan.normal)} description="komoditas" type="normal" />
          <StatusCard status="Siaga" count={String(ewsData.ringkasan.siaga)} description="komoditas" type="siaga" />
          <StatusCard status="Waspada" count={String(ewsData.ringkasan.waspada)} description="komoditas" type="waspada" />
          <StatusCard status="Kritis" count={String(ewsData.ringkasan.kritis)} description="komoditas" type="kritis" />
        </section>

        {/* ALERT BANNER */}
        {ewsData.ringkasan.waspada + ewsData.ringkasan.kritis > 0 && (
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
                  Terdapat {ewsData.ringkasan.waspada + ewsData.ringkasan.kritis} kondisi yang perlu diperhatikan
                </h3>
                <p className="mt-1 max-w-2xl text-xs leading-5 text-[#171717]/45">
                  {ewsData.alerts.length > 0
                    ? `${ewsData.alerts[0].komoditas} mengalami kenaikan harga signifikan pada beberapa pasar di Surabaya.`
                    : "Tidak ada alert aktif saat ini."}
                </p>
              </div>
            </div>
            <button className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#C93742] px-4 py-3 text-xs font-bold text-white">
              Lihat semua alert
              <ChevronRight size={14} />
            </button>
          </div>
        </section>
        )}

        {/* MAIN GRID */}
        <section className="mt-6 grid gap-5 xl:grid-cols-[1fr_340px]">

          {/* CHART */}
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
                onChange={(event) => setSelectedCommodity(event.target.value)}
                className="h-10 rounded-xl border border-[#171717]/[0.07] bg-[#FFF8F9] px-3 text-xs font-semibold text-[#171717]/60 outline-none"
              >
                {komoditasUntukChart.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama}
                  </option>
                ))}
              </select>
            </div>

            <div className="h-[320px]">
              {chartLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#C93742] border-t-transparent" />
                </div>
              ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ewsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C93742" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="#C93742" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#171717" strokeOpacity={0.06} vertical={false} />
                  <XAxis dataKey="tanggal" tick={{ fontSize: 10, fill: "#171717", opacity: 0.4 }} axisLine={false} tickLine={false} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tickFormatter={(value) => `Rp${value / 1000}k`} tick={{ fontSize: 10, fill: "#171717", opacity: 0.4 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value) => typeof value === "number" ? [`Rp${value.toLocaleString("id-ID")}`, "Harga"] : ["-", "Harga"]} contentStyle={{ borderRadius: 12, border: "1px solid rgba(23,23,23,0.06)", fontSize: 11 }} />
                  <Area type="monotone" dataKey="harga" stroke="#C93742" strokeWidth={2.5} fill="url(#ewsGradient)" />
                </AreaChart>
              </ResponsiveContainer>
              )}
            </div>

            {chartData.length >= 2 && (() => {
              const first = chartData[0].harga
              const last = chartData[chartData.length - 1].harga
              const change = ((last - first) / first * 100).toFixed(1)
              const isUp = last >= first
              return (
              <div className="mt-4 flex items-center justify-between rounded-xl bg-[#FFF8F9] p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFF0F1] text-[#C93742]">
                    {isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  </span>
                  <div>
                    <p className="text-[10px] text-[#171717]/35">Perubahan periode</p>
                    <p className={`text-sm font-bold ${isUp ? "text-[#C93742]" : "text-emerald-600"}`}>
                      {isUp ? "+" : ""}{change}%
                    </p>
                  </div>
                </div>
                <p className="max-w-[220px] text-right text-[10px] leading-4 text-[#171717]/35">
                  {Math.abs(Number(change)) > 10 ? "Melebihi threshold normal dan perlu dipantau." : "Masih dalam batas normal."}
                </p>
              </div>
              )
            })()}

          </div>

          {/* ALERT LIST */}
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
              <Bell size={17} className="text-[#C93742]" />
            </div>

            <div className="space-y-2">
              {alertsToShow.length === 0 ? (
                <div className="rounded-2xl border border-[#171717]/[0.05] p-4 text-center">
                  <CheckCircle2 size={24} className="mx-auto text-emerald-500" />
                  <p className="mt-2 text-xs text-[#171717]/40">Tidak ada alert aktif</p>
                </div>
              ) : (
              alertsToShow.map((alert) => (
                <div key={alert.id} className="rounded-2xl border border-[#171717]/[0.05] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-[#171717]">{alert.komoditas}</p>
                      <p className="mt-1 text-[10px] text-[#171717]/35">{alert.pasar}</p>
                    </div>
                    <StatusBadge status={alert.levelRisiko} />
                  </div>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-[10px] text-[#171717]/30">Perubahan harga</p>
                      <p className="mt-1 text-sm font-black text-[#C93742]">
                        {alert.persenPerubahan >= 0 ? "+" : ""}{alert.persenPerubahan.toFixed(1)}%
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-[#171717]/30">
                      <Clock3 size={11} />
                      {alert.tanggal}
                    </div>
                  </div>
                </div>
              ))
              )}
            </div>
          </aside>

        </section>

        {/* COMMODITY STATUS */}
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
          </div>

          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            {topKomoditas.map((kom) => (
              <div key={kom.id} className="rounded-2xl border border-[#171717]/[0.05] p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#171717]">{kom.nama}</p>
                    <p className="mt-1 text-[10px] text-[#171717]/30">Harga rata-rata</p>
                  </div>
                  <StatusBadge status={kom.levelRisiko} />
                </div>
                <div className="mt-5 flex items-end justify-between">
                  <p className="text-lg font-black tracking-[-0.03em] text-[#171717]">
                    {formatRupiah(kom.hargaRataRata)}
                  </p>
                  <p className={`text-xs font-bold ${kom.persenPerubahan >= 0 ? "text-[#C93742]" : "text-emerald-600"}`}>
                    {kom.persenPerubahan >= 0 ? "+" : ""}{kom.persenPerubahan.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* RISK FACTORS */}
        <section className="mt-6 grid gap-5 lg:grid-cols-2">

          <div className="rounded-[24px] border border-[#171717]/[0.06] bg-white p-6">
            <div className="mb-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#171717]/30">
                Risk summary
              </p>
              <h3 className="mt-1 text-base font-bold text-[#171717]">
                Ringkasan risiko
              </h3>
            </div>
            <div className="space-y-4">
              <RiskFactor title="Normal" value={String(ewsData.ringkasan.normal)} level="Rendah" width={`${(ewsData.ringkasan.normal / ewsData.ringkasan.totalKomoditas) * 100}%`} />
              <RiskFactor title="Siaga" value={String(ewsData.ringkasan.siaga)} level="Sedang" warning width={`${(ewsData.ringkasan.siaga / ewsData.ringkasan.totalKomoditas) * 100}%`} />
              <RiskFactor title="Waspada" value={String(ewsData.ringkasan.waspada)} level="Tinggi" danger width={`${(ewsData.ringkasan.waspada / ewsData.ringkasan.totalKomoditas) * 100}%`} />
              <RiskFactor title="Kritis" value={String(ewsData.ringkasan.kritis)} level="Sangat Tinggi" danger width={`${(ewsData.ringkasan.kritis / ewsData.ringkasan.totalKomoditas) * 100}%`} />
            </div>
          </div>

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
              {ewsData.ringkasan.waspada > 0 ? (
                <>
                  <Recommendation number="01" text={`Pantau harga ${ewsData.alerts[0]?.komoditas || "komoditas"} pada pasar dengan kenaikan tertinggi.`} />
                  <Recommendation number="02" text="Periksa ketersediaan stok pada distributor utama." />
                  <Recommendation number="03" text="Evaluasi potensi intervensi apabila tren terus meningkat." />
                </>
              ) : (
                <>
                  <Recommendation number="01" text="Kondisi pasar stabil. Pantau secara berkala." />
                  <Recommendation number="02" text="Pastikan pasokan bahan pokok tetap terjaga." />
                  <Recommendation number="03" text="Lakukan evaluasi data secara berkala." />
                </>
              )}
            </div>
          </div>

        </section>

        <div className="mt-8 border-t border-[#171717]/[0.06] pt-5 text-[11px] text-[#171717]/30">
          SIMONPEDIA Bapok Surabaya
        </div>
          </>
        )}

      </main>
    </div>
  )
}


function StatusCard({ status, count, description, type }: {
  status: string; count: string; description: string; type: "normal" | "siaga" | "waspada" | "kritis"
}) {
  const styles = {
    normal: "bg-emerald-50 border-emerald-200/40 text-emerald-600",
    siaga: "bg-amber-50 border-amber-200/40 text-amber-600",
    waspada: "bg-[#FFF0F1] border-[#C93742]/10 text-[#C93742]",
    kritis: "bg-[#171717] border-[#171717] text-white",
  }
  return (
    <div className={`rounded-[20px] border p-5 ${styles[type]}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold opacity-70">{status}</p>
        {type === "normal" && <CheckCircle2 size={16} />}
        {type === "siaga" && <Info size={16} />}
        {type === "waspada" && <AlertTriangle size={16} />}
        {type === "kritis" && <ShieldAlert size={16} />}
      </div>
      <p className="mt-3 text-2xl font-black">{count}</p>
      <p className="mt-1 text-[10px] opacity-50">{description}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const style = status === "Waspada" ? "bg-[#FFF0F1] text-[#C93742]"
    : status === "Siaga" ? "bg-amber-50 text-amber-600"
    : status === "Kritis" ? "bg-[#171717] text-white"
    : "bg-emerald-50 text-emerald-600"
  return <span className={`rounded-full px-2 py-1 text-[9px] font-bold ${style}`}>{status}</span>
}

function RiskFactor({ title, value, level, width, danger = false, warning = false }: {
  title: string; value: string; level: string; width: string; danger?: boolean; warning?: boolean
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-[#171717]/65">{title}</p>
          <p className="mt-0.5 text-[10px] text-[#171717]/30">Level risiko: {level}</p>
        </div>
        <span className={`text-xs font-bold ${danger ? "text-[#C93742]" : warning ? "text-amber-600" : "text-emerald-600"}`}>
          {value}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[#171717]/[0.05]">
        <div className={`h-full rounded-full ${danger ? "bg-[#C93742]" : warning ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width }} />
      </div>
    </div>
  )
}

function Recommendation({ number, text }: { number: string; text: string }) {
  return (
    <div className="flex gap-3 rounded-xl bg-[#FFF8F9] p-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-[9px] font-black text-[#C93742]">
        {number}
      </span>
      <p className="text-xs leading-5 text-[#171717]/55">{text}</p>
    </div>
  )
}
