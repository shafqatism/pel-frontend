import api from "@/lib/api"
import type {
  Vehicle, CreateVehicleDto, VehicleSummary,
  Trip, CreateTripDto,
  FuelLog, CreateFuelLogDto,
  MaintenanceRecord, CreateMaintenanceDto,
  VehicleAssignment, CreateAssignmentDto,
  PaginatedResponse,
} from "@/lib/types/fleet"

// ─── Vehicles ─────────────────────────────────────────────────────────────────
export const fleetApi = {
  vehicles: {
    list: (params?: Record<string, unknown>) =>
      api.get<PaginatedResponse<Vehicle>>("/fleet/vehicles", { params }).then(r => r.data),

    get: (id: string) =>
      api.get<Vehicle>(`/fleet/vehicles/${id}`).then(r => r.data),

    summary: () =>
      api.get<VehicleSummary>("/fleet/vehicles/summary").then(r => r.data),

    dropdown: () =>
      api.get<Pick<Vehicle, "id" | "registrationNumber" | "vehicleName">[]>("/fleet/vehicles/dropdown").then(r => r.data),

    compliance: () =>
      api.get<Vehicle[]>("/fleet/vehicles/compliance").then(r => r.data),

    maintenancePredictions: () =>
      api.get<any[]>("/fleet/vehicles/maintenance-predictions").then(r => r.data),

    create: (dto: CreateVehicleDto) =>
      api.post<Vehicle>("/fleet/vehicles", dto).then(r => r.data),

    update: (id: string, dto: Partial<CreateVehicleDto>) =>
      api.patch<Vehicle>(`/fleet/vehicles/${id}`, dto).then(r => r.data),

    delete: (id: string) =>
      api.delete(`/fleet/vehicles/${id}`).then(r => r.data),
  },

  // ─── Trips ──────────────────────────────────────────────────────────────────
  trips: {
    list: (params?: Record<string, unknown>) =>
      api.get<PaginatedResponse<Trip>>("/fleet/trips", { params }).then(r => r.data),

    get: (id: string) =>
      api.get<Trip>(`/fleet/trips/${id}`).then(r => r.data),

    create: (dto: CreateTripDto) =>
      api.post<Trip>("/fleet/trips", dto).then(r => r.data),

    update: (id: string, dto: Partial<CreateTripDto>) =>
      api.patch<Trip>(`/fleet/trips/${id}`, dto).then(r => r.data),

    delete: (id: string) =>
      api.delete(`/fleet/trips/${id}`).then(r => r.data),
  },

  // ─── Fuel ───────────────────────────────────────────────────────────────────
  fuel: {
    list: (params?: Record<string, unknown>) =>
      api.get<PaginatedResponse<FuelLog>>("/fleet/fuel", { params }).then(r => r.data),

    get: (id: string) =>
      api.get<FuelLog>(`/fleet/fuel/${id}`).then(r => r.data),

    create: (dto: CreateFuelLogDto) =>
      api.post<FuelLog>("/fleet/fuel", dto).then(r => r.data),

    update: (id: string, dto: Partial<CreateFuelLogDto>) =>
      api.patch<FuelLog>(`/fleet/fuel/${id}`, dto).then(r => r.data),

    delete: (id: string) =>
      api.delete(`/fleet/fuel/${id}`).then(r => r.data),
  },

  // ─── Maintenance ─────────────────────────────────────────────────────────────
  maintenance: {
    list: (params?: Record<string, unknown>) =>
      api.get<PaginatedResponse<MaintenanceRecord>>("/fleet/maintenance", { params }).then(r => r.data),

    create: (dto: CreateMaintenanceDto) =>
      api.post<MaintenanceRecord>("/fleet/maintenance", dto).then(r => r.data),

    update: (id: string, dto: Partial<CreateMaintenanceDto>) =>
      api.patch<MaintenanceRecord>(`/fleet/maintenance/${id}`, dto).then(r => r.data),

    delete: (id: string) =>
      api.delete(`/fleet/maintenance/${id}`).then(r => r.data),
  },

  // ─── Assignments ─────────────────────────────────────────────────────────────
  assignments: {
    list: (params?: Record<string, unknown>) =>
      api.get<PaginatedResponse<VehicleAssignment>>("/fleet/assignments", { params }).then(r => r.data),

    create: (dto: CreateAssignmentDto) =>
      api.post<VehicleAssignment>("/fleet/assignments", dto).then(r => r.data),

    update: (id: string, dto: Partial<CreateAssignmentDto>) =>
      api.patch<VehicleAssignment>(`/fleet/assignments/${id}`, dto).then(r => r.data),

    delete: (id: string) =>
      api.delete(`/fleet/assignments/${id}`).then(r => r.data),
  },

  // ─── Reports & Summary ───────────────────────────────────────────────────────
  reports: {
    stats: () =>
      api.get<any>("/fleet/stats").then(r => r.data),
    
    summary: () =>
      api.get<any[]>("/fleet/reports/summary").then(r => r.data),
    
    vehicleReport: (id: string) =>
      api.get<any>(`/fleet/reports/vehicle/${id}`).then(r => r.data),
  },
}
