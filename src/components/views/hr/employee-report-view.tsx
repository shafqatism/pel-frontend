"use client"

import { useQuery } from "@tanstack/react-query"
import { hrApi } from "@/lib/api/hr"
import { useNav } from "@/lib/nav-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  ArrowLeft, Printer, Download, Users, Mail, Phone, 
  MapPin, Briefcase, Building2, Calendar, CreditCard, 
  ShieldAlert, UserCheck, FileText, ExternalLink, Loader2
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

const statusConfig = {
  active:     { label: "Active",     className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  on_leave:   { label: "On Leave",   className: "bg-amber-100  text-amber-700  border-amber-200"  },
  terminated: { label: "Terminated", className: "bg-rose-100   text-rose-700   border-rose-200"   },
  resigned:   { label: "Resigned",   className: "bg-gray-100   text-gray-600   border-gray-200"   },
}

const fmt = (d?: string) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"

const calculateAge = (birthDate?: string) => {
  if (!birthDate) return "—"
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status as keyof typeof statusConfig] ?? { label: status, className: "" }
  return <span className={`inline-flex items-center text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${cfg.className}`}>{cfg.label}</span>
}

export default function EmployeeReportView() {
  const { setActive, metadata } = useNav()
  const employeeId = metadata?.employeeId

  const { data: emp, isLoading, error } = useQuery({
    queryKey: ["employee", employeeId],
    queryFn: () => hrApi.employees.get(employeeId!),
    enabled: !!employeeId
  })

  if (!employeeId) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <p className="text-muted-foreground font-bold uppercase tracking-widest">No employee selected</p>
        <Button onClick={() => setActive("hr-employees")}>Back to Directory</Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-4">Generating Dossier...</p>
      </div>
    )
  }

  if (error || !emp) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 text-center">
        <ShieldAlert className="w-12 h-12 text-rose-500 opacity-20" />
        <p className="text-rose-600 font-black uppercase tracking-widest">Dossier Retrieval Failure</p>
        <p className="text-xs text-muted-foreground uppercase font-bold">The requested personnel record could not be found or access was denied.</p>
        <Button variant="outline" onClick={() => setActive("hr-employees")}>Return to Base</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 print:p-0">
      {/* ── ACTIONS BAR ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 print:hidden">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setActive("hr-employees")}
          className="rounded-xl h-10 px-4 border-slate-200 text-slate-600 font-bold uppercase tracking-widest text-[10px]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Files
        </Button>
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" onClick={() => window.print()} className="rounded-xl h-10 px-5 border-slate-200 text-slate-900 font-black uppercase tracking-widest text-[10px]">
              <Printer className="w-4 h-4 mr-2" /> Print Summary
           </Button>
           <Button size="sm" className="rounded-xl h-10 px-6 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px]">
              <Download className="w-4 h-4 mr-2" /> Export PDF
           </Button>
        </div>
      </div>

      <div id="printable-area" className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 print:shadow-none print:border-none print:rounded-none">
        {/* ── HEADER ────────────────────────────────────────────── */}
        <header className="bg-slate-900 text-white p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full -mr-48 -mt-48 blur-3xl opacity-20" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="w-40 h-40 rounded-[2.5rem] bg-slate-800 border-4 border-slate-700/50 flex items-center justify-center overflow-hidden shrink-0 shadow-2xl relative group">
               {emp.profilePhotoUrl ? (
                 <img src={emp.profilePhotoUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
               ) : (
                 <Users className="w-16 h-16 text-slate-600" />
               )}
            </div>
            
            <div className="text-center md:text-left flex-1 space-y-4">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                 <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">{emp.fullName}</h1>
                 <StatusBadge status={emp.status} />
              </div>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 opacity-80">
                 <p className="font-bold uppercase tracking-[0.2em] text-[11px] flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-primary" /> {emp.designation}
                 </p>
                 <span className="hidden md:inline w-1 h-1 rounded-full bg-slate-700" />
                 <p className="font-bold uppercase tracking-[0.2em] text-[11px] flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" /> {emp.department}
                 </p>
              </div>

              <div className="pt-4 flex flex-wrap justify-center md:justify-start gap-4">
                 <div className="flex items-center gap-2 text-[10px] font-black uppercase py-2 px-4 bg-slate-800/50 rounded-2xl border border-slate-700/30">
                    <Calendar className="w-3.5 h-3.5 text-primary" /> Joined {fmt(emp.joiningDate)}
                 </div>
                 <div className="flex items-center gap-2 text-[10px] font-black uppercase py-2 px-4 bg-slate-800/50 rounded-2xl border border-slate-700/30">
                    <ShieldAlert className="w-3.5 h-3.5 text-emerald-500" /> Employee ID: {emp.id.slice(0,8).toUpperCase()}
                 </div>
              </div>
            </div>
          </div>
        </header>

        {/* ── CONTENT ────────────────────────────────────────────── */}
        <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-12 bg-white">
          <div className="space-y-12">
            {/* PERSONAL INFO */}
            <section className="space-y-6">
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3">
                 <UserCheck className="w-5 h-5 text-primary" /> Personal Dossier
                 <div className="h-px bg-slate-100 flex-1" />
              </h3>
              <div className="space-y-6 bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Father's Name</p>
                    <p className="text-[13px] font-black text-slate-800">{emp.fatherName || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">National ID (CNIC)</p>
                    <p className="text-[13px] font-mono font-black text-slate-800 tracking-wider font-mono">{emp.cnic || "—"}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-6 border-t border-slate-200/50 pt-6">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Client Code</p>
                    <p className="text-[13px] font-black text-slate-800">{emp.clientEmpCode || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">People Code</p>
                    <p className="text-[13px] font-black text-slate-800">{emp.peopleEmpCode || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Age</p>
                    <p className="text-[13px] font-black text-primary">{calculateAge(emp.birthDate)} Years</p>
                  </div>
                </div>

                <div className="space-y-6 border-t border-slate-200/50 pt-6">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-primary italic font-black">@</div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Corporate Email</p>
                        <p className="text-[13px] font-black text-slate-800 leading-none">{emp.email || "—"}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center"><Phone className="w-4 h-4 text-primary" /></div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Contact Primary</p>
                        <p className="text-[13px] font-black text-slate-800 leading-none">{emp.phone || "—"}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center"><MapPin className="w-4 h-4 text-primary" /></div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Registered Address</p>
                        <p className="text-[13px] font-bold text-slate-700 leading-relaxed max-w-[280px]">{emp.address || "—"}</p>
                      </div>
                   </div>
                </div>
              </div>
            </section>

            {/* FINANCIALS */}
            <section className="space-y-6">
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3">
                 <CreditCard className="w-5 h-5 text-primary" /> Compensation & Bank
                 <div className="h-px bg-slate-100 flex-1" />
              </h3>
              <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                   <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Total Fixed CTC (monthly)</p>
                   <p className="text-3xl font-black text-slate-900 font-mono tracking-tighter">PKR {(emp.basicSalary || 0).toLocaleString()}</p>
                </div>
                <div className="grid grid-cols-2 gap-8 border-t border-slate-200/50 pt-6">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Financial Institution</p>
                    <p className="text-[11px] font-black text-slate-800 uppercase tracking-widest">{emp.bankName || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Account / IBAN</p>
                    <p className="text-[11px] font-mono font-black text-slate-800">{emp.bankAccountNumber || "—"}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-12">
            {/* EMERGENCY CONTACT */}
            <section className="space-y-6">
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3">
                 <ShieldAlert className="w-5 h-5 text-rose-500" /> Emergency Protocols
                 <div className="h-px bg-slate-100 flex-1" />
              </h3>
              <div className="p-8 rounded-[2rem] border-2 border-dashed border-rose-100 bg-rose-50/20 space-y-6">
                <div className="flex items-center gap-6">
                   <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center shrink-0 shadow-inner">
                      <ShieldAlert className="w-7 h-7 text-rose-600" />
                   </div>
                   <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-rose-400 mb-1">Primary Kin Delegate</p>
                      <p className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">{emp.emergencyContactName || "NOT REGISTERED"}</p>
                      <p className="text-lg font-black text-rose-600 font-mono mt-1 tracking-tighter">{emp.emergencyContactPhone || "—"}</p>
                   </div>
                </div>
              </div>
            </section>

            {/* ATTACHMENTS */}
            <section className="space-y-6">
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3">
                 <FileText className="w-5 h-5 text-primary" /> Identity Artifacts
                 <div className="h-px bg-slate-100 flex-1" />
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {emp.attachments && emp.attachments.length > 0 ? (
                  emp.attachments.map((file: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white hover:border-primary/50 hover:bg-slate-50/50 transition-all duration-300 group shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-primary/10 group-hover:text-primary transition-colors flex items-center justify-center text-slate-400">
                           <FileText className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-wide text-slate-900 truncate max-w-[180px]">{file.title || "Identity Document"}</p>
                           <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] italic mt-0.5">{file.fileName}</p>
                        </div>
                      </div>
                      <a href={file.fileUrl} target="_blank" rel="noreferrer" className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-primary text-slate-300 hover:text-white transition-all shadow-sm transform hover:scale-105">
                         <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  ))
                ) : (
                  <div className="py-16 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center text-center">
                     <FileText className="w-12 h-12 mb-4 text-slate-200" />
                     <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300">No Digital Evidence Provided</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* ── FOOTER ────────────────────────────────────────────── */}
        <footer className="bg-slate-50 p-12 border-t border-slate-100">
           <div className="flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="text-center md:text-left">
                 <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Authorized Payroll System</p>
                 <p className="text-[9px] font-bold text-slate-400 mt-1 italic uppercase font-mono">Verified Hash ID: {emp.id}</p>
              </div>
              
              <div className="flex gap-20">
                 <div className="text-center border-t border-slate-200 pt-3 px-8">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Department Lead</p>
                 </div>
                 <div className="text-center border-t border-slate-200 pt-3 px-8">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Operations Command</p>
                 </div>
              </div>
           </div>
           
           <div className="mt-12 flex items-center justify-between text-[8px] font-black text-slate-300 uppercase tracking-[0.5em] pt-12 border-t border-slate-100">
              <span>Security Classification Alpha-9</span>
              <span className="text-primary italic">Property of Petroleum Exploration Limited</span>
              <span>Confidential Document</span>
           </div>
        </footer>
      </div>
    </div>
  )
}
