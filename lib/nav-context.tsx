"use client"

import React, { createContext, useContext, useState, useCallback } from "react"

export type Section =
  | "dashboard"
  | "fleet-vehicles"
  | "fleet-trips"
  | "fleet-fuel"
  | "fleet-maintenance"
  | "fleet-assignments"
  | "hr-employees"
  | "hr-attendance"
  | "finance-expenses"
  | "sites"
  | "food"
  | "documents"
  | "settings"

interface NavContextValue {
  active: Section
  setActive: (s: Section) => void
  breadcrumb: string[]
  setBreadcrumb: (b: string[]) => void
}

const NavContext = createContext<NavContextValue>({
  active: "dashboard",
  setActive: () => {},
  breadcrumb: ["Dashboard"],
  setBreadcrumb: () => {},
})

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [active, setActiveRaw] = useState<Section>("dashboard")
  const [breadcrumb, setBreadcrumb] = useState<string[]>(["Dashboard"])

  const setActive = useCallback((s: Section) => {
    setActiveRaw(s)
  }, [])

  return (
    <NavContext.Provider value={{ active, setActive, breadcrumb, setBreadcrumb }}>
      {children}
    </NavContext.Provider>
  )
}

export function useNav() {
  return useContext(NavContext)
}
