import { useChartTheme } from "../../hooks/useChartTheme"

const formatRupiah = (value: number) =>
  `Rp${Math.round(value).toLocaleString("id-ID")}`

const formatNumber = (value: number) =>
  Number.isInteger(value) ? value.toLocaleString("id-ID") : value.toFixed(1).replace(".", ",")

export interface ChartTooltipProps {
  /** Diisi otomatis oleh Recharts. */
  active?: boolean
  /** Diisi otomatis oleh Recharts. */
  payload?: Array<{ value?: number | string; payload?: Record<string, unknown> }>
  /** Diisi otomatis oleh Recharts (nilai sumbu X). */
  label?: string | number
  /** Nama nilai yang ditampilkan (default "Harga"). */
  valueLabel?: string
  /** Format label sumbu X (mis. potong tanggal). */
  labelFormatter?: (label: string | number) => string
  /** HET (Harga Eceran Tertinggi) per satuan, bila ada. */
  het?: number | null
  /** Satuan HET (mis. "kg", "liter"). */
  hetSatuan?: string
}

/**
 * Tooltip grafik menampilkan:
 * - Harga aktual pada titik tersebut
 * - HET (Harga Eceran Tertinggi) sebagai pembanding bila tersedia
 * - Selisih harga vs HET (Rp & %) ditandai bila melampaui HET
 * - Perubahan harga vs titik sebelumnya (Rp & %)
 */
export default function ChartTooltip({
  active,
  payload,
  label,
  valueLabel = "Harga",
  labelFormatter,
  het,
  hetSatuan = "kg",
}: ChartTooltipProps) {
  const chartTheme = useChartTheme()

  if (!active || !payload || payload.length === 0) return null

  // Pilih titik pertama yang punya nilai numerik valid (untuk chart komposit
  // di mana sebagian series bernilai null pada titik tertentu).
  const point = payload.find((p) => Number.isFinite(Number(p.value)))
  if (!point) return null

  const current = Number(point.value)
  if (Number.isNaN(current)) return null

  const previousRaw = point.payload?.previous
  const hasPrev =
    previousRaw !== null &&
    previousRaw !== undefined &&
    Number.isFinite(Number(previousRaw))

  const diff = hasPrev ? current - Number(previousRaw) : 0
  const percent =
    hasPrev && Number(previousRaw) !== 0 ? (diff / Number(previousRaw)) * 100 : 0

  const isUp = diff > 0
  const isFlat = diff === 0
  const deltaColor = isFlat
    ? chartTheme.tickColor
    : isUp
      ? chartTheme.isDark
        ? "#F87171"
        : "#C93742"
      : chartTheme.isDark
        ? "#34D399"
        : "#1C8C4A"

  const arrow = isFlat ? "=" : isUp ? "▲" : "▼"

  const shownLabel =
    typeof label === "string" && labelFormatter ? labelFormatter(label) : label

  // Perbandingan harga vs HET
  const hasHet = het !== null && het !== undefined && Number.isFinite(het)
  const overHet = hasHet ? current - Number(het) : 0
  const overPercent =
    hasHet && Number(het) !== 0 ? (overHet / Number(het)) * 100 : 0
  const exceeds = hasHet && overHet > 0

  const rowStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    marginTop: 4,
  } as const

  return (
    <div
      style={{
        borderRadius: 12,
        border: chartTheme.tooltip.border,
        background: chartTheme.tooltip.background,
        color: chartTheme.tooltip.color,
        fontSize: 12,
        padding: "10px 12px",
        minWidth: 190,
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
      }}
    >
      {shownLabel !== undefined && shownLabel !== "" && (
        <p
          style={{
            margin: 0,
            marginBottom: 6,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            opacity: 0.5,
          }}
        >
          {shownLabel}
        </p>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <span style={{ opacity: 0.6 }}>{valueLabel}</span>
        <span style={{ fontWeight: 700 }}>{formatRupiah(current)}</span>
      </div>

      {hasHet && (
        <div style={rowStyle}>
          <span style={{ opacity: 0.6 }}>HET / {hetSatuan}</span>
          <span style={{ fontWeight: 700 }}>{formatRupiah(Number(het))}</span>
        </div>
      )}

      {hasHet && (
        <div
          style={{
            ...rowStyle,
            borderTop: chartTheme.isDark
              ? "1px solid rgba(255,255,255,0.08)"
              : "1px solid rgba(23,23,23,0.06)",
            marginTop: 6,
            paddingTop: 6,
          }}
        >
          <span style={{ opacity: 0.6 }}>vs HET</span>
          <span
            style={{
              fontWeight: 700,
              whiteSpace: "nowrap",
              color: exceeds
                ? chartTheme.isDark
                  ? "#F87171"
                  : "#C93742"
                : chartTheme.isDark
                  ? "#34D399"
                  : "#1C8C4A",
            }}
          >
            {exceeds ? "▲ " : overHet === 0 ? "= " : "▼ "}
            {overHet > 0 ? "+" : ""}
            {formatRupiah(overHet)}{" "}
            <span style={{ opacity: 0.85 }}>
              ({overPercent > 0 ? "+" : ""}
              {formatNumber(overPercent)}%)
            </span>
          </span>
        </div>
      )}

      {hasPrev && (
        <div
          style={{
            ...rowStyle,
            borderTop: chartTheme.isDark
              ? "1px solid rgba(255,255,255,0.08)"
              : "1px solid rgba(23,23,23,0.06)",
            marginTop: 6,
            paddingTop: 6,
          }}
        >
          <span style={{ opacity: 0.6 }}>Perubahan</span>
          <span style={{ fontWeight: 700, color: deltaColor, whiteSpace: "nowrap" }}>
            {arrow} {diff > 0 ? "+" : ""}
            {formatRupiah(diff)}{" "}
            <span style={{ opacity: 0.85 }}>
              ({percent > 0 ? "+" : ""}
              {formatNumber(percent)}%)
            </span>
          </span>
        </div>
      )}
    </div>
  )
}
