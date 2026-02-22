import api from "@/lib/api"
import type {
  Employee, CreateEmployeeDto,
  Attendance, CreateAttendanceDto,
} from "@/lib/types/hr"
import type { PaginatedResponse } from "@/lib/types/fleet"

export const hrApi = {
  employees: {
    list: (params?: Record<string, unknown>) =>
      api.get<PaginatedResponse<Employee>>("/hr/employees", { params }).then(r => r.data),

    get: (id: string) =>
      api.get<Employee>(`/hr/employees/${id}`).then(r => r.data),

    create: (dto: CreateEmployeeDto) =>
      api.post<Employee>("/hr/employees", dto).then(r => r.data),

    update: (id: string, dto: Partial<CreateEmployeeDto>) =>
      api.patch<Employee>(`/hr/employees/${id}`, dto).then(r => r.data),

    delete: (id: string) =>
      api.delete(`/hr/employees/${id}`).then(r => r.data),

    dropdown: () =>
      api.get<Pick<Employee, "id" | "fullName">[]>("/hr/employees/dropdown").then(r => r.data).catch(() => []), 
  },

  attendance: {
    list: (params?: Record<string, unknown>) =>
      api.get<PaginatedResponse<Attendance>>("/hr/attendance", { params }).then(r => r.data),

    create: (dto: CreateAttendanceDto) =>
      api.post<Attendance>("/hr/attendance", dto).then(r => r.data),

    update: (id: string, dto: Partial<CreateAttendanceDto>) =>
      api.patch<Attendance>(`/hr/attendance/${id}`, dto).then(r => r.data),

    delete: (id: string) =>
      api.delete(`/hr/attendance/${id}`).then(r => r.data),
  },
}
