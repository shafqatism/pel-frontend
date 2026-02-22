"use client"

import { useQuery } from "@tanstack/react-query"
import { 
  LayoutDashboard, Truck, Users, DollarSign, MapPin, 
  Activity, Package, AlertCircle, ShieldAlert,
  BarChart3, TrendingUp, PieChart as PieChartIcon,
  ArrowUpRight, ArrowDownRight
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { fleetApi } from "@/lib/api/fleet"
import { hrApi } from "@/lib/api/hr"
import { financeApi } from "@/lib/api/finance"
import { hseApi } from "@/lib/api/hse"
import { sitesApi } from "@/lib/api/sites"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie
} from "recharts"

const COLORS = ["#d97706", "#1f2937", "#6366f1", "#f43f5e", "#10b981"]

export default function DashboardView() {
  const { data: fleet, isLoading: fleetLoading } = useQuery({ queryKey: ["vehicles", "counts"], queryFn: () => fleetApi.vehicles.list({ limit: 0 }) })
  const { data: hr, isLoading: hrLoading } = useQuery({ queryKey: ["employees", "counts"], queryFn: () => hrApi.employees.list({ limit: 0 }) })
  const { data: sites, isLoading: sitesLoading } = useQuery({ queryKey: ["sites", "counts"], queryFn: () => sitesApi.sites.list({ limit: 0 }) })
  const { data: finance, isLoading: finLoading } = useQuery({ queryKey: ["expenses", "summary"], queryFn: financeApi.expenses.summary })
  
  const { data: trends, isLoading: trendsLoading } = useQuery({ queryKey: ["expenses", "trends"], queryFn: financeApi.expenses.trends })
  const { data: hseStats, isLoading: hseLoading } = useQuery({ queryKey: ["hse", "stats"], queryFn: hseApi.stats })
  const { data: predictions } = useQuery({ queryKey: ["fleet", "predictions"], queryFn: fleetApi.vehicles.maintenancePredictions })

  const stats = [
    { label: "Active Vehicles", value: fleet?.total ?? 0, icon: Truck, change: "+2 this week", trend: "up", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30", loading: fleetLoading },
    { label: "Total Manpower", value: hr?.total ?? 0, icon: Users, change: "+4 this month", trend: "up", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30", loading: hrLoading },
    { label: "Operational Sites", value: sites?.total ?? 0, icon: MapPin, change: "Active across regions", trend: "stable", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30", loading: sitesLoading },
    { label: "Monthly Expenditure", value: finance?.totalSpent ? `₨ ${(finance.totalSpent / 1000000).toFixed(1)}M` : "₨ 0", icon: DollarSign, change: "Current month", trend: "down", color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-950/30", loading: finLoading },
  ]

  const hsePieData = hseStats?.severityCount ? [
    { name: "Low", value: hseStats.severityCount.low },
    { name: "Medium", value: hseStats.severityCount.medium },
    { name: "High", value: hseStats.severityCount.high },
    { name: "Critical", value: hseStats.severityCount.critical },
  ].filter(v => v.value > 0) : []

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Command Center</h1>
          <p className="text-sm text-muted-foreground mt-0.5 font-medium">Analytics & Operational Overview for Petroleum Exploration Limited.</p>
        </div>
        <div className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-2xl border border-border/50 backdrop-blur-sm">
           <div className="px-3 py-1 rounded-xl bg-white dark:bg-black/40 shadow-sm text-[10px] font-black uppercase tracking-widest text-primary border border-primary/10">Production Mode</div>
           <div className="px-3 py-1 text-[10px] font-bold text-muted-foreground tracking-widest uppercase">v1.2 Stable</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="rounded-3xl border-border/50 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 group overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
               <stat.icon className="w-24 h-24" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">
                {stat.label}
              </CardTitle>
              <div className={`p-2.5 rounded-2xl transition-all ${stat.bg} group-hover:rotate-12 duration-300 shadow-sm`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {stat.loading ? (
                <Skeleton className="h-9 w-24 rounded-xl" />
              ) : (
                <div className={`text-3xl font-black tracking-tighter ${stat.color}`}>{stat.value}</div>
              )}
              <div className="text-[10px] font-bold text-muted-foreground/60 mt-2 flex items-center gap-1.5 uppercase tracking-wider">
                {stat.trend === "up" ? <ArrowUpRight className="w-3 h-3 text-emerald-500" /> : stat.trend === "down" ? <ArrowDownRight className="w-3 h-3 text-rose-500" /> : <Activity className="w-3 h-3" />}
                {stat.change}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expenditure Trends */}
        <Card className="lg:col-span-2 rounded-[2rem] border-border/50 shadow-sm bg-gradient-to-br from-white to-gray-50 dark:from-gray-900/50 dark:to-gray-950/50 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
               <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-widest text-muted-foreground">
                 <TrendingUp className="w-4 h-4 text-primary" />
                 Monthly Expenditure Trends
               </CardTitle>
               <CardDescription className="text-[10px] font-bold uppercase mt-1">Approved expenses over time</CardDescription>
            </div>
            <div className="flex gap-2">
               <div className="w-2 h-2 rounded-full bg-primary" />
               <div className="w-2 h-2 rounded-full bg-muted" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full pt-4">
              {trendsLoading ? (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground animate-pulse">Computing vectors...</div>
              ) : (trends?.length ?? 0) > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
                    <XAxis 
                      dataKey="month" 
                      fontSize={10} 
                      fontWeight="bold"
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val) => {
                        const [y, m] = val.split('-')
                        return new Date(2000, parseInt(m)-1).toLocaleString('en-US', { month: 'short' })
                      }}
                    />
                    <YAxis 
                      fontSize={10} 
                      fontWeight="bold"
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val) => `₨${(val/1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                      formatter={(val: number) => [`₨ ${val.toLocaleString()}`, "Expenditure"]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#d97706" 
                      strokeWidth={4}
                      dot={{ r: 4, fill: "#d97706", strokeWidth: 2, stroke: "#fff" }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
                   <div className="w-12 h-12 rounded-2xl bg-muted/30 flex items-center justify-center text-muted-foreground/20 italic">0</div>
                   <p className="text-[10px] font-black uppercase tracking-widest">Insufficient data for trends</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Safety Distribution */}
        <Card className="rounded-[2rem] border-border/50 shadow-sm bg-white dark:bg-black/10">
          <CardHeader>
            <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-widest text-muted-foreground">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              Safety Incident Severity
            </CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase mt-1">Incident breakdown across fleet & sites</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] w-full">
              {hseLoading ? (
                 <div className="h-full flex items-center justify-center animate-pulse"><PieChartIcon className="w-8 h-8 opacity-10" /></div>
              ) : hsePieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={hsePieData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {hsePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={10} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center px-6">
                   <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-3">
                      <ShieldCheck className="w-6 h-6 text-emerald-500" />
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Perfect Safety Record</p>
                   <p className="text-[9px] text-muted-foreground mt-2 font-medium">No safety incidents registered in the system currently.</p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
               {hsePieData.map((d, i) => (
                 <div key={d.name} className="flex items-center gap-2 p-2 rounded-xl bg-muted/30">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <div>
                       <p className="text-[8px] font-black uppercase tracking-tighter text-muted-foreground">{d.name}</p>
                       <p className="text-xs font-black leading-none mt-0.5">{d.value}</p>
                    </div>
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Maintenance Roadmap */}
         <Card className="rounded-[2rem] border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30">
               <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-widest text-muted-foreground">
                  <Cog className="w-4 h-4 text-primary" />
                  Upcoming Maintenance Roadmap
               </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                  {(predictions ?? []).length === 0 ? (
                    <div className="py-20 text-center text-muted-foreground">
                       <Package className="w-8 h-8 mx-auto mb-2 opacity-10" />
                       <p className="text-[10px] font-black uppercase tracking-widest">No maintenance predictions yet</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/30">
                       {(predictions ?? []).slice(0, 5).map((p: any) => (
                         <div key={p.vehicleId} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors group">
                            <div className="flex items-center gap-4">
                               <div className={`p-3 rounded-2xl ${p.status === 'overdue' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                                  <Truck className="w-4 h-4" />
                               </div>
                               <div>
                                  <div className="text-sm font-black text-foreground">{p.registrationNumber}</div>
                                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{p.vehicleName}</div>
                               </div>
                            </div>
                            <div className="text-right">
                               <div className={`text-xs font-black ${p.status === 'overdue' ? 'text-rose-600' : 'text-amber-600'}`}>
                                  {p.daysRemaining <= 0 ? "OVERDUE" : `IN ${p.daysRemaining} DAYS`}
                               </div>
                               <div className="text-[9px] font-medium text-muted-foreground italic">Based on {p.basis}</div>
                            </div>
                         </div>
                       ))}
                    </div>
                  )}
               </div>
               <div className="p-4 bg-muted/10 border-t border-border/30 text-center">
                  <button className="text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:underline transition-all">Full Fleet Roadmap</button>
               </div>
            </CardContent>
         </Card>

         {/* Site Operations Alert Feed */}
         <Card className="rounded-[2rem] border-border/50 shadow-sm bg-gradient-to-tr from-white to-gray-50 dark:from-gray-900/40 dark:to-gray-950/40">
            <CardHeader>
               <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-widest text-muted-foreground">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  Live Operational Feed
               </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-3">
                  {[
                    { title: "New Site Acquisition", desc: "Block Kirthar added to registry", time: "Just now", icon: MapPin, color: "text-blue-500", bg: "bg-blue-50" },
                    { title: "Manpower Deployment", desc: "5 technicians assigned to Site A", time: "12min ago", icon: Users, color: "text-emerald-500", bg: "bg-emerald-50" },
                    { title: "High Value Expense", desc: "PKR 1.2M approved for Drilling Parts", time: "1h ago", icon: DollarSign, color: "text-primary", bg: "bg-amber-50" },
                    { title: "Compliance Warning", desc: "3 vehicles insurance expiring soon", time: "3h ago", icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-50" }
                  ].map((alert, i) => (
                    <div key={i} className="flex gap-4 p-3 rounded-2xl bg-white/60 dark:bg-black/40 border border-border/40 hover:border-primary/20 transition-all cursor-pointer group">
                       <div className={`w-10 h-10 rounded-xl ${alert.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                          <alert.icon className={`w-4 h-4 ${alert.color}`} />
                       </div>
                       <div className="flex-1">
                          <div className="flex items-center justify-between">
                             <span className="text-xs font-black text-foreground leading-none">{alert.title}</span>
                             <span className="text-[9px] font-medium text-muted-foreground">{alert.time}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">{alert.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </CardContent>
         </Card>
      </div>
    </div>
  )
}
