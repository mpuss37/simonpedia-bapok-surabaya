import Sidebar from "./Sidebar"
import Topbar from "./Topbar"

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({
  children,
}: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-100">

      <Sidebar />

      <Topbar />

      <main className="ml-64 pt-20">
        <div className="p-8">
          {children}
        </div>
      </main>

    </div>
  )
}