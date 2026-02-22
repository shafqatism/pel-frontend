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

const navItems = [
  {
    title: "Dashboard",
    sectionId: "dashboard" as const,
    icon: LayoutDashboard,
    items: [],
  },
  {
    title: "Fleet",
    icon: Truck,
    items: [
      { title: "Vehicles", sectionId: "fleet-vehicles" as const },
      { title: "Trips", sectionId: "fleet-trips" as const },
      { title: "Fuel", sectionId: "fleet-fuel" as const },
      { title: "Maintenance", sectionId: "fleet-maintenance" as const },
      { title: "Assignments", sectionId: "fleet-assignments" as const },
    ],
  },
  {
    title: "Human Resources",
    icon: Users,
    items: [
      { title: "Employees", sectionId: "hr-employees" as const },
      { title: "Attendance", sectionId: "hr-attendance" as const },
    ],
  },
  {
    title: "Finance",
    icon: DollarSign,
    items: [
      { title: "Expenses", sectionId: "finance-expenses" as const },
    ],
  },
  {
    title: "Project Sites",
    sectionId: "sites" as const,
    icon: MapPin,
    items: [],
  },
  {
    title: "Food & Mess",
    sectionId: "food" as const,
    icon: UtensilsCrossed,
    items: [],
  },
  {
    title: "Documents",
    sectionId: "documents" as const,
    icon: FileText,
    items: [],
  },
  {
    title: "Settings",
    sectionId: "settings" as const,
    icon: Settings2,
    items: [],
  },
]

const user = {
  name: "PEL Admin",
  email: "admin@pelexploration.com",
  avatar: "",
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { setActive, setBreadcrumb } = useNav()

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
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-xs shrink-0">
                PEL
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-bold text-sm">PEL ERP</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Exploration Portal</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
