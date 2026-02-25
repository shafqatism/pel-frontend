"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { companiesApi } from "@/lib/api/companies"
import {
  Building2, Plus, Search, Filter, MoreHorizontal,
  Mail, Phone, MapPin, Edit, Trash2,
  CheckCircle2, ExternalLink, ArrowUpRight,
  Globe, RefreshCw, AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Users } from "lucide-react"

// ─── helpers ─────────────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  vendor:  "bg-blue-50 text-blue-700 border-blue-200",
  client:  "bg-amber-50 text-amber-700 border-amber-200",
  partner: "bg-purple-50 text-purple-700 border-purple-200",
}
const STATUS_COLORS: Record<string, string> = {
  active:   "bg-emerald-50 text-emerald-700 border-emerald-200",
  inactive: "bg-rose-50 text-rose-700 border-rose-200",
}
const LBL = "text-[10px] font-black uppercase tracking-widest text-muted-foreground"

// ─── Main View ────────────────────────────────────────────────────────────────
export default function CompaniesView() {
  const [search, setSearch]       = useState("")
  const [category, setCategory]   = useState("all")
  const [dialogOpen, setDialog]   = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const qc = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ["companies", { search, category }],
    queryFn: () =>
      companiesApi.list({
        search: search || undefined,
        category: category === "all" ? undefined : category,
      }),
  })

  const deleteMut = useMutation({
    mutationFn: companiesApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["companies"] }); toast.success("Company removed") },
    onError:   () => toast.error("Failed to delete"),
  })

  const rows = data?.data ?? []

  const openNew  = () => { setEditingId(null); setDialog(true) }
  const openEdit = (id: string) => { setEditingId(id); setDialog(true) }
  const onSuccess = () => { setDialog(false); setEditingId(null); qc.invalidateQueries({ queryKey: ["companies"] }) }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" /> Company Registry
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage vendors, clients, and partner organizations
          </p>
        </div>
        <Button onClick={openNew} className="self-start sm:self-auto gap-2 rounded-xl shadow-lg shadow-primary/20 font-bold">
          <Plus className="w-4 h-4" /> Register Company
        </Button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total",   value: data?.total ?? 0,                                                     icon: Building2,     color: "text-blue-600",   bg: "bg-blue-50" },
          { label: "Vendors", value: rows.filter(r => r.category === "vendor"  && r.status === "active").length, icon: CheckCircle2,  color: "text-emerald-600",bg: "bg-emerald-50" },
          { label: "Partners",value: rows.filter(r => r.category === "partner").length,                       icon: Globe,         color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Clients", value: rows.filter(r => r.category === "client").length,                        icon: Users,         color: "text-amber-600",  bg: "bg-amber-50" },
        ].map(s => (
          <Card key={s.label} className="rounded-2xl border-none shadow-sm bg-muted/30">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-2xl shrink-0 ${s.bg}`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className={`${LBL} text-[9px]`}>{s.label}</p>
                <p className="text-xl font-black">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Filters & Table ── */}
      <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">

        {/* toolbar */}
        <div className="p-4 border-b border-border/40 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search name, email, contact…"
              className="pl-9 rounded-xl h-9 border-border/40 bg-muted/20 text-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-[160px] rounded-xl h-9 border-border/40 bg-muted/20 text-sm">
              <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground shrink-0" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="vendor">Vendors</SelectItem>
              <SelectItem value="client">Clients</SelectItem>
              <SelectItem value="partner">Partners</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-[10px] font-black text-muted-foreground tracking-widest uppercase sm:ml-auto">
            {rows.length} record{rows.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* states */}
        {isLoading ? (
          <div className="py-24 text-center space-y-3">
            <Building2 className="w-10 h-10 mx-auto animate-bounce text-primary/20" />
            <p className={`${LBL}`}>Accessing registry…</p>
          </div>
        ) : isError ? (
          <div className="py-24 text-center space-y-3">
            <AlertCircle className="w-10 h-10 mx-auto text-rose-400" />
            <p className="font-bold text-rose-600">Failed to load companies</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="py-24 text-center space-y-3">
            <Building2 className="w-10 h-10 mx-auto text-muted-foreground/20" />
            <p className={`${LBL}`}>No organizations found</p>
            <Button variant="link" onClick={() => { setSearch(""); setCategory("all") }}>
              Clear filters
            </Button>
          </div>
        ) : (

          /* table – horizontal scroll on mobile */
          <div className="overflow-x-auto">
            <Table className="min-w-[760px]">
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/50">
                  {["Company", "Identifiers", "Contact", "Location", "Status", ""].map(h => (
                    <TableHead key={h} className="font-black text-[10px] uppercase tracking-[0.2em] py-3">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(c => (
                  <TableRow key={c.id} className="group hover:bg-muted/20 border-b border-border/30">

                    {/* Company */}
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-black text-primary shrink-0 uppercase">
                          {c.name.substring(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-sm truncate flex items-center gap-1">
                            {c.name}
                            {c.website && (
                              <a href={c.website} target="_blank" rel="noopener noreferrer" className="opacity-0 group-hover:opacity-100">
                                <ExternalLink className="w-3 h-3 text-muted-foreground" />
                              </a>
                            )}
                          </div>
                          <div className="flex gap-2 mt-0.5 flex-wrap">
                            {c.email && <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Mail className="w-2.5 h-2.5" />{c.email}</span>}
                            {c.phone && <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Phone className="w-2.5 h-2.5" />{c.phone}</span>}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Identifiers */}
                    <TableCell>
                      <div className="space-y-0.5 text-[10px]">
                        {c.registrationNumber && <div className="text-muted-foreground">Reg: <span className="text-foreground font-bold">{c.registrationNumber}</span></div>}
                        {c.taxId            && <div className="text-muted-foreground">NTN: <span className="text-foreground font-bold">{c.taxId}</span></div>}
                        {!c.registrationNumber && !c.taxId && <span className="italic text-muted-foreground">—</span>}
                      </div>
                    </TableCell>

                    {/* Contact */}
                    <TableCell className="text-xs font-semibold">{c.contactPerson || "—"}</TableCell>

                    {/* Location */}
                    <TableCell>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3 shrink-0" />
                        {c.city ? `${c.city}, ${c.country}` : "Global"}
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className={`w-fit text-[9px] font-black uppercase ${STATUS_COLORS[c.status] ?? ""}`}>{c.status}</Badge>
                        <Badge variant="outline" className={`w-fit text-[9px] font-black uppercase ${CATEGORY_COLORS[c.category] ?? ""}`}>{c.category}</Badge>
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-xl">
                          <DropdownMenuItem className="gap-2 text-xs font-bold" onClick={() => openEdit(c.id)}>
                            <Edit className="w-3.5 h-3.5" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="gap-2 text-xs font-bold text-rose-600 focus:text-rose-600"
                            onClick={() => { if (confirm("Remove this organization?")) deleteMut.mutate(c.id) }}
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* ── Responsive Dialog Form ── */}
      <CompanyDialog open={dialogOpen} onOpenChange={setDialog} id={editingId} onSuccess={onSuccess} />
    </div>
  )
}

// ─── Company Dialog ───────────────────────────────────────────────────────────
function CompanyDialog({
  open, onOpenChange, id, onSuccess,
}: { open: boolean; onOpenChange: (v: boolean) => void; id: string | null; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false)

  const { data: existing } = useQuery({
    queryKey: ["company-detail", id],
    queryFn:  () => (id ? companiesApi.get(id) : null),
    enabled:  !!id,
  })

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const data = Object.fromEntries(new FormData(e.currentTarget))
    try {
      if (id) {
        await companiesApi.update(id, data as any)
        toast.success("Company updated")
      } else {
        await companiesApi.create(data as any)
        toast.success("Company registered")
      }
      onSuccess()
    } catch {
      toast.error("Failed to save")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full p-0 gap-0 overflow-hidden rounded-2xl">

        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/40 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base font-black uppercase tracking-tight">
                {id ? "Update Organization" : "Register New Company"}
              </DialogTitle>
              <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">
                {id ? "Edit organization details" : "Fill in the organization details below"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Form body — scrollable */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 overflow-y-auto max-h-[65vh] space-y-5">

            {/* Section: Identity */}
            <section className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary border-l-2 border-primary pl-2">
                Organization Identity
              </p>

              <div className="grid gap-2">
                <Label htmlFor="name" className={LBL}>Official Company Name <span className="text-rose-500">*</span></Label>
                <Input
                  id="name" name="name" required
                  defaultValue={existing?.name}
                  placeholder="e.g. Petroleum Logistics Ltd."
                  className="rounded-xl h-10 border-border/50 focus-visible:ring-primary/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category" className={LBL}>Organization Type</Label>
                  <Select name="category" defaultValue={existing?.category ?? "vendor"}>
                    <SelectTrigger id="category" className="rounded-xl h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vendor">Vendor</SelectItem>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="partner">Partner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status" className={LBL}>Status</Label>
                  <Select name="status" defaultValue={existing?.status ?? "active"}>
                    <SelectTrigger id="status" className="rounded-xl h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="registrationNumber" className={LBL}>Registration Number</Label>
                  <Input id="registrationNumber" name="registrationNumber" defaultValue={existing?.registrationNumber} placeholder="SEC-00123" className="rounded-xl h-10 border-border/50" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="taxId" className={LBL}>Tax ID / NTN</Label>
                  <Input id="taxId" name="taxId" defaultValue={existing?.taxId} placeholder="1234567-8" className="rounded-xl h-10 border-border/50" />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="industry" className={LBL}>Industry</Label>
                <Input id="industry" name="industry" defaultValue={existing?.industry} placeholder="e.g. Energy, Logistics, Safety…" className="rounded-xl h-10 border-border/50" />
              </div>
            </section>

            <Separator />

            {/* Section: Contact */}
            <section className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary border-l-2 border-primary pl-2">
                Contact Information
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email" className={LBL}>Corporate Email</Label>
                  <Input id="email" name="email" type="email" defaultValue={existing?.email} placeholder="contact@company.com" className="rounded-xl h-10 border-border/50" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone" className={LBL}>Phone / Ext.</Label>
                  <Input id="phone" name="phone" defaultValue={existing?.phone} placeholder="+92 21 …" className="rounded-xl h-10 border-border/50" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="contactPerson" className={LBL}>Focal Person / Manager</Label>
                  <Input id="contactPerson" name="contactPerson" defaultValue={existing?.contactPerson} placeholder="Full name" className="rounded-xl h-10 border-border/50" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="website" className={LBL}>Website URL</Label>
                  <Input id="website" name="website" type="url" defaultValue={existing?.website} placeholder="https://…" className="rounded-xl h-10 border-border/50" />
                </div>
              </div>
            </section>

            <Separator />

            {/* Section: Location */}
            <section className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary border-l-2 border-primary pl-2">
                Location & Address
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="city" className={LBL}>City</Label>
                  <Input id="city" name="city" defaultValue={existing?.city} placeholder="City name" className="rounded-xl h-10 border-border/50" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="country" className={LBL}>Country</Label>
                  <Input id="country" name="country" defaultValue={existing?.country ?? "Pakistan"} className="rounded-xl h-10 border-border/50" />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address" className={LBL}>Street / Office Address</Label>
                <Input id="address" name="address" defaultValue={existing?.address} placeholder="Plot #, Street, Area…" className="rounded-xl h-10 border-border/50" />
              </div>
            </section>
          </div>

          {/* ── Sticky footer ── */}
          <div className="px-6 py-4 border-t border-border/40 bg-muted/10 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl font-bold"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-xl font-black uppercase tracking-widest text-xs gap-2 shadow-lg shadow-primary/20"
            >
              {loading
                ? <RefreshCw className="w-4 h-4 animate-spin" />
                : <CheckCircle2 className="w-4 h-4" />}
              {id ? "Save Changes" : "Register Company"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
