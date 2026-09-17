import { createContext, useContext } from "react"

export type Theme = "light" | "dark"

export interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(
  undefined,
)

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}

export function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light"

  const stored = window.localStorage.getItem("simonpedia-theme")

  if (stored === "light" || stored === "dark") {
    return stored
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}
