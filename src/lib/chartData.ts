/**
 * Menambahkan field `previous` pada tiap titik data chart, yaitu nilai
 * titik sebelumnya pada `key`. Dipakai oleh ChartTooltip untuk menghitung
 * besar kenaikan/penurunan (Rp & %).
 *
 * Titik pertama tidak punya pembanding sehingga `previous` di-set `null`.
 */
export function withPrevious<T extends object>(
  data: T[],
  key: keyof T | string,
): (T & { previous: number | null })[] {
  return data.map((item, index) => {
    const current = Number((item as Record<string, unknown>)[key as string])
    const prevItem = index > 0 ? data[index - 1] : undefined
    const prev = prevItem
      ? Number((prevItem as Record<string, unknown>)[key as string])
      : NaN

    return {
      ...item,
      previous: Number.isFinite(prev) && Number.isFinite(current) ? prev : null,
    }
  })
}
