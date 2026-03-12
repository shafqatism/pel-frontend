import api from "@/lib/api"
import type {
  Expense, CreateExpenseDto, UpdateExpenseStatusDto,
} from "@/lib/types/finance"
import type { PaginatedResponse } from "@/lib/types/fleet"

export const financeApi = {
  expenses: {
    list: (params?: Record<string, unknown>) =>
      api.get<PaginatedResponse<Expense>>("/finance/expenses", { params }).then(r => r.data),

    get: (id: string) =>
      api.get<Expense>(`/finance/expenses/${id}`).then(r => r.data),

    create: (dto: CreateExpenseDto) =>
      api.post<Expense>("/finance/expenses", dto).then(r => r.data),

    update: (id: string, dto: Partial<CreateExpenseDto>) =>
      api.patch<Expense>(`/finance/expenses/${id}`, dto).then(r => r.data),

    updateStatus: (id: string, dto: UpdateExpenseStatusDto) =>
      api.patch<Expense>(`/finance/expenses/${id}/status`, dto).then(r => r.data),

    delete: (id: string) =>
      api.delete(`/finance/expenses/${id}`).then(r => r.data),

    summary: () =>
      api.get<any>("/finance/expenses/stats").then(r => r.data).catch(() => ({ totalSpent: 0, byCategory: {} })),

    trends: () =>
      api.get<{ month: string, amount: number }[]>("/finance/expenses/trends").then(r => r.data),
  },
}
