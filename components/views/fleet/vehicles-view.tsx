"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { fleetApi } from "@/lib/api/fleet"
import type { Vehicle, CreateVehicleDto } from "@/lib/types/fleet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Truck, Plus, Search, RefreshCw, AlertTriangle,
  CheckCircle2, Wrench, PauseCircle, Trash2, Edit2,
} from "lucide-react"

// ─── Status Badge ──────────────────────────────────────────────────────────────
const statusConfig = {
  active:           { label: "Active",         className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  in_maintenance:   { label: "In Maintenance", className: "bg-amber-100  text-amber-700  border-amber-200"  },
  inactive:         { label: "Inactive",       className: "bg-gray-100   text-gray-600   border-gray-200"   },
  decommissioned:   { label: "Decommissioned", className: "bg-rose-100   text-rose-700   border-rose-200"   },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status as keyof typeof statusConfig] ?? { label: status, className: "" }
  return <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border ${cfg.className}`}>{cfg.label}</span>
}

// ─── Add Vehicle Dialog ────────────────────────────────────────────────────────
function AddVehicleDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient()
  const { mutate, isPending } = useMutation({
    mutationFn: (dto: CreateVehicleDto) => fleetApi.vehicles.create(dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["vehicles"] }); onClose() },
  })

  const [form, setForm] = useState<CreateVehicleDto>({
    registrationNumber: "", vehicleName: "", type: "suv",
    fuelType: "petrol", ownershipStatus: "company_owned", status: "active",
  })

  const set = (k: keyof CreateVehicleDto, v: string | number) =>
    setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); mutate(form) }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-primary" /> Register New Vehicle
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Registration Number *</Label>
              <Input placeholder="LEA-1234" value={form.registrationNumber}
                onChange={e => set("registrationNumber", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Vehicle Name *</Label>
              <Input placeholder="Toyota Hilux — Site Alpha" value={form.vehicleName}
                onChange={e => set("vehicleName", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Make</Label>
              <Input placeholder="Toyota" value={form.make ?? ""}
                onChange={e => set("make", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Model</Label>
              <Input placeholder="Hilux" value={form.model ?? ""}
                onChange={e => set("model", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Year</Label>
              <Input type="number" placeholder="2024" value={form.year ?? ""}
                onChange={e => set("year", Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>Color</Label>
              <Input placeholder="White" value={form.color ?? ""}
                onChange={e => set("color", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Vehicle Type</Label>
              <Select value={form.type} onValueChange={v => set("type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["sedan","suv","pickup","truck","bus","van","motorcycle","heavy_equipment"].map(t => (
                    <SelectItem key={t} value={t}>{t.replace("_"," ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Fuel Type</Label>
              <Select value={form.fuelType} onValueChange={v => set("fuelType", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["petrol","diesel","cng","electric","hybrid"].map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Ownership</Label>
              <Select value={form.ownershipStatus} onValueChange={v => set("ownershipStatus", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["company_owned","leased","rented","contractor"].map(t => (
                    <SelectItem key={t} value={t}>{t.replace("_"," ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["active","in_maintenance","inactive","decommissioned"].map(t => (
                    <SelectItem key={t} value={t}>{t.replace("_"," ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Assigned Site</Label>
              <Input placeholder="Site Alpha" value={form.assignedSite ?? ""}
                onChange={e => set("assignedSite", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Driver Name</Label>
              <Input placeholder="Ahmed Khan" value={form.currentDriverName ?? ""}
                onChange={e => set("currentDriverName", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Current Odometer (km)</Label>
              <Input type="number" placeholder="0" value={form.currentOdometerKm ?? ""}
                onChange={e => set("currentOdometerKm", Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>Insurance Expiry</Label>
              <Input type="date" value={form.insuranceExpiry ?? ""}
                onChange={e => set("insuranceExpiry", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Registration Expiry</Label>
              <Input type="date" value={form.registrationExpiry ?? ""}
                onChange={e => set("registrationExpiry", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Fitness Expiry</Label>
              <Input type="date" value={form.fitnessExpiry ?? ""}
                onChange={e => set("fitnessExpiry", e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Registering…" : "Register Vehicle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Vehicles View ────────────────────────────────────────────────────────
export default function VehiclesView() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showAdd, setShowAdd] = useState(false)
  const qc = useQueryClient()

  const { data: summary } = useQuery({
    queryKey: ["vehicles", "summary"],
    queryFn: fleetApi.vehicles.summary,
  })

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["vehicles", search, statusFilter],
    queryFn: () => fleetApi.vehicles.list({
      search: search || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      limit: 50,
    }),
  })

  const { mutate: deleteVehicle } = useMutation({
    mutationFn: (id: string) => fleetApi.vehicles.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vehicles"] }),
  })

  const summaryCards = [
    { label: "Total", value: summary?.total ?? 0,          icon: Truck,        color: "text-primary",   bg: "bg-primary/10"   },
    { label: "Active", value: summary?.active ?? 0,        icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "In Maintenance", value: summary?.in_maintenance ?? 0, icon: Wrench, color: "text-amber-600", bg: "bg-amber-50"  },
    { label: "Inactive", value: summary?.inactive ?? 0,    icon: PauseCircle,  color: "text-gray-500",  bg: "bg-gray-100"     },
  ]

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vehicles</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Fleet vehicle registry and management</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh
          </Button>
          <Button size="sm" onClick={() => setShowAdd(true)}>
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Vehicle
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {summaryCards.map(c => (
          <Card key={c.label} className="rounded-xl border-border/50 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${c.bg}`}>
                <c.icon className={`w-4 h-4 ${c.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">{c.label}</p>
                <p className={`text-xl font-black ${c.color}`}>{c.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input className="pl-9 h-9 text-sm" placeholder="Search by name or reg number…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 h-9 text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="in_maintenance">In Maintenance</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="decommissioned">Decommissioned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
        {isLoading ? (
          <CardContent className="py-16 text-center text-muted-foreground text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
            Loading vehicles…
          </CardContent>
        ) : error ? (
          <CardContent className="py-16 text-center text-sm">
            <AlertTriangle className="w-6 h-6 text-rose-500 mx-auto mb-2" />
            <p className="font-semibold text-rose-600">Failed to load vehicles</p>
            <p className="text-muted-foreground text-xs mt-1">Make sure the backend is running on port 4000</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>Retry</Button>
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-bold text-xs uppercase tracking-wide">Registration</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Vehicle Name</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Type / Fuel</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Driver</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Site</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Odometer</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Status</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.data ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-sm">
                    <Truck className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    No vehicles found. Add your first vehicle to get started.
                  </TableCell>
                </TableRow>
              ) : (
                (data?.data ?? []).map((v: Vehicle) => (
                  <TableRow key={v.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="font-mono text-xs font-bold text-primary">{v.registrationNumber}</TableCell>
                    <TableCell>
                      <div className="font-semibold text-sm">{v.vehicleName}</div>
                      <div className="text-xs text-muted-foreground">{v.make} {v.model} {v.year}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm capitalize">{v.type?.replace("_", " ")}</div>
                      <div className="text-xs text-muted-foreground capitalize">{v.fuelType}</div>
                    </TableCell>
                    <TableCell className="text-sm">{v.currentDriverName ?? "—"}</TableCell>
                    <TableCell className="text-sm">{v.assignedSite ?? "—"}</TableCell>
                    <TableCell className="text-sm font-mono">{Number(v.currentOdometerKm).toLocaleString()} km</TableCell>
                    <TableCell><StatusBadge status={v.status} /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-rose-600"
                          onClick={() => { if (confirm("Delete this vehicle?")) deleteVehicle(v.id) }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
        {data && data.total > 0 && (
          <div className="px-4 py-3 border-t border-border/40 text-xs text-muted-foreground flex items-center justify-between">
            <span>Showing {data.data.length} of {data.total} vehicles</span>
            <span className="text-primary font-semibold">{data.total} total</span>
          </div>
        )}
      </Card>

      <AddVehicleDialog open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  )
}
