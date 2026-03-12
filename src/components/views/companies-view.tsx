"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { companiesApi } from "@/lib/api/companies"
import { Attachment } from "@/lib/types/common"
import {
  Building2, Plus, Search, Filter, MoreHorizontal,
  Mail, Phone, MapPin, Edit, Trash2,
  CheckCircle2, ExternalLink, ArrowUpRight,
  Globe, RefreshCw, AlertCircle, Users, BarChart3, HelpCircle,
  Upload, Loader2, FileDown, FileText
} from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { useRef } from "react"
import Papa from "papaparse"
import type { CreateCompanyDto } from "@/lib/types/company"
import { MultiAttachmentUpload } from "@/components/common/multi-attachment-upload"
import { DataTable } from "@/components/ui/data-table"
import { getCompanyColumns } from "./core-columns"
import { useMemo } from "react"
import { useNav } from "@/lib/nav-context"
import { Button } from "@/components/ui/button"
import type { ReportConfig } from "@/components/common/record-report-modal"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

import { openGlobalAnalytics, openGlobalHelp } from "@/lib/store/slices/ui-slice"
import { useAppDispatch } from "@/lib/store"
import { ImportPreviewModal } from "@/components/common/import-preview-modal"

// ─── helpers ─────────────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  vendor:  "bg-blue-50 text-blue-700 border-blue-200",
  client:  "bg-amber-50 text-amber-700 border-amber-200",
  partner: "bg-purple-50 text-purple-700 border-purple-200",
}
const STATUS_COLORS: Record<string, string> = {
  active:   "bg-emerald-50 text-emerald-700 border-emerald-200",
  inactive: "bg-rose-50 text-rose-700 border-rose-200",
}
const LBL = "text-[10px] font-black uppercase tracking-widest text-muted-foreground"

