import { Fragment, useEffect, useMemo, useState } from "react"
import {
  ScrollText,
  Search,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { getAuditLog, type AuditLogItem } from "../../services/admin"

const AKSI_LABEL: Record<string, string> = {
  login: "Login berhasil",
  login_gagal: "Login gagal",
  ubah_het: "Ubah HET",
  import: "Impor data",
  tambah_komoditas: "Tambah komoditas",
  ubah_komoditas: "Ubah komoditas",
  hapus_komoditas: "Hapus komoditas",
  tambah_pasar: "Tambah pasar",
  hapus_pasar: "Hapus pasar",
  hapus_riwayat: "Hapus riwayat",
}

const AKSI_WARNA: Record<string, string> = {
  login: "bg-[#EFFAF3] dark:bg-emerald-500/15 text-[#1C8C4A] dark:text-emerald-400",
  login_gagal: "bg-[#FFF0F1] text-[#C93742]",
  ubah_het: "bg-[#E3F2FD] text-[#2563EB]",
  import: "bg-[#FFF8E1] text-[#B45309]",
  hapus_komoditas: "bg-[#FFF0F1] text-[#C93742]",
  hapus_pasar: "bg-[#FFF0F1] text-[#C93742]",
  hapus_riwayat: "bg-[#FFF0F1] text-[#C93742]",
}

function warnaAksi(aksi: string) {
  if (AKSI_WARNA[aksi]) return AKSI_WARNA[aksi]
  if (aksi.startsWith("tambah")) return "bg-[#EFFAF3] dark:bg-emerald-500/15 text-[#1C8C4A] dark:text-emerald-400"
  if (aksi.startsWith("ubah")) return "bg-[#E3F2FD] text-[#2563EB]"
  if (aksi.startsWith("hapus")) return "bg-[#FFF0F1] text-[#C93742]"
  return "bg-[#171717]/[0.05] dark:bg-white/[0.06] text-[#171717]/50 dark:text-white/50"
}

function formatWaktu(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

export default function AdminAudit() {
  const [data, setData] = useState<AuditLogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cari, setCari] = useState("")
  const [bukaId, setBukaId] = useState<number | null>(null)

  useEffect(() => {
    async function muat() {
      try {
        const hasil = await getAuditLog({ batas: 500 })
        setData(hasil)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat audit log")
      } finally {
        setLoading(false)
      }
    }
    muat()
  }, [])

  const terfilter = useMemo(() => {
    const q = cari.toLowerCase()
    if (!q) return data
    return data.filter(
      (d) =>
        d.admin.toLowerCase().includes(q) ||
        d.deskripsi.toLowerCase().includes(q) ||
        d.entitas.toLowerCase().includes(q) ||
        d.aksi.toLowerCase().includes(q),
    )
  }, [data, cari])

  return (
    <div className="px-6 py-10 lg:px-10 lg:py-12">
      {/* HEADER */}
      <section>
        <p className="text-sm font-semibold text-[#C93742]">Panel Admin</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#171717] dark:text-white lg:text-4xl">
          Audit Log
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#171717]/50 dark:text-white/50">
          Catatan siapa mengubah apa dan kapan. Bersifat permanen (tidak dapat
          dihapus) untuk keperluan pertanggungjawaban.
        </p>
      </section>

      {error && (
        <div className="mt-6 rounded-xl border border-[#C93742]/30 bg-[#FFF3F4] px-4 py-3 text-sm text-[#C93742]">
          {error}
        </div>
      )}

      {/* PENCARIAN */}
      <section className="mt-8">
        <div className="relative w-full sm:max-w-sm">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#171717]/30 dark:text-white/30"
          />
          <input
            type="text"
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari admin, aksi, atau deskripsi..."
            className="h-11 w-full rounded-xl border border-[#171717]/[0.08] dark:border-white/10 bg-white dark:bg-[#1E1E1E] pl-10 pr-4 text-sm text-[#171717] dark:text-white outline-none transition placeholder:text-[#171717]/35 dark:placeholder:text-white/35 focus:border-[#C93742]/40"
          />
        </div>
      </section>

      {/* TABEL */}
      <section className="mt-5 rounded-2xl border border-[#171717]/[0.06] dark:border-white/10 bg-white dark:bg-[#1E1E1E] shadow-sm">
        <div className="flex items-center justify-between border-b border-[#171717]/[0.06] dark:border-white/10 px-6 py-4">
          <h2 className="flex items-center gap-2 text-sm font-bold text-[#171717] dark:text-white">
            <ScrollText size={16} className="text-[#C93742]" />
            Riwayat Aktivitas
          </h2>
          <span className="text-xs text-[#171717]/40 dark:text-white/40">
            {loading ? "memuat..." : `${terfilter.length} entri`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left">
            <thead>
              <tr className="border-b border-[#171717]/[0.06] dark:border-white/10 text-[11px] uppercase tracking-wide text-[#171717]/40 dark:text-white/40">
                <th className="px-6 py-3 font-semibold">Waktu</th>
                <th className="px-6 py-3 font-semibold">Admin</th>
                <th className="px-6 py-3 font-semibold">Aksi</th>
                <th className="px-6 py-3 font-semibold">Deskripsi</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-[#171717]/40 dark:text-white/40">
                    Memuat audit log...
                  </td>
                </tr>
              ) : terfilter.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-[#171717]/40 dark:text-white/40">
                    Belum ada aktivitas yang tercatat.
                  </td>
                </tr>
              ) : (
                terfilter.map((d) => {
                  const terbuka = bukaId === d.id
                  const punyaDetail = !!(d.dataLama || d.dataBaru)
                  return (
                    <Fragment key={d.id}>
                      <tr
                        className="border-b border-[#171717]/[0.04] dark:border-white/[0.06]"
                      >
                        <td className="whitespace-nowrap px-6 py-3 text-xs text-[#171717]/55 dark:text-white/55">
                          {formatWaktu(d.createdAt)}
                        </td>
                        <td className="px-6 py-3 text-sm font-semibold text-[#171717] dark:text-white">
                          {d.admin}
                        </td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${warnaAksi(d.aksi)}`}>
                            {AKSI_LABEL[d.aksi] ?? d.aksi}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm text-[#171717]/70 dark:text-white/70">
                          {d.deskripsi}
                        </td>
                        <td className="px-6 py-3">
                          {d.berhasil ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1C8C4A] dark:text-emerald-400">
                              <CheckCircle2 size={13} /> Berhasil
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#C93742]">
                              <XCircle size={13} /> Gagal
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {punyaDetail && (
                            <button
                              type="button"
                              onClick={() => setBukaId(terbuka ? null : d.id)}
                              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-[#171717]/45 transition hover:bg-[#FFF3F4] hover:text-[#C93742] dark:text-white/45 dark:hover:bg-white/[0.06]"
                            >
                              {terbuka ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              Detail
                            </button>
                          )}
                        </td>
                      </tr>
                      {terbuka && (
                        <tr className="border-b border-[#171717]/[0.04] dark:border-white/[0.06] bg-[#FAF7F7] dark:bg-[#121212]">
                          <td colSpan={6} className="px-6 py-4">
                            <div className="grid gap-3 sm:grid-cols-2">
                              <DetailBlok judul="Sebelum" isi={d.dataLama} />
                              <DetailBlok judul="Sesudah" isi={d.dataBaru} />
                            </div>
                            <p className="mt-3 text-[11px] text-[#171717]/40 dark:text-white/40">
                              Entitas: {d.entitas}
                              {d.entitasId ? ` #${d.entitasId}` : ""}
                              {d.ip ? ` · IP: ${d.ip}` : ""}
                            </p>
                          </td>
                        </tr>
                      )}
                    </Fragment>
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

function DetailBlok({ judul, isi }: { judul: string; isi: string | null }) {
  let teks = "-"
  if (isi) {
    try {
      teks = JSON.stringify(JSON.parse(isi), null, 2)
    } catch {
      teks = isi
    }
  }
  return (
    <div>
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-[#171717]/40 dark:text-white/40">
        {judul}
      </p>
      <pre className="max-h-48 overflow-auto rounded-lg border border-[#171717]/[0.06] dark:border-white/10 bg-white dark:bg-[#1E1E1E] p-3 font-mono text-[11px] leading-5 text-[#171717]/75 dark:text-white/75">
        {teks}
      </pre>
    </div>
  )
}
