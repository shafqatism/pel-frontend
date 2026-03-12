"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, useEffect, useMemo, useRef } from "react"
import Papa from "papaparse"
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
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  Users, Plus, Search, RefreshCw, AlertTriangle,
  Mail, Phone, Edit2, Trash2, Building2, Briefcase, BarChart3, HelpCircle,
  FileText, Calendar, MapPin, CreditCard, Contact2, ShieldAlert,
  Download, ExternalLink, Printer, Upload, Loader2, FileDown
} from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { useAppDispatch } from "@/lib/store"
import { openGlobalAnalytics, openGlobalHelp } from "@/lib/store/slices/ui-slice"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { useDynamicDropdown } from "@/hooks/use-dynamic-dropdown"
import { MultiAttachmentUpload } from "@/components/common/multi-attachment-upload"
import { SingleImageUpload } from "@/components/common/single-image-upload"
import { DataTable } from "@/components/ui/data-table"
import { getEmployeeColumns } from "./employees-columns"
import { useNav } from "@/lib/nav-context"
import { ImportPreviewModal } from "@/components/common/import-preview-modal"

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

const fmt = (d?: string) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"

const calculateAge = (birthDate?: string) => {
  if (!birthDate) return "—"
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status as keyof typeof statusConfig] ?? { label: status, className: "" }
  return <span className={`inline-flex items-center text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${cfg.className}`}>{cfg.label}</span>
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
    clientEmpCode: "", peopleEmpCode: "", birthDate: "",
    attachments: [], profilePhotoUrl: ""
  })

  const mergedDepts = useMemo(() => mergeOptions(DEFAULT_DEPARTMENTS, deptOptions), [deptOptions])
  const mergedDesigs = useMemo(() => mergeOptions(DEFAULT_DESIGNATIONS, desigOptions), [desigOptions])

  useEffect(() => {
    if (open) {
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
          bankAccountNumber: data.bankAccountNumber || "",
          bankName: data.bankName || "",
          emergencyContactName: data.emergencyContactName || "",
          emergencyContactPhone: data.emergencyContactPhone || "",
          clientEmpCode: data.clientEmpCode || "",
          peopleEmpCode: data.peopleEmpCode || "",
          birthDate: data.birthDate ? new Date(data.birthDate).toISOString().split('T')[0] : "",
          attachments: (data as any).attachments || [],
          profilePhotoUrl: data.profilePhotoUrl || ""
        })
      } else {
        setForm({ fullName: "", designation: "", department: "", status: "active", clientEmpCode: "", peopleEmpCode: "", birthDate: "", attachments: [], profilePhotoUrl: "" })
      }
    }
  }, [data, open])

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
              <SheetTitle className="text-base font-black uppercase tracking-tight">{mode === 'create' ? "Personnel Registration" : "Personnel Modification"}</SheetTitle>
            </div>
            <SheetDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">Manage professional records and identity documents.</SheetDescription>
          </SheetHeader>
        </div>

        <form onSubmit={e => { e.preventDefault(); mutate(form) }} className="p-6 space-y-6">
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary border-l-2 border-primary pl-2 mb-4">Identity Information</p>
            
            <div className="flex justify-center pb-4">
              <div className="w-full max-w-[200px]">
                <SingleImageUpload 
                  label="Employee Profile Picture"
                  value={form.profilePhotoUrl}
                  onChange={(url) => set("profilePhotoUrl", url)}
                  module="hr"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name *</Label>
                <Input placeholder="John Doe" value={form.fullName} onChange={e => set("fullName", e.target.value)} required className="rounded-xl h-10 border-border/50" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Father's Name</Label>
                <Input placeholder="Richard Doe" value={form.fatherName ?? ""} onChange={e => set("fatherName", e.target.value)} className="rounded-xl h-10 border-border/50" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">CNIC Number</Label>
                <Input placeholder="00000-0000000-0" value={form.cnic ?? ""} onChange={e => set("cnic", e.target.value)} className="rounded-xl h-10 border-border/50 font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Phone Number</Label>
                <Input placeholder="+92 300 1234567" value={form.phone ?? ""} onChange={e => set("phone", e.target.value)} className="rounded-xl h-10 border-border/50" />
              </div>
              <div className="col-span-full space-y-1.5">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Official Email Address</Label>
                 <Input type="email" placeholder="john@example.com" value={form.email ?? ""} onChange={e => set("email", e.target.value)} className="rounded-xl h-10 border-border/50" />
              </div>
              <div className="col-span-full space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Current Residential Address</Label>
                <Input placeholder="House #, Street, City" value={form.address ?? ""} onChange={e => set("address", e.target.value)} className="rounded-xl h-10 border-border/50" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Client Emp Code</Label>
                <Input placeholder="CL-001" value={form.clientEmpCode ?? ""} onChange={e => set("clientEmpCode", e.target.value)} className="rounded-xl h-10 border-border/50" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">People Emp Code</Label>
                <Input placeholder="PE-001" value={form.peopleEmpCode ?? ""} onChange={e => set("peopleEmpCode", e.target.value)} className="rounded-xl h-10 border-border/50" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Birth Date</Label>
                <Input type="date" value={form.birthDate ?? ""} onChange={e => set("birthDate", e.target.value)} className="rounded-xl h-10 border-border/50" />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-dashed border-border/60">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary border-l-2 border-primary pl-2 mb-4">Contractual & Compensation</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Designation *</Label>
                <SearchableSelect
                  options={mergedDesigs}
                  value={form.designation}
                  onValueChange={v => set("designation", v)}
                  onCreate={createDesig}
                  placeholder="Select designation"
                  triggerClassName="rounded-xl h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Department *</Label>
                <SearchableSelect
                  options={mergedDepts}
                  value={form.department}
                  onValueChange={v => set("department", v)}
                  onCreate={createDept}
                  placeholder="Select department"
                  triggerClassName="rounded-xl h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Monthly Basic Salary (PKR)</Label>
                <Input type="number" value={form.basicSalary ?? ""} onChange={e => set("basicSalary", Number(e.target.value))} className="rounded-xl h-10 border-border/50 font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Date of Joining</Label>
                <Input type="date" value={form.joiningDate ?? ""} onChange={e => set("joiningDate", e.target.value)} className="rounded-xl h-10 border-border/50" />
              </div>
              <div className="space-y-1.5">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Bank Name</Label>
                 <Input placeholder="Habib Bank" value={form.bankName ?? ""} onChange={e => set("bankName", e.target.value)} className="rounded-xl h-10 border-border/50" />
              </div>
              <div className="space-y-1.5">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Account Number / IBAN</Label>
                 <Input placeholder="000123456789" value={form.bankAccountNumber ?? ""} onChange={e => set("bankAccountNumber", e.target.value)} className="rounded-xl h-10 border-border/50 font-mono" />
              </div>
              <div className="col-span-full space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Employment Status</Label>
                <Select value={form.status} onValueChange={v => set("status", v)}>
                  <SelectTrigger className="rounded-xl h-10 border-border/50"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="active" className="text-xs font-bold uppercase">Active</SelectItem>
                    <SelectItem value="on_leave" className="text-xs font-bold uppercase">On Leave</SelectItem>
                    <SelectItem value="terminated" className="text-xs font-bold uppercase">Terminated</SelectItem>
                    <SelectItem value="resigned" className="text-xs font-bold uppercase">Resigned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-dashed border-border/60">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary border-l-2 border-primary pl-2 mb-4">Emergency Protocols</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Next of Kin Name</Label>
                 <Input placeholder="Emergency beneficiary" value={form.emergencyContactName ?? ""} onChange={e => set("emergencyContactName", e.target.value)} className="rounded-xl h-10 border-border/50" />
              </div>
              <div className="space-y-1.5">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Kin Contact Number</Label>
                 <Input placeholder="+92 3XX XXXXXXX" value={form.emergencyContactPhone ?? ""} onChange={e => set("emergencyContactPhone", e.target.value)} className="rounded-xl h-10 border-border/50" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border/40">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary border-l-2 border-primary pl-2 mb-4 block">Digital Dossier & Artifacts</Label>
            <p className="text-[10px] text-muted-foreground mb-4 uppercase font-bold tracking-widest bg-muted/50 p-3 rounded-lg flex items-center gap-2 border border-dashed border-border">
               <ShieldAlert className="w-4 h-4 text-amber-500" />
               Attach legal documentation: CNIC copies, background checks, medical certs.
            </p>
            <MultiAttachmentUpload
              value={form.attachments || []}
              onChange={(val) => set("attachments", val)}
              module="hr"
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-border/40 bg-muted/5 p-6 -m-6 mt-4">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-2xl h-11 px-6 text-[10px] font-black uppercase tracking-widest">Cancel</Button>
            <Button type="submit" disabled={isPending} className="rounded-2xl h-11 px-8 text-[10px] font-black uppercase tracking-widest bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
              {isPending ? "Synchronizing…" : mode === 'create' ? "Confirm Registration" : "Apply Modifications"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

function UserCheck(props: any) { return <Users {...props} /> }
function FileX(props: any) { return <FileText {...props} /> }

export default function EmployeesView() {
  const dispatch = useAppDispatch()
  const { setActive, setBreadcrumb, setMetadata } = useNav()
  const [search, setSearch] = useState("")
  const [deptFilter, setDeptFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dialog, setDialog] = useState<{ open: boolean; data: Employee | null }>({ open: false, data: null })
  // viewDialog local state removed
  const qc = useQueryClient()
  const [importPreview, setImportPreview] = useState<{ open: boolean; data: any[]; columns: string[] }>({
    open: false,
    data: [],
    columns: [],
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { mutate: importEmployees, isPending: isImporting } = useMutation({
    mutationFn: (data: CreateEmployeeDto[]) => hrApi.employees.importBulk(data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["employees"] })
      toast.success(`Successfully imported ${res.count} employees`)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Import failed")
    }
  })

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    toast.info("Parsing CSV file...")
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const dtos: CreateEmployeeDto[] = results.data.map((row: any) => ({
          fullName: row.fullName || "Unknown",
          designation: row.designation || "Operator",
          department: row.department || "Operations",
          status: row.status?.toLowerCase() || "active",
          email: row.email || undefined,
          phone: row.phone || undefined,
          cnic: row.cnic || undefined,
          clientEmpCode: row.clientEmpCode || undefined,
          peopleEmpCode: row.peopleEmpCode || undefined,
          basicSalary: row.basicSalary ? Number(row.basicSalary) : 0,
          joiningDate: row.joiningDate || undefined,
          birthDate: row.birthDate || undefined,
          address: row.address || undefined,
        }))
        if (dtos.length === 0) {
          toast.error("No valid data found in CSV.")
          return
        }
        setImportPreview({
          open: true,
          data: dtos,
          columns: Object.keys(dtos[0]),
        })
      },
      error: (error) => {
        toast.error(`Error parsing file: ${error.message}`)
      }
    })
    
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      toast.info(`Generating ${format.toUpperCase()}...`)
      const res = await hrApi.reports.export('employees', format)
      
      const blob = new Blob([res.data])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const ext = format === 'excel' ? 'xlsx' : format
      link.setAttribute('download', `PEL_HR_Employees_${new Date().toISOString().slice(0, 10)}.${ext}`)
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

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["employees", search, deptFilter, statusFilter],
    queryFn: () => hrApi.employees.list({ 
      search: search || undefined, 
      department: deptFilter !== 'all' ? deptFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      limit: 100 
    }),
  })

  const { mutate: deleteEmployee } = useMutation({
    mutationFn: (id: string) => hrApi.employees.delete(id),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ["employees"] })
      toast.success("Employee record purged")
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Deletion failed")
    }
  })

  const columns = useMemo(() => getEmployeeColumns(
    (emp) => setDialog({ open: true, data: emp }),
    (id) => { if(confirm("Confirm permanent removal?")) deleteEmployee(id) },
    (emp) => {
      setMetadata({ employeeId: emp.id, employeeName: emp.fullName })
      setBreadcrumb(["Human Resources", "Employees", "Report"])
      setActive("hr-employee-report")
    }
  ), [deleteEmployee, setActive, setBreadcrumb, setMetadata])

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase text-slate-900">Personnel Dossier</h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] mt-1 flex items-center gap-2">
             <ShieldAlert className="w-3.5 h-3.5 text-primary" /> Central Human Resources & Liability Management
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => dispatch(openGlobalAnalytics({ module: 'hr', type: 'employees' }))}
            className="border-primary/20 hover:bg-primary/5 text-primary font-black uppercase tracking-widest text-[10px] rounded-xl h-10 px-5 shadow-sm"
          >
            <BarChart3 className="w-4 h-4 mr-2" /> Core Analytics
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => dispatch(openGlobalHelp({ module: 'hr', section: 'employees' }))}
            className="border-slate-200 hover:bg-slate-50 text-slate-700 font-black uppercase tracking-widest text-[10px] rounded-xl h-10 px-5 shadow-sm"
          >
            <HelpCircle className="w-4 h-4 mr-2" /> Protocols
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="rounded-xl h-10 w-10 p-0 border-slate-200">
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
          <Button size="sm" onClick={() => setDialog({ open: true, data: null })} className="font-black uppercase tracking-widest text-[10px] rounded-xl h-10 px-6 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4 mr-2" /> New Registration
          </Button>
          <input type="file" accept=".csv" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
          <Button 
            disabled={isImporting}
            size="sm" 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()} 
            className="font-black uppercase tracking-widest text-[10px] rounded-xl h-10 px-6 border-slate-200 hover:bg-slate-50 text-slate-700"
          >
            {isImporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />} CSV Import
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="font-black uppercase tracking-widest text-[10px] rounded-xl h-10 px-6 border-slate-200 hover:bg-slate-50 text-slate-700"
              >
                <FileDown className="w-4 h-4 mr-2" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl p-1 w-40">
              <DropdownMenuItem onClick={() => handleExport('csv')} className="text-[10px] font-black uppercase tracking-widest p-2.5 rounded-lg cursor-pointer">
                <FileText className="w-4 h-4 mr-2 text-blue-600" /> Save as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('excel')} className="text-[10px] font-black uppercase tracking-widest p-2.5 rounded-lg cursor-pointer">
                <FileText className="w-4 h-4 mr-2 text-emerald-600" /> Save as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')} className="text-[10px] font-black uppercase tracking-widest p-2.5 rounded-lg cursor-pointer">
                <FileText className="w-4 h-4 mr-2 text-rose-600" /> Save as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-2xl border border-border/50 shadow-sm">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-11 h-11 text-xs font-bold uppercase tracking-widest rounded-xl border-border/60 bg-slate-50/50" placeholder="Search by name, ID or designation…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="h-11 rounded-xl text-[10px] font-black uppercase tracking-widest border-border/60 bg-slate-50/50 w-full sm:w-40">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all" className="text-[10px] font-black uppercase">All Sectors</SelectItem>
              {DEFAULT_DEPARTMENTS.map(d => (
                <SelectItem key={d.value} value={d.value} className="text-[10px] font-black uppercase">{d.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-11 rounded-xl text-[10px] font-black uppercase tracking-widest border-border/60 bg-slate-50/50 w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all" className="text-[10px] font-black uppercase">All Statuses</SelectItem>
              <SelectItem value="active" className="text-[10px] font-black uppercase">Active</SelectItem>
              <SelectItem value="on_leave" className="text-[10px] font-black uppercase">On Leave</SelectItem>
              <SelectItem value="terminated" className="text-[10px] font-black uppercase">Terminated</SelectItem>
              <SelectItem value="resigned" className="text-[10px] font-black uppercase">Resigned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="hidden lg:flex items-center gap-2 px-4 border-l border-border/60 ml-auto">
           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Strength:</p>
           <p className="text-sm font-black text-primary">{data?.total ?? 0}</p>
        </div>
      </div>

      <Card className="rounded-[2rem] border-border/50 shadow-none overflow-hidden bg-white">
        {isLoading ? (
          <div className="py-24 text-center">
             <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary opacity-20" />
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Accessing Encrypted Records…</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center">
             <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-4 opacity-50" />
             <p className="font-black uppercase tracking-widest text-sm text-rose-600">Secure link failure</p>
             <p className="text-[10px] font-bold text-muted-foreground uppercase mt-2">Could not synchronize with the HR database.</p>
             <Button variant="outline" size="sm" className="mt-6 rounded-xl font-bold uppercase tracking-widest text-[10px]" onClick={() => refetch()}>Re-Authenticate</Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={data?.data ?? []}
            searchKey="fullName"
          />
        )}
      </Card>
      <EmployeeDrawer 
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
          importEmployees(importPreview.data)
          setImportPreview((prev) => ({ ...prev, open: false }))
        }}
        title="Preview Employee Registration"
        description="Verify the personnel details and employment terms before registering them into the HR dossier."
      />
    </div>
  )
}
