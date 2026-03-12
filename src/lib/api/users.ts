import api from "@/lib/api"

export const usersApi = {
  list: () => api.get("/users").then((res) => res.data),
  get: (id: string) => api.get(`/users/${id}`).then((res) => res.data),
  create: (data: any) => api.post("/users", data).then((res) => res.data),
  update: (id: string, data: any) => api.patch(`/users/${id}`, data).then((res) => res.data),
  delete: (id: string) => api.delete(`/users/${id}`).then((res) => res.data),
}
