"use client"

import { useFleetSummary, useVehicleReport } from "@/features/fleet/hooks/use-vehicles"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Truck, Search, FileText, Download, BarChart3, 
  Fuel, Wrench, Settings, MapPin, Calendar, 
  ArrowRight, RefreshCw, AlertCircle, Clock,
  DollarSign, Activity, History, User
} from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

const fmtNumber = (n: number) => new Intl.NumberFormat().format(n)
const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"

function VehicleReportDrawer({ id, open, onClose }: { id: string | null, open: boolean, onClose: () => void }) {
  const { data: report, isLoading } = useVehicleReport(id)

  if (!id) return null

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto p-0">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/40 px-6 py-5">
          <SheetHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <SheetTitle className="text-xl font-black tracking-tight uppercase">
                  {report?.registrationNumber || "Loading..."}
                </SheetTitle>
                <SheetDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {report?.vehicleName} • Full Operational History
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[200px] gap-3">
             <RefreshCw className="w-10 h-10 animate-spin text-primary/40" />
             <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Collecting Data Modules...</p>
          </div>
        ) : (
          <div className="p-6 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {[
                 { label: "Total Trips", value: report?.trips?.length || 0, icon: History, color: "text-blue-600" },
                 { label: "Total KM", value: fmtNumber(report?.trips?.reduce((acc: any, t: any) => acc + (t.totalKm || 0), 0) || 0), icon: Activity, color: "text-amber-600" },
                 { label: "Fuel Expenses", value: `PKR ${fmtNumber(report?.fuelLogs?.reduce((acc: any, f: any) => acc + (f.totalCost || 0), 0) || 0)}`, icon: Fuel, color: "text-emerald-600" },
                 { label: "Maint. Cost", value: `PKR ${fmtNumber(report?.maintenanceRecords?.reduce((acc: any, m: any) => acc + (m.costPkr || 0), 0) || 0)}`, icon: Wrench, color: "text-rose-600" },
               ].map(s => (
                 <div key={s.label} className="p-4 rounded-2xl border border-border/50 bg-muted/20 flex flex-col gap-1">
                    <s.icon className={`w-4 h-4 mb-1 ${s.color}`} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{s.label}</p>
                    <p className="text-lg font-black tracking-tight">{s.value}</p>
                 </div>
               ))}
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4 rounded-xl p-1 bg-muted/50 border border-border/20">
                <TabsTrigger value="overview" className="rounded-lg text-[10px] font-black uppercase">Overview</TabsTrigger>
                <TabsTrigger value="trips" className="rounded-lg text-[10px] font-black uppercase">Trips</TabsTrigger>
                <TabsTrigger value="fuel" className="rounded-lg text-[10px] font-black uppercase">Fuel</TabsTrigger>
                <TabsTrigger value="maintenance" className="rounded-lg text-[10px] font-black uppercase">Maint.</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6 space-y-6">
                 <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    {[
                      { l: "Make & Model", v: `${report?.make} ${report?.model} (${report?.year})` },
                      { l: "Engine Number", v: report?.engineNumber },
                      { l: "Chassis Number", v: report?.chassisNumber },
                      { l: "Type / Fuel", v: `${report?.type} / ${report?.fuelType}` },
                      { l: "Ownership", v: report?.ownershipStatus },
                      { l: "Current Odo", v: `${fmtNumber(report?.currentOdometerKm || 0)} KM` },
                      { l: "Department", v: report?.assignedDepartment || "PEL Central" },
                      { l: "Current Site", v: report?.assignedSite || "None" },
                    ].map(i => (
                      <div key={i.l} className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{i.l}</p>
                        <p className="text-sm font-bold border-b border-border/20 pb-1">{i.v || "N/A"}</p>
                      </div>
                    ))}
                 </div>

                 <Card className="rounded-2xl border-emerald-100 bg-emerald-50/30 overflow-hidden">
                    <CardHeader className="py-3 px-4 bg-emerald-100/50 border-b border-emerald-100">
                       <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700 flex items-center gap-2">
                         <MapPin className="w-3.5 h-3.5" /> Site Assignments
                       </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                       <Table>
                          <TableBody>
                             {report?.assignments?.map((a: any) => (
                               <TableRow key={a.id} className="border-emerald-100/50 hover:bg-emerald-100/20">
                                  <TableCell className="py-2 text-xs font-bold">{a.assignedTo}</TableCell>
                                  <TableCell className="py-2 text-[10px] font-black uppercase text-emerald-600">{fmtDate(a.assignmentDate)}</TableCell>
                                  <TableCell className="py-2 text-right">
                                     <Badge variant="outline" className="text-[9px] uppercase font-black bg-white border-emerald-200">{a.status}</Badge>
                                  </TableCell>
                               </TableRow>
                             ))}
                          </TableBody>
                       </Table>
                    </CardContent>
                 </Card>
              </TabsContent>

              <TabsContent value="trips" className="mt-6">
                 <Table>
                    <TableHeader>
                       <TableRow className="bg-muted/30">
                          <TableHead className="text-[10px] font-black uppercase">Date</TableHead>
                          <TableHead className="text-[10px] font-black uppercase">Destination</TableHead>
                          <TableHead className="text-[10px] font-black uppercase">Distance</TableHead>
                          <TableHead className="text-[10px] font-black uppercase">Driver</TableHead>
                       </TableRow>
                    </TableHeader>
                    <TableBody>
                       {report?.trips?.map((t: any) => (
                         <TableRow key={t.id}>
                            <TableCell className="text-xs font-bold">{fmtDate(t.tripDate)}</TableCell>
                            <TableCell className="text-xs font-medium">{t.destination}</TableCell>
                            <TableCell className="text-xs font-black text-primary">{t.totalKm} KM</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{t.driverName}</TableCell>
                         </TableRow>
                       ))}
                    </TableBody>
                 </Table>
              </TabsContent>

              <TabsContent value="fuel" className="mt-6">
                 <Table>
                    <TableHeader>
                       <TableRow className="bg-muted/30">
                          <TableHead className="text-[10px] font-black uppercase">Date</TableHead>
                          <TableHead className="text-[10px] font-black uppercase">Liters</TableHead>
                          <TableHead className="text-[10px] font-black uppercase">Cost (PKR)</TableHead>
                          <TableHead className="text-[10px] font-black uppercase">Odo</TableHead>
                       </TableRow>
                    </TableHeader>
                    <TableBody>
                       {report?.fuelLogs?.map((f: any) => (
                         <TableRow key={f.id}>
                            <TableCell className="text-xs font-bold">{fmtDate(f.date)}</TableCell>
                            <TableCell className="text-xs font-medium">{f.quantityLiters} L</TableCell>
                            <TableCell className="text-xs font-black text-primary">{fmtNumber(f.totalCost)}</TableCell>
                            <TableCell className="text-[10px] font-bold text-muted-foreground uppercase">{fmtNumber(f.odometerReading)}</TableCell>
                         </TableRow>
                       ))}
                    </TableBody>
                 </Table>
              </TabsContent>

              <TabsContent value="maintenance" className="mt-6">
                 <div className="space-y-4">
                    {report?.maintenanceRecords?.map((m: any) => (
                      <div key={m.id} className="p-4 rounded-xl border border-border/50 bg-muted/5 space-y-2">
                         <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">{m.type}</span>
                            <span className="text-[10px] font-bold text-muted-foreground">{fmtDate(m.maintenanceDate)}</span>
                         </div>
                         <p className="text-sm font-semibold leading-tight">{m.description}</p>
                         <div className="flex items-center justify-between pt-2 border-t border-border/10">
                            <span className="text-xs text-muted-foreground italic">By: {m.maintenanceBy || "Vendor"}</span>
                            <span className="text-sm font-black text-rose-600">PKR {fmtNumber(m.costPkr)}</span>
                         </div>
                      </div>
                    ))}
                 </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default function FleetSummaryView() {
  const [search, setSearch] = useState("")
  const [reportId, setReportId] = useState<string | null>(null)

  const { data: summary, isLoading, error, refetch } = useFleetSummary()

  const filtered = summary?.filter((v: any) => 
    v.registrationNumber.toLowerCase().includes(search.toLowerCase()) ||
    v.vehicleName.toLowerCase().includes(search.toLowerCase())
  ) || []

  const stats = [
    { label: "Total Fleet KM", value: fmtNumber(summary?.reduce((a: any, v: any) => a + (v.totalKm || 0), 0) || 0), icon: Activity, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Fleet Fuel Load", value: `PKR ${fmtNumber(summary?.reduce((a: any, v: any) => a + (v.totalFuelCost || 0), 0) || 0)}`, icon: Fuel, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Global Maintenance", value: `PKR ${fmtNumber(summary?.reduce((a: any, v: any) => a + (v.totalMaintenanceCost || 0), 0) || 0)}`, icon: Wrench, color: "text-rose-600", bg: "bg-rose-50" },
    { label: "Active Deployments", value: summary?.filter((v: any) => v.status === "active").length || 0, icon: Truck, color: "text-amber-600", bg: "bg-amber-50" },
  ]

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
             <BarChart3 className="w-6 h-6 text-primary" /> Fleet Performance Summary
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Aggregated metrics and cross-module operational reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="w-3.5 h-3.5 mr-1.5" />Refresh</Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="rounded-2xl border-border/50 shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${s.bg}`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{s.label}</p>
                <p className={`text-lg font-black mt-0.5 ${s.color}`}>{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden bg-white/50 dark:bg-black/20 backdrop-blur-sm">
        <div className="p-4 border-b border-border/40 flex items-center justify-between gap-4">
           <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search Reg# or Vehicle Name..." 
                className="pl-9 rounded-xl border-border/40 bg-muted/20"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
           </div>
           <div className="flex items-center gap-2 text-[10px] uppercase font-black text-muted-foreground tracking-widest">
              Total Assets: {summary?.length || 0}
           </div>
        </div>

        {isLoading ? (
          <div className="py-24 text-center">
             <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-primary/50" />
             <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Aggregating Cloud Fleet Data...</p>
          </div>
        ) : error ? (
           <div className="py-24 text-center">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-3" />
              <p className="font-bold text-rose-600">Failed to sync fleet metrics</p>
           </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/50">
                <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] py-4">Vehicle Identity</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] py-4">Utilization</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] py-4">Fuel Activity</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] py-4">Maintenance</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] py-4">Status</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
               {filtered.map((v: any) => (
                 <TableRow key={v.id} className="group hover:bg-muted/30 transition-all border-b border-border/30">
                    <TableCell className="py-4">
                       <div className="flex flex-col">
                          <span 
                            className="font-black text-sm text-primary hover:underline cursor-pointer flex items-center gap-1.5"
                            onClick={() => setReportId(v.id)}
                          >
                             {v.registrationNumber} <ArrowRight className="w-3 h-3 translate-x-[-4px] opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                          </span>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase mt-0.5 tracking-wider">{v.vehicleName} • {v.model}</span>
                       </div>
                    </TableCell>
                    <TableCell>
                       <div className="space-y-1.5">
                          <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter">
                             <span>Trips: {v.tripCount}</span>
                             <span className="text-primary">{fmtNumber(v.totalKm)} KM</span>
                          </div>
                          <Progress value={Math.min((v.totalKm / 10000) * 100, 100)} className="h-1 bg-muted" />
                       </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-black">PKR {fmtNumber(v.totalFuelCost)}</span>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">{v.totalFuelLiters} Liters • {v.fuelCount} Logs</span>
                       </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-black text-rose-600">PKR {fmtNumber(v.totalMaintenanceCost)}</span>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">{v.maintenanceCount} Records</span>
                       </div>
                    </TableCell>
                    <TableCell>
                       <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-widest ${
                         v.status === "active" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                         v.status === "in_maintenance" ? "bg-amber-50 text-amber-600 border-amber-200" :
                         "bg-rose-50 text-rose-600 border-rose-200"
                       }`}>
                         {v.status}
                       </Badge>
                    </TableCell>
                    <TableCell>
                       <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
                         onClick={() => setReportId(v.id)}>
                          <FileText className="w-4 h-4" />
                       </Button>
                    </TableCell>
                 </TableRow>
               ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <VehicleReportDrawer id={reportId} open={!!reportId} onClose={() => setReportId(null)} />
    </div>
  )
}
