// ─── Vehicle ────────────────────────────────────────────────────────────────
export interface Vehicle {
  id: string
  registrationNumber: string
  vehicleName: string
  make?: string
  model?: string
  year?: number
  color?: string
  chassisNumber?: string
  engineNumber?: string
  type: "sedan" | "suv" | "pickup" | "truck" | "bus" | "van" | "motorcycle" | "heavy_equipment"
  fuelType: "petrol" | "diesel" | "cng" | "electric" | "hybrid"
  ownershipStatus: "company_owned" | "leased" | "rented" | "contractor"
  status: "active" | "in_maintenance" | "inactive" | "decommissioned"
  assignedSite?: string
  assignedDepartment?: string
  currentDriverName?: string
  currentOdometerKm: number
  maintenanceIntervalKm: number
  maintenanceIntervalDays: number
  insuranceExpiry?: string
  registrationExpiry?: string
  fitnessExpiry?: string
  createdAt: string
  updatedAt: string
}

export interface VehicleSummary {
  total: number
  active: number
  in_maintenance: number
  inactive: number
  decommissioned: number
}

export interface CreateVehicleDto {
  registrationNumber: string
  vehicleName: string
  make?: string
  model?: string
  year?: number
  color?: string
  chassisNumber?: string
  engineNumber?: string
  type?: string
  fuelType?: string
  ownershipStatus?: string
  status?: string
  assignedSite?: string
  assignedDepartment?: string
  currentDriverName?: string
  currentOdometerKm?: number
  maintenanceIntervalKm?: number
  maintenanceIntervalDays?: number
  insuranceExpiry?: string
  registrationExpiry?: string
  fitnessExpiry?: string
}

// ─── Trip ────────────────────────────────────────────────────────────────────
export interface Trip {
  id: string
  vehicleId: string
  vehicle?: Pick<Vehicle, "id" | "registrationNumber" | "vehicleName">
  destination: string
  purposeOfVisit?: string
  tripDate: string
  meterOut: number
  meterIn?: number
  timeOut?: string
  timeIn?: string
  driverName?: string
  alternativeDriverName?: string
  personTravelList?: string[]
  fuelAllottedLiters?: number
  fuelCostPkr?: number
  status: string
  distanceKm?: number
  createdAt: string
}

export interface CreateTripDto {
  vehicleId: string
  destination: string
  purposeOfVisit?: string
  tripDate: string
  meterOut: number
  meterIn?: number
  timeOut?: string
  timeIn?: string
  driverName?: string
  alternativeDriverName?: string
  personTravelList?: string[]
  fuelAllottedLiters?: number
  fuelCostPkr?: number
}

// ─── Fuel Log ────────────────────────────────────────────────────────────────
export interface FuelLog {
  id: string
  vehicleId: string
  vehicle?: Pick<Vehicle, "id" | "registrationNumber" | "vehicleName">
  date: string
  quantityLiters: number
  ratePerLiter: number
  totalCost: number
  odometerReading: number
  stationName?: string
  paymentMethod?: string
  receiptUrl?: string
  createdAt: string
}

export interface CreateFuelLogDto {
  vehicleId: string
  date: string
  quantityLiters: number
  ratePerLiter: number
  totalCost: number
  odometerReading: number
  stationName?: string
  paymentMethod?: string
}

// ─── Maintenance ─────────────────────────────────────────────────────────────
export interface MaintenanceRecord {
  id: string
  vehicleId: string
  vehicle?: Pick<Vehicle, "id" | "registrationNumber" | "vehicleName">
  type?: string
  description?: string
  maintenanceDate: string
  costPkr: number
  shopOrPerson?: string
  odometerAtMaintenanceKm?: number
  nextServiceOdometerKm?: number
  nextServiceDueDate?: string
  maintenanceBy?: string
  documentUrls?: string[]
  createdAt: string
}

export interface CreateMaintenanceDto {
  vehicleId: string
  type?: string
  description?: string
  maintenanceDate: string
  costPkr: number
  shopOrPerson?: string
  odometerAtMaintenanceKm?: number
  nextServiceOdometerKm?: number
  nextServiceDueDate?: string
  maintenanceBy?: string
}

// ─── Assignment ───────────────────────────────────────────────────────────────
export interface VehicleAssignment {
  id: string
  vehicleId: string
  vehicle?: Pick<Vehicle, "id" | "registrationNumber" | "vehicleName">
  assignedTo: string
  assignedBy: string
  assignmentDate: string
  returnDate?: string
  purpose?: string
  status: string
  createdAt: string
}

export interface CreateAssignmentDto {
  vehicleId: string
  assignedTo: string
  assignedBy: string
  assignmentDate: string
  returnDate?: string
  purpose?: string
}

export interface FleetSummaryRecord extends Vehicle {
  totalKm: number
  totalFuelCost: number
  totalFuelLiters: number
  totalMaintenanceCost: number
  tripCount: number
  fuelCount: number
  maintenanceCount: number
  assignmentCount: number
}

// ─── Paginated Response ───────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
