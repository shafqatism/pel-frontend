"use client"

import { useQuery } from "@tanstack/react-query"
import { LayoutDashboard, Truck, Users, DollarSign, MapPin, Activity, Package, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fleetApi } from "@/lib/api/fleet"
import { hrApi } from "@/lib/api/hr"
import { financeApi } from "@/lib/api/finance"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardView() {
  const { data: fleet, isLoading: fleetLoading } = useQuery({ queryKey: ["vehicles", "counts"], queryFn: () => fleetApi.vehicles.list({ limit: 0 }) })
  const { data: hr, isLoading: hrLoading } = useQuery({ queryKey: ["employees", "counts"], queryFn: () => hrApi.employees.list({ limit: 0 }) })
  const { data: finance, isLoading: finLoading } = useQuery({ queryKey: ["expenses", "summary"], queryFn: financeApi.expenses.summary })

  const stats = [
    { label: "Active Vehicles", value: fleet?.total ?? 0, icon: Truck, change: "+2 this week", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30", loading: fleetLoading },
    { label: "Employees", value: hr?.total ?? 0, icon: Users, change: "+4 this month", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30", loading: hrLoading },
    { label: "Operational Sites", value: "6", icon: MapPin, change: "Active", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30", loading: false },
    { label: "Monthly Expenses", value: finance?.total ? `PKR ${(finance.total / 1000000).toFixed(1)}M` : "PKR 0", icon: DollarSign, change: "Budget utilized", color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-950/30", loading: finLoading },
  ]

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Command Center</h1>
        <p className="text-sm text-muted-foreground mt-1 text-balance">Enterprise Resource Planning portal for Petroleum Exploration Limited.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">
                {stat.label}
              </CardTitle>
              <div className={`p-2 rounded-xl transition-colors ${stat.bg} group-hover:scale-110 duration-200`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {stat.loading ? (
                <Skeleton className="h-8 w-20 rounded-md" />
              ) : (
                <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
              )}
              <p className="text-[11px] font-medium text-muted-foreground mt-1.5 flex items-center gap-1.5">
                <Activity className="w-3 h-3 opacity-50" />{stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="col-span-2 rounded-3xl border-border/50 shadow-sm overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4 text-primary" />
              Resource Allocation Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-[280px] text-muted-foreground">
            <div className="text-center space-y-4 max-w-[280px]">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-muted/30 flex items-center justify-center animate-pulse">
                <Package className="w-10 h-10 opacity-20" />
              </div>
              <div className="space-y-1">
                <p className="font-black text-foreground text-sm">Data Models Processing</p>
                <p className="text-xs leading-relaxed opacity-60">Visualizing real-time fleet usage and manpower distribution. Charts will appear as data accumulates.</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="rounded-3xl border-border/50 shadow-sm bg-gradient-to-tr from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[280px] overflow-y-auto pr-2 custom-scrollbar">
            <div className="space-y-3">
              {[
                { title: "Vehicle Maint Due", desc: "Reg # BC-394 due in 240km", time: "2h ago", color: "bg-amber-500" },
                { title: "Expense Pending", desc: "PKR 45,000 awaiting approval", time: "4h ago", color: "bg-primary" },
                { title: "Manpower Update", desc: "3 new employees registered", time: "1d ago", color: "bg-emerald-500" },
              ].map((alert, i) => (
                <div key={i} className="group p-3 rounded-2xl bg-white dark:bg-black/40 border border-border/40 hover:border-border transition-all cursor-default">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${alert.color}`} />
                      <span className="text-xs font-bold">{alert.title}</span>
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground">{alert.time}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">{alert.desc}</p>
                </div>
              ))}
              <div className="text-center py-4">
                 <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">View All Notifications</button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
