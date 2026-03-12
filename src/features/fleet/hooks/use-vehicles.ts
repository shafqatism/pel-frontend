import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fleetApi } from "@/lib/api/fleet"
import { toast } from "sonner"

export const vehicleKeys = {
  all: ['vehicles'] as const,
  lists: () => [...vehicleKeys.all, 'list'] as const,
  list: (params: any) => [...vehicleKeys.lists(), params] as const,
  details: () => [...vehicleKeys.all, 'detail'] as const,
  detail: (id: string) => [...vehicleKeys.details(), id] as const,
  summary: () => [...vehicleKeys.all, 'summary'] as const,
}

export function useVehicles(params: any) {
  return useQuery({
    queryKey: vehicleKeys.list(params),
    queryFn: () => fleetApi.vehicles.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  })
}

export function useVehicle(id: string) {
  return useQuery({
    queryKey: vehicleKeys.detail(id),
    queryFn: () => fleetApi.vehicles.get(id),
    enabled: !!id,
  })
}

export function useVehicleSummary() {
  return useQuery({
    queryKey: vehicleKeys.summary(),
    queryFn: () => fleetApi.vehicles.summary(),
  })
}

export function useCreateVehicle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: fleetApi.vehicles.create,
    onSuccess: () => {
      toast.success("Vehicle created successfully")
      qc.invalidateQueries({ queryKey: vehicleKeys.all })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create vehicle")
    },
  })
}

export function useUpdateVehicle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      fleetApi.vehicles.update(id, data),
    onSuccess: (_, { id }) => {
      toast.success("Vehicle updated")
      qc.invalidateQueries({ queryKey: vehicleKeys.all })
      qc.invalidateQueries({ queryKey: vehicleKeys.detail(id) })
    },
  })
}

export function useDeleteVehicle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => fleetApi.vehicles.delete(id),
    onSuccess: () => {
      toast.success("Vehicle removed")
      qc.invalidateQueries({ queryKey: vehicleKeys.all })
    },
  })
}

export function useFleetSummary() {
  return useQuery({
    queryKey: ['fleet', 'summary'],
    queryFn: fleetApi.reports.summary,
    staleTime: 5 * 60 * 1000,
  })
}

export function useVehicleReport(id: string | null) {
  return useQuery({
    queryKey: ['fleet', 'report', id],
    queryFn: () => id ? fleetApi.reports.vehicleReport(id) : null,
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  })
}
