"use client"

import { useSettings, useUpdateSettings } from "@/features/settings/hooks/use-settings"
import { useState, useEffect } from "react"
import type { UpdateSettingsDto } from "@/lib/types/settings"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Save, RefreshCw, Cog, Cloud, Server, Key, Lock, Globe, Info
} from "lucide-react"

export default function ConfigurationView() {
  const { data: settings, isLoading } = useSettings()
  const { mutate: update, isPending } = useUpdateSettings()

  const [form, setForm] = useState<UpdateSettingsDto>({})

  useEffect(() => {
    if (settings) {
      setForm({
        r2AccountId: settings.r2AccountId,
        r2AccessKeyId: settings.r2AccessKeyId,
        r2SecretAccessKey: settings.r2SecretAccessKey,
        r2BucketName: settings.r2BucketName,
        r2PublicCustomDomain: settings.r2PublicCustomDomain,
      })
    }
  }, [settings])

  const set = (k: keyof UpdateSettingsDto, v: any) => setForm(f => ({ ...f, [k]: v }))

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
            <Cog className="w-6 h-6 text-primary" /> System Configuration
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Control infrastructure, storage and advanced system hooks.</p>
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

      <div className="grid grid-cols-1 gap-6">
        <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden text-[#1F2937]">
          <CardHeader className="bg-muted/30 pb-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Cloud className="w-4 h-4 text-primary" /> Object Storage (Cloudflare R2)
            </CardTitle>
            <CardDescription>Configure S3-compatible cloud storage for secure document management.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Server className="w-3.5 h-3.5" /> Account ID
                </Label>
                <Input 
                  placeholder="Cloudflare Account ID"
                  value={form.r2AccountId ?? ""} 
                  onChange={e => set("r2AccountId", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Info className="w-3.5 h-3.5" /> Bucket Name
                </Label>
                <Input 
                  placeholder="pel-vault"
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
                  <Globe className="w-3.5 h-3.5" /> Content Delivery Domain
                </Label>
                <Input 
                  placeholder="https://cdn.pelexploration.com"
                  value={form.r2PublicCustomDomain ?? ""} 
                  onChange={e => set("r2PublicCustomDomain", e.target.value)}
                />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden opacity-50 pointer-events-none">
           <CardHeader className="bg-muted/30 pb-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Key className="w-4 h-4 text-primary" /> API Keys & Gateways
            </CardTitle>
            <CardDescription>Manage external service integrations (SMS, Mapbox, etc.)</CardDescription>
          </CardHeader>
          <CardContent className="p-12 text-center text-muted-foreground italic text-xs">
             Reserved for future infrastructure modules.
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
