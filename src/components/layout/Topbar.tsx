import { Bell, Search } from "lucide-react"

export default function Topbar() {
  return (
    <header className="fixed left-64 right-0 top-0 z-10 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8">

      {/* Search */}
      <div className="flex w-96 items-center gap-3 rounded-xl bg-slate-100 px-4 py-2.5">

        <Search
          size={18}
          className="text-slate-400"
        />

        <input
          type="text"
          placeholder="Cari komoditas, pasar..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
        />

      </div>

      {/* Right */}
      <div className="flex items-center gap-5">

        <button className="relative text-slate-500 hover:text-slate-900">

          <Bell size={21} />

          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            3
          </span>

        </button>

        <div className="h-8 w-px bg-slate-200" />

        <div className="flex items-center gap-3">

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
            A
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-800">
              Administrator
            </p>

            <p className="text-xs text-slate-400">
              Pemerintah Kota Surabaya
            </p>
          </div>

        </div>

      </div>

    </header>
  )
}