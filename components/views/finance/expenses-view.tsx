"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { financeApi } from "@/lib/api/finance"
import type { Expense, CreateExpenseDto, UpdateExpenseStatusDto } from "@/lib/types/finance"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { DollarSign, Plus, RefreshCw, AlertTriangle, Trash2, CheckCircle, XCircle, Clock, FileText, Filter } from "lucide-react"

const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
const today = () => new Date().toISOString().split("T")[0]

const statusConfig = {
  pending:  { label: "Pending",  icon: Clock,       className: "bg-amber-100  text-amber-700  border-amber-200"  },
  approved: { label: "Approved", icon: CheckCircle, className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  rejected: { label: "Rejected", icon: XCircle,     className: "bg-rose-100    text-rose-700    border-rose-200"    },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status as keyof typeof statusConfig] ?? { label: status, className: "bg-gray-100" }
  const Icon = cfg.icon ?? Clock
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${cfg.className}`}>
      <Icon className="w-3 h-3" /> {cfg.label}
    </span>
  )
}

function AddExpenseDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient()
  const { mutate, isPending } = useMutation({
    mutationFn: (dto: CreateExpenseDto) => financeApi.expenses.create(dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["expenses"] }); onClose() },
  })

  const [form, setForm] = useState<CreateExpenseDto>({
    title: "", category: "general", amount: 0, dateIncurred: today(),
  })

  const set = (k: keyof CreateExpenseDto, v: any) => setForm(f => ({ ...f, [k]: v }))

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-primary" /> Log New Expense</DialogTitle></DialogHeader>
        <form onSubmit={e => { e.preventDefault(); mutate(form) }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Expense Title *</Label>
              <Input placeholder="Fuel for Site Alpha" value={form.title} onChange={e => set("title", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select value={form.category} onValueChange={v => set("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fuel">Fuel</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="salary">Salary</SelectItem>
                  <SelectItem value="rent">Rent</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="supplies">Supplies</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Amount (PKR) *</Label>
              <Input type="number" value={form.amount || ""} onChange={e => set("amount", Number(e.target.value))} required />
            </div>
            <div className="space-y-1.5">
              <Label>Date Incurred *</Label>
              <Input type="date" value={form.dateIncurred} onChange={e => set("dateIncurred", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Site / Location</Label>
              <Input placeholder="Karachi Office" value={form.site ?? ""} onChange={e => set("site", e.target.value)} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Description</Label>
              <Textarea placeholder="Additional details…" value={form.description ?? ""} onChange={e => set("description", e.target.value)} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Submitting…" : "Submit Expense"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ApprovalDialog({ expense, onClose }: { expense: Expense | null, onClose: () => void }) {
  const qc = useQueryClient()
  const [remarks, setRemarks] = useState("")
  const { mutate, isPending } = useMutation({
    mutationFn: (dto: UpdateExpenseStatusDto) => financeApi.expenses.updateStatus(expense!.id, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["expenses"] }); onClose() },
  })

  if (!expense) return null

  return (
    <Dialog open={!!expense} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Approve / Reject Expense</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="p-3 bg-muted/50 rounded-lg space-y-1">
            <p className="text-sm font-semibold">{expense.title}</p>
            <p className="text-xl font-black text-primary">PKR {Number(expense.amount).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">{expense.category}</p>
          </div>
          <div className="space-y-1.5">
            <Label>Remarks (Optional)</Label>
            <Textarea placeholder="Reason for approval/rejection…" value={remarks} onChange={e => setRemarks(e.target.value)} rows={3} />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" className="flex-1" disabled={isPending} onClick={() => mutate({ status: "rejected", remarks })}>
            Reject
          </Button>
          <Button variant="default" className="flex-1 bg-emerald-600 hover:bg-emerald-700" disabled={isPending} onClick={() => mutate({ status: "approved", remarks })}>
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function ExpensesView() {
  const [statusFilter, setStatusFilter] = useState("all")
  const [showAdd, setShowAdd] = useState(false)
  const [approvalExp, setApprovalExp] = useState<Expense | null>(null)
  const qc = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["expenses", statusFilter],
    queryFn: () => financeApi.expenses.list({ status: statusFilter !== "all" ? statusFilter : undefined, limit: 100 }),
  })

  const { data: summary } = useQuery({
    queryKey: ["expenses", "summary"],
    queryFn: financeApi.expenses.summary,
  })

  const { mutate: deleteExp } = useMutation({
    mutationFn: (id: string) => financeApi.expenses.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["expenses"] }),
  })

  const totalAmount = data?.data.reduce((s, e) => s + Number(e.amount), 0) ?? 0

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Financial Expenses</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track and approve operational costs</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="w-3.5 h-3.5 mr-1.5" />Refresh</Button>
          <Button size="sm" onClick={() => setShowAdd(true)}><Plus className="w-3.5 h-3.5 mr-1.5" />Log Expense</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Period Expense", value: `PKR ${totalAmount.toLocaleString()}`, color: "text-primary",   bg: "bg-primary/5" },
          { label: "Approved Expenses",   value: summary?.total ? `PKR ${summary.total.toLocaleString()}` : "PKR 0", color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Pending Workflow",    value: data?.data.filter(e => e.status === "pending").length ?? 0, color: "text-amber-600",   bg: "bg-amber-50" },
        ].map(s => (
          <Card key={s.label} className="rounded-xl border-border/50 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
              <p className={`text-xl font-black mt-0.5 ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-lg border border-border/40">
           <Filter className="w-3.5 h-3.5 text-muted-foreground" />
           <span className="text-xs font-semibold uppercase text-muted-foreground">Filter Status:</span>
           <div className="flex gap-1">
             {["all", "pending", "approved", "rejected"].map(s => (
               <button key={s} onClick={() => setStatusFilter(s)}
                 className={`px-3 py-0.5 rounded-md text-[10px] uppercase font-bold transition-all border ${
                   statusFilter === s ? "bg-white border-border shadow-sm text-primary" : "text-muted-foreground border-transparent hover:text-foreground"
                 }`}>
                 {s}
               </button>
             ))}
           </div>
        </div>
      </div>

      <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
        {isLoading ? (
           <CardContent className="py-16 text-center text-muted-foreground text-sm">
             <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" /> Loading ledger…
           </CardContent>
        ) : error ? (
           <CardContent className="py-16 text-center text-sm">
             <AlertTriangle className="w-6 h-6 text-rose-500 mx-auto mb-2" />
             <p className="font-semibold text-rose-600">Failed to load expenses</p>
             <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>Retry</Button>
           </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-bold text-xs uppercase tracking-wide">Date</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Title & Category</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Amount (PKR)</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Site / Dept</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide text-center">Status</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.data ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-20" /> No expense records found.
                  </TableCell>
                </TableRow>
              ) : (
                (data?.data ?? []).map(exp => (
                  <TableRow key={exp.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="text-sm">{fmtDate(exp.dateIncurred)}</TableCell>
                    <TableCell>
                      <div className="font-semibold text-sm">{exp.title}</div>
                      <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{exp.category}</div>
                    </TableCell>
                    <TableCell className="font-mono text-base font-black text-primary">
                      {Number(exp.amount).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{exp.site || "—"}</div>
                      <div className="text-xs text-muted-foreground italic font-medium">{exp.department || "PEL General"}</div>
                    </TableCell>
                    <TableCell className="text-center">
                       <button onClick={() => exp.status === "pending" && setApprovalExp(exp)}>
                         <StatusBadge status={exp.status} />
                       </button>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-rose-600"
                        onClick={() => { if (confirm("Delete this expense?")) deleteExp(exp.id) }}>
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

      <AddExpenseDialog open={showAdd} onClose={() => setShowAdd(false)} />
      <ApprovalDialog expense={approvalExp} onClose={() => setApprovalExp(null)} />
    </div>
  )
}
