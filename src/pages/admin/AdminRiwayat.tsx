import { useEffect, useState } from "react"
import { History, Trash2, CheckCircle2, AlertTriangle, FileSpreadsheet } from "lucide-react"
import { getRiwayat, hapusRiwayat, type RiwayatItem } from "../../services/admin"

const statusStyle: Record<string, { bg: string; text: string; icon: typeof CheckCircle2 }> = {
  berhasil: { bg: "bg-[#EFFAF3] dark:bg-emerald-500/15", text: "text-[#1C8C4A] dark:text-emerald-400", icon: CheckCircle2 },
  sebagian: { bg: "bg-[#FFF8E1]", text: "text-[#B45309]", icon: AlertTriangle },
  gagal: { bg: "bg-[#FFF0F1]", text: "text-[#C93742]", icon: AlertTriangle },
}

function formatWaktu(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function AdminRiwayat() {
  const [data, setData] = useState<RiwayatItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function muat() {
      try {
        const hasil = await getRiwayat()
        setData(hasil)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat riwayat")
      } finally {
        setLoading(false)
      }
    }
    muat()
  }, [])

  async function hapus(id: number) {
    try {
      await hapusRiwayat(id)
      setData((prev) => prev.filter((d) => d.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus")
    }
  }

  return (
    <div className="px-6 py-10 lg:px-10 lg:py-12">
      {/* HEADER */}
      <section>
        <p className="text-sm font-semibold text-[#C93742]">Panel Admin</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#171717] dark:text-white lg:text-4xl">
          Riwayat Input
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#171717]/50 dark:text-white/50">
          Daftar data yang pernah diunggah. Kamu bisa menghapus entri yang tidak
          diperlukan.
        </p>
      </section>

      {error && (
        <div className="mt-6 rounded-xl border border-[#C93742]/30 bg-[#FFF3F4] px-4 py-3 text-sm text-[#C93742]">
          {error}
        </div>
      )}

      {/* TABEL */}
      <section className="mt-8 rounded-2xl border border-[#171717]/[0.06] dark:border-white/10 bg-white dark:bg-[#1E1E1E] shadow-sm">
        <div className="flex items-center justify-between border-b border-[#171717]/[0.06] dark:border-white/10 px-6 py-4">
          <h2 className="flex items-center gap-2 text-sm font-bold text-[#171717] dark:text-white">
            <History size={16} className="text-[#C93742]" />
            Riwayat Unggahan
          </h2>
          <span className="text-xs text-[#171717]/40 dark:text-white/40">
            {loading ? "memuat..." : `${data.length} entri`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-[#171717]/[0.06] dark:border-white/10 text-[11px] uppercase tracking-wide text-[#171717]/40 dark:text-white/40">
                <th className="px-6 py-3 font-semibold">Berkas</th>
                <th className="px-6 py-3 font-semibold">Waktu</th>
                <th className="px-6 py-3 text-right font-semibold">Baris</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-[#171717]/40 dark:text-white/40">
                    Memuat riwayat...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-[#171717]/40 dark:text-white/40">
                    Belum ada riwayat unggahan.
                  </td>
                </tr>
              ) : (
                data.map((d) => {
                  const s = statusStyle[d.status] ?? statusStyle.gagal
                  const SIcon = s.icon
                  return (
                    <tr
                      key={d.id}
                      className="border-b border-[#171717]/[0.04] dark:border-white/[0.06] last:border-0"
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet size={15} className="text-[#C93742]" />
                          <span className="text-sm font-semibold text-[#171717] dark:text-white">
                            {d.namaFile}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm text-[#171717]/55 dark:text-white/55">
                        {formatWaktu(d.createdAt)}
                      </td>
                      <td className="px-6 py-3 text-right text-sm text-[#171717]/70 dark:text-white/70">
                        {d.jumlahBaris.toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${s.bg} ${s.text}`}>
                          <SIcon size={12} />
                          {d.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => hapus(d.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#171717]/45 transition hover:bg-[#FFF0F1] hover:text-[#C93742] dark:text-white/45 dark:hover:bg-white/[0.06]"
                        >
                          <Trash2 size={14} />
                          Hapus
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
