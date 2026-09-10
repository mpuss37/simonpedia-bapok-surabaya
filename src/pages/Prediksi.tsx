import { useEffect, useState } from "react"
import { TrendingUp, TrendingDown, Minus, Target, BarChart3 } from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  LineChart,
  ComposedChart,
  Legend,
} from "recharts"

const API_URL = "http://localhost:3001/api"

interface PrediksiItem {
  id: number
  nama: string
  kategori: string
  satuan: string
  hargaTerakhir: number
  tren: "naik" | "turun" | "stabil"
  trenPersen: number
  prediksiHarga: number
  perubahanPrediksi: number
}

interface DetailPrediksi {
  komoditas: { id: number; nama: string; kategori: string; satuan: string }
  dataHistoris: { tanggal: string; harga: number }[]
  analisis: {
    totalHari: number
    hargaRataRata: number
    hargaTertinggi: number
    hargaTerendah: number
    tren: string
    trenPersen: number
    movingAverage: number
    exponentialSmoothing: number
    confidence: number
  }
  prediksi7Hari: { tanggal: string; harga: number }[]
  prediksiRingkasan: {
    prediksiHarga: number
    confidenceInterval: number
    prediksiRendah: number
    prediksiTinggi: number
    confidence: number
  }
}

function formatRupiah(value: number) {
  return `Rp${value.toLocaleString("id-ID")}`
}

