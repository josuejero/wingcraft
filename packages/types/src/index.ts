export type Label =
  | 'startup error'
  | 'plugin/config conflict'
  | 'version mismatch'
  | 'likely infrastructure issue'
  | 'needs escalation'

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
export type Priority = 'P0' | 'P1' | 'P2' | 'P3'
export type FieldSource = 'seeded' | 'heuristic'

export type SignatureSummary = {
  id: string
  name: string
  description: string
  label: Label
  severity: Severity
  hints: string[]
  matchedLines: string[]
  confidenceScore: number
}

export type IncidentRecord = {
  id: string
  category: string
  label: Label
  severity: Severity
  priority: Priority
  affectedComponent: string
  evidenceLines: string[]
  safeFirstStep: string
  likelyCause: string
  customerMessage: string
  evidenceToCollect: string[]
  escalate: boolean
  resolutionNotes: string
  confidenceScore?: number
  signature?: SignatureSummary
}

export interface TriageResult extends IncidentRecord {
  fieldSources?: Partial<Record<keyof IncidentRecord, FieldSource>>
  matchedIncidentId?: string
}

export type ClassificationSummary = {
  label: Label
  severity: Severity
  priority: Priority
  matchedKeywords: string[]
  confidenceScore: number
  signature?: SignatureSummary
}
