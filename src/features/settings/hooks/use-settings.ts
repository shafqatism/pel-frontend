import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { settingsApi } from "@/lib/api/settings"
import { toast } from "sonner"
import type { UpdateSettingsDto } from "@/lib/types/settings"

export const settingsKeys = {
  all: ['settings'] as const,
}

export function useSettings() {
  return useQuery({
    queryKey: settingsKeys.all,
    queryFn: settingsApi.get,
    staleTime: 30 * 60 * 1000, // 30 minutes cache for settings
    gcTime: 60 * 60 * 1000,    // Keep in garbage collection for 1 hour
  })
}

export function usePublicSettings() {
  return useQuery({
    queryKey: [...settingsKeys.all, 'public'],
    queryFn: settingsApi.getPublic,
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 120 * 60 * 1000, // 2 hours
  })
}

export function useUpdateSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: UpdateSettingsDto) => settingsApi.update(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: settingsKeys.all })
      toast.success("Settings updated successfully")
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update settings")
    }
  })
}
