import api from "@/lib/api"
import type { Document, CreateDocumentDto } from "@/lib/types/documents"
import type { PaginatedResponse } from "@/lib/types/fleet"

export const documentsApi = {
  documents: {
    list: (params?: Record<string, unknown>) =>
      api.get<PaginatedResponse<Document>>("/documents", { params }).then(r => r.data),

    get: (id: string) =>
      api.get<Document>(`/documents/${id}`).then(r => r.data),

    create: (dto: CreateDocumentDto) =>
      api.post<Document>("/documents", dto).then(r => r.data),

    update: (id: string, dto: Partial<CreateDocumentDto>) =>
      api.patch<Document>(`/documents/${id}`, dto).then(r => r.data),

    delete: (id: string) =>
      api.delete(`/documents/${id}`).then(r => r.data),
  },
}
