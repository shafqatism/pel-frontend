import { lazy } from "react"
import { useNav } from "@/lib/nav-context"
import { Skeleton } from "@/components/ui/skeleton"
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
const DashboardView     = lazy(() => import("@/components/views/dashboard-view"))
const ProjectsView      = lazy(() => import("@/components/views/projects-view"))
const VehiclesView      = lazy(() => import("@/components/views/fleet/vehicles-view"))
const TripsView         = lazy(() => import("@/components/views/fleet/trips-view"))
const FuelView          = lazy(() => import("@/components/views/fleet/fuel-view"))
const MaintenanceView   = lazy(() => import("@/components/views/fleet/maintenance-view"))
const AssignmentsView   = lazy(() => import("@/components/views/fleet/assignments-view"))
const FleetSummaryView  = lazy(() => import("@/components/views/fleet/fleet-summary-view"))

// HR Module
const EmployeesView     = lazy(() => import("@/components/views/hr/employees-view"))
const AttendanceView    = lazy(() => import("@/components/views/hr/attendance-view"))
const AttendanceHistoryView = lazy(() => import("@/components/views/hr/attendance-history-view"))
const AttendanceEmployeeDetailView = lazy(() => import("@/components/views/hr/attendance-employee-detail-view"))
const EmployeeReportView = lazy(() => import("@/components/views/hr/employee-report-view"))
const CompanyReportView = lazy(() => import("@/components/views/company-report-view"))
const SiteReportView    = lazy(() => import("@/components/views/site-report-view"))
const ProjectReportView = lazy(() => import("@/components/views/project-report-view"))

// Finance Module
const ExpensesView      = lazy(() => import("@/components/views/finance/expenses-view"))

// Food Module
const FoodView          = lazy(() => import("@/components/views/food-view"))

// Sites Module
const SitesView         = lazy(() => import("@/components/views/sites-view"))

// Land Rental Module
const LandRentalView    = lazy(() => import("@/components/views/land-rental-view"))

// Documents Module
const DocumentsView     = lazy(() => import("@/components/views/documents-view"))

// HSE Module
const HseView           = lazy(() => import("@/components/views/hse-view"))

// Companies & Settings
const CompaniesView     = lazy(() => import("@/components/views/companies-view"))
const SettingsView      = lazy(() => import("@/components/views/settings-view"))
const BusinessSettingsView = lazy(() => import("@/components/views/settings/business-settings-view"))
const ConfigurationView    = lazy(() => import("@/components/views/settings/configuration-view"))
const RolesPermissionsView = lazy(() => import("@/components/views/settings/roles-permissions-view"))
const UsersManagementView  = lazy(() => import("@/components/views/settings/users-management-view"))

function SectionView({ section }: { section: string }) {
  switch (section) {
    case "dashboard":         return <DashboardView />
    case "projects":          return <ProjectsView />
    // Fleet
    case "fleet-vehicles":    return <VehiclesView />
    case "fleet-trips":       return <TripsView />
    case "fleet-fuel":        return <FuelView />
    case "fleet-maintenance": return <MaintenanceView />
    case "fleet-assignments": return <AssignmentsView />
    case "fleet-summary":     return <FleetSummaryView />
    // HR
    case "hr-employees":      return <EmployeesView />
    case "hr-attendance":     return <AttendanceView />
    case "hr-attendance-history": return <AttendanceHistoryView />
    case "hr-employee-detail":    return <AttendanceEmployeeDetailView />
    case "hr-employee-report":    return <EmployeeReportView />
    // Finance
    case "finance-expenses":  return <ExpensesView />
    // Other modules
    case "sites":             return <SitesView />
    case "land-rental":       return <LandRentalView />
    case "food":              return <FoodView />
    case "documents":         return <DocumentsView />
    case "hse":               return <HseView />
    case "companies":         return <CompaniesView />
    case "companies-report":  return <CompanyReportView />
    case "sites-report":      return <SiteReportView />
    case "projects-report":   return <ProjectReportView />
    case "settings":          return <SettingsView />
    case "settings-business": return <BusinessSettingsView />
    case "settings-config":   return <ConfigurationView />
    case "settings-roles":    return <RolesPermissionsView />
    case "settings-users":    return <UsersManagementView />
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
