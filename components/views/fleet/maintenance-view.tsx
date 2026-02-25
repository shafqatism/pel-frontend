"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { fleetApi } from "@/lib/api/fleet"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Pencil, Trash2, RefreshCw, AlertTriangle, Wrench } from "lucide-react"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { useAppDispatch } from "@/lib/store"
import { openFleetDrawer } from "@/lib/store/slices/ui-slice"
import FleetHeader from "@/components/fleet/fleet-header"

const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })

const TYPE_COLORS: Record<string, string> = {
  oil_change: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  tire_change: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  brake_service: "bg-rose-500/10 text-rose-700 border-rose-500/20",
  engine_repair: "bg-red-500/10 text-red-700 border-red-500/20",
  routine_check: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  body_repair: "bg-purple-500/10 text-purple-700 border-purple-500/20",
}

export default function MaintenanceView() {
  const qc = useQueryClient()
  const dispatch = useAppDispatch()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const limit = 10

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["maintenance", { search, page }],
    queryFn: () => fleetApi.maintenance.list({ search, page, limit }),
  })

  const { mutate: deleteRecord } = useMutation({
    mutationFn: (id: string) => fleetApi.maintenance.delete(id),
    onSuccess: () => {
      toast.success("Maintenance record removed")
      qc.invalidateQueries({ queryKey: ["maintenance"] })
    }
  })

  const totalCost = data?.data.reduce((sum: number, m: any) => sum + Number(m.costPkr), 0) ?? 0

  return (
    <div className="space-y-6">
      <FleetHeader
        title="Maintenance Records"
        subtitle="Service history, scheduled maintenance & repair logs"
        type="maintenance"
        onSearch={setSearch}
        exportType="maintenance"
      />

      {data && (
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/5 border border-rose-500/10 text-sm">
            <Wrench className="w-4 h-4 text-rose-600" />
            <span className="font-semibold">PKR {totalCost.toLocaleString()}</span>
            <span className="text-muted-foreground">total maintenance cost (this page)</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/50 border border-border/50 text-sm">
            <span className="font-semibold">{data.total}</span>
            <span className="text-muted-foreground">total records</span>
          </div>
        </div>
      )}

      <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary opacity-20" />
            <p className="text-muted-foreground text-sm">Loading maintenance records...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center">
            <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-4" />
            <p className="font-semibold">Failed to load records</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-bold text-xs uppercase tracking-wide px-6">Vehicle</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Type</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Date</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Odometer</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Cost (PKR)</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Serviced By</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Next Service</TableHead>
                <TableHead className="w-12 px-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-64 text-center">
                    <Wrench className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    <p className="text-muted-foreground">No maintenance records found</p>
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((m: any) => (
                  <TableRow key={m.id} className="hover:bg-muted/10">
                    <TableCell className="px-6">
                      <div className="font-mono text-xs font-bold text-primary">{m.vehicle?.registrationNumber || "N/A"}</div>
                      <div className="text-xs text-muted-foreground">{m.vehicle?.vehicleName}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-[10px] capitalize px-2 ${TYPE_COLORS[m.type] || "bg-muted text-muted-foreground"}`}>
                        {m.type?.replace(/_/g, " ") || "Service"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{fmt(m.maintenanceDate)}</TableCell>
                    <TableCell className="font-mono text-sm">{Number(m.odometerAtMaintenanceKm || 0).toLocaleString()} km</TableCell>
                    <TableCell className="font-bold text-sm text-rose-600">
                      {Number(m.costPkr).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{m.shopOrPerson || "—"}</div>
                      <div className="text-[10px] text-muted-foreground uppercase">{m.maintenanceBy || "internal"}</div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {m.nextServiceDueDate ? fmt(m.nextServiceDueDate) : 
                       m.nextServiceOdometerKm ? `${Number(m.nextServiceOdometerKm).toLocaleString()} km` : "—"}
                    </TableCell>
                    <TableCell className="px-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => dispatch(openFleetDrawer({ type: 'maintenance', mode: 'edit', data: m }))}>
                            <Pencil className="w-3.5 h-3.5 mr-2" />Edit Record
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-rose-600 focus:text-rose-600" onClick={() => { if (confirm("Delete this record?")) deleteRecord(m.id) }}>
                            <Trash2 className="w-3.5 h-3.5 mr-2" />Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}

        {data && data.total > limit && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border/40">
            <p className="text-xs text-muted-foreground">Page {page} of {Math.ceil(data.total / limit)}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page >= Math.ceil(data.total / limit)} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
