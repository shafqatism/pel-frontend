"use client"

import { useState, useMemo } from "react"
import { useAttendance } from "@/features/hr/hooks/use-attendance"
import { useNav } from "@/lib/nav-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format, parseISO, subDays, eachDayOfInterval, startOfMonth, endOfMonth, addDays, differenceInMinutes } from "date-fns"
import { toast } from "sonner"
import { DataTable } from "@/components/ui/data-table"
import { getAttendanceDetailColumns } from "../core-columns"
import {
  MapPin, Camera, ArrowLeft, CalendarDays, FileSpreadsheet, ListChecks, ShieldCheck
} from "lucide-react"

const statusConfig = {
  present:  { label: "P", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  absent:   { label: "A", className: "bg-rose-100    text-rose-700    border-rose-200"    },
  leave:    { label: "L", className: "bg-amber-100   text-amber-700   border-amber-200"   },
  late:     { label: "T", className: "bg-orange-100  text-orange-700  border-orange-200"  },
  half_day: { label: "H", className: "bg-gray-100    text-gray-600    border-gray-200"    },
}

function StatusMarker({ status }: { status: string | undefined }) {
  if (!status) return <span className="text-gray-200 text-[9px] font-black opacity-30">·</span>;
  const cfg = statusConfig[status as keyof typeof statusConfig] ?? { label: "?", className: "bg-gray-100" }
  return (
    <span 
      className={`inline-flex items-center justify-center w-6 h-6 text-[9px] font-black rounded-md border uppercase shadow-sm ${cfg.className}`}
    >
      {cfg.label}
    </span>
  )
}

function MiniInfo({ type, value, label }: { type: 'gps' | 'img', value?: string, label: string }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-1 mt-0.5">
       <div className={`p-0.5 rounded-sm ${type === 'gps' ? 'bg-sky-50 text-sky-600' : 'bg-purple-50 text-purple-600'}`}>
          {type === 'gps' ? <MapPin className="w-2 h-2" /> : <Camera className="w-2 h-2" />}
       </div>
       <span className="text-[7px] font-black uppercase text-muted-foreground/50 truncate max-w-[40px]" title={value}>{label}</span>
    </div>
  )
}

const fmtTime = (d: string | undefined) => d ? new Date(d).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "—"

