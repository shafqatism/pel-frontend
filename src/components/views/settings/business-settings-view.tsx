"use client"

import { useSettings, useUpdateSettings } from "@/features/settings/hooks/use-settings"
import { useDropdownOptions, useAddDropdownOption, useDeleteDropdownOption } from "@/features/dropdowns/hooks/use-dropdowns"
import { useState, useEffect } from "react"
import type { UpdateSettingsDto } from "@/lib/types/settings"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Building2, Palette, Bell, Globe, 
  Save, RefreshCw, Cog, Database, Plus, Trash2, Info, Loader2, Image as ImageIcon
} from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/api"

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

export default function BusinessSettingsView() {
  const { data: settings, isLoading } = useSettings()
  const { mutate: update, isPending } = useUpdateSettings()

  const [form, setForm] = useState<UpdateSettingsDto>({})
  const [activeCategory, setActiveCategory] = useState(DROPDOWN_CATEGORIES[0].value)
  const [newOptionLabel, setNewOptionLabel] = useState("")
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const { data: options = [], isLoading: loadingOptions } = useDropdownOptions(activeCategory)
  const { mutate: addOption } = useAddDropdownOption()
  const { mutate: deleteOption } = useDeleteDropdownOption()

  const handleAddOption = (label: string) => {
    if (!label) return
    addOption({ category: activeCategory, label }, {
      onSuccess: () => setNewOptionLabel("")
    })
  }

  useEffect(() => {
    if (settings) {
      setForm({
        companyName: settings.companyName,
        currency: settings.currency,
        logoUrl: settings.logoUrl,
        unitSystem: settings.unitSystem,
        maintenanceIntervalKm: settings.maintenanceIntervalKm,
        systemEmail: settings.systemEmail,
        brandingColors: { ...settings.brandingColors },
        enableNotifications: settings.enableNotifications,
        customPresets: settings.customPresets ?? []
      })
    }
  }, [settings])

  const set = (k: keyof UpdateSettingsDto, v: any) => setForm(f => ({ ...f, [k]: v }))
  const setBranding = (k: keyof UpdateSettingsDto['brandingColors'], v: string) => 
    setForm(f => ({ ...f, brandingColors: { ...f.brandingColors!, [k]: v } }))

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setUploadingLogo(true)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("module", "settings")

    try {
      const { data } = await api.post("/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      setForm(f => ({ ...f, logoUrl: data.url }))
      toast.success("Logo uploaded successfully. Don't forget to save changes.")
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to upload logo")
    } finally {
      setUploadingLogo(false)
    }
  }

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
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" /> Business Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage identity, palette, and preset data for your organization.</p>
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
        <TabsList className="bg-muted/50 p-1 rounded-2xl mb-6 flex-wrap h-auto">
          <TabsTrigger value="general" className="rounded-xl px-6 font-bold uppercase text-[10px] tracking-widest">General</TabsTrigger>
          <TabsTrigger value="branding" className="rounded-xl px-6 font-bold uppercase text-[10px] tracking-widest">Branding</TabsTrigger>
          <TabsTrigger value="presets" className="rounded-xl px-6 font-bold uppercase text-[10px] tracking-widest">Data Presets</TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-xl px-6 font-bold uppercase text-[10px] tracking-widest">Notifications</TabsTrigger>
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
                <div className="space-y-3 pt-2">
                  <Label>Business Logo</Label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-24 h-24 rounded-2xl bg-muted/30 border border-border/50 flex flex-col items-center justify-center overflow-hidden shrink-0 shadow-sm">
                      {uploadingLogo ? (
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      ) : form.logoUrl ? (
                        <img src={form.logoUrl} alt="Logo preview" className="w-full h-full object-contain p-2" />
                      ) : (
                         <div className="text-center space-y-1 opacity-50">
                            <ImageIcon className="w-6 h-6 mx-auto mb-1" />
                            <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground block">No Logo</span>
                         </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 w-full max-w-sm">
                      <Input 
                        type="file" 
                        accept="image/*" 
                        disabled={uploadingLogo} 
                        onChange={handleLogoUpload}
                        className="cursor-pointer file:text-primary file:font-semibold text-xs h-10 py-2 rounded-xl"
                      />
                      <p className="text-[10px] text-muted-foreground leading-relaxed italic">Upload a transparent PNG or vibrant SVG. Maximum height 200px recommended for navbar consistency.</p>
                      {form.logoUrl && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setForm(f => ({ ...f, logoUrl: null }))}
                          className="h-7 px-3 text-[10px] uppercase tracking-widest text-destructive hover:text-destructive w-fit font-bold rounded-lg"
                        >
                          Clear Logo Attachment
                        </Button>
                      )}
                    </div>
                  </div>
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
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="branding" className="space-y-6">
          <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary" /> Visual Identity
              </CardTitle>
              <CardDescription>Tailor the visual colors across the entire PEL ERP ecosystem.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <ColorPicker label="Primary Brand" token="primary" value={form.brandingColors?.primary} onChange={setBranding} desc="Main action color." />
                  <ColorPicker label="Secondary Accent" token="secondary" value={form.brandingColors?.secondary} onChange={setBranding} desc="Secondary buttons and containers." />
                  <ColorPicker label="Highlight Accent" token="accent" value={form.brandingColors?.accent} onChange={setBranding} desc="Subtle accents." />
                  <ColorPicker label="Success State" token="success" value={form.brandingColors?.success} onChange={setBranding} desc="Positive results." colorClass="text-emerald-500" />
                  <ColorPicker label="Warning State" token="warning" value={form.brandingColors?.warning} onChange={setBranding} desc="Cautionary alerts." colorClass="text-amber-500" />
                  <ColorPicker label="Destructive State" token="destructive" value={form.brandingColors?.destructive} onChange={setBranding} desc="Critical errors." colorClass="text-rose-500" />
               </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="presets" className="space-y-6">
          <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden min-h-[500px]">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" /> Global Data Presets
              </CardTitle>
              <CardDescription>Manage dynamic options for dropdowns category-wise.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex flex-col md:flex-row h-full min-h-[440px]">
              <div className="w-full md:w-64 border-r border-border/50 bg-muted/10 p-4 space-y-1">
                {DROPDOWN_CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setActiveCategory(cat.value)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold uppercase transition-all ${
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
                 <div className="flex gap-2">
                  <Input 
                    placeholder="New option label..." 
                    value={newOptionLabel}
                    onChange={e => setNewOptionLabel(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleAddOption(newOptionLabel)}
                    className="rounded-xl"
                  />
                  <Button onClick={() => handleAddOption(newOptionLabel)} className="rounded-xl font-bold">
                    <Plus className="w-4 h-4 mr-2" /> Add
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {loadingOptions ? (
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-primary/20" />
                  ) : options.map(opt => (
                    <div key={opt.id} className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-white/40 group">
                      <span className="text-sm font-medium">{opt.label}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => deleteOption(opt.id)}
                        className="h-8 w-8 text-rose-500 opacity-0 group-hover:opacity-100"
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
                <Bell className="w-4 h-4 text-primary" /> Notification Preferences
              </CardTitle>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
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
        <input 
          type="color" 
          className="w-12 h-12 rounded-xl cursor-pointer border-2 border-white shadow-sm p-0 appearance-none overflow-hidden"
          value={value ?? "#000000"}
          onChange={e => onChange(token, e.target.value)}
        />
        <div className="flex-1 space-y-1 pt-1">
          <p className="text-[10px] text-muted-foreground leading-relaxed italic">{desc}</p>
        </div>
      </div>
    </div>
  )
}
