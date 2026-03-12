import { Attachment } from "./common"

export interface LandRental {
  id: string
  landOwnerName: string
  landOwnerCnic?: string
  cnicExpiryDate?: string
  landOwnerPhone?: string
  location: string
  district?: string
  province?: string
  areaAcres?: number
  yearlyRent: number
  leaseStartDate: string
  leaseEndDate?: string
  status: "active" | "expired" | "terminated"
  purpose?: string
  agreementDocUrl?: string
  siteId?: string
  site?: {
    id: string
    siteName: string
  }
  attachments?: Attachment[]
  createdAt: string
  updatedAt: string
}

export interface CreateLandRentalDto {
  landOwnerName: string
  landOwnerCnic?: string
  cnicExpiryDate?: string
  landOwnerPhone?: string
  location: string
  district?: string
  province?: string
  areaAcres?: number
  yearlyRent: number
  leaseStartDate: string
  leaseEndDate?: string
  status?: string
  purpose?: string
  agreementDocUrl?: string
  siteId?: string
  site?: string
  attachments?: Attachment[]
}
