import { useRef, useState } from "react"
import * as XLSX from "xlsx"
import {
  Upload,
  FileSpreadsheet,
  FileJson,
  Download,
  Check,
  Info,
  X,
  AlertTriangle,
} from "lucide-react"
import { importBaris, type BarisImport } from "../../services/admin"

interface BarisPratinjau {
  tanggal: string
  kategori: string
  komoditas: string
  satuan: string
  pasar: string
  harga: string
}

const KOLOM = ["tanggal", "kategori", "komoditas", "satuan", "pasar", "harga"]

export default function AdminInput() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [namaFile, setNamaFile] = useState<string | null>(null)
  const [baris, setBaris] = useState<BarisPratinjau[]>([])
  const [jenis, setJenis] = useState("json")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [hasil, setHasil] = useState<{ berhasil: number; gagal: number; status: string } | null>(null)

  function normalisasi(raw: BarisImport): BarisPratinjau {
    return {
      tanggal: String(raw.tanggal ?? "").trim(),
      kategori: String(raw.kategori ?? "").trim(),
      komoditas: String(raw.komoditas ?? "").trim(),
      satuan: String(raw.satuan ?? "").trim(),
      pasar: String(raw.pasar ?? "").trim(),
      harga: String(raw.harga ?? "").trim(),
    }
  }

  function setDataBaris(rows: BarisImport[], nama: string, tipe: string) {
    setNamaFile(nama)
    setJenis(tipe)
    setBaris(rows.map(normalisasi))
    setHasil(null)
    setError(null)
  }

  function handlePilih(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setError(null)
    setHasil(null)

    const ext = f.name.split(".").pop()?.toLowerCase()

    if (ext === "json") {
      const reader = new FileReader()
      reader.onload = () => {
        try {
          const parsed = JSON.parse(String(reader.result))
          const rows: BarisImport[] = Array.isArray(parsed)
            ? parsed
            : parsed.baris ?? parsed.data ?? []
          setDataBaris(rows, f.name, "json")
        } catch {
          setError("File JSON tidak valid.")
        }
      }
      reader.readAsText(f)
    } else if (ext === "csv" || ext === "xlsx" || ext === "xls") {
      const reader = new FileReader()
      reader.onload = () => {
        try {
          const wb = XLSX.read(reader.result, { type: "array" })
          const sheet = wb.Sheets[wb.SheetNames[0]]
          const rows = XLSX.utils.sheet_to_json<BarisImport>(sheet, { defval: "" })
          setDataBaris(rows, f.name, ext)
        } catch {
          setError("Gagal membaca file Excel/CSV.")
        }
      }
      reader.readAsArrayBuffer(f)
    } else {
      setError("Format file tidak didukung. Gunakan .xlsx, .csv, atau .json.")
    }
  }

  async function handleSimpan() {
    if (!namaFile || baris.length === 0) return
    setLoading(true)
    setError(null)
    try {
      const hasilImport = await importBaris(namaFile, jenis, baris.map((b) => ({ ...b })))
      setHasil({ berhasil: hasilImport.berhasil, gagal: hasilImport.gagal, status: hasilImport.status })
      setBaris([])
      setNamaFile(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengimpor data")
    } finally {
      setLoading(false)
    }
  }

  function unduhTemplate(ext: "csv" | "json") {
    let isi: string
    let mime: string

    if (ext === "csv") {
      isi = KOLOM.join(",") + "\n2024-01-01,PANGAN POKOK,Beras Premium,kg,Pasar Wonokromo,14900\n"
      mime = "text/csv"
    } else {
      isi = JSON.stringify(
        [
          {
            tanggal: "2024-01-01",
            kategori: "PANGAN POKOK",
            komoditas: "Beras Premium",
            satuan: "kg",
            pasar: "Pasar Wonokromo",
            harga: 14900,
          },
        ],
        null,
        2,
      )
      mime = "application/json"
    }

    const blob = new Blob([isi], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `template-harga.${ext}`
    a.click()
    URL.revokeObjectURL(url)
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
          Unggah data harga sesuai template. Sistem menampilkan pratinjau
          sebelum data disimpan ke database.
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
                <span className="text-xs text-[#171717]/40 dark:text-white/40">
                  ({baris.length} baris)
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setNamaFile(null)
                  setBaris([])
                }}
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
            disabled={!namaFile || baris.length === 0 || loading}
            className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white transition ${
              namaFile && baris.length > 0 && !loading
                ? "bg-[#C93742] hover:bg-[#B52F39]"
                : "cursor-not-allowed bg-[#171717]/20 dark:bg-white/10"
            }`}
          >
            <Check size={16} />
            {loading ? "Menyimpan..." : "Simpan ke Database"}
          </button>

          {error && (
            <p className="mt-3 flex items-start gap-1.5 text-xs text-[#C93742]">
              <AlertTriangle size={13} className="mt-0.5 shrink-0" />
              {error}
            </p>
          )}

          {hasil && (
            <p className="mt-3 flex items-start gap-1.5 text-xs text-[#1C8C4A] dark:text-emerald-400">
              <Info size={13} className="mt-0.5 shrink-0" />
              Selesai. {hasil.berhasil} baris berhasil, {hasil.gagal} dilewati
              (status: {hasil.status}).
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
              label="Template CSV"
              ext=".csv"
              onClick={() => unduhTemplate("csv")}
            />
            <TemplateBtn
              icon={FileJson}
              label="Template JSON"
              ext=".json"
              onClick={() => unduhTemplate("json")}
            />
          </div>

          <div className="mt-5 rounded-xl bg-[#FAF7F7] dark:bg-[#121212] p-4">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-[#171717]/40 dark:text-white/40">
              Kolom wajib
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
            {baris.length > 0 ? `${baris.length} baris` : "Belum ada berkas"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead>
              <tr className="border-b border-[#171717]/[0.06] dark:border-white/10 text-[11px] uppercase tracking-wide text-[#171717]/40 dark:text-white/40">
                {KOLOM.map((k) => (
                  <th key={k} className={`px-6 py-3 font-semibold ${k === "harga" ? "text-right" : ""}`}>
                    {k}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {baris.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-[#171717]/40 dark:text-white/40">
                    Unggah berkas untuk melihat pratinjau di sini.
                  </td>
                </tr>
              ) : (
                baris.slice(0, 50).map((r, i) => (
                  <tr
                    key={i}
                    className="border-b border-[#171717]/[0.04] dark:border-white/[0.06] last:border-0"
                  >
                    <td className="px-6 py-3 text-sm text-[#171717] dark:text-white">{r.tanggal || "-"}</td>
                    <td className="px-6 py-3 text-sm text-[#171717]/55 dark:text-white/55">{r.kategori || "-"}</td>
                    <td className="px-6 py-3 text-sm font-semibold text-[#171717] dark:text-white">{r.komoditas || "-"}</td>
                    <td className="px-6 py-3 text-sm text-[#171717]/55 dark:text-white/55">{r.satuan || "-"}</td>
                    <td className="px-6 py-3 text-sm text-[#171717]/55 dark:text-white/55">{r.pasar || "-"}</td>
                    <td className="px-6 py-3 text-right text-sm font-semibold text-[#171717] dark:text-white">{r.harga || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {baris.length > 50 && (
          <div className="border-t border-[#171717]/[0.06] dark:border-white/10 px-6 py-3">
            <p className="text-xs text-[#171717]/40 dark:text-white/40">
              Menampilkan 50 baris pertama dari {baris.length} baris.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}

function TemplateBtn({
  icon: Icon,
  label,
  ext,
  onClick,
}: {
  icon: typeof FileSpreadsheet
  label: string
  ext: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
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
