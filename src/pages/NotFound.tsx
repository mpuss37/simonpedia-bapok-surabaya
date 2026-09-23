import { Link } from "react-router-dom"
import { Home, BarChart3, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF7F7] px-6 dark:bg-[#121212]">
      <div className="w-full max-w-md text-center">
        {/* ANGKA 404 */}
        <p className="text-[110px] font-black leading-none tracking-[-0.06em] text-[#C93742] lg:text-[140px]">
          404
        </p>

        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#171717] dark:text-white lg:text-3xl">
          Halaman tidak ditemukan
        </h1>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#171717]/50 dark:text-white/50">
          Halaman yang kamu cari tidak ada atau sudah dipindahkan. Coba kembali
          ke halaman utama untuk melanjutkan.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C93742] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#B52F39]"
          >
            <Home size={16} />
            Kembali ke Dashboard
          </Link>

          <Link
            to="/monitoring"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#171717]/[0.1] px-5 py-3 text-sm font-semibold text-[#171717]/70 transition hover:border-[#C93742]/40 hover:text-[#C93742] dark:border-white/10 dark:text-white/70 dark:hover:text-white"
          >
            <BarChart3 size={16} />
            Lihat Monitoring
          </Link>
        </div>

        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-1.5 text-xs font-medium text-[#171717]/40 transition hover:text-[#C93742] dark:text-white/40"
        >
          <ArrowLeft size={13} />
          SIMONPEDIA Bapok Surabaya
        </Link>
      </div>
    </div>
  )
}
