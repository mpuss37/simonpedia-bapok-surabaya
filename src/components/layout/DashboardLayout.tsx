import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-[#FAF7F7]">

      {/* SIDEBAR */}
      <Sidebar />

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