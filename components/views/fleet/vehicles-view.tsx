"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { fleetApi } from "@/lib/api/fleet"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Pencil, Trash2, RefreshCw, AlertTriangle, Truck } from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { useAppDispatch } from "@/lib/store"
import { openFleetDrawer } from "@/lib/store/slices/ui-slice"
import FleetHeader from "@/components/fleet/fleet-header"

export default function VehiclesView() {
  const qc = useQueryClient()
  const dispatch = useAppDispatch()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const limit = 10

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["vehicles", { search, page }],
    queryFn: () => fleetApi.vehicles.list({ search, page, limit }),
  })

  const { mutate: deleteVehicle } = useMutation({
    mutationFn: (id: string) => fleetApi.vehicles.delete(id),
    onSuccess: () => {
      toast.success("Vehicle removed")
      qc.invalidateQueries({ queryKey: ["vehicles"] })
    }
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 capitalize">{status}</Badge>
      case 'in_maintenance': return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 capitalize">Maintenance</Badge>
      case 'inactive': return <Badge variant="secondary" className="capitalize">{status}</Badge>
      default: return <Badge variant="outline" className="capitalize">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <FleetHeader 
        title="Vehicle Registry" 
        subtitle="Manage and track your primary vehicle assets"
        type="vehicle"
        onSearch={setSearch}
        exportType="vehicles"
      />

      <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary opacity-20" />
            <p className="text-muted-foreground text-sm">Loading vehicle data...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center">
            <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-4" />
            <p className="font-semibold">Failed to load vehicles</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>Retry Connection</Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-bold text-xs uppercase tracking-wide px-6">Vehicle Identity</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Classification</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Assignment</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Odometer</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Status</TableHead>
                <TableHead className="w-12 px-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <Truck className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    <p className="text-muted-foreground">No vehicles found matching your criteria</p>
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((v: any) => (
                  <TableRow key={v.id} className="hover:bg-muted/10">
                    <TableCell className="px-6">
                      <div className="font-mono text-sm font-bold text-primary">{v.registrationNumber}</div>
                      <div className="text-xs text-muted-foreground">{v.vehicleName}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium capitalize">{v.type?.replace('_',' ')}</div>
                      <div className="text-[10px] text-muted-foreground uppercase">{v.fuelType} • {v.ownershipStatus?.replace('_',' ')}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{v.assignedSite || "Unassigned"}</div>
                      <div className="text-xs text-muted-foreground">{v.currentDriverName || "No driver"}</div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {v.currentOdometerKm?.toLocaleString() || 0} <span className="text-[10px] text-muted-foreground">km</span>
                    </TableCell>
                    <TableCell>{getStatusBadge(v.status)}</TableCell>
                    <TableCell className="px-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => dispatch(openFleetDrawer({ type: 'vehicle', mode: 'edit', data: v }))}>
                            <Pencil className="w-3.5 h-3.5 mr-2" />Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-rose-600 focus:text-rose-600" onClick={() => { if(confirm("Permanently delete this vehicle?")) deleteVehicle(v.id) }}>
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
