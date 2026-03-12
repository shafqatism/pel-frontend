"use client"

import { useState, useEffect } from "react"
import { useRoles, useModules, useCreateRole, useUpdateRole, useDeleteRole } from "@/features/settings/hooks/use-roles"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ShieldCheck, Users, Lock, ChevronRight, Search, Plus, Trash2, Edit2, ShieldAlert, Check, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import type { Role, CreateRoleDto } from "@/lib/types/roles"

const ACTIONS = ["read", "create", "update", "delete"]

export default function RolesPermissionsView() {
  const { data: roles, isLoading } = useRoles()
  const [drawer, setDrawer] = useState<{ open: boolean, data: Role | null }>({ open: false, data: null })
  const [searchTerm, setSearchTerm] = useState("")
  const deleteMutation = useDeleteRole()

  const filteredRoles = (roles ?? []).filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" /> Authority Control
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Define access levels and assign roles to system users.</p>
        </div>
        <Button 
          onClick={() => setDrawer({ open: true, data: null })}
          className="font-black uppercase text-[10px] tracking-widest px-6 h-11 rounded-2xl"
        >
          <Plus className="w-4 h-4 mr-2" /> Create New Role
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search roles by name..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-11 h-12 rounded-2xl bg-muted/20 border-border/50" 
              />
           </div>

           {isLoading ? (
             <div className="h-40 flex items-center justify-center text-muted-foreground italic">
               Loading roles...
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRoles.map(role => (
                  <Card key={role.id} className="rounded-3xl border-border/50 hover:border-primary/20 transition-all group shadow-sm overflow-hidden">
                    <div className="p-5 flex items-start justify-between">
                      <div className="flex items-center gap-4">
                         <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                            <Lock className="w-5 h-5" />
                         </div>
                         <div>
                            <p className="text-sm font-black text-foreground">{role.name}</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5 text-muted-foreground">
                              {role.permissions.length} Permissions
                            </p>
                         </div>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg"
                          onClick={() => setDrawer({ open: true, data: role })}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg text-rose-500"
                          onClick={() => { if(confirm("Delete role?")) deleteMutation.mutate(role.id) }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="px-5 py-3 bg-muted/10 border-t border-border/30 flex items-center justify-between">
                       <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic line-clamp-1 flex-1">
                          {role.description || "No description provided"}
                       </div>
                    </div>
                  </Card>
                ))}
             </div>
           )}
        </div>

        <div className="space-y-6">
           <Card className="rounded-[2.5rem] border-border/50 shadow-sm bg-primary/5 border-primary/10 overflow-hidden">
              <CardHeader>
                 <CardTitle className="text-xs font-black uppercase tracking-widest text-primary">Security Status</CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="space-y-4">
                    <div className="p-4 rounded-3xl bg-white/80 dark:bg-black/40 border border-primary/5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Managed Roles</p>
                        <p className="text-2xl font-black text-foreground">{roles?.length ?? 0}</p>
                    </div>
                    <div className="p-4 rounded-3xl bg-white/80 dark:bg-black/40 border border-primary/5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Permissions</p>
                        <p className="text-2xl font-black text-emerald-600">
                          {roles?.reduce((acc, r) => acc + r.permissions.length, 0) ?? 0}
                        </p>
                    </div>
                 </div>
              </CardContent>
           </Card>

           <Card className="rounded-[2.5rem] border-border/50 shadow-sm">
              <CardHeader>
                 <CardTitle className="text-xs font-black uppercase tracking-widest">Help & Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex gap-3">
                   <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                   <p className="text-[10px] text-amber-700 leading-relaxed font-medium">
                     Permissions are module-based. Adding a new module will automatically make it available for management here.
                   </p>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>

      <RoleDrawer 
        open={drawer.open} 
        onClose={() => setDrawer({ open: false, data: null })} 
        data={drawer.data} 
      />
    </div>
  )
}

