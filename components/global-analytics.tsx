"use client"

import { useQuery } from "@tanstack/react-query"
import { fleetApi } from "@/lib/api/fleet"
import { hseApi } from "@/lib/api/hse"
import { hrApi } from "@/lib/api/hr"
import { financeApi } from "@/lib/api/finance"
import { sitesApi } from "@/lib/api/sites"
import { foodApi } from "@/lib/api/food"
import { landRentalApi } from "@/lib/api/land-rental"
import { documentsApi } from "@/lib/api/documents"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend,
} from "recharts"
import { 
  BarChart3, 
  TrendingUp, 
  PieChart as PieChartIcon, 
  Calendar,
  RefreshCw,
  AlertTriangle,
  Clock,
  MapPin,
  Fuel,
  Wrench,
  Users,
  ShieldAlert,
  ClipboardCheck,
  Flame,
  UserPlus,
  DollarSign,
  UtensilsCrossed,
  FileText,
  Landmark
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppSelector, useAppDispatch } from "@/lib/store"
import { closeGlobalAnalytics } from "@/lib/store/slices/ui-slice"

const COLORS = ["#0ea5e9", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899", "#64748b"]

export default function GlobalAnalyticsDrawer() {
  const dispatch = useAppDispatch()
  const { isOpen, module, type } = useAppSelector((state) => state.ui.globalAnalytics)
  
  const { data, isLoading, error } = useQuery({
    queryKey: ["global-analytics", module, type],
    queryFn: async () => {
      if (!module || !type) return null
      
      switch (module) {
        case 'fleet':
          if (type === 'vehicle') return fleetApi.vehicles.list({ limit: 100 })
          if (type === 'trip') return fleetApi.trips.list({ limit: 100 })
          if (type === 'fuel') return fleetApi.fuel.list({ limit: 100 })
          if (type === 'maintenance') return fleetApi.maintenance.list({ limit: 100 })
          if (type === 'assignment') return fleetApi.assignments.list({ limit: 100 })
          return null
        
        case 'hse':
          if (type === 'incidents') return hseApi.incidents.list({ limit: 100 })
          if (type === 'audits') return hseApi.audits.list({ limit: 100 })
          if (type === 'drills') return hseApi.drills.list({ limit: 100 })
          return null
        
        case 'hr':
          if (type === 'employees') return hrApi.employees.list({ limit: 100 })
          if (type === 'attendance') return hrApi.attendance.list({ limit: 100 })
          return null
        
        case 'finance':
          return financeApi.expenses.list({ limit: 100 })
        case 'sites':
          return sitesApi.sites.list({ limit: 100 })
        case 'food':
          return foodApi.records.list({ limit: 100 })
        case 'rental':
          return landRentalApi.rentals.list({ limit: 100 })
        case 'documents':
          return documentsApi.documents.list({ limit: 100 })
          
        default: return null
      }
    },
    enabled: isOpen && !!module && !!type,
  })

  if (!module || !type) return null

  const renderContent = () => {
    if (isLoading) return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground">
        <RefreshCw className="w-8 h-8 animate-spin mb-4 text-primary/40" />
        <p className="text-sm font-medium">Synthesizing business intelligence...</p>
      </div>
    )

    if (error) return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-rose-500">
        <AlertTriangle className="w-8 h-8 mb-4" />
        <p className="text-sm font-medium">Failed to process analytics</p>
      </div>
    )

    const rawData = data?.data || []

    if (module === 'fleet') {
      switch (type) {
        case 'vehicle': return <VehicleAnalytics data={rawData} />
        case 'trip': return <TripAnalytics data={rawData} />
        case 'fuel': return <FuelAnalytics data={rawData} />
        case 'maintenance': return <MaintenanceAnalytics data={rawData} />
        case 'assignment': return <AssignmentAnalytics data={rawData} />
      }
    }

    if (module === 'hse') {
      switch (type) {
        case 'incidents': return <HseIncidentAnalytics data={rawData} />
        case 'audits': return <HseAuditAnalytics data={rawData} />
        case 'drills': return <HseDrillAnalytics data={rawData} />
      }
    }

    if (module === 'hr') {
      switch (type) {
        case 'employees': return <HrEmployeeAnalytics data={rawData} />
        case 'attendance': return <HrAttendanceAnalytics data={rawData} />
      }
    }

    if (module === 'finance') {
      if (type === 'expenses') return <FinanceExpenseAnalytics data={rawData} />
    }

    if (module === 'sites') return <SitesAnalytics data={rawData} />
    if (module === 'food') return <FoodAnalytics data={rawData} />
    if (module === 'rental') return <RentalAnalytics data={rawData} />
    if (module === 'documents') return <DocumentsAnalytics data={rawData} />

    return null
  }

  const getIcon = () => {
    switch (module) {
      case 'hse': return <ShieldAlert className="w-4 h-4" />
      case 'hr': return <Users className="w-4 h-4" />
      case 'finance': return <DollarSign className="w-4 h-4" />
      case 'sites': return <MapPin className="w-4 h-4" />
      case 'food': return <UtensilsCrossed className="w-4 h-4" />
      case 'rental': return <Landmark className="w-4 h-4" />
      case 'documents': return <FileText className="w-4 h-4" />
      default: return <BarChart3 className="w-4 h-4" />
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={() => dispatch(closeGlobalAnalytics())}>
      <SheetContent side="right" className="w-full sm:max-w-2xl md:max-w-3xl overflow-y-auto p-0">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/40 px-6 py-5">
          <SheetHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                {getIcon()}
              </div>
              <SheetTitle className="text-base font-bold capitalize">{module} {type} Insights</SheetTitle>
            </div>
            <SheetDescription className="text-xs">Advanced data visualization for enterprise decision making.</SheetDescription>
          </SheetHeader>
        </div>

        <div className="p-6">
          {renderContent()}
        </div>
      </SheetContent>
    </Sheet>
  )
}

