import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { rolesApi } from "@/lib/api/roles"
import { toast } from "sonner"
import type { CreateRoleDto } from "@/lib/types/roles"

export const roleKeys = {
  all: ['roles'] as const,
  lists: () => [...roleKeys.all, 'list'] as const,
  modules: () => [...roleKeys.all, 'modules'] as const,
}

export function useRoles() {
  return useQuery({
    queryKey: roleKeys.lists(),
    queryFn: rolesApi.list,
  })
}

export function useModules() {
  return useQuery({
    queryKey: roleKeys.modules(),
    queryFn: rolesApi.getModules,
  })
}

export function useCreateRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateRoleDto) => rolesApi.create(dto),
    onSuccess: () => {
      toast.success("Role created successfully")
      qc.invalidateQueries({ queryKey: roleKeys.all })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to create role")
    }
  })
}

export function useUpdateRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: CreateRoleDto }) => rolesApi.update(id, dto),
    onSuccess: () => {
      toast.success("Role updated successfully")
      qc.invalidateQueries({ queryKey: roleKeys.all })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update role")
    }
  })
}

export function useDeleteRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => rolesApi.delete(id),
    onSuccess: () => {
      toast.success("Role deleted")
      qc.invalidateQueries({ queryKey: roleKeys.all })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete role")
    }
  })
}
