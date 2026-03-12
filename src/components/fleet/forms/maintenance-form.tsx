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
import { MultiAttachmentUpload } from "@/components/common/multi-attachment-upload"

const schema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  maintenanceDate: z.string().min(1, "Date is required"),
  type: z.string().default("routine_check"),
  description: z.string().optional().nullable(),
  costPkr: z.preprocess(Number, z.number().nonnegative()),
  shopOrPerson: z.string().optional().nullable(),
  odometerAtMaintenanceKm: z.preprocess(Number, z.number().nonnegative()),
  nextServiceOdometerKm: z.preprocess((v) => v === "" || v === null ? undefined : Number(v), z.number().optional().nullable()),
  nextServiceDueDate: z.string().optional().nullable(),
  maintenanceBy: z.string().default("internal"),
  attachments: z.array(z.any()).optional(),
})

type FormData = z.infer<typeof schema>

const DEFAULT_MAINTENANCE_TYPES = [
  { label: "Routine Check", value: "routine_check" },
  { label: "Oil Change", value: "oil_change" },
  { label: "Tire Change", value: "tire_change" },
  { label: "Brake Service", value: "brake_service" },
  { label: "Engine Repair", value: "engine_repair" },
  { label: "Electrical Repair", value: "electrical_repair" },
  { label: "AC Service", value: "ac_service" },
  { label: "Body Repair", value: "body_repair" }
]

const DEFAULT_VENDORS = [
  { label: "Internal Workshop", value: "internal" },
  { label: "External Workshop", value: "external" },
  { label: "Dealer Service", value: "dealer" }
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

export default function MaintenanceForm({ data, mode }: { data?: any; mode: 'create' | 'edit' }) {
  const qc = useQueryClient()
  const dispatch = useAppDispatch()
  const { data: vehicles } = useQuery({ queryKey: ["vehicles", "dropdown"], queryFn: fleetApi.vehicles.dropdown })
  
  const { options: maintenanceTypes, createOption: createMaintenanceType } = useDynamicDropdown("maintenance_type")
  const { options: maintenanceVendors, createOption: createVendor } = useDynamicDropdown("maintenance_vendor")

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      vehicleId: "", maintenanceDate: new Date().toISOString().split("T")[0],
      type: "routine_check", costPkr: 0, odometerAtMaintenanceKm: 0, maintenanceBy: "internal",
      attachments: []
    }
  })

  const mergedTypes = useMemo(() => mergeOptions(DEFAULT_MAINTENANCE_TYPES, maintenanceTypes), [maintenanceTypes])
  const mergedVendors = useMemo(() => mergeOptions(DEFAULT_VENDORS, maintenanceVendors), [maintenanceVendors])

  useEffect(() => {
    if (data && mode === 'edit') {
      reset({
        vehicleId: data.vehicleId || data.vehicle?.id || "",
        maintenanceDate: data.maintenanceDate ? new Date(data.maintenanceDate).toISOString().split("T")[0] : "",
        type: data.type || "routine_check",
        description: data.description || "",
        costPkr: Number(data.costPkr) || 0,
        shopOrPerson: data.shopOrPerson || "",
        odometerAtMaintenanceKm: Number(data.odometerAtMaintenanceKm) || 0,
        nextServiceOdometerKm: data.nextServiceOdometerKm ? Number(data.nextServiceOdometerKm) : undefined,
        nextServiceDueDate: data.nextServiceDueDate ? new Date(data.nextServiceDueDate).toISOString().split("T")[0] : "",
        maintenanceBy: data.maintenanceBy || "internal",
        attachments: data.attachments || []
      })
    } else {
      reset({
        vehicleId: "", maintenanceDate: new Date().toISOString().split("T")[0],
        type: "routine_check", costPkr: 0, odometerAtMaintenanceKm: 0, maintenanceBy: "internal",
        attachments: []
      })
    }
  }, [data, mode, reset])

  const { mutate, isPending } = useMutation({
    mutationFn: (vals: FormData) =>
      mode === 'create' ? fleetApi.maintenance.create(vals as any) : fleetApi.maintenance.update(data.id, vals as any),
    onSuccess: () => {
      toast.success(mode === 'create' ? "Maintenance record created" : "Record updated")
      qc.invalidateQueries({ queryKey: ["maintenance"] })
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
            placeholder={!vehicles ? "Loading vehicles..." : "Select vehicle"}
          />
          {errors.vehicleId && <p className="text-xs text-destructive">{errors.vehicleId.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Maintenance Type *</Label>
          <SearchableSelect
            options={mergedTypes}
            value={watch("type")}
            onValueChange={v => setValue("type", v)}
            onCreate={createMaintenanceType}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Date *</Label>
          <Input type="date" {...register("maintenanceDate")} />
        </div>
        <div className="space-y-1.5">
          <Label>Cost (PKR) *</Label>
          <Input type="number" step="0.01" {...register("costPkr")} />
        </div>
        <div className="space-y-1.5">
          <Label>Odometer at Service (km)</Label>
          <Input type="number" {...register("odometerAtMaintenanceKm")} />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Description</Label>
          <Textarea {...register("description")} placeholder="Details about the work done..." rows={3} />
        </div>
        <div className="space-y-1.5">
          <Label>Shop / Person</Label>
          <Input {...register("shopOrPerson")} placeholder="Al-Rehman Workshop" />
        </div>
        <div className="space-y-1.5">
          <Label>Serviced By</Label>
          <SearchableSelect
            options={mergedVendors}
            value={watch("maintenanceBy")}
            onValueChange={v => setValue("maintenanceBy", v)}
            onCreate={createVendor}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Next Service Odometer</Label>
          <Input type="number" {...register("nextServiceOdometerKm")} placeholder="Optional" />
        </div>
        <div className="space-y-1.5">
          <Label>Next Service Due Date</Label>
          <Input type="date" {...register("nextServiceDueDate")} />
        </div>
      </div>
      
      <div className="pt-4 border-t">
        <Label className="text-base font-semibold">Maintenance Documents & Photos</Label>
        <p className="text-sm text-muted-foreground mb-4">Upload invoices, service reports, or photos of the repair work.</p>
        <MultiAttachmentUpload
          value={watch("attachments") || []}
          onChange={(val) => setValue("attachments", val)}
        />
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={() => dispatch(closeFleetDrawer())}>Cancel</Button>
        <Button type="submit" disabled={isPending || !watch("vehicleId")}>
          {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {mode === 'create' ? "Add Record" : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}
