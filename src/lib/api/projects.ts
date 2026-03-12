import api from "@/lib/api"
import type { Project, CreateProjectDto } from "@/lib/types/projects"
import type { PaginatedResponse } from "@/lib/types/fleet"

export const projectsApi = {
  projects: {
    list: (params?: Record<string, unknown>) =>
      api.get<PaginatedResponse<Project>>("/projects", { params }).then(r => r.data),

    get: (id: string) =>
      api.get<Project>(`/projects/${id}`).then(r => r.data),

    create: (dto: CreateProjectDto) =>
      api.post<Project>("/projects", dto).then(r => r.data),

    importBulk: (dtos: Partial<CreateProjectDto>[]) =>
      api.post<{ count: number }>("/projects/bulk", dtos).then(r => r.data),

    update: (id: string, dto: Partial<CreateProjectDto>) =>
      api.patch<Project>(`/projects/${id}`, dto).then(r => r.data),

    delete: (id: string) =>
      api.delete(`/projects/${id}`).then(r => r.data),
  },

  reports: {
    export: (type: string, format: string) =>
      api.get(`/projects-management/export/${type}`, { params: { format }, responseType: 'blob' }),
  },
}
