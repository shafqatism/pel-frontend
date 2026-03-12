"use client"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { 
  HelpCircle, 
  BookOpen, 
  Info, 
  PlusCircle, 
  Edit, 
  Trash2, 
  Search,
  CheckCircle2,
  ArrowRightCircle,
  FileText,
  ShieldAlert,
  Users,
  DollarSign,
  MapPin,
  UtensilsCrossed,
  Landmark,
  Package,
  LayoutDashboard,
  Activity
} from "lucide-react"
import { useAppSelector, useAppDispatch } from "@/lib/store"
import { closeGlobalHelp } from "@/lib/store/slices/ui-slice"
import { Separator } from "@/components/ui/separator"

export default function GlobalHelpDrawer() {
  const dispatch = useAppDispatch()
  const { isOpen, module, section } = useAppSelector((state) => state.ui.globalHelp)

  if (!module || !section) return null

  const getModuleIcon = () => {
    switch (module) {
      case 'fleet': return <Package className="w-5 h-5" />
      case 'hse': return <ShieldAlert className="w-5 h-5" />
      case 'hr': return <Users className="w-5 h-5" />
      case 'finance': return <DollarSign className="w-5 h-5" />
      case 'sites': return <MapPin className="w-5 h-5" />
      case 'food': return <UtensilsCrossed className="w-5 h-5" />
      case 'rental': return <Landmark className="w-5 h-5" />
      case 'documents': return <FileText className="w-5 h-5" />
      default: return <BookOpen className="w-5 h-5" />
    }
  }

  const renderContent = () => {
    switch (module) {
      case 'fleet': return <FleetHelp section={section} />
      case 'hse': return <HseHelp section={section} />
      case 'hr': return <HrHelp section={section} />
      case 'finance': return <FinanceHelp section={section} />
      case 'sites': return <SitesHelp />
      case 'food': return <FoodHelp />
      case 'rental': return <RentalHelp />
      case 'documents': return <DocumentsHelp />
      case 'dashboard': return <DashboardHelp />
      default: return null
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={() => dispatch(closeGlobalHelp())}>
      <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col">
        <div className="bg-primary/5 p-6 border-b border-primary/10">
          <SheetHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                {getModuleIcon()}
              </div>
              <div>
                <SheetTitle className="text-xl font-bold flex items-center gap-2">
                   {module.toUpperCase()} Guide
                </SheetTitle>
                <SheetDescription className="text-sm font-medium text-primary/60">
                   Mastering the {section} workflow
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
        </div>

        <div className="flex-1 px-6 py-6 overflow-y-auto">
          {renderContent()}
        </div>

        <div className="p-4 bg-muted/30 border-t border-border/50">
           <p className="text-[10px] text-center font-bold text-muted-foreground uppercase tracking-widest">
             PEL ERP Enterprise Support System v1.0
           </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// --- SHARED COMPONENTS ---

function HelpSection({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) {
  return (
    <div className="space-y-4 mb-8 animate-in fade-in slide-in-from-right-4">
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-black uppercase tracking-widest text-foreground">{title}</h3>
      </div>
      <div className="pl-9 space-y-3">
        {children}
      </div>
    </div>
  )
}

function CrudInfo() {
  return (
    <HelpSection title="Common Operations (CRUD)" icon={PlusCircle}>
      <div className="grid gap-3">
        <div className="flex gap-3">
          <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
             <PlusCircle className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">Creating Records</p>
            <p className="text-[11px] text-muted-foreground">Click the "Add New" or "Log" button in the header. Fill required fields (marked with *) and submit.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
             <Edit className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">Updating Data</p>
            <p className="text-[11px] text-muted-foreground">Click the pencil icon in the Actions column. Modify the desired information and save changes.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="h-6 w-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
             <Trash2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">Removing Records</p>
            <p className="text-[11px] text-muted-foreground">Use the trash icon to delete entries. This action is permanent and may affect dependent modules.</p>
          </div>
        </div>
      </div>
    </HelpSection>
  )
}

// --- MODULE SPECIFIC CONTENT ---

function FleetHelp({ section }: { section: string }) {
  return (
    <div className="space-y-2">
      <HelpSection title="Overview" icon={Info}>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The Fleet module is designed to manage PEL's mobile assets, tracking everything from vehicle health to trip efficiency and fuel expenses.
        </p>
      </HelpSection>

      <HelpSection title="Section Flow" icon={ArrowRightCircle}>
        <ul className="space-y-2">
          <li className="text-xs flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
            <span><strong>Vehicles:</strong> The foundation. Add vehicles before assigning trips or maintenance.</span>
          </li>
          <li className="text-xs flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
            <span><strong>Trips:</strong> Track movement between sites. Requires a vehicle and driver.</span>
          </li>
          <li className="text-xs flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
            <span><strong>Fuel:</strong> Log receipts to monitor L/km efficiency.</span>
          </li>
        </ul>
      </HelpSection>

      <CrudInfo />

      <HelpSection title="Abbreviations & Fields" icon={BookOpen}>
        <div className="space-y-2 border border-border/50 rounded-xl p-3 bg-muted/20">
          <div className="flex justify-between text-[10px]">
            <span className="font-bold text-primary">VIN</span>
            <span className="text-muted-foreground italic">Vehicle Identification Number</span>
          </div>
          <Separator />
          <div className="flex justify-between text-[10px]">
            <span className="font-bold text-primary">Odo (KM)</span>
            <span className="text-muted-foreground italic">Odometer reading in Kilometers</span>
          </div>
          <Separator />
          <div className="flex justify-between text-[10px]">
             <span className="font-bold text-primary">Status: Maint</span>
             <span className="text-muted-foreground italic">Vehicle is currently in workshop</span>
          </div>
        </div>
      </HelpSection>
    </div>
  )
}

function HseHelp({ section }: { section: string }) {
  return (
    <div className="space-y-2">
      <HelpSection title="Workplace Safety" icon={ShieldAlert}>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The HSE (Health, Safety, and Environment) module tracks compliance and incidents across all project sites.
        </p>
      </HelpSection>

      <HelpSection title="Incident Reporting" icon={ArrowRightCircle}>
        <p className="text-xs text-muted-foreground">
          Reporting an incident follows a strict <strong>3-Step Workflow</strong>:
        </p>
        <div className="grid grid-cols-3 gap-2 mt-2">
          <div className="p-2 rounded-lg bg-rose-50 border border-rose-100 text-center">
            <p className="text-[10px] font-black text-rose-700 uppercase">1. Log</p>
          </div>
          <div className="p-2 rounded-lg bg-amber-50 border border-amber-100 text-center">
            <p className="text-[10px] font-black text-amber-700 uppercase">2. Investigate</p>
          </div>
          <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100 text-center">
            <p className="text-[10px] font-black text-emerald-700 uppercase">3. Close</p>
          </div>
        </div>
      </HelpSection>

      <CrudInfo />

      <HelpSection title="Safety Metrics" icon={BookOpen}>
        <div className="space-y-2 border border-border/50 rounded-xl p-3 bg-muted/20 text-[10px]">
          <div className="flex justify-between">
            <span className="font-bold text-primary">LTI</span>
            <span className="text-muted-foreground italic">Lost Time Injury</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="font-bold text-primary">Audit Score</span>
            <span className="text-muted-foreground italic">Percentage of safety compliance (Target &gt; 90%)</span>
          </div>
        </div>
      </HelpSection>
    </div>
  )
}

function HrHelp({ section }: { section: string }) {
  return (
    <div className="space-y-2">
      <HelpSection title="People Power" icon={Users}>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Manage the human capital of PEL. This module handles employee registration and daily attendance tracking.
        </p>
      </HelpSection>

      <HelpSection title="Attendance Rules" icon={ArrowRightCircle}>
        <ul className="space-y-2 text-xs">
          <li><strong>Present:</strong> Full day attendance logged with check-in/out.</li>
          <li><strong>Late:</strong> Check-in recorded after 9:15 AM.</li>
          <li><strong>Half Day:</strong> Less than 5 hours of site presence.</li>
        </ul>
      </HelpSection>

      <CrudInfo />

      <HelpSection title="HR Abbreviations" icon={BookOpen}>
         <div className="space-y-2 border border-border/50 rounded-xl p-3 bg-muted/20 text-[10px]">
          <div className="flex justify-between">
            <span className="font-bold text-primary">CNIC</span>
            <span className="text-muted-foreground italic">Computerized National ID Card</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="font-bold text-primary">DOJ</span>
            <span className="text-muted-foreground italic">Date of Joining</span>
          </div>
        </div>
      </HelpSection>
    </div>
  )
}

function FinanceHelp({ section }: { section: string }) {
  return (
    <div className="space-y-2">
      <HelpSection title="Financial Ledger" icon={DollarSign}>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Standardized expense logging and approval workflow. All operational costs must be justified here.
        </p>
      </HelpSection>

      <HelpSection title="Approval Pipeline" icon={ArrowRightCircle}>
        <div className="space-y-3 pl-2">
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-amber-500" />
             <p className="text-xs"><strong>Pending:</strong> Expense submitted, awaiting Finance Lead review.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-emerald-500" />
             <p className="text-xs"><strong>Approved:</strong> Payment sanctioned; funds cleared.</p>
          </div>
        </div>
      </HelpSection>

      <CrudInfo />
    </div>
  )
}

function SitesHelp() {
  return (
    <div className="space-y-2">
      <HelpSection title="Field Operations" icon={MapPin}>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Registry of all drilling rigs, offices, and project sites. Used as a reference across all other modules.
        </p>
      </HelpSection>
      <CrudInfo />
      <HelpSection title="Site Status" icon={BookOpen}>
         <div className="space-y-2 text-xs text-muted-foreground">
           <p><strong>Operational:</strong> Active site with 24/7 staffing.</p>
           <p><strong>Standby:</strong> Equipment on-site, but operations paused.</p>
           <p><strong>Mobilization:</strong> Site being prepared and set up.</p>
         </div>
      </HelpSection>
    </div>
  )
}

function FoodHelp() {
  return (
    <div className="space-y-2">
      <HelpSection title="Catering Workflow" icon={UtensilsCrossed}>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Log daily meal headcounts to ensure catering efficiency and quality control at site mess halls.
        </p>
      </HelpSection>
      <CrudInfo />
      <HelpSection title="Quality Metrics" icon={BookOpen}>
        <p className="text-xs">Provide a rating (1-5) for every meal log based on on-site feedback surveys.</p>
      </HelpSection>
    </div>
  )
}

function RentalHelp() {
  return (
    <div className="space-y-2">
      <HelpSection title="Acquisitions" icon={Landmark}>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Management of land leases for operational blocks and access roads.
        </p>
      </HelpSection>
      <CrudInfo />
      <HelpSection title="Key Terms" icon={BookOpen}>
         <div className="flex justify-between text-[10px] py-1 border-b border-border/50">
           <span className="font-bold">Liability</span>
           <span className="italic">Remaining balance on the lease agreement</span>
         </div>
      </HelpSection>
    </div>
  )
}

function DocumentsHelp() {
  return (
    <div className="space-y-2">
      <HelpSection title="Knowledge Hub" icon={FileText}>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Centralized storage for SOPs, Certificates, and Legal documents.
        </p>
      </HelpSection>
      <CrudInfo />
      <HelpSection title="Categories" icon={BookOpen}>
         <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
           <div className="p-2 bg-blue-50 text-blue-700 rounded border border-blue-100">SOP</div>
           <div className="p-2 bg-emerald-50 text-emerald-700 rounded border border-emerald-100">LEGAL</div>
           <div className="p-2 bg-amber-50 text-amber-700 rounded border border-amber-100">CERTIFICATE</div>
           <div className="p-2 bg-slate-50 text-slate-700 rounded border border-slate-100">GENERAL</div>
         </div>
      </HelpSection>
    </div>
  )
}

function DashboardHelp() {
  return (
    <div className="space-y-4">
      <HelpSection title="Command Center" icon={LayoutDashboard}>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The Dashboard is your real-time operational overview. It aggregates data from all modules to give you high-level insights.
        </p>
      </HelpSection>

      <HelpSection title="Key Widgets" icon={Activity}>
        <div className="space-y-3">
          <div className="p-3 rounded-xl border border-border/50 bg-muted/20">
            <p className="text-xs font-bold">Operational Cards</p>
            <p className="text-[11px] text-muted-foreground">Top-level counts for Vehicles, Manpower, Sites, and Expenditure.</p>
          </div>
          <div className="p-3 rounded-xl border border-border/50 bg-muted/20">
            <p className="text-xs font-bold">Maintenance Roadmap</p>
            <p className="text-[11px] text-muted-foreground">AI-driven predictions for upcoming vehicle services.</p>
          </div>
          <div className="p-3 rounded-xl border border-border/50 bg-muted/20">
            <p className="text-xs font-bold">Live Operational Feed</p>
            <p className="text-[11px] text-muted-foreground">Real-time alerts for system-wide activities.</p>
          </div>
        </div>
      </HelpSection>

      <HelpSection title="Navigation" icon={ArrowRightCircle}>
        <p className="text-xs text-muted-foreground">Use the sidebar to jump into specific modules for detailed data entry and management.</p>
      </HelpSection>
    </div>
  )
}
