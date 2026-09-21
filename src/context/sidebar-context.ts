import { createContext, useContext } from "react"

export interface SidebarContextValue {
  /** Apakah sidebar sedang terbuka (relevan untuk tampilan mobile). */
  open: boolean
  /** Buka/tutup sidebar. */
  toggle: () => void
  /** Tutup sidebar (dipakai setelah memilih menu di mobile). */
  close: () => void
}

export const SidebarContext = createContext<SidebarContextValue | undefined>(
  undefined,
)

export function useSidebar() {
  const context = useContext(SidebarContext)

  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }

  return context
}
