"use client"

import { useNav } from "@/lib/nav-context"
import { ChevronRight, type LucideIcon } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import type { Section } from "@/lib/nav-context"

interface NavItem {
  title: string
  sectionId?: Section
  icon?: LucideIcon
  isActive?: boolean
  items?: { title: string; sectionId: Section }[]
}

export function NavMain({ items }: { items: NavItem[] }) {
  const { active, setActive, setBreadcrumb } = useNav()

  const navigate = (sectionId: Section, breadcrumb: string[]) => {
    setActive(sectionId)
    setBreadcrumb(breadcrumb)
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 px-2 mb-1">
        ERP Modules
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) =>
          item.items && item.items.length > 0 ? (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon className="size-4" />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto size-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((sub) => (
                      <SidebarMenuSubItem key={sub.title}>
                        <SidebarMenuSubButton
                          isActive={active === sub.sectionId}
                          onClick={() => navigate(sub.sectionId, [item.title, sub.title])}
                          className="cursor-pointer"
                        >
                          <span>{sub.title}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                isActive={active === item.sectionId}
                onClick={() =>
                  item.sectionId && navigate(item.sectionId, [item.title])
                }
                className="cursor-pointer"
              >
                {item.icon && <item.icon className="size-4" />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
