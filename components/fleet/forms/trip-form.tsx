"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { useEffect, useState, useMemo } from "react"
import { fleetApi } from "@/lib/api/fleet"
import { hrApi } from "@/lib/api/hr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { toast } from "sonner"
import { useAppDispatch } from "@/lib/store"
import { closeFleetDrawer } from "@/lib/store/slices/ui-slice"
import { Loader2, X, Users, UserPlus } from "lucide-react"
import { useDynamicDropdown } from "@/hooks/use-dynamic-dropdown"

const schema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  destination: z.string().min(1, "Destination is required"),
  tripDate: z.string().min(1, "Date is required"),
  purposeOfVisit: z.string().optional().nullable(),
  driverName: z.string().optional().nullable(),
  alternativeDriverName: z.string().optional().nullable(),
  personTravelList: z.array(z.string()).default([]),
  meterOut: z.preprocess((val) => Number(val), z.number().min(0)),
  meterIn: z.preprocess((val) => val === "" || val === null ? undefined : Number(val), z.number().min(0).optional().nullable()),
  fuelAllottedLiters: z.preprocess((val) => val === "" || val === null ? undefined : Number(val), z.number().min(0).optional().nullable()),
  fuelCostPkr: z.preprocess((val) => val === "" || val === null ? undefined : Number(val), z.number().min(0).optional().nullable()),
  status: z.string().default("in_progress"),
})

type FormData = z.infer<typeof schema>

