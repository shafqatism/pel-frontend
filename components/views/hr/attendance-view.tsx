"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { hrApi } from "@/lib/api/hr"
import type { Attendance, CreateAttendanceDto } from "@/lib/types/hr"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Plus, RefreshCw, AlertTriangle, Trash2, Clock, MapPin } from "lucide-react"

const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
const fmtTime = (d: string | undefined) => d ? new Date(d).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "—"
const today = () => new Date().toISOString().split("T")[0]

const statusConfig = {
  present:  { label: "Present",  className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  absent:   { label: "Absent",   className: "bg-rose-100    text-rose-700    border-rose-200"    },
  leave:    { label: "Leave",    className: "bg-amber-100   text-amber-700   border-amber-200"   },
  late:     { label: "Late",     className: "bg-orange-100  text-orange-700  border-orange-200"  },
  half_day: { label: "Half Day", className: "bg-gray-100    text-gray-600    border-gray-200"    },
}

function AttendanceStatus({ status }: { status: string }) {
  const cfg = statusConfig[status as keyof typeof statusConfig] ?? { label: status, className: "" }
  return <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${cfg.className}`}>{cfg.label}</span>
}

function MarkAttendanceDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient()
  const { data: employees } = useQuery({ queryKey: ["employees", "dropdown"], queryFn: hrApi.employees.dropdown })
  const { mutate, isPending } = useMutation({
    mutationFn: (dto: CreateAttendanceDto) => hrApi.attendance.create(dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["attendance"] }); onClose() },
  })

  const [form, setForm] = useState<CreateAttendanceDto>({
    employeeId: "", date: today(), status: "present",
  })

  const set = (k: keyof CreateAttendanceDto, v: any) => setForm(f => ({ ...f, [k]: v }))

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> Mark Attendance</DialogTitle></DialogHeader>
        <form onSubmit={e => { e.preventDefault(); mutate(form) }} className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Employee *</Label>
              <Select value={form.employeeId} onValueChange={v => set("employeeId", v)}>
                <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>
                  {(employees ?? []).map(e => <SelectItem key={e.id} value={e.id}>{e.fullName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Date *</Label>
              <Input type="date" value={form.date} onChange={e => set("date", e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Check In</Label>
                <Input type="time" onChange={e => set("checkIn", `${form.date}T${e.target.value}:00`)} />
              </div>
              <div className="space-y-1.5">
                <Label>Check Out</Label>
                <Input type="time" onChange={e => set("checkOut", `${form.date}T${e.target.value}:00`)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.keys(statusConfig).map(s => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Site / Location</Label>
              <Input placeholder="Site Alpha" value={form.site ?? ""} onChange={e => set("site", e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending || !form.employeeId}>{isPending ? "Saving…" : "Save Record"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function AttendanceView() {
  const [date, setDate] = useState(today())
  const [showAdd, setShowAdd] = useState(false)
  const qc = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["attendance", date],
    queryFn: () => hrApi.attendance.list({ date: date || undefined, limit: 100 }),
  })

  const { mutate: deleteRecord } = useMutation({
    mutationFn: (id: string) => hrApi.attendance.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance"] }),
  })

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Daily Attendance</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track daily check-ins, check-outs, and site presence</p>
        </div>
        <div className="flex gap-2">
          <Input type="date" className="h-9 w-40 text-sm" value={date} onChange={e => setDate(e.target.value)} />
          <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="w-3.5 h-3.5 mr-1.5" />Refresh</Button>
          <Button size="sm" onClick={() => setShowAdd(true)}><Plus className="w-3.5 h-3.5 mr-1.5" />Mark Attendance</Button>
        </div>
      </div>

      <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
        {isLoading ? (
           <CardContent className="py-16 text-center text-muted-foreground text-sm">
             <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" /> Loading attendance…
           </CardContent>
        ) : error ? (
           <CardContent className="py-16 text-center text-sm">
             <AlertTriangle className="w-6 h-6 text-rose-500 mx-auto mb-2" />
             <p className="font-semibold text-rose-600">Failed to load attendance</p>
             <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>Retry</Button>
           </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-bold text-xs uppercase tracking-wide">Employee</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Check In</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Check Out</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Site</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Status</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.data ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-20" /> No attendance records for this date.
                  </TableCell>
                </TableRow>
              ) : (
                (data?.data ?? []).map(record => (
                  <TableRow key={record.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell>
                      <div className="font-semibold text-sm">{record.employee?.fullName}</div>
                      <div className="text-xs text-muted-foreground">{record.employee?.designation}</div>
                    </TableCell>
                    <TableCell className="text-sm font-mono text-emerald-600">{fmtTime(record.checkIn)}</TableCell>
                    <TableCell className="text-sm font-mono text-amber-600">{fmtTime(record.checkOut)}</TableCell>
                    <TableCell>
                       {record.site ? (
                         <div className="flex items-center gap-1.5 text-xs">
                           <MapPin className="w-3 h-3 text-primary" /> {record.site}
                         </div>
                       ) : "—"}
                    </TableCell>
                    <TableCell><AttendanceStatus status={record.status} /></TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-rose-600"
                        onClick={() => { if (confirm("Delete this record?")) deleteRecord(record.id) }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      <MarkAttendanceDialog open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  )
}
