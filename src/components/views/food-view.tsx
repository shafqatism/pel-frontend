"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, useEffect, useRef, useMemo } from "react"
import Papa from "papaparse"
import { foodApi } from "@/lib/api/food"
import { sitesApi } from "@/lib/api/sites"
import { hrApi } from "@/lib/api/hr"
import type { FoodMessRecord, CreateFoodMessDto } from "@/lib/types/food"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { openGlobalAnalytics, openGlobalHelp } from "@/lib/store/slices/ui-slice"
import { useAppDispatch } from "@/lib/store"
import { MultiAttachmentUpload } from "@/components/common/multi-attachment-upload"
import { 
  UtensilsCrossed, Users, RefreshCw, AlertTriangle, Plus, Star, DollarSign, 
  BarChart3, HelpCircle, X, MoreHorizontal, Edit, Trash2, Edit2, Upload, Loader2
} from "lucide-react"
import { toast } from "sonner"
import { DataTable } from "@/components/ui/data-table"
import { ImportPreviewModal } from "@/components/common/import-preview-modal"
import { getFoodColumns } from "./core-columns"
const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
const today = () => new Date().toISOString().split("T")[0]

function FoodRecordDrawer({ open, onClose, data, type = 'single' }: { 
  open: boolean; 
  onClose: () => void; 
  data?: FoodMessRecord | null; 
  type?: 'single' | 'bulk' 
}) {
  const mode = data ? 'edit' : type === 'bulk' ? 'bulk' : 'create'
  const qc = useQueryClient()
  const [bulkLoading, setBulkLoading] = useState(false)

  // Menu Items as array of tags
  const [menuTags, setMenuTags] = useState<string[]>([])
  const [menuInput, setMenuInput] = useState("")
  const menuInputRef = useRef<HTMLInputElement>(null)

  const { data: sitesRaw } = useQuery({
    queryKey: ["sites", "dropdown"],
    queryFn: sitesApi.sites.dropdown,
  })
  const siteOptions = (sitesRaw ?? []).map(s => ({ label: s.siteName, value: s.siteName }))

  const { mutate, isPending } = useMutation({
    mutationFn: (dto: CreateFoodMessDto) =>
      mode === 'create' ? foodApi.records.create(dto) : foodApi.records.update(data!.id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["food"] })
      toast.success(mode === 'create' ? "Meal record logged" : "Meal record updated")
      onClose()
    },
  })

  const [form, setForm] = useState<CreateFoodMessDto>({
    date: today(), mealType: "lunch", headCount: 0, costPerHead: 0, totalCost: 0,
    attachments: []
  })

  // Bulk state
  const [bulkMealData, setBulkMealData] = useState<Record<string, { menu: string; cost: number; rating: number }>>({
    breakfast: { menu: "", cost: 0, rating: 5 },
    lunch: { menu: "", cost: 0, rating: 5 },
    dinner: { menu: "", cost: 0, rating: 5 }
  })

  useEffect(() => {
    if (open) {
      if (data) {
        const tags = data.menuItems
          ? data.menuItems.split(",").map(t => t.trim()).filter(Boolean)
          : []
        setMenuTags(tags)
        setForm({
          date: data.date ? new Date(data.date).toISOString().split('T')[0] : today(),
          mealType: data.mealType || "lunch",
          headCount: Number(data.headCount) || 0,
          costPerHead: Number(data.costPerHead) || 0,
          totalCost: Number(data.totalCost) || 0,
          site: data.site || "",
          rating: Number(data.rating) || 0,
          preparedBy: data.preparedBy || "",
          menuItems: data.menuItems || "",
          remarks: data.remarks || "",
          attachments: data.attachments || []
        })
      } else {
        setMenuTags([])
        setMenuInput("")
        setForm({ date: today(), mealType: "lunch", headCount: 0, costPerHead: 0, totalCost: 0, attachments: [] })
      }
    }
  }, [data, open])

  // Auto-count headcount from attendance
  const { data: hcData } = useQuery({
    queryKey: ["attendance-headcount", form.site, form.date],
    queryFn: () => hrApi.attendance.getHeadcount(form.site!, form.date),
    enabled: !!form.site && !!form.date && mode === 'create',
  })

  useEffect(() => {
    if (hcData?.count !== undefined && mode === 'create') {
      set("headCount", hcData.count)
    }
  }, [hcData, mode])

  const set = (k: keyof CreateFoodMessDto, v: any) => {
    setForm(f => {
      const next = { ...f, [k]: v }
      if (k === "headCount" || k === "costPerHead") {
        next.totalCost = Number(next.headCount || 0) * Number(next.costPerHead || 0)
      }
      return next
    })
  }

  const addMenuTag = (raw: string) => {
    const items = raw.split(/[,،]/).map(t => t.trim()).filter(Boolean)
    if (!items.length) return
    setMenuTags(prev => {
      const next = [...prev]
      items.forEach(item => { if (!next.includes(item)) next.push(item) })
      return next
    })
    setMenuInput("")
  }

  const removeMenuTag = (tag: string) => setMenuTags(prev => prev.filter(t => t !== tag))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'bulk') {
      const dtos: CreateFoodMessDto[] = Object.entries(bulkMealData).map(([type, d]) => ({
        date: form.date,
        site: form.site,
        mealType: type as any,
        headCount: form.headCount,
        costPerHead: d.cost,
        totalCost: form.headCount * d.cost,
        menuItems: d.menu,
        rating: d.rating,
        attachments: form.attachments
      }))
      setBulkLoading(true)
      try {
        await foodApi.records.bulkCreate(dtos)
        qc.invalidateQueries({ queryKey: ["food"] })
        toast.success("All daily meals recorded")
        onClose()
      } catch {
        toast.error("Failed to log bulk records")
      } finally {
        setBulkLoading(false)
      }
    } else {
      mutate({ ...form, menuItems: menuTags.join(", ") })
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg md:max-w-xl overflow-y-auto p-0">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/40 px-6 py-5">
          <SheetHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <SheetTitle className="text-base">
                {mode === 'edit' ? "Edit Mess Record" : mode === 'bulk' ? "Bulk Log Daily Meals" : "Log Daily Mess Record"}
              </SheetTitle>
            </div>
            <SheetDescription className="text-xs">
              {mode === 'edit' ? "Update catering details and quality ratings for this meal." : 
               mode === 'bulk' ? "Log Breakfast, Lunch, and Dinner for a site in one go." :
               "Record daily catering details, headcount, and quality ratings."}
            </SheetDescription>
          </SheetHeader>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Date *</Label>
              <Input type="date" value={form.date} onChange={e => set("date", e.target.value)} required />
            </div>
            
            {mode !== 'bulk' ? (
              <div className="space-y-1.5">
                <Label>Meal Type *</Label>
                <Select value={form.mealType} onValueChange={v => set("mealType", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label>Log Mode</Label>
                <Badge variant="outline" className="h-10 w-full justify-center bg-primary/5 text-primary border-primary/20 font-bold uppercase tracking-wider">
                  3 Meals / Day
                </Badge>
              </div>
            )}

            {/* ── Site / Location ── */}
            <div className="col-span-2 space-y-1.5">
              <Label>Site / Location</Label>
              <SearchableSelect
                options={siteOptions}
                value={form.site ?? ""}
                onValueChange={v => set("site", v)}
                placeholder={!sitesRaw ? "Loading sites..." : "Select a site..."}
              />
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label>Daily Attendance Headcount (Present Staff)</Label>
              <div className="relative">
                <Input type="number" value={form.headCount || ""} onChange={e => set("headCount", Number(e.target.value))} required className="pr-24" />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-[10px] font-black uppercase text-primary/50 tracking-tighter">Auto-Synced</span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground italic flex items-center gap-1">
                <Users className="w-3 h-3" /> This headcount is fetched automatically from the attendance registry for this site and date.
              </p>
            </div>

            {mode === 'bulk' ? (
              <div className="col-span-2 space-y-6 mt-4">
                {['breakfast', 'lunch', 'dinner'].map(m => (
                  <div key={m} className="p-4 rounded-2xl border border-primary/10 bg-primary/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="capitalize font-black text-primary text-xs tracking-widest">{m}</Label>
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] font-bold text-muted-foreground uppercase">Rate</span>
                         <Input 
                            type="number" 
                            className="h-7 w-20 text-xs font-bold" 
                            value={bulkMealData[m].rating} 
                            onChange={e => setBulkMealData(prev => ({ ...prev, [m]: { ...prev[m], rating: Number(e.target.value) } }))} 
                         />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2 space-y-1">
                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Menu Items</Label>
                        <Input 
                          placeholder="e.g. Eggs, Paratha, Tea" 
                          value={bulkMealData[m].menu} 
                          onChange={e => setBulkMealData(prev => ({ ...prev, [m]: { ...prev[m], menu: e.target.value } }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Cost/Head</Label>
                        <Input 
                          type="number" 
                          placeholder="Rate" 
                          value={bulkMealData[m].cost || ""} 
                          onChange={e => setBulkMealData(prev => ({ ...prev, [m]: { ...prev[m], cost: Number(e.target.value) } }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase text-muted-foreground text-right border-b border-transparent block">Total Cost</Label>
                        <div className="h-10 flex items-center justify-end px-3 rounded-md bg-muted/50 font-black text-primary text-sm">
                          PKR {(form.headCount * bulkMealData[m].cost).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* ── Menu Items (tag input) ── */}
                <div className="col-span-2 space-y-1.5">
                  <Label>Menu Items</Label>
                  {/* Tag display area */}
                  <div
                    className="min-h-[44px] flex flex-wrap gap-1.5 p-2 rounded-xl border border-input bg-background cursor-text"
                    onClick={() => menuInputRef.current?.focus()}
                  >
                    {menuTags.map(tag => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="flex items-center gap-1 pl-2.5 pr-1 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/20 text-xs font-semibold"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); removeMenuTag(tag) }}
                          className="ml-0.5 w-4 h-4 rounded flex items-center justify-center hover:bg-primary/20 transition-colors"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </Badge>
                    ))}
                    <input
                      ref={menuInputRef}
                      value={menuInput}
                      onChange={e => setMenuInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") { e.preventDefault(); addMenuTag(menuInput) }
                        if (e.key === "," ) { e.preventDefault(); addMenuTag(menuInput) }
                        if (e.key === "Backspace" && !menuInput && menuTags.length) {
                          setMenuTags(prev => prev.slice(0, -1))
                        }
                      }}
                      onBlur={() => { if (menuInput.trim()) addMenuTag(menuInput) }}
                      placeholder={menuTags.length === 0 ? "Type item and press Enter or comma..." : "Add more..."}
                      className="flex-1 min-w-[180px] bg-transparent outline-none text-sm placeholder:text-muted-foreground py-0.5"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground italic">e.g. Chicken Biryani, Salad, Raita — press <kbd className="px-1 py-0.5 rounded bg-muted text-[9px] font-mono">Enter</kbd> or <kbd className="px-1 py-0.5 rounded bg-muted text-[9px] font-mono">,</kbd> to add</p>
                </div>

                <div className="space-y-1.5">
                  <Label>Cost Per Head (PKR)</Label>
                  <Input type="number" value={form.costPerHead || ""} onChange={e => set("costPerHead", Number(e.target.value))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Total Cost (PKR)</Label>
                  <Input type="number" value={form.totalCost || ""} readOnly className="bg-muted focus-visible:ring-0" />
                </div>
                <div className="space-y-1.5">
                  <Label>Rating (1–5)</Label>
                  <Input type="number" min="1" max="5" step="0.1" value={form.rating ?? ""} onChange={e => set("rating", Number(e.target.value))} />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Prepared By</Label>
                  <Input placeholder="Caterer / Chef name" value={form.preparedBy ?? ""} onChange={e => set("preparedBy", e.target.value)} />
                </div>
              </>
            )}

            <div className="col-span-2 space-y-1.5">
              <Label>Remarks</Label>
              <Textarea placeholder="Additional notes..." value={form.remarks ?? ""} onChange={e => set("remarks", e.target.value)} rows={2} />
            </div>
          </div>

          <div className="pt-4 border-t border-border/40 mt-4">
            <Label className="text-sm font-semibold mb-2 block">Catering Receipts &amp; Media</Label>
            <p className="text-xs text-muted-foreground mb-4">Attach grocery receipts, catering invoices, or food quality photos.</p>
            <MultiAttachmentUpload
              value={form.attachments || []}
              onChange={(val) => set("attachments", val)}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border/40 mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending || bulkLoading}>Cancel</Button>
            <Button type="submit" disabled={isPending || bulkLoading} className="font-bold">
              {isPending || bulkLoading ? "Saving..." : mode === 'edit' ? "Update Record" : mode === 'bulk' ? "Save All 3 Meals" : "Save Record"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}


export default function FoodView() {
  const dispatch = useAppDispatch()
  const [dialog, setDialog] = useState<{ open: boolean; data: FoodMessRecord | null, type: 'single' | 'bulk' }>({ open: false, data: null, type: 'single' })
  const [importPreview, setImportPreview] = useState<{ open: boolean; data: any[]; columns: string[] }>({
    open: false,
    data: [],
    columns: [],
  })
  const qc = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["food"],
    queryFn: () => foodApi.records.list({ limit: 100 }),
  })

  const { mutate: del } = useMutation({
    mutationFn: (id: string) => foodApi.records.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["food"] }),
  })

  const importFileInputRef = useRef<HTMLInputElement>(null)
  const { mutate: importMeals, isPending: isImporting } = useMutation({
    mutationFn: (data: Partial<CreateFoodMessDto>[]) => foodApi.records.bulkCreate(data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["food"] })
      toast.success(`Successfully imported ${res.count} meal records`)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Import failed")
    }
  })

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    toast.info("Parsing meal records...")
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const dtos: Partial<CreateFoodMessDto>[] = []
        for (const row of results.data as any[]) {
          if (!row.date || !row.mealType) continue
          dtos.push({
            date: row.date,
            mealType: row.mealType,
            headCount: Number(row.headCount) || 0,
            costPerHead: Number(row.costPerHead) || 0,
            totalCost: Number(row.totalCost) || (Number(row.headCount) * Number(row.costPerHead)) || 0,
            menuItems: row.menuItems || "",
            site: row.site || "",
            rating: Number(row.rating) || undefined,
            remarks: row.remarks || "",
            preparedBy: row.preparedBy || ""
          })
        }
        if (dtos.length === 0) {
          toast.error("No valid records found. Ensure 'date' and 'mealType' are present.")
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

    if (importFileInputRef.current) importFileInputRef.current.value = ""
  }

  const columns = useMemo(() => getFoodColumns(
    (id, data) => setDialog({ open: true, data, type: 'single' }),
    (id) => { if (confirm("Delete this record?")) del(id) },
    fmt
  ), [del])

  const stats = [
    { label: "Total Meals", value: data?.total ?? 0, icon: UtensilsCrossed, color: "text-primary" },
    { label: "Total Headcount", value: data?.data.reduce((s, r) => s + Number(r.headCount), 0) ?? 0, icon: Users, color: "text-emerald-600" },
    { label: "Total Mess Cost", value: `PKR ${(data?.data.reduce((s, r) => s + Number(r.totalCost), 0) ?? 0).toLocaleString()}`, icon: DollarSign, color: "text-rose-600" },
  ]

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Food & Mess Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track daily catering, headcount, and quality ratings</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => dispatch(openGlobalAnalytics({ module: 'food', type: 'food' }))}
            className="border-primary/20 hover:bg-primary/5 text-primary font-bold"
          >
            <BarChart3 className="w-4 h-4 mr-1.5" /> Analytics
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => dispatch(openGlobalHelp({ module: 'food', section: 'food' }))}
            className="border-slate-200 hover:bg-slate-50 text-slate-700 font-bold"
          >
            <HelpCircle className="w-4 h-4 mr-1.5" /> Help
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="w-3.5 h-3.5 mr-1.5" />Refresh</Button>
          
          <input type="file" accept=".csv" ref={importFileInputRef} className="hidden" onChange={handleFileUpload} />
          <Button 
            disabled={isImporting}
            size="sm" 
            variant="outline" 
            onClick={() => importFileInputRef.current?.click()} 
            className="border-slate-200 hover:bg-slate-50 text-slate-700 font-bold"
          >
            {isImporting ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Upload className="w-3.5 h-3.5 mr-1.5" />} Import
          </Button>
          <div className="flex bg-muted rounded-lg p-0.5 border border-border/50">
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => setDialog({ open: true, data: null, type: 'single' })} 
              className="h-8 rounded-md font-bold text-[11px] px-3 hover:bg-white hover:shadow-sm"
            >
              <Plus className="w-3 h-3 mr-1" /> Single
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => setDialog({ open: true, data: null, type: 'bulk' })} 
              className="h-8 rounded-md font-bold text-[11px] px-3 hover:bg-white hover:shadow-sm text-primary"
            >
              <UtensilsCrossed className="w-3 h-3 mr-1" /> Log Day (3 Meals)
            </Button>
          </div>
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
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Synchronizing Mess Registry…</p>
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
              searchKey="menuItems"
            />
          </div>
        )}
      </Card>

      <FoodRecordDrawer 
        open={dialog.open} 
        onClose={() => setDialog({ open: false, data: null, type: 'single' })} 
        data={dialog.data}
        type={dialog.type}
      />

      <ImportPreviewModal
        open={importPreview.open}
        onOpenChange={(open) => setImportPreview((prev) => ({ ...prev, open }))}
        data={importPreview.data}
        columns={importPreview.columns}
        isLoading={isImporting}
        onConfirm={() => {
          importMeals(importPreview.data)
          setImportPreview((prev) => ({ ...prev, open: false }))
        }}
        title="Preview Food & Mess Import"
        description="Verify meal counts, types, and catering costs before updating the mess registry."
      />
    </div>
  )
}
