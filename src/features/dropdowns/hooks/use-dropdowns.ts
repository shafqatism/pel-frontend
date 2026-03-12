import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { dropdownsApi } from "@/lib/api/dropdowns"
import { toast } from "sonner"

export const dropdownKeys = {
  all: ['dropdowns'] as const,
  lists: () => [...dropdownKeys.all, 'list'] as const,
  list: (category: string) => [...dropdownKeys.lists(), category] as const,
}

export function useDropdownOptions(category: string) {
  return useQuery({
    queryKey: dropdownKeys.list(category),
    queryFn: () => dropdownsApi.get(category),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    enabled: !!category,
  })
}

export function useAddDropdownOption() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ category, label }: { category: string; label: string }) => {
      const value = label.toLowerCase().replace(/\s+/g, '_')
      return dropdownsApi.create(category, { label, value })
    },
    onSuccess: (_, { category }) => {
      qc.invalidateQueries({ queryKey: dropdownKeys.list(category) })
      toast.success("Option added")
    }
  })
}

export function useDeleteDropdownOption() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => dropdownsApi.delete(id),
    onSuccess: (_, id) => {
      // Invalidate all dropdown lists since we don't know which category this ID belonged to
      // without extra logic. Or we could pass category to the mutation.
      qc.invalidateQueries({ queryKey: dropdownKeys.lists() })
      toast.success("Option removed")
    }
  })
}
