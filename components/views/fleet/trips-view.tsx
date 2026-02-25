"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { fleetApi } from "@/lib/api/fleet"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Pencil, Trash2, RefreshCw, AlertTriangle, Navigation, Users } from "lucide-react"
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

const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })

export default function TripsView() {
  const qc = useQueryClient()
  const dispatch = useAppDispatch()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const limit = 10

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["trips", { search, page }],
    queryFn: () => fleetApi.trips.list({ search, page, limit }),
  })

  const { mutate: deleteTrip } = useMutation({
    mutationFn: (id: string) => fleetApi.trips.delete(id),
    onSuccess: () => {
      toast.success("Trip record deleted")
      qc.invalidateQueries({ queryKey: ["trips"] })
    }
  })

  return (
    <div className="space-y-6">
      <FleetHeader 
        title="Trip Logs" 
        subtitle="Historical movement data and operational mileage"
        type="trip"
        onSearch={setSearch}
        exportType="trips"
      />

      <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary opacity-20" />
            <p className="text-muted-foreground text-sm">Loading trip records...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center">
            <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-4" />
            <p className="font-semibold">Failed to load trips</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>Retry Connection</Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-bold text-xs uppercase tracking-wide px-6">Trip Details</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Vehicle</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Driver / Personnel</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Mileage (km)</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Status</TableHead>
                <TableHead className="w-12 px-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <Navigation className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    <p className="text-muted-foreground">No trip logs found</p>
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((t: any) => (
                  <TableRow key={t.id} className="hover:bg-muted/10">
                    <TableCell className="px-6">
                      <div className="text-sm font-bold text-foreground">{fmt(t.tripDate)}</div>
                      <div className="text-xs text-muted-foreground font-medium">{t.destination}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-sm font-bold text-primary">{t.vehicle?.registrationNumber || "N/A"}</div>
                      <div className="text-xs text-muted-foreground">{t.vehicle?.vehicleName || "Unknown Vehicle"}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-semibold text-foreground">
                        {t.driverName || "—"} 
                        {t.alternativeDriverName && <span className="text-[10px] text-muted-foreground font-normal ml-1.5 text-orange-600/80 italic">/ Alt: {t.alternativeDriverName}</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="text-[9px] text-muted-foreground uppercase bg-muted/50 px-1.5 py-0.5 rounded border font-bold max-w-[120px] truncate">
                          {t.purposeOfVisit || "Operational"}
                        </div>
                        {t.personTravelList?.length > 0 && (
                          <div className="text-[9px] text-primary font-black uppercase flex items-center gap-1 bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10">
                             <Users className="w-2.5 h-2.5" /> {t.personTravelList.length}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-semibold">{t.totalKm || (t.meterIn ? t.meterIn - t.meterOut : "—")} <span className="text-[10px] font-normal text-muted-foreground">KM</span></div>
                      <div className="text-[10px] text-muted-foreground tracking-tighter">OUT: {t.meterOut} → IN: {t.meterIn || "???"}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={t.status === 'completed' ? 'default' : 'outline'} className="capitalize py-0.5 text-[10px]">
                        {t.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => dispatch(openFleetDrawer({ type: 'trip', mode: 'edit', data: t }))}>
                            <Pencil className="w-3.5 h-3.5 mr-2" />Edit Log
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-rose-600 focus:text-rose-600" onClick={() => { if(confirm("Delete this trip log?")) deleteTrip(t.id) }}>
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
