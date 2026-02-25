"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { foodApi } from "@/lib/api/food"
import type { FoodMessRecord, CreateFoodMessDto } from "@/lib/types/food"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { UtensilsCrossed, Plus, RefreshCw, AlertTriangle, Trash2, Users, Star, DollarSign, BarChart3, HelpCircle } from "lucide-react"
import { useAppDispatch } from "@/lib/store"
import { openGlobalAnalytics, openGlobalHelp } from "@/lib/store/slices/ui-slice"

const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
const today = () => new Date().toISOString().split("T")[0]

function AddFoodRecordDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient()
  const { mutate, isPending } = useMutation({
    mutationFn: (dto: CreateFoodMessDto) => foodApi.records.create(dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["food"] }); onClose() },
  })

  const [form, setForm] = useState<CreateFoodMessDto>({
    date: today(), mealType: "lunch", headCount: 0, costPerHead: 0, totalCost: 0,
  })

  const set = (k: keyof CreateFoodMessDto, v: any) => {
    setForm(f => {
      const next = { ...f, [k]: v }
      if (k === "headCount" || k === "costPerHead") {
        next.totalCost = Number(next.headCount || 0) * Number(next.costPerHead || 0)
      }
      return next
    })
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
              <SheetTitle className="text-base">Log Daily Mess Record</SheetTitle>
            </div>
            <SheetDescription className="text-xs">Record daily catering details, headcount, and quality ratings.</SheetDescription>
          </SheetHeader>
        </div>

        <form onSubmit={e => { e.preventDefault(); mutate(form) }} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Date *</Label>
              <Input type="date" value={form.date} onChange={e => set("date", e.target.value)} required />
            </div>
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
            <div className="space-y-1.5">
              <Label>Head Count *</Label>
              <Input type="number" value={form.headCount || ""} onChange={e => set("headCount", Number(e.target.value))} required />
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
              <Label>Site / Location</Label>
              <Input placeholder="Site Alpha" value={form.site ?? ""} onChange={e => set("site", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Rating (1-5)</Label>
              <Input type="number" min="1" max="5" step="0.1" value={form.rating ?? ""} onChange={e => set("rating", Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>Prepared By</Label>
              <Input placeholder="Caterer / Chef name" value={form.preparedBy ?? ""} onChange={e => set("preparedBy", e.target.value)} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Menu Items</Label>
              <Input placeholder="Chicken Biryani, Salad, Raita..." value={form.menuItems ?? ""} onChange={e => set("menuItems", e.target.value)} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Remarks</Label>
              <Textarea placeholder="Additional notes..." value={form.remarks ?? ""} onChange={e => set("remarks", e.target.value)} rows={2} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border/40 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending} className="font-bold">
              {isPending ? "Saving..." : "Save Record"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

export default function FoodView() {
  const dispatch = useAppDispatch()
  const [showAdd, setShowAdd] = useState(false)
  const qc = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["food"],
    queryFn: () => foodApi.records.list({ limit: 100 }),
  })

  const { mutate: del } = useMutation({
    mutationFn: (id: string) => foodApi.records.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["food"] }),
  })

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
          <Button size="sm" onClick={() => setShowAdd(true)} className="font-bold"><Plus className="w-3.5 h-3.5 mr-1.5" />Log Meal</Button>
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
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" /> Loading mess records...
          </CardContent>
        ) : error ? (
          <CardContent className="py-16 text-center text-sm">
            <AlertTriangle className="w-6 h-6 text-rose-500 mx-auto mb-2" />
            <p className="font-semibold text-rose-600">Failed to load mess records</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>Retry</Button>
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-bold text-xs uppercase tracking-wide">Date</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Meal</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Menu</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Heads</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Cost (PKR)</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Rating</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.data ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                    <UtensilsCrossed className="w-8 h-8 mx-auto mb-2 opacity-20" /> No mess records yet.
                  </TableCell>
                </TableRow>
              ) : (
                (data?.data ?? []).map(r => (
                  <TableRow key={r.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="text-sm">{fmt(r.date)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                        r.mealType === "breakfast" ? "bg-amber-100 text-amber-700 border-amber-200" :
                        r.mealType === "lunch" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                        "bg-blue-100 text-blue-700 border-blue-200"
                      }`}>
                        {r.mealType}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate" title={r.menuItems}>{r.menuItems || "—"}</TableCell>
                    <TableCell className="text-sm font-semibold">{r.headCount}</TableCell>
                    <TableCell>
                      <div className="text-sm font-bold text-primary">{Number(r.totalCost).toLocaleString()}</div>
                      <div className="text-[10px] text-muted-foreground">{r.costPerHead} / head</div>
                    </TableCell>
                    <TableCell>
                      {r.rating ? (
                        <div className="flex items-center gap-1 text-sm font-bold text-amber-500">
                          <Star className="w-3 h-3 fill-current" /> {r.rating}
                        </div>
                      ) : "—"}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-rose-600"
                        onClick={() => { if (confirm("Delete this record?")) del(r.id) }}>
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

      <AddFoodRecordDrawer open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  )
}
