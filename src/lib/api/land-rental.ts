import api from "@/lib/api"
import type { LandRental, CreateLandRentalDto } from "@/lib/types/land-rental"
import type { PaginatedResponse } from "@/lib/types/fleet"

export const landRentalApi = {
  rentals: {
    list: (params?: Record<string, unknown>) =>
      api.get<PaginatedResponse<LandRental>>("/land-rentals", { params }).then(r => r.data),

    get: (id: string) =>
      api.get<LandRental>(`/land-rentals/${id}`).then(r => r.data),

    create: (dto: CreateLandRentalDto) =>
      api.post<LandRental>("/land-rentals", dto).then(r => r.data),

    update: (id: string, dto: Partial<CreateLandRentalDto>) =>
      api.patch<LandRental>(`/land-rentals/${id}`, dto).then(r => r.data),

    delete: (id: string) =>
      api.delete(`/land-rentals/${id}`).then(r => r.data),

    importBulk: (dtos: Partial<CreateLandRentalDto>[]) =>
      api.post<{ count: number }>("/land-rentals/bulk", dtos).then(r => r.data),
  },

  reports: {
    export: (format: string) =>
      api.get("/land-rental-management/export", { params: { format }, responseType: 'blob' }),
  },
}
