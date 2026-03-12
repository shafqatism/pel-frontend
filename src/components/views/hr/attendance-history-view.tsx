"use client"

import { useState, useMemo } from "react"
import { useEmployeesDropdown } from "@/features/hr/hooks/use-employees"
import { useAttendance } from "@/features/hr/hooks/use-attendance"
import { useNav } from "@/lib/nav-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  RefreshCw, ChevronLeft, ChevronRight, ArrowLeft, BarChart3, Search, 
  UserCheck, UserX, User
} from "lucide-react"
import { format, addDays, startOfMonth, endOfMonth, parseISO } from "date-fns"
import { toast } from "sonner"
import { DataTable } from "@/components/ui/data-table"
import { getAttendanceHistoryColumns } from "../core-columns"

export default function AttendanceHistoryView() {
  const { setActive, setMetadata } = useNav()
  const [range, setRange] = useState({
    start: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    end: format(endOfMonth(new Date()), "yyyy-MM-dd")
  })
  const [search, setSearch] = useState("")

  const { data: employees, isLoading: employeesLoading } = useEmployeesDropdown()
  const { data: attendance, isLoading: attendanceLoading, refetch } = useAttendance({ 
    startDate: range.start, 
    endDate: range.end,
    limit: 5000 
  })

  const isLoading = employeesLoading || attendanceLoading

  // Map attendance to counts: employeeId -> { stats }
  const employeeStats = useMemo(() => {
    const stats: Record<string, { present: number, absent: number, leave: number, late: number, halfDay: number, total: number }> = {}
    
    attendance?.data?.forEach(record => {
      if (!stats[record.employeeId]) {
        stats[record.employeeId] = { present: 0, absent: 0, leave: 0, late: 0, halfDay: 0, total: 0 }
      }
      const s = stats[record.employeeId]
      s.total++
      if (record.status === 'present') s.present++
      else if (record.status === 'absent') s.absent++
      else if (record.status === 'leave') s.leave++
      else if (record.status === 'late') s.late++
      else if (record.status === 'half_day') s.halfDay++
    })
    return stats
  }, [attendance])

  const filteredEmployees = useMemo(() => {
    if (!employees) return []
    return employees.filter(e => 
      e.fullName.toLowerCase().includes(search.toLowerCase()) || 
      e.id.toLowerCase().includes(search.toLowerCase())
    )
  }, [employees, search])

  const handleNavigateToDetail = (empId: string, empName: string) => {
    setMetadata({ employeeId: empId, employeeName: empName, monthStart: range.start, monthEnd: range.end })
    setActive("hr-employee-detail")
  }

  const processedData = useMemo(() => {
    return filteredEmployees.map(emp => {
      const s = employeeStats[emp.id] || { present: 0, absent: 0, leave: 0, late: 0, total: 0 }
      const completion = s.total > 0 ? (s.present / 30 * 100).toFixed(0) : "0"
      return {
        ...emp,
        stats: s,
        completion
      }
    })
  }, [filteredEmployees, employeeStats])

  const columns = useMemo(() => getAttendanceHistoryColumns(handleNavigateToDetail), [])

  return (
    <div className="space-y-6 animate-in fade-in duration-500 w-full max-w-full overflow-x-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="group rounded-xl h-10 w-10 border border-border/50 hover:bg-primary/10 hover:border-primary/50 transition-all" onClick={() => setActive("hr-attendance")}>
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Attendance History</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Overview of employee performance & records</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border">
             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                const prev = startOfMonth(addDays(parseISO(range.start), -1))
                setRange({ start: format(prev, "yyyy-MM-dd"), end: format(endOfMonth(prev), "yyyy-MM-dd") })
             }}><ChevronLeft className="w-4 h-4" /></Button>
             <span className="text-sm font-semibold px-2 min-w-[140px] text-center">{format(parseISO(range.start), "MMMM yyyy")}</span>
             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                const next = startOfMonth(addDays(parseISO(range.end), 1))
                setRange({ start: format(next, "yyyy-MM-dd"), end: format(endOfMonth(next), "yyyy-MM-dd") })
             }}><ChevronRight className="w-4 h-4" /></Button>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} /> Sync
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="rounded-2xl border-emerald-100 bg-emerald-50/20 shadow-none">
            <CardContent className="p-5 flex items-center gap-4">
               <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <UserCheck className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Total Present</p>
                  <p className="text-2xl font-black text-emerald-900">{Object.values(employeeStats).reduce((acc, s) => acc + s.present, 0)}</p>
               </div>
            </CardContent>
         </Card>
         <Card className="rounded-2xl border-rose-100 bg-rose-50/20 shadow-none">
            <CardContent className="p-5 flex items-center gap-4">
               <div className="h-12 w-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <UserX className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-xs font-bold text-rose-600 uppercase tracking-wider">Total Absent</p>
                  <p className="text-2xl font-black text-rose-900">{Object.values(employeeStats).reduce((acc, s) => acc + s.absent, 0)}</p>
               </div>
            </CardContent>
         </Card>
         <Card className="rounded-2xl border-primary/10 bg-primary/5 shadow-none">
            <CardContent className="p-5 flex items-center gap-4">
               <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <BarChart3 className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-xs font-bold text-primary uppercase tracking-wider">Total Records</p>
                  <p className="text-2xl font-black text-primary-900">{attendance?.data?.length || 0}</p>
               </div>
            </CardContent>
         </Card>
      </div>

      <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 border-b py-4 px-6">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <CardTitle className="text-base font-bold">Employee Attendance Summary</CardTitle>
             <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                   placeholder="Search employee..." 
                   value={search} 
                   onChange={e => setSearch(e.target.value)} 
                   className="pl-9 h-9 w-64 bg-background"
                />
             </div>
           </div>
        </CardHeader>
        <div className="p-1">
          <DataTable
            columns={columns}
            data={processedData}
            searchKey="fullName"
            isLoading={isLoading}
          />
        </div>
    </Card>
    </div>
  )
}
