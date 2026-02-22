"use client"

import dynamic from "next/dynamic"
import { useNav } from "@/lib/nav-context"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Truck, Users, DollarSign, MapPin,
  UtensilsCrossed, FileText, Settings2,
  Fuel, Wrench, Navigation, ClipboardList, Calendar
} from "lucide-react"
import { PlaceholderView } from "@/components/views/placeholder-view"
import { memo, Suspense } from "react"

// Lazy-load the heavy dashboard view
const DashboardView = dynamic(() => import("@/components/views/dashboard-view"), {
  loading: () => <SectionSkeleton />,
  ssr: false,
})

function SectionSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48 rounded-lg" />
        <Skeleton className="h-4 w-72 rounded-md" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array(4).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Skeleton className="col-span-2 h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  )
}

// Map each section to its view
function SectionView({ section }: { section: string }) {
  switch (section) {
    case "dashboard":
      return <DashboardView />

    // Fleet
    case "fleet-vehicles":
      return <PlaceholderView title="Vehicles" description="Fleet vehicle registry and management" icon={Truck} />
    case "fleet-trips":
      return <PlaceholderView title="Trip Logs" description="Track vehicle movements and operational records" icon={Navigation} />
    case "fleet-fuel":
      return <PlaceholderView title="Fuel Management" description="Monitor fuel consumption across the fleet" icon={Fuel} />
    case "fleet-maintenance":
      return <PlaceholderView title="Maintenance" description="Service, repair, and inspection records" icon={Wrench} />
    case "fleet-assignments":
      return <PlaceholderView title="Assignments" description="Vehicle-to-employee assignment tracking" icon={ClipboardList} />

    // HR
    case "hr-employees":
      return <PlaceholderView title="Employees" description="Employee directory and profile management" icon={Users} />
    case "hr-attendance":
      return <PlaceholderView title="Attendance" description="Daily attendance logs and reports" icon={Calendar} />

    // Finance
    case "finance-expenses":
      return <PlaceholderView title="Expenses" description="Expense tracking and financial reporting" icon={DollarSign} />

    // Other
    case "sites":
      return <PlaceholderView title="Project Sites" description="Field operations and site management" icon={MapPin} />
    case "food":
      return <PlaceholderView title="Food & Mess" description="Catering and mess management records" icon={UtensilsCrossed} />
    case "documents":
      return <PlaceholderView title="Documents" description="Document storage and management" icon={FileText} />
    case "settings":
      return <PlaceholderView title="Settings" description="System configuration and preferences" icon={Settings2} />

    default:
      return <DashboardView />
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
