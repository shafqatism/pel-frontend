"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { fleetApi } from "@/lib/api/fleet"
import type { CreateTripDto } from "@/lib/types/fleet"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Navigation, Plus, RefreshCw, AlertTriangle, Trash2 } from "lucide-react"
const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })
const today = () => new Date().toISOString().split("T")[0]

function AddTripDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient()
  const { data: vehicles } = useQuery({ queryKey: ["vehicles", "dropdown"], queryFn: fleetApi.vehicles.dropdown })
  const { mutate, isPending } = useMutation({
    mutationFn: (dto: CreateTripDto) => fleetApi.trips.create(dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["trips"] }); onClose() },
  })

  const [form, setForm] = useState<CreateTripDto>({
    vehicleId: "", destination: "", tripDate: today(), meterOut: 0,
  })
  const set = (k: keyof CreateTripDto, v: string | number) => setForm(f => ({ ...f, [k]: v }))

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Navigation className="w-4 h-4 text-primary" />Log New Trip</DialogTitle></DialogHeader>
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
              <Label>Destination *</Label>
              <Input placeholder="Site Alpha" value={form.destination} onChange={e => set("destination", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Trip Date *</Label>
              <Input type="date" value={form.tripDate} onChange={e => set("tripDate", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Purpose</Label>
              <Input placeholder="Official duty" value={form.purposeOfVisit ?? ""} onChange={e => set("purposeOfVisit", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Driver Name</Label>
              <Input placeholder="Ahmed Khan" value={form.driverName ?? ""} onChange={e => set("driverName", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Meter Out (km) *</Label>
              <Input type="number" value={form.meterOut || ""} onChange={e => set("meterOut", Number(e.target.value))} required />
            </div>
            <div className="space-y-1.5">
              <Label>Meter In (km)</Label>
              <Input type="number" placeholder="On return" value={form.meterIn ?? ""} onChange={e => set("meterIn", Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>Fuel Allotted (L)</Label>
              <Input type="number" value={form.fuelAllottedLiters ?? ""} onChange={e => set("fuelAllottedLiters", Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>Fuel Cost (PKR)</Label>
              <Input type="number" value={form.fuelCostPkr ?? ""} onChange={e => set("fuelCostPkr", Number(e.target.value))} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending || !form.vehicleId}>{isPending ? "Saving…" : "Log Trip"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function TripsView() {
  const [showAdd, setShowAdd] = useState(false)
  const qc = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["trips"],
    queryFn: () => fleetApi.trips.list({ limit: 50 }),
  })

  const { mutate: deleteTrip } = useMutation({
    mutationFn: (id: string) => fleetApi.trips.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trips"] }),
  })

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Trip Logs</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track vehicle movements and operational records</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="w-3.5 h-3.5 mr-1.5" />Refresh</Button>
          <Button size="sm" onClick={() => setShowAdd(true)}><Plus className="w-3.5 h-3.5 mr-1.5" />Log Trip</Button>
        </div>
      </div>

      <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
        {isLoading ? (
          <CardContent className="py-16 text-center text-muted-foreground text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />Loading trips…
          </CardContent>
        ) : error ? (
          <CardContent className="py-16 text-center text-sm">
            <AlertTriangle className="w-6 h-6 text-rose-500 mx-auto mb-2" />
            <p className="font-semibold text-rose-600">Failed to load trips</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>Retry</Button>
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-bold text-xs uppercase tracking-wide">Date</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Vehicle</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Destination</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Driver</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Meter Out</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Meter In</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Distance</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Fuel (L)</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.data ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-muted-foreground text-sm">
                    <Navigation className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    No trips logged yet.
                  </TableCell>
                </TableRow>
              ) : (
                (data?.data ?? []).map(t => (
                  <TableRow key={t.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="text-sm">{fmt(t.tripDate)}</TableCell>
                    <TableCell>
                      <div className="font-mono text-xs font-bold text-primary">{t.vehicle?.registrationNumber ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{t.vehicle?.vehicleName}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{t.destination}</div>
                      {t.purposeOfVisit && <div className="text-xs text-muted-foreground">{t.purposeOfVisit}</div>}
                    </TableCell>
                    <TableCell className="text-sm">{t.driverName ?? "—"}</TableCell>
                    <TableCell className="font-mono text-sm">{t.meterOut.toLocaleString()}</TableCell>
                    <TableCell className="font-mono text-sm">{t.meterIn?.toLocaleString() ?? "—"}</TableCell>
                    <TableCell className="font-mono text-sm text-emerald-600">
                      {t.meterIn ? `${(t.meterIn - t.meterOut).toLocaleString()} km` : "—"}
                    </TableCell>
                    <TableCell className="text-sm">{t.fuelAllottedLiters ?? "—"}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-rose-600"
                        onClick={() => { if (confirm("Delete this trip?")) deleteTrip(t.id) }}>
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
            Showing {data.data.length} of {data.total} trips
          </div>
        )}
      </Card>

      <AddTripDialog open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  )
}
