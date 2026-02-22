"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { fleetApi } from "@/lib/api/fleet"
import type { CreateFuelLogDto } from "@/lib/types/fleet"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Fuel, Plus, RefreshCw, AlertTriangle, Trash2 } from "lucide-react"
const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })
const today = () => new Date().toISOString().split("T")[0]

function AddFuelDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient()
  const { data: vehicles } = useQuery({ queryKey: ["vehicles", "dropdown"], queryFn: fleetApi.vehicles.dropdown })
  const { mutate, isPending } = useMutation({
    mutationFn: (dto: CreateFuelLogDto) => fleetApi.fuel.create(dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["fuel"] }); onClose() },
  })

  const [form, setForm] = useState<CreateFuelLogDto>({
    vehicleId: "", date: today(),
    quantityLiters: 0, ratePerLiter: 0, totalCost: 0, odometerReading: 0,
  })
  const set = <K extends keyof CreateFuelLogDto>(k: K, v: CreateFuelLogDto[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  // Auto-calc total cost
  const qty = form.quantityLiters
  const rate = form.ratePerLiter

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Fuel className="w-4 h-4 text-primary" />Log Fuel Fill-up</DialogTitle></DialogHeader>
        <form onSubmit={e => {
          e.preventDefault()
          mutate({ ...form, totalCost: qty * rate || form.totalCost })
        }} className="space-y-4">
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
              <Label>Date *</Label>
              <Input type="date" value={form.date} onChange={e => set("date", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Odometer Reading (km) *</Label>
              <Input type="number" value={form.odometerReading || ""} onChange={e => set("odometerReading", Number(e.target.value))} required />
            </div>
            <div className="space-y-1.5">
              <Label>Quantity (Liters) *</Label>
              <Input type="number" step="0.01" value={qty || ""}
                onChange={e => set("quantityLiters", Number(e.target.value))} required />
            </div>
            <div className="space-y-1.5">
              <Label>Rate per Liter (PKR) *</Label>
              <Input type="number" step="0.01" value={rate || ""}
                onChange={e => set("ratePerLiter", Number(e.target.value))} required />
            </div>
            <div className="space-y-1.5">
              <Label>Total Cost (PKR)</Label>
              <Input type="number" value={qty && rate ? (qty * rate).toFixed(2) : form.totalCost || ""}
                onChange={e => set("totalCost", Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>Station Name</Label>
              <Input placeholder="PSO Gulberg" value={form.stationName ?? ""} onChange={e => set("stationName", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Payment Method</Label>
              <Select value={form.paymentMethod ?? ""} onValueChange={v => set("paymentMethod", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="company_account">Company Account</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending || !form.vehicleId}>{isPending ? "Saving…" : "Save Fuel Log"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function FuelView() {
  const [showAdd, setShowAdd] = useState(false)
  const qc = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["fuel"],
    queryFn: () => fleetApi.fuel.list({ limit: 50 }),
  })

  const { mutate: deleteFuel } = useMutation({
    mutationFn: (id: string) => fleetApi.fuel.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fuel"] }),
  })

  const totalCost = data?.data.reduce((s, l) => s + Number(l.totalCost), 0) ?? 0
  const totalLiters = data?.data.reduce((s, l) => s + Number(l.quantityLiters), 0) ?? 0

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fuel Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Monitor fuel consumption across the fleet</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="w-3.5 h-3.5 mr-1.5" />Refresh</Button>
          <Button size="sm" onClick={() => setShowAdd(true)}><Plus className="w-3.5 h-3.5 mr-1.5" />Log Fuel</Button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Records", value: data?.total ?? 0, suffix: "" },
          { label: "Total Liters", value: totalLiters.toLocaleString("en", { maximumFractionDigits: 1 }), suffix: " L" },
          { label: "Total Cost", value: `PKR ${totalCost.toLocaleString("en", { maximumFractionDigits: 0 })}`, suffix: "" },
        ].map(s => (
          <Card key={s.label} className="rounded-xl border-border/50 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
              <p className="text-xl font-black text-primary mt-0.5">{s.value}{s.suffix}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
        {isLoading ? (
          <CardContent className="py-16 text-center text-muted-foreground text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />Loading fuel logs…
          </CardContent>
        ) : error ? (
          <CardContent className="py-16 text-center text-sm">
            <AlertTriangle className="w-6 h-6 text-rose-500 mx-auto mb-2" />
            <p className="font-semibold text-rose-600">Failed to load fuel data</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>Retry</Button>
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-bold text-xs uppercase tracking-wide">Date</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Vehicle</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Station</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Qty (L)</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Rate/L</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Total (PKR)</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Odometer</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Payment</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.data ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-muted-foreground text-sm">
                    <Fuel className="w-8 h-8 mx-auto mb-2 opacity-20" />No fuel records yet.
                  </TableCell>
                </TableRow>
              ) : (
                (data?.data ?? []).map(log => (
                  <TableRow key={log.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="text-sm">{fmt(log.date)}</TableCell>
                    <TableCell>
                      <div className="font-mono text-xs font-bold text-primary">{log.vehicle?.registrationNumber ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{log.vehicle?.vehicleName}</div>
                    </TableCell>
                    <TableCell className="text-sm">{log.stationName ?? "—"}</TableCell>
                    <TableCell className="font-mono text-sm font-semibold">{Number(log.quantityLiters).toFixed(1)}</TableCell>
                    <TableCell className="font-mono text-sm">{Number(log.ratePerLiter).toFixed(2)}</TableCell>
                    <TableCell className="font-mono text-sm font-bold text-primary">{Number(log.totalCost).toLocaleString()}</TableCell>
                    <TableCell className="font-mono text-sm">{Number(log.odometerReading).toLocaleString()} km</TableCell>
                    <TableCell className="text-sm capitalize">{log.paymentMethod?.replace("_", " ") ?? "—"}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-rose-600"
                        onClick={() => { if (confirm("Delete this fuel log?")) deleteFuel(log.id) }}>
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
            Showing {data.data.length} of {data.total} records
          </div>
        )}
      </Card>

      <AddFuelDialog open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  )
}
