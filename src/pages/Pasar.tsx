// src/pages/Pasar.tsx

import { useEffect, useState } from "react"
import {
  Store,
  MapPin,
  Search,
  SlidersHorizontal,
} from "lucide-react"
import { getPasar, type Pasar as PasarType } from "../services/priceService"
import PageHeader from "../components/layout/PageHeader"

export default function Pasar() {
  const [search, setSearch] = useState("")
  const [filterKecamatan, setFilterKecamatan] = useState("Semua")
  const [filterKelas, setFilterKelas] = useState("Semua")
  const [data, setData] = useState<PasarType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const pasar = await getPasar()
        setData(pasar)
      } catch (err) {
        setError("Gagal memuat data pasar dari server")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const daftarKecamatan = [
    "Semua",
    ...Array.from(
      new Set(data.map((p) => p.kecamatan))
    ),
  ]

  const filteredPasar = data.filter((p) => {
    const matchSearch = p.nama
      .toLowerCase()
      .includes(search.toLowerCase())

    const matchKecamatan =
      filterKecamatan === "Semua" ||
      p.kecamatan === filterKecamatan

    const matchKelas =
      filterKelas === "Semua" ||
      p.kelas === filterKelas

    return matchSearch && matchKecamatan && matchKelas
  })

  return (
    <div className="min-h-screen bg-[#FAF7F7]">
      <PageHeader breadcrumb="Data Pasar" title="Daftar Pasar" />
      <div className="px-6 py-10 lg:px-8 lg:py-12">

      {/* PAGE INTRO */}
      <section>

        <p className="text-sm font-semibold text-[#C93742]">
          Data Pasar
        </p>

        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[#171717] lg:text-5xl">
          Daftar Pasar
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-[#171717]/50">
          Seluruh pasar amatan yang dipantau dalam sistem monitoring
          harga bahan pokok Kota Surabaya.
        </p>

      </section>

      {/* LOADING */}
      {loading && (
        <div className="mt-10">
          <div className="rounded-2xl border border-[#171717]/5 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#C93742] border-t-transparent" />
            <p className="mt-4 text-sm text-[#171717]/40">Memuat data pasar...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-10 rounded-2xl border border-[#FFE5E7] bg-[#FFF0F1] p-6 text-center">
          <p className="text-sm font-semibold text-[#C93742]">{error}</p>
        </div>
      )}

      {!loading && !error && (
      <>
      {/* FILTER SECTION */}
      <section className="mt-10">

        <div className="mb-4 flex items-center gap-2">

          <SlidersHorizontal
            size={16}
            className="text-[#C93742]"
          />

          <span className="text-sm font-semibold text-[#171717]">
            Filter pasar
          </span>

        </div>


        <div className="flex flex-col gap-3 sm:flex-row">

          {/* SEARCH */}
          <div className="relative">

            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#171717]/35"
            />

            <input
              type="text"
              placeholder="Cari nama pasar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 w-full rounded-xl border border-[#171717]/10 bg-white pl-11 pr-4 text-sm text-[#171717] outline-none transition placeholder:text-[#171717]/35 focus:border-[#C93742]/40 focus:ring-2 focus:ring-[#C93742]/10 sm:w-[260px]"
            />

          </div>


          {/* KECAMATAN */}
          <select
            value={filterKecamatan}
            onChange={(e) =>
              setFilterKecamatan(e.target.value)
            }
            className="h-11 rounded-xl border border-[#171717]/10 bg-white px-4 text-sm text-[#171717] outline-none transition focus:border-[#C93742]/40 focus:ring-2 focus:ring-[#C93742]/10"
          >
            {daftarKecamatan.map((kec) => (
              <option key={kec} value={kec}>
                {kec}
              </option>
            ))}
          </select>


          {/* KELAS */}
          <select
            value={filterKelas}
            onChange={(e) =>
              setFilterKelas(e.target.value)
            }
            className="h-11 rounded-xl border border-[#171717]/10 bg-white px-4 text-sm text-[#171717] outline-none transition focus:border-[#C93742]/40 focus:ring-2 focus:ring-[#C93742]/10"
          >
            <option value="Semua">
              Semua Kelas
            </option>

            <option value="Utama">
              Utama
            </option>

            <option value="Madya">
              Madya
            </option>

          </select>

        </div>

      </section>


      {/* RESULT INFO */}
      <div className="mt-10 flex items-center justify-between">

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#171717]/35">
            Daftar pasar
          </p>

          <p className="mt-1 text-sm text-[#171717]/50">
            Menampilkan{" "}
            <span className="font-semibold text-[#171717]">
              {filteredPasar.length}
            </span>{" "}
            pasar
          </p>
        </div>

      </div>


      {/* MARKET GRID */}
      <section className="mt-5">

        {filteredPasar.length === 0 ? (

          <div className="rounded-2xl border border-[#171717]/5 bg-white p-12 text-center shadow-sm">

            <Store
              size={28}
              className="mx-auto text-[#171717]/20"
            />

            <p className="mt-4 text-sm font-medium text-[#171717]/60">
              Tidak ada pasar ditemukan
            </p>

            <p className="mt-1 text-xs text-[#171717]/35">
              Coba ubah kata pencarian atau filter.
            </p>

          </div>

        ) : (

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

            {filteredPasar.map((pasar) => (

              <div
                key={pasar.id}
                className="group rounded-2xl border border-[#171717]/5 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#C93742]/20 hover:shadow-md"
              >

                {/* ICON */}
                <div className="flex items-start justify-between">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C93742]/10 text-[#C93742]">

                    <Store size={18} />

                  </div>

                  <span className="rounded-full bg-[#171717]/5 px-3 py-1 text-[11px] font-semibold text-[#171717]/55">
                    Kelas {pasar.kelas}
                  </span>

                </div>


                {/* NAME */}
                <h3 className="mt-5 text-lg font-bold tracking-tight text-[#171717] transition group-hover:text-[#C93742]">
                  {pasar.nama}
                </h3>


                {/* LOCATION */}
                <div className="mt-2 flex items-center gap-1.5 text-sm text-[#171717]/45">

                  <MapPin size={14} />

                  <span>
                    {pasar.kecamatan}
                  </span>

                </div>


                {/* WILAYAH */}
                <div className="mt-2 text-xs text-[#171717]/30">
                  {pasar.wilayah?.nama}
                </div>


                {/* STATUS */}
                <div className="mt-5 flex items-center gap-2 border-t border-[#171717]/5 pt-4">

                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                  <span className="text-xs font-medium text-[#171717]/45">
                    Aktif dipantau
                  </span>

                </div>

              </div>

            ))}

          </div>

        )}

      </section>
      </>
      )}

      </div>
    </div>
  )
}
