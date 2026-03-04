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

export type ClassifierFunction = (logText: string) => ClassificationSummary

export interface BuilderConfig {
  classifier: ClassifierFunction
  heuristics: LabelHeuristics
  seededIncidents: IncidentRecord[]
}

export function createBuilder(config: BuilderConfig) {
  const { classifier, heuristics, seededIncidents } = config

  return {
    buildTriageResult(logText: string): TriageResult {
      const classification = classifier(logText)
      const matchedIncident = matchSeededIncident({
        logText,
        label: classification.label,
        seededIncidents
      })

      if (matchedIncident) {
        return {
          ...matchedIncident,
          fieldSources: createFieldSourceMap(
            matchedIncident,
            {},
            classification.matchedKeywords
          ),
          matchedIncidentId: matchedIncident.id
        }
      }

      const template = heuristics[classification.label] ?? heuristics['needs escalation']
      const defaultId = `auto-${Date.now()}`
      const evidenceLines = createHeuristicEvidenceLines(classification.matchedKeywords)

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
        resolutionNotes: template.resolutionNotes
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
