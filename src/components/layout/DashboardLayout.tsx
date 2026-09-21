import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import { SidebarProvider } from "../../context/SidebarContext"
import { useSidebar } from "../../context/sidebar-context"

function DashboardShell() {
  const { open, close } = useSidebar()

  return (
    <div className="min-h-screen bg-[#FAF7F7] dark:bg-[#121212]">

      {/* SIDEBAR */}
      <Sidebar />

      {/* BACKDROP (mobile) — klik untuk menutup sidebar */}
      {open && (
        <button
          type="button"
          aria-label="Tutup menu"
          onClick={close}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* MAIN CONTENT */}
      <main className="min-h-screen lg:ml-[250px]">

        {/* PAGE */}
        <div>
          <Outlet />
        </div>

      </main>

    </div>
  )
}

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <DashboardShell />
    </SidebarProvider>
  )
}
