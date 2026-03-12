import type { Attachment } from "./common"

export interface Project {
  id: string
  name: string
  startDate?: string
  endDate?: string
  description?: string
  status: "active" | "inactive" | "completed" | "on_hold"
  companyId?: string
  company?: {
    id: string
    name: string
  }
  attachments?: Attachment[]
  createdAt: string
  updatedAt: string
}

export interface CreateProjectDto {
  name: string
  startDate?: string
  endDate?: string
  description?: string
  status?: string
  companyId?: string
  attachments?: any[]
}
