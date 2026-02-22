"use client"

import dynamic from "next/dynamic"
import { useNav } from "@/lib/nav-context"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Truck, Users, DollarSign, MapPin,
  UtensilsCrossed, FileText, Settings2,
  Wrench, ClipboardList, Calendar,
} from "lucide-react"
import { PlaceholderView } from "@/components/views/placeholder-view"
import { memo, Suspense } from "react"

function SectionSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48 rounded-lg" />
        <Skeleton className="h-4 w-72 rounded-md" />
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  )
}

// ─── Lazy-loaded views ─────────────────────────────────────────────────────────
const DashboardView  = dynamic(() => import("@/components/views/dashboard-view"),          { loading: () => <SectionSkeleton />, ssr: false })
const VehiclesView   = dynamic(() => import("@/components/views/fleet/vehicles-view"),     { loading: () => <SectionSkeleton />, ssr: false })
const TripsView      = dynamic(() => import("@/components/views/fleet/trips-view"),        { loading: () => <SectionSkeleton />, ssr: false })
const FuelView       = dynamic(() => import("@/components/views/fleet/fuel-view"),         { loading: () => <SectionSkeleton />, ssr: false })
const MaintenanceView = dynamic(() => import("@/components/views/fleet/maintenance-view"), { loading: () => <SectionSkeleton />, ssr: false })
const AssignmentsView = dynamic(() => import("@/components/views/fleet/assignments-view"), { loading: () => <SectionSkeleton />, ssr: false })

// HR Module
const EmployeesView  = dynamic(() => import("@/components/views/hr/employees-view"),       { loading: () => <SectionSkeleton />, ssr: false })
const AttendanceView = dynamic(() => import("@/components/views/hr/attendance-view"),      { loading: () => <SectionSkeleton />, ssr: false })

// Finance Module
const ExpensesView   = dynamic(() => import("@/components/views/finance/expenses-view"),    { loading: () => <SectionSkeleton />, ssr: false })

// Food Module
const FoodView      = dynamic(() => import("@/components/views/food-view"),              { loading: () => <SectionSkeleton />, ssr: false })

// Sites Module
const SitesView      = dynamic(() => import("@/components/views/sites-view"),             { loading: () => <SectionSkeleton />, ssr: false })

// Land Rental Module
const LandRentalView  = dynamic(() => import("@/components/views/land-rental-view"),       { loading: () => <SectionSkeleton />, ssr: false })

// Documents Module
const DocumentsView   = dynamic(() => import("@/components/views/documents-view"),          { loading: () => <SectionSkeleton />, ssr: false })

function SectionView({ section }: { section: string }) {
  switch (section) {
    case "dashboard":         return <DashboardView />
    // Fleet
    case "fleet-vehicles":    return <VehiclesView />
    case "fleet-trips":       return <TripsView />
    case "fleet-fuel":        return <FuelView />
    case "fleet-maintenance": return <MaintenanceView />
    case "fleet-assignments": return <AssignmentsView />
    // HR
    case "hr-employees":      return <EmployeesView />
    case "hr-attendance":     return <AttendanceView />
    // Finance
    case "finance-expenses":  return <ExpensesView />
    // Other modules (Placeholders)
    case "sites":             return <SitesView />
    case "land-rental":       return <LandRentalView />
    case "food":              return <FoodView />
    case "documents":         return <DocumentsView />
    case "settings":          return <PlaceholderView title="Configuration" description="System preferences and administrative settings" icon={Settings2} />
    default:                  return <DashboardView />
  }
}

const MemoizedSectionView = memo(SectionView)

export function DashboardShell() {
  const { active } = useNav()
  return (
    <Suspense fallback={<SectionSkeleton />}>
      <MemoizedSectionView section={active} />
    </Suspense>
  )
}
