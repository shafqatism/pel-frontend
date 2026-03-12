export interface Attachment {
  id?: string
  title: string
  description: string
  type: "image" | "document"
  fileUrl: string
  fileName?: string
  fileSize?: number
  mimeType?: string
}
