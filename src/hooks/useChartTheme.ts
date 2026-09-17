import { useTheme } from "../context/theme-context"

export interface ChartTheme {
  isDark: boolean
  tickColor: string
  gridColor: string
  axisColor: string
  tooltip: {
    background: string
    border: string
    color: string
  }
}

export function useChartTheme(): ChartTheme {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  return {
    isDark,
    tickColor: isDark ? "#A1A1A1" : "#6B6B6B",
    gridColor: isDark ? "rgba(255,255,255,0.08)" : "#F1E1E3",
    axisColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(23,23,23,0.06)",
    tooltip: {
      background: isDark ? "#1E1E1E" : "#FFFFFF",
      border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(23,23,23,0.08)",
      color: isDark ? "#FFFFFF" : "#171717",
    },
  }
}
