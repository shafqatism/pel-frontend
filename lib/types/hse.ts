export interface Incident {
  id: string
  title: string
  description: string
  incidentDate: string
  location: string
  severity: "low" | "medium" | "high" | "critical"
  reportedBy: string
  status: "open" | "investigating" | "closed"
  correctiveAction?: string
  site?: string
  createdAt: string
}

export interface SafetyAudit {
  id: string
  auditTitle: string
  auditDate: string
  auditorName: string
  site?: string
  score: number
  observations?: string
  findings: "compliant" | "non_compliant" | "improvement_needed"
  createdAt: string
}

export interface HseDrill {
  id: string
  drillType: string
  drillDate: string
  location: string
  participantsCount: number
  durationMinutes?: number
  outcome?: string
  supervisor?: string
  createdAt: string
}

export interface CreateIncidentDto {
  title: string
  description: string
  incidentDate: string
  location: string
  severity: string
  reportedBy: string
  site?: string
}

export interface CreateAuditDto {
  auditTitle: string
  auditDate: string
  auditorName: string
  site?: string
  score?: number
  findings: string
  observations?: string
}

export interface CreateDrillDto {
  drillType: string
  drillDate: string
  location: string
  participantsCount: number
  durationMinutes?: number
  supervisor?: string
}
