export interface ProjectSite {
  id: string
  siteName: string
  location?: string
  district?: string
  province?: string
  coordinates?: string
  phase: "exploration" | "drilling" | "production" | "decommissioned"
  status: "active" | "inactive"
  siteInCharge?: string
  contactPhone?: string
  startDate?: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface CreateSiteDto {
  siteName: string
  location?: string
  district?: string
  province?: string
  coordinates?: string
  phase?: string
  status?: string
  siteInCharge?: string
  contactPhone?: string
  startDate?: string
  description?: string
}
