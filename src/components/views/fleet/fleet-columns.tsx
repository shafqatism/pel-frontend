"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit2, Trash2, MoreHorizontal, Pencil, Eye, Truck, Fuel, MapPin, User, Calendar } from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

const fmt = (d?: string) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"

export const getVehicleColumns = (
  onEdit: (data: any) => void,
  onDelete: (id: string) => void
): ColumnDef<any>[] => [
  {
    id: "serial",
    header: "Sr.",
    cell: ({ row }) => <span className="font-mono text-[10px] font-bold text-muted-foreground">{row.index + 1}</span>,
  },
  {
    accessorKey: "registrationNumber",
    header: "Vehicle Identity",
    cell: ({ row }) => (
      <div>
        <div className="font-mono text-[11px] font-black text-primary uppercase tracking-tighter leading-tight">{row.original.registrationNumber}</div>
        <div className="text-[9px] font-bold text-muted-foreground uppercase truncate max-w-[120px]">{row.original.vehicleName}</div>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Classification",
    cell: ({ row }) => (
      <div>
        <div className="text-[11px] font-bold capitalize leading-tight">{row.original.type?.replace('_',' ')}</div>
        <div className="text-[9px] font-bold text-muted-foreground uppercase opacity-70 italic">{row.original.fuelType} • {row.original.ownershipStatus?.replace('_',' ')}</div>
      </div>
    ),
  },
  {
    accessorKey: "assignedSite",
    header: "Assignment",
    cell: ({ row }) => (
      <div>
        <div className="text-[11px] font-black uppercase tracking-tight text-slate-800 border-l border-slate-200 pl-2">{row.original.assignedSite || "Unassigned"}</div>
        <div className="text-[9px] font-bold text-muted-foreground uppercase opacity-60 ml-2">{row.original.currentDriverName || "No driver"}</div>
      </div>
    ),
  },
  {
    accessorKey: "currentOdometerKm",
    header: "Odometer",
    cell: ({ row }) => (
      <span className="font-mono text-[11px] font-black">
        {row.original.currentOdometerKm?.toLocaleString() || 0} <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">km</span>
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const s = row.original.status
      if (s === 'active') return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 capitalize text-[9px]">{s}</Badge>
      if (s === 'in_maintenance') return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 capitalize text-[9px]">Maintenance</Badge>
      return <Badge variant="secondary" className="capitalize text-[9px]">{s}</Badge>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex items-center justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="w-3.5 h-3.5" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[120px]">
            <DropdownMenuItem onClick={() => onEdit(row.original)} className="text-[10px] font-bold uppercase">
              <Pencil className="w-3.5 h-3.5 mr-2" />Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-rose-600 focus:text-rose-600 text-[10px] font-bold uppercase" onClick={() => onDelete(row.original.id)}>
              <Trash2 className="w-3.5 h-3.5 mr-2" />Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
]

export const getFuelColumns = (
  onEdit: (data: any) => void,
  onDelete: (id: string) => void
): ColumnDef<any>[] => [
  {
    id: "serial",
    header: "Sr.",
    cell: ({ row }) => <span className="font-mono text-[10px] font-bold text-muted-foreground">{row.index + 1}</span>,
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => <span className="text-[11px] font-bold">{fmt(row.original.date)}</span>,
  },
  {
    accessorKey: "vehicle",
    header: "Vehicle",
    cell: ({ row }) => (
      <div>
        <div className="font-mono text-[10px] font-black text-primary leading-tight">{row.original.vehicle?.registrationNumber || "N/A"}</div>
        <div className="text-[9px] font-bold text-muted-foreground uppercase truncate max-w-[100px] opacity-70 italic">{row.original.vehicle?.vehicleName}</div>
      </div>
    ),
  },
  {
    accessorKey: "odometerReading",
    header: "Odometer",
    cell: ({ row }) => <span className="font-mono text-[11px] font-black">{Number(row.original.odometerReading).toLocaleString()} <span className="text-[8px] opacity-50">km</span></span>,
  },
  {
    accessorKey: "quantityLiters",
    header: "Qty (L)",
    cell: ({ row }) => <span className="font-black text-[11px]">{Number(row.original.quantityLiters).toFixed(1)}</span>,
  },
  {
    accessorKey: "totalCost",
    header: "Total Cost",
    cell: ({ row }) => <span className="font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded leading-tight">PKR {Number(row.original.totalCost).toLocaleString()}</span>,
  },
  {
    accessorKey: "paymentMethod",
    header: "Payment",
    cell: ({ row }) => <Badge variant="outline" className="text-[8px] font-black uppercase px-1.5 py-0 rounded-md border-slate-200">{row.original.paymentMethod}</Badge>,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex items-center justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="w-3.5 h-3.5" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[120px]">
            <DropdownMenuItem onClick={() => onEdit(row.original)} className="text-[10px] font-bold uppercase">
              <Pencil className="w-3.5 h-3.5 mr-2" />Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-rose-600 focus:text-rose-600 text-[10px] font-bold uppercase" onClick={() => onDelete(row.original.id)}>
              <Trash2 className="w-3.5 h-3.5 mr-2" />Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
]

export const getAssignmentColumns = (
  onEdit: (data: any) => void,
  onDelete: (id: string) => void
): ColumnDef<any>[] => [
  {
    id: "serial",
    header: "Sr.",
    cell: ({ row }) => <span className="font-mono text-[10px] font-bold text-muted-foreground">{row.index + 1}</span>,
  },
  {
    accessorKey: "vehicle",
    header: "Vehicle",
    cell: ({ row }) => (
      <div>
        <div className="font-mono text-[10px] font-black text-primary leading-tight">{row.original.vehicle?.registrationNumber || "N/A"}</div>
        <div className="text-[9px] font-bold text-muted-foreground uppercase truncate max-w-[100px] opacity-70 italic">{row.original.vehicle?.vehicleName}</div>
      </div>
    ),
  },
  {
    accessorKey: "assignedTo",
    header: "Assigned To",
    cell: ({ row }) => (
      <div>
        <div className="text-[11px] font-black text-slate-900 leading-tight uppercase">{row.original.assignedTo}</div>
        <div className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">Auth by: {row.original.assignedBy}</div>
      </div>
    ),
  },
  {
    accessorKey: "assignmentDate",
    header: "Timeline",
    cell: ({ row }) => (
      <div>
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">START: {fmt(row.original.assignmentDate)}</div>
        <div className={`text-[10px] font-bold uppercase mt-1 leading-none ${row.original.returnDate && new Date(row.original.returnDate) < new Date() && row.original.status === 'active' ? "text-rose-600 animate-pulse" : "text-slate-400"}`}>
          END: {row.original.returnDate ? fmt(row.original.returnDate) : "OPEN-ENDED"}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "purpose",
    header: "Purpose",
    cell: ({ row }) => <span className="text-[10px] font-bold text-muted-foreground uppercase truncate max-w-[140px] block">{row.original.purpose || "—"}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const s = row.original.status
      if (s === 'active') return <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 text-[9px] font-black uppercase">Active</Badge>
      if (s === 'returned') return <Badge variant="outline" className="text-[9px] font-black uppercase opacity-50 px-1.5 py-0 border-slate-200">Returned</Badge>
      return <Badge variant="secondary" className="text-[9px] font-black uppercase">{s}</Badge>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex items-center justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="w-3.5 h-3.5" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[120px]">
            <DropdownMenuItem onClick={() => onEdit(row.original)} className="text-[10px] font-bold uppercase">
              <Pencil className="w-3.5 h-3.5 mr-2" />Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-rose-600 focus:text-rose-600 text-[10px] font-bold uppercase" onClick={() => onDelete(row.original.id)}>
              <Trash2 className="w-3.5 h-3.5 mr-2" />Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
]

export const getMaintenanceColumns = (
  onEdit: (data: any) => void,
  onDelete: (id: string) => void
): ColumnDef<any>[] => [
  {
    id: "serial",
    header: "Sr.",
    cell: ({ row }) => <span className="font-mono text-[10px] font-bold text-muted-foreground">{row.index + 1}</span>,
  },
  {
    accessorKey: "serviceDate",
    header: "Service Date",
    cell: ({ row }) => <span className="text-[11px] font-bold">{fmt(row.original.serviceDate)}</span>,
  },
  {
    accessorKey: "vehicle",
    header: "Vehicle",
    cell: ({ row }) => (
      <div>
        <div className="font-mono text-[10px] font-black text-primary leading-tight">{row.original.vehicle?.registrationNumber || "N/A"}</div>
        <div className="text-[9px] font-bold text-muted-foreground uppercase opacity-70 italic">{row.original.vehicle?.vehicleName}</div>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Service Details",
    cell: ({ row }) => (
      <div>
        <div className="text-[11px] font-black text-slate-800 uppercase leading-tight">{row.original.type?.replace('_',' ')}</div>
        <div className="text-[9px] font-bold text-muted-foreground uppercase opacity-60 truncate max-w-[150px]">{row.original.description}</div>
      </div>
    ),
  },
  {
    accessorKey: "cost",
    header: "Cost",
    cell: ({ row }) => <span className="font-black text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded leading-tight">PKR {Number(row.original.cost).toLocaleString()}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const s = row.original.status
      if (s === 'completed') return <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 text-[9px] font-black uppercase">Completed</Badge>
      if (s === 'scheduled') return <Badge variant="outline" className="text-[9px] font-black uppercase opacity-70 px-1.5 py-0 border-slate-200">Scheduled</Badge>
      return <Badge variant="secondary" className="text-[9px] font-black uppercase">{s}</Badge>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex items-center justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="w-3.5 h-3.5" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[120px]">
            <DropdownMenuItem onClick={() => onEdit(row.original)} className="text-[10px] font-bold uppercase">
              <Pencil className="w-3.5 h-3.5 mr-2" />Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-rose-600 focus:text-rose-600 text-[10px] font-bold uppercase" onClick={() => onDelete(row.original.id)}>
              <Trash2 className="w-3.5 h-3.5 mr-2" />Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
]

export const getTripColumns = (
  onEdit: (data: any) => void,
  onDelete: (id: string) => void
): ColumnDef<any>[] => [
  {
    id: "serial",
    header: "Sr.",
    cell: ({ row }) => <span className="font-mono text-[10px] font-bold text-muted-foreground">{row.index + 1}</span>,
  },
  {
    accessorKey: "tripDate",
    header: "Trip Details",
    cell: ({ row }) => (
      <div>
        <div className="text-[11px] font-black text-slate-800 leading-tight uppercase">{fmt(row.original.tripDate)}</div>
        <div className="font-mono text-[9px] font-bold text-primary uppercase opacity-70">{row.original.vehicle?.registrationNumber}</div>
      </div>
    ),
  },
  {
    accessorKey: "origin",
    header: "Route",
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-bold text-slate-700 uppercase">{row.original.origin}</span>
        </div>
        <div className="flex items-center gap-1.5 border-l-2 border-slate-200 ml-0.5 pl-1.5 my-0.5 py-0.5">
           <span className="text-[9px] font-bold text-muted-foreground italic">{row.original.purpose || "Transport"}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          <span className="text-[10px] font-bold text-slate-700 uppercase">{row.original.destination}</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "startOdometer",
    header: "Odo Delta",
    cell: ({ row }) => {
      const delta = (row.original.endOdometer || 0) - (row.original.startOdometer || 0)
      return (
        <div>
          <div className="text-[11px] font-black text-slate-800">{delta.toLocaleString()} <span className="text-[8px] opacity-50">km</span></div>
          <div className="text-[9px] font-bold text-muted-foreground opacity-60 uppercase">{row.original.startOdometer?.toLocaleString()} → {row.original.endOdometer?.toLocaleString()}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "driverName",
    header: "Driver",
    cell: ({ row }) => <span className="text-[10px] font-bold text-muted-foreground uppercase">{row.original.driverName}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const s = row.original.status
      if (s === 'completed') return <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 text-[9px] font-black uppercase">Completed</Badge>
      if (s === 'in_progress') return <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/20 text-[9px] font-black uppercase animate-pulse">Running</Badge>
      return <Badge variant="secondary" className="text-[9px] font-black uppercase">{s}</Badge>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex items-center justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="w-3.5 h-3.5" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[120px]">
            <DropdownMenuItem onClick={() => onEdit(row.original)} className="text-[10px] font-bold uppercase">
              <Pencil className="w-3.5 h-3.5 mr-2" />Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-rose-600 focus:text-rose-600 text-[10px] font-bold uppercase" onClick={() => onDelete(row.original.id)}>
              <Trash2 className="w-3.5 h-3.5 mr-2" />Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
]
