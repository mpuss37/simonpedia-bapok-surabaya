import { useRef, useState } from "react"
import {
  Upload,
  FileSpreadsheet,
  FileJson,
  Download,
  Check,
  Info,
  X,
} from "lucide-react"

const contohBaris = [
  { tanggal: "2024-01-01", kategori: "BUMBU DAPUR", komoditas: "Cabai Rawit", satuan: "kg", pasar: "Pasar Wonokromo", harga: "85.000" },
  { tanggal: "2024-01-01", kategori: "PANGAN POKOK", komoditas: "Beras Premium", satuan: "kg", pasar: "Pasar Wonokromo", harga: "14.900" },
  { tanggal: "2024-01-01", kategori: "PANGAN POKOK", komoditas: "Gula Pasir", satuan: "kg", pasar: "Pasar Keputran", harga: "17.500" },
]

export default function AdminInput() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [namaFile, setNamaFile] = useState<string | null>(null)
  const [notified, setNotified] = useState(false)

  function handlePilih(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) setNamaFile(f.name)
  }

  function handleSimpan() {
    setNotified(true)
    window.setTimeout(() => setNotified(false), 3500)
  }

  return (
    <div className="px-6 py-10 lg:px-10 lg:py-12">
      {/* HEADER */}
      <section>
        <p className="text-sm font-semibold text-[#C93742]">Panel Admin</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#171717] dark:text-white lg:text-4xl">
          Input Data
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#171717]/50 dark:text-white/50">
          Unggah data harga sesuai template. Sistem akan menampilkan pratinjau
          sebelum data disimpan.
        </p>
      </section>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        {/* UNGGAH */}
        <div className="rounded-2xl border border-[#171717]/[0.06] dark:border-white/10 bg-white dark:bg-[#1E1E1E] p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#171717] dark:text-white">
            <Upload size={16} className="text-[#C93742]" />
            Unggah Berkas
          </h2>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#171717]/15 dark:border-white/15 bg-[#FAF7F7] dark:bg-[#121212] px-6 py-10 transition hover:border-[#C93742]/50"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF3F4] dark:bg-white/[0.05] text-[#C93742]">
              <Upload size={22} />
            </span>
            <span className="text-sm font-semibold text-[#171717] dark:text-white">
              Pilih berkas atau tarik ke sini
            </span>
            <span className="text-xs text-[#171717]/45 dark:text-white/45">
              Format: .xlsx, .csv, atau .json
            </span>
          </button>

          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls,.csv,.json"
            onChange={handlePilih}
            className="hidden"
          />

          {namaFile && (
            <div className="mt-4 flex items-center justify-between rounded-xl border border-[#171717]/[0.08] dark:border-white/10 bg-[#FFF8F9] dark:bg-white/[0.03] px-4 py-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet size={16} className="text-[#C93742]" />
                <span className="text-sm font-medium text-[#171717] dark:text-white">
                  {namaFile}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setNamaFile(null)}
                className="text-[#171717]/40 transition hover:text-[#C93742] dark:text-white/40"
                aria-label="Hapus berkas"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleSimpan}
            disabled={!namaFile}
            className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white transition ${
              namaFile
                ? "bg-[#C93742] hover:bg-[#B52F39]"
                : "cursor-not-allowed bg-[#171717]/20 dark:bg-white/10"
            }`}
          >
            <Check size={16} />
            Simpan ke Database
          </button>

          {notified && (
            <p className="mt-3 flex items-start gap-1.5 text-xs text-[#1C8C4A] dark:text-emerald-400">
              <Info size={13} className="mt-0.5 shrink-0" />
              Fitur simpan belum aktif. Tampilan ini masih tahap rancangan.
            </p>
          )}
        </div>

        {/* TEMPLATE */}
        <div className="rounded-2xl border border-[#171717]/[0.06] dark:border-white/10 bg-white dark:bg-[#1E1E1E] p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#171717] dark:text-white">
            <Download size={16} className="text-[#C93742]" />
            Template
          </h2>

          <p className="mb-4 text-xs leading-5 text-[#171717]/50 dark:text-white/50">
            Unduh template agar format kolom sesuai. Isi data, lalu unggah
            kembali.
          </p>

          <div className="space-y-3">
            <TemplateBtn
              icon={FileSpreadsheet}
              label="Template Excel"
              ext=".xlsx"
            />
            <TemplateBtn icon={FileSpreadsheet} label="Template CSV" ext=".csv" />
            <TemplateBtn icon={FileJson} label="Template JSON" ext=".json" />
          </div>

          <div className="mt-5 rounded-xl bg-[#FAF7F7] dark:bg-[#121212] p-4">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-[#171717]/40 dark:text-white/40">
              Kolom wajib (CSV/Excel)
            </p>
            <p className="font-mono text-[11px] leading-6 text-[#171717]/70 dark:text-white/70">
              tanggal, kategori, komoditas, satuan, pasar, harga
            </p>
          </div>
        </div>
      </div>

      {/* PRATINJAU */}
      <section className="mt-8 rounded-2xl border border-[#171717]/[0.06] dark:border-white/10 bg-white dark:bg-[#1E1E1E] shadow-sm">
        <div className="flex items-center justify-between border-b border-[#171717]/[0.06] dark:border-white/10 px-6 py-4">
          <h2 className="flex items-center gap-2 text-sm font-bold text-[#171717] dark:text-white">
            <FileSpreadsheet size={16} className="text-[#C93742]" />
            Pratinjau Data
          </h2>
          <span className="text-xs text-[#171717]/40 dark:text-white/40">
            {namaFile ? "Contoh pratinjau" : "Belum ada berkas"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-[#171717]/[0.06] dark:border-white/10 text-[11px] uppercase tracking-wide text-[#171717]/40 dark:text-white/40">
                <th className="px-6 py-3 font-semibold">Tanggal</th>
                <th className="px-6 py-3 font-semibold">Kategori</th>
                <th className="px-6 py-3 font-semibold">Komoditas</th>
                <th className="px-6 py-3 font-semibold">Satuan</th>
                <th className="px-6 py-3 font-semibold">Pasar</th>
                <th className="px-6 py-3 text-right font-semibold">Harga</th>
              </tr>
            </thead>
            <tbody>
              {contohBaris.map((r, i) => (
                <tr
                  key={i}
                  className="border-b border-[#171717]/[0.04] dark:border-white/[0.06] last:border-0"
                >
                  <td className="px-6 py-3 text-sm text-[#171717] dark:text-white">{r.tanggal}</td>
                  <td className="px-6 py-3 text-sm text-[#171717]/55 dark:text-white/55">{r.kategori}</td>
                  <td className="px-6 py-3 text-sm font-semibold text-[#171717] dark:text-white">{r.komoditas}</td>
                  <td className="px-6 py-3 text-sm text-[#171717]/55 dark:text-white/55">{r.satuan}</td>
                  <td className="px-6 py-3 text-sm text-[#171717]/55 dark:text-white/55">{r.pasar}</td>
                  <td className="px-6 py-3 text-right text-sm font-semibold text-[#171717] dark:text-white">
                    Rp{r.harga}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-[#171717]/[0.06] dark:border-white/10 px-6 py-3">
          <p className="text-xs text-[#171717]/40 dark:text-white/40">
            Pratinjau di atas hanya contoh. Nanti akan menampilkan isi berkas
            yang benar-benar diunggah.
          </p>
        </div>
      </section>
    </div>
  )
}

function TemplateBtn({
  icon: Icon,
  label,
  ext,
}: {
  icon: typeof FileSpreadsheet
  label: string
  ext: string
}) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-xl border border-[#171717]/[0.08] dark:border-white/10 p-3 text-left transition hover:border-[#C93742]/40"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FFF3F4] dark:bg-white/[0.05] text-[#C93742]">
        <Icon size={17} />
      </span>
      <span className="min-w-0 flex-1 text-sm font-semibold text-[#171717] dark:text-white">
        {label}
        <span className="ml-1 font-normal text-[#171717]/40 dark:text-white/40">
          ({ext})
        </span>
      </span>
      <Download size={15} className="text-[#171717]/35 dark:text-white/35" />
    </button>
  )
}
