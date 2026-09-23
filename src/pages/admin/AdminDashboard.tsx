import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  Package,
  Store,
  Database,
  Upload,
  History,
  TrendingUp,
  ArrowRight,
} from "lucide-react"
import { getStatistikAdmin, getHet } from "../../services/admin"

export default function AdminDashboard() {
  const [jumlahKomoditas, setJumlahKomoditas] = useState(0)
  const [jumlahPasar, setJumlahPasar] = useState(0)
  const [jumlahHarga, setJumlahHarga] = useState(0)
  const [jumlahHet, setJumlahHet] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [stat, het] = await Promise.all([getStatistikAdmin(), getHet()])
        setJumlahKomoditas(stat.komoditas)
        setJumlahPasar(stat.pasar)
        setJumlahHarga(stat.harga)
        setJumlahHet(het.filter((h) => h.harga !== null).length)
      } catch (err) {
        console.error("Gagal memuat ringkasan admin:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const statistik = [
    { label: "Komoditas", value: jumlahKomoditas, icon: Package, warna: "#C93742" },
    { label: "Pasar", value: jumlahPasar, icon: Store, warna: "#2563EB" },
    { label: "Data Harga", value: jumlahHarga, icon: Database, warna: "#1C8C4A" },
    { label: "Komoditas Ber-HET", value: jumlahHet, icon: TrendingUp, warna: "#EA580C" },
  ]

  return (
    <div className="px-6 py-10 lg:px-10 lg:py-12">
      {/* HEADER */}
      <section>
        <p className="text-sm font-semibold text-[#C93742]">Panel Admin</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#171717] dark:text-white lg:text-4xl">
          Dashboard Admin
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#171717]/50 dark:text-white/50">
          Ringkasan data SIMONPEDIA dan pintasan ke menu pengelolaan.
        </p>
      </section>

      {/* STATISTIK */}
      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statistik.map((s) => {
          const Icon = s.icon
          return (
            <div
              key={s.label}
              className="rounded-2xl border border-[#171717]/[0.06] dark:border-white/10 bg-white dark:bg-[#1E1E1E] p-5 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ background: `${s.warna}1A`, color: s.warna }}
                >
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#171717]/55 dark:text-white/55">
                    {s.label}
                  </p>
                  <p className="mt-0.5 text-2xl font-black tracking-[-0.04em] text-[#171717] dark:text-white">
                    {loading ? "..." : s.value.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </section>

      {/* PINTASAN */}
      <section className="mt-10">
        <h2 className="mb-4 text-lg font-bold text-[#171717] dark:text-white">
          Menu Pengelolaan
        </h2>
        <div className="grid gap-4 lg:grid-cols-3">
          <Pintasan
            to="/admin/input"
            icon={Upload}
            judul="Input Data"
            desc="Unggah data sesuai template Excel atau JSON."
          />
          <Pintasan
            to="/admin/riwayat"
            icon={History}
            judul="Riwayat Input"
            desc="Lihat dan kelola data yang pernah dimasukkan."
          />
          <Pintasan
            to="/admin/het"
            icon={TrendingUp}
            judul="Kelola HET"
            desc="Kelola Harga Eceran Tertinggi per komoditas."
          />
        </div>
      </section>
    </div>
  )
}

function Pintasan({
  to,
  icon: Icon,
  judul,
  desc,
}: {
  to: string
  icon: typeof Upload
  judul: string
  desc: string
}) {
  return (
    <Link
      to={to}
      className="group flex items-start gap-4 rounded-2xl border border-[#171717]/[0.06] dark:border-white/10 bg-white dark:bg-[#1E1E1E] p-5 shadow-sm transition hover:border-[#C93742]/40 hover:shadow-md"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFF3F4] dark:bg-white/[0.05] text-[#C93742]">
        <Icon size={20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-sm font-bold text-[#171717] dark:text-white">
          {judul}
          <ArrowRight
            size={14}
            className="text-[#C93742] transition group-hover:translate-x-0.5"
          />
        </span>
        <span className="mt-1 block text-xs leading-5 text-[#171717]/50 dark:text-white/50">
          {desc}
        </span>
      </span>
    </Link>
  )
}
