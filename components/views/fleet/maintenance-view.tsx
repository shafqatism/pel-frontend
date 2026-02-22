"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { fleetApi } from "@/lib/api/fleet"
import type { CreateMaintenanceDto } from "@/lib/types/fleet"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Wrench, Plus, RefreshCw, AlertTriangle, Trash2, DollarSign } from "lucide-react"

const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
const today = () => new Date().toISOString().split("T")[0]

const MAINTENANCE_TYPES = ["oil_change","tire_rotation","brake_service","engine_service","transmission","battery","electrical","ac_service","body_repair","inspection","other"]

function AddMaintenanceDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient()
  const { data: vehicles } = useQuery({ queryKey: ["vehicles", "dropdown"], queryFn: fleetApi.vehicles.dropdown })
  const { mutate, isPending } = useMutation({
    mutationFn: (dto: CreateMaintenanceDto) => fleetApi.maintenance.create(dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["maintenance"] }); onClose() },
  })

  const [form, setForm] = useState<CreateMaintenanceDto>({
    vehicleId: "", maintenanceDate: today(), costPkr: 0,
  })
  const set = <K extends keyof CreateMaintenanceDto>(k: K, v: CreateMaintenanceDto[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-primary" /> Log Maintenance Record
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={e => { e.preventDefault(); mutate(form) }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Vehicle *</Label>
              <Select value={form.vehicleId} onValueChange={v => set("vehicleId", v)}>
                <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                <SelectContent>
                  {(vehicles ?? []).map(v => (
                    <SelectItem key={v.id} value={v.id}>{v.registrationNumber} — {v.vehicleName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Maintenance Date *</Label>
              <Input type="date" value={form.maintenanceDate} onChange={e => set("maintenanceDate", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.type ?? ""} onValueChange={v => set("type", v)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {MAINTENANCE_TYPES.map(t => (
                    <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Cost (PKR) *</Label>
              <Input type="number" value={form.costPkr || ""} onChange={e => set("costPkr", Number(e.target.value))} required />
            </div>
            <div className="space-y-1.5">
              <Label>Shop / Person</Label>
              <Input placeholder="Ali Auto Workshop" value={form.shopOrPerson ?? ""} onChange={e => set("shopOrPerson", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Odometer at Service (km)</Label>
              <Input type="number" value={form.odometerAtMaintenanceKm ?? ""} onChange={e => set("odometerAtMaintenanceKm", Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>Next Service Odometer (km)</Label>
              <Input type="number" value={form.nextServiceOdometerKm ?? ""} onChange={e => set("nextServiceOdometerKm", Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>Next Service Due Date</Label>
              <Input type="date" value={form.nextServiceDueDate ?? ""} onChange={e => set("nextServiceDueDate", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Maintenance By</Label>
              <Input placeholder="Technician name" value={form.maintenanceBy ?? ""} onChange={e => set("maintenanceBy", e.target.value)} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Description</Label>
              <Textarea rows={3} placeholder="Describe the work done…" value={form.description ?? ""}
                onChange={e => set("description", e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending || !form.vehicleId}>{isPending ? "Saving…" : "Save Record"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function MaintenanceView() {
  const [showAdd, setShowAdd] = useState(false)
  const qc = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["maintenance"],
    queryFn: () => fleetApi.maintenance.list({ limit: 50 }),
  })

  const { mutate: del } = useMutation({
    mutationFn: (id: string) => fleetApi.maintenance.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["maintenance"] }),
  })

  const totalCost = data?.data.reduce((s, r) => s + Number(r.costPkr), 0) ?? 0

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Maintenance Records</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Service, repair, and inspection history</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="w-3.5 h-3.5 mr-1.5" />Refresh</Button>
          <Button size="sm" onClick={() => setShowAdd(true)}><Plus className="w-3.5 h-3.5 mr-1.5" />Log Service</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Records", value: data?.total ?? 0 },
          { label: "Total Cost (PKR)", value: totalCost.toLocaleString() },
          { label: "Avg Cost / Service", value: data?.total ? Math.round(totalCost / data.total).toLocaleString() : "0" },
        ].map(s => (
          <Card key={s.label} className="rounded-xl border-border/50 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30">
                <DollarSign className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
                <p className="text-xl font-black text-primary mt-0.5">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
        {isLoading ? (
          <CardContent className="py-16 text-center text-muted-foreground text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />Loading maintenance records…
          </CardContent>
        ) : error ? (
          <CardContent className="py-16 text-center text-sm">
            <AlertTriangle className="w-6 h-6 text-rose-500 mx-auto mb-2" />
            <p className="font-semibold text-rose-600">Failed to load records</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>Retry</Button>
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                {["Date","Vehicle","Type","Description","Shop","Cost (PKR)","Odometer","Next Due","By",""].map(h => (
                  <TableHead key={h} className="font-bold text-xs uppercase tracking-wide">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.data ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-12 text-muted-foreground text-sm">
                    <Wrench className="w-8 h-8 mx-auto mb-2 opacity-20" />No maintenance records yet.
                  </TableCell>
                </TableRow>
              ) : (
                (data?.data ?? []).map(r => (
                  <TableRow key={r.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="text-sm">{fmt(r.maintenanceDate)}</TableCell>
                    <TableCell>
                      <div className="font-mono text-xs font-bold text-primary">{r.vehicle?.registrationNumber ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{r.vehicle?.vehicleName}</div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-medium capitalize bg-amber-50 dark:bg-amber-950/30 text-amber-700 px-2 py-0.5 rounded-full">
                        {r.type?.replace(/_/g, " ") ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm max-w-[180px] truncate">{r.description ?? "—"}</TableCell>
                    <TableCell className="text-sm">{r.shopOrPerson ?? "—"}</TableCell>
                    <TableCell className="font-mono text-sm font-bold text-primary">{Number(r.costPkr).toLocaleString()}</TableCell>
                    <TableCell className="font-mono text-sm">{r.odometerAtMaintenanceKm ? `${Number(r.odometerAtMaintenanceKm).toLocaleString()} km` : "—"}</TableCell>
                    <TableCell className="text-sm">{r.nextServiceDueDate ? fmt(r.nextServiceDueDate) : "—"}</TableCell>
                    <TableCell className="text-sm">{r.maintenanceBy ?? "—"}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-rose-600"
                        onClick={() => { if (confirm("Delete this record?")) del(r.id) }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
        {data && data.total > 0 && (
          <div className="px-4 py-3 border-t border-border/40 text-xs text-muted-foreground">
            {data.data.length} of {data.total} records
          </div>
        )}
      </Card>

      <AddMaintenanceDialog open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  )
}
