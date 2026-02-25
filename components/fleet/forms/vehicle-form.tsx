"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo } from "react"
import { fleetApi } from "@/lib/api/fleet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useAppDispatch } from "@/lib/store"
import { closeFleetDrawer } from "@/lib/store/slices/ui-slice"
import { Loader2 } from "lucide-react"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { useDynamicDropdown } from "@/hooks/use-dynamic-dropdown"

const schema = z.object({
  registrationNumber: z.string().min(1, "Registration is required"),
  vehicleName: z.string().min(1, "Name is required"),
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.preprocess((val) => Number(val), z.number().min(1900).max(2100)).optional(),
  type: z.string().default("suv"),
  fuelType: z.string().default("petrol"),
  ownershipStatus: z.string().default("company_owned"),
  status: z.string().default("active"),
  assignedSite: z.string().optional().nullable(),
  currentDriverName: z.string().optional().nullable(),
  currentOdometerKm: z.preprocess((val) => Number(val), z.number()).default(0),
})

type FormData = z.infer<typeof schema>

// Helper to merge and deduplicate options
const mergeOptions = (defaults: { label: string; value: string }[], dynamic: { label: string; value: string }[]) => {
  const merged = [...defaults]
  dynamic.forEach(opt => {
    if (!merged.find(m => m.value === opt.value)) {
      merged.push(opt)
    }
  })
  return merged
}

const DEFAULT_TYPES = [
  { label: "Sedan", value: "sedan" },
  { label: "SUV", value: "suv" },
  { label: "Pickup", value: "pickup" },
  { label: "Truck", value: "truck" }
]

const DEFAULT_FUEL_TYPES = [
  { label: "Petrol", value: "petrol" },
  { label: "Diesel", value: "diesel" },
  { label: "Electric", value: "electric" }
]

const DEFAULT_OWNERSHIP = [
  { label: "Company Owned", value: "company_owned" },
  { label: "Leased", value: "leased" },
  { label: "Rented", value: "rented" }
]

const DEFAULT_STATUSES = [
  { label: "Active", value: "active" },
  { label: "In Maintenance", value: "in_maintenance" },
  { label: "Inactive", value: "inactive" }
]

export default function VehicleForm({ data, mode }: { data?: any; mode: 'create' | 'edit' }) {
  const qc = useQueryClient()
  const dispatch = useAppDispatch()
  
  const { options: typeOptions, createOption: createType } = useDynamicDropdown("vehicle_type")
  const { options: fuelTypeOptions, createOption: createFuelType } = useDynamicDropdown("fuel_type")
  const { options: ownershipOptions, createOption: createOwnership } = useDynamicDropdown("vehicle_ownership")
  const { options: statusOptions, createOption: createStatus } = useDynamicDropdown("vehicle_status")

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      registrationNumber: "", vehicleName: "", type: "suv",
      fuelType: "petrol", ownershipStatus: "company_owned", status: "active",
      currentOdometerKm: 0
    }
  })

  // Memoized merged options to prevent flickering and selection loss
  const mergedTypes = useMemo(() => mergeOptions(DEFAULT_TYPES, typeOptions), [typeOptions])
  const mergedFuelTypes = useMemo(() => mergeOptions(DEFAULT_FUEL_TYPES, fuelTypeOptions), [fuelTypeOptions])
  const mergedOwnership = useMemo(() => mergeOptions(DEFAULT_OWNERSHIP, ownershipOptions), [ownershipOptions])
  const mergedStatuses = useMemo(() => mergeOptions(DEFAULT_STATUSES, statusOptions), [statusOptions])

  useEffect(() => {
    if (data && mode === 'edit') {
      reset({
        registrationNumber: data.registrationNumber || "",
        vehicleName: data.vehicleName || "",
        make: data.make || "",
        model: data.model || "",
        year: data.year || undefined,
        type: data.type || "suv",
        fuelType: data.fuelType || "petrol",
        ownershipStatus: data.ownershipStatus || "company_owned",
        status: data.status || "active",
        assignedSite: data.assignedSite || "",
        currentDriverName: data.currentDriverName || "",
        currentOdometerKm: Number(data.currentOdometerKm) || 0,
      })
    } else {
      reset({
        registrationNumber: "", vehicleName: "", type: "suv",
        fuelType: "petrol", ownershipStatus: "company_owned", status: "active",
        currentOdometerKm: 0
      })
    }
  }, [data, mode, reset])

  const { mutate, isPending } = useMutation({
    mutationFn: (vals: FormData) => 
      mode === 'create' ? fleetApi.vehicles.create(vals as any) : fleetApi.vehicles.update(data.id, vals as any),
    onSuccess: () => {
      toast.success(mode === 'create' ? "Vehicle registered" : "Vehicle updated")
      qc.invalidateQueries({ queryKey: ["vehicles"] })
      dispatch(closeFleetDrawer())
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Something went wrong")
    }
  })

  return (
    <form onSubmit={handleSubmit(v => mutate(v))} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Registration Number *</Label>
          <Input {...register("registrationNumber")} placeholder="LEA-1234" />
          {errors.registrationNumber && <p className="text-xs text-destructive">{errors.registrationNumber.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Vehicle Name *</Label>
          <Input {...register("vehicleName")} placeholder="Toyota Hilux" />
          {errors.vehicleName && <p className="text-xs text-destructive">{errors.vehicleName.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Make</Label>
          <Input {...register("make")} placeholder="Toyota" />
        </div>
        <div className="space-y-1.5">
          <Label>Model</Label>
          <Input {...register("model")} placeholder="Hilux" />
        </div>
        <div className="space-y-1.5">
          <Label>Year</Label>
          <Input type="number" {...register("year")} placeholder="2024" />
        </div>
        <div className="space-y-1.5">
          <Label>Vehicle Type</Label>
          <SearchableSelect
            options={mergedTypes}
            value={watch("type")}
            onValueChange={v => setValue("type", v)}
            onCreate={createType}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Fuel Type</Label>
          <SearchableSelect
            options={mergedFuelTypes}
            value={watch("fuelType")}
            onValueChange={v => setValue("fuelType", v)}
            onCreate={createFuelType}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Ownership Status</Label>
          <SearchableSelect
            options={mergedOwnership}
            value={watch("ownershipStatus")}
            onValueChange={v => setValue("ownershipStatus", v)}
            onCreate={createOwnership}
          />
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
        <div className="space-y-1.5">
          <Label>Current Odometer (km)</Label>
          <Input type="number" {...register("currentOdometerKm")} />
        </div>
        <div className="space-y-1.5">
          <Label>Assigned Site</Label>
          <Input {...register("assignedSite")} />
        </div>
        <div className="space-y-1.5">
          <Label>Driver Name</Label>
          <Input {...register("currentDriverName")} />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={() => dispatch(closeFleetDrawer())}>Cancel</Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {mode === 'create' ? "Register Vehicle" : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}
