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
import { SearchableSelect } from "@/components/ui/searchable-select"
import { toast } from "sonner"
import { useAppDispatch } from "@/lib/store"
import { closeFleetDrawer } from "@/lib/store/slices/ui-slice"
import { Loader2 } from "lucide-react"
import { useDynamicDropdown } from "@/hooks/use-dynamic-dropdown"

const schema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  date: z.string().min(1, "Date is required"),
  quantityLiters: z.preprocess(Number, z.number().positive("Must be positive")),
  ratePerLiter: z.preprocess(Number, z.number().positive("Must be positive")),
  totalCost: z.preprocess(Number, z.number().nonnegative()),
  odometerReading: z.preprocess(Number, z.number().nonnegative()),
  stationName: z.string().optional().nullable(),
  paymentMethod: z.string().default("cash"),
})
type FormData = z.infer<typeof schema>

const DEFAULT_PAYMENT_METHODS = [
  { label: "Cash", value: "cash" },
  { label: "Fuel Card", value: "fuel_card" },
  { label: "Credit", value: "credit" }
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

export default function FuelForm({ data, mode }: { data?: any; mode: 'create' | 'edit' }) {
  const qc = useQueryClient()
  const dispatch = useAppDispatch()
  const { data: vehicles } = useQuery({ queryKey: ["vehicles", "dropdown"], queryFn: fleetApi.vehicles.dropdown })
  const { options: paymentMethods, createOption: createPaymentMethod } = useDynamicDropdown("payment_method")

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      vehicleId: "", date: new Date().toISOString().split("T")[0],
      quantityLiters: 0, ratePerLiter: 310, totalCost: 0,
      odometerReading: 0, paymentMethod: "cash"
    }
  })

  const mergedPaymentMethods = useMemo(() => mergeOptions(DEFAULT_PAYMENT_METHODS, paymentMethods), [paymentMethods])

  useEffect(() => {
    if (data && mode === 'edit') {
      reset({
        vehicleId: data.vehicleId || data.vehicle?.id || "",
        date: data.date ? new Date(data.date).toISOString().split("T")[0] : "",
        quantityLiters: Number(data.quantityLiters) || 0,
        ratePerLiter: Number(data.ratePerLiter) || 0,
        totalCost: Number(data.totalCost) || 0,
        odometerReading: Number(data.odometerReading) || 0,
        stationName: data.stationName || "",
        paymentMethod: data.paymentMethod || "cash",
      })
    } else {
      reset({
        vehicleId: "", date: new Date().toISOString().split("T")[0],
        quantityLiters: 0, ratePerLiter: 310, totalCost: 0,
        odometerReading: 0, paymentMethod: "cash"
      })
    }
  }, [data, mode, reset])

  const { mutate, isPending } = useMutation({
    mutationFn: (vals: FormData) =>
      mode === 'create' ? fleetApi.fuel.create(vals as any) : fleetApi.fuel.update(data.id, vals as any),
    onSuccess: () => {
      toast.success(mode === 'create' ? "Fuel log added" : "Fuel log updated")
      qc.invalidateQueries({ queryKey: ["fuel"] })
      dispatch(closeFleetDrawer())
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Something went wrong"),
  })

  const qty = watch("quantityLiters")
  const rate = watch("ratePerLiter")

  return (
    <form onSubmit={handleSubmit(v => {
      v.totalCost = Number(v.quantityLiters) * Number(v.ratePerLiter)
      mutate(v)
    })} className="space-y-4">
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
          <Label>Date *</Label>
          <Input type="date" {...register("date")} />
        </div>
        <div className="space-y-1.5">
          <Label>Odometer Reading (km) *</Label>
          <Input type="number" {...register("odometerReading")} />
        </div>
        <div className="space-y-1.5">
          <Label>Quantity (Liters) *</Label>
          <Input type="number" step="0.01" {...register("quantityLiters")} />
        </div>
        <div className="space-y-1.5">
          <Label>Rate per Liter (PKR) *</Label>
          <Input type="number" step="0.01" {...register("ratePerLiter")} />
        </div>
        <div className="col-span-2 p-3 rounded-xl bg-primary/5 border border-primary/10 flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Total Cost (auto)</span>
          <span className="text-lg font-bold text-primary">
            PKR {(Number(qty || 0) * Number(rate || 0)).toLocaleString("en-PK", { minimumFractionDigits: 0 })}
          </span>
        </div>
        <div className="space-y-1.5">
          <Label>Station / Vendor</Label>
          <Input {...register("stationName")} placeholder="PSO Attock Road" />
        </div>
        <div className="space-y-1.5">
          <Label>Payment Method</Label>
          <SearchableSelect
            options={mergedPaymentMethods}
            value={watch("paymentMethod")}
            onValueChange={v => setValue("paymentMethod", v)}
            onCreate={createPaymentMethod}
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={() => dispatch(closeFleetDrawer())}>Cancel</Button>
        <Button type="submit" disabled={isPending || !watch("vehicleId")}>
          {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {mode === 'create' ? "Log Fuel" : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}
