import { ReferenceLine } from "recharts"
import { useChartTheme } from "../../hooks/useChartTheme"

interface HetReferenceLineProps {
  /** Nilai HET (Harga Eceran Tertinggi) per satuan, bila ada. */
  value?: number | null
  /** Satuan HET (mis. "kg"). */
  satuan?: string
}

const formatRupiah = (value: number) =>
  `Rp${Math.round(value).toLocaleString("id-ID")}`

/**
 * Garis horizontal penanda HET (Harga Eceran Tertinggi) pada grafik harga.
 * Membantu melihat sekilas apakah harga pasar masih di bawah atau melampaui HET.
 * Tidak menampilkan apa pun bila komoditas tidak memiliki HET.
 */
export default function HetReferenceLine({ value, satuan }: HetReferenceLineProps) {
  const chartTheme = useChartTheme()

  if (value === null || value === undefined || !Number.isFinite(value)) {
    return null
  }

  const color = chartTheme.isDark ? "#60A5FA" : "#2563EB"

  return (
    <ReferenceLine
      y={value}
      stroke={color}
      strokeDasharray="6 4"
      strokeWidth={1.5}
      ifOverflow="extendDomain"
      label={{
        value: `HET ${formatRupiah(value)}${satuan ? `/${satuan}` : ""}`,
        position: "insideTopRight",
        fill: color,
        fontSize: 10,
        fontWeight: 700,
      }}
    />
  )
}
