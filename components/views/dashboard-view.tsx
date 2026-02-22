import { LayoutDashboard, Truck, Users, DollarSign, MapPin, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const stats = [
  { label: "Active Vehicles", value: "24", icon: Truck, change: "+2 this week", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30" },
  { label: "Employees", value: "187", icon: Users, change: "+4 this month", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
  { label: "Active Sites", value: "6", icon: MapPin, change: "Operational", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
  { label: "Monthly Expenses", value: "PKR 2.4M", icon: DollarSign, change: "-3% vs last month", color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-950/30" },
]

export default function DashboardView() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Command Center</h1>
        <p className="text-sm text-muted-foreground mt-1">PEL Enterprise Resource Planning — Overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {stat.label}
              </CardTitle>
              <div className={`p-2 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Activity className="w-3 h-3" />{stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="col-span-2 rounded-2xl border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4 text-primary" />
              Fleet Activity Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[220px] text-muted-foreground text-sm">
            <div className="text-center space-y-2">
              <Truck className="w-10 h-10 mx-auto text-muted-foreground/30" />
              <p className="font-medium">Fleet charts coming soon</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[220px] text-muted-foreground text-sm">
            <div className="text-center space-y-2">
              <Activity className="w-10 h-10 mx-auto text-muted-foreground/30" />
              <p className="font-medium">Activity feed coming soon</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
