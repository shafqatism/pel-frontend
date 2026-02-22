"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { hseApi } from "@/lib/api/hse"
import type { Incident, SafetyAudit, HseDrill, CreateIncidentDto, CreateAuditDto, CreateDrillDto } from "@/lib/types/hse"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ShieldAlert, ShieldCheck, Flame, Plus, RefreshCw, AlertTriangle, 
  Search, HardHat, FileWarning, ClipboardCheck, Users, Clock, MapPin
} from "lucide-react"

const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
const today = () => new Date().toISOString().split("T")[0]

function AddIncidentDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient()
  const { mutate, isPending } = useMutation({
    mutationFn: (dto: CreateIncidentDto) => hseApi.incidents.create(dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["incidents"] }); onClose() },
  })

  const [form, setForm] = useState<CreateIncidentDto>({
    title: "", description: "", incidentDate: today(), location: "", severity: "low", reportedBy: ""
  })

  const set = (k: keyof CreateIncidentDto, v: any) => setForm(f => ({ ...f, [k]: v }))

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Report Safety Incident</DialogTitle></DialogHeader>
        <form onSubmit={e => { e.preventDefault(); mutate(form) }} className="space-y-4">
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
              <Select value={form.severity} onValueChange={v => set("severity", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
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
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Log Incident"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function AddAuditDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient()
  const { mutate, isPending } = useMutation({
    mutationFn: (dto: CreateAuditDto) => hseApi.audits.create(dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["audits"] }); onClose() },
  })
  const [form, setForm] = useState<CreateAuditDto>({
    auditTitle: "", auditDate: today(), auditorName: "", findings: "compliant", score: 100
  })
  const set = (k: keyof CreateAuditDto, v: any) => setForm(f => ({ ...f, [k]: v }))

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Log Safety Audit</DialogTitle></DialogHeader>
        <form onSubmit={e => { e.preventDefault(); mutate(form) }} className="space-y-4">
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
              <Select value={form.findings} onValueChange={v => set("findings", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="compliant">Compliant</SelectItem>
                  <SelectItem value="non_compliant">Non-Compliant</SelectItem>
                  <SelectItem value="improvement_needed">Improvement Needed</SelectItem>
                </SelectContent>
              </Select>
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
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Logging..." : "Log Audit"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function AddDrillDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient()
  const { mutate, isPending } = useMutation({
    mutationFn: (dto: CreateDrillDto) => hseApi.drills.create(dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["drills"] }); onClose() },
  })
  const [form, setForm] = useState<CreateDrillDto>({
    drillType: "Fire", drillDate: today(), location: "", participantsCount: 0
  })
  const set = (k: keyof CreateDrillDto, v: any) => setForm(f => ({ ...f, [k]: v }))

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Log HSE Drill</DialogTitle></DialogHeader>
        <form onSubmit={e => { e.preventDefault(); mutate(form) }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Drill Type *</Label>
              <Input placeholder="Fire / Spill / Medic" value={form.drillType} onChange={e => set("drillType", e.target.value)} required />
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
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Logging..." : "Log Drill"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function HseView() {
  const [activeTab, setActiveTab] = useState("incidents")
  const [showAdd, setShowAdd] = useState(false)

  const { data: incidents, isLoading: incLoading } = useQuery({ queryKey: ["incidents"], queryFn: () => hseApi.incidents.list({ limit: 100 }) })
  const { data: audits, isLoading: audLoading } = useQuery({ queryKey: ["audits"], queryFn: () => hseApi.audits.list({ limit: 100 }) })
  const { data: drills, isLoading: drlLoading } = useQuery({ queryKey: ["drills"], queryFn: () => hseApi.drills.list({ limit: 100 }) })

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-rose-600 dark:text-rose-500">
            <ShieldAlert className="w-6 h-6" /> HSE & Safety Management
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track safety incidents, audits, and compliance drills</p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)} className="bg-rose-600 hover:bg-rose-700 text-white font-bold">
           <Plus className="w-4 h-4 mr-1.5" /> 
           {activeTab === "incidents" ? "Log Incident" : activeTab === "audits" ? "Log Audit" : "Log Drill"}
        </Button>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {incLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-12">Loading Incidents...</TableCell></TableRow>
                ) : (incidents?.data ?? []).length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground italic">No incidents recorded.</TableCell></TableRow>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {audLoading ? (
                   <TableRow><TableCell colSpan={5} className="text-center py-12">Loading Audits...</TableCell></TableRow>
                ) : (audits?.data ?? []).length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground italic">No audits performed.</TableCell></TableRow>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {drlLoading ? (
                   <TableRow><TableCell colSpan={5} className="text-center py-12">Loading Drills...</TableCell></TableRow>
                ) : (drills?.data ?? []).length === 0 ? (
                   <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground italic">No drills logged.</TableCell></TableRow>
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
                    <TableCell className="text-xs text-muted-foreground italic flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> {d.durationMinutes} mins
                    </TableCell>
                  </TableRow>
                )))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {showAdd && activeTab === "incidents" && <AddIncidentDialog open={showAdd} onClose={() => setShowAdd(false)} />}
      {showAdd && activeTab === "audits" && <AddAuditDialog open={showAdd} onClose={() => setShowAdd(false)} />}
      {showAdd && activeTab === "drills" && <AddDrillDialog open={showAdd} onClose={() => setShowAdd(false)} />}
    </div>
  )
}
