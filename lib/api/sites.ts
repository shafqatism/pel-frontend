import api from "@/lib/api"
import type { ProjectSite, CreateSiteDto } from "@/lib/types/sites"
import type { PaginatedResponse } from "@/lib/types/fleet"

export const sitesApi = {
  sites: {
    list: (params?: Record<string, unknown>) =>
      api.get<PaginatedResponse<ProjectSite>>("/sites", { params }).then(r => r.data),

    get: (id: string) =>
      api.get<ProjectSite>(`/sites/${id}`).then(r => r.data),

    create: (dto: CreateSiteDto) =>
      api.post<ProjectSite>("/sites", dto).then(r => r.data),

    update: (id: string, dto: Partial<CreateSiteDto>) =>
      api.patch<ProjectSite>(`/sites/${id}`, dto).then(r => r.data),

    delete: (id: string) =>
      api.delete(`/sites/${id}`).then(r => r.data),
    
    dropdown: () =>
      api.get<Pick<ProjectSite, "id" | "siteName">[]>("/sites/dropdown").then(r => r.data).catch(() => []),
  },
}
