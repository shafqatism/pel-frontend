"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { settingsApi } from "@/lib/api/settings"
import type { Settings, UpdateSettingsDto } from "@/lib/types/settings"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Settings2, Building2, Palette, Bell, Globe, 
  Save, RefreshCw, Mail, Cog, Info, CheckCircle2
} from "lucide-react"
import { toast } from "sonner"

export default function SettingsView() {
  const qc = useQueryClient()
  const { data: settings, isLoading, refetch } = useQuery({
    queryKey: ["settings"],
    queryFn: settingsApi.get
  })

  const { mutate: update, isPending } = useMutation({
    mutationFn: settingsApi.update,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings"] })
      toast.success("Settings updated successfully")
    },
    onError: () => {
      toast.error("Failed to update settings")
    }
  })

  const [form, setForm] = useState<UpdateSettingsDto>({})

  useEffect(() => {
    if (settings) {
      setForm({
        companyName: settings.companyName,
        currency: settings.currency,
        unitSystem: settings.unitSystem,
        maintenanceIntervalKm: settings.maintenanceIntervalKm,
        systemEmail: settings.systemEmail,
        brandingColors: { ...settings.brandingColors },
        enableNotifications: settings.enableNotifications
      })
    }
  }, [settings])

  const set = (k: keyof UpdateSettingsDto, v: any) => setForm(f => ({ ...f, [k]: v }))
  const setBranding = (k: keyof UpdateSettingsDto['brandingColors'], v: string) => 
    setForm(f => ({ ...f, brandingColors: { ...f.brandingColors!, [k]: v } }))

  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary/40" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Settings2 className="w-6 h-6 text-primary" /> Configuration
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Control system-wide preferences and branding for PEL ERP</p>
        </div>
        <Button 
          onClick={() => update(form)} 
          disabled={isPending}
          className="bg-primary hover:bg-primary/90 font-bold"
        >
          <Save className="w-4 h-4 mr-2" />
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-muted/50 p-1 rounded-2xl mb-6">
          <TabsTrigger value="general" className="rounded-xl px-6">General</TabsTrigger>
          <TabsTrigger value="branding" className="rounded-xl px-6">Branding</TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-xl px-6">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/30 pb-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" /> Company Identity
                </CardTitle>
                <CardDescription>Official company details for reports and headers</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label>Company Display Name</Label>
                  <Input 
                    value={form.companyName ?? ""} 
                    onChange={e => set("companyName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>System Administrator Email</Label>
                  <Input 
                    type="email"
                    value={form.systemEmail ?? ""} 
                    onChange={e => set("systemEmail", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/30 pb-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" /> Regional & Units
                </CardTitle>
                <CardDescription>Default measurement systems and currency</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select 
                      value={form.currency} 
                      onValueChange={v => set("currency", v)}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PKR">PKR (₨)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Unit System</Label>
                    <Select 
                      value={form.unitSystem} 
                      onValueChange={v => set("unitSystem", v)}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="metric">Metric (km, L)</SelectItem>
                        <SelectItem value="imperial">Imperial (mi, gal)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Fleet Maintenance Threshold (km)</Label>
                  <Input 
                    type="number"
                    value={form.maintenanceIntervalKm ?? 0} 
                    onChange={e => set("maintenanceIntervalKm", Number(e.target.value))}
                  />
                  <p className="text-[10px] text-muted-foreground italic">Alerts will trigger when vehicles exceed this interval since last service.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="branding" className="space-y-6">
          <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary" /> Design System Colors
              </CardTitle>
              <CardDescription>Customize the visual identity of the Pel Exploration Portal</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <Label className="flex items-center justify-between">
                    Primary Brand Color
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">{form.brandingColors?.primary}</span>
                  </Label>
                  <div className="flex gap-4 items-center">
                    <input 
                      type="color" 
                      className="w-12 h-12 rounded-lg cursor-pointer border-none p-0"
                      value={form.brandingColors?.primary ?? "#d97706"}
                      onChange={e => setBranding("primary", e.target.value)}
                    />
                    <div className="flex-1 space-y-1">
                      <p className="text-xs font-bold uppercase">Main Theme</p>
                      <p className="text-[10px] text-muted-foreground">Used for buttons, active states, and markers.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="flex items-center justify-between">
                    Secondary Color
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">{form.brandingColors?.secondary}</span>
                  </Label>
                  <div className="flex gap-4 items-center">
                    <input 
                      type="color" 
                      className="w-12 h-12 rounded-lg cursor-pointer border-none p-0"
                      value={form.brandingColors?.secondary ?? "#1f2937"}
                      onChange={e => setBranding("secondary", e.target.value)}
                    />
                    <div className="flex-1 space-y-1">
                      <p className="text-xs font-bold uppercase">Sidebar & Footers</p>
                      <p className="text-[10px] text-muted-foreground">Deep accent color for navigation components.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="flex items-center justify-between">
                    Accent Highlight
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">{form.brandingColors?.accent}</span>
                  </Label>
                  <div className="flex gap-4 items-center">
                    <input 
                      type="color" 
                      className="w-12 h-12 rounded-lg cursor-pointer border-none p-0"
                      value={form.brandingColors?.accent ?? "#fbbf24"}
                      onChange={e => setBranding("accent", e.target.value)}
                    />
                    <div className="flex-1 space-y-1">
                      <p className="text-xs font-bold uppercase">Focus Elements</p>
                      <p className="text-[10px] text-muted-foreground">Used for subtle highlights and micro-interactions.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 p-8 rounded-3xl bg-muted/20 border border-dashed border-muted flex items-center justify-center">
                <div className="text-center">
                   <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white" 
                        style={{ backgroundColor: form.brandingColors?.primary }}>
                      <CheckCircle2 className="w-8 h-8" />
                   </div>
                   <p className="text-sm font-bold">Theme Preview</p>
                   <p className="text-xs text-muted-foreground mt-1">Colors will apply system-wide upon saving.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" /> Global Alerting
              </CardTitle>
              <CardDescription>Manage how the system communicates critical updates</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-white/40">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold">Email Notifications</p>
                  <p className="text-xs text-muted-foreground">Send automated reports and critical alerts to administrators</p>
                </div>
                <Switch 
                  checked={form.enableNotifications ?? false} 
                  onCheckedChange={v => set("enableNotifications", v)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/30 flex gap-3">
                    <Info className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                       <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Operational reports</p>
                       <p className="text-[10px] text-emerald-600/70 leading-relaxed mt-1">Daily summaries and fleet performance reports are currently active.</p>
                    </div>
                 </div>
                 <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/30 flex gap-3">
                    <Info className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                       <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">HSE Alerts</p>
                       <p className="text-[10px] text-amber-600/70 leading-relaxed mt-1">High-severity incident alerts are set to override notification toggles.</p>
                    </div>
                 </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