const DEFAULT_TRIP_STATUSES = [
  { label: "In Progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" }
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

export default function TripForm({ data, mode }: { data?: any; mode: 'create' | 'edit' }) {
  const qc = useQueryClient()
  const dispatch = useAppDispatch()
  const [personInput, setPersonInput] = useState("")

  const { data: vehicles } = useQuery({ queryKey: ["vehicles", "dropdown"], queryFn: fleetApi.vehicles.dropdown })
  const { data: employeesRaw } = useQuery({ queryKey: ["employees", "dropdown"], queryFn: hrApi.employees.dropdown })
  const { options: tripStatuses, createOption: createStatus } = useDynamicDropdown("trip_status")

  // De-duplicate employees by fullName to avoid Select value/key collisions if DB has duplicates
  const employees = employeesRaw?.filter((v, i, a) => a.findIndex(t => t.fullName === v.fullName) === i)

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      vehicleId: "", destination: "", tripDate: new Date().toISOString().split('T')[0],
      meterOut: 0, status: "in_progress", personTravelList: []
    }
  })

  const mergedStatuses = useMemo(() => mergeOptions(DEFAULT_TRIP_STATUSES, tripStatuses), [tripStatuses])

  useEffect(() => {
    if (data && mode === 'edit') {
      reset({
        vehicleId: data.vehicleId || data.vehicle?.id || "",
        destination: data.destination || "",
        tripDate: data.tripDate ? new Date(data.tripDate).toISOString().split('T')[0] : "",
        purposeOfVisit: data.purposeOfVisit || "",
        driverName: data.driverName || "",
        alternativeDriverName: data.alternativeDriverName || "",
        personTravelList: data.personTravelList || [],
        meterOut: Number(data.meterOut) || 0,
        meterIn: data.meterIn ? Number(data.meterIn) : null,
        fuelAllottedLiters: data.fuelAllottedLiters ? Number(data.fuelAllottedLiters) : null,
        fuelCostPkr: data.fuelCostPkr ? Number(data.fuelCostPkr) : null,
        status: data.status || "in_progress",
      })
    } else {
      reset({
        vehicleId: "", destination: "", tripDate: new Date().toISOString().split('T')[0],
        meterOut: 0, status: "in_progress", personTravelList: []
      })
    }
  }, [data, mode, reset])

  const persons = watch("personTravelList") || []

  const addPerson = () => {
    if (!personInput.trim()) return
    if (persons.includes(personInput.trim())) {
      setPersonInput("")
      return
    }
    setValue("personTravelList", [...persons, personInput.trim()])
    setPersonInput("")
  }

  const removePerson = (name: string) => {
    setValue("personTravelList", persons.filter(p => p !== name))
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (vals: FormData) => 
      mode === 'create' ? fleetApi.trips.create(vals as any) : fleetApi.trips.update(data.id, vals as any),
    onSuccess: () => {
      toast.success(mode === 'create' ? "Trip logged" : "Trip updated")
      qc.invalidateQueries({ queryKey: ["trips"] })
      dispatch(closeFleetDrawer())
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Something went wrong")
    }
  })

  return (
    <form onSubmit={handleSubmit(v => mutate(v))} className="space-y-6">
      <div className="grid grid-cols-2 gap-x-4 gap-y-5">
        <div className="col-span-2 space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Vehicle *</Label>
          <SearchableSelect
            options={vehicles?.map(v => ({ label: `${v.registrationNumber} — ${v.vehicleName}`, value: v.id })) || []}
            value={watch("vehicleId")}
            onValueChange={v => setValue("vehicleId", v)}
            placeholder={!vehicles ? "Loading vehicles..." : "Select vehicle"}
          />
          {errors.vehicleId && <p className="text-xs text-destructive">{errors.vehicleId.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Destination *</Label>
          <Input {...register("destination")} className="h-11 rounded-xl" placeholder="Site or Office name" />
          {errors.destination && <p className="text-xs text-destructive">{errors.destination.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Trip Date *</Label>
          <Input type="date" {...register("tripDate")} className="h-11 rounded-xl" />
          {errors.tripDate && <p className="text-xs text-destructive">{errors.tripDate.message}</p>}
        </div>

        <div className="col-span-2 space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Purpose of Visit</Label>
          <Textarea 
            {...register("purposeOfVisit")} 
            className="rounded-xl min-h-[80px] bg-muted/20" 
            placeholder="Describe the reason for this journey..."
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Driver Name</Label>
          <SearchableSelect
            options={employees?.map(emp => ({ label: emp.fullName, value: emp.fullName })) || []}
            value={watch("driverName") || ""}
            onValueChange={v => setValue("driverName", v)}
            placeholder={!employees ? "Loading staff..." : "Select driver"}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Alternative Driver</Label>
          <SearchableSelect
            options={[
              { label: "None", value: "none" },
              ...(employees?.map(emp => ({ label: emp.fullName, value: emp.fullName })) || [])
            ]}
            value={watch("alternativeDriverName") || ""}
            onValueChange={v => setValue("alternativeDriverName", v)}
            placeholder={!employees ? "Loading staff..." : "Select relief driver"}
          />
        </div>

        <div className="col-span-2 space-y-3">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" /> Persons on Travel
          </Label>
          <div className="flex flex-wrap gap-2 mb-2 p-3 min-h-[46px] rounded-xl border bg-muted/10 border-dashed">
            {persons.length === 0 && <span className="text-xs text-muted-foreground/60 italic">No persons added yet</span>}
            {persons.map((p, i) => (
              <Badge key={`${p}-${i}`} variant="secondary" className="pl-3 pr-1 py-1 rounded-lg bg-background border flex items-center gap-1">
                {p}
                <Button 
                   type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5 rounded-md hover:bg-destructive hover:text-white"
                  onClick={() => removePerson(p)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input 
              value={personInput} 
              onChange={e => setPersonInput(e.target.value)} 
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addPerson() } }}
              placeholder="Type name and press Enter"
              className="h-10 rounded-xl"
            />
            <Button type="button" variant="outline" onClick={addPerson} className="h-10 rounded-xl px-3 border-dashed">
              <UserPlus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Meter Out *</Label>
          <Input type="number" {...register("meterOut")} className="h-11 rounded-xl" />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Meter In (Closing)</Label>
          <Input type="number" {...register("meterIn")} className="h-11 rounded-xl" />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Fuel Allotted (L)</Label>
          <Input type="number" {...register("fuelAllottedLiters")} className="h-11 rounded-xl" />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</Label>
          <SearchableSelect
            options={mergedStatuses}
            value={watch("status")}
            onValueChange={v => setValue("status", v)}
            onCreate={createStatus}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t mt-4">
        <Button type="button" variant="ghost" onClick={() => dispatch(closeFleetDrawer())} className="rounded-xl">Cancel</Button>
        <Button type="submit" disabled={isPending} className="rounded-xl px-8 font-bold bg-primary hover:bg-primary/90">
          {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {mode === 'create' ? "Log Journey" : "Update Log"}
        </Button>
      </div>
    </form>
  )
}
