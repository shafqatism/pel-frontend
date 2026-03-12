"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, useMemo, useEffect, useRef } from "react"
import Papa from "papaparse"
import { sitesApi } from "@/lib/api/sites"
import { projectsApi } from "@/lib/api/projects"
import { hrApi } from "@/lib/api/hr"
import { Attachment } from "@/lib/types/common"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { MultiSearchableSelect } from "@/components/ui/multi-searchable-select"
import { useDynamicDropdown } from "@/hooks/use-dynamic-dropdown"
import { MultiAttachmentUpload } from "@/components/common/multi-attachment-upload"
import type { ProjectSite, CreateSiteDto } from "@/lib/types/sites"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  MapPin, Globe, Activity, HardHat, RefreshCw, AlertTriangle, 
  Plus, History, User, Clock, BarChart3, HelpCircle, Search,
  Upload, Loader2, FileDown, FileText
} from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { DataTable } from "@/components/ui/data-table"
import { getSiteColumns } from "./core-columns"
import { useNav } from "@/lib/nav-context"
import { toast } from "sonner"
import { useAppDispatch } from "@/lib/store"
import { openGlobalAnalytics, openGlobalHelp } from "@/lib/store/slices/ui-slice"
import { ImportPreviewModal } from "@/components/common/import-preview-modal"
import type { ReportConfig } from "@/components/common/record-report-modal"

const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })

const phaseConfig = {
  exploration: { label: "Exploration", className: "bg-blue-100 text-blue-700 border-blue-200" },
  drilling:    { label: "Drilling",    className: "bg-amber-100 text-amber-700 border-amber-200" },
  production:  { label: "Production",  className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  decommissioned: { label: "Decommissioned", className: "bg-gray-100 text-gray-700 border-gray-200" },
}

const DEFAULT_PHASES = [
  { label: "Exploration", value: "exploration" },
  { label: "Drilling", value: "drilling" },
  { label: "Production", value: "production" },
  { label: "Decommissioned", value: "decommissioned" }
]

const DEFAULT_STATUSES = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" }
]

const mergeOptions = (defaults: { label: string; value: string }[], dynamic: { label: string; value: string }[]) => {
  const merged = [...defaults]
  dynamic.forEach(opt => {
    if (!merged.find(m => m.value === opt.value)) {
      merged.push(opt)
    }
  })
  return merged
}