export default function Prediksi() {
  const [prediksiList, setPrediksiList] = useState<PrediksiItem[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [detail, setDetail] = useState<DetailPrediksi | null>(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [filterKategori, setFilterKategori] = useState("Semua")

  useEffect(() => {
    async function fetchAll() {
      try {
        const res = await fetch(`${API_URL}/prediction/all`)
        const data = await res.json()
        setPrediksiList(data)
      } catch (err) {
        console.error("Gagal memuat prediksi:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  useEffect(() => {
    if (!selectedId) return
    setDetailLoading(true)
    fetch(`${API_URL}/prediction/komoditas/${selectedId}`)
      .then(r => r.json())
      .then(setDetail)
      .catch(console.error)
      .finally(() => setDetailLoading(false))
  }, [selectedId])

  const filteredList = filterKategori === "Semua"
    ? prediksiList
    : prediksiList.filter(p => p.kategori === filterKategori)

  const kategoriList = ["Semua", ...Array.from(new Set(prediksiList.map(p => p.kategori)))]

  const chartHistoris = detail?.dataHistoris || []
  const chartPrediksi = detail?.prediksi7Hari || []
  const chartCombined = [
    ...chartHistoris.map(d => ({ ...d, type: "historis" })),
    ...chartPrediksi.map(d => ({ ...d, type: "prediksi" })),
  ]

  return (
    <div className="min-h-screen">
      <main className="px-6 py-8 lg:px-10 lg:py-10">
        <section className="mb-7">
          <p className="mb-2 text-sm font-semibold text-[#C93742]">Price Prediction</p>
          <h2 className="text-3xl font-black tracking-[-0.04em] text-[#171717] lg:text-4xl">
            Prediksi harga
            <br />
            <span className="text-[#C93742]">7 hari ke depan.</span>
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#171717]/45">
            Menggunakan Linear Regression, Moving Average, dan Exponential Smoothing
            untuk memprediksi tren harga bahan pokok.
          </p>
        </section>

        {loading ? (
          <div className="rounded-[24px] border border-[#171717]/[0.06] bg-white p-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#C93742] border-t-transparent" />
            <p className="mt-4 text-sm text-[#171717]/40">Menghitung prediksi semua komoditas...</p>
          </div>
        ) : (
          <>
        {/* FILTER */}
        <section className="mb-6 flex flex-wrap gap-2">
          {kategoriList.map(k => (
            <button
              key={k}
              onClick={() => setFilterKategori(k)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                filterKategori === k
                  ? "bg-[#C93742] text-white"
                  : "border border-[#171717]/[0.08] bg-white text-[#171717]/50 hover:bg-[#FFF8F9]"
              }`}
            >
              {k}
            </button>
          ))}
        </section>

        {/* TABEL PREDIKSI */}
        <section className="rounded-[24px] border border-[#171717]/[0.06] bg-white p-5 lg:p-6">
          <div className="mb-5">
            <h3 className="text-base font-bold text-[#171717]">Daftar Prediksi</h3>
            <p className="mt-1 text-xs text-[#171717]/40">
              Klik komoditas untuk melihat detail prediksi
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px]">
              <thead>
                <tr className="border-b border-[#171717]/[0.05]">
                  <th className="pb-3 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-[#171717]/30">Komoditas</th>
                  <th className="pb-3 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-[#171717]/30">Kategori</th>
                  <th className="pb-3 text-right text-[10px] font-bold uppercase tracking-[0.1em] text-[#171717]/30">Harga Akhir</th>
                  <th className="pb-3 text-right text-[10px] font-bold uppercase tracking-[0.1em] text-[#171717]/30">Prediksi</th>
                  <th className="pb-3 text-right text-[10px] font-bold uppercase tracking-[0.1em] text-[#171717]/30">Perubahan</th>
                  <th className="pb-3 text-center text-[10px] font-bold uppercase tracking-[0.1em] text-[#171717]/30">Tren</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map(item => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`cursor-pointer border-b border-[#171717]/[0.04] last:border-0 transition ${
                      selectedId === item.id ? "bg-[#FFF8F9]" : "hover:bg-[#FFF8F9]/50"
                    }`}
                  >
                    <td className="py-4 text-xs font-bold text-[#171717]">{item.nama}</td>
                    <td className="py-4 text-xs text-[#171717]/40">{item.kategori}</td>
                    <td className="py-4 text-right text-xs font-bold text-[#171717]">{formatRupiah(item.hargaTerakhir)}</td>
                    <td className="py-4 text-right text-xs font-bold text-[#C93742]">{formatRupiah(item.prediksiHarga)}</td>
                    <td className="py-4 text-right">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold ${
                        item.perubahanPrediksi > 0 ? "text-[#C93742]" : item.perubahanPrediksi < 0 ? "text-emerald-600" : "text-[#171717]/40"
                      }`}>
                        {item.perubahanPrediksi > 0 ? <TrendingUp size={13} /> : item.perubahanPrediksi < 0 ? <TrendingDown size={13} /> : <Minus size={13} />}
                        {item.perubahanPrediksi >= 0 ? "+" : ""}{item.perubahanPrediksi}%
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      <TrendBadge tren={item.tren} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* DETAIL PANEL */}
        {selectedId && (
          <section className="mt-6 rounded-[24px] border border-[#171717]/[0.06] bg-white p-5 lg:p-6">
            {detailLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#C93742] border-t-transparent" />
              </div>
            ) : detail ? (
              <>
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#171717]/30">Detail prediksi</p>
                    <h3 className="mt-1 text-lg font-bold text-[#171717]">{detail.komoditas.nama}</h3>
                    <p className="text-xs text-[#171717]/40">{detail.komoditas.kategori} • {detail.komoditas.satuan}</p>
                  </div>
                  <TrendBadge tren={detail.analisis.tren as any} large />
                </div>

                {/* RINGKASAN */}
                <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <div className="rounded-xl bg-[#FFF8F9] p-4">
                    <p className="text-[10px] text-[#171717]/35">Harga terakhir</p>
                    <p className="mt-1 text-sm font-bold text-[#171717]">{formatRupiah(detail.dataHistoris[detail.dataHistoris.length - 1]?.harga || 0)}</p>
                  </div>
                  <div className="rounded-xl bg-[#FFF3F4] p-4">
                    <p className="text-[10px] text-[#171717]/35">Prediksi 7 hari</p>
                    <p className="mt-1 text-sm font-bold text-[#C93742]">{formatRupiah(detail.prediksiRingkasan.prediksiHarga)}</p>
                  </div>
                  <div className="rounded-xl bg-[#FFF8F9] p-4">
                    <p className="text-[10px] text-[#171717]/35">Range prediksi</p>
                    <p className="mt-1 text-sm font-bold text-[#171717]">
                      {formatRupiah(detail.prediksiRingkasan.prediksiRendah)} - {formatRupiah(detail.prediksiRingkasan.prediksiTinggi)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#FFF8F9] p-4">
                    <p className="text-[10px] text-[#171717]/35">Confidence</p>
                    <p className="mt-1 text-sm font-bold text-[#171717]">{detail.prediksiRingkasan.confidence}%</p>
                  </div>
                </div>

                {/* CHART KOMPOSIT */}
                <div className="mb-6 rounded-2xl border border-[#171717]/[0.05] p-5">
                  <p className="mb-4 text-xs font-bold text-[#171717]">Grafik historis + prediksi 7 hari</p>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartCombined} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#171717" strokeOpacity={0.06} vertical={false} />
                        <XAxis dataKey="tanggal" tick={{ fontSize: 10, fill: "#171717", opacity: 0.4 }} axisLine={false} tickLine={false} tickFormatter={(v) => v.slice(5)} />
                        <YAxis tickFormatter={(value) => `Rp${value / 1000}k`} tick={{ fontSize: 10, fill: "#171717", opacity: 0.4 }} axisLine={false} tickLine={false} />
                        <Tooltip formatter={(value) => typeof value === "number" ? [`Rp${value.toLocaleString("id-ID")}`, "Harga"] : ["-", "Harga"]} contentStyle={{ borderRadius: 12, border: "1px solid rgba(23,23,23,0.06)", fontSize: 11 }} />
                        <Legend />
                        <Area type="monotone" dataKey="harga" name="Historis" stroke="#171717" strokeWidth={2} fill="#171717" fillOpacity={0.05} />
                        <Line type="monotone" dataKey="harga" name="Prediksi" stroke="#C93742" strokeWidth={2.5} strokeDasharray="6 3" dot={false} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* METODE */}
                <div className="rounded-2xl border border-[#171717]/[0.05] p-5">
                  <p className="mb-4 text-xs font-bold text-[#171717]">Metode Prediksi</p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-[#FFF8F9] p-4">
                      <div className="flex items-center gap-2">
                        <Target size={14} className="text-[#C93742]" />
                        <p className="text-[10px] font-bold text-[#171717]">Linear Regression</p>
                      </div>
                      <p className="mt-2 text-xs text-[#171717]/40">
                        Tren: {detail.analisis.tren} ({detail.analisis.trenPersen >= 0 ? "+" : ""}{detail.analisis.trenPersen}%/hari)
                      </p>
                    </div>
                    <div className="rounded-xl bg-[#FFF8F9] p-4">
                      <div className="flex items-center gap-2">
                        <BarChart3 size={14} className="text-[#C93742]" />
                        <p className="text-[10px] font-bold text-[#171717]">Moving Average (7 hari)</p>
                      </div>
                      <p className="mt-2 text-xs text-[#171717]/40">
                        MA: {formatRupiah(Math.round(detail.analisis.movingAverage))}
                      </p>
                    </div>
                    <div className="rounded-xl bg-[#FFF8F9] p-4">
                      <div className="flex items-center gap-2">
                        <BarChart3 size={14} className="text-[#C93742]" />
                        <p className="text-[10px] font-bold text-[#171717]">Exp. Smoothing (α=0.3)</p>
                      </div>
                      <p className="mt-2 text-xs text-[#171717]/40">
                        ES: {formatRupiah(Math.round(detail.analisis.exponentialSmoothing))}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-center text-sm text-[#171717]/40">Gagal memuat detail</p>
            )}
          </section>
        )}

        <div className="mt-8 border-t border-[#171717]/[0.06] pt-5 text-[11px] text-[#171717]/30">
          SIMONPEDIA Bapok Surabaya
        </div>
          </>
        )}
      </main>
    </div>
  )
}

function TrendBadge({ tren, large = false }: { tren: "naik" | "turun" | "stabil"; large?: boolean }) {
  const config = {
    naik: { icon: TrendingUp, bg: "bg-[#FFF3F4]", text: "text-[#C93742]", label: "Naik" },
    turun: { icon: TrendingDown, bg: "bg-emerald-50", text: "text-emerald-600", label: "Turun" },
    stabil: { icon: Minus, bg: "bg-[#FFF8F9]", text: "text-[#171717]/50", label: "Stabil" },
  }
  const c = config[tren] || config.stabil
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-bold ${c.bg} ${c.text} ${large ? "text-xs" : "text-[10px]"}`}>
      <c.icon size={large ? 14 : 11} />
      {c.label}
    </span>
  )
}
