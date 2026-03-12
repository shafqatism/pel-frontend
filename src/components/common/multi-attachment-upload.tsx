"use client"

import React, { useState } from "react"
import {
  Plus, Trash2, FileText, Upload, Loader2,
  Eye, Download, X, ZoomIn, File,
  Image as ImageIcon, FileSpreadsheet, FileCode, Film
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import api from "@/lib/api"
import { toast } from "sonner"
import { Attachment } from "@/lib/types/common"

interface MultiAttachmentUploadProps {
  value: Attachment[]
  onChange: (attachments: Attachment[]) => void
  module?: string
}

// ── helpers ────────────────────────────────────────────────────────────────────
function resolveUrl(url: string) {
  if (!url) return ""
  if (url.startsWith("http")) return url
  return `${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:4000"}${url}`
}

function getMimeCategory(mimeType?: string, fileUrl?: string): "image" | "pdf" | "spreadsheet" | "video" | "code" | "doc" {
  if (!mimeType) {
    if (fileUrl?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return "image"
    if (fileUrl?.match(/\.pdf$/i)) return "pdf"
    return "doc"
  }
  if (mimeType.startsWith("image/")) return "image"
  if (mimeType === "application/pdf") return "pdf"
  if (mimeType.match(/spreadsheet|excel|csv/)) return "spreadsheet"
  if (mimeType.startsWith("video/")) return "video"
  if (mimeType.match(/zip|rar|7z/)) return "code"
  return "doc"
}

function FileTypeIcon({ mimeType, fileUrl, className = "w-8 h-8" }: { mimeType?: string; fileUrl?: string; className?: string }) {
  const cat = getMimeCategory(mimeType, fileUrl)
  const icons = {
    image:       <ImageIcon className={`${className} text-indigo-400`} />,
    pdf:         <FileText className={`${className} text-rose-400`} />,
    spreadsheet: <FileSpreadsheet className={`${className} text-emerald-400`} />,
    video:       <Film className={`${className} text-amber-400`} />,
    code:        <FileCode className={`${className} text-sky-400`} />,
    doc:         <File className={`${className} text-slate-400`} />,
  }
  return icons[cat]
}

function FileTypeBadge({ mimeType, fileUrl }: { mimeType?: string; fileUrl?: string }) {
  const cat = getMimeCategory(mimeType, fileUrl)
  const styles = {
    image:       "bg-indigo-50 text-indigo-700 border-indigo-200",
    pdf:         "bg-rose-50 text-rose-700 border-rose-200",
    spreadsheet: "bg-emerald-50 text-emerald-700 border-emerald-200",
    video:       "bg-amber-50 text-amber-700 border-amber-200",
    code:        "bg-sky-50 text-sky-700 border-sky-200",
    doc:         "bg-slate-50 text-slate-600 border-slate-200",
  }
  const labels = { image: "Image", pdf: "PDF", spreadsheet: "Spreadsheet", video: "Video", code: "Archive", doc: "Document" }
  return (
    <span className={`inline-flex items-center text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${styles[cat]}`}>
      {labels[cat]}
    </span>
  )
}

// ── Lightbox / Preview modal ────────────────────────────────────────────────────
function PreviewModal({ attachment, onClose }: { attachment: Attachment | null; onClose: () => void }) {
  if (!attachment || !attachment.fileUrl) return null

  const url = resolveUrl(attachment.fileUrl)
  const cat = getMimeCategory(attachment.mimeType, attachment.fileUrl)

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl max-h-[90vh] w-full mx-4 bg-background rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 bg-muted/30">
          <div className="flex items-center gap-3 min-w-0">
            <FileTypeIcon mimeType={attachment.mimeType} fileUrl={attachment.fileUrl} className="w-5 h-5 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-black uppercase tracking-widest truncate">{attachment.title || attachment.fileName || "Preview"}</p>
              {attachment.fileName && <p className="text-[10px] text-muted-foreground truncate">{attachment.fileName}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a href={url} target="_blank" rel="noopener noreferrer" download>
              <Button variant="outline" size="sm" className="rounded-xl text-[10px] font-black uppercase tracking-widest h-8 gap-1.5">
                <Download className="w-3.5 h-3.5" /> Download
              </Button>
            </a>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-muted/10 flex items-center justify-center p-4 min-h-[300px]">
          {cat === "image" && (
            <img src={url} alt={attachment.title || "Preview"} className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-lg" />
          )}
          {cat === "pdf" && (
            <iframe
              src={`${url}#toolbar=0`}
              className="w-full h-[70vh] rounded-xl border border-border/30"
              title={attachment.title || "PDF Preview"}
            />
          )}
          {cat === "video" && (
            <video src={url} controls className="max-w-full max-h-[70vh] rounded-xl shadow-lg" />
          )}
          {(cat === "doc" || cat === "spreadsheet" || cat === "code") && (
            <div className="flex flex-col items-center gap-4 py-12">
              <FileTypeIcon mimeType={attachment.mimeType} fileUrl={attachment.fileUrl} className="w-20 h-20 opacity-30" />
              <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Preview Not Available</p>
              <p className="text-xs text-muted-foreground">Download the file to open it</p>
              <a href={url} target="_blank" rel="noopener noreferrer" download>
                <Button className="rounded-xl font-black uppercase tracking-widest text-[10px] h-9 px-6 gap-2">
                  <Download className="w-4 h-4" /> Download File
                </Button>
              </a>
            </div>
          )}
        </div>

        {/* Description */}
        {attachment.description && (
          <div className="px-5 py-3 border-t border-border/40 bg-muted/20">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Notes</p>
            <p className="text-xs text-foreground">{attachment.description}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function MultiAttachmentUpload({ value, onChange, module = "media" }: MultiAttachmentUploadProps) {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
  const [previewing, setPreviewing] = useState<Attachment | null>(null)

  const addAttachment = () => {
    onChange([...value, { title: "", description: "", type: "document", fileUrl: "" }])
  }

  const removeAttachment = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const updateAttachment = (index: number, updates: Partial<Attachment>) => {
    const copy = [...value]
    copy[index] = { ...copy[index], ...updates }
    onChange(copy)
  }

  const handleFileUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingIndex(index)
    const formData = new FormData()
    formData.append("module", module)
    formData.append("file", file)

    try {
      const response = await api.post("/media/upload", formData, {
        headers: { "Content-Type": undefined }
      })
      const { url, fileName, fileSize, mimeType } = response.data
      updateAttachment(index, {
        fileUrl: url,
        fileName,
        fileSize,
        mimeType,
        type: mimeType?.startsWith("image/") ? "image" : "document",
      })
      toast.success("File uploaded to cloud storage")
    } catch (err: any) {
      console.error("Multi upload failure details:", err.response?.data || err.message)
      toast.error("Upload failed")
    } finally {
      setUploadingIndex(null)
    }
  }

  return (
    <>
      {previewing && <PreviewModal attachment={previewing} onClose={() => setPreviewing(null)} />}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Documents &amp; Media
            </Label>
            {value.filter(a => a.fileUrl).length > 0 && (
              <p className="text-[9px] text-muted-foreground mt-0.5">
                {value.filter(a => a.fileUrl).length} file{value.filter(a => a.fileUrl).length > 1 ? "s" : ""} attached
              </p>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addAttachment}
            className="rounded-xl h-8 text-[10px] font-black uppercase tracking-widest gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add File
          </Button>
        </div>

        <div className="space-y-3">
          {value.map((attachment, index) => {
            const hasFile = !!attachment.fileUrl
            const cat = getMimeCategory(attachment.mimeType, attachment.fileUrl)
            const url = resolveUrl(attachment.fileUrl)

            return (
              <Card key={index} className="rounded-2xl border-border/40 shadow-none overflow-hidden">
                <CardContent className="p-0">
                  {/* Top strip - file preview area */}
                  {hasFile ? (
                    <div className="relative h-24 bg-muted/20 border-b border-border/30 group">
                      {/* Preview thumbnail */}
                      {cat === "image" ? (
                        <img src={url} alt={attachment.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full gap-3">
                          <FileTypeIcon mimeType={attachment.mimeType} fileUrl={attachment.fileUrl} className="w-10 h-10" />
                          <div>
                            <FileTypeBadge mimeType={attachment.mimeType} fileUrl={attachment.fileUrl} />
                            {attachment.fileName && (
                              <p className="text-[10px] text-muted-foreground mt-1 max-w-[180px] truncate">{attachment.fileName}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Overlay actions */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full bg-white/20 text-white hover:bg-white/40 backdrop-blur-sm"
                          title="Preview"
                          onClick={() => setPreviewing(attachment)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <a href={url} target="_blank" rel="noopener noreferrer" download>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full bg-white/20 text-white hover:bg-white/40 backdrop-blur-sm"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </a>
                        {/* Re-upload */}
                        <div className="relative">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full bg-white/20 text-white hover:bg-white/40 backdrop-blur-sm"
                            title="Replace file"
                          >
                            <Upload className="w-4 h-4" />
                          </Button>
                          <input
                            type="file"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={e => handleFileUpload(index, e)}
                          />
                        </div>
                      </div>

                      {/* Size badge */}
                      {attachment.fileSize && (
                        <div className="absolute bottom-2 right-2">
                          <span className="bg-black/60 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                            {(attachment.fileSize / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      )}

                      {/* Delete button */}
                      <button
                        type="button"
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    /* No file yet – upload zone */
                    <div className="relative h-24 border-b border-dashed border-border/40 bg-muted/10 flex flex-col items-center justify-center group hover:bg-muted/20 transition-colors cursor-pointer">
                      {uploadingIndex === index ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin text-primary mb-1" />
                          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Uploading…</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 text-muted-foreground/30 mb-1 group-hover:text-primary transition-colors" />
                          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Click or drag to upload</p>
                        </>
                      )}
                      {uploadingIndex !== index && (
                        <input
                          type="file"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={e => handleFileUpload(index, e)}
                        />
                      )}
                      <button
                        type="button"
                        className="absolute top-2 right-2 w-5 h-5 rounded-full text-slate-300 hover:text-rose-500 flex items-center justify-center"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Meta fields */}
                  <div className="p-3 space-y-2">
                    <Input
                      placeholder="Label or title (e.g. CNIC Front)"
                      value={attachment.title ?? ""}
                      onChange={e => updateAttachment(index, { title: e.target.value })}
                      className="h-8 text-xs font-bold rounded-lg border-border/40"
                    />
                    <Textarea
                      placeholder="Optional notes…"
                      value={attachment.description ?? ""}
                      onChange={e => updateAttachment(index, { description: e.target.value })}
                      className="min-h-[48px] text-xs rounded-lg resize-none border-border/40"
                    />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {value.length === 0 && (
          <div className="py-10 border-2 border-dashed border-border/30 rounded-2xl flex flex-col items-center justify-center bg-muted/5 group">
            <div className="w-12 h-12 rounded-2xl bg-muted/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6 text-muted-foreground/30" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No attachments yet</p>
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={addAttachment}
              className="text-[10px] font-black uppercase tracking-[0.2em] mt-1"
            >
              Add First File
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
