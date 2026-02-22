export interface LandRental {
  id: string
  landOwnerName: string
  landOwnerCnic?: string
  landOwnerPhone?: string
  location: string
  district?: string
  province?: string
  areaAcres?: number
  monthlyRent: number
  leaseStartDate: string
  leaseEndDate?: string
  status: "active" | "expired" | "terminated"
  purpose?: string
  agreementDocUrl?: string
  site?: string
  createdAt: string
  updatedAt: string
}

export interface CreateLandRentalDto {
  landOwnerName: string
  landOwnerCnic?: string
  landOwnerPhone?: string
  location: string
  district?: string
  province?: string
  areaAcres?: number
  monthlyRent: number
  leaseStartDate: string
  leaseEndDate?: string
  status?: string
  purpose?: string
  agreementDocUrl?: string
  site?: string
}
