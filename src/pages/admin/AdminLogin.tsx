import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Lock, ArrowRight, ArrowLeft, User } from "lucide-react"
import { loginAdmin } from "../../services/admin"

export default function AdminLogin() {
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleMasuk(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await loginAdmin(username, password)
      navigate("/admin")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal masuk")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#171717] px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
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
            Username
          </label>
          <div className="relative">
            <User
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
            />
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                setError(null)
              }}
              placeholder="Masukkan username"
              className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#C93742]/60"
            />
          </div>

          <label className="mb-1.5 mt-4 block text-xs font-semibold text-white/60">
            Password
          </label>
          <div className="relative">
            <Lock
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(null)
              }}
              placeholder="Masukkan password"
              className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#C93742]/60"
            />
          </div>

          {error && (
            <p className="mt-3 text-xs text-[#F87171]">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white transition ${
              loading ? "cursor-not-allowed bg-[#C93742]/60" : "bg-[#C93742] hover:bg-[#B52F39]"
            }`}
          >
            {loading ? "Memproses..." : "Masuk"}
            {!loading && <ArrowRight size={16} />}
          </button>
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
