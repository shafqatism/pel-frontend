"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, useMemo } from "react"
import { sitesApi } from "@/lib/api/sites"
import type { ProjectSite, CreateSiteDto } from "@/lib/types/sites"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Plus, RefreshCw, AlertTriangle, Trash2, User, Phone, Globe, Activity, HardHat, BarChart3, HelpCircle } from "lucide-react"
import { useAppDispatch } from "@/lib/store"
import { openGlobalAnalytics, openGlobalHelp } from "@/lib/store/slices/ui-slice"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { useDynamicDropdown } from "@/hooks/use-dynamic-dropdown"

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

function AddSiteDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient()
  
  const { options: phaseOptions, createOption: createPhase } = useDynamicDropdown("site_phase")
  const { options: statusOptions, createOption: createStatus } = useDynamicDropdown("site_status")

  const { mutate, isPending } = useMutation({
    mutationFn: (dto: CreateSiteDto) => sitesApi.sites.create(dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sites"] }); onClose() },
  })

  const [form, setForm] = useState<CreateSiteDto>({
    siteName: "", phase: "exploration", status: "active",
  })

  const mergedPhases = useMemo(() => mergeOptions(DEFAULT_PHASES, phaseOptions), [phaseOptions])
  const mergedStatuses = useMemo(() => mergeOptions(DEFAULT_STATUSES, statusOptions), [statusOptions])

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
              <SheetTitle className="text-base">Create New Project Site</SheetTitle>
            </div>
            <SheetDescription className="text-xs">Register a new field operation or drilling location.</SheetDescription>
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
              <Label>Description</Label>
              <Textarea placeholder="Site details and objectives..." value={form.description ?? ""} onChange={e => set("description", e.target.value)} rows={2} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border/40 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending} className="font-bold">
              {isPending ? "Creating..." : "Create Site"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

export default function SitesView() {
  const dispatch = useAppDispatch()
  const [showAdd, setShowAdd] = useState(false)
  const qc = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["sites"],
    queryFn: () => sitesApi.sites.list({ limit: 100 }),
  })

  const { mutate: del } = useMutation({
    mutationFn: (id: string) => sitesApi.sites.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sites"] }),
  })

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
          <Button size="sm" onClick={() => setShowAdd(true)} className="font-bold"><Plus className="w-3.5 h-3.5 mr-1.5" />New Site</Button>
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
          <CardContent className="py-16 text-center text-muted-foreground text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" /> Loading project sites...
          </CardContent>
        ) : error ? (
          <CardContent className="py-16 text-center text-sm">
            <AlertTriangle className="w-6 h-6 text-rose-500 mx-auto mb-2" />
            <p className="font-semibold text-rose-600">Failed to load sites</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>Retry</Button>
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-bold text-xs uppercase tracking-wide">Site / Location</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Phase</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">In Charge</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Contact</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Start Date</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide text-center">Status</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.data ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                    <MapPin className="w-8 h-8 mx-auto mb-2 opacity-20" /> No project sites registered.
                  </TableCell>
                </TableRow>
              ) : (
                (data?.data ?? []).map(site => (
                  <TableRow key={site.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell>
                      <div className="font-semibold text-sm">{site.siteName}</div>
                      <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{site.district}, {site.province}</div>
                    </TableCell>
                    <TableCell><PhaseBadge phase={site.phase} /></TableCell>
                    <TableCell>
                       <div className="flex items-center gap-1.5 text-sm">
                         <User className="w-3 h-3 text-muted-foreground" /> {site.siteInCharge || "Unassigned"}
                       </div>
                    </TableCell>
                    <TableCell>
                       {site.contactPhone ? (
                         <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Phone className="w-3 h-3" /> {site.contactPhone}
                         </div>
                       ) : "—"}
                    </TableCell>
                    <TableCell className="text-sm">{site.startDate ? fmt(site.startDate) : "—"}</TableCell>
                    <TableCell className="text-center">
                       <span className={`inline-flex text-[10px] font-black px-2 py-0.5 rounded-full border uppercase ${
                         site.status === "active" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-rose-50 text-rose-600 border-rose-200"
                       }`}>
                         {site.status}
                       </span>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-rose-600"
                        onClick={() => { if (confirm("Delete this site?")) del(site.id) }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      <AddSiteDrawer open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  )
}
