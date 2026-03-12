"use client"

import React, { createContext, useContext, useState, useCallback } from "react"

export type Section =
  | "dashboard"
  | "projects"
  | "fleet-vehicles"
  | "fleet-trips"
  | "fleet-fuel"
  | "fleet-maintenance"
  | "fleet-assignments"
  | "fleet-summary"
  | "hr-employees"
  | "hr-attendance"
  | "hr-attendance-history"
  | "finance-expenses"
  | "sites"
  | "land-rental"
  | "food"
  | "documents"
  | "hse"
  | "companies"
  | "settings"
  | "settings-general"
  | "settings-branding"
  | "settings-presets"
  | "settings-notifications"
  | "settings-roles"
  | "settings-storage"
  | "settings-config"
  | "settings-business"
  | "hr-employee-report"
  | "companies-report"
  | "sites-report"
  | "projects-report"

interface NavContextValue {
  active: Section
  setActive: (s: Section) => void
  breadcrumb: string[]
  setBreadcrumb: (b: string[]) => void
  metadata: Record<string, any> | null
  setMetadata: (data: Record<string, any> | null) => void
}

const NavContext = createContext<NavContextValue>({
  active: "dashboard",
  setActive: () => {},
  breadcrumb: ["Dashboard"],
  setBreadcrumb: () => {},
  metadata: null,
  setMetadata: () => {},
})

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [active, setActiveRaw] = useState<Section>("dashboard")
  const [breadcrumb, setBreadcrumb] = useState<string[]>(["Dashboard"])
  const [metadata, setMetadata] = useState<Record<string, any> | null>(null)

  const setActive = useCallback((s: Section) => {
    setActiveRaw(s)
  }, [])

  return (
    <NavContext.Provider value={{ active, setActive, breadcrumb, setBreadcrumb, metadata, setMetadata }}>
      {children}
    </NavContext.Provider>
  )
}

export function useNav() {
  return useContext(NavContext)
}
