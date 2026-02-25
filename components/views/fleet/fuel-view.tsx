"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { fleetApi } from "@/lib/api/fleet"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Pencil, Trash2, RefreshCw, AlertTriangle, Fuel } from "lucide-react"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { useAppDispatch } from "@/lib/store"
import { openFleetDrawer } from "@/lib/store/slices/ui-slice"
import FleetHeader from "@/components/fleet/fleet-header"

const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })

export default function FuelView() {
  const qc = useQueryClient()
  const dispatch = useAppDispatch()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const limit = 10

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["fuel", { search, page }],
    queryFn: () => fleetApi.fuel.list({ search, page, limit }),
  })

  const { mutate: deleteLog } = useMutation({
    mutationFn: (id: string) => fleetApi.fuel.delete(id),
    onSuccess: () => {
      toast.success("Fuel log deleted")
      qc.invalidateQueries({ queryKey: ["fuel"] })
    }
  })

  const totalCost = data?.data.reduce((sum: number, f: any) => sum + Number(f.totalCost), 0) ?? 0
  const totalLiters = data?.data.reduce((sum: number, f: any) => sum + Number(f.quantityLiters), 0) ?? 0

  return (
    <div className="space-y-6">
      <FleetHeader
        title="Fuel Logs"
        subtitle="Track fuel consumption, costs & station records"
        type="fuel"
        onSearch={setSearch}
        exportType="fuel"
      />

      {/* Summary Chips */}
      {data && (
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/5 border border-primary/10 text-sm">
            <Fuel className="w-4 h-4 text-primary" />
            <span className="font-semibold">{totalLiters.toFixed(0)} L</span>
            <span className="text-muted-foreground">total filled</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/5 border border-amber-500/10 text-sm">
            <span className="text-amber-600 font-bold">PKR</span>
            <span className="font-semibold">{totalCost.toLocaleString()}</span>
            <span className="text-muted-foreground">on this page</span>
          </div>
        </div>
      )}

      <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary opacity-20" />
            <p className="text-muted-foreground text-sm">Loading fuel logs...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center">
            <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-4" />
            <p className="font-semibold">Failed to load fuel logs</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-bold text-xs uppercase tracking-wide px-6">Date</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Vehicle</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Odometer</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Quantity</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Rate / Liter</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Total Cost</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Station</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Payment</TableHead>
                <TableHead className="w-12 px-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-64 text-center">
                    <Fuel className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    <p className="text-muted-foreground">No fuel logs recorded yet</p>
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((f: any) => (
                  <TableRow key={f.id} className="hover:bg-muted/10">
                    <TableCell className="px-6 text-sm font-medium">{fmt(f.date)}</TableCell>
                    <TableCell>
                      <div className="font-mono text-xs font-bold text-primary">{f.vehicle?.registrationNumber || "N/A"}</div>
                      <div className="text-xs text-muted-foreground">{f.vehicle?.vehicleName}</div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{Number(f.odometerReading).toLocaleString()} km</TableCell>
                    <TableCell className="font-semibold text-sm">{Number(f.quantityLiters).toFixed(1)} <span className="text-[10px] text-muted-foreground font-normal">L</span></TableCell>
                    <TableCell className="text-sm">PKR {Number(f.ratePerLiter).toFixed(0)}/L</TableCell>
                    <TableCell>
                      <span className="font-bold text-sm text-amber-600">PKR {Number(f.totalCost).toLocaleString()}</span>
                    </TableCell>
                    <TableCell className="text-sm">{f.stationName || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] capitalize">{f.paymentMethod}</Badge>
                    </TableCell>
                    <TableCell className="px-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => dispatch(openFleetDrawer({ type: 'fuel', mode: 'edit', data: f }))}>
                            <Pencil className="w-3.5 h-3.5 mr-2" />Edit Log
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-rose-600 focus:text-rose-600" onClick={() => { if (confirm("Delete this log?")) deleteLog(f.id) }}>
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
