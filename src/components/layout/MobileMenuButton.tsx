import { Menu } from "lucide-react"
import { useSidebar } from "../../context/sidebar-context"

/**
 * Tombol hamburger pembuka sidebar.
 * Hanya tampil di layar kecil (mobile); di desktop sidebar selalu terlihat.
 */
export default function MobileMenuButton() {
  const { toggle } = useSidebar()

  return (
    <button
      type="button"
      aria-label="Buka menu"
      onClick={toggle}
      className="mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#171717]/70 transition hover:bg-[#171717]/[0.06] hover:text-[#171717] lg:hidden dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
    >
      <Menu size={20} />
    </button>
  )
}
