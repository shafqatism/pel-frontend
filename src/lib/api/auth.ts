import api from "@/lib/api"
import type { AuthResponse } from "@/lib/types/auth"

export const authApi = {
  login: (dto: any) =>
    api.post<AuthResponse>("/auth/login", dto).then(r => r.data),
  
  register: (dto: any) =>
    api.post<AuthResponse>("/auth/register", dto).then(r => r.data),

  me: () =>
    api.get<any>("/auth/me").then(r => r.data),
}
