"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { landRentalApi } from "@/lib/api/land-rental"
import type { LandRental, CreateLandRentalDto } from "@/lib/types/land-rental"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Landmark, Plus, RefreshCw, AlertTriangle, Trash2, User, MapPin, Calendar, DollarSign, FileText } from "lucide-react"

const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
const today = () => new Date().toISOString().split("T")[0]

function AddRentalDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient()
  const { mutate, isPending } = useMutation({
    mutationFn: (dto: CreateLandRentalDto) => landRentalApi.rentals.create(dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["land-rentals"] }); onClose() },
  })

  const [form, setForm] = useState<CreateLandRentalDto>({
    landOwnerName: "", location: "", monthlyRent: 0, leaseStartDate: today(), status: "active",
  })

  const set = (k: keyof CreateLandRentalDto, v: any) => setForm(f => ({ ...f, [k]: v }))

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Landmark className="w-4 h-4 text-primary" /> New Land Lease Agreement
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={e => { e.preventDefault(); mutate(form) }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Owner Name *</Label>
              <Input placeholder="Full name of owner" value={form.landOwnerName} onChange={e => set("landOwnerName", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Owner CNIC</Label>
              <Input placeholder="00000-0000000-0" value={form.landOwnerCnic ?? ""} onChange={e => set("landOwnerCnic", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Owner Phone</Label>
              <Input placeholder="+92 300 1234567" value={form.landOwnerPhone ?? ""} onChange={e => set("landOwnerPhone", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Lease Location *</Label>
              <Input placeholder="Block / Site name" value={form.location} onChange={e => set("location", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>District</Label>
              <Input placeholder="District" value={form.district ?? ""} onChange={e => set("district", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Province</Label>
              <Input placeholder="Province" value={form.province ?? ""} onChange={e => set("province", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Area (Acres)</Label>
              <Input type="number" step="0.01" value={form.areaAcres || ""} onChange={e => set("areaAcres", Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>Monthly Rent (PKR) *</Label>
              <Input type="number" value={form.monthlyRent || ""} onChange={e => set("monthlyRent", Number(e.target.value))} required />
            </div>
            <div className="space-y-1.5">
              <Label>Lease Start Date *</Label>
              <Input type="date" value={form.leaseStartDate} onChange={e => set("leaseStartDate", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Lease End Date</Label>
              <Input type="date" value={form.leaseEndDate ?? ""} onChange={e => set("leaseEndDate", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Site Mapping</Label>
              <Input placeholder="Internal site code" value={form.site ?? ""} onChange={e => set("site", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Purpose of Lease</Label>
              <Input placeholder="Drilling pad, storage, access road, etc." value={form.purpose ?? ""} onChange={e => set("purpose", e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Create Agreement"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function LandRentalView() {
  const [showAdd, setShowAdd] = useState(false)
  const qc = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["land-rentals"],
    queryFn: () => landRentalApi.rentals.list({ limit: 100 }),
  })

  const { mutate: del } = useMutation({
    mutationFn: (id: string) => landRentalApi.rentals.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["land-rentals"] }),
  })

  const totalMonthlyLoad = data?.data.reduce((s, r) => s + Number(r.monthlyRent), 0) ?? 0

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Landmark className="w-6 h-6 text-primary" />
            Land Rental Management
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track land lease agreements, payments, and site acquisitions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="w-3.5 h-3.5 mr-1.5" />Refresh</Button>
          <Button size="sm" onClick={() => setShowAdd(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> New Agreement
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Active Agreements", value: data?.data.filter(r => r.status === "active").length ?? 0, icon: FileText, color: "text-blue-600" },
          { label: "Total Area (Acres)", value: (data?.data.reduce((s, r) => s + (r.areaAcres ? Number(r.areaAcres) : 0), 0) ?? 0).toFixed(1), icon: MapPin, color: "text-amber-600" },
          { label: "Monthly Rent Load", value: `PKR ${totalMonthlyLoad.toLocaleString()}`, icon: DollarSign, color: "text-emerald-600" },
        ].map(s => (
          <Card key={s.label} className="rounded-2xl border-border/50 shadow-sm transition-all hover:shadow-md">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-muted/50">
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{s.label}</p>
                <p className={`text-xl font-black mt-0.5 ${s.color}`}>{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden bg-white/50 dark:bg-black/20 backdrop-blur-sm">
        {isLoading ? (
          <CardContent className="py-24 text-center text-muted-foreground text-sm">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-primary/50" />
            Reading lease registry...
          </CardContent>
        ) : error ? (
          <CardContent className="py-24 text-center text-sm">
            <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto mb-3" />
            <p className="font-bold text-rose-600 text-base">Failed to sync lease data</p>
            <p className="text-muted-foreground mt-1">Check your connection or backend status.</p>
            <Button variant="outline" size="sm" className="mt-6 rounded-xl" onClick={() => refetch()}>Retrying connection</Button>
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/50">
                <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] py-4">Landowner & Location</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] py-4">Status</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] py-4">Area</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] py-4">Monthly Rent</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] py-4">Lease Term</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] py-4 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.data ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20 text-muted-foreground font-medium text-sm">
                    <Landmark className="w-12 h-12 mx-auto mb-3 opacity-10" />
                    No active land lease agreements found.
                  </TableCell>
                </TableRow>
              ) : (
                (data?.data ?? []).map(r => (
                  <TableRow key={r.id} className="hover:bg-muted/30 transition-all border-b border-border/30 group">
                    <TableCell className="py-4">
                      <div className="font-bold text-sm text-foreground">{r.landOwnerName}</div>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-semibold uppercase mt-1">
                        <MapPin className="w-3 h-3 text-primary/70" /> {r.location}, {r.district}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center text-[10px] font-black px-2.5 py-1 rounded-full border uppercase tracking-widest ${
                        r.status === "active" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                        r.status === "expired" ? "bg-amber-50 text-amber-600 border-amber-200" :
                        "bg-rose-50 text-rose-600 border-rose-200"
                      }`}>
                        {r.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-bold">{r.areaAcres ? `${r.areaAcres} Acres` : "—"}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-black text-primary">PKR {Number(r.monthlyRent).toLocaleString()}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs font-semibold">
                         <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                         {fmt(r.leaseStartDate)}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5 ml-5">
                         {r.leaseEndDate ? `Ends ${fmt(r.leaseEndDate)}` : "No expiry set"}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-rose-600 rounded-lg"
                           onClick={() => { if (confirm("Terminate this agreement?")) del(r.id) }}>
                           <Trash2 className="w-4 h-4" />
                         </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      <AddRentalDialog open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  )
}
