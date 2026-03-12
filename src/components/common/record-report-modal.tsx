"use client"

import React, { useRef, useState } from "react"
import {
  X, Printer, Download, FileText, Image as ImageIcon, File,
  FileSpreadsheet, Film, ExternalLink, Paperclip, Calendar,
  Building2, User, CheckCircle, ZoomIn
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
export interface ReportField {
  label: string
  value?: string | number | null | React.ReactNode
}

export interface ReportSection {
  title: string
  color?: string                // e.g. "blue" | "emerald" | "amber"
  fields: ReportField[]
}

export interface ReportConfig {
  title: string                 // e.g. "Employee Record"
  subtitle?: string             // e.g. employee name
  module: string                // e.g. "HR Module"
  badge?: string                // e.g. "Active"
  badgeColor?: string
  sections: ReportSection[]
  attachments?: any[]           // Attachment[]
  generatedFor?: string         // Company / org name
}

// ──────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ──────────────────────────────────────────────────────────────────────────────
function resolveUrl(url?: string) {
  if (!url) return ""
  if (url.startsWith("http")) return url
  return `${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:4000"}${url}`
}

function getMimeCategory(mimeType?: string, fileUrl?: string) {
  const url = fileUrl?.toLowerCase() ?? ""
  if (!mimeType) {
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return "image"
    if (url.match(/\.pdf$/)) return "pdf"
    return "doc"
  }
  if (mimeType.startsWith("image/")) return "image"
  if (mimeType === "application/pdf") return "pdf"
  if (mimeType.match(/spreadsheet|excel|csv/)) return "spreadsheet"
  if (mimeType.startsWith("video/")) return "video"
  return "doc"
}

function AttachFileIcon({ mimeType, fileUrl, className = "w-5 h-5" }: { mimeType?: string; fileUrl?: string; className?: string }) {
  const cat = getMimeCategory(mimeType, fileUrl)
  const map: Record<string, React.ReactNode> = {
    image:       <ImageIcon className={`${className} text-indigo-500`} />,
    pdf:         <FileText className={`${className} text-rose-500`} />,
    spreadsheet: <FileSpreadsheet className={`${className} text-emerald-500`} />,
    video:       <Film className={`${className} text-amber-500`} />,
    doc:         <File className={`${className} text-slate-400`} />,
  }
  return <>{map[cat]}</>
}

// ──────────────────────────────────────────────────────────────────────────────
// Attachment Preview Gallery (used inside report)
// ──────────────────────────────────────────────────────────────────────────────
function AttachmentGallery({ attachments }: { attachments: any[] }) {
  const [lightbox, setLightbox] = useState<string | null>(null)

  if (!attachments || attachments.length === 0) return null

  return (
    <>
      {lightbox && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
            onClick={() => setLightbox(null)}
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={lightbox}
            alt="Preview"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 print:grid-cols-3">
        {attachments.map((att, i) => {
          const url = resolveUrl(att.fileUrl)
          const cat = getMimeCategory(att.mimeType, att.fileUrl)

          return (
            <div
              key={i}
              className="group relative rounded-xl border border-border/40 overflow-hidden bg-muted/20 print:break-inside-avoid"
            >
              {/* Preview area */}
              <div className="h-28 flex items-center justify-center relative bg-muted/30">
                {cat === "image" && url ? (
                  <>
                    <img src={url} alt={att.title} className="w-full h-full object-cover" />
                    <button
                      className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 print:hidden"
                      onClick={() => setLightbox(url)}
                      type="button"
                    >
                      <ZoomIn className="w-6 h-6 text-white drop-shadow" />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <AttachFileIcon mimeType={att.mimeType} fileUrl={att.fileUrl} className="w-10 h-10 opacity-60" />
                    {cat === "pdf" && url && (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] font-bold text-primary underline print:hidden"
                        onClick={e => e.stopPropagation()}
                      >
                        Open PDF ↗
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Meta */}
              <div className="p-2 space-y-0.5">
                <p className="text-[10px] font-black uppercase tracking-wide truncate text-foreground">
                  {att.title || att.fileName || "Untitled"}
                </p>
                {att.description && (
                  <p className="text-[9px] text-muted-foreground italic line-clamp-1">{att.description}</p>
                )}
                <div className="flex items-center justify-between pt-1">
                  <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full border ${
                    cat === "image" ? "bg-indigo-50 text-indigo-700 border-indigo-100" :
                    cat === "pdf"   ? "bg-rose-50 text-rose-700 border-rose-100" :
                    "bg-slate-50 text-slate-600 border-slate-100"
                  }`}>{cat.toUpperCase()}</span>
                  {att.fileSize && (
                    <span className="text-[8px] text-muted-foreground font-bold">
                      {(att.fileSize / 1024 / 1024).toFixed(2)}MB
                    </span>
                  )}
                </div>
              </div>

              {/* Download link */}
              {url && (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity print:hidden"
                  title="Download"
                  onClick={e => e.stopPropagation()}
                >
                  <Download className="w-3 h-3" />
                </a>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// Report page content (also printed)
// ──────────────────────────────────────────────────────────────────────────────
const SECTION_COLORS: Record<string, string> = {
  blue:    "border-blue-200 bg-blue-50/50",
  emerald: "border-emerald-200 bg-emerald-50/50",
  amber:   "border-amber-200 bg-amber-50/50",
  rose:    "border-rose-200 bg-rose-50/50",
  slate:   "border-slate-200 bg-slate-50/50",
  purple:  "border-purple-200 bg-purple-50/50",
}
const SECTION_HEADER_COLORS: Record<string, string> = {
  blue:    "text-blue-700 border-blue-200",
  emerald: "text-emerald-700 border-emerald-200",
  amber:   "text-amber-700 border-amber-200",
  rose:    "text-rose-700 border-rose-200",
  slate:   "text-slate-600 border-slate-200",
  purple:  "text-purple-700 border-purple-200",
}

function ReportContent({ config }: { config: ReportConfig }) {
  const now = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })

  return (
    <div id="report-print-content" className="bg-white text-slate-900 min-h-full">
      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <div className="px-8 pt-8 pb-6 border-b-2 border-slate-900 print:px-6 print:pt-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                  Petroleum Exploration Limited
                </p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  {config.module} — Official Record
                </p>
              </div>
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 mt-3">
              {config.title}
            </h1>
            {config.subtitle && (
              <p className="text-sm font-bold text-slate-600 mt-1">{config.subtitle}</p>
            )}
            {config.badge && (
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                config.badgeColor === "green" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                config.badgeColor === "red"   ? "bg-rose-50 text-rose-700 border-rose-200" :
                config.badgeColor === "amber" ? "bg-amber-50 text-amber-700 border-amber-200" :
                "bg-slate-100 text-slate-700 border-slate-200"
              }`}>{config.badge}</span>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Report Generated</p>
            <p className="text-sm font-black text-slate-700 mt-1">{now}</p>
            <div className="w-24 h-24 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center mt-3 print:block hidden">
              <p className="text-[8px] font-bold text-slate-300 text-center uppercase tracking-widest">Official<br/>Stamp</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTIONS ─────────────────────────────────────────────────── */}
      <div className="px-8 py-6 space-y-6 print:px-6">
        {config.sections.map((section, si) => (
          <div key={si} className={`rounded-2xl border p-5 print:rounded-xl print:border print:break-inside-avoid ${SECTION_COLORS[section.color ?? "slate"]}`}>
            <h2 className={`text-[10px] font-black uppercase tracking-[0.2em] border-b pb-2 mb-4 ${SECTION_HEADER_COLORS[section.color ?? "slate"]}`}>
              {section.title}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
              {section.fields.map((field, fi) => (
                field.value !== undefined && field.value !== null && field.value !== "" && (
                  <div key={fi} className="space-y-0.5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">{field.label}</p>
                    <div className="text-[11px] font-bold text-slate-800">
                      {typeof field.value === "string" || typeof field.value === "number"
                        ? String(field.value)
                        : field.value}
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        ))}

        {/* ── ATTACHMENTS ─────────────────────────────────────────────── */}
        {config.attachments && config.attachments.length > 0 && (
          <div className="print:break-inside-avoid">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
              <Paperclip className="w-3.5 h-3.5" />
              Attached Documents &amp; Media
              <span className="ml-auto font-bold text-slate-400">{config.attachments.length} file{config.attachments.length > 1 ? "s" : ""}</span>
            </h2>
            <AttachmentGallery attachments={config.attachments} />
          </div>
        )}
      </div>

      {/* ── FOOTER ─────────────────────────────────────────────────── */}
      <div className="px-8 py-5 border-t border-slate-200 mt-4 print:px-6">
        <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase tracking-widest">
          <span>PEL ERP — {config.module}</span>
          <span>Confidential — Internal Use Only</span>
          <span>Generated: {now}</span>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-8 print:mt-10">
          {["Prepared By", "Verified By", "Authorized By"].map(label => (
            <div key={label} className="text-center">
              <div className="h-10 border-b border-dashed border-slate-300 mb-2" />
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// MAIN EXPORTED MODAL
// ──────────────────────────────────────────────────────────────────────────────
interface RecordReportModalProps {
  open: boolean
  onClose: () => void
  config: ReportConfig | null
}

export function RecordReportModal({ open, onClose, config }: RecordReportModalProps) {
  if (!open || !config) return null

  const handlePrint = () => {
    const content = document.getElementById("report-print-content")
    if (!content) return

    const printWindow = window.open("", "_blank", "width=900,height=700")
    if (!printWindow) return

    printWindow.document.write(`
      <html>
        <head>
          <title>${config.title} — PEL Report</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Arial', sans-serif; background: white; color: #1a1a2e; }
            @page { size: A4; margin: 15mm 12mm; }
            @media print { body { -webkit-print-color-adjust: exact; } }
          </style>
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap">
        </head>
        <body>
          ${content.outerHTML}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }

  return (
    <div className="fixed inset-0 z-[9000] flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto py-4 px-2">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto">
        {/* Modal Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-white/70" />
            <div>
              <p className="text-sm font-black uppercase tracking-widest">{config.title}</p>
              <p className="text-[10px] text-white/50 uppercase tracking-widest">{config.module}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              size="sm"
              className="bg-white text-slate-900 hover:bg-white/90 font-black uppercase tracking-widest text-[10px] h-9 px-5 rounded-xl gap-2"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 rounded-full h-9 w-9"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Report Content */}
        <div className="overflow-y-auto max-h-[85vh]">
          <ReportContent config={config} />
        </div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// Inline Attachments Gallery for datatable cells
// ──────────────────────────────────────────────────────────────────────────────
export function AttachmentCountBadge({ attachments, onClick }: { attachments?: any[]; onClick?: () => void }) {
  if (!attachments || attachments.length === 0) return <span className="text-muted-foreground/30 text-[10px]">—</span>

  const images = attachments.filter(a => getMimeCategory(a.mimeType, a.fileUrl) === "image")
  const firstImage = images[0]

  return (
    <button
      onClick={onClick}
      type="button"
      className="group flex items-center gap-1.5 hover:opacity-80 transition-opacity"
      title={`${attachments.length} file(s) attached`}
    >
      {firstImage?.fileUrl ? (
        <img
          src={resolveUrl(firstImage.fileUrl)}
          alt="thumb"
          className="w-7 h-7 rounded-lg object-cover border border-border/40"
        />
      ) : (
        <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/10 flex items-center justify-center">
          <Paperclip className="w-3 h-3 text-primary/50" />
        </div>
      )}
      <span className="text-[9px] font-black uppercase tracking-widest text-primary">
        {attachments.length} file{attachments.length > 1 ? "s" : ""}
      </span>
    </button>
  )
}
