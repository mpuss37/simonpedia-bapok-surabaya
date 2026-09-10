import { Outlet, useLocation } from "react-router-dom"
import { Bell } from "lucide-react"
import Sidebar from "./Sidebar"

export default function DashboardLayout() {
  const location = useLocation()

  const pageInfo: Record<
    string,
    { breadcrumb: string; title: string }
  > = {
    "/": {
      breadcrumb: "Dashboard",
      title: "Dashboard",
    },

    "/monitoring": {
      breadcrumb: "Monitoring",
      title: "Monitoring Harga",
    },

    "/pasar": {
      breadcrumb: "Data Pasar",
      title: "Daftar Pasar",
    },

    "/peta": {
      breadcrumb: "Monitoring",
      title: "Peta Pasar",
    },

    "/analisis": {
      breadcrumb: "Analisis",
      title: "Analisis Harga",
    },

    "/prediksi": {
      breadcrumb: "Analisis",
      title: "Prediksi Harga",
    },

    "/ews": {
      breadcrumb: "Alert & Action",
      title: "Early Warning System",
    },

    "/rekomendasi": {
      breadcrumb: "Alert & Action",
      title: "Rekomendasi",
    },

    "/notifikasi": {
      breadcrumb: "Personal",
      title: "Notifikasi",
    },

    "/watchlist": {
      breadcrumb: "Personal",
      title: "Watchlist",
    },

    "/data": {
      breadcrumb: "Personal",
      title: "Data & Export",
    },

    "/settings": {
      breadcrumb: "System",
      title: "Pengaturan",
    },
  }

  const currentPage = pageInfo[location.pathname] ?? {
    breadcrumb: "SIMONPEDIA",
    title: "Dashboard",
  }

  return (
    <div className="min-h-screen bg-[#FAF7F7]">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="min-h-screen lg:ml-[250px]">

        {/* TOP HEADER */}
        <header className="sticky top-0 z-40 border-b border-[#171717]/5 bg-[#FAF7F7]/95 backdrop-blur-md">

          <div className="flex h-[88px] items-center justify-between px-6 lg:px-8">

            {/* LEFT */}
            <div>

              <div className="flex items-center gap-1.5 text-xs text-[#171717]/35">

                <span>
                  SIMONPEDIA
                </span>

                <span>
                  /
                </span>

                <span>
                  {currentPage.breadcrumb}
                </span>

              </div>

              <h1 className="mt-1 text-xl font-bold tracking-tight text-[#171717]">
                {currentPage.title}
              </h1>

            </div>


            {/* RIGHT */}
            <div className="flex items-center gap-3">

              {/* UPDATE STATUS */}
              <div className="hidden items-center gap-2 rounded-full border border-[#171717]/5 bg-white px-4 py-2.5 shadow-sm sm:flex">

                <span className="h-2 w-2 rounded-full bg-emerald-500" />

                <span className="text-xs text-[#171717]/40">
                  Update terakhir
                </span>

                <span className="text-xs font-semibold text-[#171717]/70">
                  07 Agustus 2026 • 09:30 WIB
                </span>

              </div>


              {/* NOTIFICATION */}
              <button
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#171717]/5 bg-white text-[#171717]/50 shadow-sm transition hover:text-[#C93742]"
                title="Notifikasi"
              >
                <Bell size={17} />
              </button>

            </div>

          </div>

        </header>


        {/* PAGE */}
        <div>
          <Outlet />
        </div>

      </main>

    </div>
  )
}