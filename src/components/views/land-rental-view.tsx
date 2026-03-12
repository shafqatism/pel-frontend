"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { landRentalApi } from "@/lib/api/land-rental"
import { sitesApi } from "@/lib/api/sites"
import { Attachment } from "@/lib/types/common"
import type { LandRental, CreateLandRentalDto } from "@/lib/types/land-rental"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { openGlobalAnalytics, openGlobalHelp } from "@/lib/store/slices/ui-slice"
import { useAppDispatch } from "@/lib/store"
import { MultiAttachmentUpload } from "@/components/common/multi-attachment-upload"
import { ImportPreviewModal } from "@/components/common/import-preview-modal"
import { 
  Landmark, BarChart3, HelpCircle, RefreshCw, Plus, FileText, MapPin, 
  DollarSign, AlertTriangle, Edit2, MoreHorizontal, Edit, Trash2,
  Upload, Loader2, FileDown
} from "lucide-react"
import { useRef } from "react"
import Papa from "papaparse"
import { sitesApi as sitesApiOriginal } from "@/lib/api/sites"
import { toast } from "sonner"
import { DataTable } from "@/components/ui/data-table"
import { getLandRentalColumns } from "./core-columns"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
const today = () => new Date().toISOString().split("T")[0]

function RentalDrawer({ open, onClose, data }: { open: boolean; onClose: () => void; data?: LandRental | null }) {
  const mode = data ? 'edit' : 'create'
  const qc = useQueryClient()
  const { mutate, isPending } = useMutation({
    mutationFn: (dto: CreateLandRentalDto) => mode === 'create' ? landRentalApi.rentals.create(dto) : landRentalApi.rentals.update(data!.id, dto),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ["land-rentals"] })
      toast.success(mode === 'create' ? "Agreement registered" : "Agreement updated")
      onClose() 
    },
  })

  const [form, setForm] = useState<CreateLandRentalDto>({
    landOwnerName: "", location: "", yearlyRent: 0, leaseStartDate: today(), status: "active",
    attachments: [], siteId: ""
  })

  const { data: sitesData } = useQuery({
    queryKey: ["sites-dropdown"],
    queryFn: () => sitesApi.sites.list({ limit: 1000 }),
  })

  const siteOptions = useMemo(() => 
    (sitesData?.data || []).map(s => ({ label: s.siteName, value: s.id })),
    [sitesData]
  )

  useEffect(() => {
    if (open) {
      if (data) {
        setForm({
          landOwnerName: data.landOwnerName || "",
          landOwnerCnic: data.landOwnerCnic || "",
          cnicExpiryDate: data.cnicExpiryDate ? new Date(data.cnicExpiryDate).toISOString().split('T')[0] : "",
          landOwnerPhone: data.landOwnerPhone || "",
          location: data.location || "",
          district: data.district || "",
          province: data.province || "",
          areaAcres: Number(data.areaAcres) || 0,
          yearlyRent: Number(data.yearlyRent) || 0,
          leaseStartDate: data.leaseStartDate ? new Date(data.leaseStartDate).toISOString().split('T')[0] : today(),
          leaseEndDate: data.leaseEndDate ? new Date(data.leaseEndDate).toISOString().split('T')[0] : "",
          siteId: data.siteId || "",
          site: typeof data.site === 'string' ? data.site : data.site?.siteName || "",
          status: data.status || "active",
          purpose: data.purpose || "",
          attachments: data.attachments || []
        })
      } else {
        setForm({ landOwnerName: "", location: "", yearlyRent: 0, leaseStartDate: today(), status: "active", attachments: [], siteId: "" })
      }
    }
  }, [data, open])

  const set = (k: keyof CreateLandRentalDto, v: any) => setForm(f => ({ ...f, [k]: v }))

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg md:max-w-xl overflow-y-auto p-0">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/40 px-6 py-5">
          <SheetHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Landmark className="w-4 h-4" />
              </div>
              <SheetTitle className="text-base">{mode === 'create' ? "New Land Lease Agreement" : "Edit lease Agreement"}</SheetTitle>
            </div>
            <SheetDescription className="text-xs">{mode === 'create' ? "Register a new land lease agreement for drilling or operational needs." : "Update project site land lease details and terms."}</SheetDescription>
          </SheetHeader>
        </div>

        <form onSubmit={e => { e.preventDefault(); mutate(form) }} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Owner Name *</Label>
              <Input placeholder="Full name of owner" value={form.landOwnerName} onChange={e => set("landOwnerName", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Owner CNIC</Label>
              <Input placeholder="00000-0000000-0" value={form.landOwnerCnic ?? ""} onChange={e => set("landOwnerCnic", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>CNIC Expiry Date</Label>
              <Input type="date" value={form.cnicExpiryDate ?? ""} onChange={e => set("cnicExpiryDate", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Owner Phone</Label>
              <Input placeholder="+92 300 1234567" value={form.landOwnerPhone ?? ""} onChange={e => set("landOwnerPhone", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Lease Location *</Label>
              <Input placeholder="Block / Site name" value={form.location} onChange={e => set("location", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>District</Label>
              <Input placeholder="District" value={form.district ?? ""} onChange={e => set("district", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Province</Label>
              <Input placeholder="Province" value={form.province ?? ""} onChange={e => set("province", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Area (Acres)</Label>
              <Input type="number" step="0.01" value={form.areaAcres || ""} onChange={e => set("areaAcres", Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>Yearly Rent (PKR) *</Label>
              <Input type="number" value={form.yearlyRent || ""} onChange={e => set("yearlyRent", Number(e.target.value))} required />
            </div>
            <div className="space-y-1.5">
              <Label>Lease Start Date *</Label>
              <Input type="date" value={form.leaseStartDate} onChange={e => set("leaseStartDate", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Lease End Date</Label>
              <Input type="date" value={form.leaseEndDate ?? ""} onChange={e => set("leaseEndDate", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Project Site Assignment</Label>
              <SearchableSelect
                options={siteOptions}
                value={form.siteId}
                onValueChange={v => set("siteId", v)}
                placeholder="Select project site..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Purpose of Lease</Label>
              <Textarea placeholder="Drilling pad, storage, access road, etc." value={form.purpose ?? ""} onChange={e => set("purpose", e.target.value)} rows={3} />
            </div>
          </div>

          <div className="pt-4 border-t border-border/40 mt-4">
            <Label className="text-sm font-semibold mb-2 block">Lease Contracts & Ownership Docs</Label>
            <p className="text-xs text-muted-foreground mb-4">Attach scan of lease agreement, land ownership papers, and owner CNIC.</p>
            <MultiAttachmentUpload
              value={form.attachments || []}
              onChange={(val) => set("attachments", val)}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border/40 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending} className="font-bold">
              {isPending ? "Saving..." : mode === 'create' ? "Create Agreement" : "Update Agreement"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

export default function LandRentalView() {
  const dispatch = useAppDispatch()
  const [dialog, setDialog] = useState<{ open: boolean; data: LandRental | null }>({ open: false, data: null })
  const [importPreview, setImportPreview] = useState<{ open: boolean; data: any[]; columns: string[] }>({
    open: false,
    data: [],
    columns: [],
  })
  const qc = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["land-rentals"],
    queryFn: () => landRentalApi.rentals.list({ limit: 100 }),
  })

  const { mutate: del } = useMutation({
    mutationFn: (id: string) => landRentalApi.rentals.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["land-rentals"] }),
  })

  const columns = useMemo(() => getLandRentalColumns(
    (id, data) => setDialog({ open: true, data }),
    (id) => { if (confirm("Terminate this agreement?")) del(id) },
    fmt
  ), [del])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { mutate: importRentals, isPending: isImporting } = useMutation({
    mutationFn: (data: Partial<CreateLandRentalDto>[]) => landRentalApi.rentals.importBulk(data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["land-rentals"] })
      toast.success(`Successfully imported ${res.count} agreements`)
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
      const sitesReq = await sitesApi.sites.list({ limit: 1000 })
      const sites = sitesReq.data

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const dtos: Partial<CreateLandRentalDto>[] = []
          for (const row of results.data as any[]) {
            if (!row.landOwnerName) continue
            
            let siteId = undefined
            if (row.siteName) {
              const s = sites.find(x => x.siteName.toLowerCase() === String(row.siteName).toLowerCase())
              if (s) siteId = s.id
            }

            dtos.push({
              landOwnerName: row.landOwnerName,
              landOwnerCnic: row.landOwnerCnic || undefined,
              cnicExpiryDate: row.cnicExpiryDate || undefined,
              landOwnerPhone: row.landOwnerPhone || undefined,
              location: row.location || "",
              district: row.district || undefined,
              province: row.province || undefined,
              areaAcres: row.areaAcres ? Number(row.areaAcres) : undefined,
              yearlyRent: Number(row.yearlyRent || 0),
              leaseStartDate: row.leaseStartDate || today(),
              leaseEndDate: row.leaseEndDate || undefined,
              status: (row.status || "active").toLowerCase() as any,
              purpose: row.purpose || undefined,
              siteId
            })
          }
        if (dtos.length === 0) {
            toast.error("No valid records found. Ensure 'landOwnerName' is present.")
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
      const res = await landRentalApi.reports.export(format)
      
      const blob = new Blob([res.data])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const ext = format === 'excel' ? 'xlsx' : format
      link.setAttribute('download', `PEL_LandRentals_${new Date().toISOString().slice(0, 10)}.${ext}`)
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

  const totalYearlyLoad = data?.data.reduce((s, r) => s + Number(r.yearlyRent), 0) ?? 0

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Landmark className="w-6 h-6 text-primary" />
            Land Rental Management
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track land lease agreements, payments, and site acquisitions</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => dispatch(openGlobalAnalytics({ module: 'rental', type: 'rental' }))}
            className="border-primary/20 hover:bg-primary/5 text-primary font-bold"
          >
            <BarChart3 className="w-4 h-4 mr-1.5" /> Analytics
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => dispatch(openGlobalHelp({ module: 'rental', section: 'rental' }))}
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
                className="border-slate-200 hover:bg-slate-50 text-slate-700 font-bold"
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

          <Button size="sm" onClick={() => setDialog({ open: true, data: null })} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> New Agreement
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Active Agreements", value: data?.data.filter(r => r.status === "active").length ?? 0, icon: FileText, color: "text-blue-600" },
          { label: "Total Area (Acres)", value: (data?.data.reduce((s, r) => s + (r.areaAcres ? Number(r.areaAcres) : 0), 0) ?? 0).toFixed(1), icon: MapPin, color: "text-amber-600" },
          { label: "Yearly Rent Load", value: `PKR ${totalYearlyLoad.toLocaleString()}`, icon: DollarSign, color: "text-emerald-600" },
        ].map(s => (
          <Card key={s.label} className="rounded-2xl border-border/50 shadow-sm transition-all hover:shadow-md">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-muted/50">
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{s.label}</p>
                <p className={`text-xl font-black mt-0.5 ${s.color}`}>{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden bg-white/50 dark:bg-black/20 backdrop-blur-sm">
        {isLoading ? (
          <div className="py-24 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Analyzing Land Registry…</p>
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
              searchKey="landOwnerName"
            />
          </div>
        )}
      </Card>

      <RentalDrawer 
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
          importRentals(importPreview.data)
          setImportPreview((prev) => ({ ...prev, open: false }))
        }}
        title="Preview Land Rental Import"
        description="Verify the lease agreements and site assignments before committing to the registry."
      />
    </div>
  )
}
