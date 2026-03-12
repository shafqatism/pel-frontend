"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Building2, Plus, Search, Filter, MoreHorizontal,
  Mail, Phone, MapPin, Edit, Trash2,
  CheckCircle2, ExternalLink, ArrowUpRight,
  Globe, RefreshCw, AlertCircle, Users, Briefcase, Map,
  FileText, Download, Calendar, User, Camera, ShieldCheck,
  Eye, Paperclip
} from "lucide-react"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { format, parseISO } from "date-fns"
import { AttachmentCountBadge } from "@/components/common/record-report-modal"

const CATEGORY_COLORS: Record<string, string> = {
  vendor:  "bg-blue-50 text-blue-700 border-blue-200",
  client:  "bg-amber-50 text-amber-700 border-amber-200",
  partner: "bg-purple-50 text-purple-700 border-purple-200",
}
const STATUS_COLORS: Record<string, string> = {
  active:   "bg-emerald-50 text-emerald-700 border-emerald-200",
  inactive: "bg-rose-50 text-rose-700 border-rose-200",
}

export const getCompanyColumns = (
  onEdit: (id: string) => void,
  onDelete: (id: string) => void,
  onReport?: (data: any) => void
): ColumnDef<any>[] => [
  {
    id: "serial",
    header: "Sr.",
    cell: ({ row }) => <span className="font-mono text-[10px] font-bold text-muted-foreground">{row.index + 1}</span>,
  },
  {
    accessorKey: "name",
    header: "Organization",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-[9px] font-black text-primary shrink-0 uppercase">
          {row.original.name.substring(0, 2)}
        </div>
        <div className="min-w-0">
          <div className="font-bold text-[11px] truncate flex items-center gap-1">
            {row.original.name}
            {row.original.website && (
              <a href={row.original.website} target="_blank" rel="noopener noreferrer" className="opacity-0 group-hover:opacity-100">
                <ExternalLink className="w-2.5 h-2.5 text-muted-foreground" />
              </a>
            )}
          </div>
          <div className="flex gap-2 mt-0.5 flex-wrap">
            {row.original.email && <span className="text-[9px] text-muted-foreground flex items-center gap-0.5 font-medium italic"><Mail className="w-2.5 h-2.5" />{row.original.email}</span>}
          </div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "taxId",
    header: "Identifiers",
    cell: ({ row }) => (
      <div className="space-y-0.5 text-[9px] font-bold">
        {row.original.registrationNumber && <div className="text-muted-foreground">REG: <span className="text-foreground tracking-tighter">{row.original.registrationNumber}</span></div>}
        {row.original.taxId && <div className="text-muted-foreground">NTN: <span className="text-foreground tracking-tighter">{row.original.taxId}</span></div>}
      </div>
    ),
  },
  {
    accessorKey: "contactPerson",
    header: "Focal Person",
    cell: ({ row }) => (
      <div>
        <div className="text-[11px] font-bold text-slate-800 uppercase">{row.original.contactPerson || "—"}</div>
        <div className="text-[9px] font-bold text-muted-foreground">{row.original.phone || "No contact"}</div>
      </div>
    ),
  },
  {
    accessorKey: "city",
    header: "Location",
    cell: ({ row }) => (
      <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 uppercase">
        <MapPin className="w-2.5 h-2.5 shrink-0 text-rose-400" />
        {row.original.city ? `${row.original.city}, ${row.original.country}` : "Global"}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <Badge variant="outline" className={`w-fit text-[8px] h-4 font-black uppercase tracking-widest ${STATUS_COLORS[row.original.status] ?? ""}`}>{row.original.status}</Badge>
        <Badge variant="outline" className={`w-fit text-[8px] h-4 font-black uppercase tracking-widest ${CATEGORY_COLORS[row.original.category] ?? ""}`}>{row.original.category}</Badge>
      </div>
    ),
  },
  {
    id: "attachments",
    header: "Files",
    cell: ({ row }) => <AttachmentCountBadge attachments={row.original.attachments} onClick={() => onReport?.(row.original)} />,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex items-center justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="w-3.5 h-3.5" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[140px]">
            {onReport && (
              <>
                <DropdownMenuItem onClick={() => onReport(row.original)} className="text-[10px] font-bold uppercase">
                  <Eye className="w-3.5 h-3.5 mr-2" />View Report
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={() => onEdit(row.original.id)} className="text-[10px] font-bold uppercase">
              <Edit className="w-3.5 h-3.5 mr-2" />Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-rose-600 focus:text-rose-600 text-[10px] font-bold uppercase" onClick={() => { if(confirm("Remove this organization?")) onDelete(row.original.id) }}>
              <Trash2 className="w-3.5 h-3.5 mr-2" />Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
]

export const getProjectColumns = (
  onEdit: (id: string) => void,
  onDelete: (id: string) => void,
  onReport?: (data: any) => void
): ColumnDef<any>[] => [
  {
    id: "serial",
    header: "Sr.",
    cell: ({ row }) => <span className="font-mono text-[10px] font-bold text-muted-foreground">{row.index + 1}</span>,
  },
  {
    accessorKey: "name",
    header: "Project Details",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 italic font-black text-blue-600 text-[10px]">P</div>
        <div>
          <div className="font-black text-[11px] uppercase tracking-tight text-slate-900">{row.original.name}</div>
          <div className="text-[9px] font-bold text-muted-foreground uppercase opacity-70">{row.original.clientName || "Direct Project"}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "projectCode",
    header: "Code",
    cell: ({ row }) => <span className="font-mono text-[10px] font-black text-primary px-1.5 py-0.5 bg-primary/5 rounded border border-primary/10 uppercase tracking-tighter">{row.original.projectCode}</span>,
  },
  {
    accessorKey: "manager",
    header: "Management",
    cell: ({ row }) => (
      <div>
        <div className="text-[11px] font-black text-slate-800 uppercase">{row.original.manager || "—"}</div>
        <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{row.original.department || "No Dept"}</div>
      </div>
    ),
  },
  {
    accessorKey: "budget",
    header: "Timeline & Budget",
    cell: ({ row }) => (
      <div>
        <div className="text-[10px] font-black text-emerald-600">PKR {Number(row.original.budget || 0).toLocaleString()}</div>
        <div className="text-[9px] font-bold text-muted-foreground opacity-60 italic">{row.original.startDate ? new Date(row.original.startDate).getFullYear() : "—"} → {row.original.endDate ? new Date(row.original.endDate).getFullYear() : "—"}</div>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="outline" className={`text-[8px] font-black uppercase tracking-widest h-4 px-2 ${
        row.original.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
        row.original.status === 'completed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
        'bg-slate-50 text-slate-600 border-slate-200'
      }`}>{row.original.status}</Badge>
    ),
  },
  {
    id: "attachments",
    header: "Files",
    cell: ({ row }) => <AttachmentCountBadge attachments={row.original.attachments} onClick={() => onReport?.(row.original)} />,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex items-center justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="w-3.5 h-3.5" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[140px]">
            {onReport && (
              <>
                <DropdownMenuItem onClick={() => onReport(row.original)} className="text-[10px] font-bold uppercase">
                  <Eye className="w-3.5 h-3.5 mr-2" />View Report
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={() => onEdit(row.original.id)} className="text-[10px] font-bold uppercase">
              <Edit className="w-3.5 h-3.5 mr-2" />Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-rose-600 focus:text-rose-600 text-[10px] font-bold uppercase" onClick={() => { if(confirm("Remove this project?")) onDelete(row.original.id) }}>
              <Trash2 className="w-3.5 h-3.5 mr-2" />Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
]

export const getSiteColumns = (
  onEdit: (id: string) => void,
  onDelete: (id: string) => void,
  fmt: (d: string) => string,
  onReport?: (data: any) => void
): ColumnDef<any>[] => [
  {
    id: "serial",
    header: "Sr.",
    cell: ({ row }) => <span className="font-mono text-[10px] font-bold text-muted-foreground">{row.index + 1}</span>,
  },
  {
    accessorKey: "siteName",
    header: "Site / Location",
    cell: ({ row }) => (
      <div>
        <div className="font-black text-[11px] uppercase tracking-tight text-slate-900">{row.original.siteName}</div>
        <div className="text-[9px] font-bold text-primary uppercase tracking-tighter opacity-80 mb-0.5">{row.original.project?.name || "No Block Assigned"}</div>
        <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground uppercase opacity-60 italic">
          <MapPin className="w-2.5 h-2.5 shrink-0 text-rose-400" />
          {row.original.district}, {row.original.province}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "phase",
    header: "Phase",
    cell: ({ row }) => (
      <Badge variant="outline" className={`text-[8px] font-black uppercase tracking-widest h-4 px-2 ${
        row.original.phase === 'production' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
        row.original.phase === 'drilling' ? 'bg-amber-50 text-amber-700 border-amber-200' :
        row.original.phase === 'exploration' ? 'bg-blue-50 text-blue-700 border-blue-200' :
        'bg-slate-50 text-slate-600 border-slate-200'
      }`}>{row.original.phase}</Badge>
    ),
  },
  {
    accessorKey: "siteInCharge",
    header: "Field Command",
    cell: ({ row }) => (
      <div>
        {row.original.fieldOfficers && row.original.fieldOfficers.filter((f: any) => f.status === 'active').length > 0 ? (
          row.original.fieldOfficers.filter((f: any) => f.status === 'active').map((fo: any) => (
            <div key={fo.id} className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-700 tracking-tight">
              <User className="w-2.5 h-2.5 text-primary opacity-50" /> {fo.employee?.fullName}
            </div>
          ))
        ) : (
          <div className="text-[10px] font-bold text-muted-foreground uppercase italic opacity-40">Unassigned</div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "startDate",
    header: "Commencement",
    cell: ({ row }) => (
      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
        {row.original.startDate ? fmt(row.original.startDate) : "—"}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="outline" className={`text-[8px] font-black uppercase tracking-widest h-4 px-2 ${
        row.original.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
      }`}>{row.original.status}</Badge>
    ),
  },
  {
    id: "attachments",
    header: "Files",
    cell: ({ row }) => <AttachmentCountBadge attachments={row.original.attachments} onClick={() => onReport?.(row.original)} />,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex items-center justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="w-3.5 h-3.5" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[140px]">
            {onReport && (
              <>
                <DropdownMenuItem onClick={() => onReport(row.original)} className="text-[10px] font-bold uppercase">
                  <Eye className="w-3.5 h-3.5 mr-2" />View Report
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={() => onEdit(row.original.id)} className="text-[10px] font-bold uppercase">
              <Edit className="w-3.5 h-3.5 mr-2" />Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-rose-600 focus:text-rose-600 text-[10px] font-bold uppercase" onClick={() => { if(confirm("Delete this site?")) onDelete(row.original.id) }}>
              <Trash2 className="w-3.5 h-3.5 mr-2" />Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
]

export const getFoodColumns = (
  onEdit: (id: string, data: any) => void,
  onDelete: (id: string) => void,
  fmt: (d: string) => string
): ColumnDef<any>[] => [
  {
    id: "serial",
    header: "Sr.",
    cell: ({ row }) => <span className="font-mono text-[10px] font-bold text-muted-foreground">{row.index + 1}</span>,
  },
  {
    accessorKey: "date",
    header: "Service Date",
    cell: ({ row }) => (
      <div>
        <div className="font-bold text-[11px] uppercase tracking-tight text-slate-900">{fmt(row.original.date)}</div>
        <div className="text-[9px] font-bold text-muted-foreground uppercase opacity-60 italic">{row.original.site || "No Site"}</div>
      </div>
    ),
  },
  {
    accessorKey: "mealType",
    header: "Meal Session",
    cell: ({ row }) => (
      <Badge variant="outline" className={`text-[8px] font-black uppercase tracking-widest h-4 px-2 ${
        row.original.mealType === 'breakfast' ? 'bg-amber-50 text-amber-700 border-amber-200' :
        row.original.mealType === 'lunch' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
        'bg-blue-50 text-blue-700 border-blue-200'
      }`}>{row.original.mealType}</Badge>
    ),
  },
  {
    accessorKey: "menuItems",
    header: "Culinary Menu",
    cell: ({ row }) => (
      <div className="max-w-[180px] truncate text-[10px] font-medium text-slate-600 italic" title={row.original.menuItems}>
        {row.original.menuItems || "—"}
      </div>
    ),
  },
  {
    accessorKey: "headCount",
    header: "Headcount",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        <Users className="w-2.5 h-2.5 text-primary opacity-50" />
        <span className="text-[11px] font-black text-slate-700">{row.original.headCount}</span>
      </div>
    ),
  },
  {
    accessorKey: "totalCost",
    header: "Revenue / Cost",
    cell: ({ row }) => (
      <div>
        <div className="text-[10px] font-black text-rose-600">PKR {Number(row.original.totalCost).toLocaleString()}</div>
        <div className="text-[8px] font-bold text-muted-foreground opacity-60 uppercase tracking-tighter">{row.original.costPerHead} / Head</div>
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex items-center justify-end">
        <DropdownMenu inverse align="end">
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="w-3.5 h-3.5" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[120px]">
            <DropdownMenuItem onClick={() => onEdit(row.original.id, row.original)} className="text-[10px] font-bold uppercase">
              <Edit className="w-3.5 h-3.5 mr-2" />Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-rose-600 focus:text-rose-600 text-[10px] font-bold uppercase" onClick={() => { if(confirm("Delete this record?")) onDelete(row.original.id) }}>
              <Trash2 className="w-3.5 h-3.5 mr-2" />Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
]

export const getDocumentColumns = (
  onEdit: (id: string, data: any) => void,
  onDelete: (id: string) => void,
  categories: any[],
  onReport?: (data: any) => void
): ColumnDef<any>[] => [
  {
    id: "serial",
    header: "Sr.",
    cell: ({ row }) => <span className="font-mono text-[10px] font-bold text-muted-foreground">{row.index + 1}</span>,
  },
  {
    accessorKey: "title",
    header: "Document Identity",
    cell: ({ row }) => (
      <div className="flex items-start gap-2.5">
        <div className="p-1.5 rounded-lg bg-primary/5 text-primary border border-primary/10 mt-0.5">
          <FileText className="w-3 h-3" />
        </div>
        <div>
          <div className="font-black text-[11px] uppercase tracking-tight text-slate-900 leading-tight">{row.original.title}</div>
          {row.original.description && <p className="text-[9px] text-muted-foreground mt-0.5 line-clamp-1 italic font-medium opacity-70">{row.original.description}</p>}
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {(row.original.tags ?? []).map((t: string) => (
              <Badge key={t} variant="outline" className="text-[8px] font-bold uppercase tracking-tighter px-1.5 py-0 border-primary/10 bg-primary/5 text-primary/80 h-3.5">
                {t}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: "Vulnerability / Class",
    cell: ({ row }) => {
      const cat = categories.find(c => c.id === row.original.category)
      return (
        <Badge variant="outline" className={`text-[8px] font-black uppercase tracking-widest h-4 px-2 ${cat?.bg || "bg-slate-50"} ${cat?.color || "text-slate-600"}`}>
          {cat?.label || row.original.category}
        </Badge>
      )
    },
  },
  {
    accessorKey: "department",
    header: "Organizational Context",
    cell: ({ row }) => (
      <div className="space-y-0.5">
        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-700 tracking-tight">
          <Briefcase className="w-2.5 h-2.5 text-primary opacity-50" /> {row.original.department || "No Dept"}
        </div>
        <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground/60 font-bold uppercase tracking-widest italic leading-none">
          <MapPin className="w-2.5 h-2.5 opacity-50" /> {row.original.site || "Global"}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Filed On",
    cell: ({ row }) => (
      <div className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5 font-mono">
        <Calendar className="w-3 h-3 opacity-40" /> {new Date(row.original.createdAt).toLocaleDateString("en-GB")}
      </div>
    ),
  },
  {
    id: "attachments",
    header: "Files",
    cell: ({ row }) => <AttachmentCountBadge attachments={row.original.attachments} onClick={() => onReport?.(row.original)} />,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex items-center justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="w-3.5 h-3.5" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[140px]">
            {onReport && (
              <>
                <DropdownMenuItem onClick={() => onReport(row.original)} className="text-[10px] font-bold uppercase">
                  <Eye className="w-3.5 h-3.5 mr-2" />View Report
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem asChild className="text-[10px] font-bold uppercase">
              <a href={row.original.fileUrl} target="_blank" rel="noopener noreferrer">
                <Download className="w-3.5 h-3.5 mr-2" />Secure Link
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(row.original.id, row.original)} className="text-[10px] font-bold uppercase">
              <Edit className="w-3.5 h-3.5 mr-2" />Edit Meta
            </DropdownMenuItem>
            <DropdownMenuItem className="text-rose-600 focus:text-rose-600 text-[10px] font-bold uppercase" onClick={() => { if(confirm("Permanently archive this document?")) onDelete(row.original.id) }}>
              <Trash2 className="w-3.5 h-3.5 mr-2" />Archive
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
]

export const getLandRentalColumns = (
  onEdit: (id: string, data: any) => void,
  onDelete: (id: string) => void,
  fmt: (d: string) => string,
  onReport?: (data: any) => void
): ColumnDef<any>[] => [
  {
    id: "serial",
    header: "Sr.",
    cell: ({ row }) => <span className="font-mono text-[10px] font-bold text-muted-foreground">{row.index + 1}</span>,
  },
  {
    accessorKey: "landOwnerName",
    header: "Ownership & Asset",
    cell: ({ row }) => (
      <div>
        <div className="font-black text-[11px] uppercase tracking-tight text-slate-900 leading-tight">{row.original.landOwnerName}</div>
        <div className="text-[9px] font-bold text-primary uppercase tracking-tighter opacity-80 mb-0.5">{row.original.site?.siteName || "No Site Assigned"}</div>
        <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground uppercase opacity-60 italic leading-none mt-1">
          <MapPin className="w-2.5 h-2.5 shrink-0 text-rose-400" />
          {row.original.location}, {row.original.district}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Lease Status",
    cell: ({ row }) => (
      <Badge variant="outline" className={`text-[8px] font-black uppercase tracking-widest h-4 px-2 ${
        row.original.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
        row.original.status === 'expired' ? 'bg-amber-50 text-amber-700 border-amber-200' :
        'bg-rose-50 text-rose-700 border-rose-200'
      }`}>{row.original.status}</Badge>
    ),
  },
  {
    accessorKey: "areaAcres",
    header: "Dimension",
    cell: ({ row }) => (
      <div className="text-[10px] font-black text-slate-700 uppercase tracking-tighter">
        {row.original.areaAcres ? `${row.original.areaAcres} Acres` : "—"}
      </div>
    ),
  },
  {
    accessorKey: "yearlyRent",
    header: "Annual Liability",
    cell: ({ row }) => (
      <div className="text-[10px] font-black text-emerald-600">
        PKR {Number(row.original.yearlyRent).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "leaseStartDate",
    header: "Tenure",
    cell: ({ row }) => (
      <div>
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{fmt(row.original.leaseStartDate)}</div>
        <div className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-tighter italic">
          {row.original.leaseEndDate ? `Exp: ${fmt(row.original.leaseEndDate)}` : "Open Tenure"}
        </div>
      </div>
    ),
  },
  {
    id: "attachments",
    header: "Files",
    cell: ({ row }) => <AttachmentCountBadge attachments={row.original.attachments} onClick={() => onReport?.(row.original)} />,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex items-center justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="w-3.5 h-3.5" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[140px]">
            {onReport && (
              <>
                <DropdownMenuItem onClick={() => onReport(row.original)} className="text-[10px] font-bold uppercase">
                  <Eye className="w-3.5 h-3.5 mr-2" />View Report
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={() => onEdit(row.original.id, row.original)} className="text-[10px] font-bold uppercase">
              <Edit className="w-3.5 h-3.5 mr-2" />Edit Meta
            </DropdownMenuItem>
            <DropdownMenuItem className="text-rose-600 focus:text-rose-600 text-[10px] font-bold uppercase" onClick={() => { if(confirm("Terminate this agreement permanently?")) onDelete(row.original.id) }}>
              <Trash2 className="w-3.5 h-3.5 mr-2" />Terminate
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
]

export const getAttendanceColumns = (
  onEdit: (id: string, data: any) => void,
  onDelete: (id: string) => void,
  fmtTime: (d: string | undefined) => string,
  statusConfig: any,
  onReport?: (data: any) => void
): ColumnDef<any>[] => [
  {
    id: "serial",
    header: "Sr.",
    cell: ({ row }) => <span className="font-mono text-[10px] font-bold text-muted-foreground">{row.index + 1}</span>,
  },
  {
    accessorKey: "employee.fullName",
    header: "Personnel Detail",
    cell: ({ row }) => (
      <div>
        <div className="font-black text-[11px] uppercase tracking-tight text-slate-900 leading-tight">{row.original.employee?.fullName}</div>
        <div className="text-[9px] font-bold text-muted-foreground uppercase opacity-60 italic tracking-tighter">{row.original.employee?.designation || "No Designation"}</div>
      </div>
    ),
  },
  {
    accessorKey: "checkIn",
    header: "Lifecycle (In/Out)",
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-black text-emerald-600 font-mono tracking-tighter w-8">{fmtTime(row.original.checkIn)}</span>
          {row.original.checkInLocation && <MapPin className="w-2.5 h-2.5 text-emerald-400 opacity-60" />}
          {row.original.checkInPhoto && <Camera className="w-2.5 h-2.5 text-emerald-400 opacity-60" />}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-black text-amber-600 font-mono tracking-tighter w-8">{fmtTime(row.original.checkOut)}</span>
          {row.original.checkOutLocation && <MapPin className="w-2.5 h-2.5 text-amber-400 opacity-60" />}
          {row.original.checkOutPhoto && <Camera className="w-2.5 h-2.5 text-amber-400 opacity-60" />}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "overtimeIn",
    header: "Overtime Window",
    cell: ({ row }) => (
      (row.original.overtimeIn || row.original.overtimeOut) ? (
        <div className="flex flex-col gap-0.5 opacity-70">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-bold text-slate-500 font-mono tracking-tighter w-8">{fmtTime(row.original.overtimeIn)}</span>
            {row.original.overtimeInLocation && <MapPin className="w-2 h-2 text-slate-400" />}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-bold text-slate-500 font-mono tracking-tighter w-8">{fmtTime(row.original.overtimeOut)}</span>
            {row.original.overtimeOutLocation && <MapPin className="w-2 h-2 text-slate-400" />}
          </div>
        </div>
      ) : <span className="text-[10px] text-muted-foreground italic font-medium opacity-30">—</span>
    ),
  },
  {
    accessorKey: "site",
    header: "Assigned Point",
    cell: ({ row }) => (
      row.original.site ? (
        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-700 tracking-tight">
          <MapPin className="w-2.5 h-2.5 text-primary opacity-50" /> {row.original.site}
        </div>
      ) : <span className="text-[10px] text-muted-foreground italic font-medium opacity-30">—</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Daily Status",
    cell: ({ row }) => {
      const cfg = statusConfig[row.original.status as keyof typeof statusConfig] ?? { label: row.original.status, className: "" }
      return <Badge variant="outline" className={`text-[8px] font-black uppercase tracking-widest h-4 px-2 ${cfg.className}`}>{cfg.label}</Badge>
    },
  },
  {
    id: "attachments",
    header: "Files",
    cell: ({ row }) => <AttachmentCountBadge attachments={row.original.attachments} onClick={() => onReport?.(row.original)} />,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex items-center justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="w-3.5 h-3.5" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[140px]">
            {onReport && (
              <>
                <DropdownMenuItem onClick={() => onReport(row.original)} className="text-[10px] font-bold uppercase">
                  <Eye className="w-3.5 h-3.5 mr-2" />View Report
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={() => onEdit(row.original.id, row.original)} className="text-[10px] font-bold uppercase">
              <Edit className="w-3.5 h-3.5 mr-2" />Edit Log
            </DropdownMenuItem>
            <DropdownMenuItem className="text-rose-600 focus:text-rose-600 text-[10px] font-bold uppercase" onClick={() => { if(confirm("Delete this attendance record?")) onDelete(row.original.id) }}>
              <Trash2 className="w-3.5 h-3.5 mr-2" />Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
]

export const getAttendanceHistoryColumns = (
  onView: (id: string, name: string) => void
): ColumnDef<any>[] => [
  {
    id: "serial",
    header: "Sr.",
    cell: ({ row }) => <span className="font-mono text-[10px] font-bold text-muted-foreground">{row.index + 1}</span>,
  },
  {
    accessorKey: "fullName",
    header: "Personnel Identity",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-[10px] border border-primary/10">
          {row.original.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
        </div>
        <div>
          <div className="font-black text-[11px] uppercase tracking-tight text-slate-900 leading-tight">{row.original.fullName}</div>
          <div className="text-[9px] font-bold text-muted-foreground uppercase opacity-60 tracking-tighter">ID: {row.original.id.slice(-8)}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "stats.present",
    header: "Presence",
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <span className="inline-flex h-6 w-10 items-center justify-center rounded bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-100">{row.original.stats.present}</span>
      </div>
    ),
  },
  {
    accessorKey: "stats.absent",
    header: "Absence",
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <span className="inline-flex h-6 w-10 items-center justify-center rounded bg-rose-50 text-rose-700 font-bold text-[11px] border border-rose-100">{row.original.stats.absent}</span>
      </div>
    ),
  },
  {
    accessorKey: "stats.leave",
    header: "Leaves",
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <span className="inline-flex h-6 w-10 items-center justify-center rounded bg-amber-50 text-amber-700 font-bold text-[11px] border border-amber-100">{row.original.stats.leave}</span>
      </div>
    ),
  },
  {
    accessorKey: "stats.late",
    header: "Latencies",
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <span className="inline-flex h-6 w-10 items-center justify-center rounded bg-orange-50 text-orange-700 font-bold text-[11px] border border-orange-100">{row.original.stats.late}</span>
      </div>
    ),
  },
  {
    accessorKey: "completion",
    header: "Operational Score",
    cell: ({ row }) => {
      const completion = Number(row.original.completion)
      return (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-slate-100 h-1 rounded-full overflow-hidden border border-slate-200">
            <div className="bg-primary h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, completion)}%` }}></div>
          </div>
          <span className="text-[9px] font-black text-primary w-6 text-right">{completion}%</span>
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex items-center justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          className="h-7 px-3 text-[9px] font-black uppercase tracking-widest border-primary/20 hover:bg-primary hover:text-white transition-all rounded-lg"
          onClick={() => onView(row.original.id, row.original.fullName)}
        >
          View Registry
        </Button>
      </div>
    ),
  },
]

export const getAttendanceDetailColumns = (
  fmtTime: (d: string | undefined) => string,
  StatusMarker: any,
  MiniInfo: any
): ColumnDef<any>[] => [
  {
    accessorKey: "date",
    header: "Registry Period",
    cell: ({ row }) => {
      const day = parseISO(row.original.date)
      const isSun = format(day, "eee") === "Sun"
      return (
        <div className="flex flex-col">
          <span className={`font-black text-[11px] uppercase tracking-tight ${isSun ? 'text-rose-600' : 'text-slate-900'}`}>{format(day, "dd MMM, yyyy")}</span>
          <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-40 leading-none tracking-widest">{format(day, "EEEE")}</span>
        </div>
      )
    }
  },
  {
    accessorKey: "status",
    header: "ST",
    cell: ({ row }) => <div className="flex justify-center"><StatusMarker status={row.original.record?.status} /></div>,
  },
  {
    accessorKey: "site",
    header: "Point",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-slate-700 tracking-tight">
        <MapPin className="w-2.5 h-2.5 text-primary opacity-40" /> {row.original.record?.site || (row.original.record ? "OFFICE" : "—")}
      </div>
    ),
  },
  {
    id: "regularShift",
    header: "Personnel Shift Logs",
    cell: ({ row }) => {
      const r = row.original.record
      return (
        <div className="flex items-center justify-center gap-6 py-0.5">
          <div className="flex flex-col items-center">
            <span className="text-[7px] font-black uppercase text-emerald-600/30 leading-none mb-0.5 tracking-widest">IN-PNT</span>
            <span className="text-[10px] font-black font-mono tracking-tighter text-slate-800">{fmtTime(r?.checkIn)}</span>
            <div className="flex gap-1 mt-0.5"><MiniInfo type="gps" value={r?.checkInLocation} label="GPS" /><MiniInfo type="img" value={r?.checkInPhoto} label="IMG" /></div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[7px] font-black uppercase text-rose-600/30 leading-none mb-0.5 tracking-widest">OUT-PNT</span>
            <span className="text-[10px] font-black font-mono tracking-tighter text-slate-800">{fmtTime(r?.checkOut)}</span>
            <div className="flex gap-1 mt-0.5"><MiniInfo type="gps" value={r?.checkOutLocation} label="GPS" /><MiniInfo type="img" value={r?.checkOutPhoto} label="IMG" /></div>
          </div>
        </div>
      )
    }
  },
  {
    id: "overtime",
    header: "Overtime Window",
    cell: ({ row }) => {
      const r = row.original.record
      if (!r?.overtimeIn) return <div className="text-center text-[9px] font-bold text-muted-foreground italic opacity-20 tracking-widest uppercase">— No OT recorded —</div>
      return (
        <div className="flex items-center justify-center gap-6 py-0.5">
          <div className="flex flex-col items-center">
            <span className="text-[7px] font-black uppercase text-sky-600/30 leading-none mb-0.5 tracking-widest">OT-IN</span>
            <span className="text-[10px] font-black font-mono tracking-tighter text-slate-800">{fmtTime(r?.overtimeIn)}</span>
            <div className="flex gap-1 mt-0.5"><MiniInfo type="gps" value={r?.overtimeInLocation} label="GPS" /><MiniInfo type="img" value={r?.overtimeInPhoto} label="IMG" /></div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[7px] font-black uppercase text-sky-600/30 leading-none mb-0.5 tracking-widest">OT-OUT</span>
            <span className="text-[10px] font-black font-mono tracking-tighter text-slate-800">{fmtTime(r?.overtimeOut)}</span>
            <div className="flex gap-1 mt-0.5"><MiniInfo type="gps" value={r?.overtimeOutLocation} label="GPS" /><MiniInfo type="img" value={r?.overtimeOutPhoto} label="IMG" /></div>
          </div>
        </div>
      )
    }
  },
  {
    id: "security",
    header: "Verification",
    cell: ({ row }) => {
      const r = row.original.record
      return (
        <div className="flex items-center justify-center gap-2">
          {r ? <div className="p-1 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm"><ShieldCheck className="w-3 h-3" /></div> : <div className="w-5 h-5" />}
          {r?.attachments?.length > 0 && <span className="text-[8px] font-bold text-primary underline decoration-primary/30">LGR {r.attachments.length}</span>}
        </div>
      )
    }
  }
]
