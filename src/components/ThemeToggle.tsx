import { Moon, Sun } from "lucide-react"
import { useTheme } from "../context/theme-context"

interface ThemeToggleProps {
  className?: string
}

export default function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === "dark"

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
      title={isDark ? "Mode terang" : "Mode gelap"}
      className={
        className ??
        "flex h-10 w-10 items-center justify-center rounded-full border border-[#171717]/[0.06] bg-white text-[#171717]/60 transition hover:text-[#171717] dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:text-white"
      }
    >
      {isDark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  )
}
