// ─── Expense ─────────────────────────────────────────────────────────────────
export interface Expense {
  id: string
  title: string
  description?: string
  category: string
  amount: number
  dateIncurred: string
  status: "pending" | "approved" | "rejected"
  approvedBy?: string
  remarks?: string
  receiptUrl?: string
  site?: string
  department?: string
  createdAt: string
  updatedAt: string
}

export interface CreateExpenseDto {
  title: string
  description?: string
  category: string
  amount: number
  dateIncurred: string
  receiptUrl?: string
  site?: string
  department?: string
}

export interface UpdateExpenseStatusDto {
  status: "approved" | "rejected"
  remarks?: string
}
