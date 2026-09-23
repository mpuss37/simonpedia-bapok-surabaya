import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { ShieldCheck, Lock, ArrowRight, ArrowLeft } from "lucide-react"

export default function AdminLogin() {
  const navigate = useNavigate()
  const [kode, setKode] = useState("")
  const [error, setError] = useState(false)

  function handleMasuk(e: React.FormEvent) {
    e.preventDefault()
    // Autentikasi belum difungsikan — untuk sementara langsung masuk.
    if (kode.trim().length === 0) {
      setError(true)
      return
    }
    navigate("/admin")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#171717] px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#C93742] text-white">
            <ShieldCheck size={28} />
          </span>
          <h1 className="text-2xl font-black tracking-[-0.04em] text-white">
            Panel Admin
          </h1>
          <p className="mt-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
            SIMONPEDIA Bapok Surabaya
          </p>
        </div>

        <form
          onSubmit={handleMasuk}
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
        >
          <label className="mb-1.5 block text-xs font-semibold text-white/60">
            Kode Akses Admin
          </label>
          <div className="relative">
            <Lock
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
            />
            <input
              type="password"
              value={kode}
              onChange={(e) => {
                setKode(e.target.value)
                setError(false)
              }}
              placeholder="Masukkan kode akses"
              className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#C93742]/60"
            />
          </div>

          {error && (
            <p className="mt-2 text-xs text-[#F87171]">
              Kode akses belum diisi.
            </p>
          )}

          <button
            type="submit"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#C93742] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#B52F39]"
          >
            Masuk
            <ArrowRight size={16} />
          </button>

          <p className="mt-4 text-center text-[11px] leading-5 text-white/35">
            Autentikasi belum difungsikan. Untuk sementara, isi apa saja lalu
            klik Masuk.
          </p>
        </form>

        <Link
          to="/"
          className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-white/50 transition hover:text-white"
        >
          <ArrowLeft size={14} />
          Kembali ke situs
        </Link>
      </div>
    </div>
  )
}
