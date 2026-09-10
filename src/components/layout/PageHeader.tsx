import { Bell } from "lucide-react"

export default function PageHeader({
  breadcrumb,
  title,
  statusText,
}: {
  breadcrumb: string
  title: string
  statusText?: string
}) {
  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[#171717]/[0.06] bg-[#FAF7F7]/90 px-6 backdrop-blur-xl lg:px-8">
      <div>
        <p className="text-xs font-medium text-[#171717]/40">SIMONPEDIA / {breadcrumb}</p>
        <h1 className="mt-0.5 text-lg font-bold tracking-tight text-[#171717]">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-[#171717]/5 bg-white px-4 py-2.5 shadow-sm sm:flex">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-xs text-[#171717]/40">{statusText ?? "Monitoring aktif"}</span>
        </div>
        <button
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#171717]/[0.06] bg-white text-[#171717]/60"
          title="Notifikasi"
        >
          <Bell size={17} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#C93742]" />
        </button>
      </div>
    </header>
  )
}
