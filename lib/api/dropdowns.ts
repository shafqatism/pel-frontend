import api from "@/lib/api"

export interface DropdownOption {
  id: string
  category: string
  label: string
  value: string
  createdAt: string
}

export const dropdownsApi = {
  get: (category: string) =>
    api.get<DropdownOption[]>(`/dropdowns`, { params: { category } }).then(r => r.data),

  create: (category: string, data: { label: string; value: string }) =>
    api.post<DropdownOption>(`/dropdowns`, data, { params: { category } }).then(r => r.data),

  delete: (id: string) =>
    api.delete(`/dropdowns/${id}`).then(r => r.data),
}
