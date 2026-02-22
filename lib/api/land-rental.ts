import api from "@/lib/api"
import type { LandRental, CreateLandRentalDto } from "@/lib/types/land-rental"
import type { PaginatedResponse } from "@/lib/types/fleet"

export const landRentalApi = {
  rentals: {
    list: (params?: Record<string, unknown>) =>
      api.get<PaginatedResponse<LandRental>>("/land-rental", { params }).then(r => r.data),

    get: (id: string) =>
      api.get<LandRental>(`/land-rental/${id}`).then(r => r.data),

    create: (dto: CreateLandRentalDto) =>
      api.post<LandRental>("/land-rental", dto).then(r => r.data),

    update: (id: string, dto: Partial<CreateLandRentalDto>) =>
      api.patch<LandRental>(`/land-rental/${id}`, dto).then(r => r.data),

    delete: (id: string) =>
      api.delete(`/land-rental/${id}`).then(r => r.data),
  },
}