function PhaseBadge({ phase }: { phase: string }) {
  const cfg = phaseConfig[phase as keyof typeof phaseConfig] ?? { label: phase, className: "bg-gray-100" }
  return <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${cfg.className}`}>{cfg.label}</span>
}

function SiteDrawer({ open, onClose, data }: { open: boolean; onClose: () => void; data?: ProjectSite | null }) {
  const mode = data ? 'edit' : 'create'
  const qc = useQueryClient()
  
  const { options: phaseOptions, createOption: createPhase } = useDynamicDropdown("site_phase")
  const { options: statusOptions, createOption: createStatus } = useDynamicDropdown("site_status")

  const { mutate, isPending } = useMutation({
    mutationFn: (dto: CreateSiteDto) => mode === 'create' ? sitesApi.sites.create(dto) : sitesApi.sites.update(data!.id, dto),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ["sites"] })
      toast.success(mode === 'create' ? "Site created" : "Site updated")
      onClose() 
    },
  })

  const [form, setForm] = useState<CreateSiteDto>({
    siteName: "", phase: "exploration", status: "active", attachments: [], fieldOfficerIds: [], projectId: ""
  })

  const { data: projectsData } = useQuery({
    queryKey: ["projects-dropdown"],
    queryFn: () => projectsApi.projects.list({ limit: 1000 }),
  })

  const projectOptions = useMemo(() => 
    (projectsData?.data || []).map(p => ({ label: p.name, value: p.id })),
    [projectsData]
  )

  const { data: employees = [] } = useQuery({
    queryKey: ["employees-dropdown"],
    queryFn: () => hrApi.employees.dropdown(),
  })

  const employeeOptions = useMemo(() => 
    employees.map(e => ({ label: e.fullName, value: e.id })), 
    [employees]
  )

  const mergedPhases = useMemo(() => mergeOptions(DEFAULT_PHASES, phaseOptions), [phaseOptions])
  const mergedStatuses = useMemo(() => mergeOptions(DEFAULT_STATUSES, statusOptions), [statusOptions])

  useEffect(() => {
    if (open) {
      if (data) {
        setForm({
          siteName: data.siteName || "",
          location: data.location || "",
          district: data.district || "",
          province: data.province || "",
          coordinates: data.coordinates || "",
          phase: data.phase || "exploration",
          siteInCharge: data.siteInCharge || "",
          contactPhone: data.contactPhone || "",
          startDate: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : "",
          description: data.description || "",
          attachments: data.attachments || [],
          fieldOfficerIds: data.fieldOfficers?.filter(fo => fo.status === 'active').map(fo => fo.employeeId) || [],
          projectId: data.projectId || ""
        })
      } else {
        setForm({ siteName: "", phase: "exploration", status: "active", attachments: [], fieldOfficerIds: [], projectId: "" })
      }
    }
  }, [data, open])

  const set = (k: keyof CreateSiteDto, v: any) => setForm(f => ({ ...f, [k]: v }))

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg md:max-w-xl overflow-y-auto p-0">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/40 px-6 py-5">
          <SheetHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <MapPin className="w-4 h-4" />
              </div>
              <SheetTitle className="text-base">{mode === 'create' ? "Create New Project Site" : "Edit Site Details"}</SheetTitle>
            </div>
            <SheetDescription className="text-xs">{mode === 'create' ? "Register a new field operation or drilling location." : "Update project site information and leadership."}</SheetDescription>
          </SheetHeader>
        </div>

        <form onSubmit={e => { e.preventDefault(); mutate(form) }} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Site Name *</Label>
              <Input placeholder="Site Alpha" value={form.siteName} onChange={e => set("siteName", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Location</Label>
              <Input placeholder="Northern Block" value={form.location ?? ""} onChange={e => set("location", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>District</Label>
              <Input placeholder="Sujawal" value={form.district ?? ""} onChange={e => set("district", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Province</Label>
              <Input placeholder="Sindh" value={form.province ?? ""} onChange={e => set("province", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Project / Block</Label>
              <SearchableSelect
                options={projectOptions}
                value={form.projectId}
                onValueChange={v => set("projectId", v)}
                placeholder="Select project..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Coordinates</Label>
              <Input placeholder="24.8607, 67.0011" value={form.coordinates ?? ""} onChange={e => set("coordinates", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Phase</Label>
              <SearchableSelect
                options={mergedPhases}
                value={form.phase}
                onValueChange={v => set("phase", v)}
                onCreate={createPhase}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Site In Charge</Label>
              <Input placeholder="Name of supervisor" value={form.siteInCharge ?? ""} onChange={e => set("siteInCharge", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Contact Phone</Label>
              <Input placeholder="+92 300 1234567" value={form.contactPhone ?? ""} onChange={e => set("contactPhone", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Start Date</Label>
              <Input type="date" value={form.startDate ?? ""} onChange={e => set("startDate", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <SearchableSelect
                options={mergedStatuses}
                value={form.status}
                onValueChange={v => set("status", v)}
                onCreate={createStatus}
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Current Field Officers</Label>
              <MultiSearchableSelect
                options={employeeOptions}
                value={form.fieldOfficerIds || []}
                onValueChange={v => set("fieldOfficerIds", v)}
                placeholder="Select Field Officers..."
              />
              <p className="text-[10px] text-muted-foreground italic">You can assign multiple officers to this site.</p>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Description</Label>
              <Textarea placeholder="Site details and objectives..." value={form.description ?? ""} onChange={e => set("description", e.target.value)} rows={2} />
            </div>
          </div>

          {data?.fieldOfficers && data.fieldOfficers.length > 0 && (
            <div className="pt-4 border-t border-border/40 mt-4 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <History className="w-4 h-4 text-primary" />
                <Label className="text-sm font-semibold">Assignment History</Label>
              </div>
              <div className="space-y-3">
                {data.fieldOfficers.map((fo) => (
                  <div key={fo.id} className="flex items-start justify-between bg-muted/30 p-3 rounded-xl border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${fo.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold">{fo.employee?.fullName || "Unknown Employee"}</p>
                        <p className="text-[10px] text-muted-foreground">{fo.employee?.designation || "N/A"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={`text-[9px] font-black uppercase mb-1 ${fo.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-500'}`}>
                        {fo.status}
                      </Badge>
                      <p className="text-[9px] text-muted-foreground flex items-center justify-end gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {fmt(fo.assignedAt)} {fo.unassignedAt ? `— ${fmt(fo.unassignedAt)}` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-border/40 mt-4">
            <Label className="text-sm font-semibold mb-2 block">Site Documents & Photographic Records</Label>
            <p className="text-xs text-muted-foreground mb-4">Attach site maps, environmental reports, permits, or field photos.</p>
            <MultiAttachmentUpload
              value={form.attachments || []}
              onChange={(val) => set("attachments", val)}
              module="sites"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border/40 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending} className="font-bold">
              {isPending ? "Saving..." : mode === 'create' ? "Create Site" : "Save Changes"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

export default function SitesView() {
  const dispatch = useAppDispatch()
  const { setActive, setBreadcrumb, setMetadata } = useNav()
  const [dialog, setDialog] = useState<{ open: boolean; data: ProjectSite | null }>({ open: false, data: null })
  const [importPreview, setImportPreview] = useState<{ open: boolean; data: any[]; columns: string[] }>({
    open: false,
    data: [],
    columns: [],
  })
  const qc = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["sites"],
    queryFn: () => sitesApi.sites.list({ limit: 100 }),
  })

  const [reportRecord, setReportRecord] = useState<any | null>(null)

  const buildReport = (s: any): ReportConfig => ({
    title: "Site Record",
    subtitle: s.siteName,
    module: "Sites Module",
    badge: s.status,
    badgeColor: s.status === "active" ? "green" : "red",
    sections: [
      {
        title: "Site Identification",
        color: "blue",
        fields: [
          { label: "Site Name", value: s.siteName },
          { label: "Phase", value: s.phase },
          { label: "Status", value: s.status },
          { label: "Project", value: s.project?.name },
          { label: "Start Date", value: s.startDate ? fmt(s.startDate) : undefined },
        ],
      },
      {
        title: "Location Details",
        color: "emerald",
        fields: [
          { label: "Location", value: s.location },
          { label: "District", value: s.district },
          { label: "Province", value: s.province },
          { label: "Coordinates", value: s.coordinates },
          { label: "Contact Phone", value: s.contactPhone },
        ],
      },
      {
        title: "Notes",
        color: "slate",
        fields: [{ label: "Description", value: s.description }],
      },
    ],
    attachments: s.attachments ?? [],
  })

  const { mutate: del } = useMutation({
    mutationFn: (id: string) => sitesApi.sites.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sites"] }),
  })

  const columns = useMemo(() => getSiteColumns(
    (id) => setDialog({ open: true, data: data?.data.find(s => s.id === id) || null }),
    (id) => { if (confirm("Delete this site?")) del(id) },
    fmt,
    (site) => {
      setMetadata({ siteId: site.id, siteName: site.siteName })
      setBreadcrumb(["Projects Management", "Sites", "Report"])
      setActive("sites-report")
    }
  ), [data, del, setActive, setBreadcrumb, setMetadata])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { mutate: importSites, isPending: isImporting } = useMutation({
    mutationFn: (data: Partial<CreateSiteDto>[]) => sitesApi.sites.importBulk(data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["sites"] })
      toast.success(`Successfully imported ${res.count} project sites`)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Import failed")
    }
  })

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    toast.info("Parsing CSV file...")
    try {
      const projReq = await projectsApi.projects.list({ limit: 1000 })
      const projects = projReq.data

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const dtos: Partial<CreateSiteDto>[] = []
          for (const row of results.data as any[]) {
            if (!row.siteName) continue
            
            let projectId = undefined
            if (row.projectName) {
              const p = projects.find(x => x.name.toLowerCase() === String(row.projectName).toLowerCase())
              if (p) projectId = p.id
            }

            dtos.push({
              siteName: row.siteName,
              location: row.location || undefined,
              district: row.district || undefined,
              province: row.province || undefined,
              phase: (row.phase || "exploration").toLowerCase() as any,
              status: (row.status || "active").toLowerCase() as any,
              siteInCharge: row.siteInCharge || undefined,
              contactPhone: row.contactPhone || undefined,
              startDate: row.startDate || undefined,
              description: row.description || undefined,
              projectId
            })
          }
          if (dtos.length === 0) {
            toast.error("No valid records found. Ensure 'siteName' is present.")
            return
          }
          setImportPreview({
            open: true,
            data: dtos,
            columns: Object.keys(dtos[0]),
          })
        },
        error: (error) => toast.error(`Error parsing file: ${error.message}`)
      })
    } catch (err: any) {
      toast.error("Failed to map requirements. Please try again.")
    }

    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      toast.info(`Generating ${format.toUpperCase()}...`)
      const res = await sitesApi.reports.export('sites', format)
      
      const blob = new Blob([res.data])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const ext = format === 'excel' ? 'xlsx' : format
      link.setAttribute('download', `PEL_ProjectSites_${new Date().toISOString().slice(0, 10)}.${ext}`)
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

  const stats = [
    { label: "Total Sites", value: data?.total ?? 0, icon: Globe, color: "text-primary" },
    { label: "Active Sites", value: data?.data.filter(s => s.status === "active").length ?? 0, icon: Activity, color: "text-emerald-600" },
    { label: "Operational Sites", value: data?.data.filter(s => s.phase === "production").length ?? 0, icon: HardHat, color: "text-amber-600" },
  ]

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Project Sites</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage field operations, drilling locations, and site leadership</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => dispatch(openGlobalAnalytics({ module: 'sites', type: 'sites' }))}
            className="border-primary/20 hover:bg-primary/5 text-primary font-bold"
          >
            <BarChart3 className="w-4 h-4 mr-1.5" /> Analytics
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => dispatch(openGlobalHelp({ module: 'sites', section: 'sites' }))}
            className="border-slate-200 hover:bg-slate-50 text-slate-700 font-bold"
          >
            <HelpCircle className="w-4 h-4 mr-1.5" /> Help
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="w-3.5 h-3.5 mr-1.5" />Refresh</Button>
          
          <input type="file" accept=".csv" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
          <Button 
            disabled={isImporting}
            size="sm" 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()} 
            className="border-slate-200 hover:bg-slate-50 text-slate-700 font-bold"
          >
            {isImporting ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Upload className="w-3.5 h-3.5 mr-1.5" />} Import
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="font-bold border-slate-200 hover:bg-slate-50 text-slate-700"
              >
                <FileDown className="w-3.5 h-3.5 mr-1.5" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl p-1 w-40">
              <DropdownMenuItem onClick={() => handleExport('csv')} className="text-xs font-semibold p-2.5 rounded-lg cursor-pointer">
                <FileText className="w-4 h-4 mr-2 text-blue-600" /> Save as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('excel')} className="text-xs font-semibold p-2.5 rounded-lg cursor-pointer">
                <FileText className="w-4 h-4 mr-2 text-emerald-600" /> Save as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')} className="text-xs font-semibold p-2.5 rounded-lg cursor-pointer">
                <FileText className="w-4 h-4 mr-2 text-rose-600" /> Save as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button size="sm" onClick={() => setDialog({ open: true, data: null })} className="font-bold"><Plus className="w-3.5 h-3.5 mr-1.5" />New Site</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="rounded-2xl border-border/50 shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-muted/50">
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{s.label}</p>
                <p className={`text-xl font-black mt-0.5 ${s.color}`}>{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-24 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Localizing Field Assets…</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center">
            <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-4 opacity-50" />
            <p className="font-black uppercase tracking-widest text-sm text-rose-600">Secure link failure</p>
            <Button variant="outline" size="sm" className="mt-6 rounded-xl font-bold" onClick={() => refetch()}>Retrying Link</Button>
          </div>
        ) : (
          <div className="p-1">
            <DataTable
              columns={columns}
              data={data?.data ?? []}
              searchKey="siteName"
            />
          </div>
        )}
      </Card>

      <SiteDrawer 
        open={dialog.open} 
        onClose={() => setDialog({ open: false, data: null })} 
        data={dialog.data}
      />

      <ImportPreviewModal
        open={importPreview.open}
        onOpenChange={(open) => setImportPreview((prev) => ({ ...prev, open }))}
        data={importPreview.data}
        columns={importPreview.columns}
        isLoading={isImporting}
        onConfirm={() => {
          importSites(importPreview.data)
          setImportPreview((prev) => ({ ...prev, open: false }))
        }}
        title="Preview Project Sites Import"
        description="Verify the field locations and project assignments before adding them to the database."
      />
    </div>
  )
}
