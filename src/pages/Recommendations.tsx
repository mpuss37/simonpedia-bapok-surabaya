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

import { useEffect, useState } from "react"

const API_URL = "http://localhost:3001/api"

interface KomoditasAnalisis {
  id: number
  nama: string
  kategori: string
  satuan: string
  hargaRataRata: number
  persenPerubahan: number
  levelRisiko: "Normal" | "Siaga" | "Waspada" | "Kritis"
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

function formatRupiah(value: number) {
  return `Rp${value.toLocaleString("id-ID")}`
}

function generateRekomendasi(data: EWSResponse) {
  const items: {
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
  }[] = []

  let id = 1

  for (const alert of data.alerts) {
    const priority = alert.levelRisiko === "Kritis" ? "Tinggi" : "Sedang"
    const deadline = alert.levelRisiko === "Kritis" ? "Dalam 24 jam" : "1–2 hari"

    const actions: Record<string, string> = {
      Kritis:
        "Pantau ketersediaan stok dan lakukan pengecekan harga pada pasar dengan kenaikan tertinggi. Siapkan intervensi jika diperlukan.",
      Waspada:
        "Lakukan monitoring distribusi dan cek pasokan dari distributor utama.",
      Siaga:
        "Pantau harga harian dan bandingkan dengan pasar sekitar.",
      Normal:
        "Kondisi stabil, lakukan monitoring rutin.",
    }

    items.push({
      id: id++,
      priority,
      commodity: alert.komoditas,
      status: alert.levelRisiko,
      price: formatRupiah(alert.harga),
      change: `${alert.persenPerubahan >= 0 ? "+" : ""}${alert.persenPerubahan.toFixed(1)}%`,
      action: actions[alert.levelRisiko] || actions.Normal,
      reason: `Harga mengalami perubahan ${alert.persenPerubahan.toFixed(1)}% pada ${alert.pasar}.`,
      location: alert.pasar,
      deadline,
    })
  }

  const waspadaKomoditas = data.analisis.filter(
    (k) => k.levelRisiko === "Waspada" || k.levelRisiko === "Kritis"
  )

  for (const k of waspadaKomoditas.slice(0, 3)) {
    if (items.some((i) => i.commodity === k.nama)) continue
    const priority = k.levelRisiko === "Kritis" ? "Tinggi" : "Sedang"

    items.push({
      id: id++,
      priority,
      commodity: k.nama,
      status: k.levelRisiko,
      price: formatRupiah(k.hargaRataRata),
      change: `${k.persenPerubahan >= 0 ? "+" : ""}${k.persenPerubahan.toFixed(1)}%`,
      action:
        k.levelRisiko === "Kritis"
          ? "Harga melonjak signifikan. Evaluasi potensi intervensi pasar."
          : "Tren kenaikan mendekati threshold waspada. Pantau terus.",
      reason: `Harga rata-rata ${formatRupiah(k.hargaRataRata)} dengan perubahan ${k.persenPerubahan.toFixed(1)}%.`,
      location: "Semua pasar",
      deadline: k.levelRisiko === "Kritis" ? "Dalam 24 jam" : "1–2 hari",
    })
  }

  return items
}

const quickActions = [
  { title: "Cek stok", description: "Periksa ketersediaan komoditas", icon: Package },
  { title: "Monitoring pasar", description: "Lihat kondisi pasar terdekat", icon: Store },
  { title: "Evaluasi harga", description: "Bandingkan perubahan harga", icon: TrendingUp },
  { title: "Distribusi", description: "Pantau jalur distribusi", icon: ShoppingCart },
]

export default function Recommendations() {
  const [filter, setFilter] = useState("Semua")
  const [ewsData, setEwsData] = useState<EWSResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_URL}/ews/analyze`)
      .then((r) => r.json())
      .then(setEwsData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const rekomendasi = ewsData ? generateRekomendasi(ewsData) : []
  const filtered =
    filter === "Semua"
      ? rekomendasi
      : rekomendasi.filter((r) => r.priority === filter)

  const tinggi = rekomendasi.filter((r) => r.priority === "Tinggi").length
  const sedang = rekomendasi.filter((r) => r.priority === "Sedang").length

  return (
    <div className="min-h-screen">
      <main className="px-6 py-8 lg:px-10 lg:py-10">
        <section className="mb-7">
          <p className="mb-2 text-sm font-semibold text-[#C93742]">Decision support</p>
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <h2 className="text-3xl font-black tracking-[-0.04em] text-[#171717] lg:text-4xl">
                Dari data menjadi<br />
                <span className="text-[#C93742]">tindakan nyata.</span>
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#171717]/45">
                Sistem memberikan rekomendasi berdasarkan perubahan harga, prediksi, tingkat risiko, dan kondisi pasar.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-[#171717]/[0.06] bg-white px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFF3F4] text-[#C93742]">
                <ShieldAlert size={17} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#171717]/30">Risiko aktif</p>
                <p className="text-sm font-bold text-[#171717]">{rekomendasi.length} rekomendasi</p>
              </div>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="rounded-[24px] border border-[#171717]/[0.06] bg-white p-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#C93742] border-t-transparent" />
            <p className="mt-4 text-sm text-[#171717]/40">Menganalisis data EWS...</p>
          </div>
        ) : (
          <>
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SummaryCard label="Total rekomendasi" value={String(rekomendasi.length)} description="aktif" icon={<Info size={16} />} />
          <SummaryCard label="Prioritas tinggi" value={String(tinggi)} description="perlu segera" danger icon={<AlertTriangle size={16} />} />
          <SummaryCard label="Prioritas sedang" value={String(sedang)} description="perlu dipantau" warning icon={<Clock3 size={16} />} />
          <SummaryCard label="Selesai" value="0" description="bulan ini" success icon={<CheckCircle2 size={16} />} />
        </section>

        <section className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#171717]/30">Action center</p>
            <h3 className="mt-1 text-base font-bold text-[#171717]">Rekomendasi yang perlu ditindaklanjuti</h3>
          </div>
          <div className="flex gap-2">
            {["Semua", "Tinggi", "Sedang"].map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  filter === item
                    ? "bg-[#C93742] text-white"
                    : "border border-[#171717]/[0.06] bg-white text-[#171717]/45 hover:bg-[#FFF8F9]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-4 space-y-4">
          {filtered.length === 0 ? (
            <div className="rounded-[24px] border border-[#171717]/[0.06] bg-white p-12 text-center">
              <CheckCircle2 size={40} className="mx-auto text-emerald-400" />
              <p className="mt-4 text-sm font-bold text-[#171717]">Tidak ada rekomendasi aktif</p>
              <p className="mt-1 text-xs text-[#171717]/40">Kondisi pasar saat ini stabil.</p>
            </div>
          ) : (
            filtered.map((rec) => <RecommendationCard key={rec.id} recommendation={rec} />)
          )}
        </section>

        <section className="mt-6 rounded-[24px] border border-[#171717]/[0.06] bg-white p-5 lg:p-6">
          <div className="mb-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#171717]/30">Quick actions</p>
            <h3 className="mt-1 text-base font-bold text-[#171717]">Akses cepat</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => {
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
                    <ArrowRight size={15} className="text-[#171717]/20 transition group-hover:translate-x-1 group-hover:text-[#C93742]" />
                  </div>
                  <p className="mt-4 text-xs font-bold text-[#171717]">{action.title}</p>
                  <p className="mt-1 text-[10px] leading-4 text-[#171717]/35">{action.description}</p>
                </button>
              )
            })}
          </div>
        </section>

        <section className="mt-6 rounded-[24px] border border-[#171717]/[0.06] bg-[#171717] p-6 text-white lg:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">Decision engine</p>
              <h3 className="mt-2 text-2xl font-black tracking-[-0.04em]">Bagaimana rekomendasi<br />dibuat?</h3>
              <p className="mt-4 max-w-sm text-xs leading-5 text-white/45">
                Rekomendasi dihasilkan dengan menggabungkan data harga, tren, prediksi, dan status risiko komoditas.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <ProcessStep number="01" title="Monitoring" description="Sistem membaca perubahan harga." />
              <ProcessStep number="02" title="Analisis" description="Risiko dan tren dianalisis." />
              <ProcessStep number="03" title="Tindakan" description="Sistem menghasilkan rekomendasi." />
            </div>
          </div>
        </section>

        <div className="mt-6 flex gap-3 rounded-2xl border border-[#171717]/[0.06] bg-white px-5 py-4">
          <Info size={15} className="mt-0.5 shrink-0 text-[#171717]/30" />
          <p className="text-[10px] leading-5 text-[#171717]/35">
            Rekomendasi merupakan decision support dan bukan keputusan otomatis. Pengguna tetap perlu mempertimbangkan kondisi lapangan sebelum mengambil tindakan.
          </p>
        </div>

        <div className="mt-8 border-t border-[#171717]/[0.06] pt-5 text-[11px] text-[#171717]/30">
          SIMONPEDIA Bapok Surabaya
        </div>
          </>
        )}
      </main>
    </div>
  )
}

function SummaryCard({ label, value, description, icon, danger = false, warning = false, success = false }: {
  label: string; value: string; description: string; icon: React.ReactNode; danger?: boolean; warning?: boolean; success?: boolean
}) {
  const bg = danger ? "bg-[#FFF3F4] border-[#C93742]/10 text-[#C93742]"
    : warning ? "bg-amber-50 border-amber-200/40 text-amber-600"
    : success ? "bg-emerald-50 border-emerald-200/40 text-emerald-600"
    : "bg-white border-[#171717]/[0.06] text-[#171717]"
  return (
    <div className={`rounded-[20px] border p-5 ${bg}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium opacity-60">{label}</p>
        {icon}
      </div>
      <p className="mt-3 text-2xl font-black tracking-[-0.04em]">{value}</p>
      <p className="mt-1 text-[10px] opacity-45">{description}</p>
    </div>
  )
}

