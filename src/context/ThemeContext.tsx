import { useEffect, useState } from "react"
import type { ReactNode } from "react"

import { ThemeContext, getInitialTheme } from "./theme-context"

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement

    root.classList.toggle("dark", theme === "dark")
    root.style.colorScheme = theme
    window.localStorage.setItem("simonpedia-theme", theme)
  }, [theme])

  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"))

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
