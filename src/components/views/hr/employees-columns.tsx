"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Employee } from "@/lib/types/hr"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2, FileText, MoreHorizontal, Eye } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AttachmentCountBadge } from "@/components/common/record-report-modal"

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

export const getEmployeeColumns = (
  onEdit: (emp: Employee) => void,
  onDelete: (id: string) => void,
  onView: (emp: Employee) => void
): ColumnDef<Employee>[] => [
  {
    id: "serial",
    header: "Sr.",
    cell: ({ row }) => <span className="font-mono text-[10px] font-bold text-muted-foreground">{row.index + 1}</span>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "fullName",
    header: "Employee Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        {row.original.profilePhotoUrl ? (
          <img src={row.original.profilePhotoUrl} alt="" className="w-8 h-8 rounded-lg object-cover border border-border/50 shadow-sm" />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-[10px] border border-primary/20">
            {row.original.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
        )}
        <div>
          <div className="font-black text-[12px] text-slate-900 leading-tight">{row.original.fullName}</div>
          <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest truncate max-w-[120px]">
            {row.original.address || "No Address"}
          </div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "clientEmpCode",
    header: "Client Code",
    cell: ({ row }) => <span className="font-mono text-[10px] font-bold">{row.original.clientEmpCode || "—"}</span>,
  },
  {
    accessorKey: "peopleEmpCode",
    header: "People Code",
    cell: ({ row }) => <span className="font-mono text-[10px] font-bold">{row.original.peopleEmpCode || "—"}</span>,
  },
  {
    accessorKey: "department",
    header: "Department",
    cell: ({ row }) => <span className="text-[10px] font-black uppercase tracking-wider text-slate-900 border-l border-slate-200 pl-2">{row.original.department}</span>,
  },
  {
    accessorKey: "designation",
    header: "Designation",
    cell: ({ row }) => <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.1em]">{row.original.designation}</span>,
  },
  {
    accessorKey: "joiningDate",
    header: "Joining",
    cell: ({ row }) => <span className="text-[10px] font-bold">{fmt(row.original.joiningDate).split(' ').slice(0,2).join(' ')}</span>,
  },
  {
    accessorKey: "birthDate",
    header: "Birth",
    cell: ({ row }) => <span className="text-[10px] font-bold">{fmt(row.original.birthDate).split(' ').slice(0,2).join(' ')}</span>,
  },
  {
    id: "age",
    header: "Age",
    cell: ({ row }) => <span className="text-[10px] font-black text-primary px-2 py-0.5 bg-primary/5 rounded">{calculateAge(row.original.birthDate)}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status
      const labels = {
         active: { label: "Active", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
         on_leave: { label: "On Leave", className: "bg-amber-100 text-amber-700 border-amber-200" },
         terminated: { label: "Terminated", className: "bg-rose-100 text-rose-700 border-rose-200" },
         resigned: { label: "Resigned", className: "bg-gray-100 text-gray-600 border-gray-200" },
      }
      const cfg = (labels as any)[status] || { label: status, className: "" }
      return <span className={`inline-flex items-center text-[9px] font-black uppercase tracking-widest px-2 py-0.25 rounded-full border ${cfg.className}`}>{cfg.label}</span>
    },
  },
  {
    id: "attachments",
    header: "Files",
    cell: ({ row }) => <AttachmentCountBadge attachments={(row.original as any).attachments} onClick={() => onView(row.original)} />,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const emp = row.original
      return (
        <div className="flex items-center justify-end gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="w-3.5 h-3.5 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[140px]">
              <DropdownMenuItem onClick={() => onView(emp)} className="text-[11px] font-bold uppercase">
                <Eye className="w-3.5 h-3.5 mr-2" /> View Report
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(emp)} className="text-[11px] font-bold uppercase">
                <Edit2 className="w-3.5 h-3.5 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(emp.id)} className="text-[11px] font-bold uppercase text-rose-600 focus:text-rose-600">
                <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
