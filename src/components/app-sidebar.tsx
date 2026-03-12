"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Truck,
  Users,
  DollarSign,
  MapPin,
  UtensilsCrossed,
  FileText,
  Settings2,
  Landmark,
  ShieldAlert,
  Building2,
  FolderKanban,
} from "lucide-react"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useNav } from "@/lib/nav-context"
import { useAuth } from "@/lib/auth-context"
import { usePublicSettings } from "@/features/settings/hooks/use-settings"

const navItems = [
  {
    title: "Dashboard",
    sectionId: "dashboard" as const,
    icon: LayoutDashboard,
    items: [],
  },
  {
    title: "Human Resources",
    icon: Users,
    module: "hr",
    items: [
      { title: "Employees", sectionId: "hr-employees" as const, module: "hr" },
      { title: "Attendance", sectionId: "hr-attendance" as const, module: "hr" },
      { title: "History / Reports", sectionId: "hr-attendance-history" as const, module: "hr" },
    ],
  },
  {
    title: "Fleet Management",
    icon: Truck,
    module: "fleet",
    items: [
      { title: "Vehicles", sectionId: "fleet-vehicles" as const, module: "fleet" },
      { title: "Trips", sectionId: "fleet-trips" as const, module: "fleet" },
      { title: "Fuel", sectionId: "fleet-fuel" as const, module: "fleet" },
      { title: "Maintenance", sectionId: "fleet-maintenance" as const, module: "fleet" },
      { title: "Assignments", sectionId: "fleet-assignments" as const, module: "fleet" },
      { title: "Fleet Summary", sectionId: "fleet-summary" as const, module: "fleet" },
    ],
  },
  {
    title: "Projects Management",
    icon: FolderKanban,
    items: [
      { title: "Companies", sectionId: "companies" as const, module: "companies" },
      { title: "Project / Block", sectionId: "projects" as const, module: "projects" },
      { title: "Project Sites", sectionId: "sites" as const, module: "sites" },
      { title: "Land Rental", sectionId: "land-rental" as const, module: "land-rental" },
    ],
  },
  {
    title: "Food & Mess",
    sectionId: "food" as const,
    module: "food",
    icon: UtensilsCrossed,
    items: [],
  },
  {
    title: "Accounts and Finance",
    icon: DollarSign,
    module: "finance",
    items: [
      { title: "Expenses", sectionId: "finance-expenses" as const, module: "finance" },
    ],
  },
  {
    title: "Documents",
    sectionId: "documents" as const,
    module: "documents",
    icon: FileText,
    items: [],
  },
  {
    title: "HSE & Safety",
    sectionId: "hse" as const,
    module: "hse",
    icon: ShieldAlert,
    items: [],
  },
  {
    title: "Settings",
    icon: Settings2,
    module: "settings",
    items: [
      { title: "Business Settings", sectionId: "settings-business" as const, module: "settings" },
      { title: "User Accounts", sectionId: "settings-users" as const, module: "roles" },
      { title: "Role and Permission", sectionId: "settings-roles" as const, module: "roles" },
      { title: "Configuration", sectionId: "settings-config" as const, module: "settings" },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { setActive, setBreadcrumb } = useNav()
  const { user } = useAuth()
  const { data: settings } = usePublicSettings()

  const filteredNavItems = React.useMemo(() => {
    if (!user) return []
    
    const hasPermission = (moduleName?: string) => {
      if (!moduleName) return true
      if (user.role === "admin") return true
      return user.permissions?.some((p) => p.module === moduleName && p.action === "read")
    }

    const filterItemsRecursive = (items: any[]): any[] => {
      return items.reduce((acc, item) => {
        const hasChildren = item.items && item.items.length > 0;
        const filteredSubItems = hasChildren ? filterItemsRecursive(item.items) : [];
        
        // A node is visible if:
        // 1. It is a leaf node and has permission
        // 2. OR it has children and at least one child is visible
        const isVisible = hasChildren 
          ? filteredSubItems.length > 0 
          : hasPermission(item.module);

        if (isVisible) {
          acc.push({
            ...item,
            items: filteredSubItems
          });
        }
        return acc;
      }, [] as any[]);
    }

    return filterItemsRecursive(navItems);
  }, [user])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              onClick={() => { setActive("dashboard"); setBreadcrumb(["Dashboard"]) }}
              className="cursor-pointer"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-xs shrink-0 overflow-hidden p-0.5">
                {settings?.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  "PEL"
                )}
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-bold text-sm truncate max-w-[140px]">{settings?.companyName || "PEL ERP"}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest truncate max-w-[140px]">Exploration Portal</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
