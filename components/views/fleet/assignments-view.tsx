"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { fleetApi } from "@/lib/api/fleet"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Pencil, Trash2, RefreshCw, AlertTriangle, UserCheck } from "lucide-react"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { useAppDispatch } from "@/lib/store"
import { openFleetDrawer } from "@/lib/store/slices/ui-slice"
import FleetHeader from "@/components/fleet/fleet-header"

const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })

export default function AssignmentsView() {
  const qc = useQueryClient()
  const dispatch = useAppDispatch()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const limit = 10

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["assignments", { search, page }],
    queryFn: () => fleetApi.assignments.list({ search, page, limit }),
  })

  const { mutate: deleteAssignment } = useMutation({
    mutationFn: (id: string) => fleetApi.assignments.delete(id),
    onSuccess: () => {
      toast.success("Assignment removed")
      qc.invalidateQueries({ queryKey: ["assignments"] })
    }
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20">Active</Badge>
      case 'returned': return <Badge variant="secondary">Returned</Badge>
      case 'extended': return <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/20">Extended</Badge>
      default: return <Badge variant="outline" className="capitalize">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <FleetHeader
        title="Vehicle Assignments"
        subtitle="Track which vehicles are assigned to which personnel"
        type="assignment"
        onSearch={setSearch}
        exportType="assignments"
      />

      <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary opacity-20" />
            <p className="text-muted-foreground text-sm">Loading assignments...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center">
            <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-4" />
            <p className="font-semibold">Failed to load assignments</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-bold text-xs uppercase tracking-wide px-6">Vehicle</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Assigned To</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Authorized By</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Assignment Date</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Return Date</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Purpose</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Status</TableHead>
                <TableHead className="w-12 px-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-64 text-center">
                    <UserCheck className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    <p className="text-muted-foreground">No assignments found</p>
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((a: any) => (
                  <TableRow key={a.id} className="hover:bg-muted/10">
                    <TableCell className="px-6">
                      <div className="font-mono text-xs font-bold text-primary">{a.vehicle?.registrationNumber || "N/A"}</div>
                      <div className="text-xs text-muted-foreground">{a.vehicle?.vehicleName}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-semibold">{a.assignedTo}</div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{a.assignedBy}</TableCell>
                    <TableCell className="text-sm">{fmt(a.assignmentDate)}</TableCell>
                    <TableCell className="text-sm">
                      {a.returnDate ? (
                        <span className={new Date(a.returnDate) < new Date() && a.status === 'active' ? "text-rose-600 font-semibold" : ""}>
                          {fmt(a.returnDate)}
                        </span>
                      ) : <span className="text-muted-foreground">Open-ended</span>}
                    </TableCell>
                    <TableCell className="text-sm max-w-[160px] truncate">{a.purpose || "—"}</TableCell>
                    <TableCell>{getStatusBadge(a.status)}</TableCell>
                    <TableCell className="px-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => dispatch(openFleetDrawer({ type: 'assignment', mode: 'edit', data: a }))}>
                            <Pencil className="w-3.5 h-3.5 mr-2" />Edit Assignment
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-rose-600 focus:text-rose-600" onClick={() => { if (confirm("Remove this assignment?")) deleteAssignment(a.id) }}>
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
