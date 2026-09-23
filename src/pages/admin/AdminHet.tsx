import { useMemo, useState } from "react"
import { Tags, Search, CheckCircle2, MinusCircle, ExternalLink } from "lucide-react"
import { HET_DATA } from "../../lib/hetData"

const statusLabel: Record<string, { bg: string; text: string }> = {
  terverifikasi: { bg: "bg-[#EFFAF3] dark:bg-emerald-500/15", text: "text-[#1C8C4A] dark:text-emerald-400" },
  tanpa_het: { bg: "bg-[#171717]/[0.05] dark:bg-white/[0.06]", text: "text-[#171717]/50 dark:text-white/50" },
  batas_atas: { bg: "bg-[#FFF8E1]", text: "text-[#B45309]" },
}

function formatRupiah(v: number) {
  return `Rp${v.toLocaleString("id-ID")}`
}

export default function AdminHet() {
  const [cari, setCari] = useState("")
  const [filter, setFilter] = useState<"semua" | "ada" | "tanpa">("semua")

  const data = useMemo(() => {
    return HET_DATA.filter((h) => {
      const cocokCari = h.komoditas.toLowerCase().includes(cari.toLowerCase())
      const cocokFilter =
        filter === "semua" ||
        (filter === "ada" && h.het !== null) ||
        (filter === "tanpa" && h.het === null)
      return cocokCari && cocokFilter
    })
  }, [cari, filter])

  return (
    <div className="px-6 py-10 lg:px-10 lg:py-12">
      {/* HEADER */}
      <section>
        <p className="text-sm font-semibold text-[#C93742]">Panel Admin</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#171717] dark:text-white lg:text-4xl">
          Kelola HET
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#171717]/50 dark:text-white/50">
          Harga Eceran Tertinggi per komoditas, mengacu pada regulasi Bapanas
          dan CAKBAPOK. Komoditas tanpa HET resmi ditandai khusus.
        </p>
      </section>

      {/* FILTER */}
      <section className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#171717]/30 dark:text-white/30"
          />
          <input
            type="text"
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari komoditas..."
            className="h-11 w-full rounded-xl border border-[#171717]/[0.08] dark:border-white/10 bg-white dark:bg-[#1E1E1E] pl-10 pr-4 text-sm text-[#171717] dark:text-white outline-none transition placeholder:text-[#171717]/35 dark:placeholder:text-white/35 focus:border-[#C93742]/40"
          />
        </div>

        <div className="flex gap-2">
          {(
            [
              { id: "semua", label: "Semua" },
              { id: "ada", label: "Ada HET" },
              { id: "tanpa", label: "Tanpa HET" },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                filter === f.id
                  ? "bg-[#C93742] text-white"
                  : "border border-[#171717]/[0.08] dark:border-white/10 text-[#171717]/60 dark:text-white/60 hover:border-[#C93742]/40"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      {/* TABEL */}
      <section className="mt-5 rounded-2xl border border-[#171717]/[0.06] dark:border-white/10 bg-white dark:bg-[#1E1E1E] shadow-sm">
        <div className="flex items-center justify-between border-b border-[#171717]/[0.06] dark:border-white/10 px-6 py-4">
          <h2 className="flex items-center gap-2 text-sm font-bold text-[#171717] dark:text-white">
            <Tags size={16} className="text-[#C93742]" />
            Daftar HET
          </h2>
          <span className="text-xs text-[#171717]/40 dark:text-white/40">
            {data.length} komoditas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead>
              <tr className="border-b border-[#171717]/[0.06] dark:border-white/10 text-[11px] uppercase tracking-wide text-[#171717]/40 dark:text-white/40">
                <th className="px-6 py-3 font-semibold">Kode</th>
                <th className="px-6 py-3 font-semibold">Komoditas</th>
                <th className="px-6 py-3 text-right font-semibold">HET</th>
                <th className="px-6 py-3 font-semibold">Satuan</th>
                <th className="px-6 py-3 font-semibold">Sumber</th>
                <th className="px-6 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-[#171717]/40 dark:text-white/40">
                    Tidak ada komoditas yang cocok.
                  </td>
                </tr>
              ) : (
                data.map((h) => {
                  const s = statusLabel[h.status] ?? statusLabel.tanpa_het
                  return (
                    <tr
                      key={h.kode}
                      className="border-b border-[#171717]/[0.04] dark:border-white/[0.06] last:border-0"
                    >
                      <td className="px-6 py-3 font-mono text-xs text-[#171717]/45 dark:text-white/45">
                        {h.kode}
                      </td>
                      <td className="px-6 py-3 text-sm font-semibold text-[#171717] dark:text-white">
                        {h.komoditas}
                      </td>
                      <td className="px-6 py-3 text-right text-sm font-bold">
                        {h.het !== null ? (
                          <span className="text-[#171717] dark:text-white">{formatRupiah(h.het)}</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[#171717]/35 dark:text-white/35">
                            <MinusCircle size={13} />
                            tidak ada
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-sm text-[#171717]/55 dark:text-white/55">{h.satuan}</td>
                      <td className="px-6 py-3 text-xs text-[#171717]/55 dark:text-white/55">{h.sumber}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${s.bg} ${s.text}`}>
                          <CheckCircle2 size={12} />
                          {h.status.replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-[#171717]/[0.06] dark:border-white/10 px-6 py-3">
          <p className="flex items-center gap-1.5 text-xs text-[#171717]/40 dark:text-white/40">
            <ExternalLink size={12} />
            Sumber data: hasil analisis HET (regulasi Bapanas &amp; CAKBAPOK).
            Pengubahan nilai akan aktif setelah backend tersambung.
          </p>
        </div>
      </section>
    </div>
  )
}
