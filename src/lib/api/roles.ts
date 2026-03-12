import api from "@/lib/api"
import type { Role, CreateRoleDto } from "@/lib/types/roles"

export const rolesApi = {
  list: () => api.get<Role[]>("/roles").then(r => r.data),
  get: (id: string) => api.get<Role>(`/roles/${id}`).then(r => r.data),
  create: (dto: CreateRoleDto) => api.post<Role>("/roles", dto).then(r => r.data),
  update: (id: string, dto: CreateRoleDto) => api.patch<Role>(`/roles/${id}`, dto).then(r => r.data),
  delete: (id: string) => api.delete(`/roles/${id}`).then(r => r.data),
  getModules: () => api.get<string[]>("/roles/modules").then(r => r.data),
}
