import api from "@/lib/api"
import type { ProjectSite, CreateSiteDto } from "@/lib/types/sites"
import type { PaginatedResponse } from "@/lib/types/fleet"

export const sitesApi = {
  sites: {
    list: (params?: Record<string, unknown>) =>
      api.get<PaginatedResponse<ProjectSite>>("/project-sites", { params }).then(r => r.data),

    get: (id: string) =>
      api.get<ProjectSite>(`/project-sites/${id}`).then(r => r.data),

    create: (dto: CreateSiteDto) =>
      api.post<ProjectSite>("/project-sites", dto).then(r => r.data),

    update: (id: string, dto: Partial<CreateSiteDto>) =>
      api.patch<ProjectSite>(`/project-sites/${id}`, dto).then(r => r.data),

    delete: (id: string) =>
      api.delete(`/project-sites/${id}`).then(r => r.data),
    
    importBulk: (dtos: Partial<CreateSiteDto>[]) =>
      api.post<{ count: number }>("/project-sites/bulk", dtos).then(r => r.data),

    dropdown: () =>
      api.get<Pick<ProjectSite, "id" | "siteName">[]>("/project-sites/dropdown").then(r => r.data).catch(() => []),
  },

  reports: {
    export: (type: string, format: string) =>
      api.get(`/projects-management/export/${type}`, { params: { format }, responseType: 'blob' }),
  },
}
