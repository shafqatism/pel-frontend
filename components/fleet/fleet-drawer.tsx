"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { closeFleetDrawer } from "@/lib/store/slices/ui-slice"
import VehicleForm from "./forms/vehicle-form"
import TripForm from "./forms/trip-form"
import FuelForm from "./forms/fuel-form"
import MaintenanceForm from "./forms/maintenance-form"
import AssignmentForm from "./forms/assignment-form"
import { Car, Navigation, Fuel, Wrench, UserCheck } from "lucide-react"

const DRAWER_CONFIG: Record<string, { title: string; description: string; icon: React.ElementType }> = {
  vehicle:     { title: "Vehicle",     description: "Register or update a fleet vehicle",     icon: Car },
  trip:        { title: "Trip Log",    description: "Record a vehicle trip or journey",        icon: Navigation },
  fuel:        { title: "Fuel Log",    description: "Log fuel fill-up or consumption",         icon: Fuel },
  maintenance: { title: "Maintenance", description: "Record a maintenance or service event",   icon: Wrench },
  assignment:  { title: "Assignment",  description: "Assign a vehicle to a person or project", icon: UserCheck },
}

export default function FleetDrawer() {
  const dispatch = useAppDispatch()
  const { isOpen, type, data, mode } = useAppSelector(state => state.ui.fleetDrawer)

  const config = type ? DRAWER_CONFIG[type] : null
  const Icon = config?.icon

  return (
    <Sheet open={isOpen} onOpenChange={() => dispatch(closeFleetDrawer())}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg md:max-w-xl overflow-y-auto border-l border-border/60 p-0"
      >
        {/* Drawer Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/40 px-6 py-5">
          <SheetHeader>
            <div className="flex items-center gap-3 mb-1">
              {Icon && (
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Icon className="w-4 h-4" />
                </div>
              )}
              <SheetTitle className="text-base">
                {mode === 'create' ? `Add ${config?.title}` : `Edit ${config?.title}`}
              </SheetTitle>
            </div>
            <SheetDescription className="text-xs text-muted-foreground">
              {config?.description}
            </SheetDescription>
          </SheetHeader>
        </div>

        {/* Form Content */}
        <div className="px-6 py-6">
          {type === 'vehicle'     && <VehicleForm     data={data} mode={mode} />}
          {type === 'trip'        && <TripForm        data={data} mode={mode} />}
          {type === 'fuel'        && <FuelForm        data={data} mode={mode} />}
          {type === 'maintenance' && <MaintenanceForm data={data} mode={mode} />}
          {type === 'assignment'  && <AssignmentForm  data={data} mode={mode} />}
        </div>
      </SheetContent>
    </Sheet>
  )
}