export default function AttendanceEmployeeDetailView() {
  const { setActive, metadata } = useNav()
  const employeeId = metadata?.employeeId
  const employeeName = metadata?.employeeName || "Employee"
  
  const [range, setRange] = useState({
    start: metadata?.monthStart || format(startOfMonth(new Date()), "yyyy-MM-dd"),
    end: metadata?.monthEnd || format(endOfMonth(new Date()), "yyyy-MM-dd")
  })

  const days = useMemo(() => {
    try {
      return eachDayOfInterval({ 
        start: parseISO(range.start), 
        end: parseISO(range.end) 
      })
    } catch (e) {
      return []
    }
  }, [range])

  const { data: attendance, isLoading, refetch } = useAttendance({ 
    employeeId,
    startDate: range.start, 
    endDate: range.end,
    limit: 1000 
  })

  const attendanceMap = useMemo(() => {
    const map: Record<string, any> = {}
    attendance?.data?.forEach(record => {
      map[record.date] = record
    })
    return map
  }, [attendance])

  const stats = useMemo(() => {
    const counts = { present: 0, absent: 0, leave: 0, late: 0, otCount: 0, total: 0 }
    attendance?.data?.forEach(r => {
      counts.total++
      if (r.status === 'present') counts.present++
      else if (r.status === 'absent') counts.absent++
      if (r.overtimeIn) counts.otCount++
    })
    return counts
  }, [attendance])

  const processedData = useMemo(() => {
    return days.map(day => {
      const dateStr = format(day, "yyyy-MM-dd")
      return {
        date: dateStr,
        record: attendanceMap[dateStr]
      }
    })
  }, [days, attendanceMap])

  const columns = useMemo(() => getAttendanceDetailColumns(fmtTime, StatusMarker, MiniInfo), [])

  const handleExportCSV = () => {
    if (!attendance?.data) return toast.error("No data to export");
    let csv = `Attendance Master Report - ${employeeName}\nID: ${employeeId}, Period: ${range.start} to ${range.end}\n\n`;
    csv += "Date,Day,Status,Site,Check In,Check In Loc,Check Out,Check Out Loc,OT In,OT In Loc,OT Out,OT Out Loc\n";
    days.forEach(day => {
      const dStr = format(day, "yyyy-MM-dd");
      const r = attendanceMap[dStr];
      const row = [
        format(day, "yyyy-MM-dd"),
        format(day, "EEEE"),
        r?.status || "—",
        r?.site || "General",
        r?.checkIn ? fmtTime(r.checkIn) : "—",
        r?.checkInLocation || "—",
        r?.checkOut ? fmtTime(r.checkOut) : "—",
        r?.checkOutLocation || "—",
        r?.overtimeIn ? fmtTime(r.overtimeIn) : "—",
        r?.overtimeInLocation || "—",
        r?.overtimeOut ? fmtTime(r.overtimeOut) : "—",
        r?.overtimeOutLocation || "—"
      ];
      csv += row.join(",") + "\n";
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Attendance_Master_${employeeName}.csv`;
    a.click();
    toast.success("Horizontal Spreadsheet Exported");
  }

  if (!employeeId) return <div className="p-20 text-center"><Button onClick={() => setActive("hr-attendance-history")}>Back to History</Button></div>;

  return (
    <div className="space-y-4 animate-in fade-in duration-500 w-full max-w-full overflow-x-hidden pb-8 px-2 md:px-4">
      {/* Slim Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card p-4 md:p-6 rounded-[32px] border border-border/50 shadow-xl shadow-black/[0.02]">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 border border-border/50 hover:bg-primary/5 hidden md:flex" onClick={() => setActive("hr-attendance-history")}>
            <ArrowLeft className="w-5 h-5 text-primary" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-[22px] bg-primary text-white flex items-center justify-center text-lg md:text-2xl font-black shadow-xl shadow-primary/20 ring-4 ring-primary/5">
               {employeeName.split(' ').map((n: string) => n[0]).join('')}
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-black tracking-tight text-foreground leading-tight">{employeeName}</h1>
              <div className="flex items-center gap-2 mt-1">
                 <span className="text-[8px] md:text-[9px] font-black uppercase text-primary/60 bg-primary/5 px-2.3 py-0.5 rounded-lg border border-primary/10 tracking-widest">ID: {employeeId.slice(-8)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 bg-muted/30 p-1.5 rounded-[26px] border border-border/40">
           <div className="flex items-center gap-2 px-3 h-10 bg-background border rounded-[18px] shadow-sm">
              <CalendarDays className="w-3.5 h-3.5 text-primary" />
              <div className="flex items-center gap-2">
                 <Input type="date" value={range.start} onChange={e => setRange(r => ({ ...r, start: e.target.value }))} className="h-8 w-28 md:w-32 border-0 bg-transparent text-[11px] font-black focus-visible:ring-0 p-0" />
                 <span className="text-[10px] font-black text-muted-foreground opacity-30">TO</span>
                 <Input type="date" value={range.end} onChange={e => setRange(r => ({ ...r, end: e.target.value }))} className="h-8 w-28 md:w-32 border-0 bg-transparent text-[11px] font-black focus-visible:ring-0 p-0" />
              </div>
           </div>

           <Button 
             variant="glow" 
             size="sm" 
             className="h-10 rounded-[18px] px-4 bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-lg shadow-emerald-200/50"
             onClick={handleExportCSV}
             disabled={isLoading || !attendance?.data}
           >
             <FileSpreadsheet className="w-3.5 h-3.5 mr-2" /> <span className="hidden sm:inline text-xs font-bold">Export CSV</span>
           </Button>
        </div>
      </div>

      {/* Slim Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
         {[
            { label: "Present Info", count: stats.present, color: "emerald", desc: "Reported" },
            { label: "Absences", count: stats.absent, color: "rose", desc: "Missed" },
            { label: "Overtime Duty", count: stats.otCount, color: "sky", desc: "Extra" },
            { label: "Total Logs", count: stats.total, color: "indigo", desc: "Historical" }
         ].map((s) => (
            <Card key={s.label} className={`rounded-[24px] border-${s.color}-200/30 bg-${s.color}-50/10 overflow-hidden relative border-b-4 border-b-${s.color}-500/10`}>
               <CardContent className="p-4 md:p-5">
                  <p className={`text-[8px] md:text-[9px] font-black text-${s.color}-600 uppercase tracking-widest leading-none mb-2`}>{s.label}</p>
                  <p className={`text-2xl md:text-3xl font-black text-${s.color}-900 tracking-tighter`}>{s.count}</p>
               </CardContent>
            </Card>
         ))}
      </div>

      {/* COMPACT DATA LOGS */}
      <Card className="rounded-[32px] border-border/50 shadow-2xl shadow-black/[0.03] overflow-hidden bg-white/40 backdrop-blur-3xl border-t">
        <CardHeader className="bg-muted/5 border-b py-4 md:py-5 px-5 md:px-8 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/10">
                  <ListChecks className="w-6 h-6" />
               </div>
               <div>
                  <CardTitle className="text-lg md:text-xl font-black tracking-tight">Master Attendance Ledger</CardTitle>
                  <p className="text-[9px] font-black uppercase text-muted-foreground/40 tracking-widest mt-0.5">Records for selected date range</p>
               </div>
            </div>
        </CardHeader>
        {/* MASTER TABLE (Compact DataTable) */}
        <div className="p-1">
          <DataTable
            columns={columns}
            data={processedData}
            isLoading={isLoading}
            searchKey="date"
          />
        </div>
      </Card>
      
    </div>
  )
}
