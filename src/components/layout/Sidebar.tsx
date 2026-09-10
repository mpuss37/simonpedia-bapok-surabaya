import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  BarChart3,
  Store,
  Map,
  TrendingUp,
  Brain,
  ShieldAlert,
  Lightbulb,
  Bell,
  Star,
  Download,
  Settings,
} from "lucide-react"

const menuGroups = [
  {
    title: "OVERVIEW",
    items: [
      {
        label: "Dashboard",
        path: "/",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "MONITORING",
    items: [
      {
        label: "Monitoring Harga",
        path: "/monitoring",
        icon: BarChart3,
      },
      {
        label: "Pasar",
        path: "/pasar",
        icon: Store,
      },
      {
        label: "Peta Surabaya",
        path: "/peta",
        icon: Map,
      },
    ],
  },
  {
    title: "ANALYTICS",
    items: [
      {
        label: "Analisis",
        path: "/analisis",
        icon: TrendingUp,
      },
      {
        label: "Prediksi",
        path: "/prediksi",
        icon: Brain,
      },
    ],
  },
  {
    title: "ALERT & ACTION",
    items: [
      {
        label: "Early Warning",
        path: "/ews",
        icon: ShieldAlert,
      },
      {
        label: "Rekomendasi",
        path: "/rekomendasi",
        icon: Lightbulb,
      },
    ],
  },
  {
    title: "PERSONAL",
    items: [
      {
        label: "Notifikasi",
        path: "/notifikasi",
        icon: Bell,
      },
      {
        label: "Watchlist",
        path: "/watchlist",
        icon: Star,
      },
    ],
  },
]

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-50 hidden h-screen w-[250px] flex-col border-r border-[#171717]/[0.07] bg-white lg:flex">

      {/* LOGO */}
      <div className="border-b border-[#171717]/[0.06] px-7 pb-5 pt-7">

        <NavLink to="/" className="block">
          <h1 className="text-[21px] font-black tracking-[-0.04em] text-[#C93742]">
            SIMONPEDIA
          </h1>

          <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#171717]/45">
            Bapok Surabaya
          </p>
        </NavLink>

      </div>


      {/* MENU */}

      <div className="flex-1 overflow-y-auto px-4 pb-6 pt-5">

        {menuGroups.map((group) => (
          <div key={group.title} className="mb-6">

            <p className="mb-2.5 px-3 text-[9px] font-bold tracking-[0.16em] text-[#171717]/40">
              {group.title}
            </p>

            <nav className="space-y-1">

              {group.items.map((item) => {
                const Icon = item.icon

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/"}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-[#C93742] text-white shadow-[0_6px_18px_rgba(201,55,66,0.25)]"
                          : "text-[#171717]/70 hover:bg-[#171717]/[0.035] hover:text-[#171717]"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-white/70" />
                        )}

                        <Icon
                          size={17}
                          strokeWidth={2}
                          className={`shrink-0 transition-colors ${
                            isActive ? "text-white" : "text-[#171717]/40 group-hover:text-[#C93742]"
                          }`}
                        />

                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                )
              })}

            </nav>

          </div>
        ))}

      </div>


      {/* BOTTOM */}

      <div className="border-t border-[#171717]/[0.06] p-4">

        <NavLink
          to="/data"
          className={({ isActive }) =>
            `mb-1 flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ${
              isActive
                ? "bg-[#C93742] text-white shadow-[0_6px_18px_rgba(201,55,66,0.25)]"
                : "text-[#171717]/65 hover:bg-[#171717]/[0.035] hover:text-[#171717]"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Download
                size={17}
                className={isActive ? "text-white" : "text-[#171717]/40"}
              />
              <span>Data & Export</span>
            </>
          )}
        </NavLink>


        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ${
              isActive
                ? "bg-[#C93742] text-white shadow-[0_6px_18px_rgba(201,55,66,0.25)]"
                : "text-[#171717]/65 hover:bg-[#171717]/[0.035] hover:text-[#171717]"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Settings
                size={17}
                className={isActive ? "text-white" : "text-[#171717]/40"}
              />
              <span>Pengaturan</span>
            </>
          )}
        </NavLink>

      </div>

    </aside>
  )
}