"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { fleetApi } from "@/lib/api/fleet"
import type { CreateAssignmentDto } from "@/lib/types/fleet"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ClipboardList, Plus, RefreshCw, AlertTriangle, Trash2, Users } from "lucide-react"

const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
const today = () => new Date().toISOString().split("T")[0]

function AddAssignmentDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient()
  const { data: vehicles } = useQuery({ queryKey: ["vehicles", "dropdown"], queryFn: fleetApi.vehicles.dropdown })
  const { mutate, isPending } = useMutation({
    mutationFn: (dto: CreateAssignmentDto) => fleetApi.assignments.create(dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["assignments"] }); onClose() },
  })

  const [form, setForm] = useState<CreateAssignmentDto>({
    vehicleId: "", assignedTo: "", assignedBy: "", assignmentDate: today(),
  })
  const set = <K extends keyof CreateAssignmentDto>(k: K, v: CreateAssignmentDto[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-primary" /> New Vehicle Assignment
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
              <Label>Assigned To *</Label>
              <Input placeholder="Employee name" value={form.assignedTo} onChange={e => set("assignedTo", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Assigned By *</Label>
              <Input placeholder="Manager name" value={form.assignedBy} onChange={e => set("assignedBy", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Assignment Date *</Label>
              <Input type="date" value={form.assignmentDate} onChange={e => set("assignmentDate", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Return Date</Label>
              <Input type="date" value={form.returnDate ?? ""} onChange={e => set("returnDate", e.target.value)} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Purpose</Label>
              <Input placeholder="Field visit, project site, etc." value={form.purpose ?? ""} onChange={e => set("purpose", e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending || !form.vehicleId}>{isPending ? "Saving…" : "Create Assignment"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function AssignmentsView() {
  const [showAdd, setShowAdd] = useState(false)
  const qc = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["assignments"],
    queryFn: () => fleetApi.assignments.list({ limit: 50 }),
  })

  const { mutate: del } = useMutation({
    mutationFn: (id: string) => fleetApi.assignments.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assignments"] }),
  })

  const activeCount = data?.data.filter(a => a.status === "active").length ?? 0

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vehicle Assignments</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track vehicle-to-employee allocations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="w-3.5 h-3.5 mr-1.5" />Refresh</Button>
          <Button size="sm" onClick={() => setShowAdd(true)}><Plus className="w-3.5 h-3.5 mr-1.5" />New Assignment</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Assignments", value: data?.total ?? 0, color: "text-primary" },
          { label: "Currently Active", value: activeCount, color: "text-emerald-600" },
          { label: "Completed / Returned", value: (data?.total ?? 0) - activeCount, color: "text-muted-foreground" },
        ].map(s => (
          <Card key={s.label} className="rounded-xl border-border/50 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
                <p className={`text-xl font-black mt-0.5 ${s.color}`}>{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
        {isLoading ? (
          <CardContent className="py-16 text-center text-muted-foreground text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />Loading assignments…
          </CardContent>
        ) : error ? (
          <CardContent className="py-16 text-center text-sm">
            <AlertTriangle className="w-6 h-6 text-rose-500 mx-auto mb-2" />
            <p className="font-semibold text-rose-600">Failed to load assignments</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>Retry</Button>
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                {["Vehicle","Assigned To","Assigned By","Date","Return Date","Purpose","Status",""].map(h => (
                  <TableHead key={h} className="font-bold text-xs uppercase tracking-wide">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.data ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-sm">
                    <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-20" />No assignments yet.
                  </TableCell>
                </TableRow>
              ) : (
                (data?.data ?? []).map(a => (
                  <TableRow key={a.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell>
                      <div className="font-mono text-xs font-bold text-primary">{a.vehicle?.registrationNumber ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{a.vehicle?.vehicleName}</div>
                    </TableCell>
                    <TableCell className="text-sm font-semibold">{a.assignedTo}</TableCell>
                    <TableCell className="text-sm">{a.assignedBy}</TableCell>
                    <TableCell className="text-sm">{fmt(a.assignmentDate)}</TableCell>
                    <TableCell className="text-sm">{a.returnDate ? fmt(a.returnDate) : "—"}</TableCell>
                    <TableCell className="text-sm">{a.purpose ?? "—"}</TableCell>
                    <TableCell>
                      <span className={`inline-flex text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                        a.status === "active"
                          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                          : "bg-gray-100 text-gray-600 border-gray-200"
                      }`}>
                        {a.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-rose-600"
                        onClick={() => { if (confirm("Delete this assignment?")) del(a.id) }}>
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
            {data.data.length} of {data.total} assignments
          </div>
        )}
      </Card>

      <AddAssignmentDialog open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  )
}
