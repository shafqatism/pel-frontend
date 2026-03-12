"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, useMemo, useEffect, useRef } from "react"
import Papa from "papaparse"
import { projectsApi } from "@/lib/api/projects"
import { Attachment } from "@/lib/types/common"
import type { Project, CreateProjectDto } from "@/lib/types/projects"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { FolderKanban, Plus, RefreshCw, AlertTriangle, Trash2, Calendar, FileText, BarChart3, HelpCircle, Edit, Building2, Upload, Loader2, FileDown } from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { companiesApi } from "@/lib/api/companies"
import { useAppDispatch } from "@/lib/store"
import { openGlobalAnalytics, openGlobalHelp } from "@/lib/store/slices/ui-slice"
import { MultiAttachmentUpload } from "@/components/common/multi-attachment-upload"
import { ImportPreviewModal } from "@/components/common/import-preview-modal"
import { toast } from "sonner"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { useDynamicDropdown } from "@/hooks/use-dynamic-dropdown"
import { DataTable } from "@/components/ui/data-table"
import { getProjectColumns } from "./core-columns"
import { useNav } from "@/lib/nav-context"

const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })

const statusConfig = {
  active:    { label: "Active",    className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  inactive:  { label: "Inactive",  className: "bg-gray-100 text-gray-700 border-gray-200" },
  completed: { label: "Completed", className: "bg-blue-100 text-blue-700 border-blue-200" },
  on_hold:   { label: "On Hold",   className: "bg-amber-100 text-amber-700 border-amber-200" },
}

const DEFAULT_STATUSES = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Completed", value: "completed" },
  { label: "On Hold", value: "on_hold" }
]

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status as keyof typeof statusConfig] ?? { label: status, className: "bg-gray-100" }
  return <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${cfg.className}`}>{cfg.label}</span>
}

function ProjectDrawer({ open, onClose, data }: { open: boolean; onClose: () => void; data?: Project | null }) {
  const mode = data ? 'edit' : 'create'
  const qc = useQueryClient()
  
  const { options: statusOptions, createOption: createStatus } = useDynamicDropdown("project_status")

  const { mutate, isPending } = useMutation({
    mutationFn: (dto: CreateProjectDto) => mode === 'create' ? projectsApi.projects.create(dto) : projectsApi.projects.update(data!.id, dto),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ["projects"] })
      toast.success(mode === 'create' ? "Project created" : "Project updated")
      onClose() 
    },
  })

  const [form, setForm] = useState<CreateProjectDto>({
    name: "", status: "active", attachments: [], companyId: ""
  })

  const { data: companiesData } = useQuery({
    queryKey: ["companies-dropdown"],
    queryFn: () => companiesApi.list({ limit: 1000 }),
  })

  const companyOptions = useMemo(() => 
    (companiesData?.data || []).map(c => ({ label: c.name, value: c.id })),
    [companiesData]
  )

  const mergedStatuses = useMemo(() => {
    const merged = [...DEFAULT_STATUSES]
    statusOptions.forEach(opt => {
      if (!merged.find(m => m.value === opt.value)) merged.push(opt)
    })
    return merged
  }, [statusOptions])

  useEffect(() => {
    if (open) {
      if (data) {
        setForm({
          name: data.name || "",
          startDate: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : "",
          endDate: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : "",
          description: data.description || "",
          status: data.status || "active",
          companyId: data.companyId || "",
          attachments: data.attachments || []
        })
      } else {
        setForm({ name: "", status: "active", attachments: [], companyId: "" })
      }
    }
  }, [data, open])

  const set = (k: keyof CreateProjectDto, v: any) => setForm(f => ({ ...f, [k]: v }))

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg md:max-w-xl overflow-y-auto p-0">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/40 px-6 py-5">
          <SheetHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <FolderKanban className="w-4 h-4" />
              </div>
              <SheetTitle className="text-base">{mode === 'create' ? "Create New Project / Block" : "Edit Project Details"}</SheetTitle>
            </div>
            <SheetDescription className="text-xs">{mode === 'create' ? "Define a new exploration block or development project." : "Update project timelines and status."}</SheetDescription>
          </SheetHeader>
        </div>

        <form onSubmit={e => { e.preventDefault(); mutate(form) }} className="p-6 space-y-4">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Project / Block Name *</Label>
              <Input placeholder="Block-X Green Field" value={form.name} onChange={e => set("name", e.target.value)} required />
            </div>

            <div className="space-y-1.5">
              <Label>Assigning Company</Label>
              <SearchableSelect
                options={companyOptions}
                value={form.companyId}
                onValueChange={v => set("companyId", v)}
                placeholder="Select company..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Start Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input type="date" className="pl-9" value={form.startDate ?? ""} onChange={e => set("startDate", e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>End Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input type="date" className="pl-9" value={form.endDate ?? ""} onChange={e => set("endDate", e.target.value)} />
                </div>
              </div>
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

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea 
                placeholder="Technical details, block boundaries, or project objectives..." 
                value={form.description ?? ""} 
                onChange={e => set("description", e.target.value)} 
                rows={4} 
              />
            </div>

            <div className="pt-4 border-t border-border/40 mt-4">
              <Label className="text-sm font-semibold mb-2 block">Project Documents & Technical Papers</Label>
              <p className="text-xs text-muted-foreground mb-4">Upload concession agreements, seismic reports, or boundary maps.</p>
              <MultiAttachmentUpload
                value={form.attachments || []}
                onChange={(val) => set("attachments", val)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-border/40 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending} className="font-bold">
              {isPending ? "Saving..." : mode === 'create' ? "Create Project" : "Save Changes"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

export default function ProjectsView() {
  const dispatch = useAppDispatch()
  const { setActive, setBreadcrumb, setMetadata } = useNav()
  const [drawer, setDrawer] = useState<{ open: boolean; data: Project | null }>({ open: false, data: null })
  const [importPreview, setImportPreview] = useState<{ open: boolean; data: any[]; columns: string[] }>({
    open: false,
    data: [],
    columns: [],
  })
  const qc = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["projects"],
    queryFn: () => projectsApi.projects.list({ limit: 100 }),
  })

  const { mutate: del } = useMutation({
    mutationFn: (id: string) => projectsApi.projects.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  })
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { mutate: importProjects, isPending: isImporting } = useMutation({
    mutationFn: (data: Partial<CreateProjectDto>[]) => projectsApi.projects.importBulk(data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["projects"] })
      toast.success(`Successfully imported ${res.count} projects/blocks`)
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
      const companiesReq = await companiesApi.list({ limit: 1000 })
      const companies = companiesReq.data

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const dtos: Partial<CreateProjectDto>[] = []
          for (const row of results.data as any[]) {
            if (!row.name) continue
            
            // Try to map company name to ID if provided
            let companyId = undefined
            if (row.companyName) {
              const c = companies.find(x => x.name.toLowerCase() === String(row.companyName).toLowerCase())
              if (c) companyId = c.id
            }

            dtos.push({
              name: row.name,
              description: row.description || undefined,
              startDate: row.startDate || undefined,
              endDate: row.endDate || undefined,
              status: row.status || "active",
              companyId
            })
          }
          if (dtos.length === 0) {
            toast.error("No valid records found. Ensure 'name' is present.")
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
      const res = await projectsApi.reports.export('projects', format)
      
      const blob = new Blob([res.data])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const ext = format === 'excel' ? 'xlsx' : format
      link.setAttribute('download', `PEL_Projects_${new Date().toISOString().slice(0, 10)}.${ext}`)
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

  const columns = useMemo(() => getProjectColumns(
    (id) => setDrawer({ open: true, data: data?.data.find(p => p.id === id) || null }),
    (id) => { if (confirm("Delete this project?")) del(id) },
    (project) => {
      setMetadata({ projectId: project.id, projectName: project.name })
      setBreadcrumb(["Projects Management", "Blocks", "Report"])
      setActive("projects-report")
    }
  ), [data, del, setActive, setBreadcrumb, setMetadata])

  const stats = [
    { label: "Active Blocks", value: data?.data.filter(p => p.status === "active").length ?? 0, icon: FolderKanban, color: "text-primary" },
    { label: "Exploration", value: data?.total ?? 0, icon: BarChart3, color: "text-emerald-600" },
    { label: "On Hold", value: data?.data.filter(p => p.status === "on_hold").length ?? 0, icon: AlertTriangle, color: "text-amber-600" },
  ]

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Project / Block Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Define development blocks, set concession timelines, and track project status</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => dispatch(openGlobalAnalytics({ module: 'projects', type: 'blocks' }))}
            className="border-primary/20 hover:bg-primary/5 text-primary font-bold"
          >
            <BarChart3 className="w-4 h-4 mr-1.5" /> Analytics
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => dispatch(openGlobalHelp({ module: 'projects', section: 'overview' }))}
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

          <Button size="sm" onClick={() => setDrawer({ open: true, data: null })} className="font-bold"><Plus className="w-3.5 h-3.5 mr-1.5" />New Project</Button>
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
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Accessing Concession Logs…</p>
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
              searchKey="name"
            />
          </div>
        )}
      </Card>

      <ProjectDrawer 
        open={drawer.open} 
        onClose={() => setDrawer({ open: false, data: null })} 
        data={drawer.data}
      />

      <ImportPreviewModal
        open={importPreview.open}
        onOpenChange={(open) => setImportPreview((prev) => ({ ...prev, open }))}
        data={importPreview.data}
        columns={importPreview.columns}
        isLoading={isImporting}
        onConfirm={() => {
          importProjects(importPreview.data)
          setImportPreview((prev) => ({ ...prev, open: false }))
        }}
        title="Preview Projects Import"
        description="Verify the block identities and assignment details before initializing them in the project log."
      />
    </div>
  )
}
