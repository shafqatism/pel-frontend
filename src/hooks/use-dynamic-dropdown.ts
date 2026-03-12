import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useMemo } from "react"
import { dropdownsApi } from "@/lib/api/dropdowns"
import { toast } from "sonner"

export function useDynamicDropdown(category: string) {
  const qc = useQueryClient()

  const { data: options = [], isLoading } = useQuery({
    queryKey: ["dropdown-options", category],
    queryFn: () => dropdownsApi.get(category),
  })

  const { mutate: createOption } = useMutation({
    mutationFn: (label: string) => {
      const value = label.toLowerCase().replace(/\s+/g, '_')
      return dropdownsApi.create(category, { label, value })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dropdown-options", category] })
      toast.success("New option added")
    },
    onError: () => {
      toast.error("Failed to add option")
    },
  })

  const memoizedOptions = useMemo(() => options.map(o => ({ label: o.label, value: o.value })), [options])

  return {
    options: memoizedOptions,
    isLoading,
    createOption,
  }
}
