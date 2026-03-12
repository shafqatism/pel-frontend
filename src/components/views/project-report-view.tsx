"use client"

import { useQuery } from "@tanstack/react-query"
import { projectsApi } from "@/lib/api/projects"
import { useNav } from "@/lib/nav-context"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft, Printer, Download, FolderKanban, Building2, 
  MapPin, ShieldCheck, FileText, ExternalLink, Loader2,
  Calendar, CheckCircle2, Clock, Layers, Briefcase
} from "lucide-react"

const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })

export default function ProjectReportView() {
  const { setActive, metadata } = useNav()
  const projectId = metadata?.projectId

  const { data: p, isLoading, error } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectsApi.projects.get(projectId!),
    enabled: !!projectId
  })

  if (!projectId) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">No project block selected</p>
        <Button onClick={() => setActive("projects")} variant="outline" className="rounded-xl font-black uppercase tracking-widest text-[10px]">Back to Directory</Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-4">Assembling Project Dossier...</p>
      </div>
    )
  }

  if (error || !p) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 text-center">
        <ShieldCheck className="w-12 h-12 text-rose-500 opacity-20" />
        <p className="text-rose-600 font-black uppercase tracking-widest">Project Ledger Retrieval Failure</p>
        <Button variant="outline" onClick={() => setActive("projects")}>Return to Base</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 print:p-0 text-slate-900">
      {/* ── ACTIONS BAR ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 print:hidden">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setActive("projects")}
          className="rounded-xl h-10 px-4 border-slate-200 text-slate-600 font-bold uppercase tracking-widest text-[10px]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blocks
        </Button>
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" onClick={() => window.print()} className="rounded-xl h-10 px-5 border-slate-200 text-slate-900 font-black uppercase tracking-widest text-[10px]">
              <Printer className="w-4 h-4 mr-2" /> Print Summary
           </Button>
           <Button size="sm" className="rounded-xl h-10 px-6 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px]">
              <Download className="w-4 h-4 mr-2" /> Export Bundle
           </Button>
        </div>
      </div>

      <div id="printable-area" className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 print:shadow-none print:border-none print:rounded-none">
        {/* ── HEADER ────────────────────────────────────────────── */}
        <header className="bg-slate-900 text-white p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full -mr-48 -mt-48 blur-3xl opacity-20" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="w-40 h-40 rounded-[2.5rem] bg-amber-500 flex items-center justify-center shrink-0 shadow-2xl">
               <FolderKanban className="w-16 h-16 text-white" />
            </div>
            
            <div className="text-center md:text-left flex-1 space-y-4">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                 <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">{p.name}</h1>
                 <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    p.status === 'active' ? 'bg-emerald-500 text-white border-emerald-400' : 
                    p.status === 'completed' ? 'bg-blue-500 text-white border-blue-400' : 'bg-rose-500 text-white border-rose-400'
                 }`}>{p.status || 'Active'}</span>
              </div>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 opacity-80">
                 <p className="font-bold uppercase tracking-[0.2em] text-[11px] flex items-center gap-2 text-primary">
                    <Building2 className="w-4 h-4" /> Client: {p.company?.name || "Direct PEL Operating"}
                 </p>
                 <span className="hidden md:inline w-1 h-1 rounded-full bg-slate-700" />
                 <p className="font-bold uppercase tracking-[0.2em] text-[11px] flex items-center gap-2">
                    <Layers className="w-4 h-4" /> Block Code: {p.projectCode || "PENDING"}
                 </p>
              </div>

              <div className="pt-4 flex flex-wrap justify-center md:justify-start gap-4 text-white/60">
                 <div className="flex items-center gap-2 text-[10px] font-black uppercase py-2 px-4 bg-slate-800/50 rounded-2xl border border-slate-700/30">
                    <Calendar className="w-3.5 h-3.5 text-primary" /> Start: {p.startDate ? fmt(p.startDate) : "N/A"}
                 </div>
                 <div className="flex items-center gap-2 text-[10px] font-black uppercase py-2 px-4 bg-slate-800/50 rounded-2xl border border-slate-700/30">
                    <Clock className="w-3.5 h-3.5 text-sky-500" /> Deadline: {p.endDate ? fmt(p.endDate) : "OPEN"}
                 </div>
              </div>
            </div>
          </div>
        </header>

        {/* ── CONTENT ────────────────────────────────────────────── */}
        <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-12 bg-white">
          <div className="space-y-12">
            {/* TIMELINE & SCOPE */}
            <section className="space-y-6">
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3">
                 <Briefcase className="w-5 h-5 text-primary" /> Project Concession Scope
                 <div className="h-px bg-slate-100 flex-1" />
              </h3>
              <div className="space-y-6 bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Current Status</p>
                    <p className="text-[13px] font-black text-slate-800 uppercase leading-none">{p.status || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Duration</p>
                    <p className="text-[13px] font-black text-slate-800 uppercase leading-none">
                      {p.startDate && p.endDate ? `${Math.ceil((new Date(p.endDate).getTime() - new Date(p.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30))} Months` : "Long Term"}
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200/50">
                   <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Operating Module</p>
                   <p className="text-xl font-black text-slate-900 tracking-tight uppercase">{p.department || "PEL EXPLORATION"}</p>
                </div>

                <div className="pt-6 border-t border-slate-200/50">
                   <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Strategic Description</p>
                   <p className="text-[13px] font-bold text-slate-700 leading-relaxed italic">{p.description || "No tactical objectives registered for this development block."}</p>
                </div>
              </div>
            </section>

            {/* SITES UNDER THIS BLOCK */}
            <section className="space-y-6">
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3">
                 <MapPin className="w-5 h-5 text-primary" /> Active Operational Sites
                 <div className="h-px bg-slate-100 flex-1" />
              </h3>
              <div className="grid grid-cols-1 gap-4">
                 {(p.sites && p.sites.length > 0) ? (
                    p.sites.map((site: any) => (
                      <div key={site.id} className="p-4 rounded-2xl bg-white border border-slate-100 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                             <MapPin className="w-5 h-5" />
                          </div>
                          <div>
                             <p className="text-[11px] font-black uppercase text-slate-900">{site.siteName}</p>
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{site.district || "Block Site"}</p>
                          </div>
                        </div>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-lg ${site.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                          {site.status || 'Active'}
                        </span>
                      </div>
                    ))
                 ) : (
                    <div className="py-10 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center text-center">
                       <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">No sites localized in this block</p>
                    </div>
                 )}
              </div>
            </section>
          </div>

          <div className="space-y-12">
            {/* ATTACHMENTS */}
            <section className="space-y-6">
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3">
                 <FileText className="w-5 h-5 text-primary" /> Block Documents & Agreements
                 <div className="h-px bg-slate-100 flex-1" />
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {p.attachments && p.attachments.length > 0 ? (
                  p.attachments.map((file: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white hover:border-primary/50 hover:bg-slate-50/50 transition-all duration-300 group shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-primary/10 group-hover:text-primary transition-colors flex items-center justify-center text-slate-400">
                           <FileText className="w-5 h-5" />
                        </div>
                        <div className="max-w-[180px]">
                           <p className="text-[10px] font-black uppercase tracking-wide text-slate-900 truncate">{file.title || "Legal Instrument"}</p>
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
                     <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300">No Tactical Artifacts Archived</p>
                  </div>
                )}
              </div>
            </section>
            
            {/* PERFORMANCE / STATUS */}
            <section className="space-y-6">
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3">
                 <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Concession Compliance
                 <div className="h-px bg-slate-100 flex-1" />
              </h3>
              <div className="p-8 rounded-[2rem] border-2 border-emerald-100 bg-emerald-50/20 text-center space-y-3">
                 <p className="text-[10px] font-black text-emerald-800 uppercase tracking-[0.3em] leading-none">Security Rating: High</p>
                 <div className="w-full bg-emerald-200/50 h-2 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-emerald-500 rounded-full" />
                 </div>
                 <p className="text-[9px] font-bold text-emerald-600/60 uppercase tracking-widest italic leading-none">Registered Block verified by Ministry of Energy</p>
              </div>
            </section>
          </div>
        </div>

        {/* ── FOOTER ────────────────────────────────────────────── */}
        <footer className="bg-slate-50 p-12 border-t border-slate-100">
           <div className="flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="text-center md:text-left">
                 <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest">PEL Block Administration</p>
                 <p className="text-[9px] font-bold text-slate-400 mt-1 italic uppercase font-mono tracking-tighter">Reference Token: {p.id}</p>
              </div>
              
              <div className="flex gap-16">
                 <div className="text-center border-t border-slate-200 pt-3 px-6">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Project Lead</p>
                 </div>
                 <div className="text-center border-t border-slate-200 pt-3 px-6">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Head of Operations</p>
                 </div>
              </div>
           </div>
           
           <div className="mt-12 flex items-center justify-between text-[8px] font-black text-slate-300 uppercase tracking-[0.5em] pt-12 border-t border-slate-100">
              <span>Classified Concession Data</span>
              <span className="text-primary italic">Property of Petroleum Exploration Limited</span>
              <span>Proprietary Intel</span>
           </div>
        </footer>
      </div>
    </div>
  )
}