// --- FLEET ANALYTICS ---

function VehicleAnalytics({ data }: { data: any[] }) {
  const statusCounts = data.reduce((acc: any, v: any) => {
    acc[v.status] = (acc[v.status] || 0) + 1
    return acc
  }, {})
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name: name.replace('_', ' '), value }))

  const typeCounts = data.reduce((acc: any, v: any) => {
    acc[v.type] = (acc[v.type] || 0) + 1
    return acc
  }, {})
  const typeData = Object.entries(typeCounts).map(([name, value]) => ({ name: name.replace('_', ' '), value }))

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-2 gap-4">
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <PieChartIcon className="w-3.5 h-3.5" /> Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="h-48 pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                  {statusData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5" /> Type Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="h-48 pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} style={{ fontSize: '10px' }} />
                <Tooltip />
                <Bar dataKey="value" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Odometer Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-64 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.slice(-15).map(v => ({ name: v.registrationNumber, value: Number(v.currentOdometerKm) }))}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" style={{ fontSize: '10px' }} />
              <YAxis style={{ fontSize: '10px' }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

function TripAnalytics({ data }: { data: any[] }) {
  const siteCounts = data.reduce((acc: any, t: any) => {
    acc[t.destinationSite] = (acc[t.destinationSite] || 0) + 1
    return acc
  }, {})
  const siteData = Object.entries(siteCounts).map(([name, value]) => ({ name, value }))

  const trendData = data.slice().reverse().map(t => ({
    date: new Date(t.tripDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    km: Number(t.totalKm || 0)
  }))

  return (
    <div className="grid gap-6">
      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Trips Distance Trend (Last 20)</CardTitle>
        </CardHeader>
        <CardContent className="h-64 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="date" style={{ fontSize: '10px' }} />
              <YAxis style={{ fontSize: '10px' }} />
              <Tooltip />
              <Area type="monotone" dataKey="km" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Destinations Popularity</CardTitle>
        </CardHeader>
        <CardContent className="h-48 pt-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={siteData} innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                {siteData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

function FuelAnalytics({ data }: { data: any[] }) {
  const costData = data.slice().reverse().map(f => ({
    date: new Date(f.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    cost: Number(f.totalCost)
  }))

  return (
    <div className="grid gap-6">
      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Fuel Cost Cycle (PKR)</CardTitle>
        </CardHeader>
        <CardContent className="h-64 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={costData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="date" style={{ fontSize: '10px' }} />
              <YAxis style={{ fontSize: '10px' }} />
              <Tooltip />
              <Bar dataKey="cost" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

function MaintenanceAnalytics({ data }: { data: any[] }) {
  const typeCounts = data.reduce((acc: any, m: any) => {
    acc[m.maintenanceType] = (acc[m.maintenanceType] || 0) + Number(m.cost || 0)
    return acc
  }, {})
  const typeData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }))

  return (
    <div className="grid gap-6">
      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Maintenance Spend by Type</CardTitle>
        </CardHeader>
        <CardContent className="h-64 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={typeData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {typeData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

function AssignmentAnalytics({ data }: { data: any[] }) {
  const siteAssignments = data.reduce((acc: any, a: any) => {
    acc[a.siteName] = (acc[a.siteName] || 0) + 1
    return acc
  }, {})
  const siteData = Object.entries(siteAssignments).map(([name, value]) => ({ name, value }))

  return (
    <div className="grid gap-6">
      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Personell Deployment by Site</CardTitle>
        </CardHeader>
        <CardContent className="h-64 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={siteData}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" style={{ fontSize: '10px' }} />
              <YAxis style={{ fontSize: '10px' }} />
              <Tooltip />
              <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

// --- HSE ANALYTICS ---

function HseIncidentAnalytics({ data }: { data: any[] }) {
  const severityCounts = data.reduce((acc: any, i: any) => {
    acc[i.severity] = (acc[i.severity] || 0) + 1
    return acc
  }, {})
  const severityData = Object.entries(severityCounts).map(([name, value]) => ({ name, value }))

  const statusCounts = data.reduce((acc: any, i: any) => {
    acc[i.status] = (acc[i.status] || 0) + 1
    return acc
  }, {})
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }))

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-2 gap-4">
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-rose-600">Severity Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-48 pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={severityData} innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                  {severityData.map((d, index) => <Cell key={index} fill={d.name === 'critical' ? '#ef4444' : d.name === 'high' ? '#f59e0b' : '#3b82f6'} />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-blue-600">Incident Status</CardTitle>
          </CardHeader>
          <CardContent className="h-48 pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" style={{ fontSize: '10px' }} />
                <YAxis style={{ fontSize: '10px' }} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function HseAuditAnalytics({ data }: { data: any[] }) {
  const scoreData = data.slice().reverse().map(a => ({
    date: new Date(a.auditDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    score: Number(a.score)
  }))

  return (
    <div className="grid gap-6">
      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-black uppercase tracking-widest text-emerald-600">Compliance Score Trend (%)</CardTitle>
        </CardHeader>
        <CardContent className="h-64 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={scoreData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="date" style={{ fontSize: '10px' }} />
              <YAxis domain={[0, 100]} style={{ fontSize: '10px' }} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} dot={{ strokeWidth: 2, r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

function HseDrillAnalytics({ data }: { data: any[] }) {
  const participantsData = data.slice().reverse().map(d => ({
    date: new Date(d.drillDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    count: Number(d.participantsCount)
  }))

  return (
    <div className="grid gap-6">
      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-black uppercase tracking-widest text-orange-600">Personnel Readiness (Participants)</CardTitle>
        </CardHeader>
        <CardContent className="h-64 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={participantsData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="date" style={{ fontSize: '10px' }} />
              <YAxis style={{ fontSize: '10px' }} />
              <Tooltip />
              <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

// --- HR ANALYTICS ---

function HrEmployeeAnalytics({ data }: { data: any[] }) {
  const deptCounts = data.reduce((acc: any, e: any) => {
    acc[e.department] = (acc[e.department] || 0) + 1
    return acc
  }, {})
  const deptData = Object.entries(deptCounts).map(([name, value]) => ({ name, value }))

  return (
    <div className="grid gap-6">
      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-black uppercase tracking-widest text-primary">Departmental Force Strength</CardTitle>
        </CardHeader>
        <CardContent className="h-64 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={deptData} innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" label>
                {deptData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

function HrAttendanceAnalytics({ data }: { data: any[] }) {
  const statusCounts = data.reduce((acc: any, a: any) => {
    acc[a.status] = (acc[a.status] || 0) + 1
    return acc
  }, {})
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }))

  return (
    <div className="grid gap-6">
      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-black uppercase tracking-widest text-emerald-600">Daily Attendance Snapshot</CardTitle>
        </CardHeader>
        <CardContent className="h-48 pt-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={statusData} innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                {statusData.map((d, index) => <Cell key={index} fill={d.name === 'present' ? '#10b981' : '#f43f5e'} />)}
              </Pie>
              <Tooltip />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

// --- FINANCE ANALYTICS ---

function FinanceExpenseAnalytics({ data }: { data: any[] }) {
  const categoryCounts = data.reduce((acc: any, e: any) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount)
    return acc
  }, {})
  const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }))

  const trendData = data.slice(-15).reverse().map(e => ({
    date: new Date(e.dateIncurred).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    amount: Number(e.amount)
  }))

  return (
    <div className="grid gap-6">
      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader className="pb-2 font-black text-amber-600">
          <CardTitle className="text-xs uppercase tracking-widest">Expense Category Volumetrics (PKR)</CardTitle>
        </CardHeader>
        <CardContent className="h-64 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={categoryData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {categoryData.map((_, index) => <Cell key={index} fill={COLORS[(index + 4) % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader className="pb-2 font-black text-primary">
          <CardTitle className="text-xs uppercase tracking-widest">Transaction Timeline (Last 15)</CardTitle>
        </CardHeader>
        <CardContent className="h-48 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" style={{ fontSize: '10px' }} />
              <YAxis style={{ fontSize: '10px' }} />
              <Tooltip />
              <Line type="stepAfter" dataKey="amount" stroke="#0ea5e9" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

// --- MODULE ANALYTICS (Sites, Food, Rental, Docs) ---

function SitesAnalytics({ data }: { data: any[] }) {
  const statusCounts = data.reduce((acc: any, s: any) => {
    acc[s.status] = (acc[s.status] || 0) + 1
    return acc
  }, {})
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }))

  return (
    <div className="grid gap-6">
      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-black uppercase tracking-widest text-primary">Site Operational Status</CardTitle>
        </CardHeader>
        <CardContent className="h-64 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={statusData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {statusData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

function FoodAnalytics({ data }: { data: any[] }) {
  const trendData = data.slice(-15).reverse().map(f => ({
    date: new Date(f.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    count: Number(f.headCount)
  }))

  return (
    <div className="grid gap-6">
      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-black uppercase tracking-widest text-orange-600">Daily Meals Served Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-64 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" style={{ fontSize: '10px' }} />
              <YAxis style={{ fontSize: '10px' }} />
              <Tooltip />
              <Area type="monotone" dataKey="count" fill="#f97316" stroke="#f97316" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

function RentalAnalytics({ data }: { data: any[] }) {
  const amountData = data.slice(-10).map(r => ({
    name: r.landOwnerName.split(' ')[0],
    amount: Number(r.monthlyRent)
  }))

  return (
    <div className="grid gap-6">
      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-black uppercase tracking-widest text-indigo-600">Monthly Lease Liabilities (PKR)</CardTitle>
        </CardHeader>
        <CardContent className="h-64 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={amountData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" style={{ fontSize: '10px' }} />
              <YAxis style={{ fontSize: '10px' }} />
              <Tooltip />
              <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

function DocumentsAnalytics({ data }: { data: any[] }) {
  const typeCounts = data.reduce((acc: any, d: any) => {
    acc[d.category] = (acc[d.category] || 0) + 1
    return acc
  }, {})
  const typeData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }))

  return (
    <div className="grid gap-6">
      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-600">Repository Composition by Type</CardTitle>
        </CardHeader>
        <CardContent className="h-64 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={typeData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {typeData.map((_, index) => <Cell key={index} fill={COLORS[(index + 1) % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