// ─── Main View ────────────────────────────────────────────────────────────────
export default function CompaniesView() {
  const dispatch = useAppDispatch()
  const { setActive, setBreadcrumb, setMetadata } = useNav()
  const [search, setSearch]       = useState("")
  const [category, setCategory]   = useState("all")
  const [drawerOpen, setDrawer]   = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [importPreview, setImportPreview] = useState<{ open: boolean; data: any[]; columns: string[] }>({
    open: false,
    data: [],
    columns: [],
  })
  const qc = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ["companies", { search, category }],
    queryFn: () =>
      companiesApi.list({
        search: search || undefined,
        category: category === "all" ? undefined : category,
      }),
  })

  const deleteMut = useMutation({
    mutationFn: companiesApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["companies"] }); toast.success("Company removed") },
    onError:   () => toast.error("Failed to delete"),
  })

  const [reportRecord, setReportRecord] = useState<any | null>(null)

  const buildReport = (c: any): ReportConfig => ({
    title: "Company Record",
    subtitle: c.name,
    module: "Companies Module",
    badge: c.status,
    badgeColor: c.status === "active" ? "green" : "red",
    sections: [
      {
        title: "Organization Identity",
        color: "blue",
        fields: [
          { label: "Company Name", value: c.name },
          { label: "Category", value: c.category },
          { label: "Industry", value: c.industry },
          { label: "Reg. Number", value: c.registrationNumber },
          { label: "Tax ID / NTN", value: c.taxId },
          { label: "Website", value: c.website },
        ],
      },
      {
        title: "Contact Information",
        color: "emerald",
        fields: [
          { label: "Focal Person", value: c.contactPerson },
          { label: "Email", value: c.email },
          { label: "Phone", value: c.phone },
        ],
      },
      {
        title: "Location",
        color: "amber",
        fields: [
          { label: "City", value: c.city },
          { label: "Country", value: c.country },
          { label: "Address", value: c.address },
        ],
      },
    ],
    attachments: c.attachments ?? [],
  })

  const columns = useMemo(() => getCompanyColumns(
    (id) => openEdit(id),
    (id) => deleteMut.mutate(id),
    (company) => {
      setMetadata({ companyId: company.id, companyName: company.name })
      setBreadcrumb(["Projects Management", "Companies", "Report"])
      setActive("companies-report")
    }
  ), [deleteMut, setActive, setBreadcrumb, setMetadata])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { mutate: importCompanies, isPending: isImporting } = useMutation({
    mutationFn: (data: Partial<CreateCompanyDto>[]) => companiesApi.importBulk(data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["companies"] })
      toast.success(`Successfully imported ${res.count} companies`)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Import failed")
    }
  })

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    toast.info("Parsing CSV file...")
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const dtos: Partial<CreateCompanyDto>[] = []
        for (const row of results.data as any[]) {
          if (!row.name) continue
          dtos.push({
            name: row.name,
            email: row.email || undefined,
            phone: row.phone || undefined,
            contactPerson: row.contactPerson || undefined,
            category: (row.category || "vendor").toLowerCase() as any,
            status: (row.status || "active").toLowerCase() as any,
            industry: row.industry || undefined,
            website: row.website || undefined,
            registrationNumber: row.registrationNumber || undefined,
            taxId: row.taxId || undefined,
            city: row.city || undefined,
            country: row.country || "Pakistan",
            address: row.address || undefined
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

    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      toast.info(`Generating ${format.toUpperCase()}...`)
      const res = await companiesApi.reports.export(format)
      
      const blob = new Blob([res.data])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const ext = format === 'excel' ? 'xlsx' : format
      link.setAttribute('download', `PEL_Companies_${new Date().toISOString().slice(0, 10)}.${ext}`)
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

  const rows = data?.data ?? []

  const openNew  = () => { setEditingId(null); setDrawer(true) }
  const openEdit = (id: string) => { setEditingId(id); setDrawer(true) }
  const onSuccess = () => { setDrawer(false); setEditingId(null); qc.invalidateQueries({ queryKey: ["companies"] }) }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" /> Company Registry
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage vendors, clients, and partner organizations
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => dispatch(openGlobalAnalytics({ module: 'hr', type: 'companies' }))}
            className="border-primary/20 hover:bg-primary/5 text-primary font-black uppercase tracking-widest text-[10px] rounded-xl h-10 px-5"
          >
            <BarChart3 className="w-4 h-4 mr-2" /> Analytics
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => dispatch(openGlobalHelp({ module: 'hr', section: 'companies' }))}
            className="border-slate-200 hover:bg-slate-50 text-slate-700 font-black uppercase tracking-widest text-[10px] rounded-xl h-10 px-5"
          >
            <HelpCircle className="w-4 h-4 mr-2" /> Help
          </Button>
          <Button variant="outline" size="sm" onClick={() => qc.invalidateQueries({ queryKey: ["companies"] })} className="rounded-xl h-10 w-10 p-0 border-slate-200">
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
          
          <input type="file" accept=".csv" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
          <Button 
            disabled={isImporting}
            size="sm" 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()} 
            className="border-slate-200 hover:bg-slate-50 text-slate-700 font-black uppercase tracking-widest text-[10px] rounded-xl h-10 px-5"
          >
            {isImporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />} Import
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-slate-200 hover:bg-slate-50 text-slate-700 font-black uppercase tracking-widest text-[10px] rounded-xl h-10 px-5"
              >
                <FileDown className="w-4 h-4 mr-2" /> Export
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

          <Button onClick={openNew} className="font-black uppercase tracking-widest text-[10px] rounded-xl h-10 px-6 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4 mr-2" /> Register Company
          </Button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total",   value: data?.total ?? 0,                                                     icon: Building2,     color: "text-blue-600",   bg: "bg-blue-50" },
          { label: "Vendors", value: rows.filter(r => r.category === "vendor"  && r.status === "active").length, icon: CheckCircle2,  color: "text-emerald-600",bg: "bg-emerald-50" },
          { label: "Partners",value: rows.filter(r => r.category === "partner").length,                       icon: Globe,         color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Clients", value: rows.filter(r => r.category === "client").length,                        icon: Users,         color: "text-amber-600",  bg: "bg-amber-50" },
        ].map(s => (
          <Card key={s.label} className="rounded-2xl border-none shadow-sm bg-muted/30">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-2xl shrink-0 ${s.bg}`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className={`${LBL} text-[9px]`}>{s.label}</p>
                <p className="text-xl font-black">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Filters & Table ── */}
      <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">

        {/* toolbar */}
        <div className="p-4 border-b border-border/40 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search name, email, contact…"
              className="pl-9 rounded-xl h-9 border-border/40 bg-muted/20 text-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-[160px] rounded-xl h-9 border-border/40 bg-muted/20 text-sm">
              <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground shrink-0" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="vendor">Vendors</SelectItem>
              <SelectItem value="client">Clients</SelectItem>
              <SelectItem value="partner">Partners</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-[10px] font-black text-muted-foreground tracking-widest uppercase sm:ml-auto">
            {rows.length} record{rows.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* states */}
        {isLoading ? (
          <div className="py-24 text-center space-y-3">
            <Building2 className="w-10 h-10 mx-auto animate-bounce text-primary/20" />
            <p className={`${LBL}`}>Accessing registry…</p>
          </div>
        ) : isError ? (
          <div className="py-24 text-center space-y-3">
            <AlertCircle className="w-10 h-10 mx-auto text-rose-400" />
            <p className="font-bold text-rose-600">Failed to load companies</p>
          </div>
        ) : (
          <div className="p-1">
            <DataTable 
              columns={columns} 
              data={rows} 
              searchKey="name" 
            />
          </div>
        )}
      </Card>

      {/* ── Side Drawer Form ── */}
      <CompanyDrawer open={drawerOpen} onOpenChange={setDrawer} id={editingId} onSuccess={onSuccess} />

      <ImportPreviewModal
        open={importPreview.open}
        onOpenChange={(open) => setImportPreview((prev) => ({ ...prev, open }))}
        data={importPreview.data}
        columns={importPreview.columns}
        isLoading={isImporting}
        onConfirm={() => {
          importCompanies(importPreview.data)
          setImportPreview((prev) => ({ ...prev, open: false }))
        }}
        title="Preview Companies Import"
        description="Verify the organization details before registering them into the central registry."
      />
    </div>
  )
}

// ─── Company Drawer ────────────────────────────────────────────────────────────
function CompanyDrawer({
  open, onOpenChange, id, onSuccess,
}: { open: boolean; onOpenChange: (v: boolean) => void; id: string | null; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false)

  const { data: existing } = useQuery({
    queryKey: ["company-detail", id],
    queryFn:  () => (id ? companiesApi.get(id) : null),
    enabled:  !!id,
  })

  const [attachments, setAttachments] = useState<Attachment[]>([])

  useEffect(() => {
    if (open) {
      if (existing?.attachments) {
        setAttachments(existing.attachments)
      } else {
        setAttachments([])
      }
    }
  }, [existing, open])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = Object.fromEntries(new FormData(e.currentTarget))
    const payload: any = { attachments }
    for (const [key, value] of Object.entries(formData)) {
      if (typeof value === "string" && value.trim() === "") continue
      payload[key] = value
    }
    try {
      if (id) {
        await companiesApi.update(id, payload as any)
        toast.success("Company updated")
      } else {
        await companiesApi.create(payload as any)
        toast.success("Company registered")
      }
      onSuccess()
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to save"
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl p-0 gap-0 overflow-hidden flex flex-col">

        {/* Header */}
        <div className="px-6 py-5 border-b border-border/40 bg-muted/20">
          <SheetHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <SheetTitle className="text-base font-black uppercase tracking-tight">
                  {id ? "Update Organization" : "Register New Company"}
                </SheetTitle>
                <SheetDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">
                  {id ? "Edit organization details" : "Fill in the organization details below"}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
        </div>

        {/* Form body — scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">


            {/* Section: Identity */}
            <section className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary border-l-2 border-primary pl-2">
                Organization Identity
              </p>

              <div className="grid gap-2">
                <Label htmlFor="name" className={LBL}>Official Company Name <span className="text-rose-500">*</span></Label>
                <Input
                  id="name" name="name" required
                  defaultValue={existing?.name}
                  placeholder="e.g. Petroleum Logistics Ltd."
                  className="rounded-xl h-10 border-border/50 focus-visible:ring-primary/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category" className={LBL}>Organization Type</Label>
                  <Select name="category" defaultValue={existing?.category ?? "vendor"}>
                    <SelectTrigger id="category" className="rounded-xl h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vendor">Vendor</SelectItem>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="partner">Partner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status" className={LBL}>Status</Label>
                  <Select name="status" defaultValue={existing?.status ?? "active"}>
                    <SelectTrigger id="status" className="rounded-xl h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="registrationNumber" className={LBL}>Registration Number</Label>
                  <Input id="registrationNumber" name="registrationNumber" defaultValue={existing?.registrationNumber} placeholder="SEC-00123" className="rounded-xl h-10 border-border/50" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="taxId" className={LBL}>Tax ID / NTN</Label>
                  <Input id="taxId" name="taxId" defaultValue={existing?.taxId} placeholder="1234567-8" className="rounded-xl h-10 border-border/50" />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="industry" className={LBL}>Industry</Label>
                <Input id="industry" name="industry" defaultValue={existing?.industry} placeholder="e.g. Energy, Logistics, Safety…" className="rounded-xl h-10 border-border/50" />
              </div>
            </section>

            <Separator />

            {/* Section: Contact */}
            <section className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary border-l-2 border-primary pl-2">
                Contact Information
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email" className={LBL}>Corporate Email</Label>
                  <Input id="email" name="email" type="email" defaultValue={existing?.email} placeholder="contact@company.com" className="rounded-xl h-10 border-border/50" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone" className={LBL}>Phone / Ext.</Label>
                  <Input id="phone" name="phone" defaultValue={existing?.phone} placeholder="+92 21 …" className="rounded-xl h-10 border-border/50" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="contactPerson" className={LBL}>Focal Person / Manager</Label>
                  <Input id="contactPerson" name="contactPerson" defaultValue={existing?.contactPerson} placeholder="Full name" className="rounded-xl h-10 border-border/50" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="website" className={LBL}>Website URL</Label>
                  <Input id="website" name="website" type="url" defaultValue={existing?.website} placeholder="https://…" className="rounded-xl h-10 border-border/50" />
                </div>
              </div>
            </section>

            <Separator />

            {/* Section: Location */}
            <section className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary border-l-2 border-primary pl-2">
                Location & Address
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="city" className={LBL}>City</Label>
                  <Input id="city" name="city" defaultValue={existing?.city} placeholder="City name" className="rounded-xl h-10 border-border/50" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="country" className={LBL}>Country</Label>
                  <Input id="country" name="country" defaultValue={existing?.country ?? "Pakistan"} className="rounded-xl h-10 border-border/50" />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address" className={LBL}>Street / Office Address</Label>
                <Input id="address" name="address" defaultValue={existing?.address} placeholder="Plot #, Street, Area…" className="rounded-xl h-10 border-border/50" />
              </div>
            </section>

            <Separator />

            {/* Section: Attachments */}
            <section className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary border-l-2 border-primary pl-2">
                Corporate Documents & legal Papers
              </p>
              <div className="grid gap-2">
                <p className="text-xs text-muted-foreground mb-2">Upload registration certificates, tax documents, or agreements.</p>
                <MultiAttachmentUpload
                  value={attachments}
                  onChange={setAttachments}
                  module="companies"
                />
              </div>
            </section>
          </div>

          {/* ── Sticky footer ── */}
          <div className="px-6 py-4 border-t border-border/40 bg-muted/10 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl font-bold"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-xl font-black uppercase tracking-widest text-xs gap-2 shadow-lg shadow-primary/20"
            >
              {loading
                ? <RefreshCw className="w-4 h-4 animate-spin" />
                : <CheckCircle2 className="w-4 h-4" />}
              {id ? "Save Changes" : "Register Company"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
