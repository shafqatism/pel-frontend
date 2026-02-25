"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, useEffect, useMemo } from "react"
import { hrApi } from "@/lib/api/hr"
import type { Employee, CreateEmployeeDto } from "@/lib/types/hr"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Users, Plus, Search, RefreshCw, AlertTriangle,
  Mail, Phone, Edit2, Trash2, Building2, Briefcase, BarChart3, HelpCircle
} from "lucide-react"
import { toast } from "sonner"
import { useAppDispatch } from "@/lib/store"
import { openGlobalAnalytics, openGlobalHelp } from "@/lib/store/slices/ui-slice"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { useDynamicDropdown } from "@/hooks/use-dynamic-dropdown"

const statusConfig = {
  active:     { label: "Active",     className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  on_leave:   { label: "On Leave",   className: "bg-amber-100  text-amber-700  border-amber-200"  },
  terminated: { label: "Terminated", className: "bg-rose-100   text-rose-700   border-rose-200"   },
  resigned:   { label: "Resigned",   className: "bg-gray-100   text-gray-600   border-gray-200"   },
}

const DEFAULT_DESIGNATIONS = [
  { label: "Manager", value: "Manager" },
  { label: "Supervisor", value: "Supervisor" },
  { label: "Operator", value: "Operator" },
  { label: "Driver", value: "Driver" }
]

const DEFAULT_DEPARTMENTS = [
  { label: "Operations", value: "Operations" },
  { label: "HSE", value: "HSE" },
  { label: "Fleet", value: "Fleet" },
  { label: "Finance", value: "Finance" }
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

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status as keyof typeof statusConfig] ?? { label: status, className: "" }
  return <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border ${cfg.className}`}>{cfg.label}</span>
}

function EmployeeDrawer({ open, onClose, data }: { open: boolean; onClose: () => void; data?: Employee | null }) {
  const qc = useQueryClient()
  const mode = data ? 'edit' : 'create'
  
  const { options: deptOptions, createOption: createDept } = useDynamicDropdown("hr_department")
  const { options: desigOptions, createOption: createDesig } = useDynamicDropdown("hr_designation")

  const { mutate, isPending } = useMutation({
    mutationFn: (dto: CreateEmployeeDto) => mode === 'create' ? hrApi.employees.create(dto) : hrApi.employees.update(data!.id, dto),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ["employees"] })
      toast.success(mode === 'create' ? "Employee registered" : "Employee updated")
      onClose() 
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Operation failed"),
  })

  const [form, setForm] = useState<CreateEmployeeDto>({
    fullName: "", designation: "", department: "", status: "active",
  })

  const mergedDepts = useMemo(() => mergeOptions(DEFAULT_DEPARTMENTS, deptOptions), [deptOptions])
  const mergedDesigs = useMemo(() => mergeOptions(DEFAULT_DESIGNATIONS, desigOptions), [desigOptions])

  useEffect(() => {
    if (data) {
      setForm({
        fullName: data.fullName || "",
        fatherName: data.fatherName || "",
        designation: data.designation || "",
        department: data.department || "",
        cnic: data.cnic || "",
        email: data.email || "",
        phone: data.phone || "",
        basicSalary: Number(data.basicSalary) || 0,
        joiningDate: data.joiningDate ? new Date(data.joiningDate).toISOString().split('T')[0] : "",
        status: data.status || "active",
        address: data.address || "",
      })
    } else {
      setForm({ fullName: "", designation: "", department: "", status: "active" })
    }
  }, [data])

  const set = (k: keyof CreateEmployeeDto, v: any) => setForm(f => ({ ...f, [k]: v }))

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg md:max-w-xl overflow-y-auto p-0">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/40 px-6 py-5">
          <SheetHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Users className="w-4 h-4" />
              </div>
              <SheetTitle className="text-base">{mode === 'create' ? "Register New Employee" : "Edit Employee Details"}</SheetTitle>
            </div>
            <SheetDescription className="text-xs">Manage personnel details, designations, and departmental assignments.</SheetDescription>
          </SheetHeader>
        </div>

        <form onSubmit={e => { e.preventDefault(); mutate(form) }} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Full Name *</Label>
              <Input placeholder="John Doe" value={form.fullName} onChange={e => set("fullName", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Father's Name</Label>
              <Input placeholder="Richard Doe" value={form.fatherName ?? ""} onChange={e => set("fatherName", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Designation *</Label>
              <SearchableSelect
                options={mergedDesigs}
                value={form.designation}
                onValueChange={v => set("designation", v)}
                onCreate={createDesig}
                placeholder="Select designation"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Department *</Label>
              <SearchableSelect
                options={mergedDepts}
                value={form.department}
                onValueChange={v => set("department", v)}
                onCreate={createDept}
                placeholder="Select department"
              />
            </div>
            <div className="space-y-1.5">
              <Label>CNIC</Label>
              <Input placeholder="00000-0000000-0" value={form.cnic ?? ""} onChange={e => set("cnic", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" placeholder="john@example.com" value={form.email ?? ""} onChange={e => set("email", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input placeholder="+92 300 1234567" value={form.phone ?? ""} onChange={e => set("phone", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Basic Salary (PKR)</Label>
              <Input type="number" value={form.basicSalary ?? ""} onChange={e => set("basicSalary", Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>Joining Date</Label>
              <Input type="date" value={form.joiningDate ?? ""} onChange={e => set("joiningDate", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                  <SelectItem value="resigned">Resigned</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Address</Label>
              <Input placeholder="House #, Street, City" value={form.address ?? ""} onChange={e => set("address", e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border/40 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending} className="font-bold">
              {isPending ? "Saving…" : mode === 'create' ? "Register Employee" : "Save Changes"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

export default function EmployeesView() {
  const dispatch = useAppDispatch()
  const [search, setSearch] = useState("")
  const [dialog, setDialog] = useState<{ open: boolean; data: Employee | null }>({ open: false, data: null })
  const qc = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["employees", search],
    queryFn: () => hrApi.employees.list({ search: search || undefined, limit: 100 }),
  })

  const { mutate: deleteEmployee } = useMutation({
    mutationFn: (id: string) => hrApi.employees.delete(id),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ["employees"] })
      toast.success("Employee removed")
    },
  })

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Employee Directory</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage personnel, profiles, and designations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => dispatch(openGlobalAnalytics({ module: 'hr', type: 'employees' }))}
            className="border-primary/20 hover:bg-primary/5 text-primary font-bold"
          >
            <BarChart3 className="w-4 h-4 mr-1.5" /> Analytics
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => dispatch(openGlobalHelp({ module: 'hr', section: 'employees' }))}
            className="border-slate-200 hover:bg-slate-50 text-slate-700 font-bold"
          >
            <HelpCircle className="w-4 h-4 mr-1.5" /> Help
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh
          </Button>
          <Button size="sm" onClick={() => setDialog({ open: true, data: null })} className="font-bold">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Employee
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input className="pl-9 h-9 text-sm" placeholder="Search by name, designation, dept…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
        {isLoading ? (
          <CardContent className="py-16 text-center text-muted-foreground text-sm">
             <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
             Loading employees…
          </CardContent>
        ) : error ? (
          <CardContent className="py-16 text-center text-sm">
             <AlertTriangle className="w-6 h-6 text-rose-500 mx-auto mb-2" />
             <p className="font-semibold text-rose-600">Failed to load directory</p>
             <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>Retry</Button>
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-bold text-xs uppercase tracking-wide">Name</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Contact</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Department</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Designation</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Status</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.data ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    No employees found.
                  </TableCell>
                </TableRow>
              ) : (
                (data?.data ?? []).map((emp: Employee) => (
                  <TableRow key={emp.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell>
                      <div className="font-semibold text-sm">{emp.fullName}</div>
                      <div className="text-xs text-muted-foreground">{emp.cnic}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Mail className="w-3 h-3 text-muted-foreground" />
                        {emp.email || "—"}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                        <Phone className="w-3 h-3" />
                        {emp.phone || "—"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm uppercase font-medium">
                        <Building2 className="w-3.5 h-3.5 text-primary/60" />
                        {emp.department}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Briefcase className="w-3.5 h-3.5 text-amber-500/60" />
                        {emp.designation}
                      </div>
                    </TableCell>
                    <TableCell><StatusBadge status={emp.status} /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => setDialog({ open: true, data: emp })}>
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-rose-600"
                          onClick={() => { if (confirm("Delete this employee?")) deleteEmployee(emp.id) }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      <EmployeeDrawer 
        open={dialog.open} 
        onClose={() => setDialog({ open: false, data: null })} 
        data={dialog.data} 
      />
    </div>
  )
}
