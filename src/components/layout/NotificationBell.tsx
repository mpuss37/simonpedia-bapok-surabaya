import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { Bell, ShieldAlert, X } from "lucide-react"
import { API_URL } from "../../services/api"

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

const WARNA_RISIKO: Record<string, string> = {
  Kritis: "bg-[#FFF0F1] text-[#C93742] dark:bg-red-500/15",
  Waspada: "bg-[#FFF0E0] text-[#EA580C] dark:bg-orange-500/15",
  Siaga: "bg-[#FFF8E1] text-[#B45309] dark:bg-amber-500/15",
}

function formatRupiah(v: number) {
  return `Rp${Math.round(v).toLocaleString("id-ID")}`
}

/**
 * Ikon notifikasi yang berfungsi: menampilkan alert EWS terbaru.
 * Klik ikon → dropdown daftar alert. Menutup saat klik di luar / Escape.
 */
export default function NotificationBell() {
  const [buka, setBuka] = useState(false)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Muat alert sekali (dan saat dibuka lagi).
  useEffect(() => {
    let aktif = true
    async function muat() {
      setLoading(true)
      try {
        const res = await fetch(`${API_URL}/ews/analyze`)
        if (!res.ok) return
        const data = await res.json()
        if (aktif) setAlerts((data.alerts ?? []).slice(0, 6))
      } catch {
        /* abaikan */
      } finally {
        if (aktif) setLoading(false)
      }
    }
    muat()
    return () => {
      aktif = false
    }
  }, [])

  // Tutup saat klik di luar atau tekan Escape.
  useEffect(() => {
    function klikLuar(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setBuka(false)
    }
    function esc(e: KeyboardEvent) {
      if (e.key === "Escape") setBuka(false)
    }
    document.addEventListener("mousedown", klikLuar)
    document.addEventListener("keydown", esc)
    return () => {
      document.removeEventListener("mousedown", klikLuar)
      document.removeEventListener("keydown", esc)
    }
  }, [])

  const jumlah = alerts.length

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setBuka((v) => !v)}
        aria-label="Notifikasi"
        aria-expanded={buka}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#171717]/[0.06] bg-white text-[#171717]/60 transition hover:bg-[#FFF8F9] dark:border-white/10 dark:bg-[#1E1E1E] dark:text-white/70 dark:hover:bg-white/5"
      >
        <Bell size={17} />
        {jumlah > 0 && (
          <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#C93742] text-[9px] font-bold text-white">
            {jumlah > 9 ? "9+" : jumlah}
          </span>
        )}
      </button>

      {buka && (
        <div className="absolute right-0 top-12 z-50 w-[320px] overflow-hidden rounded-2xl border border-[#171717]/[0.08] bg-white shadow-xl dark:border-white/10 dark:bg-[#1E1E1E]">
          <div className="flex items-center justify-between border-b border-[#171717]/[0.06] px-4 py-3 dark:border-white/10">
            <div className="flex items-center gap-2">
              <ShieldAlert size={15} className="text-[#C93742]" />
              <span className="text-sm font-bold text-[#171717] dark:text-white">Notifikasi EWS</span>
            </div>
            <button
              type="button"
              onClick={() => setBuka(false)}
              className="text-[#171717]/40 hover:text-[#171717] dark:text-white/40 dark:hover:text-white"
              aria-label="Tutup"
            >
              <X size={15} />
            </button>
          </div>

          <div className="max-h-[320px] overflow-y-auto">
            {loading ? (
              <p className="px-4 py-6 text-center text-xs text-[#171717]/40 dark:text-white/40">
                Memuat notifikasi...
              </p>
            ) : jumlah === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-[#171717]/40 dark:text-white/40">
                Tidak ada peringatan harga saat ini.
              </p>
            ) : (
              alerts.map((a) => (
                <div
                  key={a.id}
                  className="border-b border-[#171717]/[0.04] px-4 py-3 last:border-0 dark:border-white/[0.06]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-bold text-[#171717] dark:text-white">{a.komoditas}</p>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        WARNA_RISIKO[a.levelRisiko] ?? "bg-[#171717]/[0.05] text-[#171717]/50 dark:bg-white/[0.06] dark:text-white/50"
                      }`}
                    >
                      {a.levelRisiko}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-[#171717]/50 dark:text-white/50">
                    {a.pasar} · {formatRupiah(a.harga)}
                  </p>
                  <p
                    className={`mt-0.5 text-[11px] font-semibold ${
                      a.persenPerubahan >= 0 ? "text-[#C93742]" : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {a.persenPerubahan >= 0 ? "+" : ""}
                    {a.persenPerubahan.toFixed(1)}% · {a.tanggal}
                  </p>
                </div>
              ))
            )}
          </div>

          <Link
            to="/ews"
            onClick={() => setBuka(false)}
            className="block border-t border-[#171717]/[0.06] bg-[#FFF8F9] px-4 py-3 text-center text-xs font-bold text-[#C93742] transition hover:bg-[#FFF3F4] dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
          >
            Lihat semua di Early Warning System →
          </Link>
        </div>
      )}
    </div>
  )
}
