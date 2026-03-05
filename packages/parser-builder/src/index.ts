import type {
  ClassificationSummary,
  IncidentRecord,
  TriageResult
} from '@wingcraft/types'
import type { LabelHeuristics } from '@wingcraft/parser-heuristics'
import {
  createFieldSourceMap,
  createHeuristicEvidenceLines,
  matchSeededIncident
} from '@wingcraft/parser-utils'

export type BuilderInput = {
  logText: string
  classification: ClassificationSummary
  normalizedLogText?: string
}

export type BuilderFn = (input: BuilderInput) => TriageResult

export interface BuilderConfig {
  heuristics: LabelHeuristics
  seededIncidents: IncidentRecord[]
}

export function createBuilder(config: BuilderConfig) {
  const { heuristics, seededIncidents } = config

  return {
    buildTriageResult(input: BuilderInput): TriageResult {
      const { logText, classification, normalizedLogText } = input
      const matchedIncident = matchSeededIncident({
        logText,
        label: classification.label,
        seededIncidents,
        normalizedLogText
      })

      if (matchedIncident) {
        const seededEvidence = classification.signature?.matchedLines ?? matchedIncident.evidenceLines
        const incidentWithExtras: IncidentRecord = {
          ...matchedIncident,
          evidenceLines: seededEvidence,
          confidenceScore: classification.confidenceScore,
          ...(classification.signature ? { signature: classification.signature } : {})
        }

        const seededOverrides: Partial<IncidentRecord> = {
          confidenceScore: classification.confidenceScore,
          ...(classification.signature ? { signature: classification.signature } : {})
        }

        return {
          ...incidentWithExtras,
          fieldSources: createFieldSourceMap(
            incidentWithExtras,
            seededOverrides,
            classification.matchedKeywords
          ),
          matchedIncidentId: matchedIncident.id
        }
      }

      const template = heuristics[classification.label] ?? heuristics['needs escalation']
      const defaultId = `auto-${Date.now()}`
      const evidenceLines =
        classification.signature?.matchedLines ?? createHeuristicEvidenceLines(classification.matchedKeywords)

      const resultBase: IncidentRecord = {
        id: defaultId,
        category: template.defaultCategory,
        label: classification.label,
        severity: classification.severity,
        priority: classification.priority,
        affectedComponent: template.affectedComponent,
        evidenceLines,
        safeFirstStep: template.safeFirstStep,
        likelyCause: template.likelyCause,
        customerMessage: template.customerMessage,
        evidenceToCollect: template.evidenceToCollect,
        escalate: template.escalate,
        resolutionNotes: template.resolutionNotes,
        confidenceScore: classification.confidenceScore,
        ...(classification.signature ? { signature: classification.signature } : {})
      }

      const heuristicsSources = createFieldSourceMap(
        resultBase,
        {},
        classification.matchedKeywords,
        'heuristic'
      )

      return {
        ...resultBase,
        fieldSources: heuristicsSources
      }
    }
  }
}

export type BuilderInstance = ReturnType<typeof createBuilder>
