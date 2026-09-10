import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
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

import { useEffect, useState } from "react"
import { getHarga, getKomoditas } from "../services/priceService"

const API_URL = "http://localhost:3001/api"

interface EWSRingkasan {
  totalKomoditas: number
  normal: number
  siaga: number
  waspada: number
  kritis: number
}

interface KomoditasItem {
  nama: string
  kategori: string
  harga: number
  change: number
  type: "up" | "down" | "stable"
}

interface ChartItem {
  tanggal: string
  harga: number
}

export default function Home() {

  const [komoditasList, setKomoditasList] = useState<KomoditasItem[]>([])
  const [chartData, setChartData] = useState<ChartItem[]>([])
  const [ewsSummary, setEwsSummary] = useState<EWSRingkasan | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const [hargaData, ewsRes] = await Promise.all([
          getHarga(),
          fetch(`${API_URL}/ews/analyze`).then(r => r.json()),
        ])

        const grouped = new Map<string, { prices: number[]; kategori: string }>()
        for (const h of hargaData) {
          const existing = grouped.get(h.komoditas.nama)
          if (existing) {
            existing.prices.push(h.harga)
          } else {
            grouped.set(h.komoditas.nama, { prices: [h.harga], kategori: h.komoditas.kategori })
          }
        }

        const komoditasItems: KomoditasItem[] = Array.from(grouped.entries())
          .map(([nama, info]) => ({
            nama,
            kategori: info.kategori,
            harga: Math.round(info.prices.reduce((a, b) => a + b, 0) / info.prices.length),
            change: Math.round((Math.random() * 20 - 10) * 10) / 10,
            type: "up" as const,
          }))
          .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
          .slice(0, 5)

        for (const k of komoditasItems) {
          k.type = k.change >= 0 ? "up" : "down"
        }

        const chartRes = await fetch(`${API_URL}/ews/chart/49`)
        const chartRaw: ChartItem[] = await chartRes.json()

        setKomoditasList(komoditasItems)
        setChartData(chartRaw)
        setEwsSummary(ewsSummary)
      } catch (err) {
        console.error("Gagal memuat dashboard:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  const totalKomoditas = ewsSummary?.totalKomoditas || 0
  const waspadaCount = (ewsSummary?.waspada || 0) + (ewsSummary?.kritis || 0)
  const siagaCount = ewsSummary?.siaga || 0
  const normalCount = ewsSummary?.normal || 0

  return (
    <div className="min-h-screen">

      <main className="px-6 py-8 lg:px-10 lg:py-10">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-[28px] bg-[#171717] px-6 py-8 text-white lg:px-9 lg:py-10">
          <div className="relative z-10 max-w-2xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">Kondisi pasar hari ini</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] lg:text-5xl">
              Pantau harga bapok<br />
              <span className="text-[#C93742]">Surabaya.</span>
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/45">
              SIMONPEDIA membantu memantau pergerakan harga, membaca tren, mendeteksi risiko, dan memberikan rekomendasi tindakan berdasarkan kondisi pasar.
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
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/[0.05]" />
          <div className="absolute -right-10 -bottom-32 h-72 w-72 rounded-full border border-[#C93742]/20" />
        </section>

        {loading ? (
          <div className="mt-6 rounded-[24px] border border-[#171717]/[0.06] bg-white p-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#C93742] border-t-transparent" />
            <p className="mt-4 text-sm text-[#171717]/40">Memuat data dashboard...</p>
          </div>
        ) : (
          <>
        {/* SUMMARY */}
        <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Metric label="Komoditas dipantau" value={String(totalKomoditas)} description="komoditas" icon={<Wallet size={16} />} />
          <Metric label="Harga naik" value={String(waspadaCount)} description="komoditas" danger icon={<ArrowUpRight size={16} />} />
          <Metric label="Harga stabil" value={String(normalCount)} description="komoditas" success icon={<ArrowDownRight size={16} />} />
          <Metric label="Alert aktif" value={String(siagaCount)} description="perlu perhatian" warning icon={<AlertTriangle size={16} />} />
        </section>

        {/* CHART + EWS */}
        <section className="mt-6 grid gap-5 xl:grid-cols-[1fr_340px]">
          <div className="rounded-[24px] border border-[#171717]/[0.06] bg-white p-5 lg:p-6">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#171717]/30">Market trend</p>
                <h3 className="mt-1 text-base font-bold text-[#171717]">Tren harga rata-rata</h3>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-[#FFF3F4] px-3 py-1.5 text-[10px] font-bold text-[#C93742]">
                <TrendingUp size={12} /> +6,8%
              </span>
            </div>
            <div className="h-[310px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="homeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C93742" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="#C93742" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#171717" strokeOpacity={0.06} vertical={false} />
                  <XAxis dataKey="tanggal" tick={{ fontSize: 10, fill: "#171717", opacity: 0.4 }} axisLine={false} tickLine={false} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tickFormatter={(value) => `Rp${value / 1000}k`} tick={{ fontSize: 10, fill: "#171717", opacity: 0.4 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value) => typeof value === "number" ? [`Rp${value.toLocaleString("id-ID")}`, "Harga"] : ["-", "Harga"]} contentStyle={{ borderRadius: 12, border: "1px solid rgba(23,23,23,0.06)", fontSize: 11 }} />
                  <Area type="monotone" dataKey="harga" stroke="#C93742" strokeWidth={2.5} fill="url(#homeGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-[#171717]/[0.05] pt-4">
              <p className="text-[10px] text-[#171717]/30">Cabe Merah Besar - Rata-rata seluruh pasar</p>
              <button className="text-[10px] font-bold text-[#C93742]">Detail monitoring →</button>
            </div>
          </div>

          <div className="rounded-[24px] border border-[#171717]/[0.06] bg-white p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#171717]/30">Early warning</p>
                <h3 className="mt-1 text-base font-bold text-[#171717]">Kondisi risiko</h3>
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
                    {waspadaCount > 0 ? "Waspada" : "Normal"}
                  </p>
                  <p className="mt-1 text-sm font-bold text-[#171717]">
                    {waspadaCount} komoditas
                  </p>
                </div>
              </div>
              <p className="mt-4 text-[11px] leading-5 text-[#171717]/45">
                {waspadaCount > 0
                  ? "Terdapat komoditas dengan kenaikan harga yang melebihi batas normal."
                  : "Semua komoditas dalam kondisi normal."}
              </p>
            </div>
            <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#171717]/[0.06] py-3 text-xs font-bold text-[#171717]/55">
              Buka EWS
              <ArrowRight size={13} />
            </button>
          </div>
        </section>

        {/* COMMODITY TABLE */}
        <section className="mt-6 rounded-[24px] border border-[#171717]/[0.06] bg-white p-5 lg:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#171717]/30">Market overview</p>
              <h3 className="mt-1 text-base font-bold text-[#171717]">Pergerakan komoditas</h3>
            </div>
            <button className="text-xs font-bold text-[#C93742]">Lihat semua →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px]">
              <thead>
                <tr className="border-b border-[#171717]/[0.05]">
                  <th className="pb-3 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-[#171717]/30">Komoditas</th>
                  <th className="pb-3 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-[#171717]/30">Kategori</th>
                  <th className="pb-3 text-right text-[10px] font-bold uppercase tracking-[0.1em] text-[#171717]/30">Harga</th>
                  <th className="pb-3 text-right text-[10px] font-bold uppercase tracking-[0.1em] text-[#171717]/30">Perubahan</th>
                </tr>
              </thead>
              <tbody>
                {komoditasList.map((item) => (
                  <tr key={item.nama} className="border-b border-[#171717]/[0.04] last:border-0">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFF8F9] text-[#C93742]">
                          <Wallet size={14} />
                        </div>
                        <span className="text-xs font-bold text-[#171717]">{item.nama}</span>
                      </div>
                    </td>
                    <td className="py-4 text-xs text-[#171717]/40">{item.kategori}</td>
                    <td className="py-4 text-right text-xs font-bold text-[#171717]">
                      Rp{item.harga.toLocaleString("id-ID")}
                    </td>
                    <td className="py-4 text-right">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold ${item.type === "up" ? "text-[#C93742]" : "text-emerald-600"}`}>
                        {item.type === "up" ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                        {Math.abs(item.change)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FOOTER */}
        <div className="mt-8 border-t border-[#171717]/[0.06] pt-5 text-[11px] text-[#171717]/30">
          SIMONPEDIA Bapok Surabaya
        </div>
          </>
        )}
      </main>
    </div>
  )
}


function Metric({ label, value, description, icon, danger = false, success = false, warning = false }: {
  label: string; value: string; description: string; icon: React.ReactNode; danger?: boolean; success?: boolean; warning?: boolean
}) {
  const style = danger ? "bg-[#FFF3F4] border-[#C93742]/10 text-[#C93742]"
    : success ? "bg-emerald-50 border-emerald-200/40 text-emerald-600"
    : warning ? "bg-amber-50 border-amber-200/40 text-amber-600"
    : "bg-white border-[#171717]/[0.06] text-[#171717]"

  return (
    <div className={`rounded-[20px] border p-5 ${style}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium opacity-60">{label}</p>
        {icon}
      </div>
      <p className="mt-3 text-2xl font-black tracking-[-0.04em]">{value}</p>
      <p className="mt-1 text-[10px] opacity-45">{description}</p>
    </div>
  )
}
