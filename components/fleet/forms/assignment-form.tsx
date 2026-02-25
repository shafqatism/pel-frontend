"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo } from "react"
import { fleetApi } from "@/lib/api/fleet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { toast } from "sonner"
import { useAppDispatch } from "@/lib/store"
import { closeFleetDrawer } from "@/lib/store/slices/ui-slice"
import { Loader2 } from "lucide-react"
import { useDynamicDropdown } from "@/hooks/use-dynamic-dropdown"

const schema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  assignedTo: z.string().min(1, "Assignee required"),
  assignedBy: z.string().min(1, "Assigned by required"),
  assignmentDate: z.string().min(1, "Date required"),
  returnDate: z.string().optional().nullable(),
  purpose: z.string().optional().nullable(),
  status: z.string().default("active"),
})
type FormData = z.infer<typeof schema>

const DEFAULT_ASSIGNMENT_STATUSES = [
  { label: "Active", value: "active" },
  { label: "Returned", value: "returned" },
  { label: "Extended", value: "extended" }
]

const mergeOptions = (defaults: { label: string; value: string }[], dynamic: { label: string; value: string }[]) => {
  const merged = [...defaults]
  dynamic.forEach(opt => {
    if (!merged.find(m => m.value === opt.value)) {
      merged.push(opt)
    }
  })
  return merged
}

export default function AssignmentForm({ data, mode }: { data?: any; mode: 'create' | 'edit' }) {
  const qc = useQueryClient()
  const dispatch = useAppDispatch()
  const { data: vehicles } = useQuery({ queryKey: ["vehicles", "dropdown"], queryFn: fleetApi.vehicles.dropdown })
  const { options: assignmentStatuses, createOption: createStatus } = useDynamicDropdown("assignment_status")

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      vehicleId: "", assignedTo: "", assignedBy: "",
      assignmentDate: new Date().toISOString().split("T")[0], status: "active"
    }
  })

  const mergedStatuses = useMemo(() => mergeOptions(DEFAULT_ASSIGNMENT_STATUSES, assignmentStatuses), [assignmentStatuses])

  useEffect(() => {
    if (data && mode === 'edit') {
      reset({
        vehicleId: data.vehicleId || data.vehicle?.id || "",
        assignedTo: data.assignedTo || "",
        assignedBy: data.assignedBy || "",
        assignmentDate: data.assignmentDate ? new Date(data.assignmentDate).toISOString().split("T")[0] : "",
        returnDate: data.returnDate ? new Date(data.returnDate).toISOString().split("T")[0] : "",
        purpose: data.purpose || "",
        status: data.status || "active",
      })
    } else {
      reset({
        vehicleId: "", assignedTo: "", assignedBy: "",
        assignmentDate: new Date().toISOString().split("T")[0], status: "active"
      })
    }
  }, [data, mode, reset])

  const { mutate, isPending } = useMutation({
    mutationFn: (vals: FormData) =>
      mode === 'create' ? fleetApi.assignments.create(vals as any) : fleetApi.assignments.update(data.id, vals as any),
    onSuccess: () => {
      toast.success(mode === 'create' ? "Vehicle assigned" : "Assignment updated")
      qc.invalidateQueries({ queryKey: ["assignments"] })
      dispatch(closeFleetDrawer())
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Something went wrong"),
  })

  return (
    <form onSubmit={handleSubmit(v => mutate(v))} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1.5">
          <Label>Vehicle *</Label>
          <SearchableSelect
            options={vehicles?.map(v => ({ label: `${v.registrationNumber} — ${v.vehicleName}`, value: v.id })) || []}
            value={watch("vehicleId")}
            onValueChange={v => setValue("vehicleId", v)}
            placeholder={!vehicles ? "Loading vehicles..." : "Select vehicle to assign"}
          />
          {errors.vehicleId && <p className="text-xs text-destructive">{errors.vehicleId.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Assigned To *</Label>
          <Input {...register("assignedTo")} placeholder="Employee name" />
          {errors.assignedTo && <p className="text-xs text-destructive">{errors.assignedTo.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Assigned By *</Label>
          <Input {...register("assignedBy")} placeholder="Manager name" />
          {errors.assignedBy && <p className="text-xs text-destructive">{errors.assignedBy.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Assignment Date *</Label>
          <Input type="date" {...register("assignmentDate")} />
        </div>
        <div className="space-y-1.5">
          <Label>Return Date (if known)</Label>
          <Input type="date" {...register("returnDate")} />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Purpose</Label>
          <Textarea {...register("purpose")} placeholder="Official duty / field operations..." rows={3} />
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <SearchableSelect
            options={mergedStatuses}
            value={watch("status")}
            onValueChange={v => setValue("status", v)}
            onCreate={createStatus}
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={() => dispatch(closeFleetDrawer())}>Cancel</Button>
        <Button type="submit" disabled={isPending || !watch("vehicleId")}>
          {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {mode === 'create' ? "Assign Vehicle" : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}
