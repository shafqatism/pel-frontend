"use client"

import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from "@/features/settings/hooks/use-users"
import { useRoles } from "@/features/settings/hooks/use-roles"
import { useEmployeesDropdown } from "@/features/hr/hooks/use-employees"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Users, UserPlus, Search, Shield, Mail, Edit3, Trash2, 
  MoreVertical, CheckCircle2, XCircle, UserCheck 
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"

export default function UsersManagementView() {
  const { data: users, isLoading } = useUsers()
  const { data: roles } = useRoles()
  const { data: employees } = useEmployeesDropdown()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const deleteUser = useDeleteUser()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    role: "user",
    roleId: "",
    employeeId: ""
  })

  const filteredUsers = users?.filter((u: any) => 
    u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenDrawer = (user?: any) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        email: user.email,
        password: "", // Don't show password
        fullName: user.fullName,
        role: user.role,
        roleId: user.roleId || "",
        employeeId: user.employeeId || ""
      })
    } else {
      setEditingUser(null)
      setFormData({
        email: "",
        password: "",
        fullName: "",
        role: "user",
        roleId: "",
        employeeId: ""
      })
    }
    setIsDrawerOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingUser) {
      // only send password if it's not empty
      const data = { ...formData }
      if (!data.password) delete (data as any).password
      updateUser.mutate({ id: editingUser.id, data }, {
        onSuccess: () => setIsDrawerOpen(false)
      })
    } else {
      createUser.mutate(formData, {
        onSuccess: () => setIsDrawerOpen(false)
      })
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" /> User Management
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Control login access and assigned roles for all platform users</p>
        </div>
        <Button onClick={() => handleOpenDrawer()} className="bg-primary hover:bg-primary/90 font-bold rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]">
          <UserPlus className="w-4 h-4 mr-2" />
          Add New User
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-muted/30 p-2 rounded-2xl border border-border/40">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search users by name or email..." 
            className="pl-10 h-10 bg-white/50 border-none rounded-xl focus-visible:ring-primary/20"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="rounded-[2rem] border-border/40 shadow-xl overflow-hidden bg-white/50 backdrop-blur-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-border/40">
                <TableHead className="font-bold py-5 pl-8">User Details</TableHead>
                <TableHead className="font-bold">Login Role</TableHead>
                <TableHead className="font-bold">Assigned Permission Role</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="text-right pr-8">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-8 py-4"><Skeleton className="h-10 w-48 rounded-lg" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-lg" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-32 rounded-lg" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-lg" /></TableCell>
                    <TableCell className="text-right pr-8"><Skeleton className="h-8 w-8 rounded-lg ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredUsers?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center italic text-muted-foreground">
                    No users found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : filteredUsers?.map((user: any) => (
                <TableRow key={user.id} className="hover:bg-primary/5 transition-colors group border-border/40">
                  <TableCell className="py-4 pl-8">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {user.fullName?.charAt(0)}
                       </div>
                       <div>
                          <p className="font-bold text-sm">{user.fullName}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                             <Mail className="w-3 h-3" /> {user.email}
                          </p>
                       </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? "default" : "secondary"} className="rounded-lg capitalize px-2.5 py-0.5 font-bold tracking-tight">
                       {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.roleDetail?.name ? (
                       <Badge variant="outline" className="rounded-lg bg-indigo-50/50 text-indigo-700 border-indigo-200 px-2.5 py-0.5 font-bold flex items-center gap-1.5 w-fit">
                          <Shield className="w-3 h-3" /> {user.roleDetail.name}
                       </Badge>
                    ) : (
                       <span className="text-xs text-muted-foreground italic">None assigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                     <Badge className="bg-emerald-100 text-emerald-700 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest border-emerald-200">
                        Active
                     </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg group-hover:bg-white transition-all shadow-sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl p-1.5 border-border/40 shadow-xl min-w-[160px]">
                        <DropdownMenuItem onClick={() => handleOpenDrawer(user)} className="rounded-lg gap-2 font-medium cursor-pointer">
                          <Edit3 className="w-4 h-4 text-primary" /> Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => {
                             if(confirm("Are you sure you want to delete this user?")) deleteUser.mutate(user.id)
                          }}
                          className="rounded-lg gap-2 font-medium text-rose-600 focus:text-rose-600 focus:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" /> Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent side="right" className="sm:max-w-lg md:max-w-xl overflow-y-auto">
           <div className="mx-auto w-full">
             <SheetHeader className="text-center px-4">
               <SheetTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                  <UserCheck className="w-6 h-6 text-primary" /> {editingUser ? "Edit System User" : "Register New User"}
               </SheetTitle>
               <SheetDescription>
                  Configure system access for {editingUser ? editingUser.fullName : "a new individual"}.
               </SheetDescription>
             </SheetHeader>

             <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input 
                        placeholder="e.g. Shafqat Ali" 
                        required
                        value={formData.fullName}
                        onChange={e => setFormData(f => ({ ...f, fullName: e.target.value }))}
                        className="rounded-xl h-11"
                      />
                   </div>
                   <div className="space-y-2">
                      <Label>Login Email</Label>
                      <Input 
                        type="email"
                        placeholder="admin@pel.com.pk" 
                        required
                        value={formData.email}
                        onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                        className="rounded-xl h-11"
                      />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <Label>Password {editingUser && "(Leave blank to keep same)"}</Label>
                      <Input 
                        type="password"
                        placeholder="••••••••" 
                        required={!editingUser}
                        value={formData.password}
                        onChange={e => setFormData(f => ({ ...f, password: e.target.value }))}
                        className="rounded-xl h-11"
                      />
                   </div>
                   <div className="space-y-2">
                      <Label>System Role (Bypass Level)</Label>
                      <Select 
                        value={formData.role}
                        onValueChange={v => setFormData(f => ({ ...f, role: v }))}
                      >
                         <SelectTrigger className="rounded-xl h-11">
                            <SelectValue />
                         </SelectTrigger>
                         <SelectContent className="rounded-xl border-border/40 shadow-xl">
                            <SelectItem value="user" className="rounded-lg">Standard User (Permission Based)</SelectItem>
                            <SelectItem value="admin" className="rounded-lg font-bold text-primary">System Admin (Full Bypass)</SelectItem>
                         </SelectContent>
                      </Select>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <Label className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-indigo-500" /> Permission Role</Label>
                      <Select 
                        value={formData.roleId}
                        onValueChange={v => setFormData(f => ({ ...f, roleId: v }))}
                      >
                         <SelectTrigger className="rounded-xl h-11">
                            <SelectValue placeholder="Select a role..." />
                         </SelectTrigger>
                         <SelectContent className="rounded-xl border-border/40 shadow-xl">
                            <SelectItem value="none" className="rounded-lg italic text-muted-foreground">No specific role</SelectItem>
                            {roles?.map((r: any) => (
                               <SelectItem key={r.id} value={r.id} className="rounded-lg font-medium">{r.name}</SelectItem>
                            ))}
                         </SelectContent>
                      </Select>
                   </div>
                   <div className="space-y-2">
                      <Label>Link Employee Profile</Label>
                      <Select 
                        value={formData.employeeId}
                        onValueChange={v => setFormData(f => ({ ...f, employeeId: v }))}
                      >
                         <SelectTrigger className="rounded-xl h-11">
                            <SelectValue placeholder="Select employee..." />
                         </SelectTrigger>
                         <SelectContent className="rounded-xl border-border/40 shadow-xl">
                            <SelectItem value="none" className="rounded-lg italic text-muted-foreground">Not linked to employee</SelectItem>
                            {employees?.map((e: any) => (
                               <SelectItem key={e.id} value={e.id} className="rounded-lg font-medium">{e.fullName}</SelectItem>
                            ))}
                         </SelectContent>
                      </Select>
                   </div>
                </div>

                <SheetFooter className="px-0 pt-6">
                  <Button type="submit" disabled={createUser.isPending || updateUser.isPending} className="rounded-2xl h-14 font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all text-sm w-full">
                     {editingUser ? "Update User Access" : "Create System Access"}
                  </Button>
                  <SheetClose asChild>
                    <Button variant="ghost" className="rounded-2xl h-12 font-bold uppercase tracking-widest text-muted-foreground hover:bg-muted/50 w-full mt-2">Cancel</Button>
                  </SheetClose>
                </SheetFooter>
             </form>
           </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
