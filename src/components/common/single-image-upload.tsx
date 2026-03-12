import React, { useState } from "react"
import { Upload, Loader2, Camera, Trash2, ZoomIn, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"
import { toast } from "sonner"

interface SingleImageUploadProps {
  value?: string
  onChange: (url: string) => void
  label?: string
  module?: string
}

function resolveUrl(url?: string) {
  if (!url) return ""
  if (url.startsWith("http")) return url
  return `${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:4000"}${url}`
}

export function SingleImageUpload({ value, onChange, label, module = "media" }: SingleImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [lightbox, setLightbox] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append("module", module)
    formData.append("file", file)

    try {
      const response = await api.post("/media/upload", formData, {
        headers: { "Content-Type": undefined }
      })
      onChange(response.data.url)
      toast.success("Photo uploaded to cloud storage")
    } catch (err: any) {
      console.error("Upload error details:", err.response?.data || err.message)
      toast.error("Upload failed")
    } finally {
      setUploading(false)
      // Reset file input
      e.target.value = ""
    }
  }

  const removeImage = () => onChange("")
  const fullUrl = resolveUrl(value)

  return (
    <>
      {/* Lightbox */}
      {lightbox && fullUrl && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
            onClick={() => setLightbox(false)}
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={fullUrl}
            alt="Full preview"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      <div className="space-y-1.5">
        {label && (
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
        )}

        <div className="relative w-full aspect-video rounded-xl bg-muted/30 border border-border/50 flex items-center justify-center overflow-hidden group">
          {value ? (
            <>
              <img src={fullUrl} className="w-full h-full object-cover" alt="Preview" />

              {/* Overlay actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {/* Expand */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full bg-white/20 text-white hover:bg-white/40 backdrop-blur-sm"
                  onClick={() => setLightbox(true)}
                  title="View full size"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>

                {/* Replace */}
                <div className="relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full bg-white/20 text-white hover:bg-white/40 backdrop-blur-sm"
                    title="Replace photo"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileUpload}
                  />
                </div>

                {/* Remove */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full bg-rose-500/60 text-white hover:bg-rose-500/80 backdrop-blur-sm"
                  onClick={removeImage}
                  title="Remove photo"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Corner indicator */}
              <div className="absolute bottom-2 right-2 flex gap-1">
                <span className="bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                  Uploaded
                </span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              {uploading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Uploading…</p>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-2xl bg-muted/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Camera className="w-5 h-5 text-muted-foreground/40" />
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Click to upload photo</p>
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileUpload}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
