import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { hrApi } from "@/lib/api/hr"
import { toast } from "sonner"
import type { CreateAttendanceDto } from "@/lib/types/hr"

export const attendanceKeys = {
  all: ['attendance'] as const,
  lists: () => [...attendanceKeys.all, 'list'] as const,
  list: (params: any) => [...attendanceKeys.lists(), params] as const,
}

export function useAttendance(params: any) {
  return useQuery({
    queryKey: attendanceKeys.list(params),
    queryFn: () => hrApi.attendance.list(params),
    staleTime: 60 * 1000, // 1 minute
  })
}

export function useCreateAttendance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateAttendanceDto) => hrApi.attendance.create(dto),
    onSuccess: () => {
      toast.success("Attendance marked")
      qc.invalidateQueries({ queryKey: attendanceKeys.all })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Operation failed")
    }
  })
}

export function useUpdateAttendance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: CreateAttendanceDto }) => hrApi.attendance.update(id, dto),
    onSuccess: () => {
      toast.success("Record updated")
      qc.invalidateQueries({ queryKey: attendanceKeys.all })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Operation failed")
    }
  })
}

export function useDeleteAttendance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => hrApi.attendance.delete(id),
    onSuccess: () => {
      toast.success("Record removed")
      qc.invalidateQueries({ queryKey: attendanceKeys.all })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Delete failed")
    }
  })
}
