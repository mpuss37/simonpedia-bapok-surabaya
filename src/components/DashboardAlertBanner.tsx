import { useState } from "react"
import { Link } from "react-router-dom"
import { AlertTriangle, ArrowRight, X } from "lucide-react"

export interface PeringatanItem {
  id: number
  nama: string
  persenPerubahan: number
  levelRisiko: string
}

/**
 * Banner peringatan di Dashboard: menampilkan komoditas dengan tingkat
 * risiko Kritis / Waspada (harga perlu intervensi). Tidak muncul bila
 * tidak ada. Bisa ditutup (per kunjungan).
 */
export default function DashboardAlertBanner({ items }: { items: PeringatanItem[] }) {
  const [ditutup, setDitutup] = useState(false)

  if (ditutup || items.length === 0) return null

  // Warna mengikuti level risiko tertinggi yang ada.
  const adaKritis = items.some((i) => i.levelRisiko === "Kritis")
  const warna = adaKritis
    ? { bg: "bg-[#FFF0F1] dark:bg-red-500/10", border: "border-[#C93742]/30", teks: "text-[#C93742]" }
    : { bg: "bg-[#FFF8E1] dark:bg-amber-500/10", border: "border-[#EA580C]/30", teks: "text-[#B45309] dark:text-amber-400" }

  const kritis = items.filter((i) => i.levelRisiko === "Kritis")

  return (
    <div className={`mb-6 rounded-2xl border ${warna.border} ${warna.bg} p-4 lg:p-5`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${warna.teks} bg-white/60 dark:bg-white/10`}>
            <AlertTriangle size={17} />
          </span>
          <div>
            <p className={`text-sm font-bold ${warna.teks}`}>
              Harga perlu perhatian ({items.length} komoditas)
            </p>
            <p className="mt-0.5 text-xs text-[#171717]/55 dark:text-white/55">
              {kritis.length > 0
                ? `${kritis.length} komoditas berisiko kritis dan perlu intervensi.`
                : "Terdapat komoditas berisiko waspada."}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setDitutup(true)}
          aria-label="Tutup peringatan"
          className="shrink-0 rounded-lg p-1 text-[#171717]/40 transition hover:bg-white/60 hover:text-[#171717] dark:text-white/40 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <X size={16} />
        </button>
      </div>

      {/* Daftar komoditas */}
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {items.slice(0, 6).map((i) => (
          <div
            key={i.id}
            className="flex items-center justify-between gap-2 rounded-xl bg-white/70 px-3 py-2 dark:bg-white/[0.04]"
          >
            <span className="truncate text-xs font-semibold text-[#171717] dark:text-white">{i.nama}</span>
            <span className="flex shrink-0 items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  i.levelRisiko === "Kritis"
                    ? "bg-[#C93742] text-white"
                    : "bg-[#EA580C]/15 text-[#EA580C]"
                }`}
              >
                {i.levelRisiko}
              </span>
              <span className={`text-xs font-bold ${i.persenPerubahan >= 0 ? "text-[#C93742]" : "text-emerald-600 dark:text-emerald-400"}`}>
                {i.persenPerubahan >= 0 ? "+" : ""}
                {i.persenPerubahan.toFixed(1)}%
              </span>
            </span>
          </div>
        ))}
      </div>

      <Link
        to="/ews"
        className={`mt-3 inline-flex items-center gap-1.5 text-xs font-bold ${warna.teks} hover:underline`}
      >
        Lihat Early Warning System
        <ArrowRight size={13} />
      </Link>
    </div>
  )
}
