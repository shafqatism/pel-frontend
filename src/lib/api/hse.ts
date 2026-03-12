import api from "@/lib/api"
import type { Incident, SafetyAudit, HseDrill, CreateIncidentDto, CreateAuditDto, CreateDrillDto } from "@/lib/types/hse"
import type { PaginatedResponse } from "@/lib/types/fleet"

export const hseApi = {
  incidents: {
    list: (params?: Record<string, unknown>) =>
      api.get<PaginatedResponse<Incident>>("/hse/incidents", { params }).then(r => r.data),
    create: (dto: CreateIncidentDto) =>
      api.post<Incident>("/hse/incidents", dto).then(r => r.data),
    update: (id: string, dto: Partial<CreateIncidentDto>) =>
      api.patch<Incident>(`/hse/incidents/${id}`, dto).then(r => r.data),
    delete: (id: string) =>
      api.delete(`/hse/incidents/${id}`).then(r => r.data),
  },
  audits: {
    list: (params?: Record<string, unknown>) =>
      api.get<PaginatedResponse<SafetyAudit>>("/hse/audits", { params }).then(r => r.data),
    create: (dto: CreateAuditDto) =>
      api.post<SafetyAudit>("/hse/audits", dto).then(r => r.data),
    update: (id: string, dto: Partial<CreateAuditDto>) =>
      api.patch<SafetyAudit>(`/hse/audits/${id}`, dto).then(r => r.data),
    delete: (id: string) =>
      api.delete(`/hse/audits/${id}`).then(r => r.data),
  },
  drills: {
    list: (params?: Record<string, unknown>) =>
      api.get<PaginatedResponse<HseDrill>>("/hse/drills", { params }).then(r => r.data),
    create: (dto: CreateDrillDto) =>
      api.post<HseDrill>("/hse/drills", dto).then(r => r.data),
    update: (id: string, dto: Partial<CreateDrillDto>) =>
      api.patch<HseDrill>(`/hse/drills/${id}`, dto).then(r => r.data),
    delete: (id: string) =>
      api.delete(`/hse/drills/${id}`).then(r => r.data),

    importBulk: (dtos: Partial<CreateDrillDto>[]) =>
      api.post<{ count: number }>("/hse/drills/bulk", dtos).then(r => r.data),
  },

  reports: {
    export: (type: string, format: string) =>
      api.get(`/hse-management/export/${type}`, { params: { format }, responseType: 'blob' }),
  },

  importBulk: {
    incidents: (dtos: Partial<CreateIncidentDto>[]) =>
      api.post<{ count: number }>("/hse/incidents/bulk", dtos).then(r => r.data),
    audits: (dtos: Partial<CreateAuditDto>[]) =>
      api.post<{ count: number }>("/hse/audits/bulk", dtos).then(r => r.data),
  },

  stats: () =>
    api.get<{ severityCount: Record<string, number>, statusCount: Record<string, number>, avgAuditScore: number }>("/hse/stats").then(r => r.data),
}
