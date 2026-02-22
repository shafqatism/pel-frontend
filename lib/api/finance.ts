import api from "@/lib/api"
import type {
  Expense, CreateExpenseDto, UpdateExpenseStatusDto,
} from "@/lib/types/finance"
import type { PaginatedResponse } from "@/lib/types/fleet"

export const financeApi = {
  expenses: {
    list: (params?: Record<string, unknown>) =>
      api.get<PaginatedResponse<Expense>>("/expenses", { params }).then(r => r.data),

    get: (id: string) =>
      api.get<Expense>(`/expenses/${id}`).then(r => r.data),

    create: (dto: CreateExpenseDto) =>
      api.post<Expense>("/expenses", dto).then(r => r.data),

    update: (id: string, dto: Partial<CreateExpenseDto>) =>
      api.patch<Expense>(`/expenses/${id}`, dto).then(r => r.data),

    updateStatus: (id: string, dto: UpdateExpenseStatusDto) =>
      api.patch<Expense>(`/expenses/${id}/status`, dto).then(r => r.data),

    delete: (id: string) =>
      api.delete(`/expenses/${id}`).then(r => r.data),

    summary: () =>
      api.get<any>("/expenses/summary").then(r => r.data).catch(() => ({ total: 0, categories: [] })),
  },
}
