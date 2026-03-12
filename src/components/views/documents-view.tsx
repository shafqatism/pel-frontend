"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { documentsApi } from "@/lib/api/documents"
import type { Document, CreateDocumentDto } from "@/lib/types/documents"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  FileText, Plus, RefreshCw, AlertTriangle, Trash2, Search,
  Download, FileCheck, FileWarning, Shield, FolderOpen,
  Briefcase, MapPin, Calendar, Clock, Tag, BarChart3, HelpCircle,
  Edit2, Star, DollarSign, X, MoreHorizontal, Edit
} from "lucide-react"
import { openGlobalAnalytics, openGlobalHelp } from "@/lib/store/slices/ui-slice"
import { useAppDispatch } from "@/lib/store"
import { MultiAttachmentUpload } from "@/components/common/multi-attachment-upload"
import { toast } from "sonner"
import { DataTable } from "@/components/ui/data-table"
import { getDocumentColumns } from "./core-columns"
import { useMemo } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const categories = [
  { id: "sop", label: "SOPs", icon: Shield, color: "text-blue-600", bg: "bg-blue-50" },
  { id: "report", label: "Reports", icon: FileCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
  { id: "certificate", label: "Certificates", icon: FileText, color: "text-amber-600", bg: "bg-amber-50" },
  { id: "legal", label: "Legal Items", icon: FileWarning, color: "text-rose-600", bg: "bg-rose-50" },
  { id: "other", label: "General", icon: FolderOpen, color: "text-gray-600", bg: "bg-gray-50" },
]

function DocumentDrawer({ open, onClose, data }: { open: boolean; onClose: () => void; data?: Document | null }) {
  const mode = data ? 'edit' : 'create'
  const qc = useQueryClient()
  const { mutate, isPending } = useMutation({
    mutationFn: (dto: CreateDocumentDto) => mode === 'create' ? documentsApi.documents.create(dto) : documentsApi.documents.update(data!.id, dto),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ["documents"] })
      toast.success(mode === 'create' ? "Document registered" : "Document updated")
      onClose() 
    },
  })

  const [form, setForm] = useState<CreateDocumentDto>({
    title: "", category: "other", fileUrl: "https://", description: "",
    attachments: []
  })

  useEffect(() => {
    if (open) {
      if (data) {
        setForm({
          title: data.title || "",
          category: data.category || "other",
          fileUrl: data.fileUrl || "https://",
          description: data.description || "",
          department: data.department || "",
          site: data.site || "",
          tags: data.tags || [],
          attachments: data.attachments || []
        })
      } else {
        setForm({ title: "", category: "other", fileUrl: "https://", description: "", attachments: [] })
      }
    }
  }, [data, open])

  const set = (k: keyof CreateDocumentDto, v: any) => setForm(f => ({ ...f, [k]: v }))

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg md:max-w-xl overflow-y-auto p-0">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/40 px-6 py-5">
          <SheetHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <FileText className="w-4 h-4" />
              </div>
              <SheetTitle className="text-base">{mode === 'create' ? "Register New Document" : "Edit Document Details"}</SheetTitle>
            </div>
            <SheetDescription className="text-xs">{mode === 'create' ? "Upload or link a new SOP, report, or certificate to the vault." : "Update metadata and associated files for this document."}</SheetDescription>
          </SheetHeader>
        </div>

        <form onSubmit={e => { e.preventDefault(); mutate(form) }} className="p-6 space-y-4">
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label>Document Title *</Label>
              <Input placeholder="e.g., HSE Manual 2026" value={form.title} onChange={e => set("title", e.target.value)} required />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Category *</Label>
                <Select value={form.category} onValueChange={v => set("category", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Department</Label>
                <Input placeholder="HSE / Operations" value={form.department ?? ""} onChange={e => set("department", e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>File URL *</Label>
              <div className="flex gap-2">
                <Input placeholder="Direct link to storage/PDF" value={form.fileUrl} onChange={e => set("fileUrl", e.target.value)} required />
              </div>
              <p className="text-[10px] text-muted-foreground italic">Integration with cloud storage (S3/Azure) coming soon.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Site Mapping</Label>
                <Input placeholder="Site Alpha" value={form.site ?? ""} onChange={e => set("site", e.target.value)} />
              </div>
               <div className="space-y-1.5">
                <Label>Tags (Comma separated)</Label>
                <Input placeholder="Safety, SOP, Annual" value={form.tags?.join(", ") || ""} onChange={e => set("tags", e.target.value.split(",").map(t => t.trim()))} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea placeholder="Scope and version details..." value={form.description ?? ""} onChange={e => set("description", e.target.value)} rows={2} />
            </div>
          </div>

          <div className="pt-4 border-t border-border/40 mt-4">
            <Label className="text-sm font-semibold mb-2 block">Associated Files & Version History</Label>
            <p className="text-xs text-muted-foreground mb-4">Attach version revisions, relevant spreadsheets, or supporting media.</p>
            <MultiAttachmentUpload
              value={form.attachments || []}
              onChange={(val) => set("attachments", val)}
              module="documents"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border/40 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending} className="font-bold">
              {isPending ? "Saving..." : mode === 'create' ? "Save Document" : "Update Records"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

export default function DocumentsView() {
  const dispatch = useAppDispatch()
  const [dialog, setDialog] = useState<{ open: boolean; data: Document | null }>({ open: false, data: null })
  const [filter, setFilter] = useState("all")
  const qc = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["documents", filter],
    queryFn: () => documentsApi.documents.list(filter !== "all" ? { category: filter, limit: 100 } : { limit: 100 }),
  })

  const { mutate: del } = useMutation({
    mutationFn: (id: string) => documentsApi.documents.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["documents"] }),
  })

  const columns = useMemo(() => getDocumentColumns(
    (id, data) => setDialog({ open: true, data }),
    (id) => { if (confirm("Archive this document permanently?")) del(id) },
    categories
  ), [del])

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-primary" />
            Document Storage
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Centralized repository for certificates, SOPs, and field records</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => dispatch(openGlobalAnalytics({ module: 'documents', type: 'documents' }))}
            className="border-primary/20 hover:bg-primary/5 text-primary font-bold"
          >
            <BarChart3 className="w-4 h-4 mr-1.5" /> Analytics
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => dispatch(openGlobalHelp({ module: 'documents', section: 'documents' }))}
            className="border-slate-200 hover:bg-slate-50 text-slate-700 font-bold"
          >
            <HelpCircle className="w-4 h-4 mr-1.5" /> Help
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="w-3.5 h-3.5 mr-1.5" />Refresh</Button>
          <Button size="sm" onClick={() => setDialog({ open: true, data: null })} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> New Record
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {categories.map(c => (
          <button
            key={c.id}
            onClick={() => setFilter(filter === c.id ? "all" : c.id)}
            className={`p-4 rounded-2xl border transition-all text-left group hover:shadow-md ${
              filter === c.id ? `${c.bg} border-primary/50 ring-1 ring-primary/20` : "bg-white dark:bg-black/20 border-border/50"
            }`}
          >
            <c.icon className={`w-5 h-5 mb-2 ${c.color} group-hover:scale-110 transition-transform`} />
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground">
              {c.label}
            </p>
          </button>
        ))}
      </div>

      <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden bg-white/50 dark:bg-black/20 backdrop-blur-sm">
        <div className="p-4 border-b border-border/30 flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search document titles..." className="pl-10 h-9 rounded-xl border-border/40 bg-white/40" />
          </div>
          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{data?.total ?? 0} ITEMS TOTAL</p>
        </div>
        
        {isLoading ? (
          <div className="py-24 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Synchronizing Document Vault…</p>
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
              searchKey="title"
            />
          </div>
        )}
      </Card>

      <DocumentDrawer 
        open={dialog.open} 
        onClose={() => setDialog({ open: false, data: null })} 
        data={dialog.data}
      />
    </div>
  )
}
