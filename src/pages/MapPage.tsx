import { useMemo, useState, useEffect } from "react"
import {
  Search,
  MapPin,
  Store,
  Navigation,
  Map as MapIcon,
} from "lucide-react"

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet"

import L from "leaflet"
import "leaflet/dist/leaflet.css"

import { getPasar, type Pasar } from "../services/priceService"
import PageHeader from "../components/layout/PageHeader"

const marketIcon = new L.DivIcon({
  className: "",
  html: `
    <div style="
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: #C93742;
      border: 4px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.18);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 15px;
      font-weight: 700;
    ">
      ●
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
})

export default function MapPage() {
  const [search, setSearch] = useState("")
  const [filterKecamatan, setFilterKecamatan] = useState("Semua")
  const [markets, setMarkets] = useState<Pasar[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPasar()
      .then(setMarkets)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const daftarKecamatan = useMemo(() => {
    return [
      "Semua",
      ...Array.from(new Set(markets.map((m) => m.kecamatan))),
    ]
  }, [markets])

  const filteredMarkets = useMemo(() => {
    return markets.filter((market) => {
      const matchSearch = market.nama.toLowerCase().includes(search.toLowerCase())
      const matchKecamatan = filterKecamatan === "Semua" || market.kecamatan === filterKecamatan
      return matchSearch && matchKecamatan && market.lat && market.lng
    })
  }, [search, filterKecamatan, markets])

  return (
    <div className="min-h-screen bg-[#FAF7F7]">
      <PageHeader breadcrumb="Monitoring" title="Peta Pasar" />
      <div className="px-6 py-10 lg:px-8 lg:py-12">
      <section>
        <p className="text-sm font-semibold text-[#C93742]">Monitoring Wilayah</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[#171717] lg:text-5xl">Peta Pasar Surabaya</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[#171717]/50">
          Lihat lokasi pasar yang menjadi titik pemantauan harga bahan pokok di wilayah Kota Surabaya.
        </p>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#171717]/5 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C93742]/10 text-[#C93742]"><Store size={18} /></div>
            <div>
              <p className="text-xs text-[#171717]/40">Total pasar</p>
              <p className="mt-0.5 text-2xl font-bold text-[#171717]">{markets.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-[#171717]/5 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><Navigation size={18} /></div>
            <div>
              <p className="text-xs text-[#171717]/40">Pasar aktif</p>
              <p className="mt-0.5 text-2xl font-bold text-[#171717]">{markets.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-[#171717]/5 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F4CDD2]/60 text-[#C93742]"><MapPin size={18} /></div>
            <div>
              <p className="text-xs text-[#171717]/40">Ditampilkan</p>
              <p className="mt-0.5 text-2xl font-bold text-[#171717]">{filteredMarkets.length}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-[#171717]/5 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#171717]/30" />
            <input
              type="text"
              placeholder="Cari nama pasar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 w-full rounded-xl border border-[#171717]/10 bg-[#FAF7F7] pl-11 pr-4 text-sm text-[#171717] outline-none transition placeholder:text-[#171717]/35 focus:border-[#C93742]/40 focus:ring-2 focus:ring-[#C93742]/10 lg:w-[300px]"
            />
          </div>
          <select
            value={filterKecamatan}
            onChange={(e) => setFilterKecamatan(e.target.value)}
            className="h-11 rounded-xl border border-[#171717]/10 bg-[#FAF7F7] px-4 text-sm text-[#171717] outline-none transition focus:border-[#C93742]/40 focus:ring-2 focus:ring-[#C93742]/10"
          >
            {daftarKecamatan.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-[1.6fr_0.7fr]">
        <div className="overflow-hidden rounded-2xl border border-[#171717]/5 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#171717]/5 px-5 py-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#171717]/35">Peta wilayah</p>
              <h2 className="mt-1 text-lg font-bold text-[#171717]">Lokasi pasar Surabaya</h2>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#C93742]/10 text-[#C93742]"><MapIcon size={17} /></div>
          </div>

          {loading ? (
            <div className="flex h-[520px] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C93742] border-t-transparent" />
            </div>
          ) : (
          <div className="h-[520px]">
            <MapContainer center={[-7.2575, 112.7521]} zoom={12} scrollWheelZoom={true} className="h-full w-full">
              <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {filteredMarkets.map((market) => (
                <Marker key={market.id} position={[market.lat!, market.lng!]} icon={marketIcon}>
                  <Popup>
                    <div className="min-w-[190px]">
                      <p className="text-xs font-medium text-[#C93742]">Pasar Surabaya</p>
                      <h3 className="mt-1 text-sm font-bold">{market.nama}</h3>
                      <p className="mt-1 text-xs text-gray-500">{market.kecamatan}</p>
                      <div className="mt-3 flex items-center justify-between border-t pt-2">
                        <span className="text-xs">Kelas {market.kelas}</span>
                        <span className="text-xs font-semibold text-emerald-600">● Aktif</span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
          )}
        </div>

        <div className="rounded-2xl border border-[#171717]/5 bg-white shadow-sm">
          <div className="border-b border-[#171717]/5 px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#171717]/35">Daftar lokasi</p>
            <h2 className="mt-1 text-lg font-bold text-[#171717]">Pasar terpantau</h2>
          </div>
          <div className="max-h-[520px] overflow-y-auto">
            {filteredMarkets.length === 0 ? (
              <div className="p-8 text-center">
                <Store size={26} className="mx-auto text-[#171717]/20" />
                <p className="mt-3 text-sm font-medium text-[#171717]/60">Pasar tidak ditemukan</p>
              </div>
            ) : (
              filteredMarkets.map((market) => (
                <div key={market.id} className="group border-b border-[#171717]/5 px-5 py-4 last:border-0 transition hover:bg-[#FAF7F7]">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#C93742]/10 text-[#C93742]"><Store size={16} /></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="truncate text-sm font-bold text-[#171717] transition group-hover:text-[#C93742]">{market.nama}</h3>
                        <span className="shrink-0 rounded-full bg-[#171717]/5 px-2 py-1 text-[10px] font-semibold text-[#171717]/50">Kelas {market.kelas}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-[#171717]/40">
                        <MapPin size={12} /> {market.kecamatan}
                      </div>
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[11px] font-medium text-[#171717]/40">Aktif dipantau</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <div className="mt-5 flex items-center gap-2 text-xs text-[#171717]/35">
        <MapPin size={13} />
        <span>Lokasi pasar ditampilkan sebagai titik pemantauan bahan pokok Kota Surabaya.</span>
      </div>
      </div>
    </div>
  )
}
