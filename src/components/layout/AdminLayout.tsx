import { useState } from "react"
import { NavLink, Outlet, Navigate } from "react-router-dom"
import {
  LayoutDashboard,
  Upload,
  History,
  Tags,
  ScrollText,
  ArrowLeft,
  Menu,
  X,
  LogOut,
} from "lucide-react"
import { sudahMasuk, hapusToken } from "../../services/admin"

const menu = [
  { label: "Dashboard Admin", path: "/admin", icon: LayoutDashboard, end: true },
  { label: "Input Data", path: "/admin/input", icon: Upload, end: false },
  { label: "Riwayat Input", path: "/admin/riwayat", icon: History, end: false },
  { label: "Kelola HET", path: "/admin/het", icon: Tags, end: false },
  { label: "Audit Log", path: "/admin/audit", icon: ScrollText, end: false },
]

export default function AdminLayout() {
  const [open, setOpen] = useState(false)

  // Penjaga route: bila belum masuk, arahkan ke halaman login admin.
  if (!sudahMasuk()) {
    return <Navigate to="/login-admin" replace />
  }

  function keluar() {
    hapusToken()
    window.location.href = "/login-admin"
  }

  return (
    <div className="min-h-screen bg-[#FAF7F7] dark:bg-[#121212]">
      {/* BACKDROP (mobile) */}
      {open && (
        <button
          type="button"
          aria-label="Tutup menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* SIDEBAR ADMIN */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[250px] flex-col border-r border-[#171717]/[0.07] bg-[#171717] transition-transform duration-300 ease-in-out dark:border-white/10 dark:bg-[#0E0E0E] ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* LOGO */}
        <div className="border-b border-white/10 px-7 pb-5 pt-7">
          <div className="flex items-center gap-2">
            <h1 className="text-[18px] font-black tracking-[-0.04em] text-white">
              SIMONPEDIA
            </h1>
          </div>
          <p className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-white/45">
            Panel Admin
          </p>

          <button
            type="button"
            aria-label="Tutup menu"
            onClick={() => setOpen(false)}
            className="absolute right-4 top-5 flex h-9 w-9 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* MENU */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 pt-5">
          <p className="mb-2.5 px-3 text-[9px] font-bold tracking-[0.16em] text-white/35">
            KELOLA
          </p>
          <nav className="space-y-1">
            {menu.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-[#C93742] text-white shadow-[0_6px_18px_rgba(201,55,66,0.35)]"
                        : "text-white/70 hover:bg-white/[0.07] hover:text-white"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={17}
                        strokeWidth={2}
                        className={isActive ? "text-white" : "text-white/40 group-hover:text-white"}
                      />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* KEMBALI KE SITUS */}
        <div className="border-t border-white/10 p-4">
          <NavLink
            to="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] font-medium text-white/65 transition hover:bg-white/[0.07] hover:text-white"
          >
            <ArrowLeft size={17} className="text-white/40" />
            <span>Kembali ke Situs</span>
          </NavLink>

          <button
            type="button"
            onClick={keluar}
            className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] font-medium text-[#F87171] transition hover:bg-white/[0.07]"
          >
            <LogOut size={17} className="text-[#F87171]/70" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#171717]/[0.07] bg-[#171717] px-4 lg:hidden">
        <button
          type="button"
          aria-label="Buka menu"
          onClick={() => setOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-white/80 transition hover:bg-white/10"
        >
          <Menu size={22} />
        </button>
        <span className="text-[15px] font-black tracking-[-0.04em] text-white">
          Panel Admin
        </span>
      </header>

      {/* KONTEN */}
      <main className="min-h-screen lg:ml-[250px]">
        <Outlet />
      </main>
    </div>
  )
}
