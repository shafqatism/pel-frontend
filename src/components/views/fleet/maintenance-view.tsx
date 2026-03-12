"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, useRef, useMemo } from "react"
import Papa from "papaparse"
import type { CreateMaintenanceDto } from "@/lib/types/fleet"
import { fleetApi } from "@/lib/api/fleet"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Pencil, Trash2, RefreshCw, AlertTriangle, Wrench, Upload, Loader2, Plus } from "lucide-react"
import FleetHeader from "@/components/fleet/fleet-header"
import { DataTable } from "@/components/ui/data-table"
import { ImportPreviewModal } from "@/components/common/import-preview-modal"
import { getMaintenanceColumns } from "./fleet-columns"
import { useAppDispatch } from "@/lib/store"
import { openFleetDrawer } from "@/lib/store/slices/ui-slice"
import { toast } from "sonner"

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
  const [importPreview, setImportPreview] = useState<{ open: boolean; data: any[]; columns: string[] }>({
    open: false,
    data: [],
    columns: [],
  })
  const limit = 10

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["maintenance", { search, page }],
    queryFn: () => fleetApi.maintenance.list({ search, page, limit }),
  })

  const { mutate: deleteLog } = useMutation({
    mutationFn: (id: string) => fleetApi.maintenance.delete(id),
    onSuccess: () => {
      toast.success("Maintenance log removed")
      qc.invalidateQueries({ queryKey: ["maintenance"] })
    }
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { mutate: importMaintenance, isPending: isImporting } = useMutation({
    mutationFn: (data: Partial<CreateMaintenanceDto>[]) => fleetApi.maintenance.importBulk(data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["maintenance"] })
      toast.success(`Successfully imported ${res.count} maintenance logs`)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Import failed")
    }
  })

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    toast.info("Fetching fleet registry & parsing CSV...")
    try {
      const vehicles = await fleetApi.vehicles.dropdown()

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const dtos: Partial<CreateMaintenanceDto>[] = []
          for (const row of results.data as any[]) {
            const v = vehicles.find(x => x.registrationNumber === row.vehicleRegistration)
            if (!v) continue // skip rows for unknown vehicles
            dtos.push({
              vehicleId: v.id,
              type: row.type || "routine_check",
              description: row.description || undefined,
              maintenanceDate: row.date || new Date().toISOString().split('T')[0],
              costPkr: row.cost ? Number(row.cost) : 0,
              shopOrPerson: row.shop || undefined,
              odometerAtMaintenanceKm: row.odometer ? Number(row.odometer) : undefined,
              nextServiceOdometerKm: row.nextOdometer ? Number(row.nextOdometer) : undefined,
              nextServiceDueDate: row.nextDate || undefined,
              status: row.status || "completed"
            })
          }
          if (dtos.length === 0) {
            toast.error("No valid matching records found. Did you include 'vehicleRegistration'?")
            return
          }
          setImportPreview({
            open: true,
            data: dtos,
            columns: Object.keys(dtos[0]),
          })
        },
        error: (error) => toast.error(`Error parsing file: ${error.message}`)
      })
    } catch (err: any) {
      toast.error("Failed to load vehicle registry for mapping")
    }

    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const columns = useMemo(() => getMaintenanceColumns(
    (data) => dispatch(openFleetDrawer({ type: 'maintenance', mode: 'edit', data })),
    (id) => { if (confirm("Delete this log?")) deleteLog(id) }
  ), [deleteLog, dispatch])

  const totalCost = data?.data.reduce((sum: number, m: any) => sum + Number(m.costPkr), 0) ?? 0

  return (
    <div className="space-y-6">
      <FleetHeader
        title="Maintenance Records"
        subtitle="Service history, scheduled maintenance & repair logs"
        type="maintenance"
        onSearch={setSearch}
        exportType="maintenance"
        customAction={
          <>
            <input type="file" accept=".csv" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
            <Button 
              disabled={isImporting}
              size="sm" 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()} 
              className="h-9 font-medium border-border/60 hover:bg-muted/50 transition-all text-muted-foreground hover:text-foreground"
            >
              {isImporting ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Upload className="w-3.5 h-3.5 mr-2" />} Import
            </Button>
          </>
        }
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
          <div className="py-24 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Inspecting Service History…</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center">
            <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-4 opacity-50" />
            <p className="font-black uppercase tracking-widest text-sm text-rose-600">Secure link failure</p>
            <Button variant="outline" size="sm" className="mt-6 rounded-xl font-bold" onClick={() => refetch()}>Retrying Link</Button>
          </div>
        ) : (
          <div className="p-1">
            <DataTable
              columns={columns}
              data={data?.data ?? []}
              searchKey="serviceType"
            />
          </div>
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

      <ImportPreviewModal
        open={importPreview.open}
        onOpenChange={(open) => setImportPreview((prev) => ({ ...prev, open }))}
        data={importPreview.data}
        columns={importPreview.columns}
        isLoading={isImporting}
        onConfirm={() => {
          importMaintenance(importPreview.data)
          setImportPreview((prev) => ({ ...prev, open: false }))
        }}
        title="Preview Fleet Maintenance Import"
        description="Verify service logs, costs, and upcoming maintenance schedules before committing to history."
      />
    </div>
  )
}
