import { useQuery } from "@tanstack/react-query"
import { hrApi } from "@/lib/api/hr"

export const employeeKeys = {
  all: ['employees'] as const,
  dropdown: () => [...employeeKeys.all, 'dropdown'] as const,
  list: (params: any) => [...employeeKeys.all, 'list', params] as const,
}

export function useEmployeesDropdown() {
  return useQuery({
    queryKey: employeeKeys.dropdown(),
    queryFn: () => hrApi.employees.dropdown(),
    staleTime: 10 * 60 * 1000, // 10 minutes cache as employees don't change often
  })
}

export function useEmployees(params: any) {
  return useQuery({
    queryKey: employeeKeys.list(params),
    queryFn: () => hrApi.employees.list(params),
  })
}