function RoleDrawer({ open, onClose, data }: { open: boolean, onClose: () => void, data: Role | null }) {
  const { data: modules } = useModules()
  const createMutation = useCreateRole()
  const updateMutation = useUpdateRole()
  const isPending = createMutation.isPending || updateMutation.isPending

  const [form, setForm] = useState<CreateRoleDto>({
    name: "",
    description: "",
    permissions: []
  })

  // Sync form state with data
  useEffect(() => {
    if (data) {
      setForm({
        name: data.name,
        description: data.description || "",
        permissions: data.permissions.map(p => ({ module: p.module, action: p.action }))
      })
    } else {
      setForm({ name: "", description: "", permissions: [] })
    }
  }, [data, open])

  const togglePermission = (module: string, action: string) => {
    setForm(prev => {
      const exists = prev.permissions.find(p => p.module === module && p.action === action)
      if (exists) {
        return { ...prev, permissions: prev.permissions.filter(p => !(p.module === module && p.action === action)) }
      } else {
        return { ...prev, permissions: [...prev.permissions, { module, action }] }
      }
    })
  }

  const handleSave = () => {
    if (data) {
      updateMutation.mutate({ id: data.id, dto: form }, { onSuccess: onClose })
    } else {
      createMutation.mutate(form, { onSuccess: onClose })
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-2xl w-full p-0 flex flex-col">
        <div className="p-6 border-b border-border/40 bg-muted/20">
          <SheetHeader>
            <SheetTitle className="text-xl font-black uppercase tracking-tight">
              {data ? "Edit Authority Level" : "New Authority Level"}
            </SheetTitle>
            <SheetDescription>Configure which modules and actions this role can perform.</SheetDescription>
          </SheetHeader>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Role Name *</Label>
                <Input 
                  placeholder="e.g. HR Manager" 
                  value={form.name} 
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input 
                  placeholder="What can this user do?" 
                  value={form.description} 
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border/40">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-black uppercase tracking-[0.2em] text-primary">Permission Matrix</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/5"
                  onClick={() => {
                    const all: any[] = []
                    modules?.forEach(mod => {
                      ACTIONS.forEach(act => all.push({ module: mod, action: act }))
                    })
                    setForm(f => ({ ...f, permissions: all }))
                  }}
                >
                  <Plus className="w-3 h-3 mr-1" /> Grant Full Access
                </Button>
              </div>
              <div className="rounded-2xl border border-border/50 overflow-hidden bg-muted/5">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border/50">
                      <th className="p-3 font-black uppercase tracking-widest text-muted-foreground/60 w-1/3">Module</th>
                      {ACTIONS.map(a => (
                        <th key={a} className="p-3 font-black uppercase tracking-widest text-center text-muted-foreground/60">{a}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {(modules ?? []).map(mod => (
                      <tr key={mod} className="hover:bg-primary/5 transition-colors">
                        <td className="p-3 font-bold capitalize text-foreground">{mod.replace('-', ' ')}</td>
                        {ACTIONS.map(action => {
                          const isChecked = form.permissions.some(p => p.module === mod && p.action === action)
                          return (
                            <td key={action} className="p-3 text-center">
                              <button 
                                onClick={() => togglePermission(mod, action)}
                                className={`w-6 h-6 rounded-lg border-2 transition-all inline-flex items-center justify-center ${
                                  isChecked 
                                    ? "bg-primary border-primary text-white shadow-md shadow-primary/20 scale-110" 
                                    : "border-border/60 hover:border-primary/40 bg-white"
                                }`}
                              >
                                {isChecked ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 text-muted-foreground/30" />}
                              </button>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border/40 flex justify-end gap-3 bg-muted/10">
          <Button variant="outline" onClick={onClose} className="rounded-xl px-6">Cancel</Button>
          <Button 
            onClick={handleSave} 
            disabled={isPending || !form.name}
            className="rounded-xl px-8 font-black uppercase tracking-widest text-[10px]"
          >
            {isPending ? "Validating..." : data ? "Update Level" : "Secure Role"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
