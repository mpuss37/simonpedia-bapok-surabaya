import { useChartTheme } from "../../hooks/useChartTheme"

interface HetNoteProps {
  /**
   * Apakah HET tersedia. Bila `false`/`null`, tampilkan catatan bahwa
   * komoditas tidak memiliki HET.
   */
  hasHet?: boolean
}

/**
 * Catatan kecil pada grafik yang menunjukkan bahwa komoditas tidak memiliki
 * HET (Harga Eceran Tertinggi). Hanya dirender bila `hasHet` bernilai false.
 *
 * Diletakkan sebagai overlay (absolute) di dalam container grafik.
 */
export default function HetNote({ hasHet }: HetNoteProps) {
  const chartTheme = useChartTheme()

  if (hasHet) return null

  return (
    <div
      className="pointer-events-none absolute right-3 top-2 z-10 rounded-full px-2.5 py-1 text-[10px] font-semibold"
      style={{
        color: chartTheme.tickColor,
        background: chartTheme.isDark
          ? "rgba(255,255,255,0.06)"
          : "rgba(23,23,23,0.05)",
      }}
    >
      Tidak ada HET untuk komoditas ini
    </div>
  )
}
