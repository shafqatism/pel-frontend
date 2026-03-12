import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { usersApi } from "@/lib/api/users"
import { toast } from "sonner"

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
}

export function useUsers() {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: usersApi.list,
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => usersApi.create(data),
    onSuccess: () => {
      toast.success("User created successfully")
      qc.invalidateQueries({ queryKey: userKeys.all })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to create user")
    }
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => usersApi.update(id, data),
    onSuccess: () => {
      toast.success("User updated successfully")
      qc.invalidateQueries({ queryKey: userKeys.all })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update user")
    }
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      toast.success("User deleted")
      qc.invalidateQueries({ queryKey: userKeys.all })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete user")
    }
  })
}
