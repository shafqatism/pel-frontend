import api from "@/lib/api"
import { Company, CreateCompanyDto } from "@/lib/types/company"
import { PaginatedResponse } from "@/lib/types/fleet" // Reusing the interface since it's the same structure

export const companiesApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Company>>("/companies", { params }).then(r => r.data),

  get: (id: string) =>
    api.get<Company>(`/companies/${id}`).then(r => r.data),

  create: (dto: CreateCompanyDto) =>
    api.post<Company>("/companies", dto).then(r => r.data),

  update: (id: string, dto: Partial<CreateCompanyDto>) =>
    api.patch<Company>(`/companies/${id}`, dto).then(r => r.data),

  delete: (id: string) =>
    api.delete(`/companies/${id}`).then(r => r.data),
}
