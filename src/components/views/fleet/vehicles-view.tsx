"use client"

import { useState, useMemo, useRef } from "react"
import { useVehicles } from "@/features/fleet/hooks/use-vehicles"
import Papa from "papaparse"
import type { CreateVehicleDto } from "@/lib/types/fleet"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Pencil, Trash2, RefreshCw, AlertTriangle, Truck, Upload, Loader2 } from "lucide-react"
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
import { DataTable } from "@/components/ui/data-table"
import { ImportPreviewModal } from "@/components/common/import-preview-modal"
import { getVehicleColumns } from "./fleet-columns"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { fleetApi } from "@/lib/api/fleet"

export default function VehiclesView() {
  const dispatch = useAppDispatch()
  const qc = useQueryClient()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [importPreview, setImportPreview] = useState<{ open: boolean; data: any[]; columns: string[] }>({
    open: false,
    data: [],
    columns: [],
  })
  const limit = 10

  const { data, isLoading, error, refetch } = useVehicles({ search, page, limit })

  const { mutate: deleteVehicle } = useMutation({
    mutationFn: (id: string) => fleetApi.vehicles.delete(id),
    onSuccess: () => {
      toast.success("Vehicle removed from fleet")
      qc.invalidateQueries({ queryKey: ["vehicles"] })
    }
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { mutate: importVehicles, isPending: isImporting } = useMutation({
    mutationFn: (data: Partial<CreateVehicleDto>[]) => fleetApi.vehicles.importBulk(data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["vehicles"] })
      toast.success(`Successfully imported ${res.count} vehicles`)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Import failed")
    }
  })

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    toast.info("Parsing CSV file...")
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const dtos: Partial<CreateVehicleDto>[] = results.data.map((row: any) => ({
          registrationNumber: row.registrationNumber || "VAR-" + Math.floor(Math.random() * 1000),
          vehicleName: row.vehicleName || "Unknown Vehicle",
          make: row.make || undefined,
          model: row.model || undefined,
          year: row.year ? Number(row.year) : undefined,
          type: row.type || "suv",
          fuelType: row.fuelType || "petrol",
          ownershipStatus: row.ownershipStatus || "company_owned",
          status: row.status || "active",
          assignedSite: row.assignedSite || undefined,
          currentDriverName: row.currentDriverName || undefined,
          currentOdometerKm: row.currentOdometerKm ? Number(row.currentOdometerKm) : 0,
          maintenanceIntervalKm: row.maintenanceIntervalKm ? Number(row.maintenanceIntervalKm) : 5000,
        }))
        if (dtos.length === 0) {
          toast.error("No valid data found in CSV.")
          return
        }
        setImportPreview({
          open: true,
          data: dtos,
          columns: Object.keys(dtos[0]),
        })
      },
      error: (error) => {
        toast.error(`Error parsing file: ${error.message}`)
      }
    })
    
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const columns = useMemo(() => getVehicleColumns(
    (data) => dispatch(openFleetDrawer({ type: 'vehicle', mode: 'edit', data })),
    (id) => { if(confirm("Permanently delete this vehicle?")) deleteVehicle(id) }
  ), [deleteVehicle, dispatch])

  return (
    <div className="space-y-6">
      <FleetHeader
        title="Vehicle Registry"
        subtitle="Manage and track your primary vehicle assets"
        type="vehicle"
        onSearch={setSearch}
        exportType="vehicles"
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

      <Card className="rounded-xl border-border/50 shadow-none overflow-hidden bg-white">
        {isLoading ? (
          <div className="py-24 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Synchronizing Fleet Database…</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center">
            <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-4 opacity-50" />
            <p className="font-black uppercase tracking-widest text-sm text-rose-600">Encrypted link failure</p>
            <Button variant="outline" size="sm" className="mt-6 rounded-xl font-bold" onClick={() => refetch()}>Retrying Connection</Button>
          </div>
        ) : (
          <div className="p-1">
            <DataTable
              columns={columns}
              data={data?.data ?? []}
              searchKey="registrationNumber"
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
          importVehicles(importPreview.data)
          setImportPreview((prev) => ({ ...prev, open: false }))
        }}
        title="Preview Vehicle Registry Import"
        description="Verify vehicle specs, registration numbers, and assignments before updating the fleet log."
      />
    </div>
  )
}
