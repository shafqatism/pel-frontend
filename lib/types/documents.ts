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
}
