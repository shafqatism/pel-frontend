"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Incident, SafetyAudit, HseDrill } from "@/lib/types/hse"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2, ShieldAlert, ClipboardCheck, Flame, Clock } from "lucide-react"

const fmt = (d?: string) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"

export const getIncidentColumns = (
  onEdit: (data: Incident) => void,
  onDelete: (id: string) => void
): ColumnDef<Incident>[] => [
  {
    id: "serial",
    header: "Sr.",
    cell: ({ row }) => <span className="font-mono text-[10px] font-bold text-muted-foreground">{row.index + 1}</span>,
  },
  {
    accessorKey: "title",
    header: "Incident & Date",
    cell: ({ row }) => (
      <div>
        <div className="font-black text-[12px] text-slate-900 leading-tight">{row.original.title}</div>
        <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{fmt(row.original.incidentDate)}</div>
      </div>
    ),
  },
  {
    accessorKey: "severity",
    header: "Severity",
    cell: ({ row }) => {
      const s = row.original.severity
      const colors = {
        critical: "bg-rose-100 text-rose-700 border-rose-200",
        high: "bg-orange-100 text-orange-700 border-orange-200",
        medium: "bg-amber-100 text-amber-700 border-amber-200",
        low: "bg-blue-100 text-blue-700 border-blue-200",
      }
      return (
        <span className={`inline-flex text-[9px] font-black px-2 py-0.5 rounded-full border uppercase ${(colors as any)[s] || ""}`}>
          {s}
        </span>
      )
    },
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => <span className="text-[11px] font-bold">{row.original.location}</span>,
  },
  {
    accessorKey: "reportedBy",
    header: "Reporter",
    cell: ({ row }) => <span className="text-[10px] font-bold text-muted-foreground uppercase">{row.original.reportedBy}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const s = row.original.status
      const colors = {
        open: "text-rose-600",
        investigating: "text-amber-600",
        closed: "text-emerald-600",
      }
      return <span className={`text-[10px] font-black uppercase ${(colors as any)[s] || ""}`}>{s}</span>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => onEdit(row.original)}>
          <Edit2 className="w-3.5 h-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-rose-600" onClick={() => onDelete(row.original.id)}>
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    ),
  },
]

export const getAuditColumns = (
  onEdit: (data: SafetyAudit) => void,
  onDelete: (id: string) => void
): ColumnDef<SafetyAudit>[] => [
  {
    id: "serial",
    header: "Sr.",
    cell: ({ row }) => <span className="font-mono text-[10px] font-bold text-muted-foreground">{row.index + 1}</span>,
  },
  {
    accessorKey: "auditTitle",
    header: "Audit Title",
    cell: ({ row }) => <span className="font-black text-[12px] text-slate-900 leading-tight">{row.original.auditTitle}</span>,
  },
  {
    accessorKey: "auditDate",
    header: "Date",
    cell: ({ row }) => <span className="text-[11px] font-bold">{fmt(row.original.auditDate)}</span>,
  },
  {
    accessorKey: "auditorName",
    header: "Auditor",
    cell: ({ row }) => <span className="text-[10px] font-bold text-muted-foreground uppercase">{row.original.auditorName}</span>,
  },
  {
    accessorKey: "score",
    header: "Score",
    cell: ({ row }) => {
      const s = row.original.score
      const color = s >= 90 ? "text-emerald-600" : s >= 70 ? "text-amber-600" : "text-rose-600"
      return <span className={`font-black ${color}`}>{s}%</span>
    },
  },
  {
    accessorKey: "findings",
    header: "Findings",
    cell: ({ row }) => <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{row.original.findings.replace("_", " ")}</span>,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => onEdit(row.original)}>
          <Edit2 className="w-3.5 h-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-rose-600" onClick={() => onDelete(row.original.id)}>
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    ),
  },
]

export const getDrillColumns = (
  onEdit: (data: HseDrill) => void,
  onDelete: (id: string) => void
): ColumnDef<HseDrill>[] => [
  {
    id: "serial",
    header: "Sr.",
    cell: ({ row }) => <span className="font-mono text-[10px] font-bold text-muted-foreground">{row.index + 1}</span>,
  },
  {
    accessorKey: "drillType",
    header: "Drill Type",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Flame className="w-3.5 h-3.5 text-orange-500" />
        <span className="font-black text-[12px] text-slate-900 leading-tight">{row.original.drillType}</span>
      </div>
    ),
  },
  {
    accessorKey: "drillDate",
    header: "Date",
    cell: ({ row }) => <span className="text-[11px] font-bold">{fmt(row.original.drillDate)}</span>,
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => <span className="text-[11px] font-bold">{row.original.location}</span>,
  },
  {
    accessorKey: "participantsCount",
    header: "Participants",
    cell: ({ row }) => <span className="text-[11px] font-black text-primary">{row.original.participantsCount}</span>,
  },
  {
    accessorKey: "durationMinutes",
    header: "Duration",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase opacity-70">
        <Clock className="w-3 h-3" /> {row.original.durationMinutes} mins
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => onEdit(row.original)}>
          <Edit2 className="w-3.5 h-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-rose-600" onClick={() => onDelete(row.original.id)}>
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    ),
  },
]
