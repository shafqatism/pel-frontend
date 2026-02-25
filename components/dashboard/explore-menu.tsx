"use client"

import * as React from "react"
import { 
  LayoutGrid, 
  Truck, 
  Users, 
  DollarSign, 
  MapPin, 
  UtensilsCrossed, 
  FileText, 
  ShieldAlert,
  ChevronDown,
  LayoutDashboard
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { useNav, Section } from "@/lib/nav-context"
import { Button } from "@/components/ui/button"

const modules = [
  { title: "Dashboard", sectionId: "dashboard" as Section, icon: LayoutDashboard, color: "text-blue-600", bg: "bg-blue-50" },
  { title: "Fleet Management", sectionId: "fleet-vehicles" as Section, icon: Truck, color: "text-amber-600", bg: "bg-amber-50" },
  { title: "Human Resources", sectionId: "hr-employees" as Section, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
  { title: "Financial Ledger", sectionId: "finance-expenses" as Section, icon: DollarSign, color: "text-rose-600", bg: "bg-rose-50" },
  { title: "Project Sites", sectionId: "sites" as Section, icon: MapPin, color: "text-indigo-600", bg: "bg-indigo-50" },
  { title: "Safety & HSE", sectionId: "hse" as Section, icon: ShieldAlert, color: "text-red-600", bg: "bg-red-50" },
  { title: "Food & Mess", sectionId: "food" as Section, icon: UtensilsCrossed, color: "text-orange-600", bg: "bg-orange-50" },
  { title: "Digital Archive", sectionId: "documents" as Section, icon: FileText, color: "text-slate-600", bg: "bg-slate-50" },
]

export default function ExploreMenu() {
  const { setActive, setBreadcrumb } = useNav()

  const onNavigate = (section: Section, title: string) => {
    setActive(section)
    setBreadcrumb([title])
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 px-3 gap-2 font-bold hover:bg-primary/5 hover:text-primary transition-all rounded-xl">
          <LayoutGrid className="w-4 h-4" />
          <span className="hidden md:inline">Explore Modules</span>
          <ChevronDown className="w-3.5 h-3.5 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[320px] p-2 rounded-[1.5rem] shadow-2xl border-border/50 backdrop-blur-xl bg-white/95 dark:bg-black/95">
        <DropdownMenuLabel className="px-3 pt-2 pb-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
           Corporate Ecosystem
        </DropdownMenuLabel>
        <div className="grid grid-cols-2 gap-1 p-1">
          {modules.map((m) => (
            <DropdownMenuItem 
              key={m.sectionId}
              onClick={() => onNavigate(m.sectionId, m.title)}
              className="flex flex-col items-center justify-center p-4 rounded-2xl cursor-pointer hover:bg-primary/5 group transition-all"
            >
              <div className={`p-3 rounded-xl ${m.bg} ${m.color} mb-2 group-hover:scale-110 transition-transform shadow-sm`}>
                 <m.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-tighter text-center leading-none">
                {m.title.split(' ')[0]}
              </span>
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuSeparator className="my-2" />
        <DropdownMenuItem 
          onClick={() => onNavigate("settings", "Settings")}
          className="rounded-xl flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground group"
        >
          System Configuration Registry
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
