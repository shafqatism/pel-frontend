import { AppSidebar } from "@/components/app-sidebar"
import { DashboardShell } from "@/components/dashboard-shell"
import { NavProvider, useNav } from "@/lib/nav-context"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth-context"
import { useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

import FleetDrawer from "@/components/fleet/fleet-drawer"
import GlobalAnalyticsDrawer from "@/components/global-analytics"
import GlobalHelpDrawer from "@/components/global-help"
import CommandMenu from "@/components/dashboard/command-menu"
import ExploreMenu from "@/components/dashboard/explore-menu"

function BreadcrumbNav() {
  const { breadcrumb } = useNav()
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumb.map((crumb, i) => (
          <span key={crumb} className="flex items-center gap-1.5">
            {i > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              <BreadcrumbPage
                className={i < breadcrumb.length - 1 ? "text-muted-foreground font-normal" : "font-semibold"}
              >
                {crumb}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </span>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export function DashboardPage() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !user) {
      navigate({ to: "/login" })
    }
  }, [user, isLoading, navigate])

  if (isLoading || !user) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <NavProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {/* Sticky Header */}
          <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-10 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4 w-full">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
              <BreadcrumbNav />
              <div className="ml-auto flex items-center gap-2">
                <CommandMenu />
                <Separator orientation="vertical" className="h-4" />
                <ExploreMenu />
              </div>
            </div>
          </header>

          {/* Single page content area */}
          <main className="flex flex-1 flex-col p-6 min-h-[calc(100vh-3.5rem)]">
            <DashboardShell />
            <FleetDrawer />
            <GlobalAnalyticsDrawer />
            <GlobalHelpDrawer />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </NavProvider>
  )
}
