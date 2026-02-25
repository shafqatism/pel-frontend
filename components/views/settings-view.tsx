"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { settingsApi } from "@/lib/api/settings"
import { dropdownsApi } from "@/lib/api/dropdowns"
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
  Save, RefreshCw, Mail, Cog, Info, CheckCircle2,
  Cloud, Key, Lock, Server, Trash2, Database, Plus, X
} from "lucide-react"
import { toast } from "sonner"

const DROPDOWN_CATEGORIES = [
  { label: "Maintenance Types", value: "maintenance_type" },
  { label: "Payment Methods", value: "payment_method" },
  { label: "Vehicle Types", value: "vehicle_type" },
  { label: "Fuel Types", value: "fuel_type" },
  { label: "Incident Severity", value: "incident_severity" },
  { label: "Incident Status", value: "incident_status" },
  { label: "Audit Findings", value: "audit_finding" },
  { label: "HSE Drill Types", value: "hse_drill_type" },
  { label: "Trip Statuses", value: "trip_status" },
  { label: "Assignment Statuses", value: "assignment_status" },
  { label: "HR Departments", value: "hr_department" },
  { label: "HR Designations", value: "hr_designation" },
  { label: "Vehicle Ownership", value: "vehicle_ownership" },
  { label: "Vehicle Statuses", value: "vehicle_status" },
  { label: "Site Phases", value: "site_phase" },
  { label: "Site Statuses", value: "site_status" },
  { label: "Expense Categories", value: "expense_category" },
  { label: "Maintenance Vendors", value: "maintenance_vendor" },
]

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
  const [activeCategory, setActiveCategory] = useState(DROPDOWN_CATEGORIES[0].value)
  const [newOptionLabel, setNewOptionLabel] = useState("")

  const { data: options = [], isLoading: loadingOptions } = useQuery({
    queryKey: ["dropdown-options", activeCategory],
    queryFn: () => dropdownsApi.get(activeCategory)
  })

  const { mutate: addOption } = useMutation({
    mutationFn: (label: string) => {
      const value = label.toLowerCase().replace(/\s+/g, '_')
      return dropdownsApi.create(activeCategory, { label, value })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dropdown-options", activeCategory] })
      setNewOptionLabel("")
      toast.success("Option added")
    }
  })

  const { mutate: deleteOption } = useMutation({
    mutationFn: dropdownsApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dropdown-options", activeCategory] })
      toast.success("Option removed")
    }
  })

  useEffect(() => {
    if (settings) {
      setForm({
        companyName: settings.companyName,
        currency: settings.currency,
        unitSystem: settings.unitSystem,
        maintenanceIntervalKm: settings.maintenanceIntervalKm,
        systemEmail: settings.systemEmail,
        brandingColors: { ...settings.brandingColors },
        enableNotifications: settings.enableNotifications,
        r2AccountId: settings.r2AccountId,
        r2AccessKeyId: settings.r2AccessKeyId,
        r2SecretAccessKey: settings.r2SecretAccessKey,
        r2BucketName: settings.r2BucketName,
        r2PublicCustomDomain: settings.r2PublicCustomDomain,
        customPresets: settings.customPresets ?? []
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
        <TabsList className="bg-muted/50 p-1 rounded-2xl mb-6 overflow-x-auto h-auto flex-wrap">
          <TabsTrigger value="general" className="rounded-xl px-6">General</TabsTrigger>
          <TabsTrigger value="branding" className="rounded-xl px-6">Branding</TabsTrigger>
          <TabsTrigger value="presets" className="rounded-xl px-6">Data Presets</TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-xl px-6">Notifications</TabsTrigger>
          <TabsTrigger value="storage" className="rounded-xl px-6">Storage</TabsTrigger>
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
                <Palette className="w-4 h-4 text-primary" /> Advanced Design System
              </CardTitle>
              <CardDescription>Tailor the entire visual identity of the PEL ERP ecosystem with fully dynamic color tokens.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs defaultValue="core" className="w-full">
                <TabsList className="bg-muted/30 p-1 rounded-xl mb-8 flex-wrap h-auto">
                   <TabsTrigger value="core" className="rounded-lg text-xs font-bold uppercase tracking-widest px-4">Core Brand</TabsTrigger>
                   <TabsTrigger value="semantic" className="rounded-lg text-xs font-bold uppercase tracking-widest px-4">Semantic States</TabsTrigger>
                   <TabsTrigger value="ui" className="rounded-lg text-xs font-bold uppercase tracking-widest px-4">Infrastructure</TabsTrigger>
                   <TabsTrigger value="nav" className="rounded-lg text-xs font-bold uppercase tracking-widest px-4">Navigation</TabsTrigger>
                   <TabsTrigger value="themes" className="rounded-lg text-xs font-bold uppercase tracking-widest px-4">Presets</TabsTrigger>
                </TabsList>

                <TabsContent value="core" className="space-y-8 animate-in fade-in slide-in-from-right-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      <ColorPicker label="Primary Brand" token="primary" value={form.brandingColors?.primary} onChange={setBranding} desc="Main action color and key branding element." />
                      <ColorPicker label="Primary Foreground" token="primaryForeground" value={form.brandingColors?.primaryForeground} onChange={setBranding} desc="Text/icon color on primary backgrounds." />
                      <div className="hidden lg:block"></div>
                      <ColorPicker label="Secondary Accent" token="secondary" value={form.brandingColors?.secondary} onChange={setBranding} desc="Used for secondary buttons and containers." />
                      <ColorPicker label="Secondary Foreground" token="secondaryForeground" value={form.brandingColors?.secondaryForeground} onChange={setBranding} desc="Text color on secondary backgrounds." />
                      <div className="hidden lg:block"></div>
                      <ColorPicker label="Highlight Accent" token="accent" value={form.brandingColors?.accent} onChange={setBranding} desc="Subtle accents and hover highlights." />
                      <ColorPicker label="Accent Foreground" token="accentForeground" value={form.brandingColors?.accentForeground} onChange={setBranding} desc="Text color on accent highlights." />
                   </div>
                </TabsContent>

                <TabsContent value="semantic" className="space-y-8 animate-in fade-in slide-in-from-right-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      <ColorPicker label="Success State" token="success" value={form.brandingColors?.success} onChange={setBranding} desc="Active for positive results and growth." colorClass="text-emerald-500" />
                      <ColorPicker label="Warning State" token="warning" value={form.brandingColors?.warning} onChange={setBranding} desc="Used for cautionary alerts and pending actions." colorClass="text-amber-500" />
                      <ColorPicker label="Destructive State" token="destructive" value={form.brandingColors?.destructive} onChange={setBranding} desc="Critical errors, deletions, and emergency alerts." colorClass="text-rose-500" />
                      <ColorPicker label="Success Foreground" token="successForeground" value={form.brandingColors?.successForeground} onChange={setBranding} desc="Text color on success backgrounds." />
                      <ColorPicker label="Warning Foreground" token="warningForeground" value={form.brandingColors?.warningForeground} onChange={setBranding} desc="Text color on warning backgrounds." />
                      <ColorPicker label="Destructive Foreground" token="destructiveForeground" value={form.brandingColors?.destructiveForeground} onChange={setBranding} desc="Text color on destructive backgrounds." />
                   </div>
                </TabsContent>

                <TabsContent value="ui" className="space-y-8 animate-in fade-in slide-in-from-right-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      <ColorPicker label="App Background" token="background" value={form.brandingColors?.background} onChange={setBranding} desc="Global background color for the workspace." />
                      <ColorPicker label="Main Foreground" token="foreground" value={form.brandingColors?.foreground} onChange={setBranding} desc="Primary text and glyph color." />
                      <ColorPicker label="Component Border" token="border" value={form.brandingColors?.border} onChange={setBranding} desc="Standard border for cards and inputs." />
                      <ColorPicker label="Card Surface" token="card" value={form.brandingColors?.card} onChange={setBranding} desc="Background for information cards." />
                      <ColorPicker label="Card Foreground" token="cardForeground" value={form.brandingColors?.cardForeground} onChange={setBranding} desc="Text color specifically for cards." />
                      <ColorPicker label="Input Background" token="input" value={form.brandingColors?.input} onChange={setBranding} desc="Background for form control elements." />
                      <ColorPicker label="Popover Surface" token="popover" value={form.brandingColors?.popover} onChange={setBranding} desc="Dropdown and mobile menu background." />
                      <ColorPicker label="Popover Foreground" token="popoverForeground" value={form.brandingColors?.popoverForeground} onChange={setBranding} desc="Text for popover menus." />
                      <ColorPicker label="Focus Ring" token="ring" value={form.brandingColors?.ring} onChange={setBranding} desc="Color for active focus indicators." />
                   </div>
                </TabsContent>

                <TabsContent value="nav" className="space-y-8 animate-in fade-in slide-in-from-right-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      <ColorPicker label="Sidebar Background" token="sidebar" value={form.brandingColors?.sidebar} onChange={setBranding} desc="Main side navigation background." />
                      <ColorPicker label="Sidebar Foreground" token="sidebarForeground" value={form.brandingColors?.sidebarForeground} onChange={setBranding} desc="Text/Icon color for inactive nav items." />
                      <div className="hidden lg:block"></div>
                      <ColorPicker label="Sidebar Active Bg" token="sidebarAccent" value={form.brandingColors?.sidebarAccent} onChange={setBranding} desc="Background for the selected menu item." />
                      <ColorPicker label="Sidebar Active Text" token="sidebarAccentForeground" value={form.brandingColors?.sidebarAccentForeground} onChange={setBranding} desc="Text color for the selected nav item." />
                   </div>
                </TabsContent>

                <TabsContent value="themes" className="space-y-8 animate-in fade-in slide-in-from-right-4">
                   <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex gap-4 items-center">
                         <div className="p-3 rounded-2xl bg-primary/10 text-primary shrink-0">
                            <Save className="w-5 h-5" />
                         </div>
                         <div>
                            <p className="text-sm font-black uppercase tracking-widest text-foreground">Save Custom Preset</p>
                            <p className="text-[10px] text-muted-foreground italic">Capture your current fine-tuned colors as a reusable template.</p>
                         </div>
                      </div>
                      <div className="flex gap-2 w-full md:w-auto">
                        <Input 
                          id="preset-name"
                          placeholder="Preset Name (e.g. 'Project Alpha')" 
                          className="bg-white/50 border-primary/20 focus:ring-primary/20 rounded-xl px-4"
                        />
                        <Button 
                          onClick={() => {
                            const nameInput = document.getElementById('preset-name') as HTMLInputElement;
                            if (!nameInput.value) {
                               toast.error("Please enter a preset name");
                               return;
                            }
                            const newPreset = {
                              title: nameInput.value,
                              desc: "Custom admin-defined configuration",
                              colors: { ...form.brandingColors }
                            };
                            set("customPresets", [...(form.customPresets || []), newPreset]);
                            nameInput.value = "";
                            toast.success(`Preset "${newPreset.title}" saved locally. Click 'Save Changes' to persist.`);
                          }}
                          className="rounded-xl px-6 font-bold shrink-0"
                        >
                          Save Preset
                        </Button>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground pl-1">Standard Presets</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <ThemeCard 
                          title="Corporate Legacy" 
                          desc="PEL's official heritage branding. Professional, high-contrast, and focused on trust."
                          colors={THEMES.corporate}
                          onClick={() => set("brandingColors", THEMES.corporate)}
                        />
                        <ThemeCard 
                          title="Midnight Frontier" 
                          desc="Deep exploration mode. Optimized for low-light environments."
                          colors={THEMES.midnight}
                          onClick={() => set("brandingColors", THEMES.midnight)}
                        />
                        <ThemeCard 
                          title="HSE High-Vis" 
                          desc="Safety-first identity. Uses high-visibility tokens for compliance."
                          colors={THEMES.hse}
                          onClick={() => set("brandingColors", THEMES.hse)}
                        />
                      </div>
                   </div>

                   {form.customPresets && form.customPresets.length > 0 && (
                     <div className="space-y-4 pt-4 border-t border-border/40">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary pl-1">Custom Admin Presets</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {form.customPresets.map((preset, idx) => (
                            <div key={idx} className="relative group">
                              <ThemeCard 
                                title={preset.title} 
                                desc={preset.desc}
                                colors={preset.colors}
                                onClick={() => set("brandingColors", preset.colors)}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 h-8 w-8 rounded-xl bg-white/80 hover:bg-rose-50 hover:text-rose-600 transition-all shadow-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const updated = [...(form.customPresets || [])];
                                  updated.splice(idx, 1);
                                  set("customPresets", updated);
                                  toast.success("Preset removed from temporary list.");
                                }}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                     </div>
                   )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="presets" className="space-y-6">
          <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden min-h-[500px]">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" /> Global Data Engine
              </CardTitle>
              <CardDescription>Manage dynamic options for dropdowns across the entire platform.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex flex-col md:flex-row h-full min-h-[440px]">
              <div className="w-full md:w-64 border-r border-border/50 bg-muted/10 p-4 space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4 px-2">Categories</p>
                {DROPDOWN_CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setActiveCategory(cat.value)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      activeCategory === cat.value 
                        ? "bg-primary text-primary-foreground shadow-md" 
                        : "text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              <div className="flex-1 p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">{DROPDOWN_CATEGORIES.find(c => c.value === activeCategory)?.label}</h3>
                    <p className="text-xs text-muted-foreground italic">Add or remove options for this category.</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Input 
                    placeholder="New option label..." 
                    value={newOptionLabel}
                    onChange={e => setNewOptionLabel(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addOption(newOptionLabel)}
                    className="rounded-xl h-11"
                  />
                  <Button onClick={() => addOption(newOptionLabel)} className="rounded-xl h-11 px-6 font-bold shrink-0">
                    <Plus className="w-4 h-4 mr-2" /> Add Option
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {loadingOptions ? (
                    <div className="col-span-full py-20 text-center">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-primary/20" />
                    </div>
                  ) : options.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-muted-foreground text-sm italic">
                      No options found for this category.
                    </div>
                  ) : options.map(opt => (
                    <div key={opt.id} className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-white/40 group hover:border-primary/20 hover:bg-primary/5 transition-all">
                      <span className="text-sm font-medium">{opt.label}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => deleteOption(opt.id)}
                        className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
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
        <TabsContent value="storage" className="space-y-6">
          <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Cloud className="w-4 h-4 text-primary" /> Cloudflare R2 Storage
              </CardTitle>
              <CardDescription>Configure S3-compatible object storage for media and documents</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Server className="w-3.5 h-3.5" /> Account ID
                  </Label>
                  <Input 
                    placeholder="Enter Cloudflare Account ID"
                    value={form.r2AccountId ?? ""} 
                    onChange={e => set("r2AccountId", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Info className="w-3.5 h-3.5" /> Bucket Name
                  </Label>
                  <Input 
                    placeholder="pel-assets"
                    value={form.r2BucketName ?? ""} 
                    onChange={e => set("r2BucketName", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Key className="w-3.5 h-3.5" /> Access Key ID
                  </Label>
                  <Input 
                    placeholder="R2 Access Key"
                    value={form.r2AccessKeyId ?? ""} 
                    onChange={e => set("r2AccessKeyId", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5" /> Secret Access Key
                  </Label>
                  <Input 
                    type="password"
                    placeholder="••••••••••••••••"
                    value={form.r2SecretAccessKey ?? ""} 
                    onChange={e => set("r2SecretAccessKey", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5" /> Public Custom Domain (Optional)
                </Label>
                <Input 
                  placeholder="https://media.pelexploration.com"
                  value={form.r2PublicCustomDomain ?? ""} 
                  onChange={e => set("r2PublicCustomDomain", e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground italic">If provided, this domain will be used to serve public assets instead of the R2 subdomain.</p>
              </div>

              <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/30 flex gap-3">
                 <Info className="w-5 h-5 text-blue-600 shrink-0" />
                 <div>
                    <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Storage Architecture</p>
                    <p className="text-[10px] text-blue-600/70 leading-relaxed mt-1">Once configured, all document uploads in the HSE, Fleet, and HR modules will be asynchronously pushed to Cloudflare's edge network for high-performance delivery.</p>
                 </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// --- HELPERS ---

const THEMES = {
  corporate: {
    primary: '#d97706', primaryForeground: '#ffffff',
    secondary: '#1f2937', secondaryForeground: '#ffffff',
    accent: '#fbbf24', accentForeground: '#000000',
    success: '#10b981', successForeground: '#ffffff',
    warning: '#f59e0b', warningForeground: '#ffffff',
    destructive: '#ef4444', destructiveForeground: '#ffffff',
    background: '#ffffff', foreground: '#09090b',
    card: '#ffffff', cardForeground: '#09090b',
    popover: '#ffffff', popoverForeground: '#09090b',
    border: '#e4e4e7', input: '#e4e4e7', ring: '#d97706',
    sidebar: '#1f2937', sidebarForeground: '#a1a1aa',
    sidebarAccent: '#d97706', sidebarAccentForeground: '#ffffff',
  },
  midnight: {
    primary: '#3b82f6', primaryForeground: '#ffffff',
    secondary: '#0f172a', secondaryForeground: '#cbd5e1',
    accent: '#1e293b', accentForeground: '#ffffff',
    success: '#059669', successForeground: '#ffffff',
    warning: '#d97706', warningForeground: '#ffffff',
    destructive: '#dc2626', destructiveForeground: '#ffffff',
    background: '#020617', foreground: '#f8fafc',
    card: '#0f172a', cardForeground: '#f8fafc',
    popover: '#0f172a', popoverForeground: '#f8fafc',
    border: '#1e293b', input: '#1e293b', ring: '#3b82f6',
    sidebar: '#020617', sidebarForeground: '#94a3b8',
    sidebarAccent: '#3b82f6', sidebarAccentForeground: '#ffffff',
  },
  hse: {
    primary: '#ea580c', primaryForeground: '#ffffff',
    secondary: '#27272a', secondaryForeground: '#ffffff',
    accent: '#fde68a', accentForeground: '#92400e',
    success: '#22c55e', successForeground: '#ffffff',
    warning: '#facc15', warningForeground: '#000000',
    destructive: '#f43f5e', destructiveForeground: '#ffffff',
    background: '#fafafa', foreground: '#18181b',
    card: '#ffffff', cardForeground: '#18181b',
    popover: '#ffffff', popoverForeground: '#18181b',
    border: '#d4d4d8', input: '#d4d4d8', ring: '#ea580c',
    sidebar: '#18181b', sidebarForeground: '#d4d4d8',
    sidebarAccent: '#ea580c', sidebarAccentForeground: '#ffffff',
  }
}

function ThemeCard({ title, desc, colors, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="group flex flex-col items-stretch p-4 rounded-3xl border border-border/50 bg-white/50 hover:bg-primary/5 hover:border-primary/20 transition-all text-left shadow-sm hover:shadow-xl hover:-translate-y-1"
    >
      <div className="flex items-center justify-between mb-4">
         <span className="text-xs font-black uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">{title}</span>
         <div className="flex -space-x-2">
            <div className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: colors.primary }}></div>
            <div className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: colors.secondary }}></div>
            <div className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: colors.accent }}></div>
         </div>
      </div>
      <p className="text-[10px] text-muted-foreground leading-relaxed italic mb-4 flex-1">
        {desc}
      </p>
      <div className="grid grid-cols-4 gap-1.5 p-1.5 rounded-2xl bg-muted/30">
         <div className="h-6 rounded-lg shadow-inner" style={{ backgroundColor: colors.background }}></div>
         <div className="h-6 rounded-lg shadow-inner" style={{ backgroundColor: colors.sidebar }}></div>
         <div className="h-6 rounded-lg shadow-inner" style={{ backgroundColor: colors.card }}></div>
         <div className="h-6 rounded-lg shadow-inner" style={{ backgroundColor: colors.primary }}></div>
      </div>
    </button>
  )
}

function ColorPicker({ label, token, value, onChange, desc, colorClass }: any) {
  return (
    <div className="space-y-3">
      <Label className="flex items-center justify-between">
        <span className={colorClass}>{label}</span>
        <span className="text-[10px] font-mono text-muted-foreground uppercase">{value}</span>
      </Label>
      <div className="flex gap-4 items-start">
        <div className="relative group/picker shrink-0">
          <input 
            type="color" 
            className="w-14 h-14 rounded-2xl cursor-pointer border-4 border-white dark:border-zinc-900 shadow-lg p-0 appearance-none overflow-hidden"
            value={value ?? "#000000"}
            onChange={e => onChange(token, e.target.value)}
          />
          <div className="absolute inset-0 rounded-2xl pointer-events-none border border-black/5 group-hover/picker:border-primary/20 transition-colors"></div>
        </div>
        <div className="flex-1 space-y-1 pt-1">
          <p className="text-[10px] text-muted-foreground leading-relaxed italic">{desc}</p>
        </div>
      </div>
    </div>
  )
}
