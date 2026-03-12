"use client"

import { useState, useEffect } from "react"
import { useAttendance, useCreateAttendance, useUpdateAttendance, useDeleteAttendance } from "@/features/hr/hooks/use-attendance"
import { useEmployeesDropdown } from "@/features/hr/hooks/use-employees"
import type { Attendance, CreateAttendanceDto } from "@/lib/types/hr"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Calendar, Plus, RefreshCw, AlertTriangle, Trash2, Clock, MapPin, 
  Edit2, BarChart3, HelpCircle, Navigation, Camera, Edit, MoreHorizontal,
  ChevronRight, FileDown, FileText
} from "lucide-react"
import { useAppDispatch } from "@/lib/store"
import { useNav } from "@/lib/nav-context"
import { openGlobalAnalytics, openGlobalHelp } from "@/lib/store/slices/ui-slice"
import { MultiAttachmentUpload } from "@/components/common/multi-attachment-upload"
import { SingleImageUpload } from "@/components/common/single-image-upload"
import { toast } from "sonner"
import { hrApi } from "@/lib/api/hr"
import { DataTable } from "@/components/ui/data-table"
import { getAttendanceColumns } from "../core-columns"
import { useMemo } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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

function AttendanceDrawer({ open, onClose, data }: { open: boolean; onClose: () => void; data?: Attendance | null }) {
  const mode = data ? 'edit' : 'create'
  const { data: employees } = useEmployeesDropdown()
  
  const createMutation = useCreateAttendance()
  const updateMutation = useUpdateAttendance()

  const isPending = createMutation.isPending || updateMutation.isPending

  const handleSave = (form: CreateAttendanceDto) => {
    if (mode === 'create') {
      createMutation.mutate(form, { onSuccess: onClose })
    } else {
      updateMutation.mutate({ id: data!.id, dto: form }, { onSuccess: onClose })
    }
  }

  const [form, setForm] = useState<CreateAttendanceDto>({
    employeeId: "", date: today(), status: "present",
    attachments: []
  })

  useEffect(() => {
    if (data) {
      setForm({
        employeeId: data.employeeId || data.employee?.id || "",
        date: data.date ? new Date(data.date).toISOString().split('T')[0] : today(),
        status: data.status || "present",
        checkIn: data.checkIn ? new Date(data.checkIn).toISOString().slice(0, 16) : "",
        checkOut: data.checkOut ? new Date(data.checkOut).toISOString().slice(0, 16) : "",
        overtimeIn: data.overtimeIn ? new Date(data.overtimeIn).toISOString().slice(0, 16) : "",
        overtimeOut: data.overtimeOut ? new Date(data.overtimeOut).toISOString().slice(0, 16) : "",
        checkInLocation: data.checkInLocation || "",
        checkOutLocation: data.checkOutLocation || "",
        overtimeInLocation: data.overtimeInLocation || "",
        overtimeOutLocation: data.overtimeOutLocation || "",
        checkInPhoto: data.checkInPhoto || "",
        checkOutPhoto: data.checkOutPhoto || "",
        overtimeInPhoto: data.overtimeInPhoto || "",
        overtimeOutPhoto: data.overtimeOutPhoto || "",
        site: data.site || "",
        attachments: data.attachments || []
      })
    } else {
      setForm({ employeeId: "", date: today(), status: "present", attachments: [] })
    }
  }, [data])

  const set = (k: keyof CreateAttendanceDto, v: any) => setForm(f => ({ ...f, [k]: v }))

  const getLocation = (field: keyof CreateAttendanceDto) => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser")
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        set(field, `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
        toast.success("Location synchronized")
      },
      (err) => {
        toast.error("Enable location services for high-accuracy verification")
        console.error(err)
      }
    )
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg md:max-w-xl overflow-y-auto p-0">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/40 px-6 py-5">
          <SheetHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Clock className="w-4 h-4" />
              </div>
              <SheetTitle className="text-base">{mode === 'create' ? "Mark Attendance" : "Edit Attendance Record"}</SheetTitle>
            </div>
            <SheetDescription className="text-xs">Record or update daily check-ins, check-outs, and site presence.</SheetDescription>
          </SheetHeader>
        </div>

        <form onSubmit={e => { e.preventDefault(); handleSave(form) }} className="p-6 space-y-4">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Employee *</Label>
              <SearchableSelect
                options={(employees ?? []).map(e => ({ label: e.fullName, value: e.id }))}
                value={form.employeeId}
                onValueChange={v => set("employeeId", v)}
                placeholder="Select employee"
                triggerClassName={mode === 'edit' ? "opacity-50 pointer-events-none" : ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Date *</Label>
              <Input type="date" value={form.date} onChange={e => set("date", e.target.value)} required />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {/* Check In / Out Verification */}
              <div className="space-y-4 p-4 rounded-2xl border border-border/50 bg-muted/20">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                  <Clock className="w-3 h-3" /> Standard Entry / Exit
                </p>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Check In Time</Label>
                    <Input type="time" value={form.checkIn ? form.checkIn.split('T')[1].slice(0, 5) : ""} 
                        onChange={e => set("checkIn", `${form.date}T${e.target.value}:00`)} />
                    <div className="flex gap-2">
                      <Input placeholder="In Location..." value={form.checkInLocation ?? ""} onChange={e => set("checkInLocation", e.target.value)} className="h-8 text-[10px]" />
                      <Button type="button" variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={() => getLocation("checkInLocation")}>
                        <Navigation className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <SingleImageUpload label="Check In Photo" value={form.checkInPhoto} onChange={v => set("checkInPhoto", v)} module="hr" />
                  </div>

                  <div className="space-y-2 pt-2 border-t border-border/30">
                    <Label className="text-xs">Check Out Time</Label>
                    <Input type="time" value={form.checkOut ? form.checkOut.split('T')[1].slice(0, 5) : ""} 
                        onChange={e => set("checkOut", `${form.date}T${e.target.value}:00`)} />
                    <div className="flex gap-2">
                      <Input placeholder="Out Location..." value={form.checkOutLocation ?? ""} onChange={e => set("checkOutLocation", e.target.value)} className="h-8 text-[10px]" />
                      <Button type="button" variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={() => getLocation("checkOutLocation")}>
                        <Navigation className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <SingleImageUpload label="Check Out Photo" value={form.checkOutPhoto} onChange={v => set("checkOutPhoto", v)} module="hr" />
                  </div>
                </div>
              </div>

              {/* Overtime Verification */}
              <div className="space-y-4 p-4 rounded-2xl border border-border/50 bg-muted/20">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 flex items-center gap-2">
                  <Clock className="w-3 h-3" /> Overtime Log
                </p>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Overtime In</Label>
                    <Input type="time" value={form.overtimeIn ? form.overtimeIn.split('T')[1].slice(0, 5) : ""} 
                        onChange={e => set("overtimeIn", `${form.date}T${e.target.value}:00`)} />
                    <div className="flex gap-2">
                      <Input placeholder="OT In Location..." value={form.overtimeInLocation ?? ""} onChange={e => set("overtimeInLocation", e.target.value)} className="h-8 text-[10px]" />
                      <Button type="button" variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={() => getLocation("overtimeInLocation")}>
                        <Navigation className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <SingleImageUpload label="OT In Photo" value={form.overtimeInPhoto} onChange={v => set("overtimeInPhoto", v)} module="hr" />
                  </div>

                  <div className="space-y-2 pt-2 border-t border-border/30">
                    <Label className="text-xs">Overtime Out</Label>
                    <Input type="time" value={form.overtimeOut ? form.overtimeOut.split('T')[1].slice(0, 5) : ""} 
                        onChange={e => set("overtimeOut", `${form.date}T${e.target.value}:00`)} />
                    <div className="flex gap-2">
                      <Input placeholder="OT Out Location..." value={form.overtimeOutLocation ?? ""} onChange={e => set("overtimeOutLocation", e.target.value)} className="h-8 text-[10px]" />
                      <Button type="button" variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={() => getLocation("overtimeOutLocation")}>
                        <Navigation className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <SingleImageUpload label="OT Out Photo" value={form.overtimeOutPhoto} onChange={v => set("overtimeOutPhoto", v)} module="hr" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border/40 mt-4">
            <Label className="text-sm font-semibold mb-2 block">Attendance Verification Media</Label>
            <p className="text-xs text-muted-foreground mb-4">Attach site photos or signed attendance sheets for verification.</p>
            <MultiAttachmentUpload
              value={form.attachments || []}
              onChange={(val) => set("attachments", val)}
              module="hr"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border/40 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending || !form.employeeId} className="font-bold">
              {isPending ? "Saving…" : mode === 'create' ? "Save Record" : "Save Changes"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

export default function AttendanceView() {
  const dispatch = useAppDispatch()
  const { setActive } = useNav()
  const [date, setDate] = useState(today())
  const [dialog, setDialog] = useState<{ open: boolean, data: Attendance | null }>({ open: false, data: null })

  const { data, isLoading, error, refetch } = useAttendance({ date: date || undefined, limit: 100 })

  const { mutate: deleteRecord } = useDeleteAttendance()

  const columns = useMemo(() => getAttendanceColumns(
    (id, data) => setDialog({ open: true, data }),
    (id) => { if (confirm("Delete this record?")) deleteRecord(id) },
    fmtTime,
    statusConfig
  ), [deleteRecord])

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      toast.info(`Generating ${format.toUpperCase()}...`)
      const res = await hrApi.reports.export('attendance', format)
      
      const blob = new Blob([res.data])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const ext = format === 'excel' ? 'xlsx' : format
      link.setAttribute('download', `PEL_HR_Attendance_${new Date().toISOString().slice(0, 10)}.${ext}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      toast.success(`Export successful`)
    } catch (err) {
      console.error("Export Error:", err)
      toast.error("Export failed. Please check your connection.")
    }
  }

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Daily Attendance</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track daily check-ins, check-outs, and site presence</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => dispatch(openGlobalAnalytics({ module: 'hr', type: 'attendance' }))}
            className="border-primary/20 hover:bg-primary/5 text-primary font-bold"
          >
            <BarChart3 className="w-4 h-4 mr-1.5" /> Analytics
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setActive("hr-attendance-history")}
            className="border-primary/20 hover:bg-primary/5 text-primary font-bold"
          >
            <Calendar className="w-4 h-4 mr-1.5" /> Monthly History
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => dispatch(openGlobalHelp({ module: 'hr', section: 'attendance' }))}
            className="border-slate-200 hover:bg-slate-50 text-slate-700 font-bold"
          >
            <HelpCircle className="w-4 h-4 mr-1.5" /> Help
          </Button>
          <Input type="date" className="h-9 w-40 text-sm" value={date} onChange={e => setDate(e.target.value)} />
          <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="w-3.5 h-3.5 mr-1.5" />Refresh</Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="font-bold border-slate-200 hover:bg-slate-50 text-slate-700"
              >
                <FileDown className="w-3.5 h-3.5 mr-1.5" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl p-1 w-40">
              <DropdownMenuItem onClick={() => handleExport('csv')} className="text-xs font-semibold p-2.5 rounded-lg cursor-pointer">
                <FileText className="w-4 h-4 mr-2 text-blue-600" /> Save as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('excel')} className="text-xs font-semibold p-2.5 rounded-lg cursor-pointer">
                <FileText className="w-4 h-4 mr-2 text-emerald-600" /> Save as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')} className="text-xs font-semibold p-2.5 rounded-lg cursor-pointer">
                <FileText className="w-4 h-4 mr-2 text-rose-600" /> Save as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button size="sm" onClick={() => setDialog({ open: true, data: null })} className="font-bold"><Plus className="w-3.5 h-3.5 mr-1.5" />Mark Attendance</Button>
        </div>
      </div>

      <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
        {isLoading ? (
           <div className="py-24 text-center">
             <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary opacity-20" />
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Synchronizing Attendance Records…</p>
           </div>
        ) : error ? (
           <div className="py-20 text-center">
             <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-4 opacity-50" />
             <p className="font-black uppercase tracking-widest text-sm text-rose-600">Secure link failure</p>
             <Button variant="outline" size="sm" className="mt-6 rounded-xl font-bold" onClick={() => refetch()}>Retrying Link</Button>
           </div>
        ) : (
          <div className="p-1">
            <DataTable
              columns={columns}
              data={data?.data ?? []}
              searchKey="employee_fullName"
            />
          </div>
        )}
      </Card>

      <AttendanceDrawer 
        open={dialog.open} 
        onClose={() => setDialog({ open: false, data: null })} 
        data={dialog.data} 
      />
    </div>
  )
}
