export interface Settings {
  id: string
  companyName: string
  currency: string
  unitSystem: "metric" | "imperial"
  maintenanceIntervalKm: number
  systemEmail: string
  brandingColors: {
    primary: string
    secondary: string
    accent: string
  }
  enableNotifications: boolean
  updatedAt: string
}

export interface UpdateSettingsDto {
  companyName?: string
  currency?: string
  unitSystem?: string
  maintenanceIntervalKm?: number
  systemEmail?: string
  brandingColors?: {
    primary: string
    secondary: string
    accent: string
  }
  enableNotifications?: boolean
}
