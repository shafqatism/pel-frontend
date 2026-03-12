import api from "@/lib/api"
import type { FoodMessRecord, CreateFoodMessDto } from "@/lib/types/food"
import type { PaginatedResponse } from "@/lib/types/fleet"

export const foodApi = {
  records: {
    list: (params?: Record<string, unknown>) =>
      api.get<PaginatedResponse<FoodMessRecord>>("/food", { params }).then(r => r.data),

    get: (id: string) =>
      api.get<FoodMessRecord>(`/food/${id}`).then(r => r.data),

    create: (dto: CreateFoodMessDto) =>
      api.post<FoodMessRecord>("/food", dto).then(r => r.data),

    bulkCreate: (dtos: Partial<CreateFoodMessDto>[]) =>
      api.post<{ count: number }>("/food/bulk", dtos).then(r => r.data),

    update: (id: string, dto: Partial<CreateFoodMessDto>) =>
      api.patch<FoodMessRecord>(`/food/${id}`, dto).then(r => r.data),

    delete: (id: string) =>
      api.delete(`/food/${id}`).then(r => r.data),
  },
}
