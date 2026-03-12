"use client"

import { useQuery } from "@tanstack/react-query"
import { companiesApi } from "@/lib/api/companies"
import { useNav } from "@/lib/nav-context"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft, Printer, Download, Building2, Mail, Phone, 
  MapPin, Globe, ShieldCheck, FileText, ExternalLink, Loader2,
  Calendar, CreditCard, User, Layers
} from "lucide-react"

export default function CompanyReportView() {
  const { setActive, metadata } = useNav()
  const companyId = metadata?.companyId

  const { data: c, isLoading, error } = useQuery({
    queryKey: ["company", companyId],
    queryFn: () => companiesApi.get(companyId!),
    enabled: !!companyId
  })

  if (!companyId) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">No organization selected</p>
        <Button onClick={() => setActive("companies")} variant="outline" className="rounded-xl font-black uppercase tracking-widest text-[10px]">Back to Directory</Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-4">Compiling Profile...</p>
      </div>
    )
  }

  if (error || !c) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 text-center">
        <ShieldCheck className="w-12 h-12 text-rose-500 opacity-20" />
        <p className="text-rose-600 font-black uppercase tracking-widest">Profile Compilation Failure</p>
        <Button variant="outline" onClick={() => setActive("companies")}>Return to Base</Button>
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
          onClick={() => setActive("companies")}
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
            <div className="w-40 h-40 rounded-[2.5rem] bg-slate-800 border-4 border-slate-700/50 flex items-center justify-center shrink-0 shadow-2xl text-4xl font-black text-primary">
               {c.name.substring(0, 2).toUpperCase()}
            </div>
            
            <div className="text-center md:text-left flex-1 space-y-4">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                 <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">{c.name}</h1>
                 <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    c.status === 'active' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-rose-500 text-white border-rose-400'
                 }`}>{c.status}</span>
              </div>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 opacity-80">
                 <p className="font-bold uppercase tracking-[0.2em] text-[11px] flex items-center gap-2 text-primary">
                    <Globe className="w-4 h-4" /> {c.category} Organization
                 </p>
                 <span className="hidden md:inline w-1 h-1 rounded-full bg-slate-700" />
                 <p className="font-bold uppercase tracking-[0.2em] text-[11px] flex items-center gap-2">
                    <Layers className="w-4 h-4" /> {c.industry || "General Industry"}
                 </p>
              </div>

              <div className="pt-4 flex flex-wrap justify-center md:justify-start gap-4 text-white/60">
                 <div className="flex items-center gap-2 text-[10px] font-black uppercase py-2 px-4 bg-slate-800/50 rounded-2xl border border-slate-700/30">
                    <Building2 className="w-3.5 h-3.5 text-primary" /> REG: {c.registrationNumber || "NOT FILED"}
                 </div>
                 <div className="flex items-center gap-2 text-[10px] font-black uppercase py-2 px-4 bg-slate-800/50 rounded-2xl border border-slate-700/30">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-500" /> NTN: {c.taxId || "NOT FILED"}
                 </div>
              </div>
            </div>
          </div>
        </header>

        {/* ── CONTENT ────────────────────────────────────────────── */}
        <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-12 bg-white">
          <div className="space-y-12">
            {/* CONTACT INFO */}
            <section className="space-y-6">
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3">
                 <User className="w-5 h-5 text-primary" /> Focal Representation
                 <div className="h-px bg-slate-100 flex-1" />
              </h3>
              <div className="space-y-6 bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Designated Authority</p>
                  <p className="text-xl font-black text-slate-900 uppercase tracking-tight">{c.contactPerson || "NO DELEGATE"}</p>
                </div>

                <div className="space-y-6 border-t border-slate-200/50 pt-6">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-primary italic font-black">@</div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Official Communication</p>
                        <p className="text-[13px] font-black text-slate-800 leading-none">{c.email || "—"}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center"><Phone className="w-4 h-4 text-primary" /></div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Direct Line</p>
                        <p className="text-[13px] font-black text-slate-800 leading-none">{c.phone || "—"}</p>
                      </div>
                   </div>
                   {c.website && (
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center"><Globe className="w-4 h-4 text-primary" /></div>
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Digital Portal</p>
                          <a href={c.website} target="_blank" rel="noreferrer" className="text-[13px] font-black text-primary underline truncate max-w-[200px] block">{c.website}</a>
                        </div>
                      </div>
                   )}
                </div>
              </div>
            </section>

            {/* LOCATION */}
            <section className="space-y-6">
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3">
                 <MapPin className="w-5 h-5 text-rose-500" /> Operational Base
                 <div className="h-px bg-slate-100 flex-1" />
              </h3>
              <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Primary City</p>
                    <p className="text-[13px] font-black text-slate-800 uppercase">{c.city || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Country Jurisdiction</p>
                    <p className="text-[13px] font-black text-slate-800 uppercase">{c.country || "—"}</p>
                  </div>
                </div>
                <div className="border-t border-slate-200/50 pt-6">
                   <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Administrative Office Address</p>
                   <p className="text-[13px] font-bold text-slate-700 leading-relaxed">{c.address || "—"}</p>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-12">
            {/* ATTACHMENTS */}
            <section className="space-y-6">
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3">
                 <FileText className="w-5 h-5 text-primary" /> Shared Intelligence & Files
                 <div className="h-px bg-slate-100 flex-1" />
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {c.attachments && c.attachments.length > 0 ? (
                  c.attachments.map((file: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white hover:border-primary/50 hover:bg-slate-50/50 transition-all duration-300 group shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-primary/10 group-hover:text-primary transition-colors flex items-center justify-center text-slate-400">
                           <FileText className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-wide text-slate-900 truncate max-w-[180px]">{file.title || "Corporate Artifact"}</p>
                           <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] italic mt-0.5 font-mono">{file.fileName}</p>
                        </div>
                      </div>
                      <a href={file.fileUrl} target="_blank" rel="noreferrer" className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-primary text-slate-300 hover:text-white transition-all shadow-sm">
                         <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  ))
                ) : (
                  <div className="py-20 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center text-center">
                     <FileText className="w-12 h-12 mb-4 text-slate-100" />
                     <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300">No Digital Records Found</p>
                  </div>
                )}
              </div>
            </section>
            
            {/* SYSTEM LOGS */}
            <section className="space-y-6">
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3">
                 <ShieldCheck className="w-5 h-5 text-emerald-500" /> Compliance Status
                 <div className="h-px bg-slate-100 flex-1" />
              </h3>
              <div className="p-8 rounded-[2rem] border-2 border-emerald-100 bg-emerald-50/20 text-center">
                 <p className="text-[10px] font-black text-emerald-800 uppercase tracking-[0.2em] mb-2 leading-none">Security Cleared</p>
                 <p className="text-[9px] font-bold text-emerald-600/60 uppercase tracking-widest italic leading-none">Record integrity verified against PEL protocols</p>
              </div>
            </section>
          </div>
        </div>

        {/* ── FOOTER ────────────────────────────────────────────── */}
        <footer className="bg-slate-50 p-12 border-t border-slate-100">
           <div className="flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="text-center md:text-left">
                 <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Digital Registry Hub</p>
                 <p className="text-[9px] font-bold text-slate-400 mt-1 italic uppercase font-mono tracking-tighter">System Reference: {c.id}</p>
              </div>
              
              <div className="flex gap-20">
                 <div className="text-center border-t border-slate-200 pt-3 px-8">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Verified By</p>
                 </div>
                 <div className="text-center border-t border-slate-200 pt-3 px-8">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Authorized Official</p>
                 </div>
              </div>
           </div>
           
           <div className="mt-12 flex items-center justify-between text-[8px] font-black text-slate-300 uppercase tracking-[0.5em] pt-12 border-t border-slate-100">
              <span>Class 2 Organization Data</span>
              <span className="text-primary italic">Property of Petroleum Exploration Limited</span>
              <span>Proprietary Information</span>
           </div>
        </footer>
      </div>
    </div>
  )
}