function RecommendationCard({ recommendation: rec }: {
  recommendation: { id: number; priority: string; commodity: string; status: string; price: string; change: string; action: string; reason: string; location: string; deadline: string }
}) {
  const high = rec.priority === "Tinggi"
  return (
    <div className={`overflow-hidden rounded-[24px] border bg-white ${high ? "border-[#C93742]/15" : "border-[#171717]/[0.06]"}`}>
      <div className="flex flex-col gap-4 border-b border-[#171717]/[0.05] p-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <div className="flex items-center gap-4">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${high ? "bg-[#FFF0F1] text-[#C93742]" : "bg-amber-50 text-amber-600"}`}>
            {high ? <AlertTriangle size={20} /> : <Info size={20} />}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-[#171717]">{rec.commodity}</h3>
              <span className={`rounded-full px-2 py-1 text-[9px] font-bold ${high ? "bg-[#FFF0F1] text-[#C93742]" : "bg-amber-50 text-amber-600"}`}>
                Prioritas {rec.priority}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-[10px] text-[#171717]/35">
              <MapPin size={11} /> {rec.location}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-right">
            <p className="text-[10px] text-[#171717]/30">Harga</p>
            <p className="mt-1 text-sm font-black text-[#171717]">{rec.price}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-[#171717]/30">Perubahan</p>
            <p className="mt-1 text-sm font-black text-[#C93742]">{rec.change}</p>
          </div>
        </div>
      </div>
      <div className="grid gap-5 p-5 lg:grid-cols-[1fr_300px] lg:p-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#171717]/30">Tindakan yang disarankan</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#171717]/75">{rec.action}</p>
          <div className="mt-4 rounded-xl bg-[#FFF8F9] p-4">
            <p className="text-[10px] font-bold text-[#171717]/40">Alasan</p>
            <p className="mt-1 text-[11px] leading-5 text-[#171717]/45">{rec.reason}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-[#171717]/[0.05] p-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#171717]/30">Action status</p>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-[#C93742]">
              <Clock3 size={11} /> {rec.deadline}
            </span>
          </div>
          <div className="mt-5 flex items-center gap-2">
            <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#C93742] px-3 py-3 text-[10px] font-bold text-white transition hover:bg-[#B52F39]">
              Tandai ditangani <CheckCircle2 size={13} />
            </button>
          </div>
          <button className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-[#171717]/[0.06] px-3 py-3 text-[10px] font-semibold text-[#171717]/50">
            Detail analisis <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}

function ProcessStep({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <span className="text-[10px] font-black text-[#C93742]">{number}</span>
      <p className="mt-3 text-xs font-bold">{title}</p>
      <p className="mt-2 text-[10px] leading-4 text-white/35">{description}</p>
    </div>
  )
}
