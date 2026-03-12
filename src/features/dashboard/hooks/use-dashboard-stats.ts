import { useQuery } from "@tanstack/react-query"
import { fleetApi } from "@/lib/api/fleet"
import { hrApi } from "@/lib/api/hr"
import { financeApi } from "@/lib/api/finance"
import { hseApi } from "@/lib/api/hse"
import { sitesApi } from "@/lib/api/sites"
import { companiesApi } from "@/lib/api/companies"

export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  trends: () => [...dashboardKeys.all, 'trends'] as const,
  hse: () => [...dashboardKeys.all, 'hse'] as const,
  predictions: () => [...dashboardKeys.all, 'predictions'] as const,
}

export function useDashboardStats() {
  const fleet = useQuery({ 
    queryKey: ['vehicles', 'counts'], 
    queryFn: () => fleetApi.vehicles.list({ limit: 0 }),
    staleTime: 5 * 60 * 1000 
  })
  
  const hr = useQuery({ 
    queryKey: ['employees', 'counts'], 
    queryFn: () => hrApi.employees.list({ limit: 0 }),
    staleTime: 5 * 60 * 1000
  })
  
  const finance = useQuery({ 
    queryKey: ['expenses', 'summary'], 
    queryFn: financeApi.expenses.summary,
    staleTime: 5 * 60 * 1000
  })

  const companies = useQuery({ 
    queryKey: ['companies', 'counts'], 
    queryFn: () => companiesApi.list({ limit: 0 }),
    staleTime: 5 * 60 * 1000
  })

  return {
    stats: {
      vehicles: fleet.data?.total ?? 0,
      manpower: hr.data?.total ?? 0,
      organizations: companies.data?.total ?? 0,
      expenditure: finance.data?.totalSpent ?? 0,
    },
    isLoading: fleet.isLoading || hr.isLoading || finance.isLoading || companies.isLoading
  }
}

export function useExpenseTrends() {
  return useQuery({
    queryKey: dashboardKeys.trends(),
    queryFn: financeApi.expenses.trends,
    staleTime: 10 * 60 * 1000,
  })
}

export function useHseStats() {
  return useQuery({
    queryKey: dashboardKeys.hse(),
    queryFn: hseApi.stats,
    staleTime: 10 * 60 * 1000,
  })
}

export function useMaintenancePredictions() {
  return useQuery({
    queryKey: dashboardKeys.predictions(),
    queryFn: fleetApi.vehicles.maintenancePredictions,
    staleTime: 30 * 60 * 1000,
  })
}
