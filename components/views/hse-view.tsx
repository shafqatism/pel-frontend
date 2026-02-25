"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, useEffect, useMemo } from "react"
import { hseApi } from "@/lib/api/hse"
import type { Incident, SafetyAudit, HseDrill, CreateIncidentDto, CreateAuditDto, CreateDrillDto } from "@/lib/types/hse"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ShieldAlert, ShieldCheck, Flame, Plus, RefreshCw, AlertTriangle, 
  Search, HardHat, FileWarning, ClipboardCheck, Users, Clock, MapPin,
  Edit2, Trash2, BarChart3, HelpCircle
} from "lucide-react"
import { toast } from "sonner"
import { useAppDispatch } from "@/lib/store"
import { openGlobalAnalytics, openGlobalHelp } from "@/lib/store/slices/ui-slice"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { useDynamicDropdown } from "@/hooks/use-dynamic-dropdown"

const fmt = (d: string) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"
const today = () => new Date().toISOString().split("T")[0]

const DEFAULT_SEVERITIES = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Critical", value: "critical" }
]

const DEFAULT_FINDINGS = [
  { label: "Compliant", value: "compliant" },
  { label: "Non-Compliant", value: "non_compliant" },
  { label: "Improvement Needed", value: "improvement_needed" }
]

const DEFAULT_DRILL_TYPES = [
  { label: "Fire", value: "Fire" },
  { label: "Spill", value: "Spill" },
  { label: "Medic", value: "Medic" },
  { label: "Security", value: "Security" }
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

function IncidentDrawer({ open, onClose, data }: { open: boolean; onClose: () => void; data?: Incident | null }) {
  const qc = useQueryClient()
  const mode = data ? 'edit' : 'create'
  
  const { options: severityOptions, createOption: createSeverity } = useDynamicDropdown("incident_severity")

  const { mutate, isPending } = useMutation({
    mutationFn: (dto: CreateIncidentDto) => mode === 'create' ? hseApi.incidents.create(dto) : hseApi.incidents.update(data!.id, dto),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ["incidents"] })
      toast.success(mode === 'create' ? "Incident reported" : "Incident updated")
      onClose() 
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Operation failed")
  })

  const [form, setForm] = useState<CreateIncidentDto>({
    title: "", description: "", incidentDate: today(), location: "", severity: "low", reportedBy: ""
  })

  const mergedSeverities = useMemo(() => mergeOptions(DEFAULT_SEVERITIES, severityOptions), [severityOptions])

  useEffect(() => {
    if (data) {
      setForm({
        title: data.title || "",
        description: data.description || "",
        incidentDate: data.incidentDate ? new Date(data.incidentDate).toISOString().split('T')[0] : today(),
        location: data.location || "",
        severity: data.severity || "low",
        reportedBy: data.reportedBy || "",
        site: data.site || "",
      })
    } else {
      setForm({ title: "", description: "", incidentDate: today(), location: "", severity: "low", reportedBy: "" })
    }
  }, [data])

  const set = (k: keyof CreateIncidentDto, v: any) => setForm(f => ({ ...f, [k]: v }))

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg md:max-w-xl overflow-y-auto p-0">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/40 px-6 py-5">
          <SheetHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-xl bg-rose-100 text-rose-600">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <SheetTitle className="text-base">{mode === 'create' ? "Report Safety Incident" : "Edit Incident Details"}</SheetTitle>
            </div>
            <SheetDescription className="text-xs">Provide details about the safety incident or near-miss.</SheetDescription>
          </SheetHeader>
        </div>

        <form onSubmit={e => { e.preventDefault(); mutate(form) }} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Incident Title *</Label>
              <Input placeholder="Short summary" value={form.title} onChange={e => set("title", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Date *</Label>
              <Input type="date" value={form.incidentDate} onChange={e => set("incidentDate", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Severity *</Label>
              <SearchableSelect
                options={mergedSeverities}
                value={form.severity}
                onValueChange={v => set("severity", v)}
                onCreate={createSeverity}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Location / Site</Label>
              <Input placeholder="Rig Floor / Site A" value={form.location} onChange={e => set("location", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Reported By</Label>
              <Input placeholder="Name of reporter" value={form.reportedBy} onChange={e => set("reportedBy", e.target.value)} required />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Description *</Label>
              <Textarea placeholder="Details of what happened..." value={form.description} onChange={e => set("description", e.target.value)} required />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border/40 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending} className="bg-rose-600 hover:bg-rose-700 text-white font-bold">
              {isPending ? "Saving..." : mode === 'create' ? "Log Incident" : "Save Changes"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

function AuditDrawer({ open, onClose, data }: { open: boolean; onClose: () => void; data?: SafetyAudit | null }) {
  const qc = useQueryClient()
  const mode = data ? 'edit' : 'create'
  
  const { options: findingOptions, createOption: createFinding } = useDynamicDropdown("audit_finding")

  const { mutate, isPending } = useMutation({
    mutationFn: (dto: CreateAuditDto) => mode === 'create' ? hseApi.audits.create(dto) : hseApi.audits.update(data!.id, dto),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ["audits"] })
      toast.success(mode === 'create' ? "Audit logged" : "Audit updated")
      onClose() 
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Operation failed")
  })

  const [form, setForm] = useState<CreateAuditDto>({
    auditTitle: "", auditDate: today(), auditorName: "", findings: "compliant", score: 100
  })

  const mergedFindings = useMemo(() => mergeOptions(DEFAULT_FINDINGS, findingOptions), [findingOptions])

  useEffect(() => {
    if (data) {
      setForm({
        auditTitle: data.auditTitle || "",
        auditDate: data.auditDate ? new Date(data.auditDate).toISOString().split('T')[0] : today(),
        auditorName: data.auditorName || "",
        findings: data.findings || "compliant",
        score: Number(data.score) || 100,
        observations: data.observations || "",
        site: data.site || "",
      })
    } else {
      setForm({ auditTitle: "", auditDate: today(), auditorName: "", findings: "compliant", score: 100 })
    }
  }, [data])

  const set = (k: keyof CreateAuditDto, v: any) => setForm(f => ({ ...f, [k]: v }))

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg md:max-w-xl overflow-y-auto p-0">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/40 px-6 py-5">
          <SheetHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
                <ClipboardCheck className="w-4 h-4" />
              </div>
              <SheetTitle className="text-base">{mode === 'create' ? "Log Safety Audit" : "Edit Audit Details"}</SheetTitle>
            </div>
            <SheetDescription className="text-xs">Record safety audit findings and compliance score.</SheetDescription>
          </SheetHeader>
        </div>

        <form onSubmit={e => { e.preventDefault(); mutate(form) }} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Audit Title *</Label>
              <Input placeholder="Internal Safety Inspection" value={form.auditTitle} onChange={e => set("auditTitle", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Date *</Label>
              <Input type="date" value={form.auditDate} onChange={e => set("auditDate", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Auditor Name *</Label>
              <Input placeholder="John HSE" value={form.auditorName} onChange={e => set("auditorName", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Findings *</Label>
              <SearchableSelect
                options={mergedFindings}
                value={form.findings}
                onValueChange={v => set("findings", v)}
                onCreate={createFinding}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Score (0-100)</Label>
              <Input type="number" value={form.score} onChange={e => set("score", Number(e.target.value))} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Observations</Label>
              <Textarea placeholder="Observation notes..." value={form.observations} onChange={e => set("observations", e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border/40 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
              {isPending ? "Logging..." : mode === 'create' ? "Log Audit" : "Save Changes"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

function DrillDrawer({ open, onClose, data }: { open: boolean; onClose: () => void; data?: HseDrill | null }) {
  const qc = useQueryClient()
  const mode = data ? 'edit' : 'create'
  
  const { options: drillTypeOptions, createOption: createDrillType } = useDynamicDropdown("hse_drill_type")

  const { mutate, isPending } = useMutation({
    mutationFn: (dto: CreateDrillDto) => mode === 'create' ? hseApi.drills.create(dto) : hseApi.drills.update(data!.id, dto),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ["drills"] })
      toast.success(mode === 'create' ? "Drill logged" : "Drill updated")
      onClose() 
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Operation failed")
  })

  const [form, setForm] = useState<CreateDrillDto>({
    drillType: "Fire", drillDate: today(), location: "", participantsCount: 0
  })

  const mergedDrillTypes = useMemo(() => mergeOptions(DEFAULT_DRILL_TYPES, drillTypeOptions), [drillTypeOptions])

  useEffect(() => {
    if (data) {
      setForm({
        drillType: data.drillType || "Fire",
        drillDate: data.drillDate ? new Date(data.drillDate).toISOString().split('T')[0] : today(),
        location: data.location || "",
        participantsCount: Number(data.participantsCount) || 0,
        durationMinutes: Number(data.durationMinutes) || 0,
        supervisor: data.supervisor || "",
        outcome: data.outcome || "",
      })
    } else {
      setForm({ drillType: "Fire", drillDate: today(), location: "", participantsCount: 0 })
    }
  }, [data])

  const set = (k: keyof CreateDrillDto, v: any) => setForm(f => ({ ...f, [k]: v }))

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg md:max-w-xl overflow-y-auto p-0">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/40 px-6 py-5">
          <SheetHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-xl bg-orange-100 text-orange-600">
                <Flame className="w-4 h-4" />
              </div>
              <SheetTitle className="text-base">{mode === 'create' ? "Log HSE Drill" : "Edit Drill Details"}</SheetTitle>
            </div>
            <SheetDescription className="text-xs">Record outcome and participants of emergency response drills.</SheetDescription>
          </SheetHeader>
        </div>

        <form onSubmit={e => { e.preventDefault(); mutate(form) }} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Drill Type *</Label>
              <SearchableSelect
                options={mergedDrillTypes}
                value={form.drillType}
                onValueChange={v => set("drillType", v)}
                onCreate={createDrillType}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Date *</Label>
              <Input type="date" value={form.drillDate} onChange={e => set("drillDate", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Location *</Label>
              <Input placeholder="Site North" value={form.location} onChange={e => set("location", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Participants *</Label>
              <Input type="number" value={form.participantsCount} onChange={e => set("participantsCount", Number(e.target.value))} required />
            </div>
            <div className="space-y-1.5">
              <Label>Duration (Mins)</Label>
              <Input type="number" value={form.durationMinutes ?? ""} onChange={e => set("durationMinutes", Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>Supervisor</Label>
              <Input placeholder="Drill Master" value={form.supervisor ?? ""} onChange={e => set("supervisor", e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border/40 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending} className="bg-orange-600 hover:bg-orange-700 text-white font-bold">
              {isPending ? "Logging..." : mode === 'create' ? "Log Drill" : "Save Changes"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

export default function HseView() {
  const dispatch = useAppDispatch()
  const [activeTab, setActiveTab] = useState("incidents")
  const [dialog, setDialog] = useState<{ open: boolean, type: string, data: any }>({ open: false, type: "", data: null })
  const qc = useQueryClient()

  const { data: incidents, isLoading: incLoading } = useQuery({ queryKey: ["incidents"], queryFn: () => hseApi.incidents.list({ limit: 100 }) })
  const { data: audits, isLoading: audLoading } = useQuery({ queryKey: ["audits"], queryFn: () => hseApi.audits.list({ limit: 100 }) })
  const { data: drills, isLoading: drlLoading } = useQuery({ queryKey: ["drills"], queryFn: () => hseApi.drills.list({ limit: 100 }) })

  const { mutate: deleteIncident } = useMutation({ mutationFn: hseApi.incidents.delete, onSuccess: () => { qc.invalidateQueries({ queryKey: ["incidents"] }); toast.success("Incident removed") } })
  const { mutate: deleteAudit } = useMutation({ mutationFn: hseApi.audits.delete, onSuccess: () => { qc.invalidateQueries({ queryKey: ["audits"] }); toast.success("Audit removed") } })
  const { mutate: deleteDrill } = useMutation({ mutationFn: hseApi.drills.delete, onSuccess: () => { qc.invalidateQueries({ queryKey: ["drills"] }); toast.success("Drill removed") } })

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-rose-600 dark:text-rose-500">
            <ShieldAlert className="w-6 h-6" /> HSE & Safety Management
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track safety incidents, audits, and compliance drills</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => dispatch(openGlobalAnalytics({ module: 'hse', type: activeTab }))}
            className="border-rose-200 hover:bg-rose-50 text-rose-700 font-bold"
          >
            <BarChart3 className="w-4 h-4 mr-1.5" /> Analytics
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => dispatch(openGlobalHelp({ module: 'hse', section: activeTab }))}
            className="border-slate-200 hover:bg-slate-50 text-slate-700 font-bold"
          >
            <HelpCircle className="w-4 h-4 mr-1.5" /> Help
          </Button>
          <Button size="sm" onClick={() => setDialog({ open: true, type: activeTab, data: null })} className="bg-rose-600 hover:bg-rose-700 text-white font-bold">
             <Plus className="w-4 h-4 mr-1.5" /> 
             {activeTab === "incidents" ? "Log Incident" : activeTab === "audits" ? "Log Audit" : "Log Drill"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-rose-100 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-950/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-rose-600">Active Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-rose-700">{incidents?.data.filter(i => i.status !== "closed").length ?? 0}</div>
            <p className="text-[10px] font-bold text-rose-600/60 mt-1 uppercase tracking-wider">Requiring Investigation</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-950/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">Audit Score Avg</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-700">
              {audits?.data.length ? (audits.data.reduce((s, a) => s + a.score, 0) / audits.data.length).toFixed(1) : 0}%
            </div>
            <p className="text-[10px] font-bold text-emerald-600/60 mt-1 uppercase tracking-wider">Compliance Rating</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-amber-100 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-950/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-amber-600">Total Drills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-amber-700">{drills?.total ?? 0}</div>
            <p className="text-[10px] font-bold text-amber-600/60 mt-1 uppercase tracking-wider">Readiness Events</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 rounded-2xl p-1 bg-muted/50">
          <TabsTrigger value="incidents" className="rounded-xl flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" /> Incidents
          </TabsTrigger>
          <TabsTrigger value="audits" className="rounded-xl flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4" /> Safety Audits
          </TabsTrigger>
          <TabsTrigger value="drills" className="rounded-xl flex items-center gap-2">
            <Flame className="w-4 h-4" /> HSE Drills
          </TabsTrigger>
        </TabsList>

        {/* --- Incidents Content --- */}
        <TabsContent value="incidents">
          <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-black text-[10px] uppercase tracking-wider">Incident & Date</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-wider">Severity</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-wider">Location</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-wider">Reporter</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-wider">Status</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incLoading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-12">Loading Incidents...</TableCell></TableRow>
                ) : (incidents?.data ?? []).length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground italic">No incidents recorded.</TableCell></TableRow>
                ) : (incidents?.data.map(i => (
                  <TableRow key={i.id} className="group">
                    <TableCell>
                      <div className="font-bold text-sm">{i.title}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">{fmt(i.incidentDate)}</div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex text-[9px] font-black px-2 py-0.5 rounded-full border uppercase ${
                        i.severity === "critical" ? "bg-rose-100 text-rose-700 border-rose-200" :
                        i.severity === "high" ? "bg-orange-100 text-orange-700 border-orange-200" :
                        i.severity === "medium" ? "bg-amber-100 text-amber-700 border-amber-200" :
                        "bg-blue-100 text-blue-700 border-blue-200"
                      }`}>
                        {i.severity}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm font-medium">{i.location}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{i.reportedBy}</TableCell>
                    <TableCell>
                       <span className={`text-[10px] font-black uppercase ${
                         i.status === "open" ? "text-rose-600" : i.status === "investigating" ? "text-amber-600" : "text-emerald-600"
                       }`}>
                         {i.status}
                       </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => setDialog({ open: true, type: "incidents", data: i })}>
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-rose-600"
                          onClick={() => { if (confirm("Delete this incident?")) deleteIncident(i.id) }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* --- Audits Content --- */}
        <TabsContent value="audits">
          <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-black text-[10px] uppercase tracking-wider">Audit Title</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-wider">Date</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-wider">Auditor</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-wider">Score</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-wider">Findings</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {audLoading ? (
                   <TableRow><TableCell colSpan={6} className="text-center py-12">Loading Audits...</TableCell></TableRow>
                ) : (audits?.data ?? []).length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground italic">No audits performed.</TableCell></TableRow>
                ) : (audits?.data.map(a => (
                  <TableRow key={a.id}>
                    <TableCell className="font-bold text-sm">{a.auditTitle}</TableCell>
                    <TableCell className="text-sm">{fmt(a.auditDate)}</TableCell>
                    <TableCell className="text-sm">{a.auditorName}</TableCell>
                    <TableCell className={`font-black ${a.score >= 90 ? "text-emerald-600" : a.score >= 70 ? "text-amber-600" : "text-rose-600"}`}>
                      {a.score}%
                    </TableCell>
                    <TableCell>
                       <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                         {a.findings.replace("_", " ")}
                       </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => setDialog({ open: true, type: "audits", data: a })}>
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-rose-600"
                          onClick={() => { if (confirm("Delete this audit?")) deleteAudit(a.id) }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* --- Drills Content --- */}
        <TabsContent value="drills">
          <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-black text-[10px] uppercase tracking-wider">Drill Type</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-wider">Date</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-wider">Location</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-wider">Participants</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-wider">Duration</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drlLoading ? (
                   <TableRow><TableCell colSpan={6} className="text-center py-12">Loading Drills...</TableCell></TableRow>
                ) : (drills?.data ?? []).length === 0 ? (
                   <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground italic">No drills logged.</TableCell></TableRow>
                ) : (drills?.data.map(d => (
                  <TableRow key={d.id}>
                    <TableCell>
                      <div className="font-bold text-sm flex items-center gap-2">
                        <Flame className="w-3.5 h-3.5 text-orange-500" /> {d.drillType}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{fmt(d.drillDate)}</TableCell>
                    <TableCell className="text-sm font-medium">{d.location}</TableCell>
                    <TableCell className="text-sm font-black text-primary">{d.participantsCount}</TableCell>
                    <TableCell className="text-xs text-muted-foreground italic">
                      <div className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {d.durationMinutes} mins</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => setDialog({ open: true, type: "drills", data: d })}>
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-rose-600"
                          onClick={() => { if (confirm("Delete this drill?")) deleteDrill(d.id) }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {dialog.open && dialog.type === "incidents" && <IncidentDrawer open={dialog.open} onClose={() => setDialog({ open: false, type: "", data: null })} data={dialog.data} />}
      {dialog.open && dialog.type === "audits" && <AuditDrawer open={dialog.open} onClose={() => setDialog({ open: false, type: "", data: null })} data={dialog.data} />}
      {dialog.open && dialog.type === "drills" && <DrillDrawer open={dialog.open} onClose={() => setDialog({ open: false, type: "", data: null })} data={dialog.data} />}
    </div>
  )
}
