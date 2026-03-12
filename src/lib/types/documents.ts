import { Attachment } from "./common"

export interface Document {
  id: string
  title: string
  description?: string
  category: string
  fileUrl: string
  fileType?: string
  fileSize?: number
  uploadedBy?: string
  department?: string
  site?: string
  tags?: string[]
  attachments?: Attachment[]
  createdAt: string
  updatedAt: string
}

export interface CreateDocumentDto {
  title: string
  description?: string
  category: string
  fileUrl: string
  fileType?: string
  fileSize?: number
  uploadedBy?: string
  department?: string
  site?: string
  tags?: string[]
  attachments?: Attachment[]
}

