export interface Settings {
  id: string
  companyName: string
  currency: string
  unitSystem: "metric" | "imperial"
  maintenanceIntervalKm: number
  systemEmail: string
  logoUrl?: string | null
  brandingColors: {
    primary: string
    primaryForeground: string
    secondary: string
    secondaryForeground: string
    accent: string
    accentForeground: string
    success: string
    successForeground: string
    warning: string
    warningForeground: string
    destructive: string
    destructiveForeground: string
    background: string
    foreground: string
    card: string
    cardForeground: string
    popover: string
    popoverForeground: string
    border: string
    input: string
    ring: string
    sidebar: string
    sidebarForeground: string
    sidebarAccent: string
    sidebarAccentForeground: string
  }
  enableNotifications: boolean
  r2AccountId?: string
  r2AccessKeyId?: string
  r2SecretAccessKey?: string
  r2BucketName?: string
  r2PublicCustomDomain?: string
  customPresets?: { title: string, desc: string, colors: any }[]
  updatedAt: string
}

export interface UpdateSettingsDto {
  companyName?: string
  currency?: string
  unitSystem?: string
  maintenanceIntervalKm?: number
  systemEmail?: string
  logoUrl?: string | null
  brandingColors?: {
    primary: string
    primaryForeground: string
    secondary: string
    secondaryForeground: string
    accent: string
    accentForeground: string
    success: string
    successForeground: string
    warning: string
    warningForeground: string
    destructive: string
    destructiveForeground: string
    background: string
    foreground: string
    card: string
    cardForeground: string
    popover: string
    popoverForeground: string
    border: string
    input: string
    ring: string
    sidebar: string
    sidebarForeground: string
    sidebarAccent: string
    sidebarAccentForeground: string
  }
  enableNotifications?: boolean
  r2AccountId?: string
  r2AccessKeyId?: string
  r2SecretAccessKey?: string
  r2BucketName?: string
  r2PublicCustomDomain?: string
  customPresets?: { title: string, desc: string, colors: any }[]
}
