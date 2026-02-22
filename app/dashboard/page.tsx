"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { DashboardShell } from "@/components/dashboard-shell"
import { NavProvider, useNav } from "@/lib/nav-context"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

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

export default function DashboardPage() {
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
            </div>
          </header>

          {/* Single page content area */}
          <main className="flex flex-1 flex-col p-6 min-h-[calc(100vh-3.5rem)]">
            <DashboardShell />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </NavProvider>
  )
}
