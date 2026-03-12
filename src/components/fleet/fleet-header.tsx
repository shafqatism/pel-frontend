"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, FileDown, Filter, BarChart3, HelpCircle } from "lucide-react"
import { useAppDispatch } from "@/lib/store"
import { openFleetDrawer, openGlobalAnalytics, openGlobalHelp } from "@/lib/store/slices/ui-slice"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { fleetApi } from "@/lib/api/fleet"
import { toast } from "sonner"

interface FleetHeaderProps {
  title: string;
  subtitle: string;
  type: 'vehicle' | 'trip' | 'fuel' | 'maintenance' | 'assignment';
  onSearch: (val: string) => void;
  exportType: string;
  customAction?: React.ReactNode;
}

export default function FleetHeader({ title, subtitle, type, onSearch, exportType, customAction }: FleetHeaderProps) {
  const dispatch = useAppDispatch()

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      toast.info(`Generating ${format.toUpperCase()}...`)
      const res = await fleetApi.reports.export(exportType, format)
      
      const blob = new Blob([res.data])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const ext = format === 'excel' ? 'xlsx' : format
      link.setAttribute('download', `PEL_Fleet_${exportType}_${new Date().toISOString().slice(0, 10)}.${ext}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      toast.success(`Export successful`)
    } catch (err) {
      console.error("Export Error:", err)
      toast.error("Export failed. Please check your connection.")
    }
  }

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 animate-in fade-in slide-in-from-top-2">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search..." 
            className="pl-9 h-9" 
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 font-medium shadow-sm hover:bg-muted/50 transition-colors">
              <FileDown className="w-3.5 h-3.5 mr-2" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport('csv')}>Export as CSV</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('excel')}>Export as Excel</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('pdf')}>Export as PDF</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button 
          variant="outline"
          size="sm" 
          className="h-9 font-medium border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all text-primary"
          onClick={() => dispatch(openGlobalAnalytics({ module: 'fleet', type }))}
        >
          <BarChart3 className="w-3.5 h-3.5 mr-2" />
          Analytics
        </Button>

        <Button 
          variant="outline"
          size="sm" 
          className="h-9 font-medium border-border/60 hover:bg-muted/50 transition-all text-muted-foreground hover:text-foreground"
          onClick={() => dispatch(openGlobalHelp({ module: 'fleet', section: type }))}
        >
          <HelpCircle className="w-3.5 h-3.5 mr-2" />
          Help
        </Button>

        {customAction}

        <Button size="sm" className="h-9 px-4 font-bold bg-primary hover:bg-primary/90 shadow-md shadow-primary/10 transition-all active:scale-95" onClick={() => dispatch(openFleetDrawer({ type, mode: 'create' }))}>
          <Plus className="w-3.5 h-3.5 mr-2" />
          Add New
        </Button>
      </div>
    </div>
  )
}
