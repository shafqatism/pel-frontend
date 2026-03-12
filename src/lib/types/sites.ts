import { Attachment } from "./common"

export interface SiteFieldOfficer {
  id: string
  siteId: string
  employeeId: string
  assignedAt: string
  unassignedAt?: string
  status: "active" | "previous"
  employee?: {
    id: string
    fullName: string
    designation: string
  }
}

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
  siteCreatedDate?: string
  description?: string
  projectId?: string
  project?: {
    id: string
    name: string
  }
  fieldOfficers?: SiteFieldOfficer[]
  attachments?: Attachment[]
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
  fieldOfficerIds?: string[]
  projectId?: string
  attachments?: Attachment[]
}

