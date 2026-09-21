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
}

/**
 * Tooltip grafik yang menampilkan harga + selisih (Rp & %) dibanding
 * titik data sebelumnya, sehingga besar kenaikan/penurunan langsung terlihat.
 *
 * `previous` dihitung dari payload chart bila tipe datanya menyertakan field
 * `previous`; jika tidak, tooltip hanya menampilkan harga titik pertama.
 */
export default function ChartTooltip({
  active,
  payload,
  label,
  valueLabel = "Harga",
  labelFormatter,
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

  return (
    <div
      style={{
        borderRadius: 12,
        border: chartTheme.tooltip.border,
        background: chartTheme.tooltip.background,
        color: chartTheme.tooltip.color,
        fontSize: 12,
        padding: "10px 12px",
        minWidth: 170,
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

      {hasPrev && (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              marginTop: 4,
            }}
          >
            <span style={{ opacity: 0.6 }}>Het (sebelumnya)</span>
            <span style={{ fontWeight: 600, opacity: 0.85 }}>
              {formatRupiah(Number(previousRaw))}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              marginTop: 4,
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
        </>
      )}
    </div>
  )
}
