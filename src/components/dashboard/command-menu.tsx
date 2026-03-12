"use client"

import * as React from "react"
import { 
  Search, 
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
  Command,
  ArrowRight
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useNav, Section } from "@/lib/nav-context"
import { cn } from "@/lib/utils"

const searchItems = [
  { title: "Command Center", sectionId: "dashboard" as Section, icon: LayoutDashboard, category: "General", keywords: "home, main, overview" },
  { title: "Vehicle Registry", sectionId: "fleet-vehicles" as Section, icon: Truck, category: "Fleet", keywords: "cars, trucks, fleet" },
  { title: "Trip Logs", sectionId: "fleet-trips" as Section, icon: Truck, category: "Fleet", keywords: "movement, tracking, site trips" },
  { title: "Fuel Management", sectionId: "fleet-fuel" as Section, icon: Truck, category: "Fleet", keywords: "petrol, diesel, efficiency" },
  { title: "Maintenance Workshop", sectionId: "fleet-maintenance" as Section, icon: Truck, category: "Fleet", keywords: "repair, service, oil" },
  { title: "Driver Assignments", sectionId: "fleet-assignments" as Section, icon: Truck, category: "Fleet", keywords: "roster, tasks, personnel" },
  { title: "Employee Directory", sectionId: "hr-employees" as Section, icon: Users, category: "Human Resources", keywords: "manpower, workers, staff" },
  { title: "Daily Attendance", sectionId: "hr-attendance" as Section, icon: Users, category: "Human Resources", keywords: "check-in, roster, leave" },
  { title: "Expense Ledger", sectionId: "finance-expenses" as Section, icon: DollarSign, category: "Finance", keywords: "spending, billing, budget" },
  { title: "Project Sites", sectionId: "sites" as Section, icon: MapPin, category: "Operations", keywords: "drilling, rigs, locations" },
  { title: "Land Lease & Rental", sectionId: "land-rental" as Section, icon: Landmark, category: "Operations", keywords: "agreements, property, blocks" },
  { title: "Food & Mess Logs", sectionId: "food" as Section, icon: UtensilsCrossed, category: "Operations", keywords: "catering, meals, headcount" },
  { title: "Document Storage", sectionId: "documents" as Section, icon: FileText, category: "Infrastructure", keywords: "files, sops, certificates" },
  { title: "HSE Compliance", sectionId: "hse" as Section, icon: ShieldAlert, category: "Safety", keywords: "incidents, audits, hse" },
  { title: "System Settings", sectionId: "settings" as Section, icon: Settings2, category: "System", keywords: "config, profile, security" },
]

export default function CommandMenu() {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const { setActive, setBreadcrumb } = useNav()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const filteredItems = React.useMemo(() => {
    if (!query) return searchItems
    const lowerQuery = query.toLowerCase()
    return searchItems.filter(item => 
      item.title.toLowerCase().includes(lowerQuery) || 
      item.category.toLowerCase().includes(lowerQuery) ||
      item.keywords.toLowerCase().includes(lowerQuery)
    )
  }, [query])

  const onSelect = (item: typeof searchItems[0]) => {
    setActive(item.sectionId)
    setBreadcrumb([item.category, item.title])
    setOpen(false)
    setQuery("")
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group relative flex h-9 w-64 items-center gap-2 rounded-xl border border-border/40 bg-muted/30 px-3 text-sm text-muted-foreground transition-all hover:bg-muted/50 hover:border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <Search className="h-4 w-4 transition-colors group-hover:text-primary" />
        <span className="flex-1 text-left font-medium">Quick Explore...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-bold opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden border-border/50 shadow-2xl bg-white/95 dark:bg-black/95 backdrop-blur-xl rounded-[2rem]">
          <DialogHeader className="p-4 border-b border-border/40">
            <div className="flex items-center gap-3 px-1">
               <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Command className="w-4 h-4" />
               </div>
               <DialogTitle className="text-base font-black uppercase tracking-widest text-muted-foreground">Command Center Search</DialogTitle>
               <DialogDescription className="sr-only">Search and navigate through PEL ERP modules</DialogDescription>
            </div>
          </DialogHeader>
          
          <div className="p-4">
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  autoFocus
                  placeholder="Type to navigate (e.g. 'fleet', 'hse', 'fuel')..."
                  className="h-14 pl-12 pr-4 text-lg border-none bg-muted/30 rounded-2xl focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-primary/20 font-medium"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
             </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto px-2 pb-4 pt-0 custom-scrollbar">
            {filteredItems.length === 0 ? (
              <div className="py-12 text-center">
                 <div className="w-12 h-12 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-4 grayscale">
                   <Search className="w-6 h-6 text-muted-foreground/30" />
                 </div>
                 <p className="text-sm font-bold text-muted-foreground">No results matching "{query}"</p>
                 <p className="text-xs text-muted-foreground/60 mt-1">Try searching for modules or departments.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-1">
                {filteredItems.map((item) => (
                  <button
                    key={item.sectionId}
                    onClick={() => onSelect(item)}
                    className="flex items-center justify-between p-3 rounded-2xl hover:bg-primary/5 group transition-all text-left"
                  >
                    <div className="flex items-center gap-4">
                       <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-border/50 group-hover:border-primary/30 group-hover:scale-110 transition-all shadow-sm">
                          <item.icon className="w-5 h-5 group-hover:text-primary transition-colors" />
                       </div>
                       <div>
                          <div className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{item.title}</div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{item.category}</div>
                       </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all">
                       <ArrowRight className="w-4 h-4 text-primary" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 bg-muted/20 border-t border-border/40 flex items-center justify-between">
             <div className="flex gap-4">
                <div className="flex items-center gap-1.5 grayscale opacity-50">
                   <div className="px-1.5 py-0.5 rounded border border-border bg-background text-[10px] font-bold">↵</div>
                   <span className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">Select</span>
                </div>
                <div className="flex items-center gap-1.5 grayscale opacity-50">
                   <div className="px-1.5 py-0.5 rounded border border-border bg-background text-[10px] font-bold">↑↓</div>
                   <span className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">Navigate</span>
                </div>
             </div>
             <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 italic">PEL ERP Intelligence Nav</div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
