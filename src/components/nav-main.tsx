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
  items?: NavItem[]
}

function NavSub({ items, parentBreadcrumb }: { items: NavItem[]; parentBreadcrumb: string[] }) {
  const { active, setActive, setBreadcrumb } = useNav()

  const navigate = (sectionId: Section, breadcrumb: string[]) => {
    setActive(sectionId)
    setBreadcrumb(breadcrumb)
  }

  return (
    <SidebarMenuSub>
      {items.map((sub) => (
        <SidebarMenuSubItem key={sub.title}>
          {sub.items && sub.items.length > 0 ? (
            <Collapsible className="group/sub-collapsible">
              <CollapsibleTrigger asChild>
                <SidebarMenuSubButton className="cursor-pointer">
                  <span>{sub.title}</span>
                  <ChevronRight className="ml-auto size-3 transition-transform duration-200 group-data-[state=open]/sub-collapsible:rotate-90" />
                </SidebarMenuSubButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <NavSub items={sub.items} parentBreadcrumb={[...parentBreadcrumb, sub.title]} />
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <SidebarMenuSubButton
              isActive={active === sub.sectionId}
              onClick={() => sub.sectionId && navigate(sub.sectionId, [...parentBreadcrumb, sub.title])}
              className="cursor-pointer"
            >
              <span>{sub.title}</span>
            </SidebarMenuSubButton>
          )}
        </SidebarMenuSubItem>
      ))}
    </SidebarMenuSub>
  )
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
                  <NavSub items={item.items} parentBreadcrumb={[item.title]} />
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
