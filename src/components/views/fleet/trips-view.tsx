"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, useMemo, useRef } from "react"
import Papa from "papaparse"
import type { CreateTripDto } from "@/lib/types/fleet"
import { fleetApi } from "@/lib/api/fleet"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RefreshCw, AlertTriangle, Upload, Loader2, Plus } from "lucide-react"
import { toast } from "sonner"
import { useAppDispatch } from "@/lib/store"
import { openFleetDrawer } from "@/lib/store/slices/ui-slice"
import FleetHeader from "@/components/fleet/fleet-header"
import { DataTable } from "@/components/ui/data-table"
import { ImportPreviewModal } from "@/components/common/import-preview-modal"
import { getTripColumns } from "./fleet-columns"

const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })

export default function TripsView() {
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
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { mutate: importTrips, isPending: isImporting } = useMutation({
    mutationFn: (data: Partial<CreateTripDto>[]) => fleetApi.trips.importBulk(data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["trips"] })
      toast.success(`Successfully imported ${res.count} trips`)
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
          const dtos: Partial<CreateTripDto>[] = []
          for (const row of results.data as any[]) {
            const v = vehicles.find(x => x.registrationNumber === row.vehicleRegistration)
            if (!v) continue // skip rows for unknown vehicles
            dtos.push({
              vehicleId: v.id,
              destination: row.destination || "Unknown Route",
              purposeOfVisit: row.purpose || undefined,
              tripDate: row.date || new Date().toISOString().split('T')[0],
              meterOut: row.meterOut ? Number(row.meterOut) : 0,
              meterIn: row.meterIn ? Number(row.meterIn) : undefined,
              driverName: row.driverName || undefined,
              fuelAllottedLiters: row.fuelAllotted ? Number(row.fuelAllotted) : undefined,
              fuelCostPkr: row.fuelCost ? Number(row.fuelCost) : undefined,
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

  const columns = useMemo(() => getTripColumns(
    (data) => dispatch(openFleetDrawer({ type: 'trip', mode: 'edit', data })),
    (id) => { if (confirm("Delete this trip?")) deleteTrip(id) }
  ), [deleteTrip, dispatch])

  return (
    <div className="space-y-6">
      <FleetHeader 
        title="Trip Logs" 
        subtitle="Historical movement data and operational mileage"
        type="trip"
        onSearch={setSearch}
        exportType="trips"
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

      <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-24 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Extracting Journey Logs…</p>
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
              searchKey="origin"
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
          importTrips(importPreview.data)
          setImportPreview((prev) => ({ ...prev, open: false }))
        }}
        title="Preview Fleet Trip Import"
        description="Verify the journey details, mileage, and vehicle associations before synchronization."
      />
    </div>
  )
}
